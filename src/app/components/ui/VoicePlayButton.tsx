import { useState, useRef, useEffect } from "react";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { API_CONFIG, getApiUrl } from "../../config/api";

interface VoicePlayButtonProps {
  chatQueryId: number;
  text: string;
  uid?: string;
  voice?: string;
  size?: "small" | "medium";
  color?: string;
}

type Status = "idle" | "loading" | "playing" | "error";

export function VoicePlayButton({
  chatQueryId,
  text,
  uid,
  voice = "alloy",
  size = "small",
  color,
}: VoicePlayButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolvedUid = uid ?? localStorage.getItem("uid") ?? "";

  // Stop and clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = async () => {
    if (status === "playing") {
      audioRef.current?.pause();
      audioRef.current = null;
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Step 1: initiate TTS generation
      const initUrl = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_RESPONSE);
      const initResp = await fetch(initUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resolvedUid}`,
        },
        body: JSON.stringify({
          uid: resolvedUid,
          text,
          voice,
          chatQueryId,
        }),
      });

      if (!initResp.ok) {
        throw new Error(`VoiceResponse failed: ${initResp.status}`);
      }

      // Step 2: retrieve the completed blob URL
      const completeUrl = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_RESPONSE_COMPLETE);
      const completeResp = await fetch(completeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resolvedUid}`,
        },
        body: JSON.stringify({
          chatQueryId,
          blobUrl: "",
        }),
      });

      if (!completeResp.ok) {
        throw new Error(`VoiceResponse/Complete failed: ${completeResp.status}`);
      }

      const result: { chatQueryId: number; blobUrl: string } = await completeResp.json();

      if (!result.blobUrl) {
        throw new Error("No audio URL returned from server");
      }

      // Step 3: play the audio
      const audio = new Audio(result.blobUrl);
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        setStatus("idle");
      };
      audio.onerror = () => {
        audioRef.current = null;
        setStatus("error");
        setErrorMsg("Failed to load audio file");
      };

      await audio.play();
      setStatus("playing");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Voice playback failed";
      setErrorMsg(msg);
      setStatus("error");
      // Auto-reset error state after 4 seconds
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const iconSx = color ? { color } : {};

  if (status === "loading") {
    return (
      <Tooltip title="Generating audio…">
        <span>
          <IconButton size={size} disabled>
            <CircularProgress size={size === "small" ? 14 : 18} sx={iconSx} />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  if (status === "error") {
    return (
      <Tooltip title={errorMsg || "Voice playback failed"}>
        <IconButton size={size} onClick={() => setStatus("idle")} sx={{ color: "#dc3545" }}>
          <ErrorOutlineIcon fontSize={size} />
        </IconButton>
      </Tooltip>
    );
  }

  if (status === "playing") {
    return (
      <Tooltip title="Stop playback">
        <IconButton size={size} onClick={handlePlay} sx={{ color: "#28a745", ...iconSx }}>
          <StopIcon fontSize={size} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Play response as audio">
      <IconButton size={size} onClick={handlePlay} sx={iconSx}>
        <VolumeUpIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}
