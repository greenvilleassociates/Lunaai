import { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Paper, Alert, Chip, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, RadioGroup, Radio, FormLabel, IconButton, Divider } from "@mui/material";
import { Settings as SettingsIcon, Psychology, Security, Tune, Api, Memory, Build, OpenInNew, RecordVoiceOver, CheckCircle, Cancel, ManageSearch, Hub, Add, Delete } from "@mui/icons-material";
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
  const [backupApiUrl, setBackupApiUrl] = useState<string>("");
  const [useBackupApi, setUseBackupApi] = useState<boolean>(false);
  const [backupTestStatus, setBackupTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [defaultSearchEngine, setDefaultSearchEngine] = useState<string>("1");
  const [maxSearchEngines, setMaxSearchEngines] = useState<string>("1");
  const [chainSearch, setChainSearch] = useState<string>("0");
  const [debugMode, setDebugMode] = useState<boolean>(true);

  const DEFAULT_CONTEXT_ROUTES = [
    { domain: "Sports",     llm: "grok" },
    { domain: "Medicine",   llm: "claude" },
    { domain: "Food",       llm: "gemini" },
    { domain: "Weather",    llm: "gemini" },
    { domain: "Legal",      llm: "claude" },
    { domain: "Finance",    llm: "chatgpt" },
    { domain: "Technology", llm: "empowr" },
    { domain: "General",    llm: "superluna" },
  ];
  const [contextRoutes, setContextRoutes] = useState<{ domain: string; llm: string }[]>(DEFAULT_CONTEXT_ROUTES);
  const [contextSaved, setContextSaved] = useState(false);

  // Check if user is superuser
  const currentUserRole = localStorage.getItem("role");
  const isSuperUser = currentUserRole === "superuser";
  const isManager = isSuperUser || currentUserRole === "admin";
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const savedFormat = localStorage.getItem("voiceEncodingFormat");
    if (savedFormat) setVoiceEncodingFormat(savedFormat);

    const savedBackupUrl = localStorage.getItem("backupApiUrl");
    if (savedBackupUrl) setBackupApiUrl(savedBackupUrl);

    const savedUseBackup = localStorage.getItem("useBackupApi") === "true";
    setUseBackupApi(savedUseBackup);

    const savedSearchEngine = localStorage.getItem("defaultSearchEngine");
    if (savedSearchEngine) setDefaultSearchEngine(savedSearchEngine);

    const savedMaxEngines = localStorage.getItem("maxsearchengines");
    if (savedMaxEngines) setMaxSearchEngines(savedMaxEngines);

    const savedChainSearch = localStorage.getItem("chainsearch");
    if (savedChainSearch) setChainSearch(savedChainSearch);

    const savedDebugMode = localStorage.getItem("debugMode");
    if (savedDebugMode !== null) {
      setDebugMode(savedDebugMode === "true");
    } else {
      // Default to true if not set
      localStorage.setItem("debugMode", "true");
      setDebugMode(true);
    }

    const savedContextRoutes = localStorage.getItem("contextRouterConfig");
    if (savedContextRoutes) {
      try {
        setContextRoutes(JSON.parse(savedContextRoutes));
      } catch {
        // Ignore malformed JSON, keep defaults
      }
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

  const handleSaveBackupApi = () => {
    const trimmed = backupApiUrl.trim();
    localStorage.setItem("backupApiUrl", trimmed);
    localStorage.setItem("useBackupApi", useBackupApi ? "true" : "false");
    setBackupTestStatus("idle");
  };

  const handleToggleBackup = (checked: boolean) => {
    setUseBackupApi(checked);
    localStorage.setItem("useBackupApi", checked ? "true" : "false");
  };

  const handleToggleDebugMode = (checked: boolean) => {
    setDebugMode(checked);
    localStorage.setItem("debugMode", checked ? "true" : "false");
    window.dispatchEvent(new StorageEvent("storage", { key: "debugMode", newValue: checked ? "true" : "false" }));
  };

  const handleTestBackupConnection = async () => {
    const url = backupApiUrl.trim();
    if (!url) return;
    setBackupTestStatus("testing");
    try {
      await fetch(`${url.replace(/\/$/, "")}/api`, { method: "HEAD", mode: "no-cors" });
      setBackupTestStatus("ok");
    } catch {
      setBackupTestStatus("fail");
    }
  };

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
          <Tab icon={<ManageSearch />} label="Search Engine" iconPosition="start" />
          <Tab icon={<Hub />} label="Context Router" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <LLMAgentConfig />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box className="space-y-4">
          <Typography variant="h5" className="mb-4">API Configuration</Typography>

          {/* Primary API */}
          <Paper className="p-6">
            <Box className="flex items-center gap-2 mb-4">
              <Api className="text-slate-700" />
              <Typography variant="h6">Primary API</Typography>
              {!useBackupApi && <Chip label="Active" color="success" size="small" />}
            </Box>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="p-4 border border-slate-200 rounded bg-slate-50">
                <Typography variant="subtitle2" className="mb-1 font-semibold text-slate-700">Azure API Root</Typography>
                <Typography variant="body2" className="font-mono text-xs text-slate-600">
                  lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net
                </Typography>
              </Box>
              <Box className="p-4 border border-slate-200 rounded bg-slate-50">
                <Typography variant="subtitle2" className="mb-1 font-semibold text-slate-700">Deployment URL</Typography>
                <Typography variant="body2" className="font-mono text-xs text-slate-600">
                  luna.capitoltechnology.net
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Backup API */}
          <Paper className="p-6">
            <Box className="flex items-center gap-2 mb-4">
              <Api className="text-slate-700" />
              <Typography variant="h6">Backup API Destination</Typography>
              {useBackupApi && <Chip label="Active" color="warning" size="small" />}
            </Box>

            <Alert severity={useBackupApi ? "warning" : "info"} className="mb-4">
              {useBackupApi
                ? "Backup API is currently active. All requests are being routed to the backup destination."
                : "Configure a fallback API root URL. Enable the toggle to route all traffic to the backup."}
            </Alert>

            <Box className="space-y-4">
              <TextField
                fullWidth
                label="Backup API Root URL"
                placeholder="https://backup-api.example.com"
                value={backupApiUrl}
                onChange={(e) => {
                  setBackupApiUrl(e.target.value);
                  setBackupTestStatus("idle");
                }}
                helperText="Enter the root URL only (no /api path). Example: https://backup-api.example.com"
                variant="outlined"
                size="small"
              />

              <Box className="flex items-center justify-between flex-wrap gap-3">
                <FormControlLabel
                  control={
                    <Switch
                      checked={useBackupApi}
                      onChange={(e) => handleToggleBackup(e.target.checked)}
                      disabled={!backupApiUrl.trim()}
                      color="warning"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Route all API traffic to backup destination
                    </Typography>
                  }
                />

                <Box className="flex items-center gap-2">
                  {backupTestStatus === "ok" && (
                    <Box className="flex items-center gap-1 text-green-600">
                      <CheckCircle fontSize="small" />
                      <Typography variant="caption">Reachable</Typography>
                    </Box>
                  )}
                  {backupTestStatus === "fail" && (
                    <Box className="flex items-center gap-1 text-red-600">
                      <Cancel fontSize="small" />
                      <Typography variant="caption">Unreachable</Typography>
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleTestBackupConnection}
                    disabled={!backupApiUrl.trim() || backupTestStatus === "testing"}
                    sx={{ borderColor: "#8B0000", color: "#8B0000", "&:hover": { borderColor: "#6B0000", backgroundColor: "rgba(139,0,0,0.04)" } }}
                  >
                    {backupTestStatus === "testing" ? "Testing..." : "Test Connection"}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveBackupApi}
                    disabled={!backupApiUrl.trim()}
                    sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" } }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>

              {useBackupApi && backupApiUrl && (
                <Box className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <Typography variant="body2" className="font-mono text-xs text-amber-800">
                    Active: {backupApiUrl.replace(/\/$/, "")}/api/...
                  </Typography>
                </Box>
              )}
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

            {/* Debug Mode Settings */}
            <Paper className="p-6">
              <Box className="flex items-center gap-2 mb-4">
                <Build className="text-slate-700" />
                <Typography variant="h6">Debug Mode</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" className="mb-4">
                Control whether debug messages are logged to the browser console.
              </Typography>

              <Alert severity="info" className="mb-4">
                Disabling debug mode will suppress console.log messages throughout the application, providing a cleaner browser console.
              </Alert>

              <FormControlLabel
                control={
                  <Switch
                    checked={debugMode}
                    onChange={(e) => handleToggleDebugMode(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#8B0000",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#8B0000",
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {debugMode ? "Debug Mode Enabled" : "Debug Mode Disabled"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {debugMode
                        ? "Console messages are visible in browser developer tools"
                        : "Console messages are suppressed for cleaner output"
                      }
                    </Typography>
                  </Box>
                }
              />

              <Typography variant="caption" color="text.secondary" className="mt-3 block">
                This setting is saved locally and affects all pages in the application.
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

      <TabPanel value={activeTab} index={6}>
        <Box>
          <Typography variant="h5" className="mb-4">Default Search Engine</Typography>
          <Paper className="p-6">
            <Box className="flex items-center gap-2 mb-4">
              <ManageSearch className="text-slate-700" />
              <Typography variant="h6">Search Engine Preference</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" className="mb-6">
              Choose which search engine is used by default when submitting queries through LunaAI.
            </Typography>

            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}>
                Select Default Engine
              </FormLabel>
              <RadioGroup
                value={defaultSearchEngine}
                onChange={(e) => {
                  setDefaultSearchEngine(e.target.value);
                  localStorage.setItem("defaultSearchEngine", e.target.value);
                }}
              >
                {/* Core options */}
                <Box className={`p-3 mb-2 border rounded transition-colors ${defaultSearchEngine === "1" ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <FormControlLabel
                    value="1"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>SuperLuna <Typography component="span" variant="caption" color="text.secondary">[1]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          LunaAI multi-provider aggregated search (default recommended)
                        </Typography>
                      </Box>
                    }
                  />

                  {/* SuperLuna sub-options — visible only when SuperLuna is selected */}
                  {defaultSearchEngine === "1" && (
                    <Box className="mt-3 ml-8 p-4 bg-white border border-amber-200 rounded space-y-4">
                      {/* Max Search Engines */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Max Search Engines
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="block mb-2">
                          Total number of search engines used in a chained search (1 = no chaining).
                        </Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={maxSearchEngines}
                          inputProps={{ min: 1, max: 7 }}
                          sx={{ width: 100 }}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(7, parseInt(e.target.value) || 1)).toString();
                            setMaxSearchEngines(val);
                            localStorage.setItem("maxsearchengines", val);
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" className="ml-2">
                          (1–7)
                        </Typography>
                      </Box>

                      {/* Chain Search */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Chain Search
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="block mb-2">
                          When enabled, SuperLuna queries multiple engines sequentially and aggregates results.
                        </Typography>
                        <RadioGroup
                          row
                          value={chainSearch}
                          onChange={(e) => {
                            setChainSearch(e.target.value);
                            localStorage.setItem("chainsearch", e.target.value);
                          }}
                        >
                          <FormControlLabel
                            value="1"
                            control={<Radio size="small" sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                            label={<Typography variant="body2">Enable</Typography>}
                          />
                          <FormControlLabel
                            value="0"
                            control={<Radio size="small" sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                            label={<Typography variant="body2">Disable</Typography>}
                          />
                        </RadioGroup>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box className="p-3 mb-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <FormControlLabel
                    value="2"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Keyword Based <Typography component="span" variant="caption" color="text.secondary">[2]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          Traditional keyword search without AI processing
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Preferred provider options */}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1 }}>
                  Preferred Provider
                </Typography>

                <Box className="p-3 mb-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <FormControlLabel
                    value="3"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>P-ChatGPT <Typography component="span" variant="caption" color="text.secondary">[3]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          Route queries preferentially through OpenAI ChatGPT
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box className="p-3 mb-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <FormControlLabel
                    value="4"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>P-Google <Typography component="span" variant="caption" color="text.secondary">[4]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          Route queries preferentially through Google Search
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box className="p-3 mb-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <FormControlLabel
                    value="5"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>P-Claude <Typography component="span" variant="caption" color="text.secondary">[5]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          Route queries preferentially through Anthropic Claude
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box className="p-3 mb-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <FormControlLabel
                    value="6"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>P-Wikipedia <Typography component="span" variant="caption" color="text.secondary">[6]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          Route queries preferentially through Wikipedia
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box className="p-3 mb-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <FormControlLabel
                    value="7"
                    control={<Radio sx={{ color: "#8B0000", "&.Mui-checked": { color: "#8B0000" } }} />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Empwr <Typography component="span" variant="caption" color="text.secondary">[7]</Typography></Typography>
                        <Typography variant="caption" color="text.secondary">
                          Route queries through the Empwr search platform
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </RadioGroup>
            </FormControl>

            <Box className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded">
              <Typography variant="subtitle2" className="mb-1 font-semibold">Current Selection</Typography>
              <Chip
                label={{"1":"1 — SuperLuna","2":"2 — Keyword","3":"3 — P-ChatGPT","4":"4 — P-Google","5":"5 — P-Claude","6":"6 — P-Wikipedia","7":"7 — Empwr"}[defaultSearchEngine] ?? defaultSearchEngine}
                size="small"
                sx={{ backgroundColor: "#8B0000", color: "white" }}
              />
              <Typography variant="caption" color="text.secondary" className="mt-2 block">
                This preference is saved locally and applied when using the AI Search feature.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={7}>
        <Box>
          <Typography variant="h5" className="mb-4">Context Router Configuration</Typography>
          <Paper className="p-6">
            <Box className="flex items-center gap-2 mb-2">
              <Hub className="text-slate-700" />
              <Typography variant="h6">Domain → LLM Mappings</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Define context domains and assign a specific LLM or SLM to handle queries in that domain.
              The Luna Context Router detects the topic of each query and routes it to the assigned model.
              Saved as JSON to localStorage and sent with each context-routed query.
            </Typography>

            <Alert severity="info" className="mb-4">
              Example: route <strong>Medicine</strong> queries to Claude for advanced reasoning, <strong>Sports</strong> to Grok for real-time knowledge, and sensitive domains to a <strong>Custom SLM</strong> for on-premises privacy.
            </Alert>

            {/* Domain rows */}
            <Box className="space-y-2 mb-4">
              {contextRoutes.map((row, idx) => (
                <Box key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded bg-slate-50">
                  <TextField
                    label="Domain"
                    size="small"
                    value={row.domain}
                    onChange={(e) => {
                      const updated = [...contextRoutes];
                      updated[idx] = { ...updated[idx], domain: e.target.value };
                      setContextRoutes(updated);
                      setContextSaved(false);
                    }}
                    sx={{ width: 180 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>LLM / SLM</InputLabel>
                    <Select
                      value={row.llm}
                      label="LLM / SLM"
                      onChange={(e) => {
                        const updated = [...contextRoutes];
                        updated[idx] = { ...updated[idx], llm: e.target.value };
                        setContextRoutes(updated);
                        setContextSaved(false);
                      }}
                    >
                      <MenuItem value="superluna">SuperLuna (Multi-Chain)</MenuItem>
                      <MenuItem value="chatgpt">ChatGPT (Azure)</MenuItem>
                      <MenuItem value="claude">Claude AI (Azure)</MenuItem>
                      <MenuItem value="empowr">USC Empowr</MenuItem>
                      <MenuItem value="grok">Grok AI</MenuItem>
                      <MenuItem value="gemini">Google Gemini</MenuItem>
                      <MenuItem value="custom-slm">Custom SLM (On-Premises)</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setContextRoutes(contextRoutes.filter((_, i) => i !== idx));
                      setContextSaved(false);
                    }}
                    aria-label="Remove domain"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Divider className="my-4" />

            <Box className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outlined"
                startIcon={<Add />}
                size="small"
                onClick={() => {
                  setContextRoutes([...contextRoutes, { domain: "", llm: "superluna" }]);
                  setContextSaved(false);
                }}
                sx={{ borderColor: "#8B0000", color: "#8B0000", "&:hover": { borderColor: "#6B0000", backgroundColor: "rgba(139,0,0,0.04)" } }}
              >
                Add Domain
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  localStorage.setItem("contextRouterConfig", JSON.stringify(contextRoutes));
                  setContextSaved(true);
                }}
                sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" } }}
              >
                Save Mappings
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setContextRoutes(DEFAULT_CONTEXT_ROUTES);
                  setContextSaved(false);
                }}
                sx={{ color: "#64748b" }}
              >
                Reset to Defaults
              </Button>
              {contextSaved && (
                <Box className="flex items-center gap-1 text-green-600">
                  <CheckCircle fontSize="small" />
                  <Typography variant="caption">Saved to localStorage</Typography>
                </Box>
              )}
            </Box>

            {/* Preview */}
            <Box className="mt-6 p-4 bg-slate-900 rounded">
              <Typography variant="caption" className="text-slate-400 block mb-2 font-mono">
                contextRouterConfig (localStorage preview)
              </Typography>
              <Typography variant="caption" className="text-green-400 font-mono whitespace-pre-wrap break-all" component="pre">
                {JSON.stringify(contextRoutes, null, 2)}
              </Typography>
            </Box>
          </Paper>
        </Box>
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