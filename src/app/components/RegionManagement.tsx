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
import { LocationOn, Add } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface Region {
  id: number;
  description: string;
  bu: number;
  hqaddress1: string;
  hqaddress2: string;
  hqcity: string;
  hqstate: string;
  hqzipcode: string;
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

export function RegionManagement() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRegionId, setCurrentRegionId] = useState<number | null>(null);

  // New region form state
  const [newRegion, setNewRegion] = useState({
    description: "",
    bu: 0,
    hqaddress1: "",
    hqaddress2: "",
    hqcity: "",
    hqstate: "",
    hqzipcode: "",
    instanceid: "",
  });

  // Check if user is superuser
  const isSuperUser = localStorage.getItem("role") === "superuser";

  useEffect(() => {
    if (isSuperUser) {
      loadRegions();
      loadCompanies();
      loadBusinessUnits();
    }
  }, [isSuperUser]);

  const loadRegions = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.REGIONS);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      }
    } catch (err) {
      console.error("Error loading regions:", err);
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

  const handleOpenDialog = (region?: Region) => {
    if (region) {
      setEditMode(true);
      setCurrentRegionId(region.id);
      setNewRegion({
        description: region.description,
        bu: region.bu,
        hqaddress1: region.hqaddress1,
        hqaddress2: region.hqaddress2,
        hqcity: region.hqcity,
        hqstate: region.hqstate,
        hqzipcode: region.hqzipcode,
        instanceid: region.instanceid,
      });
    } else {
      setEditMode(false);
      setCurrentRegionId(null);
      setNewRegion({
        description: "",
        bu: 0,
        hqaddress1: "",
        hqaddress2: "",
        hqcity: "",
        hqstate: "",
        hqzipcode: "",
        instanceid: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitRegion = async () => {
    if (!newRegion.description.trim()) {
      setError("Please enter a region description");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to manage regions");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editMode && currentRegionId
        ? getApiUrl(API_CONFIG.ENDPOINTS.REGION_BY_ID(currentRegionId.toString()))
        : getApiUrl(API_CONFIG.ENDPOINTS.REGIONS);

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(newRegion),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(editMode ? "Region updated successfully!" : "Region created successfully!");
      setDialogOpen(false);
      loadRegions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save region");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this region?")) {
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.REGION_BY_ID(id.toString()));
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

      setSuccess("Region deleted successfully!");
      loadRegions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete region");
    }
  };

  if (!isSuperUser) {
    return (
      <Alert severity="warning">
        Only superusers can manage regions. Contact your system administrator.
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
            Region Management
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Define and manage regional headquarters for companies
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
          Add Region
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

      {/* Regions Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <LocationOn />
          <Typography variant="h6">All Regions</Typography>
        </Box>

        {regions.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No regions found. Click "Add Region" to create your first region.
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
                  <TableCell><strong>HQ Location</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell>{region.id}</TableCell>
                    <TableCell>
                      <Box className="font-semibold text-slate-700">{region.description}</Box>
                    </TableCell>
                    <TableCell>{getBusinessUnitName(region.bu)}</TableCell>
                    <TableCell>{getCompanyFromBU(region.bu)}</TableCell>
                    <TableCell>
                      <Box className="text-sm">
                        <div>{region.hqaddress1}</div>
                        {region.hqaddress2 && <div>{region.hqaddress2}</div>}
                        <div>
                          {region.hqcity}, {region.hqstate} {region.hqzipcode}
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(region)}
                          sx={{ color: "#1a1a1a" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteRegion(region.id)}
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

      {/* Add/Edit Region Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Region" : "Add New Region"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Region Description"
              value={newRegion.description}
              onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
              required
              helperText="e.g., Northeast Region, West Coast Division"
            />

            <FormControl fullWidth required>
              <InputLabel>Business Unit</InputLabel>
              <Select
                value={newRegion.bu}
                label="Business Unit"
                onChange={(e) => setNewRegion({ ...newRegion, bu: e.target.value as number })}
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

            <Typography variant="subtitle2" className="text-slate-700 mt-4">
              Regional Headquarters Address
            </Typography>

            <TextField
              fullWidth
              label="HQ Address Line 1"
              value={newRegion.hqaddress1}
              onChange={(e) => setNewRegion({ ...newRegion, hqaddress1: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="HQ Address Line 2"
              value={newRegion.hqaddress2}
              onChange={(e) => setNewRegion({ ...newRegion, hqaddress2: e.target.value })}
            />

            <Box className="grid grid-cols-3 gap-4">
              <TextField
                fullWidth
                label="HQ City"
                value={newRegion.hqcity}
                onChange={(e) => setNewRegion({ ...newRegion, hqcity: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="HQ State"
                value={newRegion.hqstate}
                onChange={(e) => setNewRegion({ ...newRegion, hqstate: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="HQ Zip Code"
                value={newRegion.hqzipcode}
                onChange={(e) => setNewRegion({ ...newRegion, hqzipcode: e.target.value })}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Instance ID"
              value={newRegion.instanceid}
              onChange={(e) => setNewRegion({ ...newRegion, instanceid: e.target.value })}
              helperText="Optional: Instance identifier for this region"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitRegion}
            variant="contained"
            disabled={loading || !newRegion.description.trim()}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? "Update Region" : "Add Region"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
