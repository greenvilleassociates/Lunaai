import { useState } from "react";
import { useNavigate } from "react-router";
import users from "../data/users.json";

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

        <div className="mt-6 text-sm text-slate-600 text-center">
          <p className="mb-2">Test Users:</p>
          <p>john, joe, brian, portia, joey</p>
          <p>Password: test12345</p>
        </div>
      </div>
    </div>
  );
}