import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";

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
 * │ 2. POST /api/Auth/login {username, plainPassword}          │
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check local JSON first for superusers and development
      const users = await fetchExternalData(DATA_URLS.USERS);
      const localUser = users.find(
        (u: { username: string; password: string }) => u.username === username && u.password === password
      );
      
      if (localUser) {
        // Local JSON authentication successful
        console.log("Local JSON authentication successful for user:", localUser.username);
        
        // Try to create the user in the database if they don't exist yet
        try {
          const userCreateUrl = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
          console.log("📤 Attempting to create user in database:", localUser.uid);
          
          const createResponse = await fetch(userCreateUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localUser.uid}`,
            },
            body: JSON.stringify({
              uid: localUser.uid,
              username: localUser.username,
              password: localUser.password,
              role: localUser.role || "user",
              companyId: localUser.companyId || "company-001",
              address1: localUser.address1 || "",
              address2: localUser.address2 || "",
              city: localUser.city || "",
              state: localUser.state || "",
              zip: localUser.zip || "",
              phone: localUser.phone || "",
              cell: localUser.cell || "",
              profilePicture: localUser.profilePicture || "",
              email: localUser.email || `${localUser.username}@capitoltechnology.net`,
            }),
          });
          
          if (createResponse.ok) {
            console.log("✅ User created in database successfully");
          } else if (createResponse.status === 409) {
            // 409 Conflict means user already exists - this is fine
            console.log("✓ User already exists in database");
          } else {
            const errorText = await createResponse.text();
            console.warn("⚠ Failed to create user in database:", createResponse.status, errorText);
          }
        } catch (error) {
          // Don't block login if user creation fails
          console.warn("⚠ Failed to create user in database (API may be restricted):", error);
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
        localStorage.setItem("uid", localUser.uid || localUser.id || localUser.userid?.toString() || "");
        localStorage.setItem("username", localUser.username || username);
        localStorage.setItem("role", localUser.role || "user");
        localStorage.setItem("loginTime", loginTime);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("ipAddress", ipAddress);
        
        console.log("LocalStorage updated with uid:", localStorage.getItem("uid"));
        
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
          plainPassword: password,
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
      localStorage.setItem("username", user.username || username);
      localStorage.setItem("role", user.role || "user");
      localStorage.setItem("loginTime", loginTime);
      localStorage.setItem("latitude", latitude);
      localStorage.setItem("longitude", longitude);
      localStorage.setItem("ipAddress", ipAddress);
      
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
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
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </div>
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
          <p>john, joe, brian, portia, joey</p>
          <p>Password: test12345</p>
        </div>
      </div>
    </div>
  );
}