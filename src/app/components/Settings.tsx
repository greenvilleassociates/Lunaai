import { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Paper, Alert, Chip } from "@mui/material";
import { Settings as SettingsIcon, Psychology, Security, Tune, Api, Memory } from "@mui/icons-material";
import { LLMAgentConfig } from "./LLMAgentConfig";
import { CustomSLM } from "./CustomSLM";

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if user is superuser
  const currentUserRole = localStorage.getItem("role");
  const isSuperUser = currentUserRole === "superuser";
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center py-12">
        <Typography>Loading Settings...</Typography>
      </div>
    );
  }

  if (!isSuperUser) {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert severity="warning">
          Access Denied: Settings page is only available to superusers.
        </Alert>
      </div>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h4" className="mb-2">
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-3">
          Superuser configuration and system management
        </Typography>

        {/* Superuser Info */}
        <Box className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <Box className="flex items-center gap-2 mb-2">
            <SettingsIcon className="text-slate-700" />
            <Typography variant="h6">Superuser: {username}</Typography>
            <Chip label="Super User" color="error" size="small" />
          </Box>
          <Typography variant="body2" className="text-slate-600">
            You have full access to all system settings and configurations.
          </Typography>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minWidth: 120,
              textTransform: "none",
              fontWeight: 500,
            },
            "& .Mui-selected": {
              color: "#8B0000",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8B0000",
            },
          }}
        >
          <Tab icon={<Psychology />} label="LLM Agents" iconPosition="start" />
          <Tab icon={<Api />} label="API Configuration" iconPosition="start" />
          <Tab icon={<Security />} label="Security & Auth" iconPosition="start" />
          <Tab icon={<Tune />} label="System Settings" iconPosition="start" />
          <Tab icon={<Memory />} label="Custom SLM" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <LLMAgentConfig />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box>
          <Typography variant="h5" className="mb-4">API Configuration</Typography>
          <Paper className="p-6">
            <Typography variant="body1" color="text.secondary">
              API endpoint configuration and management will be available here.
            </Typography>
            <Box className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="p-4 border border-slate-200 rounded">
                <Typography variant="subtitle1" className="mb-2 font-semibold">Azure API Root</Typography>
                <Typography variant="body2" className="font-mono text-xs text-slate-600">
                  lunaapi-h3a0ataqcphhd5em.westus3-01.azurewebsites.net
                </Typography>
              </Box>
              <Box className="p-4 border border-slate-200 rounded">
                <Typography variant="subtitle1" className="mb-2 font-semibold">Deployment URL</Typography>
                <Typography variant="body2" className="font-mono text-xs text-slate-600">
                  luna.capitoltechnology.net
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box>
          <Typography variant="h5" className="mb-4">Security & Authentication</Typography>
          <Paper className="p-6">
            <Typography variant="body1" color="text.secondary" className="mb-4">
              Security settings and authentication configuration.
            </Typography>
            <Alert severity="info">
              Microsoft EntraID authentication settings for LLM agents are configured in the LLM Agents tab.
            </Alert>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box>
          <Typography variant="h5" className="mb-4">System Settings</Typography>
          <Paper className="p-6">
            <Typography variant="body1" color="text.secondary" className="mb-4">
              General system configuration and preferences.
            </Typography>
            <Box className="space-y-4">
              <Box className="p-4 border border-slate-200 rounded">
                <Typography variant="subtitle1" className="mb-2 font-semibold">Company Colors</Typography>
                <Box className="flex gap-4 items-center">
                  <Box className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-black border border-slate-300 rounded"></div>
                    <Typography variant="body2">Black</Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded" style={{ backgroundColor: "#8B0000" }}></div>
                    <Typography variant="body2">Dark Red (#8B0000)</Typography>
                  </Box>
                </Box>
              </Box>
              <Box className="p-4 border border-slate-200 rounded">
                <Typography variant="subtitle1" className="mb-2 font-semibold">Company Name</Typography>
                <Typography variant="body2" className="text-slate-600">
                  Capitol Technology Solutions
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <CustomSLM />
      </TabPanel>
    </div>
  );
}