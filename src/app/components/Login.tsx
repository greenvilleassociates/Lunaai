import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";
import { ApiWarmupLoader } from "./ApiWarmupLoader";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const seasideImages = [
  "https://images.unsplash.com/photo-1610289795012-6b0cebf95f0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHR1cnF1b2lzZSUyMGJlYWNofGVufDF8fHx8MTc3MzA3MjAzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1651617733477-6cc82ceb3730?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBjb2FzdHxlbnwxfHx8fDE3NzMwNzIwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHBhcmFkaXNlJTIwYmVhY2h8ZW58MXx8fHwxNzczMDcyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1653580650559-9998f8a2e062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwc3Vuc2V0JTIwb2NlYW58ZW58MXx8fHwxNzczMDcyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
];

/**
 * Login Component
 * 
 * Authentication Flow:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 1. Check local JSON first (superusers & development)       │
 * │    ├─ Fetch from luna.capitoltechnology.net/data/users.json│
 * │    │   (falls back to bundled JSON if external unavailable)│
 * │    ├─ Found → Authenticate locally                         │
 * │    │   ├─ Store credentials in localStorage                │
 * │    │   ├─ POST /api/User to sync to database (optional)    │
 * │    │   └─ POST /api/Usersession to create session ✓        │
 * │    └─ Not found → Try API authentication                   │
 * │                                                             │
 * │ 2. POST /api/Auth/login {username}                         │
 * │    ├─ Success → Get {user, token}                          │
 * │    │   ├─ Store authToken                                  │
 * │    │   └─ Session auto-created by Azure ✓                  │
 * │    └─ Fail → Invalid credentials                           │
 * │                                                             │
 * │ 3. Capture geolocation & IP address                        │
 * │ 4. POST /api/Userlog (both methods)                        │
 * │ 5. Redirect to home                                        │
 * └─────────────────────────────────────────────────────────────┘
 */

// Helper function to generate a session token
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
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % seasideImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleWarmupComplete = async () => {
    // After warmup completes, proceed with authentication
    setShowWarmupLoader(false);
    await performAuthentication();
  };

  const performAuthentication = async () => {
    try {
      // Check local JSON first for superusers and development
      const users = await fetchExternalData(DATA_URLS.USERS);
      const localUser = users.find(
        (u: { username: string }) => u.username === username
      );
      
      if (localUser) {
        // Local JSON authentication successful
        console.log("Local JSON authentication successful for user:", localUser.username);
        
        // Get current time
        const loginTime = new Date().toLocaleString();
        
        // Get user's location
        let latitude = "N/A";
        let longitude = "N/A";
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude.toFixed(6);
          longitude = position.coords.longitude.toFixed(6);
        } catch (error) {
          console.log("Location access denied or unavailable");
        }

        // Get IP address
        let ipAddress = "N/A";
        try {
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          ipAddress = data.ip;
          console.log("🌐 Client IP Address detected:", ipAddress);
        } catch (error) {
          console.log("IP address fetch failed:", error);
        }

        // Store uid and session information in localStorage
        localStorage.setItem("uid", localUser.uid || localUser.id || localUser.userid?.toString() || "");
        localStorage.setItem("userid", localUser.userid?.toString() || localUser.id?.toString() || "");
        localStorage.setItem("username", localUser.username || username);
        localStorage.setItem("role", localUser.role || "user");
        localStorage.setItem("companyId", localUser.companyId || "comp-001");
        localStorage.setItem("email", localUser.email || `${localUser.username}@capitoltechnology.net`);
        localStorage.setItem("loginTime", loginTime);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("ipAddress", ipAddress);
        localStorage.setItem("defaultSearchEngine", (localUser.dse ?? 1).toString());
        localStorage.setItem("maxsearchengines", (localUser.maxsearchengines ?? 1).toString());
        localStorage.setItem("chainsearch", (localUser.chainsearch ?? 0).toString());
        
        console.log("LocalStorage updated with uid:", localStorage.getItem("uid"));
        console.log("LocalStorage updated with userid:", localStorage.getItem("userid"));
        console.log("LocalStorage updated with email:", localStorage.getItem("email"));
        console.log("LocalStorage updated with companyId:", localStorage.getItem("companyId"));
        
        // Post login log to Azure API
        try {
          const logUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_LOG);
          const logEntry = {
            descr: `User login from ${ipAddress} at ${latitude}, ${longitude}`,
            emplid: 0, // Can be populated from user data if available
            fullname: localUser.username,
            logdate: new Date().toISOString(),
            secpriority: 1, // 1 = Low priority for normal login
            noccomments: `Successful login at ${loginTime}`,
            nocOpId: 0,
            escalationId: 0,
            triagecasenumber: "",
            userid: parseInt(localUser.uid) || 0,
            role: localUser.role,
          };

          await fetch(logUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localUser.uid}`,
            },
            body: JSON.stringify(logEntry),
          });
          
          console.log("Login logged successfully");
        } catch (error) {
          // Don't block login if logging fails
          console.error("Failed to log user login:", error);
        }
        
        // Create user session
        try {
          const sessionUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_SESSION);
          const sessionToken = generateSessionToken();
          const sessionStart = new Date();
          
          // Store session token in localStorage
          localStorage.setItem("sessionToken", sessionToken);
          localStorage.setItem("sessionStart", sessionStart.toISOString());
          
          const sessionEntry = {
            userid: parseInt(localUser.uid.replace('user-', '')) || 0,
            token: sessionToken,
            acknowledged: 0,
            actionpriority: 0,
            sessionstart: sessionStart.toISOString(),
            sessionend: new Date(sessionStart.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            sessionrecorded: 0,
            sessionrecordurl: "",
            sessiondescription: `Login session from ${ipAddress} at ${latitude}, ${longitude}`,
            sessionusername: localUser.username,
            sessionemail: `${localUser.username}@capitoltechnology.net`, // Construct email from username
            sessionfirstname: localUser.username.charAt(0).toUpperCase() + localUser.username.slice(1),
            sessionlastname: "", // Not available in user data
            sessionfullname: localUser.username.charAt(0).toUpperCase() + localUser.username.slice(1),
            sessioncomplete: 0,
          };

          await fetch(sessionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localUser.uid}`,
            },
            body: JSON.stringify(sessionEntry),
          });
          
          console.log("User session created successfully (local JSON auth)");
        } catch (error) {
          // Don't block login if session creation fails
          console.error("Failed to create user session:", error);
        }
        
        // Redirect to home page
        console.log("About to navigate to / ...");
        setLoading(false);
        
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          console.log("Navigating now with uid:", localStorage.getItem("uid"));
          navigate("/", { replace: true });
        }, 100);
        
        return;
      }

      // Try Azure API if local JSON authentication fails
      const loginUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN);
      const loginResponse = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      let user;
      let useApiAuth = true;
      let authToken = "";

      if (!loginResponse.ok) {
        // Invalid credentials
        throw new Error("Invalid username or password");
      } else {
        const apiResponse = await loginResponse.json();
        // Azure API returns { user: {...}, token: "..." }
        user = apiResponse.user || apiResponse;
        authToken = apiResponse.token || "";
        console.log("Azure API login successful - session created automatically");
      }

      // Get current time
      const loginTime = new Date().toLocaleString();
      
      // Get user's location
      let latitude = "N/A";
      let longitude = "N/A";
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude.toFixed(6);
        longitude = position.coords.longitude.toFixed(6);
      } catch (error) {
        console.log("Location access denied or unavailable");
      }

      // Get IP address
      let ipAddress = "N/A";
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        ipAddress = data.ip;
        console.log("🌐 Client IP Address detected:", ipAddress);
      } catch (error) {
        console.log("IP address fetch failed:", error);
      }

      // Store uid and session information in localStorage
      localStorage.setItem("uid", user.uid || user.id || user.userid?.toString() || "");
      localStorage.setItem("userid", user.userid?.toString() || user.id?.toString() || "");
      localStorage.setItem("username", user.username || username);
      localStorage.setItem("role", user.role || "user");
      localStorage.setItem("loginTime", loginTime);
      localStorage.setItem("latitude", latitude);
      localStorage.setItem("longitude", longitude);
      localStorage.setItem("ipAddress", ipAddress);
      localStorage.setItem("defaultSearchEngine", (user.dse ?? 1).toString());
      localStorage.setItem("maxsearchengines", (user.maxsearchengines ?? 1).toString());
      localStorage.setItem("chainsearch", (user.chainsearch ?? 0).toString());
      
      // Store auth token if using API authentication
      if (authToken) {
        localStorage.setItem("authToken", authToken);
        console.log("Auth token stored");
      }
      
      // Post login log to Azure API
      try {
        const logUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_LOG);
        const logEntry = {
          descr: `User login from ${ipAddress} at ${latitude}, ${longitude}`,
          emplid: 0, // Can be populated from user data if available
          fullname: user.username,
          logdate: new Date().toISOString(),
          secpriority: 1, // 1 = Low priority for normal login
          noccomments: `Successful login at ${loginTime}`,
          nocOpId: 0,
          escalationId: 0,
          triagecasenumber: "",
          userid: parseInt(user.uid) || 0,
          role: user.role,
        };

        await fetch(logUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.uid}`,
          },
          body: JSON.stringify(logEntry),
        });
        
        console.log("Login logged successfully");
      } catch (error) {
        // Don't block login if logging fails
        console.error("Failed to log user login:", error);
      }
      
      // Azure API already created the session
      console.log("Session already created by Azure API");
      
      // Redirect to home page
      console.log("About to navigate to / ...");
      setLoading(false);
      
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        console.log("Navigating now with uid:", localStorage.getItem("uid"));
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during login");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowWarmupLoader(true);
  };

  // Show the warmup loader when user submits login
  if (showWarmupLoader) {
    return <ApiWarmupLoader onComplete={handleWarmupComplete} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image Slideshow */}
      {seasideImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <ImageWithFallback
            src={image}
            alt={`Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />

      {/* Image Indicators */}
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="w-full h-[800px] flex flex-col items-center">
        {/* Login Form */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          {/* Luna Logo inside form */}
          <div className="flex justify-center mb-6">
            <img src={lunaLogo} alt="LunaAI Logo" className="w-[60px] h-[60px] rounded-lg object-cover" />
          </div>

          <h2 className="text-2xl mb-6 text-center">LunaAI Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm mb-2 text-slate-700">
                Username
              </label>
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
              <label htmlFor="password" className="block text-sm mb-2 text-slate-700">
                Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
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

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-slate-900 hover:text-slate-700 font-semibold underline"
              >
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 text-sm text-slate-600 text-center border-t border-slate-200 pt-4">
            <p className="mb-2">Test Users:</p>
            <p>john, marco, brian, portia, joey, jws</p>
            <p className="mt-3 text-xs bg-blue-50 p-2 rounded border border-blue-200">
              <strong>Guest Access:</strong> Username: <code className="bg-white px-1 rounded">guest</code> / Password: <code className="bg-white px-1 rounded">guest</code>
            </p>
          </div>
        </div>

        {/* System Messages Panel - Row Layout */}
        <div className="w-full mt-[100px] max-h-[350px] bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-lg text-white overflow-auto hidden min-[700px]:block">
          <div className="border-b border-slate-600 pb-3 mb-4">
            <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              System Messages
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Current Build Version */}
            <div className="bg-slate-700 bg-opacity-50 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-green-400">Current Build</h4>
              </div>
              <p className="text-2xl font-bold text-white mb-1">Version 22</p>
              <p className="text-xs text-slate-400 mb-2">Released: May 7, 2026</p>
              <a 
                href="/versionhistory.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View full history
              </a>
            </div>

            {/* System Status */}
            <div className="bg-slate-700 bg-opacity-50 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="font-semibold text-blue-400">System Status</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">API Status:</span>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Database:</span>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">AI Providers:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>

            {/* Latest Updates */}
            <div className="bg-slate-700 bg-opacity-50 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h4 className="font-semibold text-purple-400">What's New</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Luna Context Router — new ABC feature routing queries to best LLM via /api/ZLunaContextSearch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>SuperLuna Search — new feature page via /api/SuperLunaSearch with SuperLuna logo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Weather Underground — new IBM Weather feature via /api/WeatherUnderground</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Search Engine Settings — 7 radio options with SuperLuna sub-panel for max engines &amp; chain search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>SuperLuna API Integration — config page now POSTs/PUTs to /api/SuperLuna with llM1–llM20 schema</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
