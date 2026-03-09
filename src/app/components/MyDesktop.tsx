import { Link } from "react-router";
import { useState, useEffect } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import { API_CONFIG, getApiUrl } from "../config/api";

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

export function MyDesktop() {
  const [searchHistory, setSearchHistory] = useState<WebSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentSearches();
  }, []);

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
        // Get the 5 most recent searches
        setSearchHistory(data.slice(0, 5));
      }
    } catch (err) {
      console.error("Error loading search history:", err);
    } finally {
      setLoading(false);
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
      <h2 className="text-3xl mb-6">My Desktop</h2>
      <p className="text-slate-600 mb-8">
        Your central workspace for managing LLM interactions, voice prompts, and AI workflows.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* AI Search History */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center gap-4 mb-4">
            <SearchIcon sx={{ fontSize: 48 }} className="text-slate-700" />
            <h3 className="text-2xl">AI Search History</h3>
          </div>
          <p className="text-slate-600 mb-4">
            Your most recent AI-powered search queries and responses.
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

        {/* Quick Stats */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-2xl mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Total AI Searches</p>
              <p className="text-3xl text-slate-900">{searchHistory.length > 0 ? searchHistory.length : "0"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Active LLM Providers</p>
              <p className="text-3xl text-slate-900">2</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Recent Searches</p>
              <p className="text-3xl text-slate-900">{searchHistory.length}</p>
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
      </div>
    </div>
  );
}
