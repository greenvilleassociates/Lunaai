import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import { API_CONFIG, getApiUrl } from "../config/api";

interface WeatherSearchResult {
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

// IBM-styled logo badge (Weather Underground is an IBM company)
function IbmBadge({ size = 48 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: "#0062FF",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.29,
        borderRadius: 1,
        letterSpacing: "0.08em",
        flexShrink: 0,
        fontFamily: "monospace",
      }}
    >
      IBM
    </Box>
  );
}

export function WeatherSearch() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<WeatherSearchResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.WEATHER_UNDERGROUND);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });
      if (response.ok) {
        const data: WeatherSearchResult[] = await response.json();
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
      const url = getApiUrl(API_CONFIG.ENDPOINTS.WEATHER_UNDERGROUND);
      const payload = {
        uid,
        question: query.trim(),
        requestType: 8,
        model: "weather-underground",
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
        const data: WeatherSearchResult = await response.json();
        setHistory((prev) => [data, ...prev]);
        setQuery("");
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      setError("Unable to reach the Weather Underground API (/api/WeatherUnderground). The endpoint may not be configured yet.");
      console.error("Weather Search error:", err);
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
          <IbmBadge size={40} />
          <Typography variant="h4">Weather Underground Search</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Query weather data and forecasts via IBM's Weather Underground platform through the LunaAI orchestration layer.
        </Typography>
        <Alert severity="info">
          <strong>Powered by IBM Weather Underground:</strong> Responses are generated via <code>/api/WeatherUnderground</code> and stored to your search history.
        </Alert>
      </Box>

      {/* Search Box */}
      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <SearchIcon className="text-slate-600" fontSize="large" />
          <Typography variant="h6">Ask Weather Underground</Typography>
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
            placeholder="Enter a weather query (e.g. forecast for Raleigh NC)..."
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
              backgroundColor: "#0062FF",
              "&:hover": { backgroundColor: "#0047CC" },
              whiteSpace: "nowrap",
              minWidth: 160,
              textTransform: "none",
            }}
          >
            {searching ? "Searching..." : "Get Weather"}
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
            <WbCloudyIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
            <Typography variant="body1" color="text.secondary" className="mt-3">
              No weather searches yet. Submit a query above to get started.
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
                    label="Weather Underground"
                    size="small"
                    icon={<WbCloudyIcon sx={{ fontSize: 14 }} />}
                    sx={{ backgroundColor: "#e6f0ff", color: "#0062FF", flexShrink: 0 }}
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
