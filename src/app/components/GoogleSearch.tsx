import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { API_CONFIG, getApiUrl } from "../config/api";

interface GoogleSearchResult {
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

export function GoogleSearch() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<GoogleSearchResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZGOOGLE);
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
      });
      if (response.ok) {
        const data: GoogleSearchResult[] = await response.json();
        setHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch { } finally { setHistoryLoading(false); }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZGOOGLE);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
        body: JSON.stringify({ uid, question: query.trim(), requestType: 5, model: "gemini" }),
      });
      if (response.ok) {
        const data: GoogleSearchResult = await response.json();
        setHistory((prev) => [data, ...prev]);
        setQuery("");
      } else throw new Error(`API returned ${response.status}`);
    } catch (err) {
      setError("Unable to reach the Google Gemini API (/api/ZGoogle). The endpoint may not be configured yet.");
    } finally { setSearching(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };
  const formatDate = (ts: string) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <div className="max-w-5xl mx-auto">
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <AutoAwesomeIcon sx={{ fontSize: 40, color: "#4285F4" }} />
          <Typography variant="h4">Google Gemini Search</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Ask questions powered by Google Gemini AI via the LunaAI orchestration layer.
        </Typography>
        <Alert severity="info">
          <strong>Powered by Google Gemini:</strong> Responses are generated via <code>/api/ZGoogle</code> and stored to your search history.
        </Alert>
      </Box>

      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <SearchIcon className="text-slate-600" fontSize="large" />
          <Typography variant="h6">Ask Gemini</Typography>
        </Box>
        {error && <Alert severity="error" className="mb-3">{error}</Alert>}
        <Box className="flex gap-3">
          <TextField fullWidth value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Enter your question for Google Gemini..." variant="outlined" size="small" disabled={searching} />
          <Button variant="contained" onClick={handleSearch} disabled={searching || !query.trim()}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{ backgroundColor: "#4285F4", "&:hover": { backgroundColor: "#3367D6" }, whiteSpace: "nowrap", minWidth: 140, textTransform: "none" }}>
            {searching ? "Searching..." : "Ask Gemini"}
          </Button>
        </Box>
      </Paper>

      <Box>
        <Typography variant="h6" className="mb-3">Search History</Typography>
        {historyLoading ? (
          <Box className="flex justify-center py-8"><CircularProgress size={32} /></Box>
        ) : history.length === 0 ? (
          <Paper className="p-8 text-center" elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
            <Typography variant="body1" color="text.secondary" className="mt-3">No Gemini searches yet.</Typography>
          </Paper>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Paper key={item.id} className="p-5" elevation={1}>
                <Box className="flex items-start justify-between gap-3 mb-3">
                  <Typography variant="subtitle1" className="font-semibold text-slate-900">{item.question}</Typography>
                  <Chip label="Gemini" size="small" icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                    sx={{ backgroundColor: "#e8f0fe", color: "#4285F4", flexShrink: 0 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" className="mb-3 leading-relaxed whitespace-pre-wrap">{item.response}</Typography>
                <Box className="flex items-center gap-3 flex-wrap">
                  <Typography variant="caption" color="text.secondary">{formatDate(item.timestamp)}</Typography>
                  <span className="text-slate-300">•</span>
                  <Typography variant="caption" color="text.secondary">{item.expectedtokens} tokens</Typography>
                  <span className="text-slate-300">•</span>
                  <Typography variant="caption" color="text.secondary">{formatCost(item.expectedcost)}</Typography>
                  {item.model && (<><span className="text-slate-300">•</span><Typography variant="caption" color="text.secondary">{item.model}</Typography></>)}
                </Box>
              </Paper>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
