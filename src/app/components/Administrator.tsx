import React, { useState, useEffect } from "react";
import {
  Box,
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
  Chip,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { PersonAdd, Business, AddBusiness, Group } from "@mui/icons-material";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";
import { API_CONFIG, getApiUrl } from "../config/api";

interface User {
  uid: string;
  username: string;
  password: string;
  role: string;
  companyId: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  cell: string;
  profilePicture: string;
}

interface Company {
  companyId: string;
  companyName: string;
  administratorUid: string;
  email: string;
}

interface BusinessUnit {
  id: number;
  buname: string;
  buhqaddress1: string;
  buhqaddress2: string;
  buhqcity: string;
  buhqstate: string;
  buhqpostal: string;
  companyid: number;
  instanceid: string;
}

interface ApiCompany {
  id: number;
  companyname: string;
  dynamicsid: string;
  ncralohaid: string;
  oracleid: string;
  certAuthority: string;
  instancedid: string;
}

interface UserGroup {
  id: number;
  groupid: string;
  groupdescription: string;
  groupownerid: number;
  groupcompanyid: string;
}

export function Administrator() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addBuDialogOpen, setAddBuDialogOpen] = useState(false);
  const [addCompanyDialogOpen, setAddCompanyDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [apiCompanies, setApiCompanies] = useState<ApiCompany[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    cell: "",
  });

  // New business unit form state
  const [newBu, setNewBu] = useState({
    buname: "",
    buhqaddress1: "",
    buhqaddress2: "",
    buhqcity: "",
    buhqstate: "",
    buhqpostal: "",
    companyid: 0,
    instanceid: "",
  });

  // New company form state
  const [newCompany, setNewCompany] = useState({
    companyname: "",
    dynamicsid: "",
    ncralohaid: "",
    oracleid: "",
    certAuthority: "",
    instancedid: "",
  });

  // New user group form state
  const [newGroup, setNewGroup] = useState({
    groupid: "",
    groupdescription: "",
    groupownerid: 0,
    groupcompanyid: "",
  });

  useEffect(() => {
    // Load users and companies from external JSONs
    const loadData = async () => {
      try {
        const [fetchedUsers, fetchedCompanies] = await Promise.all([
          fetchExternalData<User[]>(DATA_URLS.USERS),
          fetchExternalData<Company[]>(DATA_URLS.COMPANIES),
        ]);
        
        setUserList(fetchedUsers);
        setCompaniesList(fetchedCompanies);
        
        // Load current user from localStorage
        const uid = localStorage.getItem("uid");
        const user = fetchedUsers.find((u) => u.uid === uid);
        if (user) {
          setCurrentUser(user);
          
          // Find the company for this user
          const company = fetchedCompanies.find((c) => c.companyId === user.companyId);
          if (company) {
            setCurrentCompany(company);
          }
        }

        // Load Business Units, API Companies, and User Groups from Azure API
        await loadBusinessUnits();
        await loadApiCompanies();
        await loadUserGroups();
      } catch (error) {
        console.error("Failed to load administrator data:", error);
      }
    };
    
    loadData();
  }, []);

  const loadBusinessUnits = async () => {
    try {
      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.BUSINESS_UNITS);
      const response = await fetch(apiUrl, {
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("uid")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessUnits(data);
        console.log("✅ Business Units loaded from Azure API:", data.length);
      } else {
        console.warn(`⚠️ Business Units API returned ${response.status} - using empty state`);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load Business Units from API:", error);
    }
  };

  const loadApiCompanies = async () => {
    try {
      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.COMPANY);
      const response = await fetch(apiUrl, {
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("uid")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiCompanies(data);
        console.log("✅ Companies loaded from Azure API:", data.length);
      } else {
        console.warn(`⚠️ Companies API returned ${response.status} - using empty state`);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load Companies from API:", error);
    }
  };

  const loadUserGroups = async () => {
    try {
      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_GROUPS);
      const response = await fetch(apiUrl, {
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("uid")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserGroups(data);
        console.log("✅ User Groups loaded from Azure API:", data.length);
      } else {
        console.warn(`⚠️ User Groups API returned ${response.status} - using empty state`);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load User Groups from API:", error);
    }
  };

  // Filter users to show only those from the admin's company
  const companyUsers = userList.filter((user) => 
    currentUser?.role === "superuser" 
      ? true 
      : user.companyId === currentUser?.companyId
  );

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      setErrorMessage("Username and password are required");
      return;
    }

    // Check if username already exists
    if (userList.some((u) => u.username === newUser.username)) {
      setErrorMessage("Username already exists");
      return;
    }

    // Generate new user ID
    const maxId = Math.max(
      ...userList.map((u) => parseInt(u.uid.split("-")[1])),
      0
    );
    const newUid = `user-${String(maxId + 1).padStart(3, "0")}`;

    // Create new user object
    const userToAdd: User = {
      uid: newUid,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      companyId: currentUser?.companyId || "",
      address1: newUser.address1,
      address2: newUser.address2,
      city: newUser.city,
      state: newUser.state,
      zip: newUser.zip,
      phone: newUser.phone,
      cell: newUser.cell,
      profilePicture: "",
    };

    // Add to user list (in real app, this would save to backend/database)
    setUserList([...userList, userToAdd]);
    
    // Show success message
    setSuccessMessage(`User "${newUser.username}" added successfully!`);
    
    // Reset form
    setNewUser({
      username: "",
      password: "",
      role: "user",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      cell: "",
    });
    
    // Close dialog
    setAddUserDialogOpen(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteUser = (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUserList(userList.filter((u) => u.uid !== uid));
      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleAddBusinessUnit = () => {
    if (!newBu.buname) {
      setErrorMessage("Business Unit name is required");
      return;
    }

    // Prepare payload for API (without ID - Azure will assign it)
    const buPayload = {
      buname: newBu.buname,
      buhqaddress1: newBu.buhqaddress1,
      buhqaddress2: newBu.buhqaddress2,
      buhqcity: newBu.buhqcity,
      buhqstate: newBu.buhqstate,
      buhqpostal: newBu.buhqpostal,
      companyid: newBu.companyid,
      instanceid: newBu.instanceid,
    };

    // TODO: When integrating with API, use:
    // await apiRequest(API_CONFIG.ENDPOINTS.BUSINESS_UNITS, {
    //   method: 'POST',
    //   body: JSON.stringify(buPayload),
    // });

    // For now, generate temporary ID for local state
    const maxId = Math.max(...businessUnits.map((bu) => bu.id), 0);
    const newId = maxId + 1;

    // Create new business unit object with temporary ID for local state
    const buToAdd: BusinessUnit = {
      id: newId,
      ...buPayload,
    };

    // Add to business unit list
    setBusinessUnits([...businessUnits, buToAdd]);
    
    // Show success message
    setSuccessMessage(`Business Unit "${newBu.buname}" added successfully!`);
    
    // Reset form
    setNewBu({
      buname: "",
      buhqaddress1: "",
      buhqaddress2: "",
      buhqcity: "",
      buhqstate: "",
      buhqpostal: "",
      companyid: 0,
      instanceid: "",
    });
    
    // Close dialog
    setAddBuDialogOpen(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteBusinessUnit = (id: number) => {
    if (window.confirm("Are you sure you want to delete this business unit?")) {
      setBusinessUnits(businessUnits.filter((bu) => bu.id !== id));
      setSuccessMessage("Business Unit deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleAddCompany = () => {
    if (!newCompany.companyname) {
      setErrorMessage("Company name is required");
      return;
    }

    // Prepare payload for API (without ID - Azure will assign it)
    const companyPayload = {
      companyname: newCompany.companyname,
      dynamicsid: newCompany.dynamicsid,
      ncralohaid: newCompany.ncralohaid,
      oracleid: newCompany.oracleid,
      certAuthority: newCompany.certAuthority,
      instancedid: newCompany.instancedid,
    };

    // TODO: When integrating with API, use:
    // await apiRequest(API_CONFIG.ENDPOINTS.COMPANY, {
    //   method: 'POST',
    //   body: JSON.stringify(companyPayload),
    // });

    // For now, generate temporary ID for local state
    const maxId = Math.max(...apiCompanies.map((c) => c.id), 0);
    const newId = maxId + 1;

    // Create new company object with temporary ID for local state
    const companyToAdd: ApiCompany = {
      id: newId,
      ...companyPayload,
    };

    // Add to company list
    setApiCompanies([...apiCompanies, companyToAdd]);
    
    // Auto-create Corporate HQ store for the new company
    createCorporateHQStore(newId, newCompany.companyname);
    
    // Auto-create default Business Units for the new company
    createDefaultBusinessUnits(newId, newCompany.companyname);
    
    // Show success message
    setSuccessMessage(`Company "${newCompany.companyname}" added successfully with Corporate HQ store and default Business Units!`);
    
    // Reset form
    setNewCompany({
      companyname: "",
      dynamicsid: "",
      ncralohaid: "",
      oracleid: "",
      certAuthority: "",
      instancedid: "",
    });
    
    // Close dialog
    setAddCompanyDialogOpen(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const createCorporateHQStore = async (companyId: number, companyName: string) => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/stores");
      
      const storePayload = {
        storename: "Corporate HQ",
        storeaddress: "",
        storecity: "",
        storestate: "",
        storezip: "",
        companyid: companyId,
        iscorporatehq: true,
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify(storePayload),
      });

      if (response.ok) {
        console.log(`✅ Corporate HQ store auto-created for company "${companyName}"`);
      } else {
        console.warn(`⚠️ Failed to auto-create Corporate HQ store for company "${companyName}"`);
      }
    } catch (err) {
      console.error("Failed to auto-create Corporate HQ store:", err);
    }
  };

  const createDefaultBusinessUnits = async (companyId: number, companyName: string) => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/businessunits");
      
      const defaultBusinessUnits = [
        {
          buname: "Executive Offices",
          buhqaddress1: "",
          buhqaddress2: "",
          buhqcity: "",
          buhqstate: "",
          buhqpostal: "",
          companyid: companyId,
          instanceid: "",
        },
        {
          buname: "Corporate Employees",
          buhqaddress1: "",
          buhqaddress2: "",
          buhqcity: "",
          buhqstate: "",
          buhqpostal: "",
          companyid: companyId,
          instanceid: "",
        },
      ];
      
      // Create both business units
      for (const bu of defaultBusinessUnits) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
          body: JSON.stringify(bu),
        });

        if (response.ok) {
          const createdBU = await response.json();
          // Add to local state
          setBusinessUnits(prev => [...prev, createdBU]);
          console.log(`✅ Business Unit "${bu.buname}" auto-created for company "${companyName}"`);
        } else {
          console.warn(`⚠️ Failed to auto-create Business Unit "${bu.buname}" for company "${companyName}"`);
        }
      }
    } catch (err) {
      console.error("Failed to auto-create default Business Units:", err);
    }
  };

  const handleDeleteCompany = (id: number) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      setApiCompanies(apiCompanies.filter((c) => c.id !== id));
      setSuccessMessage("Company deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleAddUserGroup = () => {
    if (!newGroup.groupid) {
      setErrorMessage("Group ID is required");
      return;
    }

    // Prepare payload for API (without id - Azure will assign it)
    const groupPayload = {
      groupid: newGroup.groupid,
      groupdescription: newGroup.groupdescription,
      groupownerid: newGroup.groupownerid,
      groupcompanyid: newGroup.groupcompanyid,
    };

    // TODO: When integrating with API, use:
    // await apiRequest(API_CONFIG.ENDPOINTS.USER_GROUPS, {
    //   method: 'POST',
    //   body: JSON.stringify(groupPayload),
    // });

    // For now, generate temporary ID for local state
    const maxId = Math.max(...userGroups.map((g) => g.id), 0);
    const newId = maxId + 1;

    // Create new user group object with temporary ID for local state
    const groupToAdd: UserGroup = {
      id: newId,
      ...groupPayload,
    };

    // Add to user groups list
    setUserGroups([...userGroups, groupToAdd]);
    
    // Show success message
    setSuccessMessage(`User Group "${newGroup.groupid}" added successfully!`);
    
    // Reset form
    setNewGroup({
      groupid: "",
      groupdescription: "",
      groupownerid: 0,
      groupcompanyid: "",
    });
    
    // Close dialog
    setAddGroupDialogOpen(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteUserGroup = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user group?")) {
      setUserGroups(userGroups.filter((g) => g.id !== id));
      setSuccessMessage("User Group deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Check if current user is admin for their company
  const isCompanyAdmin = currentCompany?.administratorUid === currentUser?.uid;
  const isSuperUser = currentUser?.role === "superuser";
  const isAdmin = currentUser?.role === "admin";

  if (!currentUser) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert severity="error">Please log in to access the Administrator panel.</Alert>
      </div>
    );
  }

  if (!isCompanyAdmin && !isSuperUser && !isAdmin) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert severity="warning">
          You do not have administrator privileges. Contact your company administrator.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl mb-6">Administrator</h2>
      
      {successMessage && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Company Info */}
      {currentCompany && (
        <Box className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
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

      {/* User Management Section */}
      <section className="p-6 border border-slate-200 rounded-lg mb-6">
        <Box className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl mb-2">User Management</h3>
            <p className="text-slate-600 text-sm">
              {isCompanyAdmin && !isSuperUser
                ? `Manage users for ${currentCompany?.companyName}`
                : "Manage all users in the LunaAI platform"}
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setAddUserDialogOpen(true)}
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            Add User
          </Button>
        </Box>

        <TableContainer component={Paper} className="mt-4">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>City, State</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companyUsers.map((user) => {
                const userCompany = companiesList.find((c) => c.companyId === user.companyId);
                return (
                  <TableRow key={user.uid}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={user.role === "superuser" ? "error" : "default"}
                      />
                    </TableCell>
                    <TableCell>{userCompany?.companyName || "N/A"}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.city}, {user.state}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.uid)}
                        disabled={user.uid === currentUser.uid}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      {/* Business Unit Management Section */}
      <section className="p-6 border border-slate-200 rounded-lg mb-6">
        <Box className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl mb-2">Business Unit Management</h3>
            <p className="text-slate-600 text-sm">
              {isCompanyAdmin && !isSuperUser
                ? `Manage business units for ${currentCompany?.companyName}`
                : "Manage business units across all companies"}
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<AddBusiness />}
            onClick={() => setAddBuDialogOpen(true)}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
            }}
          >
            Add Business Unit
          </Button>
        </Box>

        <TableContainer component={Paper} className="mt-4">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell><strong>Business Unit</strong></TableCell>
                <TableCell><strong>Company ID</strong></TableCell>
                <TableCell><strong>City, State</strong></TableCell>
                <TableCell><strong>Postal Code</strong></TableCell>
                <TableCell><strong>Instance ID</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {businessUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="text-slate-500">
                    No business units found. Click "Add Business Unit" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                businessUnits.map((bu) => (
                  <TableRow key={bu.id}>
                    <TableCell>{bu.buname}</TableCell>
                    <TableCell>{bu.companyid}</TableCell>
                    <TableCell>{bu.buhqcity}, {bu.buhqstate}</TableCell>
                    <TableCell>{bu.buhqpostal}</TableCell>
                    <TableCell>{bu.instanceid}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteBusinessUnit(bu.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      {/* User Groups Management Section */}
      <section className="p-6 border border-slate-200 rounded-lg mb-6">
        <Box className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl mb-2">User Groups Management</h3>
            <p className="text-slate-600 text-sm">
              {isCompanyAdmin && !isSuperUser
                ? `Manage user groups for ${currentCompany?.companyName}`
                : "Manage user groups across all companies"}
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<Group />}
            onClick={() => setAddGroupDialogOpen(true)}
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            Add User Group
          </Button>
        </Box>

        <TableContainer component={Paper} className="mt-4">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell><strong>Group ID</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Group Owner ID</strong></TableCell>
                <TableCell><strong>Company ID</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="text-slate-500">
                    No user groups found. Click "Add User Group" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                userGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.groupid}</TableCell>
                    <TableCell>{group.groupdescription}</TableCell>
                    <TableCell>{group.groupownerid}</TableCell>
                    <TableCell>{group.groupcompanyid}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUserGroup(group.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      {/* Company Management Section (Only for superusers) */}
      {isSuperUser && (
        <section className="p-6 border border-slate-200 rounded-lg mb-6">
          <Box className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl mb-2">Company Management</h3>
              <p className="text-slate-600 text-sm">
                Manage all companies in the LunaAI platform
              </p>
            </div>
            <Button
              variant="contained"
              startIcon={<Business />}
              onClick={() => setAddCompanyDialogOpen(true)}
              sx={{
                backgroundColor: "#8B0000",
                "&:hover": { backgroundColor: "#6B0000" },
              }}
            >
              Add Company
            </Button>
          </Box>

          <TableContainer component={Paper} className="mt-4">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Company Name</strong></TableCell>
                  <TableCell><strong>Dynamics ID</strong></TableCell>
                  <TableCell><strong>Oracle ID</strong></TableCell>
                  <TableCell><strong>Cert Authority</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="text-slate-500">
                      No companies found. Click "Add Company" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.id}</TableCell>
                      <TableCell>{company.companyname}</TableCell>
                      <TableCell>{company.dynamicsid}</TableCell>
                      <TableCell>{company.oracleid}</TableCell>
                      <TableCell>{company.certAuthority}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </section>
      )}

      {/* LLM Provider Settings */}
      <section className="p-6 border border-slate-200 rounded-lg mb-6">
        <h3 className="text-xl mb-3">LLM Provider Settings</h3>
        <p className="text-slate-600 text-sm mb-4">
          Configure API keys, endpoints, and preferences for ChatGPT and Claude AI on Azure.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium">ChatGPT on Azure</p>
              <p className="text-sm text-slate-600">Status: Connected</p>
            </div>
            <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 transition-colors">
              Configure
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium">Claude AI on Azure</p>
              <p className="text-sm text-slate-600">Status: Connected</p>
            </div>
            <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 transition-colors">
              Configure
            </button>
          </div>
        </div>
      </section>

      {/* System Configuration (Only for superusers) */}
      {isSuperUser && (
        <section className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">System Configuration</h3>
          <p className="text-slate-600 text-sm mb-4">
            Adjust system-wide settings, logging, and monitoring preferences.
          </p>
          <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors">
            System Settings
          </button>
        </section>
      )}

      {/* Add User Dialog */}
      <Dialog 
        open={addUserDialogOpen} 
        onClose={() => setAddUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New User to {currentCompany?.companyName}
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" className="mb-4" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
          
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                {isSuperUser && <MenuItem value="superuser">Super User</MenuItem>}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Address Line 1"
              value={newUser.address1}
              onChange={(e) => setNewUser({ ...newUser, address1: e.target.value })}
            />

            <TextField
              fullWidth
              label="Address Line 2"
              value={newUser.address2}
              onChange={(e) => setNewUser({ ...newUser, address2: e.target.value })}
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="City"
                value={newUser.city}
                onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="State"
                value={newUser.state}
                onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
              />
            </Box>

            <TextField
              fullWidth
              label="Zip Code"
              value={newUser.zip}
              onChange={(e) => setNewUser({ ...newUser, zip: e.target.value })}
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Cell"
                value={newUser.cell}
                onChange={(e) => setNewUser({ ...newUser, cell: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained"
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Business Unit Dialog */}
      <Dialog 
        open={addBuDialogOpen} 
        onClose={() => setAddBuDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Business Unit to {currentCompany?.companyName}
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" className="mb-4" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
          
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Business Unit Name"
              value={newBu.buname}
              onChange={(e) => setNewBu({ ...newBu, buname: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Address Line 1"
              value={newBu.buhqaddress1}
              onChange={(e) => setNewBu({ ...newBu, buhqaddress1: e.target.value })}
            />

            <TextField
              fullWidth
              label="Address Line 2"
              value={newBu.buhqaddress2}
              onChange={(e) => setNewBu({ ...newBu, buhqaddress2: e.target.value })}
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="City"
                value={newBu.buhqcity}
                onChange={(e) => setNewBu({ ...newBu, buhqcity: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="State"
                value={newBu.buhqstate}
                onChange={(e) => setNewBu({ ...newBu, buhqstate: e.target.value })}
              />
            </Box>

            <TextField
              fullWidth
              label="Zip Code"
              value={newBu.buhqpostal}
              onChange={(e) => setNewBu({ ...newBu, buhqpostal: e.target.value })}
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Company ID"
                value={newBu.companyid}
                onChange={(e) => setNewBu({ ...newBu, companyid: parseInt(e.target.value) })}
              />
              
              <TextField
                fullWidth
                label="Instance ID"
                value={newBu.instanceid}
                onChange={(e) => setNewBu({ ...newBu, instanceid: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBuDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddBusinessUnit} 
            variant="contained"
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            Add Business Unit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog 
        open={addCompanyDialogOpen} 
        onClose={() => setAddCompanyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Company
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" className="mb-4" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
          
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Company Name"
              value={newCompany.companyname}
              onChange={(e) => setNewCompany({ ...newCompany, companyname: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Dynamics ID"
              value={newCompany.dynamicsid}
              onChange={(e) => setNewCompany({ ...newCompany, dynamicsid: e.target.value })}
            />

            <TextField
              fullWidth
              label="NCRALOHA ID"
              value={newCompany.ncralohaid}
              onChange={(e) => setNewCompany({ ...newCompany, ncralohaid: e.target.value })}
            />

            <TextField
              fullWidth
              label="Oracle ID"
              value={newCompany.oracleid}
              onChange={(e) => setNewCompany({ ...newCompany, oracleid: e.target.value })}
            />

            <TextField
              fullWidth
              label="Cert Authority"
              value={newCompany.certAuthority}
              onChange={(e) => setNewCompany({ ...newCompany, certAuthority: e.target.value })}
            />

            <TextField
              fullWidth
              label="Instance ID"
              value={newCompany.instancedid}
              onChange={(e) => setNewCompany({ ...newCompany, instancedid: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCompanyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCompany} 
            variant="contained"
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            Add Company
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Group Dialog */}
      <Dialog 
        open={addGroupDialogOpen} 
        onClose={() => setAddGroupDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New User Group
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" className="mb-4" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
          
          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Group ID"
              value={newGroup.groupid}
              onChange={(e) => setNewGroup({ ...newGroup, groupid: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Group Description"
              value={newGroup.groupdescription}
              onChange={(e) => setNewGroup({ ...newGroup, groupdescription: e.target.value })}
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Group Owner ID"
                value={newGroup.groupownerid}
                onChange={(e) => setNewGroup({ ...newGroup, groupownerid: parseInt(e.target.value) })}
              />
              
              <TextField
                fullWidth
                label="Group Company ID"
                value={newGroup.groupcompanyid}
                onChange={(e) => setNewGroup({ ...newGroup, groupcompanyid: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGroupDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUserGroup} 
            variant="contained"
            sx={{
              backgroundColor: "#1a1a1a",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            Add User Group
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}