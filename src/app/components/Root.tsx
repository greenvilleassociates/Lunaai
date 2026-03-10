import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import FeaturesIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpIcon from "@mui/icons-material/Help";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MicIcon from "@mui/icons-material/Mic";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { Alert, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";
import ctsLogo from "figma:asset/399d93660a307619ab55b61f935095fec4286492.png";
import { API_CONFIG, getApiUrl } from "../config/api";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loginTime, setLoginTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewport is mobile-sized (1000px or less)
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width <= 1000;
      setIsMobile(mobile);

      // Close sidebar when resizing to desktop
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [sidebarOpen]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "");
    setLoginTime(localStorage.getItem("loginTime") || "");
    setLatitude(localStorage.getItem("latitude") || "");
    setLongitude(localStorage.getItem("longitude") || "");
    setIpAddress(localStorage.getItem("ipAddress") || "");
  }, []);

  const handleLogout = async () => {
    // Get session token from localStorage
    const sessionToken = localStorage.getItem("sessionToken");
    const uid = localStorage.getItem("uid");
    
    // Mark session as complete (not deleted, just inactive) in Azure API
    if (sessionToken && uid) {
      try {
        const sessionUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_SESSION);
        const sessionEnd = new Date();
        
        // Update the session to mark it as complete with end time
        // Session remains in database for audit/reporting purposes
        await fetch(sessionUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
          body: JSON.stringify({
            token: sessionToken,
            sessionend: sessionEnd.toISOString(),
            sessioncomplete: 1, // Mark session as complete/inactive
          }),
        });
        
        console.log("Session marked as complete (inactive)");
      } catch (error) {
        console.error("Failed to update session:", error);
      }
    }
    
    // Clear localStorage
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("sessionStart");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("latitude");
    localStorage.removeItem("longitude");
    localStorage.removeItem("ipAddress");
    localStorage.removeItem("authToken");
    
    // Redirect to login
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="size-full flex flex-col min-h-[1000px]">
      {/* Mobile Warning Banner */}
      {isMobile && (
        <div className="w-full bg-blue-600 text-white px-4 py-3 text-sm">
          <div className="flex items-center justify-center gap-2">
            <PhoneAndroidIcon fontSize="small" />
            <span className="font-medium">
              Mobile View: Tap the LunaAI logo to access all features
            </span>
          </div>
        </div>
      )}
      
      {/* Top Bar */}
      <header className="w-full bg-slate-900 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={`flex items-center gap-3 ${isMobile ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={() => isMobile && setSidebarOpen(true)}
            >
              <img src={lunaLogo} alt="LunaAI Logo" className="h-10 w-10 rounded-lg object-cover" />
              <h1 className="text-xl">LunaAI</h1>
            </div>
            {/* Hamburger Menu Button (visible on small screens, hidden on mobile <1000px) */}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden ml-4 p-2 hover:bg-slate-800 rounded transition-colors"
              >
                {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            )}
          </div>
          <nav className="flex gap-6 items-center">
            <Link 
              to="/" 
              className={`hover:text-slate-300 transition-colors ${
                isActive("/") ? "text-white font-semibold" : "text-slate-400"
              }`}
            >
              Home
            </Link>
            {!isMobile && (
              <>
                <Link 
                  to="/about" 
                  className={`hover:text-slate-300 transition-colors ${
                    isActive("/about") ? "text-white font-semibold" : "text-slate-400"
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`hover:text-slate-300 transition-colors ${
                    isActive("/contact") ? "text-white font-semibold" : "text-slate-400"
                  }`}
                >
                  Contact
                </Link>
                <Link 
                  to="/profile" 
                  className={`hover:text-slate-300 transition-colors ${
                    isActive("/profile") ? "text-white font-semibold" : "text-slate-400"
                  }`}
                >
                  Profile
                </Link>
                <Link 
                  to="/usernotifications" 
                  className={`hover:text-slate-300 transition-colors ${
                    isActive("/usernotifications") ? "text-white font-semibold" : "text-slate-400"
                  }`}
                  title="Notifications"
                >
                  <NotificationsIcon />
                </Link>
                <Link 
                  to="/userhelp" 
                  className={`hover:text-slate-300 transition-colors ${
                    isActive("/userhelp") ? "text-white font-semibold" : "text-slate-400"
                  }`}
                  title="Help & Support"
                >
                  <HelpIcon />
                </Link>
              </>
            )}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
              <span className="text-sm text-slate-400">Welcome, {username}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation - Desktop (10% width on large screens) */}
        <aside className="hidden lg:flex lg:w-[10%] bg-slate-800 text-white flex-col shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              to="/mydesktop"
              className={`flex flex-col items-center gap-2 p-4 rounded hover:bg-slate-700 transition-colors ${
                isActive("/mydesktop") ? "bg-slate-700 text-white" : "text-slate-300"
              }`}
            >
              <DesktopWindowsIcon fontSize="medium" />
              <span className="text-xs text-center">My Desktop</span>
            </Link>
            <Link
              to="/features"
              className={`flex flex-col items-center gap-2 p-4 rounded hover:bg-slate-700 transition-colors ${
                isActive("/features") ? "bg-slate-700 text-white" : "text-slate-300"
              }`}
            >
              <FeaturesIcon fontSize="medium" />
              <span className="text-xs text-center">Features</span>
            </Link>
            <Link
              to="/visualizations"
              className={`flex flex-col items-center gap-2 p-4 rounded hover:bg-slate-700 transition-colors ${
                isActive("/visualizations") ? "bg-slate-700 text-white" : "text-slate-300"
              }`}
            >
              <BarChartIcon fontSize="medium" />
              <span className="text-xs text-center">Visualizations</span>
            </Link>
            <Link
              to="/administrator"
              className={`flex flex-col items-center gap-2 p-4 rounded hover:bg-slate-700 transition-colors ${
                isActive("/administrator") ? "bg-slate-700 text-white" : "text-slate-300"
              }`}
            >
              <AdminPanelSettingsIcon fontSize="medium" />
              <span className="text-xs text-center">Administrator</span>
            </Link>
          </nav>
        </aside>

        {/* Sidebar Navigation - Mobile (hamburger dropdown) */}
        {sidebarOpen && !isMobile && (
          <aside className="lg:hidden absolute top-[72px] left-0 w-64 bg-slate-800 text-white shadow-lg z-50">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                to="/mydesktop"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 p-4 rounded hover:bg-slate-700 transition-colors ${
                  isActive("/mydesktop") ? "bg-slate-700 text-white" : "text-slate-300"
                }`}
              >
                <DesktopWindowsIcon fontSize="small" />
                <span className="text-sm">My Desktop</span>
              </Link>
              <Link
                to="/features"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 p-4 rounded hover:bg-slate-700 transition-colors ${
                  isActive("/features") ? "bg-slate-700 text-white" : "text-slate-300"
                }`}
              >
                <FeaturesIcon fontSize="small" />
                <span className="text-sm">Features</span>
              </Link>
              <Link
                to="/visualizations"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 p-4 rounded hover:bg-slate-700 transition-colors ${
                  isActive("/visualizations") ? "bg-slate-700 text-white" : "text-slate-300"
                }`}
              >
                <BarChartIcon fontSize="small" />
                <span className="text-sm">Visualizations</span>
              </Link>
              <Link
                to="/administrator"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 p-4 rounded hover:bg-slate-700 transition-colors ${
                  isActive("/administrator") ? "bg-slate-700 text-white" : "text-slate-300"
                }`}
              >
                <AdminPanelSettingsIcon fontSize="small" />
                <span className="text-sm">Administrator</span>
              </Link>
            </nav>
          </aside>
        )}

        {/* Mobile Drawer - Full Navigation (for screens ≤1000px) */}
        <Drawer
          anchor="left"
          open={isMobile && sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{
            sx: {
              width: '80%',
              maxWidth: '350px',
              backgroundColor: '#1e293b',
              color: 'white',
            }
          }}
        >
          <div className="p-4 bg-slate-900 flex items-center gap-3 border-b border-slate-700">
            <img src={lunaLogo} alt="LunaAI Logo" className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <h2 className="text-lg font-bold">LunaAI</h2>
              <p className="text-xs text-slate-400">AI Manager Platform</p>
            </div>
          </div>

          <List>
            {/* Main Navigation */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/mydesktop");
                  setSidebarOpen(false);
                }}
                selected={isActive("/mydesktop")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <DesktopWindowsIcon />
                </ListItemIcon>
                <ListItemText primary="My Desktop" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/features");
                  setSidebarOpen(false);
                }}
                selected={isActive("/features")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <FeaturesIcon />
                </ListItemIcon>
                <ListItemText primary="Features" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/visualizations");
                  setSidebarOpen(false);
                }}
                selected={isActive("/visualizations")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="Visualizations" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/administrator");
                  setSidebarOpen(false);
                }}
                selected={isActive("/administrator")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Administrator" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ backgroundColor: "#475569", my: 1 }} />

            {/* Additional Pages */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/uploadprompt");
                  setSidebarOpen(false);
                }}
                selected={isActive("/uploadprompt")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <UploadFileIcon />
                </ListItemIcon>
                <ListItemText primary="Upload Prompt" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/startrecording");
                  setSidebarOpen(false);
                }}
                selected={isActive("/startrecording")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <MicIcon />
                </ListItemIcon>
                <ListItemText primary="Start Recording" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ backgroundColor: "#475569", my: 1 }} />

            {/* User Pages */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/profile");
                  setSidebarOpen(false);
                }}
                selected={isActive("/profile")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/usernotifications");
                  setSidebarOpen(false);
                }}
                selected={isActive("/usernotifications")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/userhelp");
                  setSidebarOpen(false);
                }}
                selected={isActive("/userhelp")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText primary="Help & Support" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ backgroundColor: "#475569", my: 1 }} />

            {/* Info Pages */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/about");
                  setSidebarOpen(false);
                }}
                selected={isActive("/about")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary="About" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate("/contact");
                  setSidebarOpen(false);
                }}
                selected={isActive("/contact")}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#8B0000",
                    "&:hover": { backgroundColor: "#a00" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <ContactMailIcon />
                </ListItemIcon>
                <ListItemText primary="Contact" />
              </ListItemButton>
            </ListItem>
          </List>

          <div className="mt-auto p-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Welcome, {username}</p>
            <button
              onClick={() => {
                setSidebarOpen(false);
                handleLogout();
              }}
              className="w-full bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </Drawer>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 lg:w-[90%]">
          <Outlet />
        </main>
      </div>

      {/* Bottom Footer */}
      <footer className="w-full bg-slate-900 text-white shadow-md">
        <div className="text-center py-2 text-xs text-slate-400 border-t border-slate-800">
          <div className="mb-2">
            © 2026 Capitol Technology Solutions, Inc - Research Triangle Park - North Carolina
          </div>
          <div className="flex justify-center">
            <img src={ctsLogo} alt="CTS Logo" className="h-[25px] w-[25px] object-contain" />
          </div>
        </div>
      </footer>

      {/* Location Bar */}
      {loginTime && (
        <div className="w-full bg-slate-950 text-slate-300 px-4 py-2 text-xs">
          <div className="flex justify-center gap-6 flex-wrap">
            <span>Login: {loginTime}</span>
            <span>IP: {ipAddress}</span>
            <span>Location: {latitude}, {longitude}</span>
          </div>
        </div>
      )}
    </div>
  );
}