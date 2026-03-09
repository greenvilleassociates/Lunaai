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
} from "@mui/material";
import { ConfirmationNumber, Add } from "@mui/icons-material";
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

export function UserHelp() {
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    descr: "",
    severity: 1,
    email: "",
    fullname: "",
    bestcontactnumber: "",
    emplid: 0,
  });

  useEffect(() => {
    loadTickets();
    
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
        ticketdate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Help & Support
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Submit and track trouble tickets for LunaAI technical support
          </Typography>
        </div>
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

      {/* Tickets Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <ConfirmationNumber />
          <Typography variant="h6">My Tickets</Typography>
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

      {/* New Ticket Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit New Support Ticket</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Full Name"
              value={newTicket.fullname}
              onChange={(e) =>
                setNewTicket({ ...newTicket, fullname: e.target.value })
              }
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newTicket.email}
              onChange={(e) =>
                setNewTicket({ ...newTicket, email: e.target.value })
              }
              required
            />

            <TextField
              fullWidth
              label="Best Contact Number"
              value={newTicket.bestcontactnumber}
              onChange={(e) =>
                setNewTicket({ ...newTicket, bestcontactnumber: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Employee ID (Optional)"
              type="number"
              value={newTicket.emplid || ""}
              onChange={(e) =>
                setNewTicket({ ...newTicket, emplid: parseInt(e.target.value) || 0 })
              }
            />

            <FormControl fullWidth required>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newTicket.severity}
                label="Severity"
                onChange={(e) =>
                  setNewTicket({ ...newTicket, severity: e.target.value as number })
                }
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
              onChange={(e) =>
                setNewTicket({ ...newTicket, descr: e.target.value })
              }
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
    </div>
  );
}