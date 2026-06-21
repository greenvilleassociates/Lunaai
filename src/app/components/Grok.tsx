import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { API_CONFIG, getApiUrl } from "../config/api";

const GROK_COLOR = "#000000";

interface GrokResult {
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

function GrokIcon({ size = 40, color = GROK_COLOR }: { size?: number; color?: string }) {
  return (
    <Box
      sx={{
        width: size, height: size, backgroundColor: color, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: size * 0.48, borderRadius: "6px",
        fontFamily: "'Arial Black', sans-serif", letterSpacing: "-0.05em",
        userSelect: "none", flexShrink: 0,
      }}
    >
      𝗫
    </Box>
  );
}

export function Grok() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<GrokResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZGROK);
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
      });
      if (response.ok) {
        const data: GrokResult[] = await response.json();
        setHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch { } finally { setHistoryLoading(false); }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZGROK);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
        body: JSON.stringify({ uid, question: query.trim(), requestType: 6, model: "grok" }),
      });
      if (response.ok) {
        const data: GrokResult = await response.json();
        setHistory((prev) => [data, ...prev]);
        setQuery("");
      } else throw new Error(`API returned ${response.status}`);
    } catch (err) {
      setError("Unable to reach the Grok API (/api/ZGrok). The endpoint may not be configured yet.");
    } finally { setSearching(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };
  const formatDate = (ts: string) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <div className="max-w-5xl mx-auto">
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <GrokIcon size={40} />
          <Typography variant="h4">Grok AI Search</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Submit queries to xAI's Grok via the LunaAI orchestration layer.
        </Typography>
        <Alert severity="info">
          <strong>Powered by xAI Grok:</strong> Responses are generated via <code>/api/ZGrok</code> and stored to your search history.
        </Alert>
      </Box>

      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <SearchIcon className="text-slate-600" fontSize="large" />
          <Typography variant="h6">Ask Grok</Typography>
        </Box>
        {error && <Alert severity="error" className="mb-3">{error}</Alert>}
        <Box className="flex gap-3">
          <TextField fullWidth value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask Grok anything..." variant="outlined" size="small" disabled={searching} />
          <Button variant="contained" onClick={handleSearch} disabled={searching || !query.trim()}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <GrokIcon size={20} color="#fff" />}
            sx={{ backgroundColor: GROK_COLOR, "&:hover": { backgroundColor: "#333" }, whiteSpace: "nowrap", minWidth: 140, textTransform: "none" }}>
            {searching ? "Asking..." : "Ask Grok"}
          </Button>
        </Box>
      </Paper>

      <Box>
        <Typography variant="h6" className="mb-3">Search History</Typography>
        {historyLoading ? (
          <Box className="flex justify-center py-8"><CircularProgress size={32} /></Box>
        ) : history.length === 0 ? (
          <Paper className="p-8 text-center" elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <GrokIcon size={48} color="#cbd5e1" />
            <Typography variant="body1" color="text.secondary" className="mt-3">No Grok queries yet.</Typography>
          </Paper>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Paper key={item.id} className="p-5" elevation={1}>
                <Box className="flex items-start justify-between gap-3 mb-3">
                  <Typography variant="subtitle1" className="font-semibold text-slate-900">{item.question}</Typography>
                  <Chip label="Grok" size="small" icon={<GrokIcon size={14} />} sx={{ backgroundColor: "#f1f1f1", color: "#111", flexShrink: 0 }} />
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
