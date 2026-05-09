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
} from "@mui/material";
import { StoreMallDirectory, Add } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface Store {
  id: number;
  description: string;
  regionid: number;
  bu: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  instanceid: string;
}

interface Company {
  id: number;
  companyname: string;
  instancedid: string;
}

interface BusinessUnit {
  id: number;
  buname: string;
  companyid: number;
}

export function StoreManagement() {
  const [stores, setStores] = useState<Store[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);

  // New store form state
  const [newStore, setNewStore] = useState({
    description: "",
    regionid: 0,
    bu: 0,
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    instanceid: "",
  });

  // Check if user is superuser
  const isSuperUser = localStorage.getItem("role") === "superuser";

  useEffect(() => {
    if (isSuperUser) {
      loadStores();
      loadCompanies();
      loadBusinessUnits();
    }
  }, [isSuperUser]);

  const loadStores = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.STORES);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (err) {
      console.error("Error loading stores:", err);
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

  const loadBusinessUnits = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.BUSINESS_UNITS);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessUnits(data);
      }
    } catch (err) {
      console.error("Error loading business units:", err);
    }
  };

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setEditMode(true);
      setCurrentStoreId(store.id);
      setNewStore({
        description: store.description,
        regionid: store.regionid,
        bu: store.bu,
        address1: store.address1,
        address2: store.address2,
        city: store.city,
        state: store.state,
        zipcode: store.zipcode,
        instanceid: store.instanceid,
      });
    } else {
      setEditMode(false);
      setCurrentStoreId(null);
      setNewStore({
        description: "",
        regionid: 0,
        bu: 0,
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipcode: "",
        instanceid: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitStore = async () => {
    if (!newStore.description.trim()) {
      setError("Please enter a store description");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to manage stores");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editMode && currentStoreId
        ? getApiUrl(API_CONFIG.ENDPOINTS.STORE_BY_ID(currentStoreId.toString()))
        : getApiUrl(API_CONFIG.ENDPOINTS.STORES);

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(newStore),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(editMode ? "Store updated successfully!" : "Store created successfully!");
      setDialogOpen(false);
      loadStores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save store");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this store?")) {
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.STORE_BY_ID(id.toString()));
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

      setSuccess("Store deleted successfully!");
      loadStores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete store");
    }
  };

  if (!isSuperUser) {
    return (
      <Alert severity="warning">
        Only superusers can manage stores. Contact your system administrator.
      </Alert>
    );
  }

  const getBusinessUnitName = (buId: number) => {
    const bu = businessUnits.find((b) => b.id === buId);
    return bu ? bu.buname : `BU ${buId}`;
  };

  const getCompanyFromBU = (buId: number) => {
    const bu = businessUnits.find((b) => b.id === buId);
    if (!bu) return "N/A";
    const company = companies.find((c) => c.id === bu.companyid);
    return company ? company.companyname : "N/A";
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Store Management
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Create and manage stores for companies and business units
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
          Add Store
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

      {/* Stores Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <StoreMallDirectory />
          <Typography variant="h6">All Stores</Typography>
        </Box>

        {stores.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No stores found. Click "Add Store" to create your first store.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Business Unit</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Region ID</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.id}</TableCell>
                    <TableCell>{store.description}</TableCell>
                    <TableCell>{getBusinessUnitName(store.bu)}</TableCell>
                    <TableCell>{getCompanyFromBU(store.bu)}</TableCell>
                    <TableCell>
                      {store.city}, {store.state} {store.zipcode}
                    </TableCell>
                    <TableCell>{store.regionid}</TableCell>
                    <TableCell>
                      <Box className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(store)}
                          sx={{ color: "#1a1a1a" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteStore(store.id)}
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

      {/* Add/Edit Store Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Store" : "Add New Store"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Store Description"
              value={newStore.description}
              onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Business Unit</InputLabel>
              <Select
                value={newStore.bu}
                label="Business Unit"
                onChange={(e) => setNewStore({ ...newStore, bu: e.target.value as number })}
              >
                <MenuItem value={0}>
                  <em>Select Business Unit</em>
                </MenuItem>
                {businessUnits.map((bu) => (
                  <MenuItem key={bu.id} value={bu.id}>
                    {bu.buname} - {companies.find((c) => c.id === bu.companyid)?.companyname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Region ID"
              type="number"
              value={newStore.regionid}
              onChange={(e) => setNewStore({ ...newStore, regionid: parseInt(e.target.value) || 0 })}
            />

            <TextField
              fullWidth
              label="Address Line 1"
              value={newStore.address1}
              onChange={(e) => setNewStore({ ...newStore, address1: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Address Line 2"
              value={newStore.address2}
              onChange={(e) => setNewStore({ ...newStore, address2: e.target.value })}
            />

            <Box className="grid grid-cols-3 gap-4">
              <TextField
                fullWidth
                label="City"
                value={newStore.city}
                onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="State"
                value={newStore.state}
                onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="Zip Code"
                value={newStore.zipcode}
                onChange={(e) => setNewStore({ ...newStore, zipcode: e.target.value })}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Instance ID"
              value={newStore.instanceid}
              onChange={(e) => setNewStore({ ...newStore, instanceid: e.target.value })}
              helperText="Optional: Instance identifier for this store"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitStore}
            variant="contained"
            disabled={loading || !newStore.description.trim()}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? "Update Store" : "Add Store"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
