import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Shield,
  Person,
  Lock,
  AdminPanelSettings,
  Search,
  FilterList,
  Refresh,
  Download,
  Info,
  Warning,
  Error,
  CheckCircle,
  AccessTime,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  location?: string;
  severity: "info" | "warning" | "error" | "success";
  category: string;
}

interface UserSession {
  sessionid: number;
  uid: number;
  username: string;
  token: string;
  sessionstart: string;
  sessionend?: string;
  sessioncomplete: number;
  ipaddress?: string;
  latitude?: string;
  longitude?: string;
}

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
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for demonstration
const MOCK_USER_LOGS: LogEntry[] = [
  { id: "ul-001", timestamp: "2026-03-13 14:23:15", user: "john.doe@cts.com", action: "Login", details: "Successful login", ipAddress: "192.168.1.100", location: "Washington, DC", severity: "success", category: "Authentication" },
  { id: "ul-002", timestamp: "2026-03-13 14:15:42", user: "sarah.smith@cts.com", action: "Logout", details: "User logged out", ipAddress: "192.168.1.105", location: "San Francisco, CA", severity: "info", category: "Authentication" },
  { id: "ul-003", timestamp: "2026-03-13 13:58:23", user: "mike.johnson@cts.com", action: "Profile Update", details: "Updated contact information", ipAddress: "192.168.1.110", location: "New York, NY", severity: "info", category: "Profile" },
  { id: "ul-004", timestamp: "2026-03-13 13:45:11", user: "emma.davis@cts.com", action: "Password Change", details: "Password successfully changed", ipAddress: "192.168.1.115", location: "Chicago, IL", severity: "success", category: "Security" },
  { id: "ul-005", timestamp: "2026-03-13 13:30:55", user: "alex.wilson@cts.com", action: "Login Failed", details: "Invalid credentials", ipAddress: "192.168.1.120", location: "Austin, TX", severity: "warning", category: "Authentication" },
];

const MOCK_USER_ACTIONS: LogEntry[] = [
  { id: "ua-001", timestamp: "2026-03-13 14:30:22", user: "john.doe@cts.com", action: "Module Access", details: "Accessed SuperLuna AI Orchestrator", ipAddress: "192.168.1.100", location: "Washington, DC", severity: "info", category: "Access" },
  { id: "ua-002", timestamp: "2026-03-13 14:18:35", user: "sarah.smith@cts.com", action: "File Upload", details: "Uploaded document: quarterly_report.pdf", ipAddress: "192.168.1.105", location: "San Francisco, CA", severity: "info", category: "File Operations" },
  { id: "ua-003", timestamp: "2026-03-13 14:05:17", user: "mike.johnson@cts.com", action: "Data Export", details: "Exported user report (CSV)", ipAddress: "192.168.1.110", location: "New York, NY", severity: "warning", category: "Data" },
  { id: "ua-004", timestamp: "2026-03-13 13:52:44", user: "emma.davis@cts.com", action: "Settings Change", details: "Updated notification preferences", ipAddress: "192.168.1.115", location: "Chicago, IL", severity: "info", category: "Settings" },
  { id: "ua-005", timestamp: "2026-03-13 13:40:28", user: "alex.wilson@cts.com", action: "License Activation", details: "Activated CTS Grid Connector License", ipAddress: "192.168.1.120", location: "Austin, TX", severity: "success", category: "Licensing" },
];

const MOCK_AUTH_NOTICES: LogEntry[] = [
  { id: "an-001", timestamp: "2026-03-13 14:35:10", user: "system", action: "MFA Required", details: "Multi-factor authentication required for admin.user@cts.com", ipAddress: "192.168.1.200", severity: "warning", category: "Security Policy" },
  { id: "an-002", timestamp: "2026-03-13 14:20:45", user: "system", action: "Password Expiry", details: "Password expires in 7 days for 5 users", ipAddress: "System", severity: "warning", category: "Password Policy" },
  { id: "an-003", timestamp: "2026-03-13 14:10:33", user: "system", action: "Session Timeout", details: "User session timed out: inactive.user@cts.com", ipAddress: "192.168.1.150", severity: "info", category: "Session Management" },
  { id: "an-004", timestamp: "2026-03-13 13:55:21", user: "system", action: "Suspicious Login", details: "Login from new location detected: admin.user@cts.com from Moscow, Russia", ipAddress: "85.143.23.45", location: "Moscow, Russia", severity: "error", category: "Threat Detection" },
  { id: "an-005", timestamp: "2026-03-13 13:42:18", user: "system", action: "Account Locked", details: "Account locked due to 5 failed login attempts: test.user@cts.com", ipAddress: "192.168.1.180", severity: "error", category: "Account Security" },
];

const MOCK_SYSADMIN_LOGS: LogEntry[] = [
  { id: "sa-001", timestamp: "2026-03-13 14:40:55", user: "admin@cts.com", action: "User Created", details: "Created new user account: newuser@cts.com", ipAddress: "192.168.1.1", location: "Corporate HQ", severity: "success", category: "User Management" },
  { id: "sa-002", timestamp: "2026-03-13 14:25:30", user: "admin@cts.com", action: "Role Assignment", details: "Assigned 'Manager' role to sarah.smith@cts.com", ipAddress: "192.168.1.1", location: "Corporate HQ", severity: "info", category: "Access Control" },
  { id: "sa-003", timestamp: "2026-03-13 14:12:18", user: "sysadmin@cts.com", action: "License Update", details: "Updated Enterprise license allocation", ipAddress: "192.168.1.2", location: "Corporate HQ", severity: "warning", category: "Licensing" },
  { id: "sa-004", timestamp: "2026-03-13 14:00:45", user: "sysadmin@cts.com", action: "System Configuration", details: "Modified API rate limit settings", ipAddress: "192.168.1.2", location: "Corporate HQ", severity: "warning", category: "Configuration" },
  { id: "sa-005", timestamp: "2026-03-13 13:48:33", user: "admin@cts.com", action: "Database Backup", details: "Initiated manual database backup", ipAddress: "192.168.1.1", location: "Corporate HQ", severity: "success", category: "Maintenance" },
];

export function Enterprise9Security() {
  const [currentTab, setCurrentTab] = useState(0);
  const [userLogs, setUserLogs] = useState<LogEntry[]>(MOCK_USER_LOGS);
  const [userActions, setUserActions] = useState<LogEntry[]>(MOCK_USER_ACTIONS);
  const [authNotices, setAuthNotices] = useState<LogEntry[]>(MOCK_AUTH_NOTICES);
  const [sysAdminLogs, setSysAdminLogs] = useState<LogEntry[]>(MOCK_SYSADMIN_LOGS);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const username = localStorage.getItem("username") || "User";
  const uid = localStorage.getItem("uid");
  const userRole = localStorage.getItem("role");
  const isSuperUser = userRole === "superuser";
  const isAdmin = userRole === "admin";

  const hasAccess = isSuperUser || isAdmin;

  // Load user sessions from API
  useEffect(() => {
    if (hasAccess && currentTab === 4) {
      loadUserSessions();
    }
  }, [hasAccess, currentTab]);

  const loadUserSessions = async () => {
    setSessionsLoading(true);
    try {
      const sessionUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_SESSION);
      const response = await fetch(sessionUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserSessions(data);
        console.log("✅ Loaded user sessions from API:", data.length);
      } else {
        console.warn("⚠️ Failed to load user sessions from API");
      }
    } catch (error) {
      console.error("❌ Error loading user sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckCircle fontSize="small" sx={{ color: "#16a34a" }} />;
      case "warning":
        return <Warning fontSize="small" sx={{ color: "#f59e0b" }} />;
      case "error":
        return <Error fontSize="small" sx={{ color: "#dc2626" }} />;
      default:
        return <Info fontSize="small" sx={{ color: "#3b82f6" }} />;
    }
  };

  const getSeverityChip = (severity: string) => {
    const colors = {
      success: "success",
      warning: "warning",
      error: "error",
      info: "info",
    } as const;

    return (
      <Chip
        label={severity.toUpperCase()}
        size="small"
        color={colors[severity as keyof typeof colors] || "default"}
        sx={{ fontSize: "8pt", fontWeight: "bold" }}
      />
    );
  };

  const filterLogs = (logs: LogEntry[]) => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  };

  const renderLogTable = (logs: LogEntry[], title: string) => {
    const filteredLogs = filterLogs(logs);

    return (
      <Box>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="flex items-center gap-2">
            <Shield sx={{ color: "#8B0000" }} />
            {title}
          </Typography>
          <Box className="flex gap-2">
            <TextField
              size="small"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "250px" }}
            />
            <FormControl size="small" sx={{ minWidth: "120px" }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filterSeverity}
                label="Severity"
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} color="primary" size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton color="primary" size="small">
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={2}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { fontSize: "9pt" } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1e293b" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Timestamp</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>User</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Details</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>IP Address</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Location</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Severity</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No logs found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, index) => (
                  <TableRow
                    key={log.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f8fafc" : "white",
                      "&:hover": { backgroundColor: "#e2e8f0" },
                    }}
                  >
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "8pt" }}>
                      {log.timestamp}
                    </TableCell>
                    <TableCell sx={{ fontSize: "9pt", fontWeight: 500 }}>
                      {log.user}
                    </TableCell>
                    <TableCell sx={{ fontSize: "9pt", fontWeight: 600 }}>
                      {log.action}
                    </TableCell>
                    <TableCell sx={{ fontSize: "9pt" }}>{log.details}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "8pt" }}>
                      {log.ipAddress}
                    </TableCell>
                    <TableCell sx={{ fontSize: "9pt" }}>
                      {log.location || "-"}
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-1">
                        {getSeverityIcon(log.severity)}
                        {getSeverityChip(log.severity)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "8pt" }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="mt-3 flex items-center justify-between">
          <Typography variant="caption" color="text.secondary">
            Showing {filteredLogs.length} of {logs.length} log entries
          </Typography>
        </Box>
      </Box>
    );
  };

  if (!hasAccess) {
    return (
      <Box className="max-w-7xl mx-auto">
        <Alert severity="error">
          <Typography variant="body1">
            <strong>Access Denied:</strong> You do not have permission to view CTS Luna Enterprise Security(9) logs.
            Please contact your system administrator.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <Box
            sx={{
              width: 64,
              height: 64,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 4-panel quartered shield */}
            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              {/* Shield outline */}
              <path
                key="shield-outline"
                d="M32 4 L8 12 L8 28 Q8 44 32 60 Q56 44 56 28 L56 12 Z"
                fill="none"
                stroke="#333"
                strokeWidth="1.5"
              />
              {/* Top-left quadrant - Blue */}
              <path
                key="quad-tl"
                d="M32 4 L8 12 L8 28 Q8 32 12 36 L32 32 Z"
                fill="#1976d2"
              />
              {/* Top-right quadrant - White */}
              <path
                key="quad-tr"
                d="M32 4 L56 12 L56 28 Q56 32 52 36 L32 32 Z"
                fill="#ffffff"
                stroke="#ccc"
                strokeWidth="0.5"
              />
              {/* Bottom-left quadrant - White */}
              <path
                key="quad-bl"
                d="M32 32 L12 36 Q8 36 8 28 Q8 44 32 60 Z"
                fill="#ffffff"
                stroke="#ccc"
                strokeWidth="0.5"
              />
              {/* Bottom-right quadrant - Blue */}
              <path
                key="quad-br"
                d="M32 32 L52 36 Q56 36 56 28 Q56 44 32 60 Z"
                fill="#1976d2"
              />
              {/* Center divider lines */}
              <line key="line-v" x1="32" y1="4" x2="32" y2="60" stroke="#333" strokeWidth="1" />
              <line key="line-h" x1="8" y1="28" x2="56" y2="28" stroke="#333" strokeWidth="1" />
            </svg>
            
            {/* Badge with "9" */}
            <Box
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                backgroundColor: "#1976d2",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                color: "white",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              9
            </Box>
          </Box>
          <Box>
            <Typography variant="h3" component="h1">
              CTS Luna Enterprise(9) Security
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive security logging and monitoring system
            </Typography>
          </Box>
        </Box>

        <Paper className="p-4 bg-red-50 border border-red-200 mt-4">
          <Typography variant="body2" className="text-slate-700">
            <strong>Security Notice:</strong> All actions are logged and monitored. Unauthorized access attempts
            will be reported to system administrators and may result in account suspension.
          </Typography>
        </Paper>
      </Box>

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "10pt",
              minHeight: "48px",
            },
            "& .Mui-selected": {
              color: "#8B0000 !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8B0000",
            },
          }}
        >
          <Tab
            icon={<Person />}
            iconPosition="start"
            label="User Logs"
            id="security-tab-0"
            aria-controls="security-tabpanel-0"
          />
          <Tab
            icon={<Lock />}
            iconPosition="start"
            label="User Actions"
            id="security-tab-1"
            aria-controls="security-tabpanel-1"
          />
          <Tab
            icon={<Warning />}
            iconPosition="start"
            label="Auth Notices"
            id="security-tab-2"
            aria-controls="security-tabpanel-2"
          />
          <Tab
            icon={<AdminPanelSettings />}
            iconPosition="start"
            label="SysAdmin Logs"
            id="security-tab-3"
            aria-controls="security-tabpanel-3"
          />
          <Tab
            icon={<AccessTime />}
            iconPosition="start"
            label="User Sessions"
            id="security-tab-4"
            aria-controls="security-tabpanel-4"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          {renderLogTable(userLogs, "User Activity Logs")}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {renderLogTable(userActions, "User Actions & Operations")}
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {renderLogTable(authNotices, "Authentication Notices & Alerts")}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {renderLogTable(sysAdminLogs, "System Administrator Logs")}
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <Box>
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="flex items-center gap-2">
                <AccessTime sx={{ color: "#8B0000" }} />
                User Sessions
              </Typography>
              <Box className="flex gap-2">
                <TextField
                  size="small"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: "250px" }}
                />
                <Tooltip title="Refresh">
                  <IconButton onClick={loadUserSessions} color="primary" size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton color="primary" size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {sessionsLoading ? (
              <Box className="text-center py-8">
                <Typography variant="body2" color="text.secondary">
                  Loading user sessions...
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table size="small" sx={{ "& .MuiTableCell-root": { fontSize: "9pt" } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#1e293b" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Session ID</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>User ID</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Token</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Start Time</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>End Time</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>IP Address</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No user sessions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      userSessions.map((session, index) => (
                        <TableRow
                          key={session.sessionid}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "#f8fafc" : "white",
                            "&:hover": { backgroundColor: "#e2e8f0" },
                          }}
                        >
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "8pt" }}>
                            {session.sessionid}
                          </TableCell>
                          <TableCell sx={{ fontSize: "9pt", fontWeight: 500 }}>
                            {session.uid}
                          </TableCell>
                          <TableCell sx={{ fontSize: "9pt", fontWeight: 600 }}>
                            {session.username}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "7pt" }}>
                            {session.token.substring(0, 16)}...
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "8pt" }}>
                            {new Date(session.sessionstart).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "8pt" }}>
                            {session.sessionend ? new Date(session.sessionend).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={session.sessioncomplete ? "Complete" : "Active"}
                              size="small"
                              color={session.sessioncomplete ? "default" : "success"}
                              sx={{ fontSize: "8pt" }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "8pt" }}>
                            {session.ipaddress || "-"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "9pt" }}>
                            {session.latitude && session.longitude
                              ? `${session.latitude}, ${session.longitude}`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box className="mt-3 flex items-center justify-between">
              <Typography variant="caption" color="text.secondary">
                Showing {userSessions.length} user sessions
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Summary Stats */}
      <Box className="grid grid-cols-4 gap-4 mt-6">
        <Paper className="p-4">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            Total User Logs
          </Typography>
          <Typography variant="h4">{userLogs.length}</Typography>
        </Paper>
        <Paper className="p-4">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            User Actions
          </Typography>
          <Typography variant="h4">{userActions.length}</Typography>
        </Paper>
        <Paper className="p-4">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            Auth Notices
          </Typography>
          <Typography variant="h4" className="text-orange-600">
            {authNotices.length}
          </Typography>
        </Paper>
        <Paper className="p-4">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            SysAdmin Logs
          </Typography>
          <Typography variant="h4" className="text-red-600">
            {sysAdminLogs.length}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}