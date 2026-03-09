import { useState } from "react";
import { useNavigate, Link } from "react-router";
import users from "../data/users.json";
import { API_CONFIG, getApiUrl } from "../config/api";

// Helper function to generate a session token
function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Find user with matching username and password
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
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
      } catch (error) {
        console.log("IP address fetch failed");
      }

      // Store uid and session information in localStorage
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      localStorage.setItem("loginTime", loginTime);
      localStorage.setItem("latitude", latitude);
      localStorage.setItem("longitude", longitude);
      localStorage.setItem("ipAddress", ipAddress);
      
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
      
      // Create user session
      try {
        const sessionUrl = getApiUrl(API_CONFIG.ENDPOINTS.USER_SESSION);
        const sessionToken = generateSessionToken();
        const sessionStart = new Date();
        
        // Store session token in localStorage
        localStorage.setItem("sessionToken", sessionToken);
        localStorage.setItem("sessionStart", sessionStart.toISOString());
        
        const sessionEntry = {
          userid: parseInt(user.uid.replace('user-', '')) || 0,
          token: sessionToken,
          acknowledged: 0,
          actionpriority: 0,
          sessionstart: sessionStart.toISOString(),
          sessionend: new Date(sessionStart.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          sessionrecorded: 0,
          sessionrecordurl: "",
          sessiondescription: `Login session from ${ipAddress} at ${latitude}, ${longitude}`,
          sessionusername: user.username,
          sessionemail: `${user.username}@capitoltechnology.net`, // Construct email from username
          sessionfirstname: user.username.charAt(0).toUpperCase() + user.username.slice(1),
          sessionlastname: "", // Not available in user data
          sessionfullname: user.username.charAt(0).toUpperCase() + user.username.slice(1),
          sessioncomplete: 0,
        };

        await fetch(sessionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.uid}`,
          },
          body: JSON.stringify(sessionEntry),
        });
        
        console.log("User session created successfully");
      } catch (error) {
        // Don't block login if session creation fails
        console.error("Failed to create user session:", error);
      }
      
      // Redirect to home page
      navigate("/");
    } else {
      setError("Invalid username or password");
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            Login
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