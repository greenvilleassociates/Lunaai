import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Search, Send, ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface WebSearchResult {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata: string;
  expectedtokens: number;
  expectedcost: number;
}

export function AISearch() {
  const [question, setQuestion] = useState("");
  const [searchHistory, setSearchHistory] = useState<WebSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentResponse, setCurrentResponse] = useState<WebSearchResult | null>(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const role = localStorage.getItem("role");
      if (!uid) {
        setError("Please log in to view search history");
        return;
      }

      const url = getApiUrl(API_CONFIG.ENDPOINTS.WEB_SEARCH);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter search history based on user role
        // Only superusers, admins, and managers can see all search history
        // Regular users and guests only see their own searches
        const isSuperUser = role === "superuser";
        const isAdmin = role === "admin";
        const isManager = role === "manager";
        
        let filteredData;
        if (isSuperUser || isAdmin || isManager) {
          // Managers and above can see all search history
          filteredData = data;
        } else {
          // Regular users and guests only see their own search history
          filteredData = data.filter((item: WebSearchResult) => item.uid === uid);
        }
        
        setSearchHistory(filteredData);
      }
    } catch (err) {
      console.error("Error loading search history:", err);
      // Don't show error for initial load failure
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to submit a question");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setCurrentResponse(null);

    try {
      // Prepare payload without id (Azure assigns it)
      const payload = {
        uid: uid,
        question: question.trim(),
        response: "", // Will be populated by AI
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({
          source: "LunaAI Web Interface",
          userAgent: navigator.userAgent,
        }),
        expectedtokens: 0, // Will be calculated by backend
        expectedcost: 0, // Will be calculated by backend
      };

      const url = getApiUrl(API_CONFIG.ENDPOINTS.WEB_SEARCH);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentResponse(result);
      setSuccess("Question submitted successfully!");
      setQuestion("");

      // Reload history to include new search
      loadSearchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit question");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h4" className="mb-2">
          AI Search
        </Typography>
        <Typography variant="body1" className="text-slate-600">
          Submit questions to LunaAI for processing through multiple LLM providers including ChatGPT and Claude AI
        </Typography>
      </Box>

      {/* Alert Messages */}
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Search Input Form */}
      <Paper className="p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <Box className="flex gap-3">
            <TextField
              fullWidth
              label="Ask LunaAI a question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              placeholder="Enter your question here..."
              multiline
              rows={3}
              sx={{ mb: 0 }}
            />
          </Box>
          <Box className="flex justify-end mt-3">
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              disabled={loading || !question.trim()}
              sx={{
                backgroundColor: "#1a1a1a",
                "&:hover": { backgroundColor: "#2a2a2a" },
              }}
            >
              {loading ? "Processing..." : "Submit Question"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Current Response */}
      {currentResponse && (
        <Paper className="p-6 mb-6 bg-slate-50">
          <Typography variant="h6" className="mb-3">
            Latest Response
          </Typography>
          <Box className="space-y-3">
            <div>
              <Typography variant="subtitle2" className="text-slate-600 mb-1">
                Question:
              </Typography>
              <Typography variant="body1" className="text-slate-900">
                {currentResponse.question}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" className="text-slate-600 mb-1">
                Response:
              </Typography>
              <Typography variant="body1" className="text-slate-900">
                {currentResponse.response || "Processing..."}
              </Typography>
            </div>
            <Box className="flex gap-3 flex-wrap">
              <Chip
                label={`Tokens: ${currentResponse.expectedtokens}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Cost: ${formatCost(currentResponse.expectedcost)}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={formatDate(currentResponse.timestamp)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Search History */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <Search />
          <Typography variant="h6">Search History</Typography>
          <Tooltip title={sortNewestFirst ? "Showing newest first" : "Showing oldest first"}>
            <IconButton size="small" onClick={() => setSortNewestFirst((prev) => !prev)}>
              {sortNewestFirst ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {searchHistory.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No search history yet. Submit your first question above!
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>Question</strong></TableCell>
                  <TableCell><strong>Response</strong></TableCell>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>Tokens</strong></TableCell>
                  <TableCell><strong>Cost</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...searchHistory]
                  .sort((a, b) => {
                    const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                    return sortNewestFirst ? diff : -diff;
                  })
                  .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography variant="body2" className="line-clamp-2">
                        {item.question}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" className="line-clamp-3 text-slate-600">
                        {item.response || "Processing..."}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-slate-600">
                        {formatDate(item.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.expectedtokens} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-slate-600">
                        {formatCost(item.expectedcost)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
}