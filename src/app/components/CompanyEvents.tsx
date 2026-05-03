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
  Chip,
} from "@mui/material";
import { Event, Add } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface CompanyEvent {
  id: number;
  eventid: string;
  description: string;
  startdate: string;
  enddate: string;
}

export function CompanyEvents() {
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    eventid: "",
    description: "",
    startdate: "",
    enddate: "",
  });

  // Check if user is superuser
  const isSuperUser = localStorage.getItem("role") === "superuser";

  useEffect(() => {
    if (isSuperUser) {
      loadEvents();
    }
  }, [isSuperUser]);

  const loadEvents = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.COMPANY_EVENTS);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Error loading company events:", err);
    }
  };

  const handleOpenDialog = (event?: CompanyEvent) => {
    if (event) {
      setEditMode(true);
      setCurrentEventId(event.id);
      // Format dates for datetime-local input
      const startDate = event.startdate ? new Date(event.startdate).toISOString().slice(0, 16) : "";
      const endDate = event.enddate ? new Date(event.enddate).toISOString().slice(0, 16) : "";
      setNewEvent({
        eventid: event.eventid,
        description: event.description,
        startdate: startDate,
        enddate: endDate,
      });
    } else {
      setEditMode(false);
      setCurrentEventId(null);
      setNewEvent({
        eventid: "",
        description: "",
        startdate: "",
        enddate: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitEvent = async () => {
    if (!newEvent.eventid.trim() || !newEvent.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!newEvent.startdate || !newEvent.enddate) {
      setError("Please provide both start and end dates");
      return;
    }

    // Validate that end date is after start date
    if (new Date(newEvent.enddate) <= new Date(newEvent.startdate)) {
      setError("End date must be after start date");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to manage company events");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editMode && currentEventId
        ? getApiUrl(API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(currentEventId.toString()))
        : getApiUrl(API_CONFIG.ENDPOINTS.COMPANY_EVENTS);

      const method = editMode ? "PUT" : "POST";

      // Convert dates to ISO format for API
      const eventData = {
        ...newEvent,
        startdate: new Date(newEvent.startdate).toISOString(),
        enddate: new Date(newEvent.enddate).toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(editMode ? "Event updated successfully!" : "Event created successfully!");
      setDialogOpen(false);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company event?")) {
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.COMPANY_EVENT_BY_ID(id.toString()));
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

      setSuccess("Event deleted successfully!");
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { label: "Upcoming", color: "info" as const };
    } else if (now > end) {
      return { label: "Completed", color: "default" as const };
    } else {
      return { label: "Active", color: "success" as const };
    }
  };

  if (!isSuperUser) {
    return (
      <Alert severity="warning">
        Only superusers can manage company events. Contact your system administrator.
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Company Events Management
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Define and manage company-wide events and milestones
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
          Add Event
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

      {/* Events Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <Event />
          <Typography variant="h6">Company Events</Typography>
        </Box>

        {events.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No events found. Click "Add Event" to create your first company event.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Event ID</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Start Date</strong></TableCell>
                  <TableCell><strong>End Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => {
                  const status = getEventStatus(event.startdate, event.enddate);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>{event.id}</TableCell>
                      <TableCell>
                        <Box className="font-semibold text-slate-700">{event.eventid}</Box>
                      </TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>{formatDate(event.startdate)}</TableCell>
                      <TableCell>{formatDate(event.enddate)}</TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box className="flex gap-2">
                          <Button
                            size="small"
                            onClick={() => handleOpenDialog(event)}
                            sx={{ color: "#1a1a1a" }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteEvent(event.id)}
                            sx={{ color: "#8B0000" }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Company Event" : "Add New Company Event"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Event ID"
              value={newEvent.eventid}
              onChange={(e) => setNewEvent({ ...newEvent, eventid: e.target.value })}
              required
              helperText="Unique identifier for the event (e.g., ANNUAL_REVIEW_2026, Q1_KICKOFF)"
            />

            <TextField
              fullWidth
              label="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              required
              multiline
              rows={3}
              helperText="Detailed description of the event"
            />

            <TextField
              fullWidth
              label="Start Date & Time"
              type="datetime-local"
              value={newEvent.startdate}
              onChange={(e) => setNewEvent({ ...newEvent, startdate: e.target.value })}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="End Date & Time"
              type="datetime-local"
              value={newEvent.enddate}
              onChange={(e) => setNewEvent({ ...newEvent, enddate: e.target.value })}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            {newEvent.startdate && newEvent.enddate && (
              <Alert severity="info" className="mt-2">
                Event duration: {Math.ceil(
                  (new Date(newEvent.enddate).getTime() - new Date(newEvent.startdate).getTime()) / 
                  (1000 * 60 * 60 * 24)
                )} days
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitEvent}
            variant="contained"
            disabled={
              loading || 
              !newEvent.eventid.trim() || 
              !newEvent.description.trim() || 
              !newEvent.startdate || 
              !newEvent.enddate
            }
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? "Update Event" : "Add Event"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
