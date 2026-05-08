import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { API_CONFIG, getApiUrl } from "../config/api";

const CLAUDE_COLOR = "#D4563C";

interface ClaudeResult {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata?: string | null;
  expectedtokens: number;
  expectedcost: number;
  requestType?: number | null;
  model?: string | null;
}

export function Claude() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<ClaudeResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZCLAUDE);
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
      });
      if (response.ok) {
        const data: ClaudeResult[] = await response.json();
        setHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch {
      // API not yet available
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZCLAUDE);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
        body: JSON.stringify({
          uid,
          question: query.trim(),
          requestType: 10,
          model: "claude",
        }),
      });
      if (response.ok) {
        const data: ClaudeResult = await response.json();
        setHistory((prev) => [data, ...prev]);
        setQuery("");
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      setError("Unable to reach the Claude API (/api/Zclaude). The endpoint may not be configured yet.");
      console.error("Claude search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <PsychologyIcon sx={{ fontSize: 40, color: CLAUDE_COLOR }} />
          <Typography variant="h4">Claude AI Search</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Submit queries directly to Anthropic Claude via the LunaAI orchestration layer.
        </Typography>
        <Alert severity="info">
          <strong>Powered by Anthropic Claude:</strong> Responses are generated via <code>/api/Zclaude</code> and stored to your search history.
        </Alert>
      </Box>

      {/* Search Box */}
      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <SearchIcon className="text-slate-600" fontSize="large" />
          <Typography variant="h6">Ask Claude</Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        <Box className="flex gap-3">
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude anything..."
            variant="outlined"
            size="small"
            disabled={searching}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <PsychologyIcon />}
            sx={{
              backgroundColor: CLAUDE_COLOR,
              "&:hover": { backgroundColor: "#b83e2a" },
              whiteSpace: "nowrap",
              minWidth: 140,
              textTransform: "none",
            }}
          >
            {searching ? "Asking..." : "Ask Claude"}
          </Button>
        </Box>
      </Paper>

      {/* History */}
      <Box>
        <Typography variant="h6" className="mb-3">
          Search History
        </Typography>

        {historyLoading ? (
          <Box className="flex justify-center py-8">
            <CircularProgress size={32} />
          </Box>
        ) : history.length === 0 ? (
          <Paper className="p-8 text-center" elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <PsychologyIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
            <Typography variant="body1" color="text.secondary" className="mt-3">
              No Claude queries yet. Ask something above to get started.
            </Typography>
          </Paper>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Paper key={item.id} className="p-5" elevation={1}>
                <Box className="flex items-start justify-between gap-3 mb-3">
                  <Typography variant="subtitle1" className="font-semibold text-slate-900">
                    {item.question}
                  </Typography>
                  <Chip
                    label="Claude"
                    size="small"
                    icon={<PsychologyIcon sx={{ fontSize: 14 }} />}
                    sx={{ backgroundColor: "#fdf0ed", color: CLAUDE_COLOR, flexShrink: 0 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" className="mb-3 leading-relaxed whitespace-pre-wrap">
                  {item.response}
                </Typography>
                <Box className="flex items-center gap-3 flex-wrap">
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(item.timestamp)}
                  </Typography>
                  <span className="text-slate-300">•</span>
                  <Typography variant="caption" color="text.secondary">
                    {item.expectedtokens} tokens
                  </Typography>
                  <span className="text-slate-300">•</span>
                  <Typography variant="caption" color="text.secondary">
                    {formatCost(item.expectedcost)}
                  </Typography>
                  {item.model && (
                    <>
                      <span className="text-slate-300">•</span>
                      <Typography variant="caption" color="text.secondary">
                        {item.model}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
