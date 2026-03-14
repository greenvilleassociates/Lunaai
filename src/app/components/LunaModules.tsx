import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  ShoppingCart,
  Share,
  Inventory,
  Storefront,
  AccountBalance,
  PhoneAndroid,
  Edit,
  Info,
  CheckCircle,
  Cancel,
  People,
  VpnKey,
  Visibility,
  Business,
  Terminal,
  Assignment,
  Category,
  LocationOn,
  AutoAwesome,
  ArrowUpward,
  ArrowDownward,
  Campaign,
  Cloud,
  GridOn,
  Security,
  Dns,
  HomeWork,
  PersonAdd,
  CorporateFare,
  Cable,
  SettingsInputAntenna,
  Router,
} from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface Module {
  id: string;
  name: string;
  vendor: string;
  description: string;
  icon: React.ReactNode;
  maxUsers: number;
  currentUsers: number;
  licenseType: "Trial" | "Standard" | "Professional" | "Enterprise" | "Unlimited";
  isActive: boolean;
  availableForSale: boolean; // NEW: Controls if module is visible and can be purchased
  expiryDate?: string;
  features: string[];
  serverQuantities?: {
    region: string;
    quantity: number;
    stores: { name: string; location: string }[];
  }[];
  gridCharges?: {
    region: string;
    chargePerGrid: number;
    stores: { name: string; location: string }[];
  }[];
  clusterLicenses?: {
    siteName: string;
    nodesPerCluster: number;
    location: string;
  }[];
  remoteAgents?: {
    agentType: string;
    activeAgents: number;
    region: string;
  }[];
  personalCALs?: {
    userName: string;
    email: string;
    activationDate: string;
  }[];
  siteCALs?: {
    siteName: string;
    businessName: string;
    maxUsers: number;
    activeUsers: number;
  }[];
  gridConnectors?: {
    hqSite: string;
    connectorID: string;
    location: string;
    status: "Active" | "Inactive";
  }[];
}

const LICENSE_TYPES = ["Trial", "Standard", "Professional", "Enterprise", "Unlimited"];

const DEFAULT_MODULES: Module[] = [
  {
    id: "fusion-commerce",
    name: "Greenville Fusion Commerce Professional",
    vendor: "Greenville Associates",
    description: "Complete sales management and CRM tools for tracking leads, opportunities, and closing deals",
    icon: <ShoppingCart fontSize="large" />,
    maxUsers: 10,
    currentUsers: 3,
    licenseType: "Standard",
    isActive: true,
    features: ["Lead Management", "Pipeline Tracking", "Quote Generation", "Sales Analytics"],
  },
  {
    id: "fusionpro-social",
    name: "Greenville FusionPro SocialMedia Extreme",
    vendor: "Greenville Associates",
    description: "Integrate and manage social media campaigns across multiple platforms with AI-powered insights",
    icon: <Share fontSize="large" />,
    maxUsers: 5,
    currentUsers: 2,
    licenseType: "Professional",
    isActive: true,
    features: ["Multi-Platform Publishing", "Analytics Dashboard", "Engagement Tracking", "AI Content Suggestions"],
  },
  {
    id: "product-inventory",
    name: "Greenville EIS Professional",
    vendor: "Greenville Associates",
    description: "Enterprise Inventory System with real-time tracking, stock alerts, and automated reordering capabilities",
    icon: <Inventory fontSize="large" />,
    maxUsers: 15,
    currentUsers: 8,
    licenseType: "Standard",
    isActive: true,
    features: ["Real-time Tracking", "Stock Alerts", "Barcode Scanning", "Multi-Warehouse Support"],
  },
  {
    id: "product-showcase",
    name: "CTS ProxOne Extender",
    vendor: "CTS",
    description: "Beautiful product catalogs and digital showrooms for presenting your offerings",
    icon: <Storefront fontSize="large" />,
    maxUsers: 20,
    currentUsers: 12,
    licenseType: "Professional",
    isActive: true,
    features: ["Digital Catalogs", "360° Product Views", "Custom Branding", "QR Code Integration"],
  },
  {
    id: "fusion-accounting",
    name: "Greenville FusionOpen Backoffice",
    vendor: "Greenville Associates",
    description: "Advanced accounting and financial management with AI-powered insights and reporting",
    icon: <AccountBalance fontSize="large" />,
    maxUsers: 30,
    currentUsers: 18,
    licenseType: "Enterprise",
    isActive: true,
    features: ["General Ledger", "AP/AR Management", "Financial Reporting", "Tax Compliance"],
  },
  {
    id: "fusion-mobile",
    name: "Greenville Fusion Mobile",
    vendor: "Greenville Associates",
    description: "Mobile-first platform for field sales, service technicians, and remote workforce",
    icon: <PhoneAndroid fontSize="large" />,
    maxUsers: 50,
    currentUsers: 32,
    licenseType: "Unlimited",
    isActive: true,
    features: ["Offline Access", "GPS Tracking", "Mobile Payments", "Photo/Document Upload"],
  },
  {
    id: "proximity-one",
    name: "CTS Proximity One",
    vendor: "CTS",
    description: "Location-based analytics and geospatial intelligence for data-driven decision making",
    icon: <LocationOn fontSize="large" />,
    maxUsers: 45,
    currentUsers: 24,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Geospatial Analytics", "Location Intelligence", "Demographic Data", "Custom Mapping", "Market Analysis"],
  },
  {
    id: "gem",
    name: "Greenville Enterprise Manager(GEM)",
    vendor: "Greenville Associates",
    description: "Comprehensive enterprise resource planning and management system for large organizations",
    icon: <Business fontSize="large" />,
    maxUsers: 100,
    currentUsers: 45,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Resource Planning", "Asset Management", "Workflow Automation", "Enterprise Reporting", "Multi-Site Support"],
  },
  {
    id: "fusion-shell",
    name: "Greenville Fusion Shell Professional",
    vendor: "Greenville Associates",
    description: "Advanced command-line interface and automation shell for power users and developers",
    icon: <Terminal fontSize="large" />,
    maxUsers: 40,
    currentUsers: 22,
    licenseType: "Professional",
    isActive: true,
    features: ["Script Automation", "Custom Commands", "API Integration", "Batch Processing", "Advanced Logging"],
  },
  {
    id: "project-management",
    name: "Greenville Project Management Professional",
    vendor: "Greenville Associates",
    description: "Professional project management tools with Gantt charts, resource allocation, and team collaboration",
    icon: <Assignment fontSize="large" />,
    maxUsers: 60,
    currentUsers: 28,
    licenseType: "Professional",
    isActive: true,
    features: ["Gantt Charts", "Resource Planning", "Task Management", "Time Tracking", "Milestone Tracking", "Team Collaboration"],
  },
  {
    id: "fusionshell-sqlazure",
    name: "Greenville FusionShell Professional -(SQLAzure)",
    vendor: "Greenville Associates",
    description: "Advanced database shell with SQL Azure integration for enterprise data management and automation",
    icon: <Terminal fontSize="large" />,
    maxUsers: 35,
    currentUsers: 19,
    licenseType: "Enterprise",
    isActive: true,
    features: ["SQL Azure Integration", "Database Automation", "Query Optimization", "Data Migration", "Performance Monitoring"],
  },
  {
    id: "superluna",
    name: "SuperLuna AI Orchestrator",
    vendor: "CTS",
    description: "Intelligent AI orchestration platform with multi-LLM routing, priority management, and SLM privacy mode",
    icon: <AutoAwesome fontSize="large" />,
    maxUsers: 100,
    currentUsers: 47,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Multi-LLM Routing", "Priority Management", "Section-Based Preferences", "SLM Privacy Mode", "Custom Model Support"],
  },
  {
    id: "luna-enterprise-security",
    name: "Luna Enterprise(9) Security",
    vendor: "CTS",
    description: "Enterprise-grade security platform with advanced threat protection, encryption, compliance monitoring, and access control",
    icon: <Security fontSize="large" />,
    maxUsers: 150,
    currentUsers: 62,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Threat Detection", "Data Encryption", "Compliance Monitoring", "Access Control", "Audit Logging", "Multi-Factor Authentication", "Security Analytics", "Incident Response"],
  },
  {
    id: "adbasepro",
    name: "Greenville AdBasePro",
    vendor: "Greenville Associates",
    description: "Professional advertising and campaign management platform with multi-channel ad tracking and ROI analytics",
    icon: <Campaign fontSize="large" />,
    maxUsers: 25,
    currentUsers: 14,
    licenseType: "Professional",
    isActive: true,
    features: ["Multi-Channel Campaigns", "Ad Performance Tracking", "ROI Analytics", "A/B Testing", "Audience Targeting"],
  },
  {
    id: "mylinkv3-hr",
    name: "Greenville MyLinkV3 HR Pro",
    vendor: "Greenville Associates",
    description: "Comprehensive human resources management system with employee onboarding, performance tracking, and benefits administration",
    icon: <People fontSize="large" />,
    maxUsers: 75,
    currentUsers: 38,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Employee Onboarding", "Performance Reviews", "Benefits Administration", "Time & Attendance", "Payroll Integration", "Compliance Tracking"],
  },
  {
    id: "grid-pro-servers",
    name: "CTS Grid Pro Servers",
    vendor: "CTS",
    description: "Global cloud infrastructure with Grid Pro Servers across 12 regions for maximum performance and redundancy",
    icon: <Cloud fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Enterprise",
    isActive: true,
    features: ["99.99% Uptime SLA", "Auto-Scaling", "Load Balancing", "Geo-Redundancy", "CDN Integration", "DDoS Protection", "24/7 Monitoring", "Multi-Region Deployment"],
    serverQuantities: [
      { region: "NA", quantity: 3, stores: [{ name: "W US/CA", location: "Seattle, WA" }, { name: "C US/CA", location: "Chicago, IL" }, { name: "E US/CA", location: "New York, NY" }] },
      { region: "ISLES", quantity: 2, stores: [{ name: "N ISLES (UK/IRE)", location: "Edinburgh, Scotland" }, { name: "S ISLES (UK/IRE)", location: "Dublin, Ireland" }] },
      { region: "EU", quantity: 3, stores: [{ name: "W Europe", location: "London, UK" }, { name: "C Europe", location: "Frankfurt, Germany" }, { name: "E Europe", location: "Warsaw, Poland" }] },
      { region: "ASIA", quantity: 2, stores: [{ name: "N Asia", location: "Tokyo, Japan" }, { name: "S Asia", location: "Singapore" }] },
      { region: "INDIA", quantity: 1, stores: [{ name: "India N", location: "Mumbai, India" }] },
      { region: "AUS", quantity: 1, stores: [{ name: "AUS South", location: "Sydney, Australia" }] },
      { region: "AMERICAS", quantity: 4, stores: [{ name: "Mexico City", location: "Mexico City, Mexico" }, { name: "Panama North", location: "Panama City, Panama" }, { name: "Uruguay", location: "Montevideo, Uruguay" }, { name: "Brazil S", location: "São Paulo, Brazil" }] },
    ],
    gridCharges: [
      { region: "NA", chargePerGrid: 100, stores: [{ name: "W US/CA", location: "Seattle, WA" }, { name: "C US/CA", location: "Chicago, IL" }, { name: "E US/CA", location: "New York, NY" }] },
      { region: "ISLES", chargePerGrid: 150, stores: [{ name: "N ISLES (UK/IRE)", location: "Edinburgh, Scotland" }, { name: "S ISLES (UK/IRE)", location: "Dublin, Ireland" }] },
      { region: "EU", chargePerGrid: 200, stores: [{ name: "W Europe", location: "London, UK" }, { name: "C Europe", location: "Frankfurt, Germany" }, { name: "E Europe", location: "Warsaw, Poland" }] },
      { region: "ASIA", chargePerGrid: 250, stores: [{ name: "N Asia", location: "Tokyo, Japan" }, { name: "S Asia", location: "Singapore" }] },
      { region: "INDIA", chargePerGrid: 300, stores: [{ name: "India N", location: "Mumbai, India" }] },
      { region: "AUS", chargePerGrid: 350, stores: [{ name: "AUS South", location: "Sydney, Australia" }] },
      { region: "AMERICAS", chargePerGrid: 400, stores: [{ name: "Mexico City", location: "Mexico City, Mexico" }, { name: "Panama North", location: "Panama City, Panama" }, { name: "Uruguay", location: "Montevideo, Uruguay" }, { name: "Brazil S", location: "São Paulo, Brazil" }] },
    ],
  },
  {
    id: "grid-regions",
    name: "CTS Grid Regions",
    vendor: "CTS",
    description: "Regional grid pricing and availability with charge per grid across global data center locations",
    icon: <GridOn fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Global Coverage", "Regional Pricing", "Flexible Billing", "Usage Analytics", "Cost Optimization", "Real-time Metering"],
    gridCharges: [
      { region: "NA", chargePerGrid: 100, stores: [{ name: "W US/CA", location: "Seattle, WA" }, { name: "C US/CA", location: "Chicago, IL" }, { name: "E US/CA", location: "New York, NY" }] },
      { region: "ISLES", chargePerGrid: 150, stores: [{ name: "N ISLES (UK/IRE)", location: "Edinburgh, Scotland" }, { name: "S ISLES (UK/IRE)", location: "Dublin, Ireland" }] },
      { region: "EU", chargePerGrid: 200, stores: [{ name: "W Europe", location: "London, UK" }, { name: "C Europe", location: "Frankfurt, Germany" }, { name: "E Europe", location: "Warsaw, Poland" }] },
      { region: "ASIA", chargePerGrid: 250, stores: [{ name: "N Asia", location: "Tokyo, Japan" }, { name: "S Asia", location: "Singapore" }] },
      { region: "INDIA", chargePerGrid: 300, stores: [{ name: "India N", location: "Mumbai, India" }] },
      { region: "AUS", chargePerGrid: 350, stores: [{ name: "AUS South", location: "Sydney, Australia" }] },
      { region: "AMERICAS", chargePerGrid: 400, stores: [{ name: "Mexico City", location: "Mexico City, Mexico" }, { name: "Panama North", location: "Panama City, Panama" }, { name: "Uruguay", location: "Montevideo, Uruguay" }, { name: "Brazil S", location: "São Paulo, Brazil" }] },
    ],
  },
  {
    id: "strangefarms-cluster",
    name: "Greenville StrangeFarms Cluster Licenses",
    vendor: "Greenville Associates",
    description: "High-performance cluster computing licenses with 8 nodes per site configuration for distributed workloads",
    icon: <Dns fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Enterprise",
    isActive: true,
    features: ["8 Nodes Per Cluster", "Site-Based Licensing", "Load Balancing", "Fault Tolerance", "Distributed Computing", "High Availability"],
    clusterLicenses: [
      { siteName: "Corporate HQ", nodesPerCluster: 8, location: "Washington, DC" },
      { siteName: "West Coast Hub", nodesPerCluster: 8, location: "San Francisco, CA" },
      { siteName: "Midwest Center", nodesPerCluster: 8, location: "Chicago, IL" },
      { siteName: "EU Operations", nodesPerCluster: 8, location: "Frankfurt, Germany" },
      { siteName: "APAC Hub", nodesPerCluster: 8, location: "Singapore" },
    ],
  },
  {
    id: "businesspro-edge",
    name: "CTS BusinessPro Edge",
    vendor: "CTS",
    description: "Edge computing servers for home users and remote agents with distributed processing capabilities",
    icon: <HomeWork fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Professional",
    isActive: true,
    features: ["Home User Support", "Remote Agent Access", "Edge Computing", "Low Latency", "Distributed Processing", "Secure Connectivity"],
    remoteAgents: [
      { agentType: "Home Users", activeAgents: 127, region: "North America" },
      { agentType: "Remote Agents", activeAgents: 89, region: "North America" },
      { agentType: "Home Users", activeAgents: 64, region: "Europe" },
      { agentType: "Remote Agents", activeAgents: 45, region: "Europe" },
      { agentType: "Home Users", activeAgents: 32, region: "Asia Pacific" },
      { agentType: "Remote Agents", activeAgents: 28, region: "Asia Pacific" },
    ],
  },
  {
    id: "zt-cloud-personal-cal",
    name: "CTS ZT Cloud Personal CAL for Individuals",
    vendor: "CTS",
    description: "Zero Trust Cloud Personal Client Access Licenses for individual users with enhanced security and privacy",
    icon: <PersonAdd fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Standard",
    isActive: true,
    features: ["Zero Trust Security", "Individual Licensing", "Cloud Access", "Multi-Factor Authentication", "End-to-End Encryption", "Personal Dashboard"],
    personalCALs: [
      { userName: "John Smith", email: "john.smith@example.com", activationDate: "2025-01-15" },
      { userName: "Sarah Johnson", email: "sarah.j@example.com", activationDate: "2025-02-03" },
      { userName: "Michael Chen", email: "m.chen@example.com", activationDate: "2025-02-18" },
      { userName: "Emily Rodriguez", email: "emily.r@example.com", activationDate: "2025-03-01" },
      { userName: "David Kim", email: "david.kim@example.com", activationDate: "2025-03-10" },
    ],
  },
  {
    id: "zt-cloud-site-cal",
    name: "CTS ZT Cloud Site CAL for Businesses",
    vendor: "CTS",
    description: "Zero Trust Cloud Site Client Access Licenses for business locations with scalable user management",
    icon: <CorporateFare fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Zero Trust Architecture", "Site-Based Licensing", "Scalable User Management", "Business Analytics", "Centralized Administration", "Compliance Reporting"],
    siteCALs: [
      { siteName: "Corporate HQ", businessName: "Capitol Technology Solutions", maxUsers: 250, activeUsers: 187 },
      { siteName: "West Coast Office", businessName: "Capitol Technology Solutions", maxUsers: 150, activeUsers: 98 },
      { siteName: "European Branch", businessName: "Capitol Technology Solutions", maxUsers: 100, activeUsers: 76 },
      { siteName: "APAC Hub", businessName: "Capitol Technology Solutions", maxUsers: 75, activeUsers: 52 },
    ],
  },
  {
    id: "grid-connector-licenses",
    name: "CTS Grid Connector Licenses for HQ Sites",
    vendor: "CTS",
    description: "Enterprise grid connector licenses for headquarters sites enabling seamless cloud-to-premise integration",
    icon: <Cable fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Cloud-to-Premise Integration", "High-Speed Connectivity", "Load Balancing", "Failover Protection", "Real-Time Synchronization", "Enterprise Support"],
    gridConnectors: [
      { hqSite: "Corporate HQ", connectorID: "GC-HQ-001", location: "Washington, DC", status: "Active" },
      { hqSite: "West Coast HQ", connectorID: "GC-WC-002", location: "San Francisco, CA", status: "Active" },
      { hqSite: "European HQ", connectorID: "GC-EU-003", location: "Frankfurt, Germany", status: "Active" },
      { hqSite: "APAC HQ", connectorID: "GC-AP-004", location: "Singapore", status: "Active" },
      { hqSite: "Americas HQ", connectorID: "GC-AM-005", location: "São Paulo, Brazil", status: "Active" },
    ],
  },
  {
    id: "ilec-connector-licenses",
    name: "CTS ILEC Connector Licenses",
    vendor: "CTS",
    description: "Incumbent Local Exchange Carrier connector licenses for telecommunications infrastructure and legacy network integration",
    icon: <SettingsInputAntenna fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Enterprise",
    isActive: true,
    features: ["Telecom Integration", "Legacy Network Support", "PSTN Connectivity", "Regulatory Compliance", "Carrier-Grade Reliability", "24/7 Support"],
    gridConnectors: [
      { hqSite: "Corporate HQ Telecom", connectorID: "ILEC-HQ-001", location: "Washington, DC", status: "Active" },
      { hqSite: "West Regional Telecom", connectorID: "ILEC-WR-002", location: "Denver, CO", status: "Active" },
      { hqSite: "East Regional Telecom", connectorID: "ILEC-ER-003", location: "Atlanta, GA", status: "Active" },
      { hqSite: "Central Telecom Hub", connectorID: "ILEC-CT-004", location: "Dallas, TX", status: "Active" },
      { hqSite: "North Regional Telecom", connectorID: "ILEC-NR-005", location: "Minneapolis, MN", status: "Active" },
      { hqSite: "South Regional Telecom", connectorID: "ILEC-SR-006", location: "Miami, FL", status: "Active" },
    ],
  },
  {
    id: "cap-connector-licenses",
    name: "CTS CAP Connector Licenses",
    vendor: "CTS",
    description: "Competitive Access Provider connector licenses for alternative telecommunications pathways and enhanced network redundancy",
    icon: <Router fontSize="large" />,
    maxUsers: 0,
    currentUsers: 0,
    licenseType: "Professional",
    isActive: true,
    features: ["Alternative Pathways", "Network Redundancy", "Cost Optimization", "Flexible Routing", "Multi-Carrier Support", "Performance Analytics"],
    gridConnectors: [
      { hqSite: "Primary Access Point", connectorID: "CAP-PA-001", location: "New York, NY", status: "Active" },
      { hqSite: "Secondary Access Point", connectorID: "CAP-SA-002", location: "Los Angeles, CA", status: "Active" },
      { hqSite: "Tertiary Access Point", connectorID: "CAP-TA-003", location: "Chicago, IL", status: "Active" },
      { hqSite: "Backup Access Point", connectorID: "CAP-BA-004", location: "Houston, TX", status: "Inactive" },
      { hqSite: "Emergency Access Point", connectorID: "CAP-EA-005", location: "Seattle, WA", status: "Active" },
      { hqSite: "Redundant Access Point", connectorID: "CAP-RA-006", location: "Boston, MA", status: "Active" },
      { hqSite: "Failover Access Point", connectorID: "CAP-FA-007", location: "Phoenix, AZ", status: "Active" },
    ],
  },
];

export function LunaModules() {
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sortField, setSortField] = useState<"name" | "vendor" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const username = localStorage.getItem("username") || "User";
  const uid = localStorage.getItem("uid");
  const userRole = localStorage.getItem("role");
  const isSuperUser = userRole === "superuser";
  const isAdmin = userRole === "admin";
  const isSiteAdmin = username.toLowerCase() === "john"; // Only John is site-administrator

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      // Load from localStorage first
      const storedModules = localStorage.getItem("lunaModulesConfig");
      if (storedModules) {
        const parsedModules = JSON.parse(storedModules);
        // Ensure all modules have availableForSale property
        const modulesWithSale = parsedModules.map((m: Module) => ({
          ...m,
          availableForSale: m.availableForSale !== undefined ? m.availableForSale : true,
        }));
        setModules(modulesWithSale);
        setLoading(false);
        return;
      }

      const url = getApiUrl("/api/lunamodules");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const modulesWithSale = data.map((m: Module) => ({
          ...m,
          availableForSale: m.availableForSale !== undefined ? m.availableForSale : true,
        }));
        setModules(modulesWithSale);
      } else {
        // Fallback to default modules with availableForSale = true
        const modulesWithSale = DEFAULT_MODULES.map(m => ({
          ...m,
          availableForSale: true,
        }));
        setModules(modulesWithSale);
        localStorage.setItem("lunaModulesConfig", JSON.stringify(modulesWithSale));
      }
    } catch (err) {
      console.error("Failed to load modules:", err);
      const modulesWithSale = DEFAULT_MODULES.map(m => ({
        ...m,
        availableForSale: true,
      }));
      setModules(modulesWithSale);
      localStorage.setItem("lunaModulesConfig", JSON.stringify(modulesWithSale));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (module: Module) => {
    setSelectedModule({ ...module });
    setDetailDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule({ ...module });
    setDetailDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleToggleAvailability = (moduleId: string) => {
    if (!isSiteAdmin) {
      setError("Only site administrators can change module availability");
      return;
    }

    const updatedModules = modules.map(m =>
      m.id === moduleId
        ? { ...m, availableForSale: !m.availableForSale }
        : m
    );
    setModules(updatedModules);
    localStorage.setItem("lunaModulesConfig", JSON.stringify(updatedModules));
    
    const module = updatedModules.find(m => m.id === moduleId);
    setSuccess(`Module "${module?.name}" is now ${module?.availableForSale ? 'available' : 'unavailable'} for sale`);
  };

  const handleSaveModule = async () => {
    if (!selectedModule) return;

    try {
      const url = getApiUrl(`/api/lunamodules/${selectedModule.id}`);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify(selectedModule),
      });

      if (response.ok) {
        setModules(
          modules.map((m) => (m.id === selectedModule.id ? selectedModule : m))
        );
        setSuccess(`${selectedModule.name} module updated successfully!`);
        setEditDialogOpen(false);
      } else {
        setError("Failed to update module");
      }
    } catch (err) {
      console.error("Error updating module:", err);
      setError("Failed to update module");
    }
  };

  const toggleModuleStatus = async (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const updatedModule = { ...module, isActive: !module.isActive };

    try {
      const url = getApiUrl(`/api/lunamodules/${moduleId}/toggle`);
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(uid && { Authorization: `Bearer ${uid}` }),
        },
        body: JSON.stringify({ isActive: updatedModule.isActive }),
      });

      if (response.ok) {
        setModules(modules.map((m) => (m.id === moduleId ? updatedModule : m)));
        setSuccess(
          `${module.name} ${updatedModule.isActive ? "activated" : "deactivated"}`
        );
      }
    } catch (err) {
      console.error("Error toggling module:", err);
      setError("Failed to toggle module status");
    }
  };

  const getLicenseColor = (
    licenseType: string
  ): "default" | "primary" | "secondary" | "success" | "warning" => {
    switch (licenseType) {
      case "Trial":
        return "warning";
      case "Standard":
        return "default";
      case "Professional":
        return "primary";
      case "Enterprise":
        return "secondary";
      case "Unlimited":
        return "success";
      default:
        return "default";
    }
  };

  const getUsagePercentage = (current: number, max: number): number => {
    return Math.round((current / max) * 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return "#d32f2f";
    if (percentage >= 75) return "#f57c00";
    return "#2e7d32";
  };

  const handleSort = (field: "name" | "vendor") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter modules based on availableForSale - only site admins can see inactive modules
  const filteredModules = modules.filter(m => 
    isSiteAdmin ? true : m.availableForSale
  );

  const sortedModules = [...filteredModules].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = sortField === "name" ? a.name : a.vendor;
    const bValue = sortField === "name" ? b.name : b.vendor;
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box className="max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <Typography variant="h3" component="h1">
            LunaAI Modules
          </Typography>
          {isSiteAdmin && (
            <Chip 
              label="Site Administrator" 
              color="error" 
              size="small"
              sx={{ 
                fontWeight: "bold",
                fontSize: "10pt",
                backgroundColor: "#8B0000",
                color: "white"
              }}
            />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Manage your LunaAI module licenses, user allocations, and activation status
        </Typography>

        {isSiteAdmin ? (
          <Paper className="p-4 bg-red-50 border border-red-200">
            <Typography variant="body2" className="text-slate-700">
              <strong>Site Administrator Access:</strong> You can control which modules are available for sale.
              Use the toggle switches in the "Available for Sale" column to show/hide modules from users.
              Inactive modules are only visible to you.
            </Typography>
          </Paper>
        ) : (
          <Paper className="p-4 bg-blue-50 border border-blue-200">
            <Typography variant="body2" className="text-slate-700">
              <strong>Module Management:</strong> Each module has a maximum user limit based on your
              license type. Monitor usage and upgrade licenses as needed to accommodate your growing team.
            </Typography>
          </Paper>
        )}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Paper className="p-3">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            {isSiteAdmin ? "Total Modules" : "Available Modules"}
          </Typography>
          <Typography variant="h4">{filteredModules.length}</Typography>
          {isSiteAdmin && modules.length !== filteredModules.length && (
            <Typography variant="caption" color="text.secondary">
              ({modules.length - filteredModules.length} hidden)
            </Typography>
          )}
        </Paper>
        <Paper className="p-3">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            {isSiteAdmin ? "Available for Sale" : "Active Modules"}
          </Typography>
          <Typography variant="h4" className="text-green-600">
            {isSiteAdmin 
              ? modules.filter((m) => m.availableForSale).length
              : filteredModules.filter((m) => m.isActive).length
            }
          </Typography>
        </Paper>
        <Paper className="p-3">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            Total Users
          </Typography>
          <Typography variant="h4">
            {modules.reduce((sum, m) => sum + m.currentUsers, 0)}
          </Typography>
        </Paper>
        <Paper className="p-3">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            Max Capacity
          </Typography>
          <Typography variant="h4">
            {modules.reduce((sum, m) => sum + m.maxUsers, 0)}
          </Typography>
        </Paper>
      </div>

      {/* Striped Table Grid */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ "& .MuiTableCell-root": { fontSize: "10pt" } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1e293b" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "10pt" }}>Status</TableCell>
              <TableCell
                sx={{ 
                  color: "white", 
                  fontWeight: "bold", 
                  fontSize: "10pt",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
                }}
                onClick={() => handleSort("name")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Module Name
                  {sortField === "name" && (
                    sortDirection === "asc" ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    )
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{ 
                  color: "white", 
                  fontWeight: "bold", 
                  fontSize: "10pt",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
                }}
                onClick={() => handleSort("vendor")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Vendor
                  {sortField === "vendor" && (
                    sortDirection === "asc" ? (
                      <ArrowUpward fontSize="small" />
                    ) : (
                      <ArrowDownward fontSize="small" />
                    )
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "10pt" }}>License Type</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "10pt" }}>Users</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "10pt" }}>Utilization</TableCell>
              {isSiteAdmin && (
                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "10pt", textAlign: "center" }}>
                  Available for Sale
                </TableCell>
              )}
              <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "10pt", textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedModules.map((module, index) => {
              const usagePercentage = getUsagePercentage(
                module.currentUsers,
                module.maxUsers
              );
              const usageColor = getUsageColor(usagePercentage);

              return (
                <TableRow
                  key={module.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f8fafc" : "white",
                    "&:hover": { backgroundColor: "#e2e8f0" },
                    opacity: module.isActive ? 1 : 0.6,
                  }}
                >
                  {/* Status */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    {module.isActive ? (
                      <Tooltip title="Active">
                        <CheckCircle className="text-green-600" fontSize="small" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Inactive">
                        <Cancel className="text-slate-400" fontSize="small" />
                      </Tooltip>
                    )}
                  </TableCell>

                  {/* Module Name */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    <Box className="flex items-center gap-2">
                      <Box className={module.isActive ? "text-blue-600" : "text-slate-400"}>
                        {module.icon}
                      </Box>
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600 }}>
                        {module.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Vendor */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    <Typography sx={{ fontSize: "10pt", color: "#64748b" }}>
                      {module.vendor}
                    </Typography>
                  </TableCell>

                  {/* License Type */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    <Chip
                      label={module.licenseType}
                      color={getLicenseColor(module.licenseType)}
                      size="small"
                      icon={<VpnKey />}
                      sx={{ fontSize: "9pt" }}
                    />
                  </TableCell>

                  {/* Users */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    {module.serverQuantities ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {module.serverQuantities.map((sq) => (
                          <Chip
                            key={sq.region}
                            label={`${sq.region}:${sq.quantity}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "8pt", height: "20px" }}
                          />
                        ))}
                      </Box>
                    ) : module.gridCharges ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {module.gridCharges.map((gc) => (
                          <Chip
                            key={gc.region}
                            label={`${gc.region}:$${gc.chargePerGrid}`}
                            size="small"
                            variant="filled"
                            color="primary"
                            sx={{ fontSize: "8pt", height: "20px" }}
                          />
                        ))}
                      </Box>
                    ) : module.clusterLicenses ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#16a34a" }}>
                        {module.clusterLicenses.length} Sites × 8 Nodes
                      </Typography>
                    ) : module.remoteAgents ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#7c3aed" }}>
                        {module.remoteAgents.reduce((sum, ra) => sum + ra.activeAgents, 0)} Active Agents
                      </Typography>
                    ) : module.personalCALs ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#f59e0b" }}>
                        {module.personalCALs.length} Individual CALs
                      </Typography>
                    ) : module.siteCALs ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#10b981" }}>
                        {module.siteCALs.reduce((sum, sc) => sum + sc.activeUsers, 0)} / {module.siteCALs.reduce((sum, sc) => sum + sc.maxUsers, 0)} Users
                      </Typography>
                    ) : module.gridConnectors ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#06b6d4" }}>
                        {module.gridConnectors.length} Connectors
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600 }}>
                        {module.currentUsers} / {module.maxUsers}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Utilization */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    {module.serverQuantities ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#64748b" }}>
                        {module.serverQuantities.reduce((sum, sq) => sum + sq.quantity, 0)} Total
                      </Typography>
                    ) : module.gridCharges ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#2563eb" }}>
                        {module.gridCharges.length} Regions
                      </Typography>
                    ) : module.clusterLicenses ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#16a34a" }}>
                        {module.clusterLicenses.reduce((sum, cl) => sum + cl.nodesPerCluster, 0)} Total Nodes
                      </Typography>
                    ) : module.remoteAgents ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#7c3aed" }}>
                        {new Set(module.remoteAgents.map((ra) => ra.region)).size} Regions
                      </Typography>
                    ) : module.personalCALs ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#f59e0b" }}>
                        {module.personalCALs.length} Licenses
                      </Typography>
                    ) : module.siteCALs ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#10b981" }}>
                        {module.siteCALs.length} Sites
                      </Typography>
                    ) : module.gridConnectors ? (
                      <Typography sx={{ fontSize: "10pt", fontWeight: 600, color: "#06b6d4" }}>
                        {module.gridConnectors.filter((gc) => gc.status === "Active").length} Active
                      </Typography>
                    ) : (
                      <Box className="flex items-center gap-2">
                        <Box className="w-32 bg-slate-200 rounded h-2">
                          <Box
                            className="h-2 rounded transition-all"
                            sx={{
                              width: `${usagePercentage}%`,
                              backgroundColor: usageColor,
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{ 
                            fontSize: "9pt",
                            color: usageColor, 
                            fontWeight: "bold", 
                            minWidth: "40px" 
                          }}
                        >
                          {usagePercentage}%
                        </Typography>
                      </Box>
                    )}
                  </TableCell>

                  {/* Available for Sale Toggle (Site Admin Only) */}
                  {isSiteAdmin && (
                    <TableCell sx={{ fontSize: "10pt", textAlign: "center" }}>
                      <Tooltip title={module.availableForSale ? "Module is visible and available for sale" : "Module is hidden from users"}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(module.availableForSale)}
                              onChange={() => handleToggleAvailability(module.id)}
                              color="success"
                              size="small"
                            />
                          }
                          label={module.availableForSale ? "On" : "Off"}
                          labelPlacement="end"
                          sx={{ 
                            margin: 0,
                            "& .MuiFormControlLabel-label": {
                              fontSize: "9pt",
                              fontWeight: "bold",
                              color: module.availableForSale ? "#16a34a" : "#dc2626"
                            }
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell sx={{ fontSize: "10pt" }}>
                    <Box className="flex items-center justify-center gap-1">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(module)}
                          color="info"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Module">
                        <IconButton
                          size="small"
                          onClick={() => handleEditModule(module)}
                          color="primary"
                          disabled={!isSuperUser && !isAdmin}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        onClick={() => toggleModuleStatus(module.id)}
                        variant={module.isActive ? "outlined" : "contained"}
                        color={module.isActive ? "error" : "success"}
                        disabled={!isSuperUser && !isAdmin}
                        sx={{ minWidth: "90px", fontSize: "9pt" }}
                      >
                        {module.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Modal */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box className="flex items-center gap-3">
            {selectedModule && (
              <>
                <Box className="text-blue-600">{selectedModule.icon}</Box>
                <Box>
                  <Typography variant="h5">{selectedModule.name}</Typography>
                  <Chip
                    label={selectedModule.licenseType}
                    color={getLicenseColor(selectedModule.licenseType)}
                    size="small"
                    icon={<VpnKey />}
                    className="mt-1"
                  />
                </Box>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedModule && (
            <Box className="space-y-4 mt-2">
              {/* Status */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" className="mb-1">
                  Status
                </Typography>
                <Box className="flex items-center gap-2">
                  {selectedModule.isActive ? (
                    <>
                      <CheckCircle className="text-green-600" />
                      <Typography variant="body1" className="text-green-600 font-semibold">
                        Active
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Cancel className="text-slate-400" />
                      <Typography variant="body1" className="text-slate-400 font-semibold">
                        Inactive
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Description */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" className="mb-1">
                  Description
                </Typography>
                <Typography variant="body1">{selectedModule.description}</Typography>
              </Box>

              <Divider />

              {/* User Allocation */}
              {selectedModule.serverQuantities ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Regional Server Distribution
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Region</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Qty</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Server Location</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Store Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.serverQuantities.flatMap((sq) =>
                          sq.stores.map((store, idx) => (
                            <TableRow key={`${sq.region}-${idx}`}>
                              {idx === 0 && (
                                <TableCell rowSpan={sq.stores.length} sx={{ fontWeight: 600, fontSize: "9pt", verticalAlign: "top" }}>
                                  {sq.region}
                                </TableCell>
                              )}
                              {idx === 0 && (
                                <TableCell rowSpan={sq.stores.length} sx={{ fontWeight: 600, fontSize: "9pt", verticalAlign: "top" }}>
                                  {sq.quantity}
                                </TableCell>
                              )}
                              <TableCell sx={{ fontSize: "9pt" }}>{store.name}</TableCell>
                              <TableCell sx={{ fontSize: "9pt" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <LocationOn fontSize="small" sx={{ color: "#64748b" }} />
                                  {store.location}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Servers
                          </TableCell>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.serverQuantities.reduce((sum, sq) => sum + sq.quantity, 0)} Servers Across {selectedModule.serverQuantities.length} Regions
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : selectedModule.gridCharges ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Regional Grid Pricing
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Region</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Charge/Grid</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Grid Location</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Store Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.gridCharges.flatMap((gc) =>
                          gc.stores.map((store, idx) => (
                            <TableRow key={`${gc.region}-${idx}`}>
                              {idx === 0 && (
                                <TableCell rowSpan={gc.stores.length} sx={{ fontWeight: 600, fontSize: "9pt", verticalAlign: "top" }}>
                                  {gc.region}
                                </TableCell>
                              )}
                              {idx === 0 && (
                                <TableCell rowSpan={gc.stores.length} sx={{ fontWeight: 600, fontSize: "9pt", verticalAlign: "top", color: "#2563eb" }}>
                                  ${gc.chargePerGrid}
                                </TableCell>
                              )}
                              <TableCell sx={{ fontSize: "9pt" }}>{store.name}</TableCell>
                              <TableCell sx={{ fontSize: "9pt" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <LocationOn fontSize="small" sx={{ color: "#64748b" }} />
                                  {store.location}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Regions
                          </TableCell>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.gridCharges.length} Regions with Variable Pricing
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : selectedModule.clusterLicenses ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Cluster License Distribution
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Site Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Nodes Per Cluster</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.clusterLicenses.map((cl) => (
                          <TableRow key={cl.siteName}>
                            <TableCell sx={{ fontSize: "9pt" }}>{cl.siteName}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{cl.nodesPerCluster}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{cl.location}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Nodes
                          </TableCell>
                          <TableCell colSpan={1} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.clusterLicenses.reduce((sum, cl) => sum + cl.nodesPerCluster, 0)} Nodes Across {selectedModule.clusterLicenses.length} Sites
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : selectedModule.remoteAgents ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Remote Agent Distribution
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Agent Type</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Active Agents</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Region</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.remoteAgents.map((ra) => (
                          <TableRow key={`${ra.agentType}-${ra.region}`}>
                            <TableCell sx={{ fontSize: "9pt" }}>{ra.agentType}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{ra.activeAgents}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{ra.region}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Agents
                          </TableCell>
                          <TableCell colSpan={1} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.remoteAgents.reduce((sum, ra) => sum + ra.activeAgents, 0)} Agents Across {selectedModule.remoteAgents.length} Regions
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : selectedModule.personalCALs ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Personal CAL Distribution
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>User Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Activation Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.personalCALs.map((cal) => (
                          <TableRow key={cal.email}>
                            <TableCell sx={{ fontSize: "9pt" }}>{cal.userName}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{cal.email}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{cal.activationDate}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Individual Licenses
                          </TableCell>
                          <TableCell colSpan={1} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.personalCALs.length} Active CALs
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : selectedModule.siteCALs ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Site CAL Distribution
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Site Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Business Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Max Users</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Active Users</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.siteCALs.map((site) => (
                          <TableRow key={site.siteName}>
                            <TableCell sx={{ fontSize: "9pt" }}>{site.siteName}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{site.businessName}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{site.maxUsers}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{site.activeUsers}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Capacity
                          </TableCell>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.siteCALs.reduce((sum, sc) => sum + sc.activeUsers, 0)} / {selectedModule.siteCALs.reduce((sum, sc) => sum + sc.maxUsers, 0)} Users Across {selectedModule.siteCALs.length} Sites
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : selectedModule.gridConnectors ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Grid Connector Licenses
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>HQ Site</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Connector ID</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.gridConnectors.map((gc) => (
                          <TableRow key={gc.connectorID}>
                            <TableCell sx={{ fontSize: "9pt" }}>{gc.hqSite}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{gc.connectorID}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>{gc.location}</TableCell>
                            <TableCell sx={{ fontSize: "9pt" }}>
                              <Chip
                                label={gc.status}
                                size="small"
                                color={gc.status === "Active" ? "success" : "default"}
                                sx={{ fontSize: "8pt", height: "20px" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            Total Connectors
                          </TableCell>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                            {selectedModule.gridConnectors.length} Connectors ({selectedModule.gridConnectors.filter((gc) => gc.status === "Active").length} Active)
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    User Allocation
                  </Typography>
                  <Box className="flex items-center gap-3 mb-2">
                    <People color="action" />
                    <Typography variant="h6">
                      {selectedModule.currentUsers} / {selectedModule.maxUsers} Users
                    </Typography>
                  </Box>
                  <Box className="w-full bg-slate-200 rounded h-3 mb-1">
                    <Box
                      className="h-3 rounded transition-all"
                      sx={{
                        width: `${getUsagePercentage(
                          selectedModule.currentUsers,
                          selectedModule.maxUsers
                        )}%`,
                        backgroundColor: getUsageColor(
                          getUsagePercentage(
                            selectedModule.currentUsers,
                            selectedModule.maxUsers
                          )
                        ),
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: getUsageColor(
                        getUsagePercentage(
                          selectedModule.currentUsers,
                          selectedModule.maxUsers
                        )
                      ),
                      fontWeight: "bold",
                    }}
                  >
                    {getUsagePercentage(selectedModule.currentUsers, selectedModule.maxUsers)}%
                    utilized
                  </Typography>
                </Box>
              )}

              <Divider />

              {/* Features */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                  Key Features
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {selectedModule.features.map((feature, idx) => (
                    <Chip
                      key={idx}
                      label={feature}
                      size="medium"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {(isSuperUser || isAdmin) && selectedModule && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => handleEditModule(selectedModule)}
              sx={{
                color: "#8B0000",
                borderColor: "#8B0000",
                "&:hover": { borderColor: "#a00", backgroundColor: "#fff5f5" },
              }}
            >
              Edit Module
            </Button>
          )}
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Module Configuration</DialogTitle>
        <DialogContent>
          {selectedModule && (
            <Box className="space-y-4 mt-2">
              <TextField
                fullWidth
                label="Module Name"
                value={selectedModule.name}
                disabled
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Description"
                value={selectedModule.description}
                onChange={(e) =>
                  setSelectedModule({ ...selectedModule, description: e.target.value })
                }
                multiline
                rows={3}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Maximum Users"
                type="number"
                value={selectedModule.maxUsers}
                onChange={(e) =>
                  setSelectedModule({
                    ...selectedModule,
                    maxUsers: parseInt(e.target.value) || 0,
                  })
                }
                variant="outlined"
                inputProps={{ min: selectedModule.currentUsers }}
              />

              <TextField
                fullWidth
                label="Current Users"
                type="number"
                value={selectedModule.currentUsers}
                onChange={(e) =>
                  setSelectedModule({
                    ...selectedModule,
                    currentUsers: parseInt(e.target.value) || 0,
                  })
                }
                variant="outlined"
                inputProps={{ min: 0, max: selectedModule.maxUsers }}
              />

              <FormControl fullWidth>
                <InputLabel>License Type</InputLabel>
                <Select
                  value={selectedModule.licenseType}
                  onChange={(e) =>
                    setSelectedModule({
                      ...selectedModule,
                      licenseType: e.target.value as any,
                    })
                  }
                  label="License Type"
                >
                  {LICENSE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info" icon={<Info />}>
                <Typography variant="body2">
                  <strong>Note:</strong> Maximum users cannot be lower than the current user
                  count ({selectedModule.currentUsers}). Consider reassigning users before
                  reducing capacity.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveModule}
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#a00" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Notice */}
      {!isSuperUser && !isAdmin && (
        <Alert severity="warning" className="mt-6">
          <Typography variant="body2">
            <strong>View Only:</strong> You do not have permission to modify module configurations.
            Contact your administrator to request changes.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}