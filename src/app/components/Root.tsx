import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Tabs, Tab } from "@mui/material";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import FeaturesIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [bottomTabValue, setBottomTabValue] = useState<string | false>(false);
  const [loginTime, setLoginTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "");
    setLoginTime(localStorage.getItem("loginTime") || "");
    setLatitude(localStorage.getItem("latitude") || "");
    setLongitude(localStorage.getItem("longitude") || "");
    setIpAddress(localStorage.getItem("ipAddress") || "");
  }, []);

  useEffect(() => {
    // Update bottom tab based on current route
    if (location.pathname === "/mydesktop") {
      setBottomTabValue("mydesktop");
    } else if (location.pathname === "/features") {
      setBottomTabValue("features");
    } else if (location.pathname === "/visualizations") {
      setBottomTabValue("visualizations");
    } else if (location.pathname === "/administrator") {
      setBottomTabValue("administrator");
    } else {
      setBottomTabValue(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
    // Redirect to login
    navigate("/login");
  };

  const handleBottomTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setBottomTabValue(newValue);
    navigate(`/${newValue}`);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="size-full flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-slate-900 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lunaLogo} alt="LunaAI Logo" className="h-10 w-10 rounded-lg object-cover" />
            <h1 className="text-xl">LunaAI</h1>
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>

      {/* Bottom Bar with Material UI Tabs */}
      <footer className="w-full bg-slate-900 text-white shadow-md">
        <Tabs
          value={bottomTabValue}
          onChange={handleBottomTabChange}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "white",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.6)",
              "&.Mui-selected": {
                color: "white",
              },
            },
          }}
        >
          <Tab
            value="mydesktop"
            icon={<DesktopWindowsIcon />}
            label="My Desktop"
            iconPosition="start"
          />
          <Tab
            value="features"
            icon={<FeaturesIcon />}
            label="Features"
            iconPosition="start"
          />
          <Tab
            value="visualizations"
            icon={<BarChartIcon />}
            label="Visualizations"
            iconPosition="start"
          />
          <Tab
            value="administrator"
            icon={<AdminPanelSettingsIcon />}
            label="Administrator"
            iconPosition="start"
          />
        </Tabs>
        <div className="text-center py-2 text-xs text-slate-400 border-t border-slate-800">
          © 2026 Capitol Technology Solutions, Inc - Research Triangle Park - North Carolina
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