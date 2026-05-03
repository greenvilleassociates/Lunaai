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
} from "@mui/material";
import { AdminPanelSettings, Add } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface Role {
  id: number;
  roleid: string;
  roledescription: string;
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

  // New role form state
  const [newRole, setNewRole] = useState({
    roleid: "",
    roledescription: "",
  });

  // Check if user is superuser
  const isSuperUser = localStorage.getItem("role") === "superuser";

  useEffect(() => {
    if (isSuperUser) {
      loadRoles();
    }
  }, [isSuperUser]);

  const loadRoles = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const url = getApiUrl(API_CONFIG.ENDPOINTS.ROLES);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditMode(true);
      setCurrentRoleId(role.id);
      setNewRole({
        roleid: role.roleid,
        roledescription: role.roledescription,
      });
    } else {
      setEditMode(false);
      setCurrentRoleId(null);
      setNewRole({
        roleid: "",
        roledescription: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitRole = async () => {
    if (!newRole.roleid.trim() || !newRole.roledescription.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to manage roles");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editMode && currentRoleId
        ? getApiUrl(API_CONFIG.ENDPOINTS.ROLE_BY_ID(currentRoleId.toString()))
        : getApiUrl(API_CONFIG.ENDPOINTS.ROLES);

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      setSuccess(editMode ? "Role updated successfully!" : "Role created successfully!");
      setDialogOpen(false);
      loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this role? This may affect users assigned to this role.")) {
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id.toString()));
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

      setSuccess("Role deleted successfully!");
      loadRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  if (!isSuperUser) {
    return (
      <Alert severity="warning">
        Only superusers can manage system roles. Contact your system administrator.
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="mb-2">
            Role Management
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Define and manage system roles for LunaAI users
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
          Add Role
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

      {/* Roles Table */}
      <Paper className="p-6">
        <Box className="flex items-center gap-2 mb-4">
          <AdminPanelSettings />
          <Typography variant="h6">System Roles</Typography>
        </Box>

        {roles.length === 0 ? (
          <Box className="text-center py-8 text-slate-500">
            <Typography variant="body1">
              No roles found. Click "Add Role" to create your first role.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Role ID</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>
                      <Box className="font-semibold text-slate-700">{role.roleid}</Box>
                    </TableCell>
                    <TableCell>{role.roledescription}</TableCell>
                    <TableCell>
                      <Box className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(role)}
                          sx={{ color: "#1a1a1a" }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteRole(role.id)}
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

      {/* Add/Edit Role Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Role" : "Add New Role"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Role ID"
              value={newRole.roleid}
              onChange={(e) => setNewRole({ ...newRole, roleid: e.target.value })}
              required
              helperText="Unique identifier for the role (e.g., admin, user, manager)"
            />

            <TextField
              fullWidth
              label="Role Description"
              value={newRole.roledescription}
              onChange={(e) => setNewRole({ ...newRole, roledescription: e.target.value })}
              required
              multiline
              rows={3}
              helperText="Detailed description of the role's purpose and permissions"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitRole}
            variant="contained"
            disabled={loading || !newRole.roleid.trim() || !newRole.roledescription.trim()}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? "Update Role" : "Add Role"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
