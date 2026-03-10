import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { apiRequest, API_CONFIG } from "../config/api";

export function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      setLoading(false);
      return;
    }

    if (!formData.firstname || !formData.lastname || !formData.email) {
      setError("First name, last name, and email are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Prepare minimal user payload for /api/Auth/signup
      const userPayload = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
        plainPassword: formData.password, // API expects plainPassword with capital P
      };

      // Register user via API
      await apiRequest(API_CONFIG.ENDPOINTS.AUTH_SIGNUP, {
        method: "POST",
        body: JSON.stringify(userPayload),
      });

      setSuccess("Registration successful! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-8 px-4">
      <Paper elevation={3} className="w-full max-w-2xl">
        <Box className="p-8">
          <Box className="flex items-center justify-center gap-2 mb-6">
            <PersonAdd fontSize="large" className="text-slate-900" />
            <Typography variant="h4">Register for LunaAI</Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mb-4">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box className="space-y-3">
              {/* Personal Information */}
              <Typography variant="h6" className="text-slate-700 mt-4 mb-3">
                Personal Information
              </Typography>

              <Box className="grid grid-cols-2 gap-4 mb-3">
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstname}
                  onChange={(e) => handleChange("firstname", e.target.value)}
                  required
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastname}
                  onChange={(e) => handleChange("lastname", e.target.value)}
                  required
                  disabled={loading}
                />
              </Box>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={loading}
                sx={{ mb: 3 }}
              />

              {/* Account Information */}
              <Typography variant="h6" className="text-slate-700 mt-4 mb-3">
                Account Information
              </Typography>

              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                disabled={loading}
                helperText="Minimum 8 characters"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
                disabled={loading}
                sx={{ mb: 3 }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: "#1a1a1a",
                  "&:hover": { backgroundColor: "#2a2a2a" },
                  mt: 3,
                  py: 1.5,
                }}
              >
                {loading ? "Registering..." : "Register"}
              </Button>

              {/* Link to Login */}
              <Box className="text-center mt-4">
                <Typography variant="body2" className="text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-slate-900 hover:text-slate-700 font-semibold"
                  >
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </form>
        </Box>
      </Paper>
    </div>
  );
}