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
import { SupervisorAccount, Add } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";

interface Manager {
  id: number;
  fullname: string;
  emplid: number;
  userid: number;
  storeid: number;
  saddress1: string;
  saddress2: string;
  scity: string;
  sstate: string;
  szipcode: string;
  companyid: number;
  instanceid: string;
}

interface Store {
  id: number;
  description: string;
  bu: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
}

interface Company {
  id: number;
  companyname: string;
}

interface User {
  uid: string;
  username: string;
  role: string;
  companyId: string;
}

export function ManagerManagement() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentManagerId, setCurrentManagerId] = useState<number | null>(null);

  // New manager form state
  const [newManager, setNewManager] = useState({
    fullname: "",
    emplid: 0,
    userid: 0,
    storeid: 0,
    saddress1: "",
    saddress2: "",
    scity: "",
    sstate: "",
    szipcode: "",
    companyid: 0,
    instanceid: "",
  });

  // Get current user info
  const currentUserRole = localStorage.getItem("role");
  const currentUserCompanyId = localStorage.getItem("companyId");
  const isSuperUser = currentUserRole === "superuser";
  const isCompanyAdmin = currentUserRole === "admin" || currentUserRole === "companyadmin";

  useEffect(() => {
    if (isSuperUser || isCompanyAdmin) {
      loadManagers();
      loadStores();
      loadCompanies();
    }
  }, [isSuperUser, isCompanyAdmin]);

  const loadManagers = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.MANAGERS);
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
            (m: Manager) => m.companyid.toString() === currentUserCompanyId
          );
          setManagers(filteredData);
        } else {
          setManagers(data);
        }
      }
    } catch (err) {
      console.error("Error loading managers:", err);
    }
  };

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
    console.log("🔄 Starting loadCompanies...");
    
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        console.warn("⚠️ No UID found, trying without auth...");
      }

      // Strategy 1: Try Azure API /companies endpoint (plural, lowercase)
      try {
        const url = getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES);
        console.log("🔍 Attempt 1: Fetching from Azure API:", url);
        
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
        });

        console.log("📡 Azure API /companies Response Status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ SUCCESS: Companies loaded from Azure API /companies:", data);
          setCompanies(data);
          return; // Success, exit early
        } else {
          console.warn(`⚠️ Azure API /companies returned ${response.status}`);
        }
      } catch (err) {
        console.warn("⚠️ Azure API /companies failed:", err);
      }

      // Strategy 2: Try Azure API /Company endpoint (singular, capitalized)
      try {
        const url = getApiUrl(API_CONFIG.ENDPOINTS.COMPANY);
        console.log("🔍 Attempt 2: Fetching from Azure API:", url);
        
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
        });

        console.log("📡 Azure API /Company Response Status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ SUCCESS: Companies loaded from Azure API /Company:", data);
          setCompanies(data);
          return; // Success, exit early
        } else {
          console.warn(`⚠️ Azure API /Company returned ${response.status}`);
        }
      } catch (err) {
        console.warn("⚠️ Azure API /Company failed:", err);
      }

      // Strategy 3: Fall back to local JSON
      console.log("🔍 Attempt 3: Falling back to local/external JSON...");
      const localData = await fetchExternalData<any[]>(DATA_URLS.COMPANIES);
      console.log("✅ SUCCESS: Companies loaded from local/external JSON:", localData);
      
      // Map the local JSON structure to match the API structure
      const mappedData = localData.map((company: any) => ({
        id: parseInt(company.companyId) || 0,
        companyname: company.companyName || "",
      }));
      
      console.log("📦 Mapped company data:", mappedData);
      setCompanies(mappedData);
      
    } catch (err) {
      console.error("❌ FAILED: All strategies to load companies failed:", err);
      setCompanies([]); // Set empty array as last resort
    }
  };

  const handleOpenDialog = (manager?: Manager) => {
    if (manager) {
      setEditMode(true);
      setCurrentManagerId(manager.id);
      setNewManager({
        fullname: manager.fullname,
        emplid: manager.emplid,
        userid: manager.userid,
        storeid: manager.storeid,
        saddress1: manager.saddress1,
        saddress2: manager.saddress2,
        scity: manager.scity,
        sstate: manager.sstate,
        szipcode: manager.szipcode,
        companyid: manager.companyid,
        instanceid: manager.instanceid,
      });
    } else {
      setEditMode(false);
      setCurrentManagerId(null);
      // Pre-fill company ID if not superuser
      const defaultCompanyId = !isSuperUser && currentUserCompanyId 
        ? parseInt(currentUserCompanyId) 
        : 0;
      setNewManager({
        fullname: "",
        emplid: 0,
        userid: 0,
        storeid: 0,
        saddress1: "",
        saddress2: "",
        scity: "",
        sstate: "",
        szipcode: "",
        companyid: defaultCompanyId,
        instanceid: "",
      });
    }
    setDialogOpen(true);
  };

  const handleStoreChange = (storeId: number) => {
    const selectedStore = stores.find((s) => s.id === storeId);
    if (selectedStore) {
      setNewManager({
        ...newManager,
        storeid: storeId,
        saddress1: selectedStore.address1,
        saddress2: selectedStore.address2,
        scity: selectedStore.city,
        sstate: selectedStore.state,
        szipcode: selectedStore.zipcode,
      });
    } else {
      setNewManager({
        ...newManager,
        storeid: storeId,
      });
    }
  };

  const handleSubmitManager = async () => {
    if (!newManager.fullname.trim()) {
      setError("Please enter the manager's full name");
      return;
    }

    if (!newManager.storeid) {
      setError("Please select a store");
      return;
    }

    if (!newManager.companyid) {
      setError("Please select a company");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to manage managers");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editMode && currentManagerId
        ? getApiUrl(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(currentManagerId.toString()))
        : getApiUrl(API_CONFIG.ENDPOINTS.MANAGERS);

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(newManager),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(editMode ? "Manager updated successfully!" : "Manager created successfully!");
      setDialogOpen(false);
      loadManagers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save manager");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) {
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.MANAGER_BY_ID(id.toString()));
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

      setSuccess("Manager deleted successfully!");
      loadManagers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete manager");
    }
  };

  if (!isSuperUser && !isCompanyAdmin) {
    return (
      <Alert severity="warning">
        Only company administrators and superusers can manage managers. Contact your system administrator.
      </Alert>
    );
  }

  const getStoreName = (storeId: number) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.description : `Store ${storeId}`;
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.companyname : `Company ${companyId}`;
  };

  // Filter stores by company if not superuser
  const availableStores = !isSuperUser && currentUserCompanyId
    ? stores.filter((store) => {
        // You might need to add company filtering logic based on your store structure
        return true; // For now, show all stores
      })
    : stores;

  // Filter companies if not superuser
  const availableCompanies = !isSuperUser && currentUserCompanyId
    ? companies.filter((c) => c.id.toString() === currentUserCompanyId)
    : companies;

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Manager Management
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Create and assign managers to stores
            {!isSuperUser && " for your company"}
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
          Add Manager
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

      {/* Managers Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <SupervisorAccount />
          <Typography variant="h6">All Managers</Typography>
        </Box>

        {managers.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No managers found. Click "Add Manager" to create your first manager.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Employee ID</strong></TableCell>
                  <TableCell><strong>Store</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Store Location</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>{manager.id}</TableCell>
                    <TableCell>
                      <Box className="font-semibold text-slate-700">{manager.fullname}</Box>
                    </TableCell>
                    <TableCell>{manager.emplid}</TableCell>
                    <TableCell>{getStoreName(manager.storeid)}</TableCell>
                    <TableCell>{getCompanyName(manager.companyid)}</TableCell>
                    <TableCell>
                      <Box className="text-sm">
                        <div>{manager.saddress1}</div>
                        {manager.saddress2 && <div>{manager.saddress2}</div>}
                        <div>
                          {manager.scity}, {manager.sstate} {manager.szipcode}
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(manager)}
                          sx={{ color: "#1a1a1a" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteManager(manager.id)}
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

      {/* Add/Edit Manager Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Manager" : "Add New Manager"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-2.5 pt-2">
            <TextField
              fullWidth
              label="Full Name"
              value={newManager.fullname}
              onChange={(e) => setNewManager({ ...newManager, fullname: e.target.value })}
              required
            />

            <Box className="grid grid-cols-2 gap-2.5">
              <TextField
                fullWidth
                label="Employee ID"
                type="number"
                value={newManager.emplid}
                onChange={(e) => setNewManager({ ...newManager, emplid: parseInt(e.target.value) || 0 })}
                required
              />

              <TextField
                fullWidth
                label="User ID"
                type="number"
                value={newManager.userid}
                onChange={(e) => setNewManager({ ...newManager, userid: parseInt(e.target.value) || 0 })}
                helperText="Link to user account (optional)"
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Company</InputLabel>
              <Select
                value={newManager.companyid}
                label="Company"
                onChange={(e) => setNewManager({ ...newManager, companyid: e.target.value as number })}
                disabled={!isSuperUser}
              >
                <MenuItem value={0}>
                  <em>Select Company</em>
                </MenuItem>
                {availableCompanies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.companyname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Assigned Store</InputLabel>
              <Select
                value={newManager.storeid}
                label="Assigned Store"
                onChange={(e) => handleStoreChange(e.target.value as number)}
              >
                <MenuItem value={0}>
                  <em>Select Store</em>
                </MenuItem>
                {availableStores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.description} - {store.city}, {store.state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" className="text-slate-700 mt-4">
              Store Address (auto-filled from selected store)
            </Typography>

            <TextField
              fullWidth
              label="Store Address Line 1"
              value={newManager.saddress1}
              onChange={(e) => setNewManager({ ...newManager, saddress1: e.target.value })}
              disabled
            />

            <TextField
              fullWidth
              label="Store Address Line 2"
              value={newManager.saddress2}
              onChange={(e) => setNewManager({ ...newManager, saddress2: e.target.value })}
              disabled
            />

            <Box className="grid grid-cols-3 gap-2.5">
              <TextField
                fullWidth
                label="Store City"
                value={newManager.scity}
                onChange={(e) => setNewManager({ ...newManager, scity: e.target.value })}
                disabled
              />

              <TextField
                fullWidth
                label="Store State"
                value={newManager.sstate}
                onChange={(e) => setNewManager({ ...newManager, sstate: e.target.value })}
                disabled
              />

              <TextField
                fullWidth
                label="Store Zip Code"
                value={newManager.szipcode}
                onChange={(e) => setNewManager({ ...newManager, szipcode: e.target.value })}
                disabled
              />
            </Box>

            <TextField
              fullWidth
              label="Instance ID"
              value={newManager.instanceid}
              onChange={(e) => setNewManager({ ...newManager, instanceid: e.target.value })}
              helperText="Optional: Instance identifier for this manager"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitManager}
            variant="contained"
            disabled={loading || !newManager.fullname.trim() || !newManager.storeid || !newManager.companyid}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? "Update Manager" : "Add Manager"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}