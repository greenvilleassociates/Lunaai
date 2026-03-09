import { Link } from "react-router";
import FolderIcon from "@mui/icons-material/Folder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export function MyDesktop() {
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

        {/* Recent Activity */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center gap-4 mb-4">
            <FolderIcon sx={{ fontSize: 48 }} className="text-slate-700" />
            <h3 className="text-2xl">Recent Activity</h3>
          </div>
          <p className="text-slate-600 mb-4">
            Your most recent LLM interactions and processed prompts.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 rounded text-sm">
              <p className="font-medium">Voice Prompt - March 8, 2026</p>
              <p className="text-slate-600">Processed by ChatGPT & Claude</p>
            </div>
            <div className="p-3 bg-slate-50 rounded text-sm">
              <p className="font-medium">Text Search - March 7, 2026</p>
              <p className="text-slate-600">15 results found</p>
            </div>
            <div className="p-3 bg-slate-50 rounded text-sm">
              <p className="font-medium">Voice Upload - March 6, 2026</p>
              <p className="text-slate-600">Multi-chain analysis completed</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-8 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-2xl mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Total Prompts Processed</p>
              <p className="text-3xl text-slate-900">247</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Active LLM Providers</p>
              <p className="text-3xl text-slate-900">2</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Desktop Entries</p>
              <p className="text-3xl text-slate-900">89</p>
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
