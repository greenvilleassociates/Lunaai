import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Switch,
  Alert,
  Chip,
  Paper,
  Divider,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import {
  DragIndicator,
  ArrowUpward,
  ArrowDownward,
  Psychology,
  CheckCircle,
  Cancel,
  ExpandMore,
  Public,
  Business,
  PointOfSale,
  Lock,
  Memory,
  Settings,
  PersonOutlineOutlined,
  CorporateFare,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import superLunaIcon from "figma:asset/cfadca739638cf837cbfaf51361c717172db777b.png";

interface LLMPreference {
  id: number;
  name: string;
  provider: string;
  model: string;
  enabled: boolean;
  priority: number;
  maxTokens?: number;
  isSlm?: boolean;
}

interface SectionConfig {
  name: string;
  slmPrivacy: boolean;
  defaultToSLM: boolean;
  fallbackLLM: string;
  preferences: LLMPreference[];
}

export function SuperLuna() {
  // Global Section
  const [globalPreferences, setGlobalPreferences] = useState<LLMPreference[]>([]);
  const [globalSlmPrivacy, setGlobalSlmPrivacy] = useState(false);
  const [globalDefaultToSLM, setGlobalDefaultToSLM] = useState(false);
  const [globalFallback, setGlobalFallback] = useState("ChatGPT (Azure OpenAI)");

  // Local ERP Section
  const [erpPreferences, setErpPreferences] = useState<LLMPreference[]>([]);
  const [erpSlmPrivacy, setErpSlmPrivacy] = useState(true);
  const [erpDefaultToSLM, setErpDefaultToSLM] = useState(true);
  const [erpFallback, setErpFallback] = useState("ChatGPT (Azure OpenAI)");

  // Accounting Sales Section
  const [accountingPreferences, setAccountingPreferences] = useState<LLMPreference[]>([]);
  const [accountingSlmPrivacy, setAccountingSlmPrivacy] = useState(true);
  const [accountingDefaultToSLM, setAccountingDefaultToSLM] = useState(true);
  const [accountingFallback, setAccountingFallback] = useState("ChatGPT (Azure OpenAI)");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [useCompanyDefaults, setUseCompanyDefaults] = useState(true);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminTabValue, setAdminTabValue] = useState(0);

  const username = localStorage.getItem("username") || "User";
  const uid = localStorage.getItem("uid");
  const userRole = localStorage.getItem("role");
  const isSuperUser = userRole === "superuser";
  const isAdmin = userRole === "admin";
  const companyId = localStorage.getItem("company_id"); // Assuming company_id is stored
  const isCorporateUser = !!companyId && companyId !== "null";

  useEffect(() => {
    loadUserPreferences();
  }, [useCompanyDefaults]);

  const loadUserPreferences = async () => {
    setLoading(true);
    try {
      let preferencesLoaded = false;

      // If corporate user and using company defaults
      if (isCorporateUser && useCompanyDefaults) {
        const companyUrl = getApiUrl(`/api/companyllmpreferences/${companyId}`);
        const companyResponse = await fetch(companyUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
        });

        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          applyPreferences(companyData);
          preferencesLoaded = true;
          console.log("✅ Company LLM preferences loaded");
        }
      }

      // If not using company defaults or company load failed, load personal preferences
      if (!preferencesLoaded) {
        const userUrl = getApiUrl(`/api/userllmpreferences/${uid}`);
        const userResponse = await fetch(userUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          applyPreferences(userData);
          preferencesLoaded = true;
          console.log("✅ Personal LLM preferences loaded");
        }
      }

      // Fallback to defaults if nothing loaded
      if (!preferencesLoaded) {
        loadDefaultPreferences();
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
      loadDefaultPreferences();
    } finally {
      setLoading(false);
    }
  };

  const applyPreferences = (data: any) => {
    setGlobalPreferences(data.global || getDefaultGlobalPreferences());
    setErpPreferences(data.erp || getDefaultEnterprisePreferences());
    setAccountingPreferences(data.accounting || getDefaultEnterprisePreferences());
    
    setGlobalSlmPrivacy(data.globalSlmPrivacy ?? false);
    setErpSlmPrivacy(data.erpSlmPrivacy ?? true);
    setAccountingSlmPrivacy(data.accountingSlmPrivacy ?? true);
    
    setGlobalFallback(data.globalFallback || "ChatGPT (Azure OpenAI)");
    setErpFallback(data.erpFallback || "ChatGPT (Azure OpenAI)");
    setAccountingFallback(data.accountingFallback || "ChatGPT (Azure OpenAI)");
  };

  const getDefaultGlobalPreferences = (): LLMPreference[] => {
    return [
      {
        id: 3,
        name: "USC Empowr",
        provider: "USC Empowr Platform",
        model: "empowr-agent-v1",
        enabled: true,
        priority: 1,
        maxTokens: 300000,
        isSlm: false,
      },
      {
        id: 1,
        name: "ChatGPT (Azure OpenAI)",
        provider: "Azure OpenAI",
        model: "gpt-4",
        enabled: true,
        priority: 2,
        maxTokens: 2000,
        isSlm: false,
      },
      {
        id: 2,
        name: "Claude AI (Anthropic)",
        provider: "Anthropic via Azure",
        model: "claude-3-opus-20240229",
        enabled: true,
        priority: 3,
        maxTokens: 4000,
        isSlm: false,
      },
      {
        id: 4,
        name: "Grok AI (xAI)",
        provider: "xAI",
        model: "grok-beta",
        enabled: true,
        priority: 4,
        maxTokens: 4096,
        isSlm: false,
      },
      {
        id: 5,
        name: "Google Gemini",
        provider: "Google AI",
        model: "gemini-pro",
        enabled: true,
        priority: 5,
        maxTokens: 8192,
        isSlm: false,
      },
      {
        id: 6,
        name: "Llama 3.1 70B (SLM)",
        provider: "Meta / Local",
        model: "llama-3.1-70b",
        enabled: false,
        priority: 6,
        maxTokens: 4096,
        isSlm: true,
      },
      {
        id: 7,
        name: "Mistral 7B (SLM)",
        provider: "Mistral AI",
        model: "mistral-7b",
        enabled: false,
        priority: 7,
        maxTokens: 2048,
        isSlm: true,
      },
      {
        id: 8,
        name: "Phi-3 Mini (SLM)",
        provider: "Microsoft",
        model: "phi3:mini",
        enabled: false,
        priority: 8,
        maxTokens: 2048,
        isSlm: true,
      },
    ];
  };

  const getDefaultEnterprisePreferences = (): LLMPreference[] => {
    // For ERP and Accounting: SLMs first, ChatGPT last
    return [
      {
        id: 6,
        name: "Llama 3.1 70B (SLM)",
        provider: "Meta / Local",
        model: "llama-3.1-70b",
        enabled: true,
        priority: 1,
        maxTokens: 4096,
        isSlm: true,
      },
      {
        id: 7,
        name: "Mistral 7B (SLM)",
        provider: "Mistral AI",
        model: "mistral-7b",
        enabled: true,
        priority: 2,
        maxTokens: 2048,
        isSlm: true,
      },
      {
        id: 8,
        name: "Phi-3 Mini (SLM)",
        provider: "Microsoft",
        model: "phi3:mini",
        enabled: true,
        priority: 3,
        maxTokens: 2048,
        isSlm: true,
      },
      {
        id: 1,
        name: "ChatGPT (Azure OpenAI)",
        provider: "Azure OpenAI",
        model: "gpt-4",
        enabled: true,
        priority: 4,
        maxTokens: 2000,
        isSlm: false,
      },
    ];
  };

  const loadDefaultPreferences = () => {
    setGlobalPreferences(getDefaultGlobalPreferences());
    setErpPreferences(getDefaultEnterprisePreferences());
    setAccountingPreferences(getDefaultEnterprisePreferences());
    console.log(" Default LLM preferences loaded");
  };

  const handleToggle = (section: string, id: number, enabled: boolean) => {
    const updatePreferences = (prefs: LLMPreference[]) =>
      prefs.map((pref) => (pref.id === id ? { ...pref, enabled } : pref));

    if (section === "global") setGlobalPreferences(updatePreferences(globalPreferences));
    if (section === "erp") setErpPreferences(updatePreferences(erpPreferences));
    if (section === "accounting") setAccountingPreferences(updatePreferences(accountingPreferences));

    setSuccess(`${enabled ? "Enabled" : "Disabled"} in ${section} section!`);
  };

  const movePriority = (section: string, id: number, direction: "up" | "down") => {
    const updateSection = (prefs: LLMPreference[]) => {
      const index = prefs.findIndex((p) => p.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prefs.length - 1)
      ) {
        return prefs;
      }

      const newPreferences = [...prefs];
      const swapIndex = direction === "up" ? index - 1 : index + 1;

      // Swap priorities
      const tempPriority = newPreferences[index].priority;
      newPreferences[index].priority = newPreferences[swapIndex].priority;
      newPreferences[swapIndex].priority = tempPriority;

      // Swap positions
      [newPreferences[index], newPreferences[swapIndex]] = [
        newPreferences[swapIndex],
        newPreferences[index],
      ];

      return newPreferences;
    };

    if (section === "global") setGlobalPreferences(updateSection(globalPreferences));
    if (section === "erp") setErpPreferences(updateSection(erpPreferences));
    if (section === "accounting") setAccountingPreferences(updateSection(accountingPreferences));

    setSuccess(`Priority updated in ${section} section!`);
  };

  const savePreferences = async () => {
    try {
      const url = getApiUrl("/api/userllmpreferences");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify({
          global: globalPreferences,
          erp: erpPreferences,
          accounting: accountingPreferences,
          globalSlmPrivacy,
          erpSlmPrivacy,
          accountingSlmPrivacy,
          globalFallback,
          erpFallback,
          accountingFallback,
        }),
      });

      if (response.ok) {
        setSuccess("All preferences saved successfully!");
      } else {
        setError("Failed to save preferences to server (saved locally)");
      }
    } catch (err) {
      setError("Failed to save preferences to server (saved locally)");
    }
  };

  const renderPreferenceSection = (
    sectionName: string,
    preferences: LLMPreference[],
    slmPrivacy: boolean,
    setSlmPrivacy: (value: boolean) => void,
    defaultToSLM: boolean,
    setDefaultToSLM: (value: boolean) => void,
    fallback: string,
    setFallback: (value: string) => void,
    icon: React.ReactNode
  ) => {
    const hasSLMInstalled = preferences.some(p => p.isSlm && p.enabled);
    const availableLLMs = preferences.filter(p => !p.isSlm).map(p => p.name);

    return (
      <Accordion defaultExpanded>
        <AccordionSummary 
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{ 
            '& .MuiAccordionSummary-content': { 
              color: 'white' 
            }
          }}
        >
          <Box className="flex items-center gap-3">
            {icon}
            <Typography variant="h6" sx={{ color: 'white' }}>{sectionName}</Typography>
            {slmPrivacy && <Chip label="SLM Privacy" color="success" size="small" icon={<Lock />} />}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* Preferences List */}
          <div className="space-y-3 mb-4">
            {preferences.map((pref, index) => (
              <Card
                key={pref.id}
                elevation={pref.enabled ? 3 : 1}
                className={`${
                  pref.enabled ? "border-2 border-blue-300" : "opacity-70"
                } ${pref.isSlm ? "bg-green-50" : ""}`}
              >
                <CardContent>
                  <Box className="flex items-center justify-between">
                    {/* Priority Number & Drag Handle */}
                    <Box className="flex items-center gap-3">
                      <Box className="flex flex-col items-center">
                        <Chip
                          label={`#${pref.priority}`}
                          color="primary"
                          size="small"
                          className="mb-1"
                        />
                        <DragIndicator className="text-slate-400 cursor-move" />
                      </Box>

                      {/* LLM Info */}
                      <Box className="flex items-center gap-3">
                        {pref.isSlm ? (
                          <Memory fontSize="medium" className={pref.enabled ? "text-green-600" : "text-slate-400"} />
                        ) : (
                          <Psychology fontSize="medium" className={pref.enabled ? "text-blue-600" : "text-slate-400"} />
                        )}
                        <Box>
                          <Typography sx={{ fontSize: '11pt', fontWeight: 500 }} className="mb-1">
                            {pref.name}
                          </Typography>
                          <Box className="flex items-center gap-2">
                            <Typography component="span" sx={{ fontSize: '9pt', color: '#64748b' }}>
                              {pref.provider}
                            </Typography>
                            <Typography component="span" sx={{ fontSize: '9pt', color: '#64748b' }}>
                              • {pref.model}
                            </Typography>
                            {pref.maxTokens && (
                              <Typography component="span" sx={{ fontSize: '9pt', color: '#64748b' }}>
                                • {pref.maxTokens.toLocaleString()} tokens
                              </Typography>
                            )}
                            {pref.isSlm && (
                              <Chip label="SLM" size="small" color="success" sx={{ fontSize: '8pt', height: '18px' }} />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Controls */}
                    <Box className="flex items-center gap-2">
                      {/* Priority Up/Down */}
                      <Box className="flex flex-col">
                        <IconButton
                          size="small"
                          onClick={() => movePriority(sectionName.toLowerCase().split(" ")[0], pref.id, "up")}
                          disabled={index === 0}
                          color="primary"
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => movePriority(sectionName.toLowerCase().split(" ")[0], pref.id, "down")}
                          disabled={index === preferences.length - 1}
                          color="primary"
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                      </Box>

                      <Divider orientation="vertical" flexItem className="mx-2" />

                      {/* Enable/Disable */}
                      <Box className="flex items-center gap-2">
                        {pref.enabled ? (
                          <CheckCircle className="text-green-600" />
                        ) : (
                          <Cancel className="text-slate-400" />
                        )}
                        <Switch
                          checked={pref.enabled}
                          onChange={(e) => handleToggle(sectionName.toLowerCase().split(" ")[0], pref.id, e.target.checked)}
                          color="success"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SLM Privacy Settings - Only show for non-Global sections */}
          {sectionName !== "Global Section" && (
            <Paper className="p-4 bg-slate-50">
              <Typography variant="subtitle1" className="mb-3 font-semibold flex items-center gap-2">
                <Memory /> Enterprise Privacy Settings
              </Typography>
              
              <Box className="flex items-center justify-between gap-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={slmPrivacy}
                      onChange={(e) => setSlmPrivacy(e.target.checked)}
                      color="success"
                    />
                  }
                  label="Enable SLM Privacy for Enterprise Requests"
                />
                
                <FormControl sx={{ maxWidth: '400px', minWidth: '300px' }}>
                  <InputLabel>Fallback LLM</InputLabel>
                  <Select
                    value={fallback}
                    onChange={(e) => setFallback(e.target.value)}
                    label="Fallback LLM"
                    size="small"
                  >
                    {availableLLMs.map(llm => (
                      <MenuItem key={llm} value={llm}>{llm}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="body2" color="text.secondary" className="mt-2 ml-14">
                When enabled, SuperLuna will prioritize local Small Language Models (SLMs) to keep sensitive data on-premises
              </Typography>

              {!hasSLMInstalled && slmPrivacy && (
                <Alert severity="warning" className="mt-3">
                  <strong>No SLM Installed:</strong> SuperLuna will default to {fallback || "ChatGPT (Azure OpenAI)"} 
                  since no local SLMs are currently enabled. Enable SLMs below or in Settings → Custom SLM.
                </Alert>
              )}
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box className="max-w-6xl mx-auto">
      {/* Header with SuperLuna Icon */}
      <Box className="mb-6">
        <Box className="flex items-center gap-4 mb-4">
          <img
            src={superLunaIcon}
            alt="SuperLuna"
            className="h-24 w-24 rounded-full object-cover shadow-lg border-4 border-yellow-400"
          />
          <Box className="flex-1">
            <Typography variant="h3" component="h1" className="mb-2">
              SuperLuna AI Orchestrator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your personal LLM partner priorities for {username}
            </Typography>
          </Box>
          
          {/* Company Admin Controls */}
          {(isSuperUser || isAdmin) && isCorporateUser && (
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setShowAdminDialog(true)}
              sx={{
                borderColor: "#8B0000",
                color: "#8B0000",
                "&:hover": { borderColor: "#a00", backgroundColor: "#fff5f5" },
              }}
            >
              Configure Company Defaults
            </Button>
          )}
        </Box>

        {/* Company vs Personal Toggle */}
        {isCorporateUser && (
          <Paper className="p-4 mb-4 bg-amber-50 border border-amber-300">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography variant="subtitle1" className="font-semibold mb-1 flex items-center gap-2">
                  {useCompanyDefaults ? (
                    <>
                      <CorporateFare color="primary" />
                      Using Company Defaults
                    </>
                  ) : (
                    <>
                      <PersonOutlineOutlined color="secondary" />
                      Using Personal Preferences
                    </>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {useCompanyDefaults
                    ? "Your settings are inherited from your company's configuration. Toggle off to customize."
                    : "You are using personal preferences. Toggle on to use company defaults."}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={useCompanyDefaults}
                    onChange={(e) => setUseCompanyDefaults(e.target.checked)}
                    color="primary"
                  />
                }
                label={useCompanyDefaults ? "Company" : "Personal"}
              />
            </Box>
          </Paper>
        )}

        {/* Non-Corporate User Notice */}
        {!isCorporateUser && (
          <Paper className="p-4 mb-4 bg-slate-50 border border-slate-300">
            <Box className="flex items-center gap-2">
              <PersonOutline color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>Personal Account:</strong> You are not associated with a company. These are your personal SuperLuna preferences.
              </Typography>
            </Box>
          </Paper>
        )}

        <Paper className="p-4 bg-blue-50 border border-blue-200">
          <Typography variant="body2" className="text-slate-700">
            <strong>🦸‍♀️ SuperLuna</strong> intelligently routes your AI requests to your preferred LLM partners
            based on the priority order you set. Configure separate preferences for Global, ERP, and Accounting/Sales workflows.
            Enable SLM Privacy to keep enterprise data on-premises with local Small Language Models.
          </Typography>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} className="mb-4">
          {success}
        </Alert>
      )}

      {/* Save All Button */}
      <Box className="flex justify-end mb-4">
        <Button
          variant="contained"
          onClick={savePreferences}
          size="large"
          sx={{
            backgroundColor: "#8B0000",
            "&:hover": { backgroundColor: "#a00" },
          }}
        >
          Save All Preferences
        </Button>
      </Box>

      {/* Section Accordions */}
      <Box className="space-y-6">
        {/* Global Section */}
        <Card 
          sx={{ 
            backgroundColor: '#1e293b',
            border: '2px solid #475569',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" className="mb-4 flex items-center gap-3" sx={{ color: 'white' }}>
              <Public fontSize="large" color="primary" />
              Global
            </Typography>
            {renderPreferenceSection(
              "Global Section",
              globalPreferences,
              globalSlmPrivacy,
              setGlobalSlmPrivacy,
              globalDefaultToSLM,
              setGlobalDefaultToSLM,
              globalFallback,
              setGlobalFallback,
              <Public color="primary" />
            )}
          </CardContent>
        </Card>

        {/* ERP Tools Section */}
        <Card 
          sx={{ 
            backgroundColor: '#1e293b',
            border: '2px solid #475569',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" className="mb-4 flex items-center gap-3" sx={{ color: 'white' }}>
              <Business fontSize="large" color="success" />
              ERP Tools
            </Typography>
            {renderPreferenceSection(
              "ERP Section",
              erpPreferences,
              erpSlmPrivacy,
              setErpSlmPrivacy,
              erpDefaultToSLM,
              setErpDefaultToSLM,
              erpFallback,
              setErpFallback,
              <Business color="success" />
            )}
          </CardContent>
        </Card>

        {/* Sales & Accounting Processes Section */}
        <Card 
          sx={{ 
            backgroundColor: '#1e293b',
            border: '2px solid #475569',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h4" className="mb-4 flex items-center gap-3" sx={{ color: 'white' }}>
              <PointOfSale fontSize="large" color="secondary" />
              Sales & Accounting Processes
            </Typography>
            {renderPreferenceSection(
              "Accounting Section",
              accountingPreferences,
              accountingSlmPrivacy,
              setAccountingSlmPrivacy,
              accountingDefaultToSLM,
              setAccountingDefaultToSLM,
              accountingFallback,
              setAccountingFallback,
              <PointOfSale color="secondary" />
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Help Text */}
      <Alert severity="info" className="mt-6">
        <Typography variant="body2">
          <strong>How it works:</strong> SuperLuna routes requests based on context (Global, ERP, or Accounting).
          When SLM Privacy is enabled, she prioritizes local SLMs to keep data secure. If no SLM is available,
          she falls back to your selected cloud LLM (default: ChatGPT). Disabled LLMs are automatically skipped.
        </Typography>
      </Alert>

      {/* Company Admin Configuration Dialog */}
      <Dialog 
        open={showAdminDialog} 
        onClose={() => setShowAdminDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box className="flex items-center gap-2">
            <CorporateFare color="primary" />
            <Typography variant="h5">Configure Company-Wide SuperLuna Defaults</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            These settings will be applied to all users in your company by default. 
            Users can choose to override with personal preferences.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" className="mb-4">
            <strong>Admin Configuration:</strong> Changes made here will affect all company users 
            who are using "Company Defaults" mode. Individual users can opt out and use personal preferences.
          </Alert>
          
          <Box className="space-y-4 mt-4">
            {renderPreferenceSection(
              "Global Section",
              globalPreferences,
              globalSlmPrivacy,
              setGlobalSlmPrivacy,
              globalDefaultToSLM,
              setGlobalDefaultToSLM,
              globalFallback,
              setGlobalFallback,
              <Public color="primary" />
            )}

            {renderPreferenceSection(
              "ERP Section",
              erpPreferences,
              erpSlmPrivacy,
              setErpSlmPrivacy,
              erpDefaultToSLM,
              setErpDefaultToSLM,
              erpFallback,
              setErpFallback,
              <Business color="success" />
            )}

            {renderPreferenceSection(
              "Accounting Section",
              accountingPreferences,
              accountingSlmPrivacy,
              setAccountingSlmPrivacy,
              accountingDefaultToSLM,
              setAccountingDefaultToSLM,
              accountingFallback,
              setAccountingFallback,
              <PointOfSale color="secondary" />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdminDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const url = getApiUrl(`/api/companyllmpreferences/${companyId}`);
                
                const response = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(uid && { Authorization: `Bearer ${uid}` }),
                  },
                  body: JSON.stringify({
                    companyId,
                    global: globalPreferences,
                    erp: erpPreferences,
                    accounting: accountingPreferences,
                    globalSlmPrivacy,
                    erpSlmPrivacy,
                    accountingSlmPrivacy,
                    globalFallback,
                    erpFallback,
                    accountingFallback,
                  }),
                });

                if (response.ok) {
                  setSuccess("Company-wide defaults saved successfully!");
                  setShowAdminDialog(false);
                } else {
                  setError("Failed to save company defaults");
                }
              } catch (err) {
                setError("Failed to save company defaults");
              }
            }}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#a00" },
            }}
          >
            Save Company Defaults
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}