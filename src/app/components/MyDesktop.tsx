import { Link } from "react-router";
import { useState, useEffect } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import { Switch, FormControlLabel, Box, Tabs, Tab } from "@mui/material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";

interface WebSearchResult {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata: string;
  expectedtokens: number;
  expectedcost: number;
}

interface VoiceCommand {
  id: number;
  commandType?: string | null;
  voiceBlobURL?: string | null;
  actionTime?: string | null;
  actionType?: number | null;
  status?: string | null;
  useridstring?: string | null;
  userid?: number | null;
  displayname?: string | null;
}

interface User {
  uid: string;
  username: string;
  role: string;
  companyId: string;
  managerId?: string;
}

type DesktopView = "individual" | "team" | "company";

export function MyDesktop() {
  const [searchHistory, setSearchHistory] = useState<WebSearchResult[]>([]);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(true);
  const [currentView, setCurrentView] = useState<DesktopView>("individual");
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  
  // Check user role and permissions
  const currentUserRole = localStorage.getItem("role");
  const currentUid = localStorage.getItem("uid");
  const currentCompanyId = localStorage.getItem("companyId") || "";
  const isSuperUser = currentUserRole === "superuser";
  const isAdmin = currentUserRole === "admin";
  const isManager = currentUserRole === "manager" || isAdmin || isSuperUser;

  useEffect(() => {
    loadRecentSearches();
    loadVoiceCommands();
    if (isManager) {
      loadTeamMembers();
    }
    if (isAdmin || isSuperUser) {
      loadCompanyUsers();
    }
  }, [currentView]); // Reload when view changes

  const loadRecentSearches = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        setLoading(false);
        return;
      }

      const url = getApiUrl(API_CONFIG.ENDPOINTS.WEB_SEARCH);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // For superusers with toggle ON: show all records
        // For everyone else (or superusers with toggle OFF): show only their own records
        let filteredSearches;
        if (isSuperUser && currentView === "company") {
          filteredSearches = data; // Show all records
          console.log("✅ Search history loaded (ALL USERS - Superuser mode)");
        } else if (isManager && currentView === "team") {
          filteredSearches = data.filter((item: WebSearchResult) => 
            teamMembers.some(member => member.uid === item.uid)
          );
          console.log("✅ Search history loaded (TEAM RECORDS only)");
        } else {
          filteredSearches = data.filter((item: WebSearchResult) => item.uid === uid);
          console.log("✅ Search history loaded (MY RECORDS only)");
        }
        
      setSearchHistory(filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
      } else {
        throw new Error("Database unavailable");
      }
    } catch (err) {
      console.warn("⚠ Database unavailable - loading from local JSON:", err);
      // Fallback to local JSON data
      try {
        const fallbackData = await fetchExternalData<WebSearchResult[]>(DATA_URLS.WEBSEARCH);
        const uid = localStorage.getItem("uid");
        
        let filteredSearches;
        if (isSuperUser && currentView === "company") {
          filteredSearches = fallbackData;
        } else if (isManager && currentView === "team") {
          filteredSearches = fallbackData.filter((item: WebSearchResult) => 
            teamMembers.some(member => member.uid === item.uid)
          );
        } else {
          filteredSearches = fallbackData.filter((item: WebSearchResult) => item.uid === uid);
        }
        setSearchHistory(filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
        console.log("✅ Search history loaded from local JSON fallback");
      } catch (fallbackErr) {
        console.error("Failed to load fallback data:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadVoiceCommands = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        setVoiceLoading(false);
        return;
      }

      const url = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_COMMANDS);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // For superusers with toggle ON: show all records
        // For everyone else (or superusers with toggle OFF): show only their own records
        let filteredCommands;
        if (isSuperUser && currentView === "company") {
          filteredCommands = data; // Show all records
          console.log("✅ Voice commands loaded (ALL USERS - Superuser mode)");
        } else if (isManager && currentView === "team") {
          filteredCommands = data.filter((item: VoiceCommand) => 
            teamMembers.some(member => member.uid === item.useridstring || item.userid?.toString() === member.uid)
          );
          console.log("✅ Voice commands loaded (TEAM RECORDS only)");
        } else {
          // Filter by userid or useridstring
          filteredCommands = data.filter((item: VoiceCommand) => 
            item.useridstring === uid || item.userid?.toString() === uid
          );
          console.log("✅ Voice commands loaded (MY RECORDS only)");
        }
        setVoiceCommands(
  filtered
    .sort((a, b) => new Date(b.actionTime || 0).getTime() - new Date(a.actionTime || 0).getTime())
    .slice(0, 5)
);
        } else {
        throw new Error("Database unavailable");
      }
    } catch (err) {
      console.warn("⚠ Database unavailable - loading voice commands from localStorage:", err);
      // Fallback to localStorage
      const localVoiceCommands = JSON.parse(localStorage.getItem("voiceCommands") || "[]");
      setVoiceCommands(localVoiceCommands.slice(0, 5));
      console.log("✅ Voice commands loaded from localStorage fallback");
    } finally {
      setVoiceLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        return;
      }

      // Try API first
      const url = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const allUsers = await response.json();
        // Filter to get team members where current user is the manager
        const myTeam = allUsers.filter((user: User) => user.managerId === uid);
        setTeamMembers(myTeam);
        console.log("✅ Team members loaded from API:", myTeam.length);
      } else {
        throw new Error("Database unavailable");
      }
    } catch (err) {
      console.warn("⚠ Database unavailable - using mock team data:", err);
      // Fallback to mock data for now
      // In a real scenario, this would load from localStorage or local JSON
      const mockTeam: User[] = [
        { uid: "user-002", username: "marco", role: "user", companyId: currentCompanyId, managerId: currentUid || "" },
        { uid: "user-007", username: "sarah", role: "user", companyId: currentCompanyId, managerId: currentUid || "" },
      ];
      setTeamMembers(mockTeam);
      console.log("✅ Mock team members loaded:", mockTeam.length);
    }
  };

  const loadCompanyUsers = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        return;
      }

      // Try API first
      const url = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });

      if (response.ok) {
        const allUsers = await response.json();
        // Filter to get all users in the same company
        const companyId = localStorage.getItem("companyId");
        const companyUsersList = allUsers.filter((user: User) => user.companyId === companyId);
        setCompanyUsers(companyUsersList);
        console.log(" Company users loaded from API:", companyUsersList.length);
      } else {
        throw new Error("Database unavailable");
      }
    } catch (err) {
      console.warn("⚠ Database unavailable - loading users from local JSON:", err);
      // Fallback to local JSON data
      try {
        const usersResponse = await fetch("/src/app/data/users.json");
        const allUsers = await usersResponse.json();
        const companyId = localStorage.getItem("companyId");
        const companyUsersList = allUsers.filter((user: User) => user.companyId === companyId);
        setCompanyUsers(companyUsersList);
        console.log("✅ Company users loaded from local JSON:", companyUsersList.length);
      } catch (fallbackErr) {
        console.error("Failed to load company users:", fallbackErr);
        // Use the users from the imported data as last resort
        const mockCompanyUsers: User[] = [
          { uid: "user-001", username: "john", role: "superuser", companyId: currentCompanyId },
          { uid: "user-002", username: "marco", role: "user", companyId: currentCompanyId },
          { uid: "user-003", username: "brian", role: "admin", companyId: currentCompanyId },
          { uid: "user-004", username: "portia", role: "superuser", companyId: currentCompanyId },
          { uid: "user-006", username: "jws", role: "superuser", companyId: currentCompanyId },
        ];
        setCompanyUsers(mockCompanyUsers);
        console.log("✅ Mock company users loaded:", mockCompanyUsers.length);
      }
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl mb-2">My Desktop</h2>
            <p className="text-slate-600">
              Your central workspace for managing LLM interactions, voice prompts, and AI workflows.
            </p>
          </div>
        </div>
        
        {/* View Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentView}
            onChange={(e, newValue) => setCurrentView(newValue as DesktopView)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: '48px',
              },
              '& .Mui-selected': {
                color: '#8B0000',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8B0000',
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="Individual View"
              value="individual"
            />
            {isManager && (
              <Tab
                icon={<GroupIcon />}
                iconPosition="start"
                label="Team View"
                value="team"
              />
            )}
            {(isAdmin || isSuperUser) && (
              <Tab
                icon={<BusinessIcon />}
                iconPosition="start"
                label="Company View"
                value="company"
              />
            )}
          </Tabs>
        </Box>

        {/* View Description */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            {currentView === "individual" && (
              <>
                <strong>Individual View:</strong> Viewing your personal AI activities, searches, and voice commands.
              </>
            )}
            {currentView === "team" && (
              <>
                <strong>Team View:</strong> Viewing your team's AI activities. You manage {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}.
              </>
            )}
            {currentView === "company" && (
              <>
                <strong>Company View:</strong> Viewing all company-wide AI activities. Company has {companyUsers.length} total user{companyUsers.length !== 1 ? 's' : ''}.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Text Search History */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center gap-4 mb-4">
            <SearchIcon sx={{ fontSize: 48 }} className="text-slate-700" />
            <h3 className="text-2xl">AI Text Search History</h3>
          </div>
          <p className="text-slate-600 mb-4">
            Your most recent AI-powered text search queries and responses.
          </p>
          <div className="space-y-2">
            {loading ? (
              <div className="p-3 bg-slate-50 rounded text-sm text-center text-slate-500">
                Loading...
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded text-sm text-center text-slate-500">
                No search history yet.{" "}
                <Link to="/aisearch" className="text-blue-600 hover:underline">
                  Try AI Search
                </Link>
              </div>
            ) : (
              searchHistory.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded text-sm">
                  <p className="font-medium text-slate-900 mb-1">
                    {truncateText(item.question, 60)}
                  </p>
                  <p className="text-slate-600 text-xs mb-1">
                    {truncateText(item.response || "Processing...", 80)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{formatDate(item.timestamp)}</span>
                    <span>•</span>
                    <span>{item.expectedtokens} tokens</span>
                    <span>•</span>
                    <span>{formatCost(item.expectedcost)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {searchHistory.length > 0 && (
            <div className="mt-4 text-center">
              <Link
                to="/aisearch"
                className="text-sm text-blue-600 hover:underline"
              >
                View all searches →
              </Link>
            </div>
          )}
        </div>

        {/* Voice Commands History */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center gap-4 mb-4">
            <MicIcon sx={{ fontSize: 48 }} className="text-slate-700" />
            <h3 className="text-2xl">Voice Commands History</h3>
          </div>
          <p className="text-slate-600 mb-4">
            Your most recent voice uploads and processing status.
          </p>
          <div className="space-y-2">
            {voiceLoading ? (
              <div className="p-3 bg-slate-50 rounded text-sm text-center text-slate-500">
                Loading...
              </div>
            ) : voiceCommands.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded text-sm text-center text-slate-500">
                No voice commands yet.{" "}
                <Link to="/uploadprompt" className="text-blue-600 hover:underline">
                  Upload Voice File
                </Link>
              </div>
            ) : (
              voiceCommands.map((item) => {
                // Extract filename from voiceBlobURL or use commandType
                const fileName = item.commandType || 
                  (item.voiceBlobURL ? item.voiceBlobURL.split('/').pop() : null) || 
                  "Voice Recording";
                
                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded text-sm">
                    <p className="font-medium text-slate-900 mb-1">
                      {truncateText(fileName, 60)}
                    </p>
                    {item.displayname && (
                      <p className="text-slate-600 text-xs mb-1">
                        User: {item.displayname}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{item.actionTime ? formatDate(item.actionTime) : "N/A"}</span>
                      <span>•</span>
                      <span>Action Type: {item.actionType || "N/A"}</span>
                      <span>•</span>
                      <span
                        className={`${
                          item.status === "processing"
                            ? "text-blue-600"
                            : item.status === "completed"
                            ? "text-green-600"
                            : item.status === "queued"
                            ? "text-yellow-600"
                            : "text-slate-500"
                        }`}
                      >
                        {item.status === "processing" && "🔄 Processing"}
                        {item.status === "completed" && "✓ Completed"}
                        {item.status === "queued" && "⏳ Queued"}
                        {item.status === "failed" && "✗ Failed"}
                        {!item.status && "Unknown"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {voiceCommands.length > 0 && (
            <div className="mt-4 text-center">
              <Link
                to="/uploadprompt"
                className="text-sm text-blue-600 hover:underline"
              >
                View all voice commands →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-2xl mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Total AI Processes</p>
              <p className="text-3xl text-slate-900">{searchHistory.length + voiceCommands.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total AI Text Searches</p>
              <p className="text-3xl text-slate-900">{searchHistory.length > 0 ? searchHistory.length : "0"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Voice AI Commands</p>
              <p className="text-3xl text-slate-900">{voiceCommands.length > 0 ? voiceCommands.length : "0"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Active LLM Providers</p>
              <p className="text-3xl text-slate-900">2</p>
            </div>
          </div>
        </div>

        {/* Saved Workflows */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-2xl mb-4">Saved Workflows</h3>
          <p className="text-slate-600 mb-4">
            Quick access to your most-used LLM chain configurations.
          </p>
          <div className="space-y-2">
            <button className="w-full p-3 bg-slate-50 rounded text-left hover:bg-slate-100 transition-colors">
              <p className="font-medium text-sm">Content Analysis Pipeline</p>
              <p className="text-xs text-slate-600">ChatGPT → Claude verification</p>
            </button>
            <button className="w-full p-3 bg-slate-50 rounded text-left hover:bg-slate-100 transition-colors">
              <p className="font-medium text-sm">Voice Transcription & Summary</p>
              <p className="text-xs text-slate-600">Transcribe → Summarize → Archive</p>
            </button>
            <button className="w-full p-3 bg-slate-50 rounded text-left hover:bg-slate-100 transition-colors">
              <p className="font-medium text-sm">Multi-Model Comparison</p>
              <p className="text-xs text-slate-600">Parallel processing & analysis</p>
            </button>
          </div>
        </div>

        {/* Features Quick Access */}
        <Link
          to="/features"
          className="p-8 border border-slate-200 rounded-lg hover:shadow-lg transition-all bg-white group"
        >
          <div className="flex items-center gap-4 mb-4">
            <AutoAwesomeIcon sx={{ fontSize: 48 }} className="text-slate-700 group-hover:text-slate-900" />
            <h3 className="text-2xl">Features</h3>
          </div>
          <p className="text-slate-600 mb-4">
            Access voice recording, file upload, text search, and desktop entry review tools.
          </p>
          <div className="flex items-center text-slate-700 group-hover:text-slate-900 transition-colors">
            <span className="text-sm font-medium">Open Features →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}