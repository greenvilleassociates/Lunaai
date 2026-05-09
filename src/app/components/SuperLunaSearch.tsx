import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import superLunaIcon from "figma:asset/cfadca739638cf837cbfaf51361c717172db777b.png";
import { API_CONFIG, getApiUrl } from "../config/api";

interface SuperLunaSearchResult {
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

export function SuperLunaSearch() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<SuperLunaSearchResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";
  const maxSearchEngines = parseInt(localStorage.getItem("maxsearchengines") || "1", 10);
  const chainSearch = localStorage.getItem("chainsearch") === "1";

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.SUPER_LUNA_SEARCH);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });
      if (response.ok) {
        const data: SuperLunaSearchResult[] = await response.json();
        setHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch {
      // API not yet available — silent fail, history stays empty
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.SUPER_LUNA_SEARCH);
      const payload = {
        uid,
        question: query.trim(),
        requestType: 1,
        model: "superluna",
        maxsearchengines: maxSearchEngines,
        chainsearch: chainSearch ? 1 : 0,
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
        const data: SuperLunaSearchResult = await response.json();
        setHistory((prev) => [data, ...prev]);
        setQuery("");
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      setError("Unable to reach the SuperLuna Search API (/api/SuperLunaSearch). The endpoint may not be configured yet.");
      console.error("SuperLuna Search error:", err);
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
          <img
            src={superLunaIcon}
            alt="SuperLuna"
            className="h-10 w-10 rounded-full object-cover border-2 border-yellow-400"
          />
          <Typography variant="h4">SuperLuna Search</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Multi-provider chained AI search via the LunaAI SuperLuna orchestration layer.
        </Typography>
        <Alert severity="info">
          <strong>Powered by SuperLuna:</strong> Responses are generated via <code>/api/SuperLunaSearch</code> and stored to your search history.
          {chainSearch && (
            <> &nbsp;Chain search is <strong>enabled</strong> — up to <strong>{maxSearchEngines}</strong> engine{maxSearchEngines !== 1 ? "s" : ""} will be queried.</>
          )}
        </Alert>
      </Box>

      {/* Active Settings Banner */}
      <Box className="flex gap-2 flex-wrap mb-4">
        <Chip
          label={`Max Engines: ${maxSearchEngines}`}
          size="small"
          sx={{ backgroundColor: "#fef9c3", color: "#854d0e" }}
        />
        <Chip
          label={chainSearch ? "Chain Search: ON" : "Chain Search: OFF"}
          size="small"
          sx={{ backgroundColor: chainSearch ? "#dcfce7" : "#f1f5f9", color: chainSearch ? "#166534" : "#475569" }}
        />
      </Box>

      {/* Search Box */}
      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <SearchIcon className="text-slate-600" fontSize="large" />
          <Typography variant="h6">Ask SuperLuna</Typography>
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
            placeholder="Enter your question for SuperLuna..."
            variant="outlined"
            size="small"
            disabled={searching}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
              whiteSpace: "nowrap",
              minWidth: 160,
              textTransform: "none",
            }}
          >
            {searching ? "Searching..." : "Ask SuperLuna"}
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
            <AutoAwesomeIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
            <Typography variant="body1" color="text.secondary" className="mt-3">
              No SuperLuna searches yet. Submit a query above to get started.
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
                    label="SuperLuna"
                    size="small"
                    icon={
                      <img
                        src={superLunaIcon}
                        alt="SuperLuna"
                        style={{ width: 14, height: 14, borderRadius: "50%", objectFit: "cover" }}
                      />
                    }
                    sx={{ backgroundColor: "#fef9c3", color: "#854d0e", flexShrink: 0 }}
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
