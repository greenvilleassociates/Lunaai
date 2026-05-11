import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Typography,
  Button,
  Paper,
  Box,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ArrowForward, AutoAwesome, Send, Receipt, Mic } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";
import { getAuthHeaders } from "../utils/auth";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";

const seasideImages = [
  "https://images.unsplash.com/photo-1610289795012-6b0cebf95f0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHR1cnF1b2lzZSUyMGJlYWNofGVufDF8fHx8MTc3MzA3MjAzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1651617733477-6cc82ceb3730?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBjb2FzdHxlbnwxfHx8fDE3NzMwNzIwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMHBhcmFkaXNlJTIwYmVhY2h8ZW58MXx8fHwxNzczMDcyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1653580650559-9998f8a2e062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwc3Vuc2V0JTIwb2NlYW58ZW58MXx8fHwxNzczMDcyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const ENGINE_LABELS: Record<string, string> = {
  "1": "SuperLuna",
  "2": "Keyword",
  "3": "ChatGPT",
  "4": "Google Gemini",
  "5": "Claude AI",
  "6": "Wikipedia",
  "7": "Empwr",
  "8": "Context Search",
  "9": "Grok AI",
};

const ENGINE_COLORS: Record<string, string> = {
  "1": "#8B0000",
  "2": "#475569",
  "3": "#10a37f",
  "4": "#DB4437",
  "5": "#7c3aed",
  "6": "#1a6496",
  "7": "#0062FF",
  "8": "#0891b2",
  "9": "#000000",
};

function getSearchConfig(engine: string) {
  const maxEngines = parseInt(localStorage.getItem("maxsearchengines") || "1", 10);
  const chained = localStorage.getItem("chainsearch") === "1";

  switch (engine) {
    case "1":
      return {
        endpoint: API_CONFIG.ENDPOINTS.SUPER_LUNA_SEARCH,
        extra: { requestType: 1, model: "superluna", maxsearchengines: maxEngines, chainsearch: chained ? 1 : 0 },
        redirect: "/superlunasearch",
        label: chained ? "SuperLuna (Chained)" : "SuperLuna",
      };
    case "2":
      return { endpoint: API_CONFIG.ENDPOINTS.WEB_SEARCH, extra: {}, redirect: "/aisearch", label: "Keyword" };
    case "3":
      return { endpoint: API_CONFIG.ENDPOINTS.WEB_SEARCH, extra: {}, redirect: "/aisearch", label: "ChatGPT" };
    case "4":
      return { endpoint: API_CONFIG.ENDPOINTS.ZGOOGLE, extra: { requestType: 5, model: "gemini" }, redirect: "/googlesearch", label: "Google Gemini" };
    case "5":
      return { endpoint: API_CONFIG.ENDPOINTS.ZCLAUDE, extra: { requestType: 10, model: "claude" }, redirect: "/claude", label: "Claude AI" };
    case "6":
      return { endpoint: API_CONFIG.ENDPOINTS.WEB_SEARCH, extra: {}, redirect: "/aisearch", label: "Wikipedia" };
    case "7":
      return { endpoint: API_CONFIG.ENDPOINTS.ZEMPWR, extra: { requestType: 3, model: "Generic" }, redirect: "/empowr", label: "Empwr" };
    case "8":
      return { endpoint: API_CONFIG.ENDPOINTS.ZLUNA_CONTEXT_SEARCH, extra: { requestType: 9, model: "luna-context-router" }, redirect: "/lunacontextrouter", label: "Context Search" };
    case "9":
      return { endpoint: API_CONFIG.ENDPOINTS.ZGROK, extra: { requestType: 11, model: "grok" }, redirect: "/grok", label: "Grok AI" };
    default:
      return {
        endpoint: API_CONFIG.ENDPOINTS.SUPER_LUNA_SEARCH,
        extra: { requestType: 1, model: "superluna" },
        redirect: "/superlunasearch",
        label: "SuperLuna",
      };
  }
}

export function Home() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string>("1");

  // Check if user is logged in and load active engine
  useEffect(() => {
    const uid = localStorage.getItem("uid");
    setIsLoggedIn(!!uid);
    setActiveEngine(localStorage.getItem("defaultSearchEngine") || "1");
  }, []);

  // Sync engine setting changes from Settings page
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "defaultSearchEngine" && e.newValue) {
        setActiveEngine(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % seasideImages.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    const uid = localStorage.getItem("uid");
    if (!uid) {
      setError("Please log in to submit a question");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const cfg = getSearchConfig(activeEngine);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        uid,
        question: question.trim(),
        response: "",
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({ source: "LunaAI Home Page", userAgent: navigator.userAgent }),
        expectedtokens: 0,
        expectedcost: 0,
        ...cfg.extra,
      };

      const url = getApiUrl(cfg.endpoint);
      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      await response.json();
      setSuccess(`Question submitted via ${cfg.label}! Redirecting...`);
      setQuestion("");

      setTimeout(() => navigate(cfg.redirect), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)] -m-8 overflow-hidden">
      {/* Background Image Slideshow */}
      {seasideImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <ImageWithFallback
            src={image}
            alt={`Beautiful seaside ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 py-16">
        <div className="max-w-4xl w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={lunaLogo}
              alt="LunaAI Logo"
              className="w-32 h-32 rounded-2xl object-cover shadow-2xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl text-white text-center mb-4 font-bold">
            Welcome to LunaAI
          </h1>
          <p className="text-xl text-white/90 text-center mb-8 max-w-2xl mx-auto">
            Your intelligent LLM orchestration platform. Process requests across multiple AI models and Trust Zones using powerful combinations of models including Global and Enterprise Domains.
          </p>

          {/* Alert Messages */}
          {success && (
            <Alert severity="success" className="mb-4" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" className="mb-4" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* AI Search Bar */}
          <Paper
            elevation={8}
            className="p-6 mb-8 bg-white/95 backdrop-blur-sm"
            sx={{ borderRadius: 3 }}
          >
            <Box className="flex items-center justify-between gap-3 mb-4">
              <Box className="flex items-center gap-3">
                <AutoAwesome className="text-slate-700" sx={{ fontSize: 32 }} />
                <h2 className="text-2xl text-slate-900">Ask LunaAI Anything</h2>
              </Box>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 99,
                  backgroundColor: ENGINE_COLORS[activeEngine] ?? "#8B0000",
                  color: "white",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                title="Change in Settings → Search Engine"
                onClick={() => navigate("/settings")}
              >
                {ENGINE_LABELS[activeEngine] ?? "SuperLuna"}
              </Box>
            </Box>
            <form onSubmit={handleSubmit}>
              <Box className="flex gap-3 flex-col md:flex-row">
                <TextField
                  fullWidth
                  label="What would you like to know?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your question here..."
                  multiline
                  rows={2}
                  sx={{ 
                    backgroundColor: "white",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#cbd5e1",
                      },
                    },
                  }}
                />
              </Box>
              <Box className="flex justify-end mt-3">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  disabled={loading || !question.trim()}
                  sx={{
                    backgroundColor: "#1a1a1a",
                    "&:hover": { backgroundColor: "#2a2a2a" },
                    paddingX: 4,
                    paddingY: 1.5,
                  }}
                >
                  {loading ? "Processing..." : "Submit Question"}
                </Button>
              </Box>
            </form>
            {!isLoggedIn && (
              <Box className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  Please{" "}
                  <Link to="/login" className="text-blue-600 hover:underline font-medium">
                    log in
                  </Link>{" "}
                  or{" "}
                  <Link to="/register" className="text-blue-600 hover:underline font-medium">
                    register
                  </Link>{" "}
                  for an account to submit questions to LunaAI
                </p>
              </Box>
            )}
          </Paper>

          {/* Ask Luna — voice shortcut */}
          <Paper
            elevation={8}
            className="p-5 mb-8 bg-white/95 backdrop-blur-sm"
            sx={{ borderRadius: 3, borderLeft: "4px solid #8B0000" }}
          >
            <Box className="flex flex-col md:flex-row items-center gap-4">
              {/* Pulsing mic icon */}
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Box sx={{
                  position: "absolute", inset: -8,
                  borderRadius: "50%",
                  backgroundColor: "#8B0000",
                  opacity: 0.12,
                  animation: "pulse 2s ease-in-out infinite",
                }} />
                <Box sx={{
                  width: 56, height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#8B0000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(139,0,0,0.4)",
                  position: "relative", zIndex: 1,
                }}>
                  <Mic sx={{ color: "white", fontSize: 28 }} />
                </Box>
              </Box>

              <Box className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Ask Luna</h3>
                <p className="text-slate-600 text-sm">
                  Speak your question — Luna records your voice, transcribes it, and routes it through the AI orchestration engine.
                </p>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<Mic />}
                onClick={() => isLoggedIn ? navigate("/startrecording") : navigate("/login")}
                sx={{
                  backgroundColor: "#8B0000",
                  "&:hover": { backgroundColor: "#6B0000" },
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 2,
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(139,0,0,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {isLoggedIn ? "Start Recording" : "Login to Record"}
              </Button>
            </Box>
          </Paper>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Paper
              elevation={4}
              className="p-6 bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all"
              sx={{ borderRadius: 2 }}
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Multi-Model Processing</h3>
              <p className="text-slate-600 text-sm">
                Chain Results Across Multiple LLM and SLM Providers in Public and Enterprise Domains including ChatGPT, Claude, and Gemeni.
              </p>
            </Paper>

            <Paper
              elevation={4}
              className="p-6 bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all"
              sx={{ borderRadius: 2 }}
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise Ready</h3>
              <p className="text-slate-600 text-sm">
                Secure, scalable architecture deployed on CTS Hybrid Grid Architecture with comprehensive admin tools.
              </p>
            </Paper>

            <Paper
              elevation={4}
              className="p-6 bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all"
              sx={{ borderRadius: 2 }}
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Desktop Integration</h3>
              <p className="text-slate-600 text-sm">
                Deliver AI-powered insights directly to your desktop with seamless workflows.
              </p>
            </Paper>

            <Paper
              elevation={4}
              className="p-6 bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer"
              sx={{ borderRadius: 2, borderTop: "3px solid #8B0000" }}
              onClick={() => isLoggedIn && navigate("/searchbilling")}
            >
              <Box className="flex items-center gap-2 mb-2">
                <Receipt sx={{ color: "#8B0000", fontSize: 24 }} />
                <h3 className="text-xl font-semibold text-slate-900">Search Billing</h3>
              </Box>
              <p className="text-slate-600 text-sm mb-3">
                View all AI search activity and generate rebill invoices at your configured per-search rate.
              </p>
              {isLoggedIn ? (
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={(e) => { e.stopPropagation(); navigate("/searchbilling"); }}
                  sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" }, fontSize: "0.75rem" }}
                >
                  View Billing
                </Button>
              ) : (
                <p className="text-xs text-slate-400 italic">Login required</p>
              )}
            </Paper>
          </div>

          {/* Footer Link */}
          <div className="text-center mt-12">
            <p className="text-white/80 text-sm">
              Access LunaAI at:{" "}
              <a
                href="https://luna.capitoltechnology.net"
                className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                luna.capitoltechnology.net
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {seasideImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentImageIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}