import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Chip, Button, Alert, CircularProgress } from "@mui/material";
import { Language, LocationOn, AccessTime, CheckCircle, Error, Refresh } from "@mui/icons-material";
import { checkApiHealth, API_CONFIG } from "../config/api";

/**
 * NetworkInfo Component
 * 
 * Displays current network information including:
 * - Public IP address (via ipify.org)
 * - API connectivity status
 * - Geolocation (if permitted)
 * - Current session info from localStorage
 * - Instructions for whitelisting IP in Azure
 */
export function NetworkInfo() {
  const [ipAddress, setIpAddress] = useState<string>("Loading...");
  const [location, setLocation] = useState<{ lat: string; lon: string }>({ lat: "N/A", lon: "N/A" });
  const [apiHealth, setApiHealth] = useState<{ accessible: boolean; message: string; ip?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    uid: "",
    username: "",
    loginTime: "",
    storedIp: "",
    storedLat: "",
    storedLon: "",
  });

  const checkApi = async () => {
    setChecking(true);
    const health = await checkApiHealth();
    setApiHealth(health);
    setChecking(false);
  };

  useEffect(() => {
    // Fetch current IP address
    const fetchIpAddress = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error("Failed to fetch IP:", error);
        setIpAddress("Unable to fetch");
      }
    };

    // Get current geolocation
    const fetchLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocation({
          lat: position.coords.latitude.toFixed(6),
          lon: position.coords.longitude.toFixed(6),
        });
      } catch (error) {
        console.log("Location access denied or unavailable");
      }
    };

    // Get session info from localStorage
    const getSessionInfo = () => {
      setSessionInfo({
        uid: localStorage.getItem("uid") || "Not logged in",
        username: localStorage.getItem("username") || "N/A",
        loginTime: localStorage.getItem("loginTime") || "N/A",
        storedIp: localStorage.getItem("ipAddress") || "N/A",
        storedLat: localStorage.getItem("latitude") || "N/A",
        storedLon: localStorage.getItem("longitude") || "N/A",
      });
    };

    fetchIpAddress();
    fetchLocation();
    getSessionInfo();
    checkApi();
  }, []);

  return (
    <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🌐 Network & Session Information
        </Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Language /> Current Network Info
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1">
              <strong>Current IP Address:</strong>{" "}
              <Chip label={ipAddress} color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem" }}>
              This is the IP address Figma is using to connect to your Azure API
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOn /> Current Location
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1">
              <strong>Latitude:</strong> {location.lat}
            </Typography>
            <Typography variant="body1">
              <strong>Longitude:</strong> {location.lon}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTime /> Session Information (Stored at Login)
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1">
              <strong>User ID:</strong> {sessionInfo.uid}
            </Typography>
            <Typography variant="body1">
              <strong>Username:</strong> {sessionInfo.username}
            </Typography>
            <Typography variant="body1">
              <strong>Login Time:</strong> {sessionInfo.loginTime}
            </Typography>
            <Typography variant="body1">
              <strong>IP at Login:</strong>{" "}
              <Chip label={sessionInfo.storedIp} color="secondary" size="small" sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="body1">
              <strong>Location at Login:</strong> {sessionInfo.storedLat}, {sessionInfo.storedLon}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            <strong>Note:</strong> When running in Figma Make, the IP address shown is from Figma's infrastructure,
            not your personal IP. This is normal for cloud-based development environments.
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            API Connectivity Status
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={checkApi}
              disabled={checking}
              sx={{ ml: 2 }}
            >
              {checking ? "Checking..." : "Recheck"}
            </Button>
          </Typography>
          <Box sx={{ pl: 2 }}>
            {checking ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={24} />
                <Typography>Checking API connectivity...</Typography>
              </Box>
            ) : apiHealth ? (
              <>
                {apiHealth.accessible ? (
                  <Alert severity="success" icon={<CheckCircle />}>
                    <strong>✓ API is accessible</strong>
                    <br />
                    Your IP ({apiHealth.ip}) can reach the Azure API successfully.
                  </Alert>
                ) : (
                  <Alert severity="error" icon={<Error />}>
                    <strong>✗ API is NOT accessible</strong>
                    <br />
                    {apiHealth.message}
                  </Alert>
                )}
              </>
            ) : null}
          </Box>
        </Box>

        {!apiHealth?.accessible && apiHealth && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "error.dark" }}>
              🚫 IP Restriction Detected
            </Typography>
            <Typography variant="body2" sx={{ color: "error.dark", mb: 2 }}>
              Your Azure API is IP-restricted and Figma's IP address ({ipAddress}) is not whitelisted.
            </Typography>
            <Typography variant="body2" sx={{ color: "error.dark", fontWeight: "bold", mb: 1 }}>
              To fix this, you have 3 options:
            </Typography>
            <Box component="ol" sx={{ color: "error.dark", pl: 2, mb: 2 }}>
              <li>
                <strong>Whitelist Figma's IP in Azure</strong> (Recommended for development)
                <br />
                Add <code style={{ background: "rgba(0,0,0,0.1)", padding: "2px 6px" }}>{ipAddress}</code> to your
                Azure API's allowed IP addresses
              </li>
              <li>
                <strong>Use Development Mode</strong> (Current setting: {API_CONFIG.DEV_MODE ? "ON" : "OFF"})
                <br />
                The app will fall back to local JSON files when API is unreachable
              </li>
              <li>
                <strong>Temporarily disable IP restrictions</strong> (Not recommended for production)
                <br />
                Remove IP restrictions in Azure during development
              </li>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            <strong>Development Mode:</strong> Currently {API_CONFIG.DEV_MODE ? "ENABLED" : "DISABLED"}
            <br />
            When enabled, the app will use local JSON fallbacks if the Azure API is unreachable.
            <br />
            To change this, edit <code>/src/app/config/api.ts</code> and set <code>DEV_MODE</code> to true/false.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Azure API:</strong> {API_CONFIG.ROOT_URL}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}