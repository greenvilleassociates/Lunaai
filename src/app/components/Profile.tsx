import { useState, useEffect, useRef } from "react";
import { TextField, Button, List, ListItem, ListItemButton, ListItemText, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { UserService, User } from "../services/dataService";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getApiUrl } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";

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
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setLoading(false);
          return;
        }

        const user = await UserService.getById(uid);
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
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Fetch full user object and merge with profile changes
      const fullUser = await UserService.getById(profile.uid);
      
      if (!fullUser) {
        throw new Error("Could not fetch user data");
      }
      
      const updatedUser = {
        ...fullUser,
        ...profile,
      };
      
      await UserService.update(profile.uid, updatedUser);
      setSavedMessage("Profile saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSavedMessage("Failed to save profile. Check console for details.");
      setTimeout(() => setSavedMessage(""), 5000);
    }
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      
      // Upload to Azure Blob Storage with fileCategory=projectimages
      const apiUrl = getApiUrl(`/File/upload?fileCategory=projectimages`);
      
      console.log("📤 Uploading to:", apiUrl);
      console.log("📦 File:", file.name, file.type, file.size, "bytes");
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getFileUploadHeaders(),
        body: formData,
      });

      console.log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Upload response data:", data);

      // Try different possible response field names
      const newProfilePictureUrl = data.blobUrl || data.url || data.fileUrl || data.azureUrl;
      
      if (!newProfilePictureUrl) {
        console.error("⚠️ No URL found in response. Full response:", data);
        throw new Error("No blob URL returned from server");
      }

      console.log("🖼️ New profile picture URL:", newProfilePictureUrl);

      // Update the profile picture URL in the text field (state only - not saved to DB yet)
      setProfile((prev) => {
        console.log("📝 Updating profile state from:", prev.profilePicture, "to:", newProfilePictureUrl);
        return {
          ...prev,
          profilePicture: newProfilePictureUrl,
        };
      });

      // Show message that upload succeeded and user should save
      setSavedMessage("✓ Picture uploaded! Click 'Save Profile' to update your profile.");
      setTimeout(() => setSavedMessage(""), 5000);
      
    } catch (error) {
      console.error("⚠ Failed to upload profile picture:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setSavedMessage(`Error: ${errorMessage}`);
      setTimeout(() => setSavedMessage(""), 5000);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl mb-6">User Profile</h2>
      
      <div className="flex gap-6">
        {/* Main Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex gap-6 flex-1">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0">
            <div className="relative">
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
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <CircularProgress sx={{ color: "white" }} />
                </div>
              )}
            </div>
            <div className="mt-4">
              <TextField
                label="Profile Picture URL"
                value={profile.profilePicture}
                onChange={(e) => handleChange("profilePicture", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                disabled={uploadingImage}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={uploadingImage ? <CircularProgress size={20} sx={{ color: "white" }} /> : <PhotoCameraIcon />}
                disabled={uploadingImage}
                sx={{ 
                  mt: 2, 
                  width: '100%',
                  backgroundColor: "#0f172a",
                  "&:hover": {
                    backgroundColor: "#1e293b",
                  },
                }}
              >
                {uploadingImage ? "Uploading..." : "Upload Picture"}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                  disabled={uploadingImage}
                />
              </Button>
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
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate("/userhelp")}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#8B0000",
                      color: "white",
                    },
                  }}
                >
                  <ListItemText primary="Open Trouble Ticket" />
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