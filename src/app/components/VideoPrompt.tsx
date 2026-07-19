import { useState, useRef, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StopIcon from "@mui/icons-material/Stop";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { getApiUrl, API_CONFIG } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";
import { createVoiceToTextPayload } from "../utils/mediaTypeMapper";

interface VideoRecording {
  id: string;
  name: string;
  size: number;
  duration: number;
  url: string;
  blob: Blob;
  recordedAt: string;
  blobUrl?: string;
  uploading?: boolean;
  uploadError?: string;
  processing?: boolean;
}

export function VideoPrompt() {
  const [recordings, setRecordings] = useState<VideoRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (previewRef.current) previewRef.current.srcObject = stream;
      setCameraReady(true);
    } catch (err: any) {
      setCameraError(err.message || "Camera/microphone access denied.");
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm";
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => finalizeRecording(mimeType);
    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const finalizeRecording = (mimeType: string) => {
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const id = `vid-${Date.now()}`;
    const name = `video-short-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`;
    const tempVideo = document.createElement("video");
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setRecordings((prev) => [...prev, { id, name, size: blob.size, duration: tempVideo.duration || recordingSeconds, url, blob, recordedAt: new Date().toLocaleString() }]);
    };
    tempVideo.onerror = () => {
      setRecordings((prev) => [...prev, { id, name, size: blob.size, duration: recordingSeconds, url, blob, recordedAt: new Date().toLocaleString() }]);
    };
  };

  const togglePlay = (id: string) => {
    const el = videoRefs.current[id];
    if (!el) return;
    if (playingId === id) {
      el.pause();
      setPlayingId(null);
    } else {
      if (playingId && videoRefs.current[playingId]) videoRefs.current[playingId].pause();
      el.play();
      setPlayingId(id);
      el.onended = () => setPlayingId(null);
    }
  };

  const uploadToAzure = async (rec: VideoRecording) => {
    setRecordings((prev) => prev.map((r) => r.id === rec.id ? { ...r, uploading: true, uploadError: undefined } : r));
    const mimeType = rec.blob.type || "video/webm";
    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const file = new File([rec.blob], `${rec.name}.${ext}`, { type: mimeType });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mimeType);
    try {
      const apiUrl = getApiUrl(`/File/upload?fileCategory=videoinbound&mediaType=${encodeURIComponent(mimeType)}`);
      const response = await fetch(apiUrl, { method: "POST", headers: { ...getFileUploadHeaders() }, body: formData });
      if (!response.ok) throw new Error(`Upload failed: ${response.status} - ${await response.text()}`);
      const data = await response.json();
      setRecordings((prev) => prev.map((r) => r.id === rec.id ? { ...r, blobUrl: data.blobUrl, uploading: false } : r));
      const shouldCallAI = !API_CONFIG.BASE_URL.includes("localhost");
      if (shouldCallAI) {
        const aiUrl = getApiUrl(API_CONFIG.ENDPOINTS.AI_ACTIONS_VOICE("1"));
        const uid = localStorage.getItem("uid");
        const userid = localStorage.getItem("userid");
        const payload = createVoiceToTextPayload({ blobUrl: data.blobUrl, fileName: data.fileName || `${rec.name}.${ext}`, mimeType, userId: userid ? parseInt(userid) : 1, language: "english" });
        await fetch(aiUrl, { method: "POST", headers: { accept: "application/json", "Content-Type": "application/json", ...(uid && { Authorization: `Bearer ${uid}` }) }, body: JSON.stringify(payload) });
        setRecordings((prev) => prev.map((r) => r.id === rec.id ? { ...r, processing: true } : r));
      }
    } catch (err: any) {
      setRecordings((prev) => prev.map((r) => r.id === rec.id ? { ...r, uploadError: err.message, uploading: false } : r));
    }
  };

  const submitAll = async () => {
    const pending = recordings.filter((r) => !r.blobUrl && !r.uploading);
    await Promise.all(pending.map((r) => uploadToAzure(r)));
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <VideocamIcon sx={{ fontSize: 40 }} className="text-slate-700" />
        <div>
          <h1 className="text-3xl font-bold">Video Shorts</h1>
          <p className="text-slate-600 text-sm">Record a video — audio is extracted and processed by LunaAI</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl overflow-hidden mb-6 relative aspect-video max-h-72">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <VideocamOffIcon sx={{ fontSize: 48 }} className="text-slate-500" />
            <p className="text-slate-400 text-sm text-center px-4">{cameraError}</p>
            <button onClick={startCamera} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm transition-colors">Retry Camera</button>
          </div>
        ) : (
          <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        )}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
            <FiberManualRecordIcon sx={{ fontSize: 14 }} className="text-red-500 animate-pulse" />
            <span className="text-white text-sm font-mono">{formatTime(recordingSeconds)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        {!isRecording ? (
          <button onClick={startRecording} disabled={!cameraReady}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-full font-medium transition-colors shadow-lg">
            <FiberManualRecordIcon /> Start Recording
          </button>
        ) : (
          <button onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-medium transition-colors shadow-lg">
            <StopIcon /> Stop Recording
          </button>
        )}
        {recordings.some((r) => !r.blobUrl && !r.uploading) && (
          <button onClick={submitAll}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-lg">
            <CloudUploadIcon /> Upload All
          </button>
        )}
      </div>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Audio extraction:</strong> Video is uploaded to Azure as-is. The audio track is decoded server-side — the same pipeline used for voice prompts.
      </Alert>

      {recordings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Recorded Clips</h2>
          {recordings.map((rec) => (
            <div key={rec.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="flex gap-4 p-4">
                <div className="flex-shrink-0 w-40 h-24 bg-slate-900 rounded-lg overflow-hidden relative">
                  <video ref={(el) => { if (el) videoRefs.current[rec.id] = el; }} src={rec.url} className="w-full h-full object-cover" playsInline />
                  <button onClick={() => togglePlay(rec.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                    {playingId === rec.id ? <PauseIcon sx={{ color: "white", fontSize: 32 }} /> : <PlayArrowIcon sx={{ color: "white", fontSize: 32 }} />}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{rec.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{formatTime(Math.round(rec.duration))} • {formatSize(rec.size)} • {rec.recordedAt}</p>
                  {rec.blobUrl && <p className="text-green-600 text-xs mt-1">✓ Uploaded — audio extraction queued</p>}
                  {rec.processing && <p className="text-blue-600 text-xs mt-1">⚙ Processing audio...</p>}
                  {rec.uploadError && <p className="text-red-600 text-xs mt-1">✗ {rec.uploadError}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!rec.blobUrl && !rec.uploading && (
                    <button onClick={() => uploadToAzure(rec)} title="Upload to Azure"
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      <CloudUploadIcon fontSize="small" />
                    </button>
                  )}
                  {rec.uploading && <CircularProgress size={24} />}
                  <button onClick={() => setRecordings((prev) => prev.filter((r) => r.id !== rec.id))} title="Remove"
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
