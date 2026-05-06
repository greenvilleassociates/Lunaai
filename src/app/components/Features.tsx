import { useNavigate } from "react-router";
import MicIcon from "@mui/icons-material/Mic";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GoogleIcon from "@mui/icons-material/Google";
import ctsLogo from "figma:asset/399d93660a307619ab55b61f935095fec4286492.png";

export function Features() {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: "Record a new Voice Prompt",
      description: "Use your device's microphone to record voice prompts that will be processed by LunaAI's LLM orchestration.",
      icon: <MicIcon sx={{ fontSize: 48 }} />,
      action: "Start Recording",
      route: "/startrecording",
      external: false,
    },
    {
      id: 2,
      title: "Upload an existing Voice Prompt",
      description: "Upload pre-recorded audio files for LunaAI to transcribe and process through multiple AI providers.",
      icon: <UploadFileIcon sx={{ fontSize: 48 }} />,
      action: "Upload File",
      route: "/uploadprompt",
      external: false,
    },
    {
      id: 3,
      title: "AI Search",
      description: "Submit questions to LunaAI for processing through ChatGPT and Claude AI on Azure with cost tracking.",
      icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
      action: "Ask LunaAI",
      route: "/aisearch",
      external: false,
    },
    {
      id: 4,
      title: "Text Search",
      description: "Search through previous prompts, responses, and LLM interactions with powerful text-based queries.",
      icon: <SearchIcon sx={{ fontSize: 48 }} />,
      action: "Open Search",
      route: "/textsearch",
      external: false,
    },
    {
      id: 5,
      title: "CTS EIS Console",
      description: "Access the Capitol Technology Solutions Enterprise Intelligence System console for advanced system management.",
      icon: <img src={ctsLogo} alt="CTS Logo" className="w-12 h-12 object-contain" />,
      action: "Open Console",
      route: "https://console.capitoltechnology.net",
      external: true,
    },
    {
      id: 6,
      title: "Review Existing Desktop Entries",
      description: "Browse and review all previous desktop entries, prompts, and LLM response chains from your history.",
      icon: <HistoryIcon sx={{ fontSize: 48 }} />,
      action: "View Entries",
      route: "/mydesktop",
      external: false,
    },
    {
      id: 7,
      title: "Google Gemini Search",
      description: "Ask questions powered by Google Gemini AI via the LunaAI orchestration layer using the /api/ZGoogle endpoint.",
      icon: <GoogleIcon sx={{ fontSize: 48, color: "#4285F4" }} />,
      action: "Search Gemini",
      route: "/googlesearch",
      external: false,
    },
  ];

  const handleFeatureClick = (feature: typeof features[0]) => {
    if (feature.external && feature.route) {
      window.open(feature.route, "_blank", "noopener,noreferrer");
    } else if (feature.route) {
      navigate(feature.route);
    }
  };

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
                <button 
                  onClick={() => handleFeatureClick(feature)}
                  disabled={!feature.route}
                  className={`px-4 py-2 rounded text-sm transition-colors inline-flex items-center gap-2 ${
                    feature.route
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {feature.action}
                  {feature.external && <OpenInNewIcon sx={{ fontSize: 16 }} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}