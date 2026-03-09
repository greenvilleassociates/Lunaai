import { useState, useEffect } from "react";
import {
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
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Storage, Add, ExpandMore } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface Instance {
  id: number;
  description: string;
  companyid: string;
  oracleid: string;
  ncrid: string;
  alohaid: string;
  shardid1: string;
  shardid2: string;
  shardid3: string;
  shardid4: string;
  shardid5: string;
  shardid6: string;
  shardid7: string;
  shardid8: string;
  shardid9: string;
  shardid10: string;
}

interface Company {
  id: number;
  companyname: string;
}

export function InstanceManagement() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentInstanceId, setCurrentInstanceId] = useState<number | null>(null);

  // New instance form state
  const [newInstance, setNewInstance] = useState({
    description: "",
    companyid: "",
    oracleid: "",
    ncrid: "",
    alohaid: "",
    shardid1: "",
    shardid2: "",
    shardid3: "",
    shardid4: "",
    shardid5: "",
    shardid6: "",
    shardid7: "",
    shardid8: "",
    shardid9: "",
    shardid10: "",
  });

  // Get current user info
  const currentUserRole = localStorage.getItem("role");
  const currentUserCompanyId = localStorage.getItem("companyId");
  const isSuperUser = currentUserRole === "superuser";
  const isManager = currentUserRole === "manager" || currentUserRole === "admin" || currentUserRole === "companyadmin";

  useEffect(() => {
    if (isSuperUser || isManager) {
      loadInstances();
      loadCompanies();
    }
  }, [isSuperUser, isManager]);

  const loadInstances = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.INSTANCES);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter by company if not superuser
        if (!isSuperUser && currentUserCompanyId) {
          const filteredData = data.filter(
            (inst: Instance) => inst.companyid === currentUserCompanyId
          );
          setInstances(filteredData);
        } else {
          setInstances(data);
        }
      }
    } catch (err) {
      console.error("Error loading instances:", err);
    }
  };

  const loadCompanies = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.COMPANY);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error("Error loading companies:", err);
    }
  };

  const handleOpenDialog = (instance?: Instance) => {
    if (instance) {
      setEditMode(true);
      setCurrentInstanceId(instance.id);
      setNewInstance({
        description: instance.description,
        companyid: instance.companyid,
        oracleid: instance.oracleid,
        ncrid: instance.ncrid,
        alohaid: instance.alohaid,
        shardid1: instance.shardid1,
        shardid2: instance.shardid2,
        shardid3: instance.shardid3,
        shardid4: instance.shardid4,
        shardid5: instance.shardid5,
        shardid6: instance.shardid6,
        shardid7: instance.shardid7,
        shardid8: instance.shardid8,
        shardid9: instance.shardid9,
        shardid10: instance.shardid10,
      });
    } else {
      setEditMode(false);
      setCurrentInstanceId(null);
      // Pre-fill company ID if not superuser
      const defaultCompanyId = !isSuperUser && currentUserCompanyId 
        ? currentUserCompanyId 
        : "";
      setNewInstance({
        description: "",
        companyid: defaultCompanyId,
        oracleid: "",
        ncrid: "",
        alohaid: "",
        shardid1: "",
        shardid2: "",
        shardid3: "",
        shardid4: "",
        shardid5: "",
        shardid6: "",
        shardid7: "",
        shardid8: "",
        shardid9: "",
        shardid10: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitInstance = async () => {
    if (!newInstance.description.trim()) {
      setError("Please enter an instance description");
      return;
    }

    if (!newInstance.companyid) {
      setError("Please select a company");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to manage instances");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editMode && currentInstanceId
        ? getApiUrl(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(currentInstanceId.toString()))
        : getApiUrl(API_CONFIG.ENDPOINTS.INSTANCES);

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(newInstance),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(editMode ? "Instance updated successfully!" : "Instance created successfully!");
      setDialogOpen(false);
      loadInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save instance");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstance = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this instance? This action cannot be undone.")) {
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.INSTANCE_BY_ID(id.toString()));
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess("Instance deleted successfully!");
      loadInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete instance");
    }
  };

  if (!isSuperUser && !isManager) {
    return (
      <Alert severity="warning">
        Only managers and administrators can manage application instances. Contact your system administrator.
      </Alert>
    );
  }

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id.toString() === companyId);
    return company ? company.companyname : `Company ${companyId}`;
  };

  // Filter companies if not superuser
  const availableCompanies = !isSuperUser && currentUserCompanyId
    ? companies.filter((c) => c.id.toString() === currentUserCompanyId)
    : companies;

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Application Instance Management
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Create and manage application instances for your company
            {!isSuperUser && " (Manager Access)"}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "#1a1a1a",
            "&:hover": { backgroundColor: "#2a2a2a" },
          }}
        >
          Add Instance
        </Button>
      </Box>

      {/* Alert Messages */}
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Instances Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <Storage />
          <Typography variant="h6">Application Instances</Typography>
        </Box>

        {instances.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No instances found. Click "Add Instance" to create your first application instance.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Oracle ID</strong></TableCell>
                  <TableCell><strong>NCR ID</strong></TableCell>
                  <TableCell><strong>Aloha ID</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>{instance.id}</TableCell>
                    <TableCell>
                      <Box className="font-semibold text-slate-700">{instance.description}</Box>
                    </TableCell>
                    <TableCell>{getCompanyName(instance.companyid)}</TableCell>
                    <TableCell>{instance.oracleid || "—"}</TableCell>
                    <TableCell>{instance.ncrid || "—"}</TableCell>
                    <TableCell>{instance.alohaid || "—"}</TableCell>
                    <TableCell>
                      <Box className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(instance)}
                          sx={{ color: "#1a1a1a" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteInstance(instance.id)}
                          sx={{ color: "#8B0000" }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Instance Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Instance" : "Add New Instance"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Description"
              value={newInstance.description}
              onChange={(e) => setNewInstance({ ...newInstance, description: e.target.value })}
              required
              helperText="Brief description of the application instance"
            />

            <FormControl fullWidth required>
              <InputLabel>Company</InputLabel>
              <Select
                value={newInstance.companyid}
                label="Company"
                onChange={(e) => setNewInstance({ ...newInstance, companyid: e.target.value })}
                disabled={!isSuperUser}
              >
                <MenuItem value="">
                  <em>Select Company</em>
                </MenuItem>
                {availableCompanies.map((company) => (
                  <MenuItem key={company.id} value={company.id.toString()}>
                    {company.companyname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" className="text-slate-700 mt-4">
              Application Identifiers
            </Typography>

            <Box className="grid grid-cols-3 gap-4">
              <TextField
                fullWidth
                label="Oracle ID"
                value={newInstance.oracleid}
                onChange={(e) => setNewInstance({ ...newInstance, oracleid: e.target.value })}
              />

              <TextField
                fullWidth
                label="NCR ID"
                value={newInstance.ncrid}
                onChange={(e) => setNewInstance({ ...newInstance, ncrid: e.target.value })}
              />

              <TextField
                fullWidth
                label="Aloha ID"
                value={newInstance.alohaid}
                onChange={(e) => setNewInstance({ ...newInstance, alohaid: e.target.value })}
              />
            </Box>

            {/* Shard IDs in Accordion */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Shard Configuration (Optional)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box className="space-y-3">
                  <Box className="grid grid-cols-2 gap-4">
                    <TextField
                      fullWidth
                      label="Shard ID 1"
                      value={newInstance.shardid1}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid1: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 2"
                      value={newInstance.shardid2}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid2: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 3"
                      value={newInstance.shardid3}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid3: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 4"
                      value={newInstance.shardid4}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid4: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 5"
                      value={newInstance.shardid5}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid5: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 6"
                      value={newInstance.shardid6}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid6: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 7"
                      value={newInstance.shardid7}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid7: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 8"
                      value={newInstance.shardid8}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid8: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 9"
                      value={newInstance.shardid9}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid9: e.target.value })}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Shard ID 10"
                      value={newInstance.shardid10}
                      onChange={(e) => setNewInstance({ ...newInstance, shardid10: e.target.value })}
                      size="small"
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitInstance}
            variant="contained"
            disabled={loading || !newInstance.description.trim() || !newInstance.companyid}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? "Update Instance" : "Add Instance"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
