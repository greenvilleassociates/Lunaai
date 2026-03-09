import MicIcon from "@mui/icons-material/Mic";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";

export function Features() {
  const features = [
    {
      id: 1,
      title: "Record a new Voice Prompt",
      description: "Use your device's microphone to record voice prompts that will be processed by LunaAI's LLM orchestration.",
      icon: <MicIcon sx={{ fontSize: 48 }} />,
      action: "Start Recording",
    },
    {
      id: 2,
      title: "Upload an existing Voice Prompt",
      description: "Upload pre-recorded audio files for LunaAI to transcribe and process through multiple AI providers.",
      icon: <UploadFileIcon sx={{ fontSize: 48 }} />,
      action: "Upload File",
    },
    {
      id: 3,
      title: "Text Search",
      description: "Search through previous prompts, responses, and LLM interactions with powerful text-based queries.",
      icon: <SearchIcon sx={{ fontSize: 48 }} />,
      action: "Open Search",
    },
    {
      id: 4,
      title: "Review Existing Desktop Entries",
      description: "Browse and review all previous desktop entries, prompts, and LLM response chains from your history.",
      icon: <HistoryIcon sx={{ fontSize: 48 }} />,
      action: "View Entries",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl mb-6">Features</h2>
      <p className="text-slate-600 mb-8">
        Access LunaAI's powerful tools to interact with multiple LLM providers and manage your AI workflows.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow bg-white"
          >
            <div className="flex items-start gap-4">
              <div className="text-slate-700 flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm mb-4">
                  {feature.description}
                </p>
                <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors text-sm">
                  {feature.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
