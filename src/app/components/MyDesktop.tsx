import { Link } from "react-router";
import { useState, useEffect } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import { Box, Tabs, Tab, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
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
  requestType?: number | null; // 1=WebSearch, 2=VoiceSearch, 3=Empwr, 4=ClaudeAI, 5=GeminiAI, 6=GrokAI, 7=Wikipedia, 8=WeatherUnderground, 9=AccuWeather, 10=WeatherCom, 11=WeatherComAPI
  model?: string | null;
  url1?: string | null;
  url2?: string | null;
  url3?: string | null;
  url4?: string | null;
  url5?: string | null;
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
  duration?: number | null;       // seconds
  fileSize?: number | null;       // bytes
  fileSizeKb?: number | null;     // kilobytes (alt field name)
  fileSizeMb?: number | null;     // megabytes (alt field name)
  fileType?: string | null;       // e.g. "mp3", "mp4"
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
  const [searchSortAsc, setSearchSortAsc] = useState(false);
  const [voiceSortAsc, setVoiceSortAsc] = useState(false);
  const [detailResult, setDetailResult] = useState<WebSearchResult | null>(null);
  const [weatherQuery, setWeatherQuery] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  
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

        // API already filters by authenticated user via Bearer token.
        // In company/team view (superuser), show all returned records.
        const showAll = isSuperUser && currentView !== "individual";
        console.log(`✅ Search history loaded (${showAll ? "ALL USERS" : "MY RECORDS only"})`);

        // If API returned empty and we're in company/team view as superuser, use fallback demo data
        if (data.length === 0 && showAll) {
          throw new Error("API returned empty, loading demo data");
        }

        // Filter to current user's records in individual view
        const visible = showAll ? data : data.filter((r: WebSearchResult) => r.uid === uid);
        setSearchHistory(visible.sort((a: WebSearchResult, b: WebSearchResult) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
      } else {
        throw new Error("Database unavailable");
      }
    } catch (err) {
      console.warn("⚠ Database unavailable - loading from local JSON:", err);
      // Fallback to local JSON data
      try {
        const fallbackData = await fetchExternalData<WebSearchResult[]>(DATA_URLS.WEBSEARCH);
        const uid = localStorage.getItem("uid");

        const showAll = isSuperUser && currentView !== "individual";
        const byUid = fallbackData.filter((item: WebSearchResult) => item.uid === uid);
        // If no UID match in demo data (real UID vs. mock UIDs), show all demo records
        const filteredSearches = showAll || byUid.length === 0 ? fallbackData : byUid;
        setSearchHistory(filteredSearches.sort((a: WebSearchResult, b: WebSearchResult) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
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

        const showAll = isSuperUser && currentView !== "individual";
        const filteredCommands = showAll ? data : data.filter((c: VoiceCommand) => c.useridstring === uid);
        console.log(`✅ Voice commands loaded (${showAll ? "ALL USERS" : "MY RECORDS only"})`);
        setVoiceCommands(
          filteredCommands
            .sort((a: VoiceCommand, b: VoiceCommand) => new Date(b.actionTime || 0).getTime() - new Date(a.actionTime || 0).getTime())
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
        const allUsers = await fetchExternalData<User[]>(DATA_URLS.USERS);
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

  const fetchWeather = async () => {
    if (!weatherQuery.trim()) return;
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const uid = localStorage.getItem("uid") || "";
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ACCUWEATHER(weatherQuery.trim()));
      const response = await fetch(url, { headers: { accept: "*/*", Authorization: `Bearer ${uid}` } });
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      setWeatherError("Unable to fetch weather data.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setVoiceLoading(true);
    loadRecentSearches();
    loadVoiceCommands();
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

  const getFileIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase().split("?")[0];
    if (["pdf"].includes(ext || "")) return "📄";
    if (["doc", "docx"].includes(ext || "")) return "📝";
    if (["xls", "xlsx", "csv"].includes(ext || "")) return "📊";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return "🖼️";
    if (["mp3", "wav", "m4a", "ogg"].includes(ext || "")) return "🎵";
    if (["mp4", "mov", "avi", "webm"].includes(ext || "")) return "🎬";
    if (["zip", "tar", "gz"].includes(ext || "")) return "🗜️";
    if (["json", "xml", "yaml", "yml"].includes(ext || "")) return "🔧";
    return "📎";
  };

  const parseMetadataFiles = (metadata?: string | null): { label: string; url: string }[] => {
    if (!metadata) return [];
    try {
      const parsed = JSON.parse(metadata);
      if (Array.isArray(parsed?.files)) return parsed.files;
      if (Array.isArray(parsed)) return parsed.filter((f: any) => f?.url);
    } catch {
      // not JSON — check for URLs in plain text
      const urlMatches = metadata.match(/https?:\/\/[^\s"']+/g);
      if (urlMatches) return urlMatches.map((u, i) => ({ label: `File ${i + 1}`, url: u }));
    }
    return [];
  };

  const getSearchTypeBadge = (requestType?: number | null) => {
    if (requestType != null && requestType >= 100 && requestType <= 199) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <PhoneAndroidIcon sx={{ fontSize: 12 }} />
          LunaMobile
        </span>
      );
    }
    switch (requestType) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <ManageSearchIcon sx={{ fontSize: 12 }} />
            WebSearch
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <RecordVoiceOverIcon sx={{ fontSize: 12 }} />
            VoiceSearch
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
            <CorporateFareIcon sx={{ fontSize: 12 }} />
            Empwr
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <SmartToyIcon sx={{ fontSize: 12 }} />
            ClaudeAI
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <SmartToyIcon sx={{ fontSize: 12 }} />
            GeminiAI
          </span>
        );
      case 6:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-900 text-white">
            <SmartToyIcon sx={{ fontSize: 12 }} />
            GrokAI
          </span>
        );
      case 7:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <ManageSearchIcon sx={{ fontSize: 12 }} />
            Wikipedia
          </span>
        );
      case 9:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <span style={{ fontSize: 10 }}>☀️</span>
            AccuWeather
          </span>
        );
      case 10:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
            <span style={{ fontSize: 10 }}>🌡️</span>
            Weather.com
          </span>
        );
      case 11:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-200 text-sky-800">
            <span style={{ fontSize: 10 }}>📡</span>
            Weather.com API
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <ManageSearchIcon sx={{ fontSize: 12 }} />
            WebSearch
          </span>
        );
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDateTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      + " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const formatFileSize = (cmd: VoiceCommand) => {
    const bytes = cmd.fileSize
      ?? (cmd.fileSizeMb != null ? cmd.fileSizeMb * 1024 * 1024 : null)
      ?? (cmd.fileSizeKb != null ? cmd.fileSizeKb * 1024 : null);
    if (bytes == null) return null;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getFileType = (cmd: VoiceCommand): string | null => {
    if (cmd.fileType) return cmd.fileType.toLowerCase().replace(".", "");
    const url = cmd.voiceBlobURL || cmd.commandType || "";
    const ext = url.split(".").pop()?.toLowerCase().split("?")[0];
    const known = ["mp3", "mp4", "wav", "m4a", "ogg", "webm", "aac", "mov", "avi", "flac"];
    return ext && known.includes(ext) ? ext : null;
  };

  const fileTypeBadgeClass = (ext: string) => {
    const audio = ["mp3", "wav", "m4a", "ogg", "aac", "flac"];
    const video = ["mp4", "mov", "avi", "webm"];
    if (audio.includes(ext)) return "bg-purple-100 text-purple-700";
    if (video.includes(ext)) return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
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
              key="individual"
              icon={<PersonIcon />}
              iconPosition="start"
              label="Individual View"
              value="individual"
            />
            {isManager && (
              <Tab
                key="team"
                icon={<GroupIcon />}
                iconPosition="start"
                label="Team View"
                value="team"
              />
            )}
            {(isAdmin || isSuperUser) && (
              <Tab
                key="company"
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
            <h3 className="text-2xl flex-1">AI Text Search History</h3>
            <Tooltip title={searchSortAsc ? "Sort Newest First" : "Sort Oldest First"}>
              <IconButton size="small" onClick={() => setSearchSortAsc(v => !v)}>
                {searchSortAsc ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
                {isSuperUser && currentView === "individual"
                  ? "No personal searches yet. Switch to Company View to see all users' activity."
                  : "No search history yet."}{" "}
                <Link to="/aisearch" className="text-blue-600 hover:underline">
                  Try AI Search
                </Link>
              </div>
            ) : (
              [...searchHistory]
                .sort((a, b) => {
                  const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                  return searchSortAsc ? diff : -diff;
                })
                .map((item, index) => {
                const blobUrls = [item.url1, item.url2, item.url3, item.url4, item.url5].filter(Boolean) as string[];
                return (
                  <div key={item.id ?? index} className="p-3 bg-slate-50 rounded text-sm flex gap-3">
                    {/* Left column: uid */}
                    <div className="flex-shrink-0 w-20 flex items-start pt-0.5">
                      <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded truncate w-full text-center" title={item.uid}>
                        {item.uid ? item.uid.substring(0, 8) : "—"}
                      </span>
                    </div>
                    {/* Right column: content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-900">
                          {truncateText(item.question, 50)}
                        </p>
                        {getSearchTypeBadge(item.requestType)}
                      </div>
                      <p className="text-slate-600 text-xs mb-1">
                        {truncateText(item.response || "Processing...", 80)}
                      </p>
                      {blobUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1 mb-1">
                          {blobUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              📄 Document {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatDate(item.timestamp)}</span>
                          <span>•</span>
                          <span>{item.expectedtokens} tokens</span>
                          <span>•</span>
                          <span>{formatCost(item.expectedcost)}</span>
                        </div>
                        <button
                          onClick={() => setDetailResult(item)}
                          className="text-xs px-2 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-colors flex-shrink-0"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
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
            <h3 className="text-2xl flex-1">Voice Commands History</h3>
            <Tooltip title={voiceSortAsc ? "Sort Newest First" : "Sort Oldest First"}>
              <IconButton size="small" onClick={() => setVoiceSortAsc(v => !v)}>
                {voiceSortAsc ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
                {isSuperUser && currentView === "individual"
                  ? "No personal voice commands yet. Switch to Company View to see all users' activity."
                  : "No voice commands yet."}{" "}
                <Link to="/uploadprompt" className="text-blue-600 hover:underline">
                  Upload Voice File
                </Link>
              </div>
            ) : (
              [...voiceCommands]
                .sort((a, b) => {
                  const diff = new Date(a.actionTime || 0).getTime() - new Date(b.actionTime || 0).getTime();
                  return voiceSortAsc ? diff : -diff;
                })
                .map((item, index) => {
                const fileName = item.commandType ||
                  (item.voiceBlobURL ? item.voiceBlobURL.split('/').pop() : null) ||
                  "Voice Recording";
                const fileType = getFileType(item);
                const fileSize = formatFileSize(item);
                return (
                  <div key={item.id ?? index} className="p-3 bg-slate-50 rounded text-sm flex gap-3">
                    {/* Left column: uid */}
                    <div className="flex-shrink-0 w-20 flex items-start pt-0.5">
                      <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded truncate w-full text-center" title={item.useridstring || ""}>
                        {item.useridstring ? item.useridstring.substring(0, 8) : "—"}
                      </span>
                    </div>
                    {/* Right column: content */}
                    <div className="flex-1 min-w-0">
                      {/* File name + type badge */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-900 truncate">
                          {truncateText(fileName, 45)}
                        </p>
                        {fileType && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold uppercase ${fileTypeBadgeClass(fileType)}`}>
                            {fileType}
                          </span>
                        )}
                      </div>
                      {/* Date/time row */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                        <span>🕐 {item.actionTime ? formatDateTime(item.actionTime) : "N/A"}</span>
                      </div>
                      {/* Duration / size / status row */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        {item.duration != null && (
                          <>
                            <span>⏱ {formatDuration(item.duration)}</span>
                            <span>•</span>
                          </>
                        )}
                        {fileSize && (
                          <>
                            <span>💾 {fileSize}</span>
                            <span>•</span>
                          </>
                        )}
                        <span
                          className={
                            item.status === "processing" ? "text-blue-600"
                            : item.status === "completed" ? "text-green-600"
                            : item.status === "queued" ? "text-yellow-600"
                            : item.status === "failed" ? "text-red-500"
                            : "text-slate-400"
                          }
                        >
                          {item.status === "processing" && "🔄 Processing"}
                          {item.status === "completed" && "✓ Completed"}
                          {item.status === "queued" && "⏳ Queued"}
                          {item.status === "failed" && "✗ Failed"}
                          {!item.status && "—"}
                        </span>
                      </div>
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

        {/* AccuWeather Widget */}
        <div className="p-6 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">☀️</span>
            <h3 className="text-xl font-semibold">AccuWeather</h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={weatherQuery}
              onChange={(e) => setWeatherQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              placeholder="City or zip code..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={fetchWeather}
              disabled={weatherLoading || !weatherQuery.trim()}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded text-sm transition-colors"
            >
              {weatherLoading ? "..." : "Go"}
            </button>
          </div>
          {weatherError && <p className="text-red-600 text-xs mb-2">{weatherError}</p>}
          {weatherData && !weatherLoading && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm space-y-1">
              {(() => {
                const d = Array.isArray(weatherData) ? weatherData[0] : weatherData;
                const text = d?.WeatherText ?? d?.condition ?? d?.description ?? d?.Description;
                const temp = d?.Temperature?.Metric?.Value ?? d?.Temperature?.Imperial?.Value;
                const unit = d?.Temperature?.Metric?.Unit ?? d?.Temperature?.Imperial?.Unit ?? "°";
                const humidity = d?.RelativeHumidity;
                const wind = d?.Wind?.Speed?.Metric?.Value ?? d?.Wind?.Speed?.Imperial?.Value;
                const windUnit = d?.Wind?.Speed?.Metric?.Unit ?? d?.Wind?.Speed?.Imperial?.Unit ?? "";
                const icon = d?.WeatherIcon;
                const emoji = icon ? (icon <= 5 ? "☀️" : icon <= 11 ? "⛅" : icon <= 18 ? "🌧️" : icon <= 22 ? "🌨️" : "🌩️") : "🌤️";
                return (
                  <>
                    {text && <p className="font-semibold text-orange-800 flex items-center gap-1"><span>{emoji}</span>{text}</p>}
                    {temp !== undefined && <p className="text-slate-700">🌡️ {temp}{unit}</p>}
                    {humidity !== undefined && <p className="text-slate-700">💧 {humidity}% humidity</p>}
                    {wind !== undefined && <p className="text-slate-700">🌬️ {wind} {windUnit}</p>}
                    {!text && !temp && (
                      <pre className="text-xs text-slate-600 overflow-auto max-h-32 whitespace-pre-wrap">
                        {JSON.stringify(weatherData, null, 2).slice(0, 400)}
                      </pre>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          {!weatherData && !weatherLoading && (
            <p className="text-slate-400 text-xs text-center py-3">Enter a location to see current conditions</p>
          )}
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

        {/* Detail Modal */}
        <Dialog
          open={!!detailResult}
          onClose={() => setDetailResult(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {detailResult && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box className="flex items-start justify-between gap-3">
                  <Box className="flex items-center gap-2 flex-wrap">
                    {getSearchTypeBadge(detailResult.requestType)}
                    {detailResult.model && (
                      <Chip label={detailResult.model} size="small" variant="outlined" sx={{ fontSize: "10px" }} />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(detailResult.timestamp)}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setDetailResult(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" className="font-semibold mt-2 text-slate-900">
                  {detailResult.question}
                </Typography>
              </DialogTitle>

              <DialogContent dividers>
                {/* Response */}
                <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide font-semibold">
                  Response
                </Typography>
                <Box
                  sx={{
                    mt: 1, mb: 2, p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    maxHeight: 320,
                    overflowY: "auto",
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {detailResult.response || "No response content."}
                </Box>

                {/* Files from url1–url5 */}
                {(() => {
                  const blobUrls = [detailResult.url1, detailResult.url2, detailResult.url3, detailResult.url4, detailResult.url5].filter(Boolean) as string[];
                  const metaFiles = parseMetadataFiles(detailResult.metadata);
                  const allFiles = [
                    ...blobUrls.map((url, i) => ({ label: `Attachment ${i + 1}`, url })),
                    ...metaFiles,
                  ];
                  if (allFiles.length === 0) return null;
                  return (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide font-semibold">
                        Files & Attachments ({allFiles.length})
                      </Typography>
                      <Box className="mt-2 space-y-2">
                        {allFiles.map((file, i) => (
                          <Box
                            key={i}
                            className="flex items-center justify-between gap-3 p-2 rounded border border-slate-200 bg-slate-50"
                          >
                            <Box className="flex items-center gap-2 min-w-0">
                              <span className="text-lg flex-shrink-0">{getFileIcon(file.url)}</span>
                              <Typography variant="body2" className="truncate text-slate-700">
                                {file.label || file.url.split("/").pop() || `File ${i + 1}`}
                              </Typography>
                            </Box>
                            <Box className="flex items-center gap-1 flex-shrink-0">
                              <Tooltip title="Open in new tab">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={file.url}
                                  download
                                >
                                  <InsertDriveFileIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </>
                  );
                })()}

                {/* Stats */}
                <Divider sx={{ mt: 2, mb: 1.5 }} />
                <Box className="flex items-center gap-4 flex-wrap">
                  <Typography variant="caption" color="text.secondary">
                    <strong>Tokens:</strong> {detailResult.expectedtokens.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Cost:</strong> {formatCost(detailResult.expectedcost)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>UID:</strong> {detailResult.uid}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Record ID:</strong> {detailResult.id}
                  </Typography>
                </Box>
              </DialogContent>

              <DialogActions>
                <Button onClick={() => setDetailResult(null)} size="small">Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

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
