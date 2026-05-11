import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import { API_CONFIG, getApiUrl } from "../config/api";

interface GeocoderResult {
  [key: string]: unknown;
}

function IbmBadge({ size = 40 }: { size?: number }) {
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

function renderValue(value: unknown, depth = 0): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic">null</span>;
  }
  if (typeof value === "boolean") {
    return <span className={value ? "text-green-600" : "text-red-500"}>{String(value)}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-blue-600 font-mono">{value}</span>;
  }
  if (typeof value === "string") {
    return <span className="text-slate-800">{value}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-400 italic">[]</span>;
    return (
      <div className={depth > 0 ? "pl-4 border-l border-slate-200 mt-1" : ""}>
        {value.map((item, i) => (
          <div key={i} className="mb-1">
            <span className="text-slate-400 text-xs mr-1">[{i}]</span>
            {renderValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-slate-400 italic">{"{}"}</span>;
    return (
      <div className={depth > 0 ? "pl-4 border-l border-slate-200 mt-1" : ""}>
        {entries.map(([k, v]) => (
          <div key={k} className="mb-1 flex flex-wrap gap-x-2">
            <span className="text-indigo-700 font-medium text-xs shrink-0">{k}:</span>
            <span className="text-sm">{renderValue(v, depth + 1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
}

export function Geocoder() {
  const [lat, setLat] = useState("37.826667");
  const [lon, setLon] = useState("-122.423333");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeocoderResult | null>(null);
  const [queriedCoords, setQueriedCoords] = useState<{ lat: string; lon: string } | null>(null);

  const handleLookup = async () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      setError("Please enter valid numeric coordinates.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const base = getApiUrl(API_CONFIG.ENDPOINTS.GEOCODER);
      const url = `${base}?lat=${latNum}&lon=${lonNum}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { accept: "*/*" },
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      setResult(data);
      setQueriedCoords({ lat: String(latNum), lon: String(lonNum) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geocoder request failed");
    } finally {
      setLoading(false);
    }
  };

  const mapSrc = queriedCoords
    ? `https://maps.google.com/maps?q=${queriedCoords.lat},${queriedCoords.lon}&z=15&output=embed`
    : null;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IbmBadge size={48} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            IBM Geocoder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reverse geocode coordinates via <code>/api/Geocoder</code>
          </Typography>
        </Box>
      </Box>

      {/* Input Panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Coordinates
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TextField
            label="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            size="small"
            sx={{ width: 180 }}
            inputProps={{ inputMode: "decimal" }}
          />
          <TextField
            label="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            size="small"
            sx={{ width: 180 }}
            inputProps={{ inputMode: "decimal" }}
          />
          <Button
            variant="contained"
            onClick={handleLookup}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlaceIcon />}
            sx={{ backgroundColor: "#0062FF", "&:hover": { backgroundColor: "#0050D8" }, height: 40 }}
          >
            {loading ? "Looking up..." : "Geocode"}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result && queriedCoords && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Google Map */}
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #e5e7eb" }}>
              <PlaceIcon sx={{ color: "#DB4437", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Google Maps
              </Typography>
              <Chip
                label={`${queriedCoords.lat}, ${queriedCoords.lon}`}
                size="small"
                sx={{ ml: 1, fontFamily: "monospace", fontSize: "0.7rem" }}
              />
            </Box>
            <iframe
              title="Geocoder Map"
              src={mapSrc!}
              width="100%"
              height="380"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Paper>

          {/* IBM Response Data */}
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}>
              <IbmBadge size={28} />
              <Typography variant="subtitle2" fontWeight={600}>
                IBM Geocoder Response
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {Array.isArray(result) ? (
                (result as GeocoderResult[]).map((item, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    {i > 0 && <Divider sx={{ my: 2 }} />}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Result {i + 1}
                    </Typography>
                    <div className="text-sm leading-relaxed">{renderValue(item)}</div>
                  </Box>
                ))
              ) : (
                <div className="text-sm leading-relaxed">{renderValue(result)}</div>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {!result && !loading && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: 2 }}>
          <PlaceIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
          <Typography color="text.secondary">
            Enter coordinates and click <strong>Geocode</strong> to retrieve IBM location data.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
