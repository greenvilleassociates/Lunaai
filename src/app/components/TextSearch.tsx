import { useState } from "react";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";
import SearchIcon from "@mui/icons-material/Search";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import SmartToyIcon from "@mui/icons-material/SmartToy";

interface WebSearchResult {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata: string;
  expectedtokens: number;
  expectedcost: number;
  requestType?: number | null;
  model?: string | null;
}

const getSearchTypeBadge = (requestType?: number | null) => {
  switch (requestType) {
    case 2:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          <RecordVoiceOverIcon sx={{ fontSize: 12 }} />
          VoiceSearch
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CorporateFareIcon sx={{ fontSize: 12 }} />
          EnterpriseSearch
        </span>
      );
    case 4:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <SmartToyIcon sx={{ fontSize: 12 }} />
          ClaudeAI
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

export function TextSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const uid = localStorage.getItem("uid");
      let data: WebSearchResult[] = [];

      try {
        const url = getApiUrl(API_CONFIG.ENDPOINTS.WEB_SEARCH);
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
        });
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error("API unavailable");
        }
      } catch {
        data = await fetchExternalData<WebSearchResult[]>(DATA_URLS.WEBSEARCH);
      }

      const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
      const matched = data.filter((item) => {
        const haystack = `${item.question} ${item.response}`.toLowerCase();
        return keywords.every((kw) => haystack.includes(kw));
      });

      setResults(matched);
      setSearched(true);
    } catch (err) {
      setError("Failed to load search data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl mb-2">Text Search</h2>
      <p className="text-slate-600 mb-6">
        Search through previous prompts, responses, and LLM interactions.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter keywords to search..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <SearchIcon sx={{ fontSize: 18 }} />
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <p className="text-sm text-slate-500 mb-3">
            {results.length === 0
              ? `No results found for "${query}"`
              : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
          <div className="space-y-3">
            {results.map((item) => (
              <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-medium text-slate-900 text-sm">{item.question}</p>
                  {getSearchTypeBadge(item.requestType)}
                </div>
                <p className="text-slate-600 text-sm mb-3 leading-relaxed">{item.response}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded" title={item.uid}>
                    {item.uid ? item.uid.substring(0, 8) : "—"}
                  </span>
                  <span>{formatDate(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.expectedtokens} tokens</span>
                  <span>•</span>
                  <span>${item.expectedcost.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-3">
          <SearchIcon sx={{ fontSize: 56 }} />
          <p className="text-slate-400 text-sm">Enter keywords above to search your AI history</p>
        </div>
      )}
    </div>
  );
}
