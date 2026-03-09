import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import FeaturesIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";
import ctsLogo from "figma:asset/399d93660a307619ab55b61f935095fec4286492.png";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loginTime, setLoginTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "");
    setLoginTime(localStorage.getItem("loginTime") || "");
    setLatitude(localStorage.getItem("latitude") || "");
    setLongitude(localStorage.getItem("longitude") || "");
    setIpAddress(localStorage.getItem("ipAddress") || "");
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
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
    <div className="size-full flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-slate-900 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lunaLogo} alt="LunaAI Logo" className="h-10 w-10 rounded-lg object-cover" />
            <h1 className="text-xl">LunaAI</h1>
            {/* Hamburger Menu Button (visible on small screens) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden ml-4 p-2 hover:bg-slate-800 rounded transition-colors"
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
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
        {sidebarOpen && (
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