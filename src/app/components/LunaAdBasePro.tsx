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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Grid } from "@mui/material";
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
  PowerSettingsNew,
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
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const [formData, setFormData] = useState<Partial<Addbase>>({
    addid: "",
    sourceip: "",
    destinationip: "",
    clientid: "",
    customername: "",
    mktgurl: "",
    origplatform: "",
    targetplatform: "",
    uid: "",
    ulat: "",
    ulong: "",
    cost: 0,
    price: 0,
    discount: 0,
    isactive: true,
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
      setAdbaseEntries([
        {
          id: 1,
          addid: "AD-2026-001",
          clientid: "CL-001",
          customername: "Coca-Cola Enterprises",
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
          isactive: true,
        },
        {
          id: 2,
          addid: "AD-2026-002",
          clientid: "CL-002",
          customername: "Adobe Systems Inc.",
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
          isactive: false,
        },
        {
          id: 3,
          addid: "AD-2026-003",
          clientid: "CL-003",
          customername: "Capitol Technology Solutions",
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
          isactive: true,
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
        customername: "",
        mktgurl: "",
        origplatform: "",
        targetplatform: "",
        uid: localStorage.getItem("uid") || "",
        ulat: "",
        ulong: "",
        cost: 0,
        price: 0,
        discount: 0,
        isactive: true,
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
        const { id, ...updateData } = formData;
        await addbaseApi.update(editingEntry.id, updateData);
        setSuccessMessage("Campaign updated successfully!");
      } else {
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

  const handleToggleActive = async (entry: Addbase) => {
    if (!entry.id) return;
    const nowActive = !entry.isactive;
    // Optimistic UI update
    setAdbaseEntries(prev =>
      prev.map(e => e.id === entry.id ? { ...e, isactive: nowActive } : e)
    );
    try {
      await addbaseApi.update(entry.id, { isactive: nowActive });
      setSuccessMessage(`Campaign ${nowActive ? "enabled" : "disabled"} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      // Revert on failure
      setAdbaseEntries(prev =>
        prev.map(e => e.id === entry.id ? { ...e, isactive: !nowActive } : e)
      );
      setError("Failed to update campaign status.");
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

  const filteredEntries = adbaseEntries
    .filter(e => filterPlatform === "all" || e.origplatform === filterPlatform)
    .filter(e => {
      if (filterStatus === "active") return e.isactive !== false;
      if (filterStatus === "inactive") return e.isactive === false;
      return true;
    });

  const totalCost = filteredEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  const totalRevenue = filteredEntries.reduce((sum, entry) => sum + (entry.price || 0), 0);
  const totalDiscount = filteredEntries.reduce((sum, entry) => sum + (entry.discount || 0), 0);
  const totalProfit = totalRevenue - totalCost - totalDiscount;
  const avgROI = totalCost > 0 ? (((totalRevenue - totalCost) / totalCost) * 100).toFixed(1) : "0";

  const platforms = ["all", ...new Set(adbaseEntries.map(e => e.origplatform).filter(Boolean))];

  const activeCount = adbaseEntries.filter(e => e.isactive !== false).length;
  const inactiveCount = adbaseEntries.filter(e => e.isactive === false).length;

  const bannerAdImpressions = adbaseEntries.filter(
    e => e.origplatform === "web-login" && e.targetplatform === "banner-ad"
  );

  const commercialNames: Record<string, string> = {
    "ad-001": "World Cup 2026",
    "ad-002": "Corona Extra",
    "ad-003": "Coppertone SPORT",
    "ad-004": "Heineken",
    "ad-005": "Neutrogena Beach Defense",
    "ad-006": "Premier League",
    "ad-007": "Modelo Especial",
    "ad-008": "Hawaiian Tropic",
  };

  const impressionsByAd = bannerAdImpressions.reduce((acc, entry) => {
    const addid = entry.addid || "unknown";
    if (!acc[addid]) {
      acc[addid] = { addid, count: 0, uniqueUsers: new Set<string>(), firstSeen: entry.id, lastSeen: entry.id };
    }
    acc[addid].count += 1;
    if (entry.uid) acc[addid].uniqueUsers.add(entry.uid);
    return acc;
  }, {} as Record<string, { addid: string; count: number; uniqueUsers: Set<string>; firstSeen: number; lastSeen: number }>);

  const bannerAdStats = Object.values(impressionsByAd).map(stat => ({
    addid: stat.addid,
    name: commercialNames[stat.addid] || stat.addid,
    impressions: stat.count,
    uniqueUsers: stat.uniqueUsers.size,
  }));

  const totalBannerImpressions = bannerAdImpressions.length;

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

      {/* Banner Ad Impressions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#000", mb: 2 }}>
          Banner Ad Impressions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#f0f4ff" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Impressions</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
                      {totalBannerImpressions.toLocaleString()}
                    </Typography>
                  </Box>
                  <Visibility sx={{ fontSize: 40, color: "#1976d2", opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#fff3e0" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Ads</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#f57c00" }}>
                      {bannerAdStats.length}
                    </Typography>
                  </Box>
                  <Campaign sx={{ fontSize: 40, color: "#f57c00", opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                <TableCell sx={{ fontWeight: 600 }}>Ad ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Commercial Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Impressions</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unique Users</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bannerAdStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No banner ad impressions tracked yet</TableCell>
                </TableRow>
              ) : (
                bannerAdStats
                  .sort((a, b) => b.impressions - a.impressions)
                  .map((stat) => (
                    <TableRow key={stat.addid} hover>
                      <TableCell>
                        <Chip label={stat.addid} size="small" sx={{ bgcolor: "#e3f2fd" }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{stat.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Visibility fontSize="small" sx={{ color: "#1976d2" }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {stat.impressions.toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{stat.uniqueUsers.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#8B0000" }}>
                    ${totalCost.toFixed(2)}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: "#8B0000", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#28a745" }}>
                    ${totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "#28a745", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Net Profit</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: totalProfit >= 0 ? "#28a745" : "#dc3545" }}>
                    ${totalProfit.toFixed(2)}
                  </Typography>
                </Box>
                <Campaign sx={{ fontSize: 40, color: "#000", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg. ROI</Typography>
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

      {/* Filters */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <FilterList />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Platform</InputLabel>
          <Select value={filterPlatform} label="Platform" onChange={(e) => setFilterPlatform(e.target.value)}>
            {platforms.map((platform) => (
              <MenuItem key={platform} value={platform}>
                {platform === "all" ? "All Platforms" : platform}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          >
            <MenuItem value="all">All ({adbaseEntries.length})</MenuItem>
            <MenuItem value="active">Active ({activeCount})</MenuItem>
            <MenuItem value="inactive">Inactive ({inactiveCount})</MenuItem>
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
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Campaign ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
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
                <TableCell colSpan={11} align="center">Loading campaigns...</TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">No campaigns found. Create your first campaign!</TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => {
                const inactive = entry.isactive === false;
                return (
                  <TableRow
                    key={entry.id}
                    hover
                    sx={{ opacity: inactive ? 0.55 : 1, bgcolor: inactive ? "#fafafa" : "inherit" }}
                  >
                    <TableCell>
                      <Chip
                        label={inactive ? "Inactive" : "Active"}
                        size="small"
                        sx={{
                          bgcolor: inactive ? "#f0f0f0" : "#d4edda",
                          color: inactive ? "#888" : "#155724",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textDecoration: inactive ? "line-through" : "none", color: inactive ? "#999" : "inherit" }}>
                      {entry.addid}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{entry.customername || "—"}</TableCell>
                    <TableCell>{entry.clientid}</TableCell>
                    <TableCell>
                      <Chip label={entry.origplatform} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }} />
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
                        <Tooltip title={inactive ? "Enable Campaign" : "Disable Campaign"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(entry)}
                            sx={{ color: inactive ? "#28a745" : "#f57c00" }}
                          >
                            <PowerSettingsNew fontSize="small" />
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingEntry ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Campaign ID" value={formData.addid || ""}
                  onChange={(e) => setFormData({ ...formData, addid: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Client ID" value={formData.clientid || ""}
                  onChange={(e) => setFormData({ ...formData, clientid: e.target.value })} />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.customername || ""}
                  onChange={(e) => setFormData({ ...formData, customername: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Origin Platform" value={formData.origplatform || ""}
                  onChange={(e) => setFormData({ ...formData, origplatform: e.target.value })}
                  placeholder="e.g., Google Ads, Meta Ads, LinkedIn" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Target Platform" value={formData.targetplatform || ""}
                  onChange={(e) => setFormData({ ...formData, targetplatform: e.target.value })}
                  placeholder="e.g., Mobile Web, Facebook, Desktop Web" />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Marketing URL" value={formData.mktgurl || ""}
                  onChange={(e) => setFormData({ ...formData, mktgurl: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Source IP" value={formData.sourceip || ""}
                  onChange={(e) => setFormData({ ...formData, sourceip: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Destination IP" value={formData.destinationip || ""}
                  onChange={(e) => setFormData({ ...formData, destinationip: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Latitude" value={formData.ulat || ""}
                  onChange={(e) => setFormData({ ...formData, ulat: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Longitude" value={formData.ulong || ""}
                  onChange={(e) => setFormData({ ...formData, ulong: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Cost" type="number" value={formData.cost || 0}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: "$" }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Revenue" type="number" value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: "$" }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Discount" type="number" value={formData.discount || 0}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: "$" }} />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isactive !== false}
                      onChange={(e) => setFormData({ ...formData, isactive: e.target.checked })}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#28a745" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#28a745" } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formData.isactive !== false ? "Active — campaign is running" : "Inactive — campaign is paused"}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#660000" } }}>
            {editingEntry ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
