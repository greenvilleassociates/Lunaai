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
  IconButton,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  Visibility,
  Campaign,
  AttachMoney,
  Refresh,
  Download,
  FilterList,
} from "@mui/icons-material";
import { addbaseApi } from "../services/apiService";
import type { Addbase } from "../types/api";

export function LunaAdBasePro() {
  const [adbaseEntries, setAdbaseEntries] = useState<Addbase[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Addbase | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");

  // Form state
  const [formData, setFormData] = useState<Partial<Addbase>>({
    addid: "",
    sourceip: "",
    destinationip: "",
    clientid: "",
    mktgurl: "",
    origplatform: "",
    targetplatform: "",
    uid: "",
    ulat: "",
    ulong: "",
    cost: 0,
    price: 0,
    discount: 0,
  });

  useEffect(() => {
    loadAdbaseEntries();
  }, []);

  const loadAdbaseEntries = async () => {
    try {
      setLoading(true);
      const data = await addbaseApi.getAll();
      setAdbaseEntries(data);
      setError("");
    } catch (err) {
      console.error("Failed to load adbase entries:", err);
      setError("Failed to load advertising campaigns. Using demo data.");
      // Load demo data
      setAdbaseEntries([
        {
          id: 1,
          addid: "AD-2026-001",
          clientid: "CL-001",
          mktgurl: "https://luna.capitoltechnology.net/campaign/spring2026",
          origplatform: "Google Ads",
          targetplatform: "Mobile Web",
          sourceip: "192.168.1.100",
          destinationip: "104.26.10.78",
          uid: "user-john",
          ulat: "38.9072",
          ulong: "-77.0369",
          cost: 250.50,
          price: 500.00,
          discount: 50.00,
        },
        {
          id: 2,
          addid: "AD-2026-002",
          clientid: "CL-002",
          mktgurl: "https://luna.capitoltechnology.net/campaign/ai-summit",
          origplatform: "Meta Ads",
          targetplatform: "Facebook",
          sourceip: "192.168.1.101",
          destinationip: "157.240.2.35",
          uid: "user-jane",
          ulat: "40.7128",
          ulong: "-74.0060",
          cost: 420.00,
          price: 850.00,
          discount: 85.00,
        },
        {
          id: 3,
          addid: "AD-2026-003",
          clientid: "CL-003",
          mktgurl: "https://luna.capitoltechnology.net/campaign/luna-launch",
          origplatform: "LinkedIn",
          targetplatform: "Desktop Web",
          sourceip: "192.168.1.102",
          destinationip: "108.174.10.10",
          uid: "user-mike",
          ulat: "37.7749",
          ulong: "-122.4194",
          cost: 680.00,
          price: 1200.00,
          discount: 120.00,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (entry?: Addbase) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData(entry);
    } else {
      setEditingEntry(null);
      setFormData({
        addid: "",
        sourceip: "",
        destinationip: "",
        clientid: "",
        mktgurl: "",
        origplatform: "",
        targetplatform: "",
        uid: localStorage.getItem("uid") || "",
        ulat: "",
        ulong: "",
        cost: 0,
        price: 0,
        discount: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEntry(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      if (editingEntry && editingEntry.id) {
        // Update existing campaign - exclude id from payload
        const { id, ...updateData } = formData;
        await addbaseApi.update(editingEntry.id, updateData);
        setSuccessMessage("Campaign updated successfully!");
      } else {
        // Create new campaign - exclude id from payload (MSSQL auto-generates)
        const { id, ...createData } = formData;
        await addbaseApi.create(createData);
        setSuccessMessage("Campaign created successfully!");
      }
      handleCloseDialog();
      loadAdbaseEntries();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      setError("Failed to save campaign. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await addbaseApi.delete(id);
      setSuccessMessage("Campaign deleted successfully!");
      loadAdbaseEntries();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      setError("Failed to delete campaign. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const calculateROI = (entry: Addbase) => {
    const cost = entry.cost || 0;
    const price = entry.price || 0;
    if (cost === 0) return 0;
    return (((price - cost) / cost) * 100).toFixed(1);
  };

  const calculateProfit = (entry: Addbase) => {
    const cost = entry.cost || 0;
    const price = entry.price || 0;
    const discount = entry.discount || 0;
    return (price - cost - discount).toFixed(2);
  };

  // Calculate totals
  const filteredEntries = filterPlatform === "all" 
    ? adbaseEntries 
    : adbaseEntries.filter(e => e.origplatform === filterPlatform);

  const totalCost = filteredEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  const totalRevenue = filteredEntries.reduce((sum, entry) => sum + (entry.price || 0), 0);
  const totalDiscount = filteredEntries.reduce((sum, entry) => sum + (entry.discount || 0), 0);
  const totalProfit = totalRevenue - totalCost - totalDiscount;
  const avgROI = totalCost > 0 ? (((totalRevenue - totalCost) / totalCost) * 100).toFixed(1) : "0";

  // Get unique platforms
  const platforms = ["all", ...new Set(adbaseEntries.map(e => e.origplatform).filter(Boolean))];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#000", mb: 0.5 }}>
            Luna AdBase Pro
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Marketing Campaign Tracking & Analytics for Capitol Technology Solutions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadAdbaseEntries} sx={{ bgcolor: "#f5f5f5" }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton sx={{ bgcolor: "#f5f5f5" }}>
              <Download />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}
          >
            New Campaign
          </Button>
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

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#8B0000" }}>
                    ${totalCost.toFixed(2)}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: "#8B0000", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#28a745" }}>
                    ${totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "#28a745", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Net Profit
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: totalProfit >= 0 ? "#28a745" : "#dc3545" }}>
                    ${totalProfit.toFixed(2)}
                  </Typography>
                </Box>
                <Campaign sx={{ fontSize: 40, color: "#000", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg. ROI
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#17a2b8" }}>
                    {avgROI}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "#17a2b8", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <FilterList />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Platform</InputLabel>
          <Select
            value={filterPlatform}
            label="Platform"
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            {platforms.map((platform) => (
              <MenuItem key={platform} value={platform}>
                {platform === "all" ? "All Platforms" : platform}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredEntries.length} of {adbaseEntries.length} campaigns
        </Typography>
      </Box>

      {/* Campaigns Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Campaign ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Client ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Target</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Profit</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ROI %</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Loading campaigns...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No campaigns found. Create your first campaign!
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{entry.addid}</TableCell>
                  <TableCell>{entry.clientid}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.origplatform}
                      size="small"
                      sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}
                    />
                  </TableCell>
                  <TableCell>{entry.targetplatform}</TableCell>
                  <TableCell>${(entry.cost || 0).toFixed(2)}</TableCell>
                  <TableCell>${(entry.price || 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: parseFloat(calculateProfit(entry)) >= 0 ? "#28a745" : "#dc3545", fontWeight: 600 }}>
                    ${calculateProfit(entry)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${calculateROI(entry)}%`}
                      size="small"
                      sx={{
                        bgcolor: parseFloat(calculateROI(entry)) > 0 ? "#d4edda" : "#f8d7da",
                        color: parseFloat(calculateROI(entry)) > 0 ? "#155724" : "#721c24",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleOpenDialog(entry)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Campaign">
                        <IconButton size="small" onClick={() => handleOpenDialog(entry)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Campaign">
                        <IconButton size="small" onClick={() => entry.id && handleDelete(entry.id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEntry ? "Edit Campaign" : "Create New Campaign"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Campaign ID"
                  value={formData.addid || ""}
                  onChange={(e) => setFormData({ ...formData, addid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client ID"
                  value={formData.clientid || ""}
                  onChange={(e) => setFormData({ ...formData, clientid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Origin Platform"
                  value={formData.origplatform || ""}
                  onChange={(e) => setFormData({ ...formData, origplatform: e.target.value })}
                  placeholder="e.g., Google Ads, Meta Ads, LinkedIn"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Platform"
                  value={formData.targetplatform || ""}
                  onChange={(e) => setFormData({ ...formData, targetplatform: e.target.value })}
                  placeholder="e.g., Mobile Web, Facebook, Desktop Web"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Marketing URL"
                  value={formData.mktgurl || ""}
                  onChange={(e) => setFormData({ ...formData, mktgurl: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Source IP"
                  value={formData.sourceip || ""}
                  onChange={(e) => setFormData({ ...formData, sourceip: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination IP"
                  value={formData.destinationip || ""}
                  onChange={(e) => setFormData({ ...formData, destinationip: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.ulat || ""}
                  onChange={(e) => setFormData({ ...formData, ulat: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.ulong || ""}
                  onChange={(e) => setFormData({ ...formData, ulong: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={formData.cost || 0}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: "$",
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Revenue"
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: "$",
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Discount"
                  type="number"
                  value={formData.discount || 0}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: "$",
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}
          >
            {editingEntry ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}