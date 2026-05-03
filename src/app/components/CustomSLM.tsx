import { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
  IconButton,
  Chip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Memory,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

// Custom SLM (Small Language Model) Configuration
interface CustomSLM {
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
  modelSize?: string; // e.g., "7B", "13B", "70B"
  quantization?: string; // e.g., "4-bit", "8-bit", "fp16"
  contextWindow?: number;
  localDeployment?: boolean;
  configJson?: string;
}

export function CustomSLM() {
  const [slms, setSlms] = useState<CustomSLM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSLM, setSelectedSLM] = useState<CustomSLM | null>(null);

  // Form states
  const [newSLM, setNewSLM] = useState<Partial<CustomSLM>>({
    enabled: true,
    temperature: 0.7,
    maxTokens: 2048,
    priority: 1,
    localDeployment: false,
    contextWindow: 4096,
  });

  // Check if user is superuser or admin
  const currentUserRole = localStorage.getItem("role");
  const isSuperUser = currentUserRole === "superuser";
  const isAdmin = currentUserRole === "admin";

  useEffect(() => {
    if (isSuperUser || isAdmin) {
      loadSLMs();
    }
  }, []);

  const loadSLMs = async () => {
    setLoading(true);
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/customslms");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSlms(data);
        console.log("✅ Custom SLMs loaded from API");
      } else {
        loadDefaultSLMs();
      }
    } catch (err) {
      console.error("Failed to load custom SLMs:", err);
      loadDefaultSLMs();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSLMs = () => {
    const defaultSLMs: CustomSLM[] = [
      {
        id: 1,
        name: "Llama 3.1 70B",
        provider: "Meta / Local Deployment",
        endpoint: "http://localhost:8080/v1/completions",
        model: "llama-3.1-70b-instruct",
        temperature: 0.7,
        maxTokens: 4096,
        enabled: true,
        priority: 1,
        description: "Meta's Llama 3.1 70B parameter model with instruction tuning for high-quality reasoning.",
        modelSize: "70B",
        quantization: "4-bit",
        contextWindow: 8192,
        localDeployment: true,
        configJson: JSON.stringify({
          format: "llama",
          systemPrompt: "You are a helpful AI assistant.",
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
        }, null, 2),
      },
      {
        id: 2,
        name: "Mistral 7B Instruct",
        provider: "Mistral AI / HuggingFace",
        endpoint: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        model: "Mistral-7B-Instruct-v0.2",
        temperature: 0.7,
        maxTokens: 2048,
        enabled: true,
        priority: 2,
        description: "Efficient 7B parameter model optimized for instruction following and fast inference.",
        modelSize: "7B",
        quantization: "fp16",
        contextWindow: 8192,
        localDeployment: false,
        configJson: JSON.stringify({
          huggingfaceApiKey: "HF_API_KEY_PLACEHOLDER",
          maxNewTokens: 2048,
          returnFullText: false,
        }, null, 2),
      },
      {
        id: 3,
        name: "Phi-3 Mini",
        provider: "Microsoft",
        endpoint: "http://localhost:11434/api/generate",
        model: "phi3:mini",
        temperature: 0.7,
        maxTokens: 2048,
        enabled: true,
        priority: 3,
        description: "Microsoft's compact 3.8B parameter model with strong performance on reasoning tasks.",
        modelSize: "3.8B",
        quantization: "4-bit",
        contextWindow: 4096,
        localDeployment: true,
        configJson: JSON.stringify({
          ollamaEndpoint: "http://localhost:11434",
          stream: false,
        }, null, 2),
      },
    ];
    setSlms(defaultSLMs);
    console.log("✅ Default Custom SLMs loaded (Llama, Mistral, Phi-3)");
  };

  const handleAddSLM = async () => {
    if (!newSLM.name || !newSLM.provider || !newSLM.endpoint) {
      setError("Name, provider, and endpoint are required");
      return;
    }

    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/customslms");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify(newSLM),
      });

      if (response.ok) {
        setSuccess("Custom SLM added successfully!");
        setDialogOpen(false);
        setNewSLM({
          enabled: true,
          temperature: 0.7,
          maxTokens: 2048,
          priority: 1,
          localDeployment: false,
          contextWindow: 4096,
        });
        loadSLMs();
      } else {
        setError("Failed to add custom SLM");
      }
    } catch (err) {
      setError("Failed to add custom SLM: " + err);
    }
  };

  const handleToggleSLM = async (slmId: number, enabled: boolean) => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(`/api/customslms/${slmId}`);
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setSuccess(`SLM ${enabled ? "enabled" : "disabled"} successfully!`);
        loadSLMs();
      } else {
        setError("Failed to update SLM status");
      }
    } catch (err) {
      setSlms(slms.map(slm => 
        slm.id === slmId ? { ...slm, enabled } : slm
      ));
      setSuccess(`SLM ${enabled ? "enabled" : "disabled"} (local only)`);
    }
  };

  const handleDeleteSLM = async (slmId: number) => {
    if (!confirm("Are you sure you want to delete this SLM?")) return;

    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(`/api/customslms/${slmId}`);
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        setSuccess("SLM deleted successfully!");
        loadSLMs();
      } else {
        setError("Failed to delete SLM");
      }
    } catch (err) {
      setError("Failed to delete SLM: " + err);
    }
  };

  const handleEditSLM = (slm: CustomSLM) => {
    setSelectedSLM(slm);
    setNewSLM(slm);
    setDialogOpen(true);
  };

  if (!isSuperUser && !isAdmin) {
    return (
      <Box className="max-w-6xl mx-auto">
        <Alert severity="warning">
          Access Denied: Custom SLM Configuration is only available to superusers and admins.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h3" component="h2" className="mb-2">
          Custom Small Language Models (SLMs)
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-3">
          Configure and manage custom SLMs including Llama, Mistral, Phi-3, and other open-source models.
        </Typography>
        <Alert severity="info" className="mt-3">
          <Typography variant="body2">
            <strong>Small Language Models (SLMs)</strong> are compact, efficient AI models that can run locally
            or on lightweight infrastructure. Perfect for cost-effective, privacy-focused, and low-latency applications.
          </Typography>
        </Alert>
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

      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5">Configured SLMs</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedSLM(null);
            setNewSLM({
              enabled: true,
              temperature: 0.7,
              maxTokens: 2048,
              priority: 1,
              localDeployment: false,
              contextWindow: 4096,
            });
            setDialogOpen(true);
          }}
          sx={{
            backgroundColor: "#8B0000",
            "&:hover": { backgroundColor: "#a00" },
          }}
        >
          Add Custom SLM
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center p-8">
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {slms.map((slm) => (
            <Card key={slm.id} elevation={3}>
              <CardContent>
                <Box className="flex items-center justify-between mb-3">
                  <Box className="flex items-center gap-2">
                    <Memory color={slm.enabled ? "primary" : "disabled"} fontSize="large" />
                    <Typography variant="h6">{slm.name}</Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    {slm.localDeployment && (
                      <Chip label="Local" size="small" color="success" />
                    )}
                    <Chip 
                      label={slm.enabled ? "Active" : "Inactive"} 
                      color={slm.enabled ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box className="space-y-2 text-sm mb-4">
                  <Box className="flex justify-between">
                    <span className="text-slate-600">Provider:</span>
                    <strong>{slm.provider}</strong>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-slate-600">Model:</span>
                    <strong>{slm.model}</strong>
                  </Box>
                  {slm.modelSize && (
                    <Box className="flex justify-between">
                      <span className="text-slate-600">Size:</span>
                      <Chip label={slm.modelSize} size="small" color="primary" />
                    </Box>
                  )}
                  {slm.quantization && (
                    <Box className="flex justify-between">
                      <span className="text-slate-600">Quantization:</span>
                      <Chip label={slm.quantization} size="small" color="secondary" />
                    </Box>
                  )}
                  <Box className="flex justify-between">
                    <span className="text-slate-600">Context Window:</span>
                    <strong>{slm.contextWindow?.toLocaleString() || "N/A"} tokens</strong>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-slate-600">Max Tokens:</span>
                    <strong>{slm.maxTokens?.toLocaleString() || "N/A"}</strong>
                  </Box>
                </Box>

                {slm.description && (
                  <Typography variant="body2" color="text.secondary" className="mb-3 text-xs">
                    {slm.description}
                  </Typography>
                )}

                <Box className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={slm.enabled}
                        onChange={(e) => handleToggleSLM(slm.id, e.target.checked)}
                        color="success"
                      />
                    }
                    label={slm.enabled ? "Enabled" : "Disabled"}
                  />
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditSLM(slm)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteSLM(slm.id)}
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

      {/* ADD/EDIT SLM DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedSLM ? "Edit SLM" : "Add Custom SLM"}</DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="SLM Name *"
                value={newSLM.name || ""}
                onChange={(e) => setNewSLM({ ...newSLM, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Provider *"
                value={newSLM.provider || ""}
                onChange={(e) => setNewSLM({ ...newSLM, provider: e.target.value })}
                placeholder="e.g., Meta, Mistral AI, Microsoft"
              />
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Endpoint URL *"
                  value={newSLM.endpoint || ""}
                  onChange={(e) => setNewSLM({ ...newSLM, endpoint: e.target.value })}
                  placeholder="http://localhost:8080/v1/completions"
                />
              </div>
              <TextField
                fullWidth
                label="Model *"
                value={newSLM.model || ""}
                onChange={(e) => setNewSLM({ ...newSLM, model: e.target.value })}
                placeholder="e.g., llama-3.1-70b, mistral-7b"
              />
              <TextField
                fullWidth
                label="Model Size"
                value={newSLM.modelSize || ""}
                onChange={(e) => setNewSLM({ ...newSLM, modelSize: e.target.value })}
                placeholder="e.g., 7B, 13B, 70B"
              />
              <TextField
                fullWidth
                label="Quantization"
                value={newSLM.quantization || ""}
                onChange={(e) => setNewSLM({ ...newSLM, quantization: e.target.value })}
                placeholder="e.g., 4-bit, 8-bit, fp16"
              />
              <TextField
                fullWidth
                label="Context Window"
                type="number"
                value={newSLM.contextWindow || 4096}
                onChange={(e) => setNewSLM({ ...newSLM, contextWindow: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 2 }}
                value={newSLM.temperature || 0.7}
                onChange={(e) => setNewSLM({ ...newSLM, temperature: parseFloat(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={newSLM.maxTokens || 2048}
                onChange={(e) => setNewSLM({ ...newSLM, maxTokens: parseInt(e.target.value) })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newSLM.localDeployment || false}
                    onChange={(e) => setNewSLM({ ...newSLM, localDeployment: e.target.checked })}
                  />
                }
                label="Local Deployment"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newSLM.enabled || false}
                    onChange={(e) => setNewSLM({ ...newSLM, enabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={newSLM.description || ""}
                  onChange={(e) => setNewSLM({ ...newSLM, description: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <TextField
                  fullWidth
                  label="Configuration JSON (Optional)"
                  multiline
                  rows={6}
                  value={newSLM.configJson || ""}
                  onChange={(e) => setNewSLM({ ...newSLM, configJson: e.target.value })}
                  placeholder='{"format": "llama", "topP": 0.9}'
                  helperText="Enter valid JSON configuration for this SLM"
                />
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddSLM} 
            variant="contained"
            sx={{ 
              backgroundColor: "#8B0000", 
              "&:hover": { backgroundColor: "#a00" } 
            }}
          >
            {selectedSLM ? "Update SLM" : "Add SLM"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
