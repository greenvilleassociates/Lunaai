import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Settings,
  PlayArrow,
  Stop,
  Psychology,
  Check,
  Close,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

// LLM Agent Configuration Component
interface LLMAgent {
  id: number;
  name: string;
  provider: string;
  endpoint: string;
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
  priority?: number;
  description?: string;
  configJson?: string;
  entraIdAppId?: string;
  entraIdTenantId?: string;
  entraIdClientSecret?: string;
}

interface AgentConfig {
  id: number;
  agentId: number;
  configKey: string;
  configValue: string;
  description?: string;
}

export function LLMAgentConfig() {
  const [currentTab, setCurrentTab] = useState(0);
  const [agents, setAgents] = useState<LLMAgent[]>([]);
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<LLMAgent | null>(null);

  // Form states
  const [newAgent, setNewAgent] = useState<Partial<LLMAgent>>({
    enabled: true,
    temperature: 0.7,
    maxTokens: 2000,
    priority: 1,
  });
  const [newConfig, setNewConfig] = useState<Partial<AgentConfig>>({});

  // Check if user is superuser or admin
  const currentUserRole = localStorage.getItem("role");
  const isSuperUser = currentUserRole === "superuser";
  const isAdmin = currentUserRole === "admin";

  useEffect(() => {
    if (isSuperUser || isAdmin) {
      loadAgents();
      loadConfigs();
    }
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      // Try loading from API first
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/llmagents");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        console.log("✅ LLM Agents loaded from API");
      } else {
        // Fallback to default agents
        loadDefaultAgents();
      }
    } catch (err) {
      console.error("Failed to load LLM agents:", err);
      loadDefaultAgents();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultAgents = () => {
    const defaultAgents: LLMAgent[] = [
      {
        id: 1,
        name: "ChatGPT (Azure OpenAI)",
        provider: "Azure OpenAI",
        endpoint: "https://lunaai-openai.openai.azure.com/",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
        enabled: true,
        priority: 1,
        description: "GPT-4 model hosted on Azure OpenAI Service for enterprise-grade security and reliability.",
        entraIdAppId: "CHATGPT_ENTRA_APP_ID",
        entraIdTenantId: "CHATGPT_ENTRA_TENANT_ID",
        entraIdClientSecret: "CHATGPT_ENTRA_SECRET",
        configJson: JSON.stringify({
          deploymentName: "gpt-4",
          apiVersion: "2024-02-15-preview",
          systemPrompt: "You are a helpful AI assistant.",
        }, null, 2),
      },
      {
        id: 2,
        name: "Claude AI (Anthropic)",
        provider: "Anthropic via Azure",
        endpoint: "https://lunaai-claude.azurewebsites.net/",
        model: "claude-3-opus-20240229",
        temperature: 0.7,
        maxTokens: 4000,
        enabled: true,
        priority: 2,
        description: "Claude 3 Opus for advanced reasoning and analysis tasks with enhanced context understanding.",
        entraIdAppId: "CLAUDE_ENTRA_APP_ID",
        entraIdTenantId: "CLAUDE_ENTRA_TENANT_ID",
        entraIdClientSecret: "CLAUDE_ENTRA_SECRET",
        configJson: JSON.stringify({
          anthropicApiKey: "ANTHROPIC_API_KEY_PLACEHOLDER",
          modelVersion: "claude-3-opus-20240229",
          systemPrompt: "You are Claude, an AI assistant created by Anthropic.",
          topP: 0.9,
          topK: 40,
        }, null, 2),
      },
      {
        id: 3,
        name: "USC Empowr",
        provider: "USC Empowr Platform",
        endpoint: "https://empowr.usc.edu/api/v1/agent",
        model: "empowr-agent-v1",
        temperature: 0.5,
        maxTokens: 300000,
        enabled: true,
        priority: 3,
        description: "USC Empowr specialized agent processor for educational and research-focused AI tasks with domain expertise.",
        entraIdAppId: "EMPOWR_ENTRA_APP_ID",
        entraIdTenantId: "EMPOWR_ENTRA_TENANT_ID",
        entraIdClientSecret: "EMPOWR_ENTRA_SECRET",
        configJson: JSON.stringify({
          empowrApiKey: "EMPOWR_API_KEY_PLACEHOLDER",
          agentType: "research-assistant",
          domainFocus: "computer-science",
          knowledgeBase: "usc-research-db",
          safetyLevel: "high",
          responseFormat: "structured",
          citationStyle: "apa",
          maxCitations: 10,
          enableFactCheck: true,
          enableSourceTracking: true,
        }, null, 2),
      },
      {
        id: 4,
        name: "Grok AI (xAI)",
        provider: "xAI",
        endpoint: "https://api.x.ai/v1/chat/completions",
        model: "grok-beta",
        temperature: 0.8,
        maxTokens: 4096,
        enabled: true,
        priority: 4,
        description: "Grok AI by xAI with real-time knowledge and witty personality for conversational AI tasks.",
        entraIdAppId: "GROK_ENTRA_APP_ID",
        entraIdTenantId: "GROK_ENTRA_TENANT_ID",
        entraIdClientSecret: "GROK_ENTRA_SECRET",
        configJson: JSON.stringify({
          xaiApiKey: "XAI_API_KEY_PLACEHOLDER",
          model: "grok-beta",
          stream: false,
          realTimeData: true,
          personalityMode: "witty",
          safetySettings: "balanced",
        }, null, 2),
      },
      {
        id: 5,
        name: "Google Gemini",
        provider: "Google AI",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        model: "gemini-pro",
        temperature: 0.7,
        maxTokens: 8192,
        enabled: true,
        priority: 5,
        description: "Google Gemini Pro for multimodal understanding, advanced reasoning, and long-context processing capabilities.",
        entraIdAppId: "GEMINI_ENTRA_APP_ID",
        entraIdTenantId: "GEMINI_ENTRA_TENANT_ID",
        entraIdClientSecret: "GEMINI_ENTRA_SECRET",
        configJson: JSON.stringify({
          googleApiKey: "GOOGLE_API_KEY_PLACEHOLDER",
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ],
          enableCodeExecution: false,
          enableGrounding: false,
        }, null, 2),
      },
    ];
    setAgents(defaultAgents);
    console.log("✅ Default LLM Agents loaded (ChatGPT, Claude, USC Empowr, Grok, Google Gemini)");
  };

  const loadConfigs = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/llmagentconfigs");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
        console.log("✅ Agent configs loaded from API");
      } else {
        setConfigs([]);
      }
    } catch (err) {
      console.error("Failed to load agent configs:", err);
      setConfigs([]);
    }
  };

  const handleAddAgent = async () => {
    if (!newAgent.name || !newAgent.provider || !newAgent.endpoint) {
      setError("Name, provider, and endpoint are required");
      return;
    }

    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/llmagents");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify(newAgent),
      });

      if (response.ok) {
        setSuccess("LLM Agent added successfully!");
        setAgentDialogOpen(false);
        setNewAgent({
          enabled: true,
          temperature: 0.7,
          maxTokens: 2000,
          priority: 1,
        });
        loadAgents();
      } else {
        setError("Failed to add LLM agent");
      }
    } catch (err) {
      setError("Failed to add LLM agent: " + err);
    }
  };

  const handleToggleAgent = async (agentId: number, enabled: boolean) => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(`/api/llmagents/${agentId}`);
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setSuccess(`Agent ${enabled ? "enabled" : "disabled"} successfully!`);
        loadAgents();
      } else {
        setError("Failed to update agent status");
      }
    } catch (err) {
      // Fallback: update locally
      setAgents(agents.map(agent => 
        agent.id === agentId ? { ...agent, enabled } : agent
      ));
      setSuccess(`Agent ${enabled ? "enabled" : "disabled"} (local only)`);
    }
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(`/api/llmagents/${agentId}`);
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        setSuccess("Agent deleted successfully!");
        loadAgents();
      } else {
        setError("Failed to delete agent");
      }
    } catch (err) {
      setError("Failed to delete agent: " + err);
    }
  };

  const handleEditAgent = (agent: LLMAgent) => {
    setSelectedAgent(agent);
    setNewAgent(agent);
    setAgentDialogOpen(true);
  };

  const getAgentConfigs = (agentId: number) => {
    return configs.filter(c => c.agentId === agentId);
  };

  if (!isSuperUser && !isAdmin) {
    return (
      <Box className="max-w-6xl mx-auto">
        <Alert severity="warning">
          Access Denied: LLM Agent Configuration is only available to superusers and admins.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h3" component="h2" className="mb-2">
          LLM Agent Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-3">
          Configure and manage AI agent processors including ChatGPT, Claude AI, USC Empowr, Grok, and Google Gemini.
        </Typography>
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

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Psychology />} label="Agent Processors" iconPosition="start" />
          <Tab icon={<Settings />} label="Configuration Details" iconPosition="start" />
        </Tabs>
      </Box>

      {/* AGENT PROCESSORS TAB */}
      {currentTab === 0 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">LLM Agent Processors</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedAgent(null);
                setNewAgent({
                  enabled: true,
                  temperature: 0.7,
                  maxTokens: 2000,
                  priority: 1,
                });
                setAgentDialogOpen(true);
              }}
              sx={{ 
                backgroundColor: "#8B0000", 
                "&:hover": { backgroundColor: "#a00" } 
              }}
            >
              Add Agent
            </Button>
          </Box>

          {loading ? (
            <Box className="flex justify-center p-8">
              <CircularProgress />
            </Box>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} elevation={3}>
                  <CardContent>
                    <Box className="flex items-center justify-between mb-3">
                      <Box className="flex items-center gap-2">
                        <Psychology color={agent.enabled ? "primary" : "disabled"} />
                        <Typography variant="h6">
                          {agent.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={agent.enabled ? "Active" : "Inactive"} 
                        color={agent.enabled ? "success" : "default"}
                        size="small"
                      />
                    </Box>

                    <Box className="space-y-2 text-sm mb-4">
                      <Box className="flex justify-between">
                        <span className="text-slate-600">Provider:</span>
                        <strong>{agent.provider}</strong>
                      </Box>
                      <Box className="flex justify-between">
                        <span className="text-slate-600">Model:</span>
                        <strong>{agent.model}</strong>
                      </Box>
                      <Box className="flex justify-between">
                        <span className="text-slate-600">Priority:</span>
                        <Chip label={agent.priority || "N/A"} size="small" color="info" />
                      </Box>
                      <Box className="flex justify-between">
                        <span className="text-slate-600">Temp:</span>
                        <strong>{agent.temperature || 0.7}</strong>
                      </Box>
                      <Box className="flex justify-between">
                        <span className="text-slate-600">Max Tokens:</span>
                        <strong>{agent.maxTokens || "N/A"}</strong>
                      </Box>
                    </Box>

                    {agent.description && (
                      <Typography variant="body2" color="text.secondary" className="mb-3 text-xs">
                        {agent.description}
                      </Typography>
                    )}

                    {agent.configJson && (
                      <Box className="mb-3">
                        <Chip 
                          label={`${Object.keys(JSON.parse(agent.configJson)).length} config params`} 
                          size="small" 
                          color="secondary" 
                        />
                      </Box>
                    )}

                    <Box className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agent.enabled}
                            onChange={(e) => handleToggleAgent(agent.id, e.target.checked)}
                            color="success"
                          />
                        }
                        label={agent.enabled ? "Enabled" : "Disabled"}
                      />
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditAgent(agent)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Box>
      )}

      {/* CONFIGURATION DETAILS TAB */}
      {currentTab === 1 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Agent Configuration Details</Typography>
          </Box>

          {agents.map((agent) => (
            <Card key={agent.id} className="mb-4" elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between mb-3">
                  <Typography variant="h6">{agent.name}</Typography>
                  <Chip 
                    label={agent.enabled ? "Active" : "Inactive"} 
                    color={agent.enabled ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Endpoint</Typography>
                    <Typography variant="body2" className="break-all">{agent.endpoint}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Model</Typography>
                    <Typography variant="body2">{agent.model}</Typography>
                  </Box>
                </Box>

                {/* Microsoft EntraID Configuration Display */}
                {(agent.entraIdAppId || agent.entraIdTenantId) && (
                  <Box className="mb-4">
                    <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                      Microsoft EntraID Configuration:
                    </Typography>
                    <Paper elevation={0} className="p-3 bg-blue-50 border border-blue-200">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {agent.entraIdAppId && (
                          <Box>
                            <span className="text-slate-600">App ID:</span>{" "}
                            <strong className="font-mono text-xs">{agent.entraIdAppId}</strong>
                          </Box>
                        )}
                        {agent.entraIdTenantId && (
                          <Box>
                            <span className="text-slate-600">Tenant ID:</span>{" "}
                            <strong className="font-mono text-xs">{agent.entraIdTenantId}</strong>
                          </Box>
                        )}
                        {agent.entraIdClientSecret && (
                          <Box>
                            <span className="text-slate-600">Client Secret:</span>{" "}
                            <strong className="font-mono text-xs">••••••••••••</strong>
                          </Box>
                        )}
                      </div>
                    </Paper>
                  </Box>
                )}

                {agent.configJson && (
                  <Box className="mt-3">
                    <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                      Configuration Parameters:
                    </Typography>
                    <Paper elevation={0} className="p-3 bg-slate-50">
                      <pre className="text-xs overflow-x-auto">
                        {agent.configJson}
                      </pre>
                    </Paper>
                  </Box>
                )}

                {agent.name === "USC Empowr" && (
                  <Alert severity="info" className="mt-3">
                    <Typography variant="body2">
                      <strong>USC Empowr Configuration:</strong> This agent includes specialized parameters for 
                      research assistance, fact-checking, citation generation, and knowledge base integration. 
                      Ensure the USC Empowr API key is configured in your environment variables.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ADD/EDIT AGENT DIALOG */}
      <Dialog open={agentDialogOpen} onClose={() => setAgentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Agent Name *"
                value={newAgent.name || ""}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Provider *"
                value={newAgent.provider || ""}
                onChange={(e) => setNewAgent({ ...newAgent, provider: e.target.value })}
                placeholder="e.g., Azure OpenAI, USC Empowr"
              />
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Endpoint URL *"
                  value={newAgent.endpoint || ""}
                  onChange={(e) => setNewAgent({ ...newAgent, endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1/agent"
                />
              </div>
              <TextField
                fullWidth
                label="Model"
                value={newAgent.model || ""}
                onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                placeholder="e.g., gpt-4, claude-3-opus"
              />
              <TextField
                fullWidth
                label="API Key (Optional)"
                type="password"
                value={newAgent.apiKey || ""}
                onChange={(e) => setNewAgent({ ...newAgent, apiKey: e.target.value })}
              />
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 2 }}
                value={newAgent.temperature || 0.7}
                onChange={(e) => setNewAgent({ ...newAgent, temperature: parseFloat(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={newAgent.maxTokens || 2000}
                onChange={(e) => setNewAgent({ ...newAgent, maxTokens: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Priority"
                type="number"
                value={newAgent.priority || 1}
                onChange={(e) => setNewAgent({ ...newAgent, priority: parseInt(e.target.value) })}
                helperText="Lower number = higher priority"
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newAgent.enabled ? "enabled" : "disabled"}
                  onChange={(e) => setNewAgent({ ...newAgent, enabled: e.target.value === "enabled" })}
                  label="Status"
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={newAgent.description || ""}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                />
              </div>
              
              {/* Microsoft EntraID Configuration */}
              <div className="col-span-2">
                <Typography variant="subtitle2" className="mb-2 text-slate-700">
                  Microsoft EntraID Configuration (for form permissions)
                </Typography>
              </div>
              <TextField
                fullWidth
                label="Entra ID App ID"
                value={newAgent.entraIdAppId || ""}
                onChange={(e) => setNewAgent({ ...newAgent, entraIdAppId: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <TextField
                fullWidth
                label="Entra ID Tenant ID"
                value={newAgent.entraIdTenantId || ""}
                onChange={(e) => setNewAgent({ ...newAgent, entraIdTenantId: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <TextField
                fullWidth
                label="Entra ID Client Secret"
                type="password"
                value={newAgent.entraIdClientSecret || ""}
                onChange={(e) => setNewAgent({ ...newAgent, entraIdClientSecret: e.target.value })}
                placeholder="Enter client secret"
              />
              <div></div> {/* Spacer */}
              
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Configuration JSON (Optional)"
                  multiline
                  rows={6}
                  value={newAgent.configJson || ""}
                  onChange={(e) => setNewAgent({ ...newAgent, configJson: e.target.value })}
                  placeholder='{"apiKey": "xxx", "setting": "value"}'
                  helperText="Enter valid JSON configuration for this agent"
                />
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddAgent} 
            variant="contained"
            sx={{ 
              backgroundColor: "#8B0000", 
              "&:hover": { backgroundColor: "#a00" } 
            }}
          >
            {selectedAgent ? "Update Agent" : "Add Agent"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}