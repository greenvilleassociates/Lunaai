import { useState, useEffect } from "react";
import { TextField, Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router";
import users from "../data/users.json";

interface UserProfile {
  uid: string;
  username: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  cell: string;
  profilePicture: string;
}

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    uid: "",
    username: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    cell: "",
    profilePicture: "",
  });
  const [savedMessage, setSavedMessage] = useState("");
  const [activeSection, setActiveSection] = useState<"account" | "security" | "logs">("account");

  useEffect(() => {
    // Load user profile from localStorage and users.json
    const uid = localStorage.getItem("uid");
    const user = users.find((u) => u.uid === uid);

    if (user) {
      setProfile({
        uid: user.uid,
        username: user.username,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        zip: user.zip,
        phone: user.phone,
        cell: user.cell,
        profilePicture: user.profilePicture,
      });
    }
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Save to localStorage (in a real app, this would save to a backend)
    localStorage.setItem(`profile_${profile.uid}`, JSON.stringify(profile));
    setSavedMessage("Profile saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  // Generate avatar color based on first letter
  const getAvatarColor = (username: string) => {
    const colors = [
      "#FF6B6B", // red
      "#4ECDC4", // teal
      "#45B7D1", // blue
      "#FFA07A", // light salmon
      "#98D8C8", // mint
      "#F7DC6F", // yellow
      "#BB8FCE", // purple
      "#85C1E2", // sky blue
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl mb-6">User Profile</h2>
      
      <div className="flex gap-6">
        {/* Main Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex gap-6 flex-1">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.username}
                className="w-48 h-48 rounded-lg object-cover shadow-md"
              />
            ) : (
              <div
                className="w-48 h-48 rounded-lg shadow-md flex items-center justify-center"
                style={{
                  backgroundColor: getAvatarColor(profile.username),
                }}
              >
                <span className="text-white text-8xl font-bold uppercase">
                  {profile.username.charAt(0)}
                </span>
              </div>
            )}
            <div className="mt-4 text-center">
              <TextField
                label="Profile Picture URL"
                value={profile.profilePicture}
                onChange={(e) => handleChange("profilePicture", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1">
            <div style={{ marginBottom: '10px' }}>
              <TextField
                label="Username"
                value={profile.username}
                disabled
                fullWidth
                variant="outlined"
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <TextField
                label="Address Line 1"
                value={profile.address1}
                onChange={(e) => handleChange("address1", e.target.value)}
                fullWidth
                variant="outlined"
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <TextField
                label="Address Line 2"
                value={profile.address2}
                onChange={(e) => handleChange("address2", e.target.value)}
                fullWidth
                variant="outlined"
              />
            </div>

            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '10px' }}>
              <TextField
                label="City"
                value={profile.city}
                onChange={(e) => handleChange("city", e.target.value)}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="State"
                value={profile.state}
                onChange={(e) => handleChange("state", e.target.value)}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="ZIP Code"
                value={profile.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
                fullWidth
                variant="outlined"
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <TextField
                label="Phone"
                value={profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                fullWidth
                variant="outlined"
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <TextField
                label="Cell"
                value={profile.cell}
                onChange={(e) => handleChange("cell", e.target.value)}
                fullWidth
                variant="outlined"
              />
            </div>

            <div className="flex items-center gap-4" style={{ marginTop: '20px' }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: "#0f172a",
                  "&:hover": {
                    backgroundColor: "#1e293b",
                  },
                }}
              >
                Save Profile
              </Button>
              
              {savedMessage && (
                <span className="text-green-600">{savedMessage}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Column */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Actions</h3>
            </div>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeSection === "account"}
                  onClick={() => setActiveSection("account")}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#0f172a",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1e293b",
                      },
                    },
                  }}
                >
                  <ListItemText primary="Show Account" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeSection === "security"}
                  onClick={() => setActiveSection("security")}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#0f172a",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1e293b",
                      },
                    },
                  }}
                >
                  <ListItemText primary="Show Security" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeSection === "logs"}
                  onClick={() => setActiveSection("logs")}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#0f172a",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1e293b",
                      },
                    },
                  }}
                >
                  <ListItemText primary="Show Logs" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate("/transactions")}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#1e293b",
                      color: "white",
                    },
                  }}
                >
                  <ListItemText primary="View Transactions" />
                </ListItemButton>
              </ListItem>
            </List>
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-lg shadow-md mt-4 p-4">
            {activeSection === "account" && (
              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>User ID:</strong> {profile.uid}</p>
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Role:</strong> superuser</p>
                  <p><strong>Status:</strong> Active</p>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div>
                <h4 className="font-semibold mb-2">Security Settings</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Password:</strong> ••••••••</p>
                  <p><strong>Last Changed:</strong> 30 days ago</p>
                  <p><strong>2FA:</strong> Disabled</p>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "logs" && (
              <div>
                <h4 className="font-semibold mb-2">Login History</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="border-b pb-2">
                    <p><strong>Latest Login</strong></p>
                    <p className="text-xs">
                      {localStorage.getItem("loginTime") || "N/A"}
                    </p>
                    <p className="text-xs">
                      IP: {localStorage.getItem("loginIP") || "N/A"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Full login history available in Administrator panel
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}