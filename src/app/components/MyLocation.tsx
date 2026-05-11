import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  TextField,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const LAT_KEY = "userLat";
const LON_KEY = "userLon";

export function MyLocation() {
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("");

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLat = localStorage.getItem(LAT_KEY);
    const savedLon = localStorage.getItem(LON_KEY);
    if (savedLat && savedLon) {
      setLat(savedLat);
      setLon(savedLon);
    } else {
      // Auto-request on first load if nothing saved
      detectLocation();
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude.toFixed(6);
        const newLon = pos.coords.longitude.toFixed(6);
        setLat(newLat);
        setLon(newLon);
        localStorage.setItem(LAT_KEY, newLat);
        localStorage.setItem(LON_KEY, newLon);
        setLocating(false);
      },
      (err) => {
        setError(`Unable to retrieve location: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasLocation = lat && lon;

  const mapSrc = hasLocation
    ? `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`
    : null;

  const openDirections = () => {
    if (!hasLocation || !destination.trim()) return;
    const dest = encodeURIComponent(destination.trim());
    window.open(
      `https://www.google.com/maps/dir/${lat},${lon}/${dest}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-1">
          <MyLocationIcon sx={{ color: "#8B0000", fontSize: 32 }} />
          <Typography variant="h4">My Location</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          View your current coordinates and get driving directions to any destination.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Coordinates card */}
      <Paper className="p-5 mb-5" elevation={2} sx={{ borderLeft: "4px solid #8B0000" }}>
        <Box className="flex flex-wrap items-center justify-between gap-4">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Current Coordinates
            </Typography>
            {hasLocation ? (
              <Box className="flex flex-wrap gap-2 items-center">
                <Chip
                  label={`Lat: ${lat}`}
                  size="small"
                  sx={{ backgroundColor: "#f1f5f9", fontFamily: "monospace", fontWeight: 600 }}
                />
                <Chip
                  label={`Lon: ${lon}`}
                  size="small"
                  sx={{ backgroundColor: "#f1f5f9", fontFamily: "monospace", fontWeight: 600 }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {locating ? "Detecting location…" : "No location saved"}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={locating ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={detectLocation}
            disabled={locating}
            sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" } }}
          >
            {locating ? "Locating…" : hasLocation ? "Refresh Location" : "Detect My Location"}
          </Button>
        </Box>
      </Paper>

      {/* Map */}
      {mapSrc && (
        <Paper className="mb-5 overflow-hidden" elevation={2}>
          <iframe
            title="My Location Map"
            src={mapSrc}
            width="100%"
            height="400"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Paper>
      )}

      {/* Directions */}
      <Paper className="p-5" elevation={2}>
        <Box className="flex items-center gap-2 mb-3">
          <DirectionsIcon sx={{ color: "#8B0000" }} />
          <Typography variant="h6">Get Driving Directions</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {!hasLocation && (
          <Alert severity="info" className="mb-3">
            Detect your location first to use directions.
          </Alert>
        )}

        <Box className="flex flex-col sm:flex-row gap-3">
          <TextField
            fullWidth
            label="Destination"
            placeholder="e.g. 1600 Pennsylvania Ave NW, Washington DC"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={!hasLocation}
            onKeyDown={(e) => e.key === "Enter" && openDirections()}
            size="small"
          />
          <Button
            variant="contained"
            endIcon={<OpenInNewIcon />}
            onClick={openDirections}
            disabled={!hasLocation || !destination.trim()}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Open in Maps
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          Opens Google Maps with turn-by-turn driving directions from your current location.
        </Typography>
      </Paper>
    </div>
  );
}
