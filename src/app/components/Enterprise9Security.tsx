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
  CircularProgress,
} from "@mui/material";
import {
  Shield,
  Person,
  Lock,
  AdminPanelSettings,
  Search,
  Refresh,
  Download,
  Info,
  Warning,
  Error,
  CheckCircle,
  AccessTime,
  Notifications,
  Api,
  Schedule,
  SupervisorAccount,
} from "@mui/icons-material";
import { getApiUrl } from "../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
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

// ─── All 9 Log API definitions ────────────────────────────────────────────────

export const ALL_LOG_APIS = [
  { key: "adminlogs",    label: "Admin Logs",     endpoint: "/Adminlogs",    icon: AdminPanelSettings, color: "#dc2626" },
  { key: "apilogs",      label: "API Logs",        endpoint: "/Apilogs",      icon: Api,               color: "#2563eb" },
  { key: "authlog",      label: "Auth Log",        endpoint: "/Authlog",      icon: Warning,           color: "#d97706" },
  { key: "sessionlog",   label: "Session Log",     endpoint: "/Sessionlog",   icon: Schedule,          color: "#7c3aed" },
  { key: "superuserlog", label: "Superuser Log",   endpoint: "/Superuserlog", icon: SupervisorAccount, color: "#0f766e" },
  { key: "useractions",  label: "User Actions",    endpoint: "/Useractions",  icon: Lock,              color: "#64748b" },
  { key: "userlog",      label: "User Log",        endpoint: "/Userlog",      icon: Person,            color: "#0284c7" },
  { key: "usernotices",  label: "User Notices",    endpoint: "/Usernotices",  icon: Notifications,     color: "#16a34a" },
  { key: "usersession",  label: "User Sessions",   endpoint: "/Usersession",  icon: AccessTime,        color: "#0891b2" },
] as const;

export type LogApiKey = typeof ALL_LOG_APIS[number]["key"];
export const ALL_LOG_API_KEYS: LogApiKey[] = ALL_LOG_APIS.map((a) => a.key);
const ENABLED_KEY = "security9EnabledApis";

function getEnabledKeys(): LogApiKey[] {
  try {
    const raw = localStorage.getItem(ENABLED_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      const valid = parsed.filter((k): k is LogApiKey =>
        ALL_LOG_API_KEYS.includes(k as LogApiKey)
      );
      if (valid.length > 0) return valid;
    }
  } catch { /* ignore */ }
  return [...ALL_LOG_API_KEYS];
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

function guessSeverity(row: Record<string, unknown>): "success" | "warning" | "error" | "info" {
  const combined = JSON.stringify(row).toLowerCase();
  if (combined.includes("error") || combined.includes("fail") || combined.includes("denied") || combined.includes("401") || combined.includes("403") || combined.includes("500")) return "error";
  if (combined.includes("warn") || combined.includes("suspicious") || combined.includes("expired")) return "warning";
  if (combined.includes("success") || combined.includes("200") || combined.includes("201") || combined.includes("created") || combined.includes("login")) return "success";
  return "info";
}

const SEVERITY_COLORS = {
  success: { bg: "#dcfce7", color: "#15803d" },
  warning: { bg: "#fef3c7", color: "#b45309" },
  error:   { bg: "#fee2e2", color: "#b91c1c" },
  info:    { bg: "#dbeafe", color: "#1d4ed8" },
};

const SEVERITY_ICONS = {
  success: <CheckCircle fontSize="small" sx={{ color: "#16a34a" }} />,
  warning: <Warning fontSize="small" sx={{ color: "#f59e0b" }} />,
  error:   <Error fontSize="small" sx={{ color: "#dc2626" }} />,
  info:    <Info fontSize="small" sx={{ color: "#3b82f6" }} />,
};

// ─── Generic table renderer ───────────────────────────────────────────────────

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function isDateKey(key: string): boolean {
  return /date|time|start|end|stamp|at$/i.test(key);
}

function formatDateCell(value: unknown): string {
  if (!value || typeof value !== "string") return formatCell(value);
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function GenericApiTable({
  data,
  loading,
  error,
  onRefresh,
  label,
}: {
  data: Record<string, unknown>[] | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  label: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const columns: string[] = data && data.length > 0
    ? Object.keys(data[0])
    : [];

  const filtered = (data ?? []).filter((row) => {
    if (!searchTerm) return true;
    return JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Shield sx={{ color: "#8B0000" }} />
          {label}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 220 }}
          />
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                if (!data || data.length === 0) return;
                const cols = Object.keys(data[0]);
                const rows = [cols.join(","), ...data.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))];
                const blob = new Blob([rows.join("\n")], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${label.replace(/ /g, "_")}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          API request failed: {error}. No data is available — verify the endpoint is reachable and your account has access.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#8B0000" }} />
        </Box>
      ) : columns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, border: "2px dashed #e2e8f0", borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">No data available for this log source.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { fontSize: "8.5pt" } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1e293b" }}>
                <TableCell sx={{ color: "white", fontWeight: 700, width: 36 }}>#</TableCell>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700, width: 80 }}>Sev.</TableCell>
                {columns.map((col) => (
                  <TableCell key={col} sx={{ color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No records match your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, i) => {
                  const sev = guessSeverity(row);
                  const sevStyle = SEVERITY_COLORS[sev];
                  return (
                    <TableRow
                      key={i}
                      sx={{
                        backgroundColor: i % 2 === 0 ? "#f8fafc" : "white",
                        "&:hover": { backgroundColor: "#e2e8f0" },
                      }}
                    >
                      <TableCell sx={{ color: "#94a3b8", fontFamily: "monospace" }}>{i + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {SEVERITY_ICONS[sev]}
                          <Chip
                            label={sev.toUpperCase()}
                            size="small"
                            sx={{ fontSize: "7pt", fontWeight: 700, backgroundColor: sevStyle.bg, color: sevStyle.color, height: 18 }}
                          />
                        </Box>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col} sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {isDateKey(col) ? formatDateCell(row[col]) : formatCell(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {loading ? "Loading…" : `Showing ${filtered.length} of ${(data ?? []).length} records`}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Enterprise9Security() {
  const [currentTab, setCurrentTab] = useState(0);
  const [enabledKeys, setEnabledKeys] = useState<LogApiKey[]>(getEnabledKeys);
  const [apiData, setApiData] = useState<Partial<Record<LogApiKey, Record<string, unknown>[]>>>({});
  const [apiLoading, setApiLoading] = useState<Partial<Record<LogApiKey, boolean>>>({});
  const [apiError, setApiError] = useState<Partial<Record<LogApiKey, string>>>({});

  const uid = localStorage.getItem("uid") || "";
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "User";
  const isSuperUser = userRole === "superuser";
  const isAdmin = userRole === "admin";
  const hasAccess = isSuperUser || isAdmin;

  // Sync enabled keys when settings change (e.g. from Settings page)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === ENABLED_KEY) {
        setEnabledKeys(getEnabledKeys());
        setCurrentTab(0);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const enabledApis = ALL_LOG_APIS.filter((a) => enabledKeys.includes(a.key));

  const fetchApiData = async (key: LogApiKey) => {
    if (apiLoading[key]) return;
    setApiLoading((prev) => ({ ...prev, [key]: true }));
    setApiError((prev) => ({ ...prev, [key]: undefined }));
    try {
      const endpoint = ALL_LOG_APIS.find((a) => a.key === key)!.endpoint;
      const url = getApiUrl(endpoint);
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApiData((prev) => ({ ...prev, [key]: Array.isArray(data) ? data : [data] }));
    } catch (err) {
      setApiError((prev) => ({
        ...prev,
        [key]: err instanceof Error ? err.message : "Failed to load",
      }));
    } finally {
      setApiLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Fetch data for current tab whenever it changes
  useEffect(() => {
    const api = enabledApis[currentTab];
    if (api && apiData[api.key] === undefined && !apiLoading[api.key]) {
      fetchApiData(api.key);
    }
  }, [currentTab, enabledKeys]);

  if (!hasAccess) {
    return (
      <Box className="max-w-7xl mx-auto">
        <Alert severity="error">
          <strong>Access Denied:</strong> You do not have permission to view CTS Luna Enterprise Security(9) logs. Please contact your system administrator.
        </Alert>
      </Box>
    );
  }

  const currentApiKey = enabledApis[currentTab]?.key;

  return (
    <Box className="max-w-7xl mx-auto">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          {/* Quartered shield badge */}
          <Box sx={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <path d="M32 4 L8 12 L8 28 Q8 44 32 60 Q56 44 56 28 L56 12 Z" fill="none" stroke="#333" strokeWidth="1.5" />
              <path d="M32 4 L8 12 L8 28 Q8 32 12 36 L32 32 Z" fill="#1976d2" />
              <path d="M32 4 L56 12 L56 28 Q56 32 52 36 L32 32 Z" fill="#ffffff" stroke="#ccc" strokeWidth="0.5" />
              <path d="M32 32 L12 36 Q8 36 8 28 Q8 44 32 60 Z" fill="#ffffff" stroke="#ccc" strokeWidth="0.5" />
              <path d="M32 32 L52 36 Q56 36 56 28 Q56 44 32 60 Z" fill="#1976d2" />
              <line x1="32" y1="4" x2="32" y2="60" stroke="#333" strokeWidth="1" />
              <line x1="8" y1="28" x2="56" y2="28" stroke="#333" strokeWidth="1" />
            </svg>
            <Box sx={{ position: "absolute", top: 2, right: 2, backgroundColor: "#1976d2", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "white", border: "2px solid white" }}>
              9
            </Box>
          </Box>
          <Box>
            <Typography variant="h3" component="h1">CTS Luna Enterprise(9) Security</Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive security logging — {enabledApis.length} of 9 APIs enabled &nbsp;
              <Chip label={`${username} · ${userRole}`} size="small" sx={{ backgroundColor: "#8B0000", color: "white", fontSize: "0.7rem" }} />
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 1.5, backgroundColor: "#fef2f2", border: "1px solid #fecaca", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Security Notice:</strong> All actions are logged and monitored. Unauthorized access attempts will be reported to system administrators.
          </Typography>
        </Paper>
      </Box>

      {enabledApis.length === 0 ? (
        <Alert severity="warning">
          All log APIs are disabled. Go to <strong>Settings → Log Manager</strong> to enable at least one.
        </Alert>
      ) : (
        <Paper elevation={2}>
          {/* Dynamic Tabs */}
          <Tabs
            value={currentTab}
            onChange={(_, v) => setCurrentTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { fontWeight: 600, fontSize: "9.5pt", minHeight: 48, textTransform: "none" },
              "& .Mui-selected": { color: "#8B0000 !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#8B0000" },
            }}
          >
            {enabledApis.map((api, idx) => {
              const IconComp = api.icon;
              const hasData = !!apiData[api.key];
              const isLoading = !!apiLoading[api.key];
              const hasErr = !!apiError[api.key];
              return (
                <Tab
                  key={api.key}
                  icon={
                    isLoading
                      ? <CircularProgress size={14} sx={{ color: "#8B0000" }} />
                      : <IconComp sx={{ fontSize: 16, color: hasErr ? "#f59e0b" : api.color }} />
                  }
                  iconPosition="start"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {api.label}
                      {hasData && !isLoading && (
                        <Chip
                          label={apiData[api.key]!.length}
                          size="small"
                          sx={{ height: 16, fontSize: "7pt", backgroundColor: api.color, color: "white", ml: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                  id={`security-tab-${idx}`}
                  aria-controls={`security-tabpanel-${idx}`}
                />
              );
            })}
          </Tabs>

          {/* Dynamic Tab Panels */}
          {enabledApis.map((api, idx) => (
            <TabPanel key={api.key} value={currentTab} index={idx}>
              <GenericApiTable
                data={apiData[api.key] ?? null}
                loading={!!apiLoading[api.key]}
                error={apiError[api.key] ?? null}
                label={`${api.label} · /api${api.endpoint}`}
                onRefresh={() => {
                  setApiData((prev) => { const next = { ...prev }; delete next[api.key]; return next; });
                  setApiError((prev) => { const next = { ...prev }; delete next[api.key]; return next; });
                  fetchApiData(api.key);
                }}
              />
            </TabPanel>
          ))}
        </Paper>
      )}

      {/* Summary stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2, mt: 3 }}>
        {enabledApis.map((api) => {
          const count = apiData[api.key]?.length;
          const isLoading = !!apiLoading[api.key];
          const IconComp = api.icon;
          return (
            <Paper key={api.key} sx={{ p: 2, borderTop: `3px solid ${api.color}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <IconComp sx={{ fontSize: 16, color: api.color }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.3, fontSize: "0.65rem" }}>
                  {api.label}
                </Typography>
              </Box>
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: api.color }} />
              ) : (
                <Typography variant="h5" fontWeight={700} sx={{ color: api.color }}>
                  {count ?? "—"}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.6rem" }}>
                /api{api.endpoint}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
