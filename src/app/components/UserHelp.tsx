import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ConfirmationNumber,
  Add,
  Build,
  BugReport,
  Assignment,
  CalendarToday,
  Visibility,
  Inventory2,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface HelpTicket {
  id: number;
  ticketid: string;
  emplid: number;
  descr: string;
  severity: number;
  userid: number;
  email: string;
  fullname: string;
  bestcontactnumber: string;
  replied: string;
  repliedmanagerid: string;
  repliedmanagerphone: string;
  repliedmanageremail: string;
  ticketdate: string;
  responsedate: string;
}

interface WorkOrder {
  id: string;
  workOrderId: string;
  type: "Trouble" | "Work Request";
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Scheduled" | "Completed" | "Cancelled";
  createdDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTo?: string;
  inventoryItem?: string;
  estimatedHours?: number;
  notes?: string;
}

interface ScheduledChange {
  id: string;
  changeId: string;
  inventoryItem: string;
  changeType: "Upgrade" | "Maintenance" | "Replacement" | "Configuration" | "Inspection";
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  technician: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Postponed";
  impact: "Low" | "Medium" | "High";
  notes?: string;
}

export function UserHelp() {
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [scheduledChanges, setScheduledChanges] = useState<ScheduledChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workOrderDialogOpen, setWorkOrderDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    descr: "",
    severity: 1,
    email: "",
    fullname: "",
    bestcontactnumber: "",
    emplid: 0,
  });

  // New work order form state
  const [newWorkOrder, setNewWorkOrder] = useState({
    type: "Trouble" as "Trouble" | "Work Request",
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    inventoryItem: "",
    estimatedHours: 0,
  });

  useEffect(() => {
    loadTickets();
    loadWorkOrders();
    loadScheduledChanges();

    // Pre-fill user info from localStorage
    const uid = localStorage.getItem("uid");
    const username = localStorage.getItem("username") || "";
    const email = localStorage.getItem("email") || "";

    if (uid) {
      setNewTicket((prev) => ({
        ...prev,
        userid: parseInt(uid) || 0,
        fullname: username,
        email: email,
      }));
    }
  }, []);

  const loadTickets = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        setError("Please log in to view tickets");
        return;
      }

      const url = getApiUrl(API_CONFIG.ENDPOINTS.USER_HELP);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    }
  };

  const loadWorkOrders = () => {
    // Load from localStorage or initialize with mock data
    const stored = localStorage.getItem("workOrders");
    if (stored) {
      setWorkOrders(JSON.parse(stored));
    } else {
      const mockWorkOrders: WorkOrder[] = [
        {
          id: "1",
          workOrderId: "WO-2024-001",
          type: "Trouble",
          title: "Network connectivity issues",
          description: "Intermittent network disconnections affecting workstation",
          priority: "High",
          status: "In Progress",
          createdDate: "2024-03-10",
          scheduledDate: "2024-03-13",
          assignedTo: "Tech Support Team",
          inventoryItem: "Workstation-PC-001",
          estimatedHours: 2,
        },
        {
          id: "2",
          workOrderId: "WO-2024-002",
          type: "Work Request",
          title: "Software installation request",
          description: "Need Adobe Creative Cloud installed on design workstation",
          priority: "Medium",
          status: "Scheduled",
          createdDate: "2024-03-11",
          scheduledDate: "2024-03-15",
          assignedTo: "IT Services",
          inventoryItem: "Workstation-DESIGN-003",
          estimatedHours: 1,
        },
      ];
      setWorkOrders(mockWorkOrders);
      localStorage.setItem("workOrders", JSON.stringify(mockWorkOrders));
    }
  };

  const loadScheduledChanges = () => {
    // Load from localStorage or initialize with mock data
    const stored = localStorage.getItem("scheduledChanges");
    if (stored) {
      setScheduledChanges(JSON.parse(stored));
    } else {
      const mockChanges: ScheduledChange[] = [
        {
          id: "1",
          changeId: "CHG-2024-001",
          inventoryItem: "Server-DB-MAIN-01",
          changeType: "Maintenance",
          description: "Quarterly database maintenance and optimization",
          scheduledDate: "2024-03-20",
          scheduledTime: "02:00 AM",
          estimatedDuration: "4 hours",
          technician: "Database Admin Team",
          status: "Scheduled",
          impact: "Medium",
          notes: "Database will be in read-only mode during maintenance",
        },
        {
          id: "2",
          changeId: "CHG-2024-002",
          inventoryItem: "Router-NET-CORE-01",
          changeType: "Upgrade",
          description: "Firmware upgrade to latest stable version",
          scheduledDate: "2024-03-14",
          scheduledTime: "11:00 PM",
          estimatedDuration: "2 hours",
          technician: "Network Operations",
          status: "Scheduled",
          impact: "High",
          notes: "Brief network outage expected during upgrade",
        },
        {
          id: "3",
          changeId: "CHG-2024-003",
          inventoryItem: "Workstation-PC-001",
          changeType: "Configuration",
          description: "Network adapter configuration update",
          scheduledDate: "2024-03-13",
          scheduledTime: "10:00 AM",
          estimatedDuration: "30 minutes",
          technician: "John Smith",
          status: "Scheduled",
          impact: "Low",
        },
      ];
      setScheduledChanges(mockChanges);
      localStorage.setItem("scheduledChanges", JSON.stringify(mockChanges));
    }
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.descr.trim()) {
      setError("Please enter a ticket description");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to submit a ticket");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Generate ticket ID
      const ticketId = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Prepare payload with only the required fields
      const payload = {
        ticketid: ticketId,
        emplid: newTicket.emplid,
        descr: newTicket.descr,
        severity: newTicket.severity,
        userid: parseInt(uid) || 0,
        email: newTicket.email,
        fullname: newTicket.fullname,
        bestcontactnumber: newTicket.bestcontactnumber,
        ticketdate: new Date().toISOString().split("T")[0],
      };

      const url = getApiUrl(API_CONFIG.ENDPOINTS.USER_HELP);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(`Ticket ${ticketId} submitted successfully!`);
      setDialogOpen(false);

      // Reset form
      setNewTicket({
        descr: "",
        severity: 1,
        email: newTicket.email,
        fullname: newTicket.fullname,
        bestcontactnumber: newTicket.bestcontactnumber,
        emplid: 0,
      });

      // Reload tickets
      loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWorkOrder = () => {
    if (!newWorkOrder.title.trim() || !newWorkOrder.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    const workOrderId = `WO-${new Date().getFullYear()}-${String(workOrders.length + 1).padStart(3, "0")}`;
    const username = localStorage.getItem("username") || "Unknown User";

    const workOrder: WorkOrder = {
      id: Date.now().toString(),
      workOrderId,
      type: newWorkOrder.type,
      title: newWorkOrder.title,
      description: newWorkOrder.description,
      priority: newWorkOrder.priority,
      status: "Open",
      createdDate: new Date().toISOString().split("T")[0],
      inventoryItem: newWorkOrder.inventoryItem || undefined,
      estimatedHours: newWorkOrder.estimatedHours || undefined,
    };

    const updatedWorkOrders = [...workOrders, workOrder];
    setWorkOrders(updatedWorkOrders);
    localStorage.setItem("workOrders", JSON.stringify(updatedWorkOrders));

    setSuccess(`Work Order ${workOrderId} created successfully!`);
    setWorkOrderDialogOpen(false);

    // Reset form
    setNewWorkOrder({
      type: "Trouble",
      title: "",
      description: "",
      priority: "Medium",
      inventoryItem: "",
      estimatedHours: 0,
    });
  };

  const handleViewWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setViewDialogOpen(true);
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "info";
      case 2:
        return "warning";
      case 3:
        return "error";
      default:
        return "default";
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1:
        return "Low";
      case 2:
        return "Medium";
      case 3:
        return "High";
      default:
        return "Unknown";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "info";
      case "Medium":
        return "warning";
      case "High":
        return "error";
      case "Critical":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "default";
      case "In Progress":
        return "info";
      case "Scheduled":
        return "warning";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      case "Postponed":
        return "warning";
      default:
        return "default";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Low":
        return "success";
      case "Medium":
        return "warning";
      case "High":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Help & Support Center
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Submit tickets, work orders, and view scheduled changes
          </Typography>
        </div>
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

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<ConfirmationNumber />} label="Support Tickets" />
          <Tab icon={<Build />} label="Work Orders" />
          <Tab icon={<CalendarToday />} label="Scheduled Changes" />
        </Tabs>
      </Paper>

      {/* Tab 0: Support Tickets */}
      {activeTab === 0 && (
        <Paper className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Box className="flex items-center gap-2">
              <ConfirmationNumber />
              <Typography variant="h6">My Support Tickets</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                backgroundColor: "#1a1a1a",
                "&:hover": { backgroundColor: "#2a2a2a" },
              }}
            >
              New Ticket
            </Button>
          </Box>

          {tickets.length === 0 ? (
            <Box className="text-center py-8 text-slate-500">
              <Typography variant="body1">
                No tickets found. Click "New Ticket" to submit your first support request.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell><strong>Ticket ID</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Severity</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Submitted</strong></TableCell>
                    <TableCell><strong>Response Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Typography variant="body2" className="font-mono">
                          {ticket.ticketid}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" className="line-clamp-2">
                          {ticket.descr}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getSeverityLabel(ticket.severity)}
                          color={getSeverityColor(ticket.severity) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.replied ? "Replied" : "Open"}
                          color={ticket.replied ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(ticket.ticketdate)}</TableCell>
                      <TableCell>{formatDate(ticket.responsedate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab 1: Work Orders */}
      {activeTab === 1 && (
        <Paper className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Box className="flex items-center gap-2">
              <Build />
              <Typography variant="h6">Work Orders</Typography>
            </Box>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={() => {
                  setNewWorkOrder({ ...newWorkOrder, type: "Trouble" });
                  setWorkOrderDialogOpen(true);
                }}
                sx={{ borderColor: "#8B0000", color: "#8B0000" }}
              >
                Report Trouble
              </Button>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => {
                  setNewWorkOrder({ ...newWorkOrder, type: "Work Request" });
                  setWorkOrderDialogOpen(true);
                }}
                sx={{ backgroundColor: "#8B0000" }}
              >
                Request Work
              </Button>
            </Box>
          </Box>

          {workOrders.length === 0 ? (
            <Box className="text-center py-8 text-slate-500">
              <Typography variant="body1">
                No work orders found. Create a trouble report or work request to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell><strong>Work Order ID</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Inventory Item</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Scheduled</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell>
                        <Typography variant="body2" className="font-mono">
                          {wo.workOrderId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={wo.type === "Trouble" ? <BugReport /> : <Assignment />}
                          label={wo.type}
                          size="small"
                          color={wo.type === "Trouble" ? "error" : "primary"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2">{wo.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wo.priority}
                          color={getPriorityColor(wo.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wo.status}
                          color={getStatusColor(wo.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-slate-600">
                          {wo.inventoryItem || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(wo.createdDate)}</TableCell>
                      <TableCell>{wo.scheduledDate ? formatDate(wo.scheduledDate) : "N/A"}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewWorkOrder(wo)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Tab 2: Scheduled Changes */}
      {activeTab === 2 && (
        <Paper className="p-6">
          <Box className="flex items-center gap-2 mb-4">
            <CalendarToday />
            <Typography variant="h6">Scheduled Changes to Your Inventory</Typography>
          </Box>

          {scheduledChanges.length === 0 ? (
            <Box className="text-center py-8 text-slate-500">
              <Typography variant="body1">
                No scheduled changes for your inventory items.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {scheduledChanges.map((change) => (
                <Card key={change.id} variant="outlined">
                  <CardContent>
                    <Box className="flex justify-between items-start mb-3">
                      <Box>
                        <Box className="flex items-center gap-2 mb-1">
                          <Inventory2 sx={{ color: "#8B0000" }} />
                          <Typography variant="h6">{change.inventoryItem}</Typography>
                        </Box>
                        <Typography variant="body2" className="font-mono text-slate-600">
                          {change.changeId}
                        </Typography>
                      </Box>
                      <Box className="flex gap-1">
                        <Chip
                          label={change.changeType}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={change.status}
                          color={getStatusColor(change.status) as any}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography variant="body1" className="mb-3">
                      {change.description}
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Scheduled Date & Time
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(change.scheduledDate)} at {change.scheduledTime}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2">{change.estimatedDuration}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Technician
                        </Typography>
                        <Typography variant="body2">{change.technician}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Impact Level
                        </Typography>
                        <Typography variant="body2">
                          <Chip
                            label={change.impact}
                            color={getImpactColor(change.impact) as any}
                            size="small"
                          />
                        </Typography>
                      </Box>
                    </Box>

                    {change.notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Note:</strong> {change.notes}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* New Ticket Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit New Support Ticket</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Full Name"
              value={newTicket.fullname}
              onChange={(e) => setNewTicket({ ...newTicket, fullname: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newTicket.email}
              onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Best Contact Number"
              value={newTicket.bestcontactnumber}
              onChange={(e) => setNewTicket({ ...newTicket, bestcontactnumber: e.target.value })}
            />

            <TextField
              fullWidth
              label="Employee ID (Optional)"
              type="number"
              value={newTicket.emplid || ""}
              onChange={(e) => setNewTicket({ ...newTicket, emplid: parseInt(e.target.value) || 0 })}
            />

            <FormControl fullWidth required>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newTicket.severity}
                label="Severity"
                onChange={(e) => setNewTicket({ ...newTicket, severity: e.target.value as number })}
              >
                <MenuItem value={1}>Low - General inquiry</MenuItem>
                <MenuItem value={2}>Medium - Feature not working</MenuItem>
                <MenuItem value={3}>High - Critical system issue</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={6}
              value={newTicket.descr}
              onChange={(e) => setNewTicket({ ...newTicket, descr: e.target.value })}
              placeholder="Please describe your issue in detail..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitTicket}
            variant="contained"
            disabled={loading || !newTicket.descr.trim()}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Submit Ticket"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Work Order Dialog */}
      <Dialog
        open={workOrderDialogOpen}
        onClose={() => setWorkOrderDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {newWorkOrder.type === "Trouble" ? "Report Trouble" : "Request Work"}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newWorkOrder.type}
                label="Type"
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, type: e.target.value as "Trouble" | "Work Request" })}
              >
                <MenuItem value="Trouble">Trouble (Issue/Problem)</MenuItem>
                <MenuItem value="Work Request">Work Request</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              value={newWorkOrder.title}
              onChange={(e) => setNewWorkOrder({ ...newWorkOrder, title: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newWorkOrder.description}
              onChange={(e) => setNewWorkOrder({ ...newWorkOrder, description: e.target.value })}
              placeholder="Describe the issue or work request in detail..."
              required
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newWorkOrder.priority}
                label="Priority"
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, priority: e.target.value as any })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Inventory Item (Optional)"
              value={newWorkOrder.inventoryItem}
              onChange={(e) => setNewWorkOrder({ ...newWorkOrder, inventoryItem: e.target.value })}
              placeholder="e.g., Workstation-PC-001"
            />

            <TextField
              fullWidth
              type="number"
              label="Estimated Hours (Optional)"
              value={newWorkOrder.estimatedHours || ""}
              onChange={(e) => setNewWorkOrder({ ...newWorkOrder, estimatedHours: parseFloat(e.target.value) || 0 })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkOrderDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitWorkOrder}
            variant="contained"
            sx={{ backgroundColor: "#8B0000" }}
            disabled={!newWorkOrder.title.trim() || !newWorkOrder.description.trim()}
          >
            Submit Work Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Work Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Work Order Details</DialogTitle>
        <DialogContent>
          {selectedWorkOrder && (
            <Box className="space-y-4 pt-2">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Work Order ID
                </Typography>
                <Typography variant="h6" className="font-mono">
                  {selectedWorkOrder.workOrderId}
                </Typography>
              </Box>

              <Box className="flex gap-2">
                <Chip
                  icon={selectedWorkOrder.type === "Trouble" ? <BugReport /> : <Assignment />}
                  label={selectedWorkOrder.type}
                  color={selectedWorkOrder.type === "Trouble" ? "error" : "primary"}
                  variant="outlined"
                />
                <Chip label={selectedWorkOrder.priority} color={getPriorityColor(selectedWorkOrder.priority) as any} />
                <Chip label={selectedWorkOrder.status} color={getStatusColor(selectedWorkOrder.status) as any} />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1">{selectedWorkOrder.title}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{selectedWorkOrder.description}</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body2">{formatDate(selectedWorkOrder.createdDate)}</Typography>
                </Box>
                {selectedWorkOrder.scheduledDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scheduled Date
                    </Typography>
                    <Typography variant="body2">{formatDate(selectedWorkOrder.scheduledDate)}</Typography>
                  </Box>
                )}
              </Box>

              {selectedWorkOrder.inventoryItem && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Inventory Item
                  </Typography>
                  <Typography variant="body2">{selectedWorkOrder.inventoryItem}</Typography>
                </Box>
              )}

              {selectedWorkOrder.assignedTo && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body2">{selectedWorkOrder.assignedTo}</Typography>
                </Box>
              )}

              {selectedWorkOrder.estimatedHours && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Hours
                  </Typography>
                  <Typography variant="body2">{selectedWorkOrder.estimatedHours} hours</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
