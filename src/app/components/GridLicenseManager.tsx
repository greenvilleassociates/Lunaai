import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Card,
  CardContent,
  Alert,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  Public,
  Add,
  Edit,
  Delete,
  Refresh,
  CheckCircle,
  Cancel,
  Storage,
} from "@mui/icons-material";
import { gappApi } from "../services/apiService";
import type { Gapp } from "../types/api";

export function GridLicenseManager() {
  const [gridApps, setGridApps] = useState<Gapp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<Gapp | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<Gapp>>({
    appid: "",
    appdescription: "",
    apptype: 0,
    appregion: 0,
    dbmstype: "",
    dbmsvendor: "",
    dbmstopology: "",
    gridid: 0,
    targetgeometry: "",
    targetgrid: "",
    targetgridid: 0,
    iscompliant: 1,
    licenseid: "",
    vendorid: 0,
    versionnumber: "",
    totalseats: 0,
    licenseexpiration: "",
    licensetype: 0,
    legalcontactid: 0,
    whynoncompliant: "",
  });

  useEffect(() => {
    loadGridApps();
  }, []);

  const loadGridApps = async () => {
    try {
      setLoading(true);
      const data = await gappApi.getAll();
      setGridApps(data);
      setError("");
    } catch (err) {
      console.error("Failed to load grid apps:", err);
      setError("Failed to load grid apps. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (app?: Gapp) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        appid: app.appid || "",
        appdescription: app.appdescription || "",
        apptype: app.apptype || 0,
        appregion: app.appregion || 0,
        dbmstype: app.dbmstype || "",
        dbmsvendor: app.dbmsvendor || "",
        dbmstopology: app.dbmstopology || "",
        gridid: app.gridid || 0,
        targetgeometry: app.targetgeometry || "",
        targetgrid: app.targetgrid || "",
        targetgridid: app.targetgridid || 0,
        iscompliant: app.iscompliant || 1,
        licenseid: app.licenseid || "",
        vendorid: app.vendorid || 0,
        versionnumber: app.versionnumber || "",
        totalseats: app.totalseats || 0,
        licenseexpiration: app.licenseexpiration || "",
        licensetype: app.licensetype || 0,
        legalcontactid: app.legalcontactid || 0,
        whynoncompliant: app.whynoncompliant || "",
      });
    } else {
      setEditingApp(null);
      setFormData({
        appid: "",
        appdescription: "",
        apptype: 0,
        appregion: 0,
        dbmstype: "",
        dbmsvendor: "",
        dbmstopology: "",
        gridid: 0,
        targetgeometry: "",
        targetgrid: "",
        targetgridid: 0,
        iscompliant: 1,
        licenseid: "",
        vendorid: 0,
        versionnumber: "",
        totalseats: 0,
        licenseexpiration: "",
        licensetype: 0,
        legalcontactid: 0,
        whynoncompliant: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingApp(null);
  };

  const handleSave = async () => {
    try {
      if (editingApp && editingApp.id) {
        await gappApi.update(editingApp.id, formData);
        setSuccessMessage("Grid app updated successfully");
      } else {
        await gappApi.create(formData);
        setSuccessMessage("Grid app created successfully");
      }
      handleCloseDialog();
      loadGridApps();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save grid app:", err);
      setError("Failed to save grid app. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grid app?")) return;

    try {
      await gappApi.delete(id);
      setSuccessMessage("Grid app deleted successfully");
      loadGridApps();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete grid app:", err);
      setError("Failed to delete grid app. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredApps = gridApps.filter((app) =>
    searchTerm
      ? (app.appid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.appdescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.licenseid?.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
  );

  const compliantApps = gridApps.filter((app) => app.iscompliant === 1).length;
  const totalSeats = gridApps.reduce((sum, app) => sum + (app.totalseats || 0), 0);

  const appRegionLabels: Record<number, string> = {
    0: "Global",
    1: "North America",
    2: "Europe",
    3: "Asia-Pacific",
    4: "Latin America",
    5: "Middle East & Africa",
  };

  const licenseTypeLabels: Record<number, string> = {
    0: "Perpetual",
    1: "Subscription",
    2: "Trial",
    3: "Educational",
    4: "Enterprise",
  };

  return (
    <Box className="max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <Box
            sx={{
              width: 56,
              height: 56,
              backgroundColor: "#000000",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Public sx={{ fontSize: 32, color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h3" component="h1">
              CTS Grid App License Manager
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage Grid Applications and Licensing Compliance
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Apps
                  </Typography>
                  <Typography variant="h4">{gridApps.length}</Typography>
                </Box>
                <Storage sx={{ fontSize: 40, color: "#8B0000", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Compliant
                  </Typography>
                  <Typography variant="h4">{compliantApps}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: "#28a745", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Non-Compliant
                  </Typography>
                  <Typography variant="h4">{gridApps.length - compliantApps}</Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, color: "#dc3545", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Seats
                  </Typography>
                  <Typography variant="h4">{totalSeats}</Typography>
                </Box>
                <Public sx={{ fontSize: 40, color: "#1976d2", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper className="p-6">
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5">Grid Applications</Typography>
          <Box className="flex gap-2">
            <Tooltip title="Refresh">
              <IconButton onClick={loadGridApps} sx={{ bgcolor: "#f5f5f5" }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}
            >
              Add Grid App
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <Box className="mb-4">
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by App ID, Description, or License ID..."
          />
        </Box>

        {/* Grid Apps Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>App ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Seats</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>License Exp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Compliant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading grid apps...
                  </TableCell>
                </TableRow>
              ) : filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No grid apps found. Create your first grid app!
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                        {app.appid}
                      </Typography>
                    </TableCell>
                    <TableCell>{app.appdescription}</TableCell>
                    <TableCell>{app.versionnumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={appRegionLabels[app.appregion || 0] || "Unknown"}
                        size="small"
                        sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}
                      />
                    </TableCell>
                    <TableCell>{app.totalseats}</TableCell>
                    <TableCell>{app.licenseexpiration}</TableCell>
                    <TableCell>
                      <Chip
                        icon={app.iscompliant === 1 ? <CheckCircle /> : <Cancel />}
                        label={app.iscompliant === 1 ? "Yes" : "No"}
                        color={app.iscompliant === 1 ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(app)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => app.id && handleDelete(app.id)}>
                            <Delete fontSize="small" sx={{ color: "#8B0000" }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingApp ? "Edit Grid App" : "Add New Grid App"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="App ID"
                  value={formData.appid || ""}
                  onChange={(e) => setFormData({ ...formData, appid: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Version Number"
                  value={formData.versionnumber || ""}
                  onChange={(e) => setFormData({ ...formData, versionnumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.appdescription || ""}
                  onChange={(e) => setFormData({ ...formData, appdescription: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>App Type</InputLabel>
                  <Select
                    value={formData.apptype || 0}
                    label="App Type"
                    onChange={(e) => setFormData({ ...formData, apptype: Number(e.target.value) })}
                  >
                    <MenuItem value={0}>Standard</MenuItem>
                    <MenuItem value={1}>Enterprise</MenuItem>
                    <MenuItem value={2}>Cloud</MenuItem>
                    <MenuItem value={3}>Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={formData.appregion || 0}
                    label="Region"
                    onChange={(e) => setFormData({ ...formData, appregion: Number(e.target.value) })}
                  >
                    {Object.entries(appRegionLabels).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DBMS Type"
                  value={formData.dbmstype || ""}
                  onChange={(e) => setFormData({ ...formData, dbmstype: e.target.value })}
                  placeholder="e.g., SQL Server, PostgreSQL"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DBMS Vendor"
                  value={formData.dbmsvendor || ""}
                  onChange={(e) => setFormData({ ...formData, dbmsvendor: e.target.value })}
                  placeholder="e.g., Microsoft, Oracle"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DBMS Topology"
                  value={formData.dbmstopology || ""}
                  onChange={(e) => setFormData({ ...formData, dbmstopology: e.target.value })}
                  placeholder="e.g., Cluster, Standalone"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Grid ID"
                  value={formData.gridid || 0}
                  onChange={(e) => setFormData({ ...formData, gridid: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Grid"
                  value={formData.targetgrid || ""}
                  onChange={(e) => setFormData({ ...formData, targetgrid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Grid ID"
                  value={formData.targetgridid || 0}
                  onChange={(e) => setFormData({ ...formData, targetgridid: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Geometry"
                  value={formData.targetgeometry || ""}
                  onChange={(e) => setFormData({ ...formData, targetgeometry: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License ID"
                  value={formData.licenseid || ""}
                  onChange={(e) => setFormData({ ...formData, licenseid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>License Type</InputLabel>
                  <Select
                    value={formData.licensetype || 0}
                    label="License Type"
                    onChange={(e) => setFormData({ ...formData, licensetype: Number(e.target.value) })}
                  >
                    {Object.entries(licenseTypeLabels).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Seats"
                  value={formData.totalseats || 0}
                  onChange={(e) => setFormData({ ...formData, totalseats: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="License Expiration"
                  value={formData.licenseexpiration || ""}
                  onChange={(e) => setFormData({ ...formData, licenseexpiration: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Vendor ID"
                  value={formData.vendorid || 0}
                  onChange={(e) => setFormData({ ...formData, vendorid: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Legal Contact ID"
                  value={formData.legalcontactid || 0}
                  onChange={(e) => setFormData({ ...formData, legalcontactid: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Compliant</InputLabel>
                  <Select
                    value={formData.iscompliant || 1}
                    label="Compliant"
                    onChange={(e) => setFormData({ ...formData, iscompliant: Number(e.target.value) })}
                  >
                    <MenuItem value={1}>Yes</MenuItem>
                    <MenuItem value={0}>No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Why Non-Compliant"
                  value={formData.whynoncompliant || ""}
                  onChange={(e) => setFormData({ ...formData, whynoncompliant: e.target.value })}
                  multiline
                  rows={2}
                  disabled={formData.iscompliant === 1}
                  placeholder="Explain why this app is non-compliant (if applicable)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}
            disabled={!formData.appid}
          >
            {editingApp ? "Update" : "Create"} Grid App
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
