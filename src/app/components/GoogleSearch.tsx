import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { API_CONFIG, getApiUrl } from "../config/api";
import { VoicePlayButton } from "./ui/VoicePlayButton";

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

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZGOOGLE);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });
      if (response.ok) {
        const data: GoogleSearchResult[] = await response.json();
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
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ZGOOGLE);
      const payload = {
        uid,
        question: query.trim(),
        response: "",
        timestamp: new Date().toISOString(),
        requestType: 5,
        model: "gemini-pro",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 200)}` : ""}`);
      }

      const text = await response.text();
      let raw: Record<string, any> = {};

      const trimmed = text.trimStart();
      if (trimmed.startsWith("event:") || trimmed.startsWith("data:")) {
        // Backend may send the full accumulated response on every SSE event.
        // Strategy: track the longest response seen (last event is typically most complete).
        const deltaChunks: string[] = [];
        let lastFullResponse = "";
        for (const line of text.split(/\r?\n/)) {
          if (line.startsWith("data:")) {
            const chunk = line.slice(5).trim();
            if (!chunk || chunk === "[DONE]") continue;
            try {
              const parsed = JSON.parse(chunk);
              const content = parsed.response ?? parsed.content ?? parsed.text ?? "";
              const delta = parsed.delta ?? "";
              if (parsed.id != null) raw = { ...raw, ...parsed };
              if (content) lastFullResponse = content;
              if (delta) deltaChunks.push(delta);
            } catch {
              // plain-text SSE chunk — treat as delta
              deltaChunks.push(chunk);
            }
          }
        }
        // Prefer full response field if present; otherwise join unique deltas
        if (lastFullResponse) {
          raw.response = lastFullResponse;
        } else if (deltaChunks.length > 0) {
          const deduped = deltaChunks.filter(
            (c, i) => i === 0 || c.trim() !== deltaChunks[i - 1].trim()
          );
          raw.response = deduped.join("");
        }
      } else {
        try {
          raw = JSON.parse(text);
        } catch {
          raw = { response: text };
        }
      }

      const questionText = query.trim();
      const result: GoogleSearchResult = {
        id: raw.id ?? Date.now(),
        uid: raw.uid ?? uid,
        question: raw.question ?? questionText,
        response: raw.response ?? "",
        timestamp: raw.timestamp ?? new Date().toISOString(),
        expectedtokens: raw.expectedtokens ?? 0,
        expectedcost: raw.expectedcost ?? 0,
        requestType: raw.requestType ?? 5,
        model: raw.model ?? "gemini-pro",
      };
      setHistory((prev) => [result, ...prev]);
      setQuery("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to reach the Google Gemini API.";
      setError(msg.includes("500") ? `${msg} — The Gemini backend may be temporarily unavailable. Please try again in a moment.` : msg);
      console.error("Google Search error:", err);
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

      {/* Search Box */}
      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <SearchIcon className="text-slate-600" fontSize="large" />
          <Typography variant="h6">Ask Gemini</Typography>
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
            placeholder="Enter your question for Google Gemini..."
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
              backgroundColor: "#4285F4",
              "&:hover": { backgroundColor: "#3367D6" },
              whiteSpace: "nowrap",
              minWidth: 140,
              textTransform: "none",
            }}
          >
            {searching ? "Searching..." : "Ask Gemini"}
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
              No Gemini searches yet. Ask a question above to get started.
            </Typography>
          </Paper>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <Paper key={item.id ?? index} className="p-5" elevation={1}>
                <Box className="flex items-start justify-between gap-3 mb-3">
                  <Typography variant="subtitle1" className="font-semibold text-slate-900">
                    {item.question}
                  </Typography>
                  <Chip
                    label="Gemini"
                    size="small"
                    icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                    sx={{ backgroundColor: "#e8f0fe", color: "#4285F4", flexShrink: 0 }}
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
                  <Box sx={{ ml: "auto" }}>
                    <VoicePlayButton
                      chatQueryId={item.id}
                      text={item.response}
                      uid={uid}
                      color="#4285F4"
                    />
                  </Box>
                </Box>
              </Paper>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
