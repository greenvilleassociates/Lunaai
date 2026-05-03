import { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Paper, Alert, Chip, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Settings as SettingsIcon, Psychology, Security, Tune, Api, Memory, Build, OpenInNew, RecordVoiceOver } from "@mui/icons-material";
import { LLMAgentConfig } from "./LLMAgentConfig";
import { CustomSLM } from "./CustomSLM";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voiceEncodingFormat, setVoiceEncodingFormat] = useState<string>("wav-16khz");
  const [pendingFormat, setPendingFormat] = useState<string | null>(null);
  const [showFormatWarning, setShowFormatWarning] = useState(false);

  // Check if user is superuser
  const currentUserRole = localStorage.getItem("role");
  const isSuperUser = currentUserRole === "superuser";
  const isManager = isSuperUser || currentUserRole === "admin";
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    // Load saved voice encoding format from localStorage
    const savedFormat = localStorage.getItem("voiceEncodingFormat");
    if (savedFormat) {
      setVoiceEncodingFormat(savedFormat);
    }
    setLoading(false);
  }, []);

  const handleVoiceEncodingChange = (event: SelectChangeEvent) => {
    const newFormat = event.target.value;
    if (!newFormat.startsWith("wav")) {
      setPendingFormat(newFormat);
      setShowFormatWarning(true);
    } else {
      saveFormat(newFormat);
    }
  };

  const saveFormat = (format: string) => {
    setVoiceEncodingFormat(format);
    localStorage.setItem("voiceEncodingFormat", format);
    // Notify same-page listeners (storage event only fires across tabs natively)
    window.dispatchEvent(new StorageEvent("storage", { key: "voiceEncodingFormat", newValue: format }));
  };

  const confirmFormatChange = () => {
    if (pendingFormat) {
      saveFormat(pendingFormat);
    }
    setPendingFormat(null);
    setShowFormatWarning(false);
  };

  const cancelFormatChange = () => {
    setPendingFormat(null);
    setShowFormatWarning(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center py-12">
        <Typography>Loading Settings...</Typography>
      </div>
    );
  }

  // Non-managers see simplified ChatGPT settings
  if (!isManager) {
    return (
      <div className="max-w-7xl mx-auto">
        <Box className="mb-6">
          <Typography variant="h4" className="mb-2">
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mb-3">
            LLM Configuration
          </Typography>
        </Box>

        <Paper className="p-6">
          <Box className="flex items-center gap-3 mb-6">
            <Psychology className="text-slate-700" fontSize="large" />
            <div>
              <Typography variant="h5">ChatGPT</Typography>
              <Typography variant="body2" color="text.secondary">
                Default AI Assistant
              </Typography>
            </div>
          </Box>

          <Alert severity="info" className="mb-4">
            Your account is configured to use ChatGPT for all AI interactions.
          </Alert>

          <Box className="p-6 border border-slate-200 rounded-lg bg-slate-50">
            <Typography variant="subtitle1" className="mb-4 font-semibold">
              Current Configuration
            </Typography>
            
            <Box className="space-y-3">
              <Box className="flex items-center justify-between p-3 bg-white rounded">
                <Typography variant="body2" className="text-slate-700">
                  AI Provider
                </Typography>
                <Chip label="ChatGPT" color="primary" size="small" />
              </Box>
              
              <Box className="flex items-center justify-between p-3 bg-white rounded">
                <Typography variant="body2" className="text-slate-700">
                  Model Version
                </Typography>
                <Typography variant="body2" className="font-mono text-slate-600">
                  GPT-4
                </Typography>
              </Box>
              
              <Box className="flex items-center justify-between p-3 bg-white rounded">
                <Typography variant="body2" className="text-slate-700">
                  Status
                </Typography>
                <Chip label="Active" color="success" size="small" />
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" className="mt-4">
            For advanced configuration options, please contact your system administrator.
          </Typography>
        </Paper>
      </div>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h4" className="mb-2">
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-3">
          Superuser configuration and system management
        </Typography>

        {/* Superuser Info */}
        <Box className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <Box className="flex items-center gap-2 mb-2">
            <SettingsIcon className="text-slate-700" />
            <Typography variant="h6">Superuser: {username}</Typography>
            <Chip label="Super User" color="error" size="small" />
          </Box>
          <Typography variant="body2" className="text-slate-600">
            You have full access to all system settings and configurations.
          </Typography>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minWidth: 120,
              textTransform: "none",
              fontWeight: 500,
            },
            "& .Mui-selected": {
              color: "#8B0000",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8B0000",
            },
          }}
        >
          <Tab icon={<Psychology />} label="LLM Agents" iconPosition="start" />
          <Tab icon={<Api />} label="API Configuration" iconPosition="start" />
          <Tab icon={<Security />} label="Security & Auth" iconPosition="start" />
          <Tab icon={<Tune />} label="System Settings" iconPosition="start" />
          <Tab icon={<Memory />} label="Custom SLM" iconPosition="start" />
          <Tab icon={<Build />} label="Utilities" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <LLMAgentConfig />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box>
          <Typography variant="h5" className="mb-4">API Configuration</Typography>
          <Paper className="p-6">
            <Typography variant="body1" color="text.secondary">
              API endpoint configuration and management will be available here.
            </Typography>
            <Box className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="p-4 border border-slate-200 rounded">
                <Typography variant="subtitle1" className="mb-2 font-semibold">Azure API Root</Typography>
                <Typography variant="body2" className="font-mono text-xs text-slate-600">
                  lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net
                </Typography>
              </Box>
              <Box className="p-4 border border-slate-200 rounded">
                <Typography variant="subtitle1" className="mb-2 font-semibold">Deployment URL</Typography>
                <Typography variant="body2" className="font-mono text-xs text-slate-600">
                  luna.capitoltechnology.net
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box>
          <Typography variant="h5" className="mb-4">Security & Authentication</Typography>
          <Paper className="p-6">
            <Typography variant="body1" color="text.secondary" className="mb-4">
              Security settings and authentication configuration.
            </Typography>
            <Alert severity="info">
              Microsoft EntraID authentication settings for LLM agents are configured in the LLM Agents tab.
            </Alert>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box>
          <Typography variant="h5" className="mb-4">System Settings</Typography>
          <Box className="space-y-4">
            <Paper className="p-6">
              <Typography variant="body1" color="text.secondary" className="mb-4">
                General system configuration and preferences.
              </Typography>
              <Box className="space-y-4">
                <Box className="p-4 border border-slate-200 rounded">
                  <Typography variant="subtitle1" className="mb-2 font-semibold">Company Colors</Typography>
                  <Box className="flex gap-4 items-center">
                    <Box className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-black border border-slate-300 rounded"></div>
                      <Typography variant="body2">Black</Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded" style={{ backgroundColor: "#8B0000" }}></div>
                      <Typography variant="body2">Dark Red (#8B0000)</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box className="p-4 border border-slate-200 rounded">
                  <Typography variant="subtitle1" className="mb-2 font-semibold">Company Name</Typography>
                  <Typography variant="body2" className="text-slate-600">
                    Capitol Technology Solutions
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Voice Encoding Settings */}
            <Paper className="p-6">
              <Box className="flex items-center gap-2 mb-4">
                <RecordVoiceOver className="text-slate-700" />
                <Typography variant="h6">Azure Speech-to-Text Voice Encoding</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" className="mb-4">
                Select the default audio format for voice recording and Azure Speech-to-Text ingestion.
              </Typography>

              <Alert severity="info" className="mb-4">
                WAV (PCM) format is recommended by Microsoft for optimal speech recognition accuracy.
              </Alert>

              <FormControl fullWidth>
                <InputLabel id="voice-encoding-label">Audio Format</InputLabel>
                <Select
                  labelId="voice-encoding-label"
                  id="voice-encoding-select"
                  value={voiceEncodingFormat}
                  label="Audio Format"
                  onChange={handleVoiceEncodingChange}
                >
                  <MenuItem value="wav-16khz">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        WAV (PCM) - 16 kHz, 16-bit, mono
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recommended for speech-to-text (standard quality)
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="wav-8khz">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        WAV (PCM) - 8 kHz, 16-bit, mono
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Telephony quality (smaller file size)
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="mp3">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        MP3 - Compressed audio
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Smaller file size, may reduce accuracy
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="wma">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        WMA - Windows Media Audio
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Azure-compatible, good for Windows clients
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="webm">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        WebM - Browser native fallback
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last resort fallback when other formats unavailable
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box className="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
                <Typography variant="subtitle2" className="mb-2 font-semibold">
                  Current Selection Details
                </Typography>
                {voiceEncodingFormat === "wav-16khz" && (
                  <Box>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Format:</strong> WAV container with PCM encoding
                    </Typography>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Sample Rate:</strong> 16 kHz
                    </Typography>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Bit Depth:</strong> 16-bit
                    </Typography>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Channels:</strong> Mono
                    </Typography>
                    <Typography variant="body2" className="text-slate-700 mt-2">
                      <strong>Use Case:</strong> Best for general speech recognition with high accuracy
                    </Typography>
                  </Box>
                )}
                {voiceEncodingFormat === "wav-8khz" && (
                  <Box>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Format:</strong> WAV container with PCM encoding
                    </Typography>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Sample Rate:</strong> 8 kHz
                    </Typography>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Bit Depth:</strong> 16-bit
                    </Typography>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Channels:</strong> Mono
                    </Typography>
                    <Typography variant="body2" className="text-slate-700 mt-2">
                      <strong>Use Case:</strong> Telephony and bandwidth-constrained scenarios
                    </Typography>
                  </Box>
                )}
                {voiceEncodingFormat === "mp3" && (
                  <Box>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Format:</strong> MP3 compressed audio
                    </Typography>
                    <Typography variant="body2" className="text-slate-700 mt-2">
                      <strong>Use Case:</strong> Reduced file size, suitable when storage is limited
                    </Typography>
                  </Box>
                )}
                {voiceEncodingFormat === "wma" && (
                  <Box>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Format:</strong> Windows Media Audio container
                    </Typography>
                    <Typography variant="body2" className="text-slate-700 mt-2">
                      <strong>Use Case:</strong> Azure-compatible, best for Windows clients
                    </Typography>
                  </Box>
                )}
                {voiceEncodingFormat === "webm" && (
                  <Box>
                    <Typography variant="body2" className="text-slate-700">
                      <strong>Format:</strong> WebM browser-native format
                    </Typography>
                    <Typography variant="body2" className="text-slate-700 mt-2">
                      <strong>Use Case:</strong> Fallback when WAV, MP3, and WMA are unavailable
                    </Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary" className="mt-3 block">
                This setting is saved locally and will be applied to all voice recording features.
              </Typography>
            </Paper>

            {/* WAV Override Warning Dialog */}
            <Dialog open={showFormatWarning} onClose={cancelFormatChange}>
              <DialogTitle sx={{ color: 'warning.main', fontWeight: 700 }}>
                ⚠️ Change Audio Format?
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" className="mb-2">
                  <strong>Azure Speech Services requires WAV format.</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Changing to a non-WAV format may cause voice processing to fail on the Azure API. WAV (PCM) is the only officially supported format.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                  Are you sure you want to change away from WAV?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={cancelFormatChange} variant="contained" color="primary">
                  Keep WAV (Recommended)
                </Button>
                <Button onClick={confirmFormatChange} variant="outlined" color="warning">
                  Change Anyway
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <CustomSLM />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <Box>
          <Typography variant="h5" className="mb-4">Utilities</Typography>
          <Paper className="p-6">
            <Typography variant="body1" color="text.secondary" className="mb-4">
              Developer tools and API documentation for superusers.
            </Typography>

            {/* Swagger API Documentation */}
            <Box className="p-6 border border-slate-200 rounded-lg bg-slate-50">
              <Box className="flex items-center gap-2 mb-4">
                <Api className="text-slate-700" />
                <Typography variant="h6">Swagger API Documentation</Typography>
              </Box>

              <Typography variant="body2" className="text-slate-600 mb-4">
                Access the complete API documentation and test endpoints directly in your browser.
              </Typography>

              <Box className="space-y-4">
                {/* API URL */}
                <Box className="p-4 bg-white border border-slate-300 rounded">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-slate-700">
                    API Documentation URL
                  </Typography>
                  <Typography variant="body2" className="font-mono text-sm text-slate-600 mb-3">
                    https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/swagger
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<OpenInNew />}
                    href="https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/swagger"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: "#8B0000",
                      "&:hover": {
                        backgroundColor: "#6B0000",
                      },
                    }}
                  >
                    Open Swagger Documentation
                  </Button>
                </Box>

                {/* API Definition JSON */}
                <Box className="p-4 bg-white border border-slate-300 rounded">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-slate-700">
                    API Definition (OpenAPI/Swagger JSON)
                  </Typography>
                  <Typography variant="body2" className="font-mono text-sm text-slate-600 mb-2">
                    https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/swagger/v1/swagger.json
                  </Typography>
                  <Alert severity="info" className="mb-3">
                    This endpoint requires authentication. Login with the credentials below before accessing.
                  </Alert>
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    href="https://lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net/swagger/v1/swagger.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderColor: "#8B0000",
                      color: "#8B0000",
                      "&:hover": {
                        borderColor: "#6B0000",
                        backgroundColor: "rgba(139, 0, 0, 0.04)",
                      },
                    }}
                  >
                    View API Definition JSON
                  </Button>
                </Box>

                {/* Authentication Credentials */}
                <Box className="p-4 bg-white border border-slate-300 rounded">
                  <Typography variant="subtitle2" className="mb-3 font-semibold text-slate-700">
                    API Authentication Credentials
                  </Typography>
                  <Alert severity="warning" className="mb-3">
                    These credentials are for API testing only. Keep them secure and do not share.
                  </Alert>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <Typography variant="body2" className="font-semibold text-slate-700 w-24">
                        Username:
                      </Typography>
                      <Typography variant="body2" className="font-mono bg-slate-100 px-3 py-1 rounded">
                        admin
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Typography variant="body2" className="font-semibold text-slate-700 w-24">
                        Password:
                      </Typography>
                      <Typography variant="body2" className="font-mono bg-slate-100 px-3 py-1 rounded">
                        spirit
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Information */}
                <Box className="p-4 bg-white border border-slate-300 rounded">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-slate-700">
                    Quick Start Guide
                  </Typography>
                  <Typography variant="body2" className="text-slate-600">
                    1. Click the "Open Swagger Documentation" button above<br />
                    2. Use the provided credentials when prompted for authentication<br />
                    3. Explore available endpoints and test API calls directly in the browser<br />
                    4. Review request/response schemas for integration development
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TabPanel>
    </div>
  );
}