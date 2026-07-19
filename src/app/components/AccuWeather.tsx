import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip, Divider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import { API_CONFIG, getApiUrl } from "../config/api";

const ACCUWEATHER_COLOR = "#EF6C00";

function AccuWeatherBadge({ size = 40 }: { size?: number }) {
  return (
    <Box sx={{ width: size, height: size, background: "linear-gradient(135deg, #EF6C00 0%, #F57C00 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", flexShrink: 0, fontSize: size * 0.38 }}>
      ☀️
    </Box>
  );
}

interface WeatherEntry {
  id: string;
  query: string;
  timestamp: string;
  data: any;
  error?: string;
}

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\s/, "").trim();
}

function formatTemp(temp: any): string {
  if (typeof temp === "object") {
    const metric = temp.Metric ?? temp.metric;
    const imperial = temp.Imperial ?? temp.imperial;
    if (metric?.Value !== undefined) return `${metric.Value}°${metric.Unit ?? "C"}`;
    if (imperial?.Value !== undefined) return `${imperial.Value}°${imperial.Unit ?? "F"}`;
  }
  return `${temp}°`;
}

function formatWind(wind: any): string {
  if (typeof wind === "object") {
    const speed = wind.Speed ?? wind.speed;
    const dir = wind.Direction ?? wind.direction;
    const speedVal = speed?.Metric?.Value ?? speed?.Imperial?.Value ?? speed;
    const speedUnit = speed?.Metric?.Unit ?? speed?.Imperial?.Unit ?? "";
    const dirVal = dir?.English ?? dir?.Localized ?? dir;
    return [speedVal && `${speedVal} ${speedUnit}`, dirVal].filter(Boolean).join(" ");
  }
  return String(wind);
}

function getWeatherEmoji(iconCode: number): string {
  if (iconCode <= 5) return "☀️";
  if (iconCode <= 11) return "⛅";
  if (iconCode <= 18) return "🌧️";
  if (iconCode <= 22) return "🌨️";
  if (iconCode <= 29) return "🌩️";
  if (iconCode <= 32) return "❄️";
  if (iconCode <= 38) return "🌡️";
  return "🌤️";
}

function WeatherDataDisplay({ data }: { data: any }) {
  if (data === null || data === undefined) return null;
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return <span className="text-slate-800">{String(data)}</span>;
  }
  if (Array.isArray(data)) {
    return (
      <div className="space-y-3">
        {data.map((item, i) => (
          <Paper key={i} elevation={0} sx={{ border: "1px solid #e2e8f0", p: 2, borderRadius: 1 }}>
            <WeatherDataDisplay data={item} />
          </Paper>
        ))}
      </div>
    );
  }
  if (typeof data === "object") {
    const temp = data.Temperature ?? data.temperature ?? data.temp;
    const condition = data.WeatherText ?? data.condition ?? data.Description ?? data.description;
    const humidity = data.RelativeHumidity ?? data.humidity;
    const wind = data.Wind ?? data.wind;
    const icon = data.WeatherIcon ?? data.icon;
    return (
      <div className="space-y-2">
        {(temp || condition) && (
          <Box className="flex items-center gap-4 flex-wrap mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            {icon && <span className="text-3xl">{getWeatherEmoji(icon)}</span>}
            {condition && <Typography variant="h6" sx={{ color: ACCUWEATHER_COLOR, fontWeight: 600 }}>{condition}</Typography>}
            {temp && (
              <Box className="flex items-center gap-1">
                <ThermostatIcon sx={{ color: ACCUWEATHER_COLOR, fontSize: 20 }} />
                <Typography variant="h6">{formatTemp(temp)}</Typography>
              </Box>
            )}
            {humidity && (
              <Box className="flex items-center gap-1">
                <WaterDropIcon sx={{ color: "#2196F3", fontSize: 18 }} />
                <Typography variant="body2">{humidity}% humidity</Typography>
              </Box>
            )}
            {wind && (
              <Box className="flex items-center gap-1">
                <AirIcon sx={{ color: "#607D8B", fontSize: 18 }} />
                <Typography variant="body2">{formatWind(wind)}</Typography>
              </Box>
            )}
          </Box>
        )}
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} className="flex gap-2 text-sm">
            <span className="text-slate-500 font-medium min-w-[140px] flex-shrink-0">{humanize(key)}:</span>
            <span className="text-slate-800 flex-1">
              {typeof value === "object" && value !== null ? <WeatherDataDisplay data={value} /> : String(value ?? "—")}
            </span>
          </Box>
        ))}
      </div>
    );
  }
  return null;
}

export function AccuWeather() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<WeatherEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uid = localStorage.getItem("uid") || "";

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ACCUWEATHER(query.trim()));
      const response = await fetch(url, { headers: { accept: "*/*", Authorization: `Bearer ${uid}` } });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      setHistory((prev) => [{ id: `accu-${Date.now()}`, query: query.trim(), timestamp: new Date().toLocaleString(), data }, ...prev]);
      setQuery("");
    } catch (err: any) {
      setError(err.message || "Unable to reach the AccuWeather API (/api/accuweather).");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <AccuWeatherBadge size={40} />
          <Typography variant="h4">AccuWeather Forecast</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Get current conditions and forecasts for any location via AccuWeather.
        </Typography>
        <Alert severity="info">
          <strong>Powered by AccuWeather:</strong> Live forecast data via <code>/api/accuweather/&#123;query&#125;</code>. Results are displayed in-session only.
        </Alert>
      </Box>

      <Paper className="p-6 mb-6" elevation={2}>
        <Box className="flex items-center gap-3 mb-4">
          <WbSunnyIcon sx={{ color: ACCUWEATHER_COLOR }} fontSize="large" />
          <Typography variant="h6">Search Weather</Typography>
        </Box>
        {error && <Alert severity="error" className="mb-3">{error}</Alert>}
        <Box className="flex gap-3">
          <TextField fullWidth value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. Boston weather, London forecast, 10001..."
            variant="outlined" size="small" disabled={searching} />
          <Button variant="contained" onClick={handleSearch} disabled={searching || !query.trim()}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{ backgroundColor: ACCUWEATHER_COLOR, "&:hover": { backgroundColor: "#E65100" }, whiteSpace: "nowrap", minWidth: 160, textTransform: "none" }}>
            {searching ? "Fetching..." : "Get Forecast"}
          </Button>
        </Box>
      </Paper>

      {history.length > 0 && (
        <Box>
          <Typography variant="h6" className="mb-3">Results</Typography>
          <div className="space-y-4">
            {history.map((entry) => (
              <Paper key={entry.id} className="p-5" elevation={1}>
                <Box className="flex items-start justify-between gap-3 mb-3">
                  <Typography variant="subtitle1" className="font-semibold text-slate-900">{entry.query}</Typography>
                  <Chip label="AccuWeather" size="small" icon={<span style={{ fontSize: 12 }}>☀️</span>}
                    sx={{ backgroundColor: "#FFF3E0", color: ACCUWEATHER_COLOR, flexShrink: 0 }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <WeatherDataDisplay data={entry.data} />
                <Divider sx={{ mt: 2, mb: 1 }} />
                <Typography variant="caption" color="text.secondary">Fetched: {entry.timestamp}</Typography>
              </Paper>
            ))}
          </div>
        </Box>
      )}

      {history.length === 0 && !searching && (
        <Paper className="p-8 text-center" elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <AccuWeatherBadge size={48} />
          <Typography variant="body1" color="text.secondary" className="mt-3">
            Enter a city, zip code, or weather query above to get started.
          </Typography>
        </Paper>
      )}
    </div>
  );
}
