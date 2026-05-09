import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Card, CardContent, Chip, Alert, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Psychology } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface EmpwrResult {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata: string;
  expectedtokens: number;
  expectedcost: number;
  requestType: number;
  model: string;
  url1?: string | null;
  url2?: string | null;
  url3?: string | null;
  url4?: string | null;
  url5?: string | null;
}

export function Empowr() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<EmpwrResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZEMPWR);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data: EmpwrResult[] = await response.json();
        const filtered = data
          .filter((item) => item.uid === uid)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setResults(filtered);
      }
    } catch (err) {
      console.warn("Could not load Empwr history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZEMPWR);
      const payload = {
        uid,
        question: query.trim(),
        requestType: 3,
        model: "Generic",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: EmpwrResult = await response.json();
        setResults((prev) => [data, ...prev]);
        setQuery("");
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      setError("Unable to reach the Empwr API. Please try again.");
      console.error("Empwr search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <SearchIcon sx={{ fontSize: 40, color: "#8B0000" }} />
          <Typography variant="h4">Empwr for Enterprise Queries</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Intelligent enterprise search powered by AI to find insights across your organization
        </Typography>
        <Alert severity="info">
          <strong>Powered by Empwr:</strong> Ask questions in natural language to discover insights from your enterprise data.
        </Alert>
      </Box>

      {/* Search Box */}
      <Paper className="p-6 mb-6">
        <Box className="flex items-center gap-3 mb-4">
          <Psychology className="text-slate-700" fontSize="large" />
          <Typography variant="h6">Ask a Question</Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        <Box className="flex gap-3">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="E.g., What were the top performing products last quarter?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#8B0000" },
                "&.Mui-focused fieldset": { borderColor: "#8B0000" },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{
              backgroundColor: "#8B0000",
              minWidth: "120px",
              "&:hover": { backgroundColor: "#6B0000" },
              "&.Mui-disabled": { backgroundColor: "#ccc" },
            }}
          >
            {searching ? "Searching..." : "Search"}
          </Button>
        </Box>

        <Box className="mt-4">
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Try asking:
          </Typography>
          <Box className="flex flex-wrap gap-2">
            {["Show me sales trends this quarter", "What are our top customers?", "Compare regional performance"].map((q) => (
              <Chip
                key={q}
                label={q}
                size="small"
                onClick={() => setQuery(q)}
                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Results */}
      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress sx={{ color: "#8B0000" }} />
        </Box>
      ) : results.length > 0 ? (
        <Box>
          <Typography variant="h5" className="mb-4">
            Results ({results.length})
          </Typography>
          <Box className="space-y-4">
            {results.map((item) => {
              const blobUrls = [item.url1, item.url2, item.url3, item.url4, item.url5].filter(Boolean) as string[];
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box className="flex items-start justify-between mb-2">
                      <Typography variant="subtitle1" className="font-semibold text-slate-900 flex-1">
                        {item.question}
                      </Typography>
                      {item.model && (
                        <Chip
                          label={item.model}
                          size="small"
                          sx={{ backgroundColor: "#8B0000", color: "white", ml: 2 }}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" className="mb-3 whitespace-pre-wrap">
                      {item.response || "Processing..."}
                    </Typography>

                    {blobUrls.length > 0 && (
                      <Box className="mb-3">
                        <Typography variant="caption" className="font-semibold text-slate-600 block mb-1">
                          Documents
                        </Typography>
                        <Box className="flex flex-wrap gap-2">
                          {blobUrls.map((url, i) => (
                            <Button
                              key={i}
                              size="small"
                              variant="outlined"
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                borderColor: "#8B0000",
                                color: "#8B0000",
                                fontSize: "0.7rem",
                                "&:hover": { borderColor: "#6B0000", backgroundColor: "rgba(139,0,0,0.04)" },
                              }}
                            >
                              📄 Document {i + 1}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(item.timestamp)}</span>
                      <span>•</span>
                      <span>{item.expectedtokens} tokens</span>
                      <span>•</span>
                      <span>{formatCost(item.expectedcost)}</span>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Paper className="p-8 text-center">
          <SearchIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" className="mb-2">
            Start Your Enterprise Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the search box above to query your enterprise data with natural language.
            <br />
            Empwr uses AI to understand your questions and find relevant insights.
          </Typography>
        </Paper>
      )}
    </div>
  );
}
