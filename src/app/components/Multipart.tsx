import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Chip, IconButton, Select, MenuItem,
  FormControl, Tooltip, Divider, CircularProgress,
} from "@mui/material";
import {
  Plus, Trash2, Send, GitFork, AlertCircle,
  RotateCcw, Hash, MessageSquare,
} from "lucide-react";
import { getApiUrl } from "../config/api";

// ─── Provider registry ───────────────────────────────────────────────────────

type ProviderKey =
  | "websearch"
  | "claude"
  | "grok"
  | "empowr"
  | "superluna"
  | "contextrouter"
  | "medical";

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
  websearch:     { label: "Web Search",     sublabel: "LunaAI multi-provider",    endpoint: "/Websearch",          requestType: 1, model: "websearch",           color: "#3b82f6", bg: "#eff6ff" },
  claude:        { label: "Claude AI",      sublabel: "Anthropic via Azure",       endpoint: "/Zclaude",            requestType: 4, model: "claude",              color: "#d97706", bg: "#fffbeb" },
  grok:          { label: "Grok AI",        sublabel: "xAI",                       endpoint: "/ZGrok",              requestType: 6, model: "grok",                color: "#7c3aed", bg: "#f5f3ff" },
  empowr:        { label: "Empowr",         sublabel: "USC enterprise search",     endpoint: "/ZEmpwr",             requestType: 3, model: "Generic",             color: "#059669", bg: "#ecfdf5" },
  superluna:     { label: "SuperLuna",      sublabel: "Chained multi-provider",    endpoint: "/SuperLunaSearch",    requestType: 1, model: "superluna",           color: "#8B0000", bg: "#fff1f2" },
  contextrouter: { label: "Context Router", sublabel: "Auto-routes by topic",      endpoint: "/ZLunaContextSearch", requestType: 9, model: "luna-context-router", color: "#0891b2", bg: "#ecfeff" },
  medical:       { label: "Medical Domain",  sublabel: "Medical queries → Claude",  endpoint: "/Zclaude",            requestType: 4, model: "claude",              color: "#0d9488", bg: "#f0fdfa" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tokens?: number;
  elapsedMs?: number;
  error?: string;
}

interface LLMSession {
  sessionId: string;
  provider: ProviderKey;
  title: string;
  messages: ConversationMessage[];
  isLoading: boolean;
  localInput: string;
}

let _counter = 0;
const uid6 = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const msgId = () => `msg-${Date.now()}-${_counter++}`;

const newSession = (provider: ProviderKey): LLMSession => ({
  sessionId: uid6(),
  provider,
  title: "",
  messages: [],
  isLoading: false,
  localInput: "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEDICAL_PREFIX =
  "You are a medical information assistant. Provide accurate, evidence-based clinical information. " +
  "Always recommend consulting a qualified healthcare professional for diagnosis or treatment decisions. ";

function buildQuestion(history: ConversationMessage[], newMessage: string, provider?: ProviderKey): string {
  const prior = history
    .filter((m) => !m.error)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");
  const prefix = provider === "medical" ? MEDICAL_PREFIX : "";
  const contextualMessage = prefix + newMessage;
  return prior
    ? `Previous conversation:\n${prior}\n\nUser: ${contextualMessage}`
    : contextualMessage;
}

function buildPayload(session: LLMSession, fullQuestion: string) {
  const prov = PROVIDERS[session.provider];
  const uid = localStorage.getItem("uid") ?? "";
  const base = { uid, question: fullQuestion, requestType: prov.requestType, model: prov.model };
  if (session.provider === "websearch") {
    return {
      uid, question: fullQuestion, response: "",
      timestamp: new Date().toISOString(),
      metadata: JSON.stringify({ source: "Multipart", sessionId: session.sessionId }),
      expectedtokens: 0, expectedcost: 0,
    };
  }
  if (session.provider === "superluna") {
    return {
      ...base,
      maxsearchengines: parseInt(localStorage.getItem("maxsearchengines") ?? "1"),
      chainsearch: parseInt(localStorage.getItem("chainsearch") ?? "0"),
    };
  }
  return base;
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, provColor }: { msg: ConversationMessage; provColor: string }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-3`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-slate-700 text-white rounded-br-sm"
            : msg.error
            ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
        }`}
        style={!isUser && !msg.error ? { borderLeftColor: provColor, borderLeftWidth: 3 } : {}}
      >
        {msg.error ? (
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <span>{msg.error}</span>
          </div>
        ) : (
          <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5 px-1">
        <span className="text-[10px] text-slate-400">{timeLabel(msg.timestamp)}</span>
        {msg.tokens != null && (
          <span className="text-[10px] text-slate-400">· {msg.tokens} tok</span>
        )}
        {msg.elapsedMs != null && (
          <span className="text-[10px] text-slate-400">· {(msg.elapsedMs / 1000).toFixed(2)}s</span>
        )}
      </div>
    </div>
  );
}

// ─── Session panel ────────────────────────────────────────────────────────────

interface SessionPanelProps {
  session: LLMSession;
  onUpdate: (id: string, patch: Partial<LLMSession>) => void;
  onRemove: (id: string) => void;
  onSend: (id: string, message: string) => void;
  totalSessions: number;
}

function SessionPanel({ session, onUpdate, onRemove, onSend, totalSessions }: SessionPanelProps) {
  const prov = PROVIDERS[session.provider];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages.length, session.isLoading]);

  const handleSend = () => {
    const msg = session.localInput.trim();
    if (!msg || session.isLoading) return;
    onUpdate(session.sessionId, { localInput: "" });
    onSend(session.sessionId, msg);
  };

  const userTurns = session.messages.filter((m) => m.role === "user").length;

  return (
    <Paper
      elevation={0}
      className="flex flex-col"
      sx={{
        border: "1.5px solid",
        borderColor: session.messages.length > 0 ? prov.color + "55" : "#e2e8f0",
        borderRadius: 2,
        overflow: "hidden",
        height: 520,
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <Box
        sx={{ backgroundColor: prov.bg, borderBottom: `1px solid ${prov.color}33`, px: 2, py: 1.25 }}
        className="flex items-center gap-2 shrink-0"
      >
        <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
          <Select
            value={session.provider}
            onChange={(e) => onUpdate(session.sessionId, { provider: e.target.value as ProviderKey })}
            disabled={session.messages.length > 0}
            sx={{
              fontSize: "0.78rem", fontWeight: 700, color: prov.color,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-icon": { color: prov.color },
              backgroundColor: "transparent",
            }}
          >
            {(Object.entries(PROVIDERS) as [ProviderKey, ProviderConfig][]).map(([key, p]) => (
              <MenuItem key={key} value={key}>
                <Box>
                  <Typography variant="body2" fontWeight={700} fontSize="0.78rem">{p.label}</Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{p.sublabel}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title={`Session ID: ${session.sessionId}`}>
          <Box className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-white border border-slate-200 shrink-0 cursor-default">
            <Hash size={9} />
            {session.sessionId}
          </Box>
        </Tooltip>

        {userTurns > 0 && (
          <Box className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
            <MessageSquare size={11} />
            {userTurns}
          </Box>
        )}

        {session.messages.length > 0 && (
          <Tooltip title="Clear conversation">
            <IconButton
              size="small"
              onClick={() => onUpdate(session.sessionId, { messages: [], title: "", isLoading: false })}
              sx={{ color: "#94a3b8", "&:hover": { color: "#d97706" } }}
            >
              <RotateCcw size={13} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Remove session">
          <span>
            <IconButton
              size="small"
              onClick={() => onRemove(session.sessionId)}
              disabled={totalSessions <= 1}
              sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
            >
              <Trash2 size={13} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Auto-title bar */}
      {session.title && (
        <Box className="px-3 py-1 shrink-0" sx={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
          <Typography variant="caption" color="text.secondary" className="italic truncate block">
            {session.title}
          </Typography>
        </Box>
      )}

      {/* Message thread */}
      <Box className="flex-1 overflow-y-auto px-3 py-3" sx={{ backgroundColor: "#f8fafc" }}>
        {session.messages.length === 0 && !session.isLoading && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            <MessageSquare size={28} strokeWidth={1.5} />
            <Typography variant="caption" textAlign="center" color="text.secondary">
              Start a conversation with {prov.label}.<br />
              Full history is sent with every message.
            </Typography>
          </div>
        )}

        {session.messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} provColor={prov.color} />
        ))}

        {session.isLoading && (
          <div className="flex items-start mb-3">
            <div
              className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white border text-sm text-slate-400 flex items-center gap-2"
              style={{ borderLeftColor: prov.color, borderLeftWidth: 3 }}
            >
              <CircularProgress size={12} sx={{ color: prov.color }} />
              {prov.label} is thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </Box>

      {/* Input area */}
      <Box
        className="shrink-0 px-3 py-2 flex gap-2 items-end"
        sx={{ borderTop: "1px solid #e2e8f0", backgroundColor: "white" }}
      >
        <textarea
          value={session.localInput}
          onChange={(e) => onUpdate(session.sessionId, { localInput: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Message ${prov.label}… (Ctrl+Enter)`}
          rows={2}
          disabled={session.isLoading}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 bg-white disabled:bg-slate-50 disabled:text-slate-400"
          style={{ fontFamily: "inherit", maxHeight: 80 }}
        />
        <Button
          variant="contained"
          size="small"
          disabled={session.isLoading || !session.localInput.trim()}
          onClick={handleSend}
          sx={{
            minWidth: 0, px: 1.5, py: 1, mb: 0.25,
            backgroundColor: prov.color,
            "&:hover": { backgroundColor: prov.color, filter: "brightness(0.9)" },
            "&.Mui-disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
          }}
        >
          {session.isLoading
            ? <CircularProgress size={14} sx={{ color: "white" }} />
            : <Send size={14} />
          }
        </Button>
      </Box>
    </Paper>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Multipart() {
  const [sessions, setSessions] = useState<LLMSession[]>([
    newSession("claude"),
    newSession("grok"),
  ]);
  const [globalInput, setGlobalInput] = useState("");
  const globalRef = useRef<HTMLTextAreaElement>(null);

  const updateSession = useCallback((id: string, patch: Partial<LLMSession>) => {
    setSessions((prev) => prev.map((s) => (s.sessionId === id ? { ...s, ...patch } : s)));
  }, []);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.sessionId !== id));
  }, []);

  const addSession = () => {
    const used = new Set(sessions.map((s) => s.provider));
    const next = (Object.keys(PROVIDERS) as ProviderKey[]).find((k) => !used.has(k)) ?? "websearch";
    setSessions((prev) => [...prev, newSession(next)]);
  };

  const sendMessage = useCallback((sessionId: string, userText: string) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.sessionId === sessionId);
      if (!session) return prev;

      const userMsg: ConversationMessage = {
        id: msgId(), role: "user", content: userText, timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...session.messages, userMsg];
      const title = session.title
        ? session.title
        : userText.length > 60 ? userText.slice(0, 57) + "…" : userText;

      const fullQuestion = buildQuestion(session.messages, userText, session.provider);
      const prov = PROVIDERS[session.provider];
      const payload = buildPayload(session, fullQuestion);
      const uid = localStorage.getItem("uid") ?? "";
      const sentAt = Date.now();

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
          const assistantMsg: ConversationMessage = {
            id: msgId(), role: "assistant",
            content: data.response ?? "(no response)",
            timestamp: new Date().toISOString(),
            tokens: data.expectedtokens,
            elapsedMs: Date.now() - sentAt,
          };
          setSessions((p) =>
            p.map((s) =>
              s.sessionId === sessionId
                ? { ...s, isLoading: false, messages: [...s.messages, assistantMsg] }
                : s
            )
          );
        })
        .catch((err) => {
          const errorMsg: ConversationMessage = {
            id: msgId(), role: "assistant", content: "",
            timestamp: new Date().toISOString(), error: err.message,
          };
          setSessions((p) =>
            p.map((s) =>
              s.sessionId === sessionId
                ? { ...s, isLoading: false, messages: [...s.messages, errorMsg] }
                : s
            )
          );
        });

      return prev.map((s) =>
        s.sessionId === sessionId
          ? { ...s, messages: updatedMessages, title, isLoading: true, localInput: "" }
          : s
      );
    });
  }, []);

  const sendToAll = () => {
    const text = globalInput.trim();
    if (!text) return;
    setGlobalInput("");
    sessions.filter((s) => !s.isLoading).forEach((s) => sendMessage(s.sessionId, text));
  };

  const clearAll = () => {
    setSessions((prev) => prev.map((s) => ({ ...s, messages: [], title: "", isLoading: false })));
  };

  const anyLoading = sessions.some((s) => s.isLoading);
  const anyMessages = sessions.some((s) => s.messages.length > 0);

  return (
    <div className="max-w-[1800px] mx-auto px-2 pb-8">
      {/* Header */}
      <Box className="flex items-center gap-3 mb-5">
        <GitFork size={38} className="text-slate-700" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">MultiLLM Compare</h1>
          <p className="text-slate-500 text-sm">
            Run independent conversations across multiple LLM providers simultaneously. Each session
            maintains its own history, sent in full with every request so the LLM retains context.
          </p>
        </div>
        {anyMessages && (
          <Tooltip title="Clear all conversations">
            <Button
              variant="outlined" size="small" onClick={clearAll}
              startIcon={<RotateCcw size={13} />}
              sx={{ borderColor: "#94a3b8", color: "#64748b", whiteSpace: "nowrap" }}
            >
              Clear All
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Global send bar */}
      <Paper elevation={0} sx={{ border: "1.5px solid #e2e8f0", borderRadius: 2, p: 2.5, mb: 4 }}>
        <Typography variant="subtitle2" fontWeight={700} className="mb-1">
          Send to All Sessions
        </Typography>
        <Typography variant="caption" color="text.secondary" className="block mb-2">
          Appends this message to every session and dispatches simultaneously. Each provider
          receives the full conversation history of that session plus this new message.
          The Medical Domain session automatically prepends a clinical context prefix to Claude.
        </Typography>
        <Box className="flex gap-2 items-end">
          <textarea
            ref={globalRef}
            value={globalInput}
            onChange={(e) => setGlobalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                sendToAll();
              }
            }}
            placeholder="Type a message to send to all sessions simultaneously… (Ctrl+Enter)"
            rows={2}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
            style={{ fontFamily: "inherit" }}
          />
          <Button
            variant="contained" onClick={sendToAll}
            disabled={anyLoading || !globalInput.trim()}
            startIcon={
              anyLoading
                ? <CircularProgress size={13} sx={{ color: "white" }} />
                : <Send size={14} />
            }
            sx={{
              backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" },
              "&.Mui-disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
              mb: 0.25, whiteSpace: "nowrap",
            }}
          >
            {anyLoading ? "Sending…" : `Send to All (${sessions.length})`}
          </Button>
        </Box>

        <Box className="flex items-center gap-2 mt-2 flex-wrap">
          {sessions.map((s) => {
            const turns = s.messages.filter((m) => m.role === "user").length;
            return (
              <Chip
                key={s.sessionId}
                label={
                  <span className="flex items-center gap-1">
                    <span style={{ color: PROVIDERS[s.provider].color }}>{PROVIDERS[s.provider].label}</span>
                    <span className="text-slate-400 font-mono text-[10px]">#{s.sessionId}</span>
                    {turns > 0 && <span className="text-slate-400">· {turns} turn{turns !== 1 ? "s" : ""}</span>}
                  </span>
                }
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  backgroundColor: PROVIDERS[s.provider].bg,
                  border: `1px solid ${PROVIDERS[s.provider].color}33`,
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Session grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            xl: sessions.length >= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {sessions.map((session) => (
          <SessionPanel
            key={session.sessionId}
            session={session}
            onUpdate={updateSession}
            onRemove={removeSession}
            onSend={sendMessage}
            totalSessions={sessions.length}
          />
        ))}

        {sessions.length < 6 && (
          <Paper
            elevation={0} onClick={addSession}
            sx={{
              border: "2px dashed #cbd5e1", borderRadius: 2,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 1, cursor: "pointer", height: 520,
              transition: "border-color 0.15s, background 0.15s",
              "&:hover": { borderColor: "#8B0000", backgroundColor: "#fff1f2" },
            }}
          >
            <Plus size={30} className="text-slate-400" />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Add Session</Typography>
            <Typography variant="caption" color="text.secondary">
              {6 - sessions.length} slot{6 - sessions.length !== 1 ? "s" : ""} remaining
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />
      <Box className="flex flex-wrap gap-6">
        <Box style={{ minWidth: 220, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} className="mb-1">Stateless LLMs — full history each turn</Typography>
          <Typography variant="caption" color="text.secondary" className="block leading-relaxed">
            Every provider receives a single formatted prompt containing the prior conversation
            followed by the new message. No session state is stored server-side — the client owns
            the history and reconstructs it on every request.
          </Typography>
        </Box>
        <Box style={{ minWidth: 220, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} className="mb-1">Provider lock after first message</Typography>
          <Typography variant="caption" color="text.secondary" className="block leading-relaxed">
            Switching providers mid-thread would send that conversation history to a model with no
            prior context, producing incoherent replies. The dropdown locks once a session starts.
            Use the reset button to start fresh on a different provider.
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
