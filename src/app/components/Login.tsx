import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";
import { ApiWarmupLoader } from "./ApiWarmupLoader";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BannerAd } from "./BannerAd";

const seasideImages = [
  "https://images.unsplash.com/photo-1610289795012-6b0cebf95f0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHR1cnF1b2lzZSUyMGJlYWNofGVufDF8fHx8MTc3MzA3MjAzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1651617733477-6cc82ceb3730?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBjb2FzdHxlbnwxfHx8fDE3NzMwNzIwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHBhcmFkaXNlJTIwYmVhY2h8ZW58MXx8fHwxNzczMDcyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1653580650559-9998f8a2e062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwc3Vuc2V0JTIwb2NlYW58ZW58MXx8fHwxNzczMDcyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
];

function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWarmupLoader, setShowWarmupLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [debugMode, setDebugMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    setIsLoggedIn(!!uid && uid !== "901");
  }, []);

  const debugLog = (...args: any[]) => {
    if (debugMode) console.log(...args);
  };

  useEffect(() => {
    const savedDebugMode = localStorage.getItem("debugMode");
    if (savedDebugMode !== null) setDebugMode(savedDebugMode === "true");
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "debugMode") setDebugMode(e.newValue === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % seasideImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleWarmupComplete = async () => {
    setShowWarmupLoader(false);
    await performAuthentication();
  };

  const performAuthentication = async () => {
    try {
      // Check local JSON first (username + password)
      const users = await fetchExternalData(DATA_URLS.USERS);
      const localUser = users.find(
        (u: { username: string; password: string }) =>
          u.username === username && u.password === password
      );

      if (localUser) {
        debugLog("Local JSON authentication successful for user:", localUser.username);
        const loginTime = new Date().toLocaleString();
        const sessionToken = generateSessionToken();
        const sessionStart = new Date();

        // Set localStorage immediately then navigate — nothing blocks
        localStorage.setItem("uid", localUser.uid || localUser.id || localUser.userid?.toString() || "");
        localStorage.setItem("userid", localUser.userid?.toString() || localUser.id?.toString() || "");
        localStorage.setItem("username", localUser.username || username);
        localStorage.setItem("role", localUser.role || "user");
        localStorage.setItem("companyId", localUser.companyId || "comp-001");
        localStorage.setItem("email", localUser.email || `${localUser.username}@capitoltechnology.net`);
        localStorage.setItem("loginTime", loginTime);
        localStorage.setItem("latitude", "N/A");
        localStorage.setItem("longitude", "N/A");
        localStorage.setItem("ipAddress", "N/A");
        localStorage.setItem("sessionToken", sessionToken);
        localStorage.setItem("sessionStart", sessionStart.toISOString());
        localStorage.setItem("defaultSearchEngine", (localUser.dse ?? 1).toString());
        localStorage.setItem("maxsearchengines", (localUser.maxsearchengines ?? 1).toString());
        localStorage.setItem("chainsearch", (localUser.chainsearch ?? 0).toString());

        setLoading(false);
        navigate("/", { replace: true });

        // Fire-and-forget: geolocation, IP, log, session
        const uid = localUser.uid;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            localStorage.setItem("latitude", pos.coords.latitude.toFixed(6));
            localStorage.setItem("longitude", pos.coords.longitude.toFixed(6));
          },
          () => {},
          { timeout: 3000 }
        );

        fetch("https://api.ipify.org?format=json")
          .then((r) => r.json())
          .then((d) => localStorage.setItem("ipAddress", d.ip))
          .catch(() => {});

        fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_LOG), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
          body: JSON.stringify({
            descr: "User login",
            emplid: 0,
            fullname: localUser.username,
            logdate: new Date().toISOString(),
            secpriority: 1,
            noccomments: `Successful login at ${loginTime}`,
            nocOpId: 0,
            escalationId: 0,
            triagecasenumber: "",
            userid: parseInt(uid) || 0,
            role: localUser.role,
          }),
        }).catch(() => {});

        fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_SESSION), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
          body: JSON.stringify({
            userid: parseInt(localUser.uid.replace("user-", "")) || 0,
            token: sessionToken,
            acknowledged: 0,
            actionpriority: 0,
            sessionstart: sessionStart.toISOString(),
            sessionend: new Date(sessionStart.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            sessionrecorded: 0,
            sessionrecordurl: "",
            sessiondescription: "Login session",
            sessionusername: localUser.username,
            sessionemail: localUser.email || `${localUser.username}@capitoltechnology.net`,
            sessionfirstname: localUser.username.charAt(0).toUpperCase() + localUser.username.slice(1),
            sessionlastname: "",
            sessionfullname: localUser.username.charAt(0).toUpperCase() + localUser.username.slice(1),
            sessioncomplete: 0,
          }),
        }).catch(() => {});

        return;
      }

      // Try API - GET /api/Users and filter by username and password
      const usersUrl = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
      const usersResponse = await fetch(usersUrl);

      if (!usersResponse.ok) {
        throw new Error("Unable to reach authentication server");
      }

      const allUsers = await usersResponse.json();
      const user = allUsers.find(
        (u: any) => u.username === username && (u.password === password || u.plainpassword === password)
      );

      if (!user) {
        throw new Error("Invalid username or password");
      }

      const loginTime = new Date().toLocaleString();

      localStorage.setItem("uid", user.uid || user.id || user.userid?.toString() || "");
      localStorage.setItem("userid", user.userid?.toString() || user.id?.toString() || "");
      localStorage.setItem("username", user.username || username);
      localStorage.setItem("role", user.role || "user");
      localStorage.setItem("companyId", user.companyid || user.companyId || "");
      localStorage.setItem("email", user.email || "");
      localStorage.setItem("loginTime", loginTime);
      localStorage.setItem("latitude", "N/A");
      localStorage.setItem("longitude", "N/A");
      localStorage.setItem("ipAddress", "N/A");
      localStorage.setItem("defaultSearchEngine", (user.dse ?? 1).toString());
      localStorage.setItem("maxsearchengines", (user.maxsearchengines ?? 1).toString());
      localStorage.setItem("chainsearch", (user.chainsearch ?? 0).toString());

      setLoading(false);
      navigate("/", { replace: true });

      // Fire-and-forget post-login tasks
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.setItem("latitude", pos.coords.latitude.toFixed(6));
          localStorage.setItem("longitude", pos.coords.longitude.toFixed(6));
        },
        () => {},
        { timeout: 3000 }
      );

      fetch("https://api.ipify.org?format=json")
        .then((r) => r.json())
        .then((d) => localStorage.setItem("ipAddress", d.ip))
        .catch(() => {});

      fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_LOG), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.uid}` },
        body: JSON.stringify({
          descr: "User login via API",
          emplid: 0,
          fullname: user.username,
          logdate: new Date().toISOString(),
          secpriority: 1,
          noccomments: `Successful login at ${loginTime}`,
          nocOpId: 0,
          escalationId: 0,
          triagecasenumber: "",
          userid: parseInt(user.uid) || 0,
          role: user.role,
        }),
      }).catch(() => {});

    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during login");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowWarmupLoader(true);
  };

  if (showWarmupLoader) {
    return <ApiWarmupLoader onComplete={handleWarmupComplete} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <header className="w-full bg-slate-900 text-white px-6 py-3 shadow-md z-50 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lunaLogo} alt="LunaAI Logo" className="h-10 w-10 rounded-lg object-cover" />
            <h1 className="text-xl">LunaAI</h1>
          </div>
          <nav className="flex gap-6 items-center">
            <Link to="/" className="hover:text-slate-300 transition-colors text-slate-400">Home</Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors text-slate-400">About</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors text-slate-400">Contact</Link>
            <Link to="/register" className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded transition-colors">Register</Link>
            {!isLoggedIn && (
              <Link to="/login" className="text-sm bg-amber-600 hover:bg-amber-700 px-4 py-1 rounded transition-colors">Login</Link>
            )}
          </nav>
        </div>
      </header>

      {seasideImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <ImageWithFallback src={image} alt={`Background ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {seasideImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentImageIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75 w-2"
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 md:p-4">
      <div className="w-full flex flex-col items-center gap-4 md:gap-0">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-[600px]">
          <div className="flex justify-center mb-6">
            <img src={lunaLogo} alt="LunaAI Logo" className="w-[60px] h-[60px] rounded-lg object-cover" />
          </div>

          <h2 className="text-2xl mb-6 text-center">LunaAI Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm mb-2 text-slate-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-[calc(100%-60px)] px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-slate-700">Password</label>
              <div className="flex items-center gap-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-[calc(100%-60px)] px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  size="small"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="border border-slate-300 rounded-md"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-slate-900 hover:text-slate-700 font-semibold underline">Register here</Link>
            </p>
          </div>

          <div className="mt-3 text-sm text-slate-600 text-center border-t border-slate-200 pt-2">
            <p className="text-xs bg-blue-50 px-3 py-1.5 rounded border border-blue-200 inline-block">
              <strong>Guest Access:</strong> Username: <code className="bg-white px-1 rounded">guest</code> / Password: <code className="bg-white px-1 rounded">guest</code>
            </p>
          </div>
        </div>

        <div className="w-full lg:max-w-[1600px] mt-4 md:mt-8 mb-[2px]">
          <BannerAd />
        </div>

        <div className="w-full lg:max-w-[1600px] mt-[2px] h-[200px] bg-gradient-to-br from-slate-800 to-slate-900 p-3 lg:p-4 rounded-lg shadow-lg text-white overflow-auto" style={{ fontSize: '8pt' }}>
          <div className="border-b border-slate-600 pb-1.5 mb-2">
            <h3 className="font-bold text-center flex items-center justify-center gap-1.5" style={{ fontSize: '10pt' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              System Messages
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-slate-700 bg-opacity-50 p-2 rounded-lg border border-slate-600">
              <div className="flex items-center gap-1 mb-0.5">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-green-400">Current Build</h4>
              </div>
              <p className="font-bold text-white mb-0.5" style={{ fontSize: '14pt' }}>Version 30</p>
              <p className="text-slate-400 mb-0.5">Released: June 21, 2026</p>
              <a href="/versionhistory.html" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline transition-colors">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View history
              </a>
            </div>

            <div className="bg-slate-700 bg-opacity-50 p-2 rounded-lg border border-slate-600">
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="font-semibold text-blue-400">System Status</h4>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">API Status:</span>
                  <span className="flex items-center gap-0.5 text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Database:</span>
                  <span className="flex items-center gap-0.5 text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">AI Providers:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 bg-opacity-50 p-2 rounded-lg border border-slate-600">
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h4 className="font-semibold text-purple-400">What's New</h4>
              </div>
              <ul className="text-slate-300 space-y-0.5">
                <li className="flex items-start gap-1"><span className="text-purple-400 mt-0.5">•</span><span>ChatQueryType alignment for all AI providers</span></li>
                <li className="flex items-start gap-1"><span className="text-purple-400 mt-0.5">•</span><span>MyDesktop source badges — Gemini, Grok, Wikipedia</span></li>
                <li className="flex items-start gap-1"><span className="text-purple-400 mt-0.5">•</span><span>Login performance — instant navigation</span></li>
                <li className="flex items-start gap-1"><span className="text-purple-400 mt-0.5">•</span><span>Password validation on all login paths</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
