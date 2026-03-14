import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  People,
  Group,
  Store,
  Business,
  CalendarToday,
  AccessTime,
  Description,
  Upload,
  NavigateNext,
  AccountCircle,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { employeeApi } from "../services/apiService";

/**
 * HR Manager Component - Employee, Store, and Team Management
 * Manages employees, stores, business units, PTO requests, timesheets, and documents
 * @version 2.0.0 - Updated to use Employee API
 */
interface Employee {
  id: number;
  employeeid?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  hiredate?: string;
  status?: string;
  companyid?: number;
  salary?: number;
  buid?: number;
  storeid?: number;
  managerid?: number;
  ismanager?: boolean;
}

interface Manager {
  id: number;
  employeeid: number;
  employeename?: string;
  buid?: number;
  buname?: string;
  storeid?: number;
  storename?: string;
  teamsize?: number;
}

interface StoreLocation {
  id: number;
  storename: string;
  storeaddress?: string;
  storecity?: string;
  storestate?: string;
  storezip?: string;
  companyid?: number;
  iscorporatehq?: boolean;
}

interface BusinessUnit {
  id: number;
  buname: string;
  description?: string;
}

interface PTORequest {
  id: number;
  employeeid: number;
  employeename?: string;
  startdate: string;
  enddate: string;
  days: number;
  type: string;
  status: string;
  reason?: string;
  requestdate?: string;
}

interface Timesheet {
  id: number;
  employeeid: number;
  employeename?: string;
  weekending: string;
  mondayhours: number;
  tuesdayhours: number;
  wednesdayhours: number;
  thursdayhours: number;
  fridayhours: number;
  saturdayhours: number;
  sundayhours: number;
  totalhours: number;
  status: string;
}

interface EmployeeDocument {
  id: number;
  employeeid: number;
  employeename?: string;
  documenttype: string;
  filename: string;
  fileurl?: string;
  uploaddate: string;
}

interface Company {
  id: number;
  companyname: string;
}

export function HRManager() {
  const [currentTab, setCurrentTab] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [ptoDialogOpen, setPtoDialogOpen] = useState(false);
  const [timesheetDialogOpen, setTimesheetDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  // Form states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [newStore, setNewStore] = useState<Partial<StoreLocation>>({});
  const [newPTO, setNewPTO] = useState<Partial<PTORequest>>({});
  const [newTimesheet, setNewTimesheet] = useState<Partial<Timesheet>>({});
  const [newDocument, setNewDocument] = useState<Partial<EmployeeDocument>>({});

  // Check if user is superuser
  const currentUserRole = localStorage.getItem("role");
  const currentUsername = localStorage.getItem("username");
  const isSuperUser = currentUserRole === "superuser";
  const isAdmin = currentUserRole === "admin";
  const currentCompanyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (isSuperUser || isAdmin) {
      loadCompanyInfo();
      loadBusinessUnits();
      loadStores();
      loadEmployees();
      loadManagers();
      loadPTORequests();
      loadTimesheets();
      loadDocuments();
    }
  }, []);

  const loadCompanyInfo = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.COMPANY}/${currentCompanyId}`);
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCompany(data);
        console.log("✅ Company info loaded from API");
      } else {
        // Fallback to companies.json if API fails
        console.log("⚠️ API unavailable, loading from local companies.json");
        try {
          const companiesModule = await import("../data/companies.json");
          const companies = companiesModule.default;
          const company = companies.find(
            (c: any) => c.companyId === currentCompanyId
          );
          if (company) {
            setCurrentCompany({ 
              id: company.companyId, 
              companyname: company.companyName 
            });
            console.log("✅ Company info loaded from local JSON:", company.companyName);
          } else {
            console.warn("Company not found in local JSON for ID:", currentCompanyId);
          }
        } catch (err) {
          console.warn("Could not load company info from local fallback:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load company info:", err);
      // Final fallback to companies.json
      try {
        const companiesModule = await import("../data/companies.json");
        const companies = companiesModule.default;
        const company = companies.find(
          (c: any) => c.companyId === currentCompanyId
        );
        if (company) {
          setCurrentCompany({ 
            id: company.companyId, 
            companyname: company.companyName 
          });
          console.log("✅ Company info loaded from local JSON (fallback):", company.companyName);
        }
      } catch (fallbackErr) {
        console.error("Final fallback failed:", fallbackErr);
      }
    }
  };

  const loadBusinessUnits = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(API_CONFIG.ENDPOINTS.BU);
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessUnits(data);
        console.log("✅ Business Units loaded from API");
      } else {
        setBusinessUnits([]);
      }
    } catch (err) {
      console.error("Failed to load Business Units:", err);
      setBusinessUnits([]);
    }
  };

  const loadStores = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/stores");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter by company if needed
        const filteredData = currentCompanyId 
          ? data.filter((store: StoreLocation) => store.companyid?.toString() === currentCompanyId)
          : data;
        setStores(filteredData);
        console.log("✅ Stores loaded from API");
      } else {
        console.warn("⚠️ Stores API unavailable, using empty data");
        setStores([]);
      }
    } catch (err) {
      console.error("Failed to load stores:", err);
      setStores([]);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Use employeeApi from apiService
      const data = await employeeApi.getAll();
      
      // Filter by company if needed
      const filteredData = currentCompanyId 
        ? data.filter((emp: Employee) => emp.companyid?.toString() === currentCompanyId)
        : data;
      
      setEmployees(filteredData);
      console.log("✅ Employees loaded from Employee API:", filteredData.length);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/managers");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setManagers(data);
        console.log("✅ Managers loaded from API");
      } else {
        // Fallback: derive managers from employees
        const managerEmployees = employees.filter(emp => emp.ismanager);
        const derivedManagers = managerEmployees.map(emp => ({
          id: emp.id,
          employeeid: emp.id,
          employeename: `${emp.firstname} ${emp.lastname}`,
          buid: emp.buid,
          storeid: emp.storeid,
          teamsize: employees.filter(e => e.managerid === emp.id).length,
        }));
        setManagers(derivedManagers);
        console.log("✅ Managers derived from employees");
      }
    } catch (err) {
      console.error("Failed to load managers:", err);
      setManagers([]);
    }
  };

  const loadPTORequests = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/pto");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPtoRequests(data);
        console.log("✅ PTO requests loaded from API");
      } else {
        setPtoRequests([]);
      }
    } catch (err) {
      console.error("Failed to load PTO requests:", err);
      setPtoRequests([]);
    }
  };

  const loadTimesheets = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/timesheets");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTimesheets(data);
        console.log("✅ Timesheets loaded from API");
      } else {
        setTimesheets([]);
      }
    } catch (err) {
      console.error("Failed to load timesheets:", err);
      setTimesheets([]);
    }
  };

  const loadDocuments = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/employeedocuments");
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        console.log("✅ Employee documents loaded from API");
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
      setDocuments([]);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.firstname || !newEmployee.lastname || !newEmployee.email) {
      setError("First name, last name, and email are required");
      return;
    }

    try {
      // Get default Corporate HQ store if no store selected
      let storeId = newEmployee.storeid;
      if (!storeId) {
        const corporateHQ = stores.find(s => s.iscorporatehq);
        storeId = corporateHQ?.id;
      }
      
      // Prepare employee data (exclude 'id' - MSSQL auto-generates)
      const employeeData = {
        ...newEmployee,
        companyid: currentCompanyId ? Number(currentCompanyId) : undefined,
        storeid: storeId,
        hiredate: newEmployee.hiredate || new Date().toISOString().split('T')[0],
        status: newEmployee.status || "active",
        ismanager: newEmployee.ismanager || false,
      };
      
      // Remove id from payload (MSSQL auto-generates)
      const { id, ...createData } = employeeData as any;
      
      // Use employeeApi from apiService
      await employeeApi.create(createData);
      
      setSuccess("Employee added successfully!");
      setEmployeeDialogOpen(false);
      setNewEmployee({});
      loadEmployees();
      loadManagers(); // Refresh managers if new employee is a manager
    } catch (err) {
      console.error("Failed to add employee:", err);
      setError("Failed to add employee: " + err);
    }
  };

  const handleAddStore = async () => {
    if (!newStore.storename) {
      setError("Store name is required");
      return;
    }

    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl("/api/stores");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify({
          ...newStore,
          companyid: currentCompanyId,
          iscorporatehq: newStore.iscorporatehq || false,
        }),
      });

      if (response.ok) {
        setSuccess("Store added successfully!");
        setStoreDialogOpen(false);
        setNewStore({});
        loadStores();
      } else {
        setError("Failed to add store");
      }
    } catch (err) {
      setError("Failed to add store: " + err);
    }
  };

  const handleApprovePTO = async (ptoId: number, status: "approved" | "denied") => {
    try {
      const uid = localStorage.getItem("uid");
      const url = getApiUrl(`/api/pto/${ptoId}`);
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSuccess(`PTO request ${status}!`);
        loadPTORequests();
      } else {
        setError("Failed to update PTO request");
      }
    } catch (err) {
      setError("Failed to update PTO request: " + err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getStoreName = (storeId?: number) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.storename : "N/A";
  };

  const getBUName = (buId?: number) => {
    const bu = businessUnits.find(b => b.id === buId);
    return bu ? bu.buname : "N/A";
  };

  const getManagerName = (managerId?: number) => {
    const manager = employees.find(e => e.id === managerId);
    return manager ? `${manager.firstname} ${manager.lastname}` : "N/A";
  };

  if (!isSuperUser && !isAdmin) {
    return (
      <Box className="max-w-6xl mx-auto">
        <Alert severity="warning">
          Access Denied: HR Manager is only available to superusers and admins.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h3" component="h2" className="mb-2">
          HR Manager
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-3">
          Manage employees, managers, stores, PTO requests, timesheets, and employee documents.
        </Typography>

        {/* Breadcrumbs - Current Company and User Role */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ 
            mt: 2,
            p: 2,
            backgroundColor: "#f8f9fa",
            borderRadius: 1,
            border: "1px solid #e0e0e0"
          }}
        >
          <Box className="flex items-center gap-1">
            <Business fontSize="small" sx={{ color: "#8B0000" }} />
            <Typography variant="body2" color="text.primary">
              <strong>Company:</strong> {currentCompany?.companyname || "Loading..."}
            </Typography>
          </Box>
          <Box className="flex items-center gap-1">
            <AccountCircle fontSize="small" sx={{ color: "#8B0000" }} />
            <Typography variant="body2" color="text.primary">
              <strong>User:</strong> {currentUsername || "Unknown"}
            </Typography>
          </Box>
          <Box className="flex items-center gap-1">
            <Chip 
              label={isSuperUser ? "Super User" : "Admin"} 
              size="small" 
              sx={{ 
                backgroundColor: "#8B0000", 
                color: "white",
                fontWeight: "bold"
              }} 
            />
          </Box>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} className="mb-4">
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        >
          <Tab icon={<People />} label="Employees" iconPosition="start" />
          <Tab icon={<Group />} label="Managers & Teams" iconPosition="start" />
          <Tab icon={<Store />} label="Stores/Branches" iconPosition="start" />
          <Tab icon={<Business />} label="Business Units" iconPosition="start" />
          <Tab icon={<CalendarToday />} label="PTO" iconPosition="start" />
          <Tab icon={<AccessTime />} label="Timesheets" iconPosition="start" />
          <Tab icon={<Description />} label="Documents" iconPosition="start" />
        </Tabs>
      </Box>

      {/* EMPLOYEES TAB */}
      {currentTab === 0 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Employee Directory</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setEmployeeDialogOpen(true)}
              sx={{ 
                backgroundColor: "#8B0000", 
                "&:hover": { backgroundColor: "#a00" } 
              }}
            >
              Add Employee
            </Button>
          </Box>

          {loading ? (
            <Box className="flex justify-center p-8">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Position</strong></TableCell>
                    <TableCell><strong>BU</strong></TableCell>
                    <TableCell><strong>Store/Branch</strong></TableCell>
                    <TableCell><strong>Manager</strong></TableCell>
                    <TableCell><strong>Is Manager</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No employees found. Add your first employee!
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.firstname} {emp.lastname}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.position || "N/A"}</TableCell>
                        <TableCell>{getBUName(emp.buid)}</TableCell>
                        <TableCell>
                          {getStoreName(emp.storeid)}
                          {stores.find(s => s.id === emp.storeid)?.iscorporatehq && (
                            <Chip label="HQ" size="small" color="primary" sx={{ ml: 1 }} />
                          )}
                        </TableCell>
                        <TableCell>{getManagerName(emp.managerid)}</TableCell>
                        <TableCell>
                          {emp.ismanager ? (
                            <Chip label="Manager" size="small" color="info" />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={emp.status || "active"} 
                            color={emp.status === "active" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* MANAGERS & TEAMS TAB */}
      {currentTab === 1 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Managers & Teams</Typography>
          </Box>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.length === 0 ? (
              <div className="col-span-full">
                <Alert severity="info">
                  No managers found. Add employees with "Is Manager" enabled to see them here.
                </Alert>
              </div>
            ) : (
              managers.map((manager) => {
                const teamMembers = employees.filter(e => e.managerid === manager.employeeid);
                
                return (
                  <div key={manager.id}>
                    <Card>
                      <CardContent>
                        <Box className="flex items-center gap-2 mb-3">
                          <Group color="primary" />
                          <Typography variant="h6">
                            {manager.employeename || `Employee #${manager.employeeid}`}
                          </Typography>
                        </Box>
                        
                        <Box className="space-y-2 text-sm">
                          <Box className="flex justify-between">
                            <span className="text-slate-600">Business Unit:</span>
                            <strong>{getBUName(manager.buid)}</strong>
                          </Box>
                          <Box className="flex justify-between">
                            <span className="text-slate-600">Store/Branch:</span>
                            <strong>{getStoreName(manager.storeid)}</strong>
                          </Box>
                          <Box className="flex justify-between">
                            <span className="text-slate-600">Team Size:</span>
                            <Chip label={teamMembers.length} size="small" color="primary" />
                          </Box>
                        </Box>

                        {teamMembers.length > 0 && (
                          <Box className="mt-4">
                            <Typography variant="subtitle2" className="mb-2 text-slate-700">
                              Team Members:
                            </Typography>
                            <Box className="space-y-1">
                              {teamMembers.map(member => (
                                <Box key={member.id} className="text-xs bg-slate-50 p-2 rounded">
                                  {member.firstname} {member.lastname} - {member.position || "N/A"}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })
            )}
          </div>
        </Box>
      )}

      {/* STORES/BRANCHES TAB */}
      {currentTab === 2 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Stores & Branches</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setStoreDialogOpen(true)}
              sx={{ 
                backgroundColor: "#8B0000", 
                "&:hover": { backgroundColor: "#a00" } 
              }}
            >
              Add Store
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Store Name</strong></TableCell>
                  <TableCell><strong>Address</strong></TableCell>
                  <TableCell><strong>City</strong></TableCell>
                  <TableCell><strong>State</strong></TableCell>
                  <TableCell><strong>ZIP</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Employees</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No stores found. Add your first store/branch!
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => {
                    const storeEmployeeCount = employees.filter(e => e.storeid === store.id).length;
                    
                    return (
                      <TableRow key={store.id}>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            {store.storename}
                            {store.iscorporatehq && (
                              <Chip label="Corporate HQ" size="small" color="primary" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{store.storeaddress || "N/A"}</TableCell>
                        <TableCell>{store.storecity || "N/A"}</TableCell>
                        <TableCell>{store.storestate || "N/A"}</TableCell>
                        <TableCell>{store.storezip || "N/A"}</TableCell>
                        <TableCell>
                          {store.iscorporatehq ? (
                            <Chip label="Headquarters" size="small" color="primary" />
                          ) : (
                            <Chip label="Branch" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={storeEmployeeCount} size="small" />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                          {!store.iscorporatehq && (
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* BUSINESS UNITS TAB */}
      {currentTab === 3 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Business Units</Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Business Unit Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {businessUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No business units found.
                    </TableCell>
                  </TableRow>
                ) : (
                  businessUnits.map((bu) => (
                    <TableRow key={bu.id}>
                      <TableCell>{bu.buname}</TableCell>
                      <TableCell>{bu.description || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* PTO REQUESTS TAB */}
      {currentTab === 4 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">PTO Requests</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setPtoDialogOpen(true)}
              sx={{ 
                backgroundColor: "#8B0000", 
                "&:hover": { backgroundColor: "#a00" } 
              }}
            >
              New PTO Request
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Start Date</strong></TableCell>
                  <TableCell><strong>End Date</strong></TableCell>
                  <TableCell><strong>Days</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ptoRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No PTO requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ptoRequests.map((pto) => (
                    <TableRow key={pto.id}>
                      <TableCell>{pto.employeename || `Employee #${pto.employeeid}`}</TableCell>
                      <TableCell>
                        <Chip label={pto.type} size="small" />
                      </TableCell>
                      <TableCell>{formatDate(pto.startdate)}</TableCell>
                      <TableCell>{formatDate(pto.enddate)}</TableCell>
                      <TableCell>{pto.days}</TableCell>
                      <TableCell>
                        <Chip 
                          label={pto.status} 
                          color={
                            pto.status === "approved" ? "success" : 
                            pto.status === "denied" ? "error" : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {pto.status === "pending" && (
                          <>
                            <Button 
                              size="small" 
                              color="success" 
                              onClick={() => handleApprovePTO(pto.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => handleApprovePTO(pto.id, "denied")}
                            >
                              Deny
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TIMESHEETS TAB */}
      {currentTab === 5 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Employee Timesheets</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTimesheetDialogOpen(true)}
              sx={{ 
                backgroundColor: "#8B0000", 
                "&:hover": { backgroundColor: "#a00" } 
              }}
            >
              Add Timesheet
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Week Ending</strong></TableCell>
                  <TableCell><strong>Total Hours</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No timesheets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  timesheets.map((ts) => (
                    <TableRow key={ts.id}>
                      <TableCell>{ts.employeename || `Employee #${ts.employeeid}`}</TableCell>
                      <TableCell>{formatDate(ts.weekending)}</TableCell>
                      <TableCell>{ts.totalhours} hrs</TableCell>
                      <TableCell>
                        <Chip 
                          label={ts.status} 
                          color={
                            ts.status === "approved" ? "success" : 
                            ts.status === "submitted" ? "warning" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* DOCUMENTS TAB */}
      {currentTab === 6 && (
        <Box>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Employee Documents</Typography>
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setDocumentDialogOpen(true)}
              sx={{ 
                backgroundColor: "#8B0000", 
                "&:hover": { backgroundColor: "#a00" } 
              }}
            >
              Upload Document
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Document Type</strong></TableCell>
                  <TableCell><strong>File Name</strong></TableCell>
                  <TableCell><strong>Upload Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No documents found. Upload employee documents to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.employeename || `Employee #${doc.employeeid}`}</TableCell>
                      <TableCell>
                        <Chip label={doc.documenttype} size="small" />
                      </TableCell>
                      <TableCell>{doc.filename}</TableCell>
                      <TableCell>{formatDate(doc.uploaddate)}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Download
                        </Button>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ADD EMPLOYEE DIALOG */}
      <Dialog open={employeeDialogOpen} onClose={() => setEmployeeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="First Name *"
                value={newEmployee.firstname || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, firstname: e.target.value })}
              />
              <TextField
                fullWidth
                label="Last Name *"
                value={newEmployee.lastname || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, lastname: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={newEmployee.email || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Phone"
                value={newEmployee.phone || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Position"
                value={newEmployee.position || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
              <TextField
                fullWidth
                label="Department"
                value={newEmployee.department || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Business Unit</InputLabel>
                <Select
                  value={newEmployee.buid || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, buid: Number(e.target.value) })}
                  label="Business Unit"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {businessUnits.map(bu => (
                    <MenuItem key={bu.id} value={bu.id}>
                      {bu.buname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Store/Branch</InputLabel>
                <Select
                  value={newEmployee.storeid || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, storeid: Number(e.target.value) })}
                  label="Store/Branch"
                >
                  <MenuItem value="">
                    <em>Corporate HQ (default)</em>
                  </MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.storename} {store.iscorporatehq && "(HQ)"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={newEmployee.managerid || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, managerid: Number(e.target.value) })}
                  label="Manager"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {employees.filter(e => e.ismanager).map(manager => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.firstname} {manager.lastname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newEmployee.hiredate || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, hiredate: e.target.value })}
              />
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={newEmployee.salary || ""}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
              />
              <FormControl fullWidth>
                <InputLabel>Is Manager?</InputLabel>
                <Select
                  value={newEmployee.ismanager ? "yes" : "no"}
                  onChange={(e) => setNewEmployee({ ...newEmployee, ismanager: e.target.value === "yes" })}
                  label="Is Manager?"
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmployeeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddEmployee} 
            variant="contained"
            sx={{ 
              backgroundColor: "#8B0000", 
              "&:hover": { backgroundColor: "#a00" } 
            }}
          >
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD STORE DIALOG */}
      <Dialog open={storeDialogOpen} onClose={() => setStoreDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Store/Branch</DialogTitle>
        <DialogContent>
          <Box className="space-y-2.5 pt-2">
            <TextField
              fullWidth
              label="Store Name *"
              value={newStore.storename || ""}
              onChange={(e) => setNewStore({ ...newStore, storename: e.target.value })}
            />
            <TextField
              fullWidth
              label="Address"
              value={newStore.storeaddress || ""}
              onChange={(e) => setNewStore({ ...newStore, storeaddress: e.target.value })}
            />
            <TextField
              fullWidth
              label="City"
              value={newStore.storecity || ""}
              onChange={(e) => setNewStore({ ...newStore, storecity: e.target.value })}
            />
            <TextField
              fullWidth
              label="State"
              value={newStore.storestate || ""}
              onChange={(e) => setNewStore({ ...newStore, storestate: e.target.value })}
            />
            <TextField
              fullWidth
              label="ZIP Code"
              value={newStore.storezip || ""}
              onChange={(e) => setNewStore({ ...newStore, storezip: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Is Corporate HQ?</InputLabel>
              <Select
                value={newStore.iscorporatehq ? "yes" : "no"}
                onChange={(e) => setNewStore({ ...newStore, iscorporatehq: e.target.value === "yes" })}
                label="Is Corporate HQ?"
              >
                <MenuItem value="no">No - Regular Branch</MenuItem>
                <MenuItem value="yes">Yes - Corporate Headquarters</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoreDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddStore} 
            variant="contained"
            sx={{ 
              backgroundColor: "#8B0000", 
              "&:hover": { backgroundColor: "#a00" } 
            }}
          >
            Add Store
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}