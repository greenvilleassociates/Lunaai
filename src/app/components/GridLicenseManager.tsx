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
  Tabs,
  Tab,
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
  Assignment,
} from "@mui/icons-material";
import { gappApi } from "../services/apiService";
import type { Gapp } from "../types/api";

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function GridLicenseManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [gridApps, setGridApps] = useState<Gapp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openAppDialog, setOpenAppDialog] = useState(false);
  const [openLicenseDialog, setOpenLicenseDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<Gapp | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state for App
  const [appFormData, setAppFormData] = useState<Partial<Gapp>>({
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
    versionnumber: "",
    vendorid: 0,
  });

  // Form state for License
  const [licenseFormData, setLicenseFormData] = useState<Partial<Gapp>>({
    licenseid: "",
    totalseats: 0,
    licenseexpiration: "",
    licensetype: 0,
    legalcontactid: 0,
    iscompliant: 1,
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

  const handleOpenAppDialog = (app?: Gapp) => {
    if (app) {
      setEditingApp(app);
      setAppFormData({
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
        versionnumber: app.versionnumber || "",
        vendorid: app.vendorid || 0,
      });
    } else {
      setEditingApp(null);
      setAppFormData({
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
        versionnumber: "",
        vendorid: 0,
      });
    }
    setOpenAppDialog(true);
  };

  const handleOpenLicenseDialog = (app?: Gapp) => {
    if (app) {
      setEditingApp(app);
      setLicenseFormData({
        appid: app.appid,
        licenseid: app.licenseid || "",
        totalseats: app.totalseats || 0,
        licenseexpiration: app.licenseexpiration || "",
        licensetype: app.licensetype || 0,
        legalcontactid: app.legalcontactid || 0,
        iscompliant: app.iscompliant || 1,
        whynoncompliant: app.whynoncompliant || "",
      });
    } else {
      setEditingApp(null);
      setLicenseFormData({
        licenseid: "",
        totalseats: 0,
        licenseexpiration: "",
        licensetype: 0,
        legalcontactid: 0,
        iscompliant: 1,
        whynoncompliant: "",
      });
    }
    setOpenLicenseDialog(true);
  };

  const handleSaveApp = async () => {
    try {
      if (editingApp && editingApp.id) {
        // Update only app fields, preserve license fields
        const updatedData = {
          ...editingApp,
          ...appFormData,
        };
        await gappApi.update(editingApp.id, updatedData);
        setSuccessMessage("Grid app updated successfully");
      } else {
        // Create new app with default license values
        const newData = {
          ...appFormData,
          iscompliant: 1,
          licensetype: 0,
          totalseats: 0,
        };
        await gappApi.create(newData);
        setSuccessMessage("Grid app created successfully");
      }
      setOpenAppDialog(false);
      loadGridApps();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save grid app:", err);
      setError("Failed to save grid app. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSaveLicense = async () => {
    try {
      if (editingApp && editingApp.id) {
        // Update only license fields, preserve app fields
        const updatedData = {
          ...editingApp,
          ...licenseFormData,
        };
        await gappApi.update(editingApp.id, updatedData);
        setSuccessMessage("License updated successfully");
      }
      setOpenLicenseDialog(false);
      loadGridApps();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save license:", err);
      setError("Failed to save license. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grid app and its license?")) return;

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
  const totalLicenses = gridApps.filter((app) => app.licenseid).length;

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

  const appTypeLabels: Record<number, string> = {
    0: "Standard",
    1: "Enterprise",
    2: "Cloud",
    3: "Hybrid",
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
                    Active Licenses
                  </Typography>
                  <Typography variant="h4">{totalLicenses}</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: "#1976d2", opacity: 0.3 }} />
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

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
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
          <Tab icon={<Storage />} label="Grid Apps" iconPosition="start" />
          <Tab icon={<Assignment />} label="Licenses" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 0: Grid Apps */}
      <TabPanel value={activeTab} index={0}>
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
                onClick={() => handleOpenAppDialog()}
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
              placeholder="Search by App ID or Description..."
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
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>DBMS</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Grid ID</TableCell>
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
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                          {app.appid}
                        </Typography>
                      </TableCell>
                      <TableCell>{app.appdescription}</TableCell>
                      <TableCell>{app.versionnumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={appTypeLabels[app.apptype || 0]}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appRegionLabels[app.appregion || 0] || "Unknown"}
                          size="small"
                          sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                          {app.dbmstype || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>{app.gridid}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Edit App">
                            <IconButton size="small" onClick={() => handleOpenAppDialog(app)}>
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
      </TabPanel>

      {/* Tab 1: Licenses */}
      <TabPanel value={activeTab} index={1}>
        <Paper className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">App Licenses</Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={loadGridApps} sx={{ bgcolor: "#f5f5f5" }}>
                <Refresh />
              </IconButton>
            </Tooltip>
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
              placeholder="Search by License ID or App ID..."
            />
          </Box>

          {/* Licenses Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>License ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>App ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>License Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Seats</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expiration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Compliant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading licenses...
                    </TableCell>
                  </TableRow>
                ) : filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No licenses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {app.licenseid || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                          {app.appid}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={licenseTypeLabels[app.licensetype || 0]}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{app.totalseats || 0}</TableCell>
                      <TableCell>{app.licenseexpiration || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          icon={app.iscompliant === 1 ? <CheckCircle /> : <Cancel />}
                          label={app.iscompliant === 1 ? "Yes" : "No"}
                          color={app.iscompliant === 1 ? "success" : "error"}
                          size="small"
                        />
                        {app.iscompliant === 0 && app.whynoncompliant && (
                          <Typography variant="caption" display="block" color="error">
                            {app.whynoncompliant}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit License">
                          <IconButton size="small" onClick={() => handleOpenLicenseDialog(app)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Add/Edit App Dialog */}
      <Dialog open={openAppDialog} onClose={() => setOpenAppDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingApp ? "Edit Grid App" : "Add New Grid App"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="App ID *"
                  value={appFormData.appid || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, appid: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Version Number"
                  value={appFormData.versionnumber || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, versionnumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={appFormData.appdescription || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, appdescription: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>App Type</InputLabel>
                  <Select
                    value={appFormData.apptype || 0}
                    label="App Type"
                    onChange={(e) => setAppFormData({ ...appFormData, apptype: Number(e.target.value) })}
                  >
                    {Object.entries(appTypeLabels).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={appFormData.appregion || 0}
                    label="Region"
                    onChange={(e) => setAppFormData({ ...appFormData, appregion: Number(e.target.value) })}
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
                  value={appFormData.dbmstype || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, dbmstype: e.target.value })}
                  placeholder="e.g., SQL Server, PostgreSQL"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DBMS Vendor"
                  value={appFormData.dbmsvendor || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, dbmsvendor: e.target.value })}
                  placeholder="e.g., Microsoft, Oracle"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DBMS Topology"
                  value={appFormData.dbmstopology || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, dbmstopology: e.target.value })}
                  placeholder="e.g., Cluster, Standalone"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Grid ID"
                  value={appFormData.gridid || 0}
                  onChange={(e) => setAppFormData({ ...appFormData, gridid: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Grid"
                  value={appFormData.targetgrid || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, targetgrid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Grid ID"
                  value={appFormData.targetgridid || 0}
                  onChange={(e) => setAppFormData({ ...appFormData, targetgridid: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Geometry"
                  value={appFormData.targetgeometry || ""}
                  onChange={(e) => setAppFormData({ ...appFormData, targetgeometry: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Vendor ID"
                  value={appFormData.vendorid || 0}
                  onChange={(e) => setAppFormData({ ...appFormData, vendorid: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveApp}
            variant="contained"
            sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}
            disabled={!appFormData.appid}
          >
            {editingApp ? "Update" : "Create"} App
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit License Dialog */}
      <Dialog open={openLicenseDialog} onClose={() => setOpenLicenseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit License</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="App ID"
              value={licenseFormData.appid || ""}
              disabled
              helperText="App ID cannot be changed from license view"
            />
            <TextField
              fullWidth
              label="License ID"
              value={licenseFormData.licenseid || ""}
              onChange={(e) => setLicenseFormData({ ...licenseFormData, licenseid: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>License Type</InputLabel>
              <Select
                value={licenseFormData.licensetype || 0}
                label="License Type"
                onChange={(e) => setLicenseFormData({ ...licenseFormData, licensetype: Number(e.target.value) })}
              >
                {Object.entries(licenseTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Total Seats"
              value={licenseFormData.totalseats || 0}
              onChange={(e) => setLicenseFormData({ ...licenseFormData, totalseats: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              type="date"
              label="License Expiration"
              value={licenseFormData.licenseexpiration || ""}
              onChange={(e) => setLicenseFormData({ ...licenseFormData, licenseexpiration: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="number"
              label="Legal Contact ID"
              value={licenseFormData.legalcontactid || 0}
              onChange={(e) => setLicenseFormData({ ...licenseFormData, legalcontactid: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Compliant</InputLabel>
              <Select
                value={licenseFormData.iscompliant || 1}
                label="Compliant"
                onChange={(e) => setLicenseFormData({ ...licenseFormData, iscompliant: Number(e.target.value) })}
              >
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Why Non-Compliant"
              value={licenseFormData.whynoncompliant || ""}
              onChange={(e) => setLicenseFormData({ ...licenseFormData, whynoncompliant: e.target.value })}
              multiline
              rows={2}
              disabled={licenseFormData.iscompliant === 1}
              placeholder="Explain why this license is non-compliant (if applicable)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLicenseDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveLicense}
            variant="contained"
            sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}
          >
            Update License
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
