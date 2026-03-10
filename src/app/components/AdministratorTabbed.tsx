import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Paper, Alert, Chip } from "@mui/material";
import { Business } from "@mui/icons-material";
import { StoreManagement } from "./StoreManagement";
import { RoleManagement } from "./RoleManagement";
import { RegionManagement } from "./RegionManagement";
import { ManagerManagement } from "./ManagerManagement";
import { CompanyEvents } from "./CompanyEvents";
import { InstanceManagement } from "./InstanceManagement";
import { Administrator as UsersBuCompaniesGroups } from "./Administrator";
import { UserService, CompanyService, User, Company } from "../services/dataService";

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function AdministratorTabbed() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setLoading(false);
          return;
        }

        // Load current user from API
        const user = await UserService.getById(uid);
        if (user) {
          setCurrentUser(user);
          
          // Find the company for this user
          const company = await CompanyService.getById(user.companyId);
          if (company) {
            setCurrentCompany(company);
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  // Check if current user is admin for their company
  const isCompanyAdmin = currentCompany?.administratorUid === currentUser?.uid;
  const isSuperUser = currentUser?.role === "superuser";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center py-12">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert severity="error">Please log in to access the Administrator panel.</Alert>
      </div>
    );
  }

  if (!isCompanyAdmin && !isSuperUser) {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert severity="warning">
          You do not have administrator privileges. Contact your company administrator.
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
          Administrator
        </Typography>
        
        {/* Company Info */}
        {currentCompany && (
          <Box className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <Box className="flex items-center gap-2 mb-2">
              <Business className="text-slate-700" />
              <Typography variant="h6">{currentCompany.companyName}</Typography>
              {isCompanyAdmin && (
                <Chip label="Company Administrator" color="primary" size="small" />
              )}
              {isSuperUser && (
                <Chip label="Super User" color="error" size="small" />
              )}
            </Box>
            <Typography variant="body2" className="text-slate-600">
              {currentCompany.email}
            </Typography>
          </Box>
        )}
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
              minWidth: 100,
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
          <Tab label="Users & Groups" />
          <Tab label="Stores" />
          <Tab label="Roles" />
          <Tab label="Regions" />
          <Tab label="Managers" />
          <Tab label="Instances" />
          {isSuperUser && <Tab label="Events" />}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <div className="space-y-6">
          <UsersBuCompaniesGroups />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <div className="space-y-6">
          <StoreManagement />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <div className="space-y-6">
          <RoleManagement />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <div className="space-y-6">
          <RegionManagement />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <div className="space-y-6">
          <ManagerManagement />
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <div className="space-y-6">
          <InstanceManagement />
        </div>
      </TabPanel>

      {isSuperUser && (
        <TabPanel value={activeTab} index={6}>
          <div className="space-y-6">
            <CompanyEvents />
          </div>
        </TabPanel>
      )}
    </div>
  );
}