import { useState, useCallback, useRef } from "react";
import {
  Box, Typography, Paper, Button, Chip, IconButton, Select, MenuItem,
  FormControl, Tooltip, Divider, CircularProgress, Alert,
  Collapse,
} from "@mui/material";
import {
  Plus, Trash2, Send, Copy, RotateCcw,
  ChevronDown, ChevronUp, GitFork,
  CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import { getApiUrl } from "../config/api";

// ─── Provider registry ──────────────────────────────────────────────────────

type ProviderKey =
  | "websearch"
  | "claude"
  | "grok"
  | "empowr"
  | "superluna"
  | "contextrouter";

interface ProviderConfig {
  label: string;
  sublabel: string;
  endpoint: string;
  requestType: number;
  model: string;
  color: string;
  bg: string;
}

const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
  websearch: {
    label: "Web Search",
    sublabel: "LunaAI multi-provider",
    endpoint: "/Websearch",
    requestType: 1,
    model: "websearch",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  claude: {
    label: "Claude AI",
    sublabel: "Anthropic via Azure",
    endpoint: "/Zclaude",
    requestType: 4,
    model: "claude",
    color: "#d97706",
    bg: "#fffbeb",
  },
  grok: {
    label: "Grok AI",
    sublabel: "xAI",
    endpoint: "/ZGrok",
    requestType: 6,
    model: "grok",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  empowr: {
    label: "Empowr",
    sublabel: "USC enterprise search",
    endpoint: "/ZEmpwr",
    requestType: 3,
    model: "Generic",
    color: "#059669",
    bg: "#ecfdf5",
  },
  superluna: {
    label: "SuperLuna",
    sublabel: "Chained multi-provider",
    endpoint: "/SuperLunaSearch",
    requestType: 1,
    model: "superluna",
    color: "#8B0000",
    bg: "#fff1f2",
  },
  contextrouter: {
    label: "Context Router",
    sublabel: "Auto-routes by topic",
    endpoint: "/ZLunaContextSearch",
    requestType: 9,
    model: "luna-context-router",
    color: "#0891b2",
    bg: "#ecfeff",
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

type SessionStatus = "idle" | "loading" | "success" | "error";

interface SessionPanel {
  id: string;
  provider: ProviderKey;
  questionOverride: string;
  useCustomQuestion: boolean;
  status: SessionStatus;
  response: string;
  error?: string;
  sentAt?: string;
  receivedAt?: string;
  tokens?: number;
  cost?: number;
  requestSnapshot?: string;
  showRequest: boolean;
}

let _idCounter = 0;
const newId = () => `sess-${Date.now()}-${_idCounter++}`;

const defaultSession = (provider: ProviderKey): SessionPanel => ({
  id: newId(),
  provider,
  questionOverride: "",
  useCustomQuestion: false,
  status: "idle",
  response: "",
  showRequest: false,
});

// ─── Session card ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: SessionPanel;
  globalQuestion: string;
  onUpdate: (id: string, patch: Partial<SessionPanel>) => void;
  onRemove: (id: string) => void;
  onSend: (id: string) => void;
  totalSessions: number;
}

function SessionCard({
  session,
  globalQuestion,
  onUpdate,
  onRemove,
  onSend,
  totalSessions,
}: SessionCardProps) {
  const prov = PROVIDERS[session.provider];
  const activeQuestion = session.useCustomQuestion
    ? session.questionOverride
    : globalQuestion;

  const elapsed =
    session.sentAt && session.receivedAt
      ? (
          (new Date(session.receivedAt).getTime() -
            new Date(session.sentAt).getTime()) /
          1000
        ).toFixed(2)
      : null;

  const handleCopy = () => {
    if (session.response) navigator.clipboard.writeText(session.response);
  };

  return (
    <Paper
      elevation={0}
      className="flex flex-col h-full"
      sx={{
        border: `1.5px solid`,
        borderColor:
          session.status === "success"
            ? prov.color + "55"
            : session.status === "error"
            ? "#ef444455"
            : "#e2e8f0",
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          backgroundColor: prov.bg,
          borderBottom: `1px solid ${prov.color}33`,
          px: 2,
          py: 1.5,
        }}
        className="flex items-center gap-2"
      >
        {/* Provider selector */}
        <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
          <Select
            value={session.provider}
            onChange={(e) =>
              onUpdate(session.id, {
                provider: e.target.value as ProviderKey,
                status: "idle",
                response: "",
                error: undefined,
              })
            }
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: prov.color,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-icon": { color: prov.color },
              backgroundColor: "transparent",
            }}
          >
            {(Object.entries(PROVIDERS) as [ProviderKey, ProviderConfig][]).map(
              ([key, p]) => (
                <MenuItem key={key} value={key}>
                  <Box>
                    <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                      {p.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                      {p.sublabel}
                    </Typography>
                  </Box>
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {/* Status chip */}
        {session.status === "loading" && (
          <CircularProgress size={16} sx={{ color: prov.color, flexShrink: 0 }} />
        )}
        {session.status === "success" && (
          <CheckCircle2 size={18} style={{ color: prov.color, flexShrink: 0 }} />
        )}
        {session.status === "error" && (
          <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
        )}

        {/* Remove button */}
        <Tooltip title="Remove session">
          <span>
            <IconButton
              size="small"
              onClick={() => onRemove(session.id)}
              disabled={totalSessions <= 1}
              sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
            >
              <Trash2 size={16} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Custom question toggle */}
      <Box className="px-3 pt-2 flex items-center gap-2">
        <Typography variant="caption" color="text.secondary" className="flex-1">
          {session.useCustomQuestion ? "Custom prompt" : "Using global prompt"}
        </Typography>
        <Tooltip
          title={
            session.useCustomQuestion
              ? "Switch to global prompt"
              : "Override with custom prompt"
          }
        >
          <Chip
            label={session.useCustomQuestion ? "Custom" : "Global"}
            size="small"
            onClick={() =>
              onUpdate(session.id, {
                useCustomQuestion: !session.useCustomQuestion,
                questionOverride: session.useCustomQuestion
                  ? ""
                  : globalQuestion,
              })
            }
            sx={{
              fontSize: "0.65rem",
              height: 20,
              cursor: "pointer",
              backgroundColor: session.useCustomQuestion ? prov.color : "#e2e8f0",
              color: session.useCustomQuestion ? "white" : "#64748b",
            }}
          />
        </Tooltip>
      </Box>

      {/* Custom question input */}
      {session.useCustomQuestion && (
        <Box className="px-3 pt-1">
          <textarea
            value={session.questionOverride}
            onChange={(e) =>
              onUpdate(session.id, { questionOverride: e.target.value })
            }
            placeholder="Enter a custom prompt for this session..."
            rows={2}
            className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            style={{ fontFamily: "inherit" }}
          />
        </Box>
      )}

      {/* Request snapshot (collapsible) */}
      {session.requestSnapshot && (
        <Box className="px-3 pt-1">
          <button
            onClick={() =>
              onUpdate(session.id, { showRequest: !session.showRequest })
            }
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {session.showRequest ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
            Request payload
          </button>
          <Collapse in={session.showRequest}>
            <Box
              className="mt-1 p-2 rounded text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 overflow-x-auto"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {session.requestSnapshot}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Response area */}
      <Box className="flex-1 px-3 py-2 overflow-y-auto" style={{ minHeight: 120 }}>
        {session.status === "idle" && !session.response && (
          <Typography variant="body2" color="text.secondary" className="italic">
            {activeQuestion.trim()
              ? "Ready — click Send to query this provider."
              : "Enter a prompt above, then click Send All."}
          </Typography>
        )}
        {session.status === "loading" && (
          <Box className="flex items-center gap-2 py-4">
            <CircularProgress size={20} sx={{ color: prov.color }} />
            <Typography variant="body2" color="text.secondary">
              Awaiting response from {prov.label}…
            </Typography>
          </Box>
        )}
        {session.status === "error" && (
          <Alert severity="error" sx={{ fontSize: "0.78rem" }}>
            {session.error || "An error occurred."}
          </Alert>
        )}
        {session.status === "success" && (
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: "0.82rem" }}
          >
            {session.response}
          </Typography>
        )}
      </Box>

      {/* Card footer */}
      <Box
        className="px-3 py-2 flex items-center gap-2 flex-wrap"
        sx={{ borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}
      >
        {elapsed && (
          <Box className="flex items-center gap-1 text-xs text-slate-400 mr-auto">
            <Clock size={13} />
            {elapsed}s
          </Box>
        )}
        {session.tokens != null && (
          <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
            ~{session.tokens} tokens
          </Typography>
        )}

        {session.status === "success" && (
          <Tooltip title="Copy response">
            <IconButton size="small" onClick={handleCopy} sx={{ color: "#94a3b8" }}>
              <Copy size={15} />
            </IconButton>
          </Tooltip>
        )}

        <Button
          variant="contained"
          size="small"
          disabled={session.status === "loading" || !activeQuestion.trim()}
          onClick={() => onSend(session.id)}
          startIcon={<Send size={13} />}
          sx={{
            fontSize: "0.72rem",
            py: 0.5,
            px: 1.5,
            minWidth: 0,
            backgroundColor: prov.color,
            "&:hover": { backgroundColor: prov.color, filter: "brightness(0.9)" },
            "&.Mui-disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Multipart() {
  const [globalQuestion, setGlobalQuestion] = useState("");
  const [sessions, setSessions] = useState<SessionPanel[]>([
    defaultSession("claude"),
    defaultSession("grok"),
  ]);
  const [sendingAll, setSendingAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateSession = useCallback(
    (id: string, patch: Partial<SessionPanel>) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
    },
    []
  );

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSession = () => {
    const usedProviders = new Set(sessions.map((s) => s.provider));
    const next =
      (Object.keys(PROVIDERS) as ProviderKey[]).find(
        (k) => !usedProviders.has(k)
      ) ?? "websearch";
    setSessions((prev) => [...prev, defaultSession(next)]);
  };

  const buildPayload = (session: SessionPanel, question: string) => {
    const prov = PROVIDERS[session.provider];
    const uid = localStorage.getItem("uid") ?? "";
    const base = {
      uid,
      question,
      requestType: prov.requestType,
      model: prov.model,
    };
    if (session.provider === "websearch") {
      return {
        uid,
        question,
        response: "",
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({ source: "Multipart Session" }),
        expectedtokens: 0,
        expectedcost: 0,
      };
    }
    if (session.provider === "superluna") {
      return {
        ...base,
        maxsearchengines: parseInt(
          localStorage.getItem("maxsearchengines") ?? "1"
        ),
        chainsearch: parseInt(localStorage.getItem("chainsearch") ?? "0"),
      };
    }
    return base;
  };

  const sendSession = useCallback(
    async (id: string) => {
      setSessions((prev) => {
        const s = prev.find((x) => x.id === id);
        if (!s) return prev;
        const q = s.useCustomQuestion ? s.questionOverride : globalQuestion;
        if (!q.trim()) return prev;
        return prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "loading" as SessionStatus,
                sentAt: new Date().toISOString(),
                response: "",
                error: undefined,
                requestSnapshot: JSON.stringify(buildPayload(x, q), null, 2),
              }
            : x
        );
      });

      // read current state
      setSessions((prev) => {
        const s = prev.find((x) => x.id === id);
        if (!s || s.status !== "loading") return prev;
        const q = s.useCustomQuestion ? s.questionOverride : globalQuestion;
        const prov = PROVIDERS[s.provider];
        const payload = buildPayload(s, q);
        const uid = localStorage.getItem("uid") ?? "";

        fetch(getApiUrl(prov.endpoint), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text().catch(() => "");
              throw new Error(`HTTP ${res.status}${text ? " — " + text : ""}`);
            }
            return res.json();
          })
          .then((data) => {
            setSessions((p) =>
              p.map((x) =>
                x.id === id
                  ? {
                      ...x,
                      status: "success",
                      response: data.response ?? "",
                      receivedAt: new Date().toISOString(),
                      tokens: data.expectedtokens,
                      cost: data.expectedcost,
                    }
                  : x
              )
            );
          })
          .catch((err) => {
            setSessions((p) =>
              p.map((x) =>
                x.id === id
                  ? { ...x, status: "error", error: err.message }
                  : x
              )
            );
          });

        return prev;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalQuestion]
  );

  const sendAll = async () => {
    const q = globalQuestion.trim();
    if (!q) return;
    setSendingAll(true);
    const ids = sessions
      .filter((s) => s.status !== "loading")
      .map((s) => s.id);
    await Promise.all(ids.map((id) => sendSession(id)));
    setSendingAll(false);
  };

  const clearAll = () => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        status: "idle" as SessionStatus,
        response: "",
        error: undefined,
        requestSnapshot: undefined,
        sentAt: undefined,
        receivedAt: undefined,
        tokens: undefined,
        cost: undefined,
      }))
    );
  };

  const anyLoading = sessions.some((s) => s.status === "loading");
  const anySuccess = sessions.some((s) => s.status === "success");

  // Stats summary
  const successCount = sessions.filter((s) => s.status === "success").length;
  const errorCount = sessions.filter((s) => s.status === "error").length;

  return (
    <div className="max-w-[1600px] mx-auto px-2 pb-8">
      {/* Page header */}
      <Box className="flex items-center gap-3 mb-6">
        <GitFork size={42} className="text-slate-700" />
        <div>
          <h1 className="text-3xl font-bold">Multipart Sessions</h1>
          <p className="text-slate-600 text-sm">
            Send the same prompt — or independent prompts — to multiple LLM
            providers simultaneously and compare responses side by side.
          </p>
        </div>
      </Box>

      {/* Global query bar */}
      <Paper
        elevation={0}
        sx={{ border: "1.5px solid #e2e8f0", borderRadius: 2, p: 3, mb: 4 }}
      >
        <Typography variant="subtitle1" fontWeight={700} className="mb-2">
          Global Prompt
        </Typography>
        <Typography variant="caption" color="text.secondary" className="block mb-3">
          This prompt is sent to all sessions that have not been given a custom
          override. Individual sessions can be given their own prompt using the
          Custom toggle on each card.
        </Typography>
        <textarea
          ref={textareaRef}
          value={globalQuestion}
          onChange={(e) => setGlobalQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              sendAll();
            }
          }}
          placeholder="Enter your question or prompt here… (Ctrl+Enter to send all)"
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
          style={{ fontFamily: "inherit", fontSize: "0.9rem" }}
        />

        <Box className="flex items-center gap-3 mt-3 flex-wrap">
          <Button
            variant="contained"
            onClick={sendAll}
            disabled={anyLoading || !globalQuestion.trim()}
            startIcon={
              anyLoading ? (
                <CircularProgress size={14} sx={{ color: "white" }} />
              ) : (
                <Send size={16} />
              )
            }
            sx={{
              backgroundColor: "#8B0000",
              "&:hover": { backgroundColor: "#6B0000" },
              "&.Mui-disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
            }}
          >
            {anyLoading ? "Sending…" : `Send to All (${sessions.length})`}
          </Button>

          {anySuccess && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearAll}
              startIcon={<RotateCcw size={14} />}
              sx={{ borderColor: "#64748b", color: "#64748b" }}
            >
              Clear Responses
            </Button>
          )}

          <Box className="ml-auto flex items-center gap-2 flex-wrap">
            {successCount > 0 && (
              <Chip
                label={`${successCount} responded`}
                size="small"
                sx={{ backgroundColor: "#d1fae5", color: "#065f46", fontSize: "0.72rem" }}
              />
            )}
            {errorCount > 0 && (
              <Chip
                label={`${errorCount} error${errorCount > 1 ? "s" : ""}`}
                size="small"
                sx={{ backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "0.72rem" }}
              />
            )}
            {anyLoading && (
              <Chip
                label="Waiting…"
                size="small"
                sx={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: "0.72rem" }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Session grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: sessions.length >= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            xl: sessions.length >= 4 ? "repeat(4, 1fr)" : "repeat(3, 1fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            globalQuestion={globalQuestion}
            onUpdate={updateSession}
            onRemove={removeSession}
            onSend={sendSession}
            totalSessions={sessions.length}
          />
        ))}

        {/* Add session card */}
        {sessions.length < 6 && (
          <Paper
            elevation={0}
            onClick={addSession}
            sx={{
              border: "2px dashed #cbd5e1",
              borderRadius: 2,
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              cursor: "pointer",
              minHeight: 160,
              transition: "border-color 0.15s, background 0.15s",
              "&:hover": {
                borderColor: "#8B0000",
                backgroundColor: "#fff1f2",
              },
            }}
          >
            <Plus size={32} className="text-slate-400" />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Add Session
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {sessions.length < 6
                ? `${6 - sessions.length} slot${6 - sessions.length === 1 ? "" : "s"} remaining`
                : "Max sessions reached"}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Provider reference */}
      <Divider sx={{ my: 4 }} />
      <Box>
        <Typography variant="subtitle2" color="text.secondary" className="mb-3">
          Available Providers
        </Typography>
        <Box className="flex flex-wrap gap-2">
          {(Object.entries(PROVIDERS) as [ProviderKey, ProviderConfig][]).map(
            ([key, p]) => (
              <Chip
                key={key}
                label={p.label}
                size="small"
                sx={{
                  backgroundColor: p.bg,
                  color: p.color,
                  border: `1px solid ${p.color}44`,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              />
            )
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" className="block mt-2">
          Each session card can target a different provider. Sessions with custom
          prompts enabled run their own text independently of the global prompt.
          Use Ctrl+Enter in the global prompt to send all at once.
        </Typography>
      </Box>
    </div>
  );
}
