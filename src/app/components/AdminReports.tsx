import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Assessment,
  Download,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  People,
  Business,
  Security,
  Event,
  MonetizationOn,
  BarChart,
  CalendarToday,
  Wifi,
  Groups,
} from "@mui/icons-material";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  frequency: string;
  accessLevel?: "superuser" | "manager" | "all"; // Add access level
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "company-employees",
    name: "Company Employees Report",
    description: "Comprehensive employee roster, roles, departments, and activity status for your company",
    category: "Company",
    icon: <Groups sx={{ color: "#5b6b8f" }} />,
    frequency: "Daily/Weekly/Monthly",
    accessLevel: "manager",
  },
  {
    id: "isp-users",
    name: "ISP Users Report",
    description: "Internet Service Provider user accounts, connections, bandwidth usage, and service levels",
    category: "ISP",
    icon: <Wifi sx={{ color: "#5b6b8f" }} />,
    frequency: "Daily/Weekly/Monthly",
    accessLevel: "superuser",
  },
  {
    id: "user-activity",
    name: "User Activity Report",
    description: "Detailed user login, actions, and engagement metrics",
    category: "Users",
    icon: <People sx={{ color: "#5b6b8f" }} />,
    frequency: "Daily/Weekly/Monthly",
    accessLevel: "all",
  },
  {
    id: "security-audit",
    name: "Security Audit Log",
    description: "Comprehensive security events, authentication attempts, and access logs",
    category: "Security",
    icon: <Security sx={{ color: "#5b6b8f" }} />,
    frequency: "Daily/Weekly",
    accessLevel: "all",
  },
  {
    id: "system-usage",
    name: "System Usage Statistics",
    description: "API calls, AI agent usage, voice commands, and system performance",
    category: "System",
    icon: <BarChart sx={{ color: "#5b6b8f" }} />,
    frequency: "Weekly/Monthly",
    accessLevel: "all",
  },
  {
    id: "company-overview",
    name: "Company Overview Report",
    description: "Business unit performance, employee metrics, and organizational insights",
    category: "Business",
    icon: <Business sx={{ color: "#5b6b8f" }} />,
    frequency: "Monthly/Quarterly",
    accessLevel: "manager",
  },
  {
    id: "financial-summary",
    name: "Financial Summary",
    description: "License usage, costs, billing information, and budget tracking",
    category: "Finance",
    icon: <MonetizationOn sx={{ color: "#5b6b8f" }} />,
    frequency: "Monthly/Quarterly",
    accessLevel: "all",
  },
  {
    id: "ai-performance",
    name: "AI Performance Metrics",
    description: "AI agent success rates, response times, and accuracy metrics",
    category: "AI",
    icon: <TrendingUp sx={{ color: "#5b6b8f" }} />,
    frequency: "Weekly/Monthly",
    accessLevel: "all",
  },
  {
    id: "session-analytics",
    name: "Session Analytics",
    description: "User session durations, locations, devices, and connection patterns",
    category: "Users",
    icon: <Event sx={{ color: "#5b6b8f" }} />,
    frequency: "Daily/Weekly",
    accessLevel: "all",
  },
  {
    id: "module-usage",
    name: "Module Usage Report",
    description: "Luna Modules, AdBase Pro, and feature adoption metrics",
    category: "Features",
    icon: <Assessment sx={{ color: "#5b6b8f" }} />,
    frequency: "Monthly",
    accessLevel: "all",
  },
];

export function AdminReports({ isSuperUser = false, currentCompanyId }: { isSuperUser?: boolean; currentCompanyId?: string }) {
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter reports based on user access level
  const availableReports = REPORT_TEMPLATES.filter((report) => {
    if (!report.accessLevel || report.accessLevel === "all") return true;
    if (report.accessLevel === "superuser") return isSuperUser;
    if (report.accessLevel === "manager") return true; // Both managers and superusers can access
    return false;
  });

  const handleGenerateReport = () => {
    const report = availableReports.find((r) => r.id === selectedReport);
    if (!report) return;

    let reportMessage = `Generating ${report.name} as ${exportFormat.toUpperCase()}...\n\nDate Range: ${dateRange}\n`;
    
    // Add company context for company-specific reports
    if (report.id === "company-employees" && currentCompanyId) {
      reportMessage += `Company ID: ${currentCompanyId}\n`;
    }
    
    reportMessage += "This will connect to the Azure API to pull real data.";
    alert(reportMessage);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Users: "#7b8fb8",
      Security: "#7881a1",
      System: "#6b8e7f",
      Business: "#9fa8c1",
      Finance: "#8c95b3",
      AI: "#7b9fb8",
      Features: "#a6a9c2",
      Company: "#7881a1",
      ISP: "#7b9fb8",
    };
    return colors[category] || "#7a7a8a";
  };

  const groupedReports = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as { [key: string]: ReportTemplate[] });

  return (
    <Box>
      <Box className="mb-6">
        <Box className="flex items-center gap-2 mb-2">
          <Assessment sx={{ fontSize: 32, color: "#5b6b8f" }} />
          <Typography variant="h5">Reports & Analytics</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Generate comprehensive reports for user activity, security, system usage, and business insights
        </Typography>
      </Box>

      <Alert severity="info" className="mb-6">
        <strong>Reports integrate with Azure API:</strong> All reports pull real-time data from the LunaAI database
        including users, sessions, security logs, and business metrics.
      </Alert>

      <Grid container spacing={3}>
        {/* Report Generator */}
        <Grid item xs={12} md={5}>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4 flex items-center gap-2">
              <TableChart />
              Generate Report
            </Typography>

            <FormControl fullWidth className="mb-4">
              <InputLabel>Select Report Template</InputLabel>
              <Select
                value={selectedReport}
                label="Select Report Template"
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <MenuItem value="">
                  <em>Choose a report...</em>
                </MenuItem>
                {Object.entries(groupedReports).flatMap(([category, reports]) => [
                  <MenuItem key={`header-${category}`} disabled sx={{ fontWeight: "bold", color: getCategoryColor(category) }}>
                    {category}
                  </MenuItem>,
                  ...reports.map((report) => (
                    <MenuItem key={report.id} value={report.id} sx={{ pl: 4 }}>
                      {report.name}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            {selectedReport && (
              <Box className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                <Typography variant="body2" className="mb-2">
                  <strong>Description:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {REPORT_TEMPLATES.find((r) => r.id === selectedReport)?.description}
                </Typography>
                <Box className="mt-2">
                  <Chip
                    label={REPORT_TEMPLATES.find((r) => r.id === selectedReport)?.frequency}
                    size="small"
                    sx={{ backgroundColor: "#e2e8f0" }}
                  />
                </Box>
              </Box>
            )}

            <FormControl fullWidth className="mb-4">
              <InputLabel>Date Range</InputLabel>
              <Select value={dateRange} label="Date Range" onChange={(e) => setDateRange(e.target.value)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="last-7-days">Last 7 Days</MenuItem>
                <MenuItem value="last-30-days">Last 30 Days</MenuItem>
                <MenuItem value="this-month">This Month</MenuItem>
                <MenuItem value="last-month">Last Month</MenuItem>
                <MenuItem value="this-quarter">This Quarter</MenuItem>
                <MenuItem value="this-year">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {dateRange === "custom" && (
              <Box className="mb-4 space-y-3">
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}

            <FormControl fullWidth className="mb-4">
              <InputLabel>Export Format</InputLabel>
              <Select value={exportFormat} label="Export Format" onChange={(e) => setExportFormat(e.target.value)}>
                <MenuItem value="pdf">
                  <Box className="flex items-center gap-2">
                    <PictureAsPdf fontSize="small" />
                    PDF Document
                  </Box>
                </MenuItem>
                <MenuItem value="csv">
                  <Box className="flex items-center gap-2">
                    <TableChart fontSize="small" />
                    CSV Spreadsheet
                  </Box>
                </MenuItem>
                <MenuItem value="xlsx">
                  <Box className="flex items-center gap-2">
                    <TableChart fontSize="small" />
                    Excel Workbook
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              startIcon={<Download />}
              onClick={handleGenerateReport}
              disabled={!selectedReport}
              sx={{
                backgroundColor: "#5b6b8f",
                "&:hover": {
                  backgroundColor: "#4a5a7f",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              Generate & Download Report
            </Button>
          </Paper>
        </Grid>

        {/* Report Templates */}
        <Grid item xs={12} md={7}>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4 flex items-center gap-2">
              <Assessment />
              Available Report Templates
            </Typography>

            <Box className="space-y-6">
              {Object.entries(groupedReports).map(([category, reports]) => (
                <Box key={category}>
                  <Box className="flex items-center gap-2 mb-3">
                    <Chip
                      label={category}
                      size="small"
                      sx={{
                        backgroundColor: getCategoryColor(category),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  <Grid container spacing={2}>
                    {reports.map((report) => (
                      <Grid item xs={12} sm={6} key={report.id}>
                        <Card
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setSelectedReport(report.id)}
                          sx={{
                            border: selectedReport === report.id ? "2px solid #5b6b8f" : "1px solid #e2e8f0",
                          }}
                        >
                          <CardContent>
                            <Box className="flex items-start gap-2 mb-2">
                              {report.icon}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" className="font-semibold">
                                  {report.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" className="mt-1">
                                  {report.description}
                                </Typography>
                                <Box className="mt-2 flex items-center gap-1">
                                  <CalendarToday sx={{ fontSize: 14, color: "#64748b" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {report.frequency}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Box className="mt-6">
        <Typography variant="h6" className="mb-4">Report Statistics</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="p-4">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Total Reports Generated
              </Typography>
              <Typography variant="h4">247</Typography>
              <Typography variant="caption" color="text.secondary">
                This month
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="p-4">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Most Popular Report
              </Typography>
              <Typography variant="h6">User Activity</Typography>
              <Typography variant="caption" color="text.secondary">
                Generated 89 times
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="p-4">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Last Report Generated
              </Typography>
              <Typography variant="h6">2 hours ago</Typography>
              <Typography variant="caption" color="text.secondary">
                Security Audit Log
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="p-4">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                Data Sources Active
              </Typography>
              <Typography variant="h4">8/8</Typography>
              <Typography variant="caption" className="text-green-600">
                All systems operational
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}