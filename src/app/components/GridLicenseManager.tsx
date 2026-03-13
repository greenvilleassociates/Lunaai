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
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Public,
  Add,
  Edit,
  Delete,
  KeyOutlined,
  CheckCircle,
  Cancel,
  Business,
  Storage,
  CloudQueue,
} from "@mui/icons-material";

// Grid Region types
type GridRegion = "NA" | "ISLES" | "EU" | "ASIA" | "INDIA" | "AMERICAS";

interface GridLicense {
  id: string;
  appName: string;
  region: GridRegion;
  licenseKey: string;
  companyId: string;
  companyName: string;
  issuedDate: string;
  expiryDate: string;
  maxUsers: number;
  currentUsers: number;
  status: "Active" | "Expired" | "Suspended";
  modules: string[];
}

interface GridApp {
  id: string;
  name: string;
  version: string;
  description: string;
  modules: string[];
}

const GRID_REGIONS: { value: GridRegion; label: string; icon: string }[] = [
  { value: "NA", label: "North America", icon: "🌎" },
  { value: "ISLES", label: "British Isles", icon: "🏝️" },
  { value: "EU", label: "Europe", icon: "🇪🇺" },
  { value: "ASIA", label: "Asia", icon: "🌏" },
  { value: "INDIA", label: "India", icon: "🇮🇳" },
  { value: "AMERICAS", label: "Americas", icon: "🌎" },
];

// Mock CTS Grid Apps
const GRID_APPS: GridApp[] = [
  {
    id: "1",
    name: "CTS Payment Services",
    version: "3.2.1",
    description: "Payment processing and transaction management",
    modules: ["Payment Gateway", "Transaction History", "Refund Management"],
  },
  {
    id: "2",
    name: "CTS Inventory Plus",
    version: "2.5.0",
    description: "Advanced inventory management system",
    modules: ["Stock Management", "Warehouse", "Forecasting"],
  },
  {
    id: "3",
    name: "CTS Retail Manager",
    version: "4.1.3",
    description: "Complete retail management solution",
    modules: ["POS", "Customer Management", "Sales Analytics"],
  },
  {
    id: "4",
    name: "CTS Mobile Commerce",
    version: "1.8.0",
    description: "Mobile-first commerce platform",
    modules: ["Mobile POS", "Customer App", "Delivery Tracking"],
  },
];

export function GridLicenseManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [licenses, setLicenses] = useState<GridLicense[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<GridLicense[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<GridRegion | "ALL">("ALL");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLicense, setEditingLicense] = useState<GridLicense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    appName: "",
    region: "NA" as GridRegion,
    companyId: "",
    companyName: "",
    maxUsers: 10,
    expiryDate: "",
    modules: [] as string[],
  });

  // Load licenses from localStorage
  useEffect(() => {
    const storedLicenses = localStorage.getItem("gridLicenses");
    if (storedLicenses) {
      setLicenses(JSON.parse(storedLicenses));
    } else {
      // Initialize with mock data
      const mockLicenses: GridLicense[] = [
        {
          id: "1",
          appName: "CTS Payment Services",
          region: "NA",
          licenseKey: "NA-CTS-PAY-2024-A1B2C3D4",
          companyId: "comp1",
          companyName: "Acme Corp",
          issuedDate: "2024-01-15",
          expiryDate: "2025-01-15",
          maxUsers: 50,
          currentUsers: 35,
          status: "Active",
          modules: ["Payment Gateway", "Transaction History"],
        },
        {
          id: "2",
          appName: "CTS Inventory Plus",
          region: "EU",
          licenseKey: "EU-CTS-INV-2024-E5F6G7H8",
          companyId: "comp2",
          companyName: "Euro Retail Ltd",
          issuedDate: "2024-02-01",
          expiryDate: "2025-02-01",
          maxUsers: 100,
          currentUsers: 78,
          status: "Active",
          modules: ["Stock Management", "Warehouse"],
        },
        {
          id: "3",
          appName: "CTS Retail Manager",
          region: "ASIA",
          licenseKey: "ASIA-CTS-RET-2023-I9J0K1L2",
          companyId: "comp3",
          companyName: "Pacific Trade Inc",
          issuedDate: "2023-06-01",
          expiryDate: "2024-06-01",
          maxUsers: 25,
          currentUsers: 25,
          status: "Expired",
          modules: ["POS", "Sales Analytics"],
        },
        {
          id: "4",
          appName: "CTS Mobile Commerce",
          region: "INDIA",
          licenseKey: "INDIA-CTS-MOB-2024-M3N4O5P6",
          companyId: "comp4",
          companyName: "Mumbai Traders",
          issuedDate: "2024-03-10",
          expiryDate: "2025-03-10",
          maxUsers: 75,
          currentUsers: 42,
          status: "Active",
          modules: ["Mobile POS", "Delivery Tracking"],
        },
      ];
      setLicenses(mockLicenses);
      localStorage.setItem("gridLicenses", JSON.stringify(mockLicenses));
    }
  }, []);

  // Filter licenses
  useEffect(() => {
    let filtered = licenses;
    
    if (selectedRegion !== "ALL") {
      filtered = filtered.filter(l => l.region === selectedRegion);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.licenseKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLicenses(filtered);
  }, [licenses, selectedRegion, searchTerm]);

  const handleAddLicense = () => {
    setEditingLicense(null);
    setFormData({
      appName: "",
      region: "NA",
      companyId: "",
      companyName: "",
      maxUsers: 10,
      expiryDate: "",
      modules: [],
    });
    setOpenDialog(true);
  };

  const handleEditLicense = (license: GridLicense) => {
    setEditingLicense(license);
    setFormData({
      appName: license.appName,
      region: license.region,
      companyId: license.companyId,
      companyName: license.companyName,
      maxUsers: license.maxUsers,
      expiryDate: license.expiryDate,
      modules: license.modules,
    });
    setOpenDialog(true);
  };

  const handleSaveLicense = () => {
    const today = new Date().toISOString().split("T")[0];
    const licenseKey = `${formData.region}-CTS-${formData.appName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    if (editingLicense) {
      // Update existing license
      const updatedLicenses = licenses.map(l =>
        l.id === editingLicense.id
          ? { ...l, ...formData, licenseKey: l.licenseKey }
          : l
      );
      setLicenses(updatedLicenses);
      localStorage.setItem("gridLicenses", JSON.stringify(updatedLicenses));
    } else {
      // Create new license
      const newLicense: GridLicense = {
        id: Date.now().toString(),
        ...formData,
        licenseKey,
        issuedDate: today,
        currentUsers: 0,
        status: "Active",
      };
      const updatedLicenses = [...licenses, newLicense];
      setLicenses(updatedLicenses);
      localStorage.setItem("gridLicenses", JSON.stringify(updatedLicenses));
    }

    setOpenDialog(false);
  };

  const handleDeleteLicense = (id: string) => {
    if (confirm("Are you sure you want to delete this license?")) {
      const updatedLicenses = licenses.filter(l => l.id !== id);
      setLicenses(updatedLicenses);
      localStorage.setItem("gridLicenses", JSON.stringify(updatedLicenses));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Expired":
        return "error";
      case "Suspended":
        return "warning";
      default:
        return "default";
    }
  };

  // Statistics
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter(l => l.status === "Active").length;
  const totalUsers = licenses.reduce((sum, l) => sum + l.currentUsers, 0);
  const licensesByRegion = GRID_REGIONS.map(region => ({
    ...region,
    count: licenses.filter(l => l.region === region.value).length,
  }));

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
              Manage Grid App Licenses across Global Regions
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box className="mb-6" sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Licenses
                  </Typography>
                  <Typography variant="h4">{totalLicenses}</Typography>
                </Box>
                <KeyOutlined sx={{ fontSize: 40, color: "#8B0000" }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Licenses
                  </Typography>
                  <Typography variant="h4">{activeLicenses}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: "green" }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{totalUsers}</Typography>
                </Box>
                <Business sx={{ fontSize: 40, color: "#1976d2" }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Grid Regions
                  </Typography>
                  <Typography variant="h4">{GRID_REGIONS.length}</Typography>
                </Box>
                <Public sx={{ fontSize: 40, color: "#8B0000" }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="All Licenses" />
          <Tab label="Grid Apps" />
          <Tab label="Region Overview" />
        </Tabs>
      </Paper>

      {/* Tab 0: All Licenses */}
      {activeTab === 0 && (
        <Paper className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">License Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddLicense}
              sx={{ backgroundColor: "#8B0000" }}
            >
              Add License
            </Button>
          </Box>

          {/* Filters */}
          <Box className="flex gap-4 mb-4">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by app, company, or license key..."
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                label="Region"
                onChange={(e) => setSelectedRegion(e.target.value as GridRegion | "ALL")}
              >
                <MenuItem value="ALL">All Regions</MenuItem>
                {GRID_REGIONS.map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.icon} {region.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Licenses Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>App Name</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>License Key</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>{license.appName}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${GRID_REGIONS.find(r => r.value === license.region)?.icon} ${license.region}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{license.companyName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {license.licenseKey}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {license.currentUsers} / {license.maxUsers}
                    </TableCell>
                    <TableCell>{license.expiryDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={license.status}
                        color={getStatusColor(license.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditLicense(license)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteLicense(license.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredLicenses.length === 0 && (
            <Alert severity="info" className="mt-4">
              No licenses found matching your criteria.
            </Alert>
          )}
        </Paper>
      )}

      {/* Tab 1: Grid Apps */}
      {activeTab === 1 && (
        <Paper className="p-6">
          <Typography variant="h5" className="mb-4">
            Available CTS Grid Apps
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {GRID_APPS.map((app) => (
              <Box key={app.id} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box className="flex items-start justify-between mb-2">
                      <Box>
                        <Typography variant="h6">{app.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Version {app.version}
                        </Typography>
                      </Box>
                      <Storage sx={{ color: "#8B0000" }} />
                    </Box>
                    <Typography variant="body2" className="mb-3">
                      {app.description}
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {app.modules.map((module, idx) => (
                        <Chip key={idx} label={module} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Tab 2: Region Overview */}
      {activeTab === 2 && (
        <Paper className="p-6">
          <Typography variant="h5" className="mb-4">
            Grid Region Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {licensesByRegion.map((region) => {
              const regionLicenses = licenses.filter(l => l.region === region.value);
              const activeCount = regionLicenses.filter(l => l.status === "Active").length;
              const totalRegionUsers = regionLicenses.reduce((sum, l) => sum + l.currentUsers, 0);

              return (
                <Box key={region.value} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: '250px' }}>
                  <Card>
                    <CardContent>
                      <Box className="flex items-center gap-2 mb-3">
                        <Typography variant="h4">{region.icon}</Typography>
                        <Box>
                          <Typography variant="h6">{region.label}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {region.value}
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="space-y-2">
                        <Box className="flex justify-between">
                          <Typography variant="body2">Total Licenses:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {region.count}
                          </Typography>
                        </Box>
                        <Box className="flex justify-between">
                          <Typography variant="body2">Active:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="green">
                            {activeCount}
                          </Typography>
                        </Box>
                        <Box className="flex justify-between">
                          <Typography variant="body2">Total Users:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {totalRegionUsers}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLicense ? "Edit License" : "Add New License"}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <FormControl fullWidth>
              <InputLabel>Grid App</InputLabel>
              <Select
                value={formData.appName}
                label="Grid App"
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              >
                {GRID_APPS.map((app) => (
                  <MenuItem key={app.id} value={app.name}>
                    {app.name} (v{app.version})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Grid Region</InputLabel>
              <Select
                value={formData.region}
                label="Grid Region"
                onChange={(e) => setFormData({ ...formData, region: e.target.value as GridRegion })}
              >
                {GRID_REGIONS.map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.icon} {region.label} ({region.value})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Company ID"
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            />

            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />

            <TextField
              fullWidth
              type="number"
              label="Max Users"
              value={formData.maxUsers}
              onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
            />

            <TextField
              fullWidth
              type="date"
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveLicense}
            variant="contained"
            sx={{ backgroundColor: "#8B0000" }}
            disabled={!formData.appName || !formData.companyName || !formData.expiryDate}
          >
            {editingLicense ? "Update" : "Create"} License
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}