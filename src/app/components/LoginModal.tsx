import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, Button, Alert } from "@mui/material";
import users from "../data/users.json";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Capture login information
      const loginTime = new Date().toLocaleString();
      
      // Get geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            localStorage.setItem("loginLatitude", lat);
            localStorage.setItem("loginLongitude", lon);
          },
          (error) => {
            console.error("Geolocation error:", error);
            localStorage.setItem("loginLatitude", "N/A");
            localStorage.setItem("loginLongitude", "N/A");
          }
        );
      } else {
        localStorage.setItem("loginLatitude", "N/A");
        localStorage.setItem("loginLongitude", "N/A");
      }

      // Get IP address (mock)
      const mockIP = `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
      
      // Store login information
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("username", user.username);
      localStorage.setItem("loginTime", loginTime);
      localStorage.setItem("loginIP", mockIP);

      // Clear form and error
      setUsername("");
      setPassword("");
      setError("");
      
      // Call success callback
      onLoginSuccess();
      onClose();
    } else {
      setError("Invalid username or password");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        backgroundColor: "#0f172a", 
        color: "white",
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: "bold"
      }}>
        Login to LunaAI
      </DialogTitle>
      <DialogContent sx={{ mt: 3, pb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          autoFocus
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
          variant="outlined"
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          onClick={handleLogin}
          fullWidth
          sx={{
            backgroundColor: "#0f172a",
            py: 1.5,
            fontSize: "1rem",
            "&:hover": {
              backgroundColor: "#1e293b",
            },
          }}
        >
          Login
        </Button>

        <div className="mt-4 text-center text-sm text-slate-600">
          <p>Demo users: john, joe, brian, portia, joey</p>
          <p>Password: test12345</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
