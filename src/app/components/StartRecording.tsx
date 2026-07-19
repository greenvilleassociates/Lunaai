import { useState, useRef, useEffect } from "react";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InfoIcon from "@mui/icons-material/Info";
import { CircularProgress, Chip } from "@mui/material";
import { getApiUrl, API_CONFIG } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";
import { getBestAudioFormat, detectPlatform, type AudioFormatConfig } from "../utils/audioFormatDetection";
import { createVoiceToTextPayload, mapToSupportedMediaType } from "../utils/mediaTypeMapper";

interface Recording {
  id: string;
  name: string;
  url: string;
  duration: number;
  createdAt: string;
  blob: Blob;
  blobUrl?: string;
  uploading?: boolean;
  uploadError?: string;
  processing?: boolean;
}

const encodeWav = (samples: Float32Array, sampleRate = 16000) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: "audio/wav" });
};

export function StartRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [currentFormat, setCurrentFormat] = useState<AudioFormatConfig | null>(null);
  const [settingsFormat, setSettingsFormat] = useState<AudioFormatConfig | null>(null);
  const [platformInfo, setPlatformInfo] = useState<ReturnType<typeof detectPlatform> | null>(null);

  // Device selection — initialized from Settings hardware defaults
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>(() => localStorage.getItem("defaultAudioDeviceId") || "");

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const wavBufferRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioURL) return;
    const player = audioPlayerRef.current;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.src = audioURL;
      player.play();
      setIsPlaying(true);
      player.onended = () => setIsPlaying(false);
    }
  };

  const applyFormatFromSettings = () => {
    const userPreference = localStorage.getItem("voiceEncodingFormat") || "wav-16khz";
    if (!localStorage.getItem("voiceEncodingFormat")) localStorage.setItem("voiceEncodingFormat", "wav-16khz");
    const bestFormat = getBestAudioFormat(userPreference);
    setCurrentFormat(bestFormat);
    const preferenceLabels: Record<string, AudioFormatConfig> = {
      "wav-16khz": { mimeType: "audio/wav", fileExtension: "wav", description: "WAV/PCM 16kHz (Settings)", quality: "Lossless" },
      "wav-8khz": { mimeType: "audio/wav", fileExtension: "wav", description: "WAV/PCM 8kHz (Settings)", quality: "Medium" },
      mp3: { mimeType: "audio/mpeg", fileExtension: "mp3", description: "MP3 (Settings)", quality: "Medium" },
      wma: { mimeType: "audio/x-ms-wma", fileExtension: "wma", description: "WMA (Settings)", quality: "Medium" },
      webm: { mimeType: "audio/webm;codecs=opus", fileExtension: "webm", description: "WebM (Settings)", quality: "High" },
    };
    setSettingsFormat(preferenceLabels[userPreference] || bestFormat);
  };

  const refreshAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const auds = devices.filter(d => d.kind === "audioinput");
      setAudioDevices(auds);
      return auds;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const platform = detectPlatform();
    setPlatformInfo(platform);
    applyFormatFromSettings();
    // Pre-enumerate (labels may be empty before permission)
    refreshAudioDevices();
    const stored = localStorage.getItem("recordings");
    if (stored) { try { setRecordings(JSON.parse(stored)); } catch {} }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async (audioId?: string) => {
    try {
      setPermissionError(null);
      setPendingBlob(null);
      setAudioURL(null);
      wavBufferRef.current = [];

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      const audioConstraint = audioId
        ? { deviceId: { exact: audioId } }
        : true;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint });
      streamRef.current = stream;

      // Re-enumerate after permission to get labels
      const auds = await refreshAudioDevices();
      if (!audioId && auds.length) setSelectedAudioDeviceId(auds[0].deviceId);

      inputRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current.onaudioprocess = e => {
        const input = e.inputBuffer.getChannelData(0);
        wavBufferRef.current.push(new Float32Array(input));
      };
      inputRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (error: any) {
      setPermissionError("Unable to access microphone: " + error.message);
    }
  };

  const handleAudioDeviceChange = (deviceId: string) => {
    setSelectedAudioDeviceId(deviceId);
    if (isRecording) stopRecording().then(() => startRecording(deviceId));
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    if (processorRef.current) processorRef.current.disconnect();
    if (inputRef.current) inputRef.current.disconnect();
    if (audioContextRef.current) await audioContextRef.current.close();
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    const merged = new Float32Array(wavBufferRef.current.reduce((acc, cur) => acc + cur.length, 0));
    let offset = 0;
    for (const chunk of wavBufferRef.current) { merged.set(chunk, offset); offset += chunk.length; }
    const wavBlob = encodeWav(merged, 16000);
    const blobUrl = URL.createObjectURL(wavBlob);
    setPendingBlob(wavBlob);
    setAudioURL(blobUrl);
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const saveRecording = () => {
    if (!audioURL || !pendingBlob) return;
    const recording: Recording = { id: Date.now().toString(), name: `Recording ${new Date().toLocaleString()}`, url: audioURL, duration: recordingTime, createdAt: new Date().toLocaleString(), blob: pendingBlob };
    setRecordings(prev => { const updated = [...prev, recording]; localStorage.setItem("recordings", JSON.stringify(updated)); return updated; });
    setPendingBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    setIsPlaying(false);
  };

  const discardRecording = () => {
    setPendingBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    setIsPlaying(false);
  };

  const pauseRecording = () => {
    if (!isRecording || isPaused) return;
    setIsPaused(true);
    if (processorRef.current) processorRef.current.disconnect();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    if (!isRecording || !isPaused) return;
    setIsPaused(false);
    if (processorRef.current && audioContextRef.current && inputRef.current) {
      inputRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    }
    timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => { const updated = prev.filter(rec => rec.id !== id); localStorage.setItem("recordings", JSON.stringify(updated)); return updated; });
  };

  const uploadFileToAzure = async (recording: Recording, fileCategory = "voiceinbound") => {
    if (!recording.blob) return;
    setRecordings(prev => prev.map(r => r.id === recording.id ? { ...r, uploading: true, uploadError: undefined } : r));
    const blobType = "audio/wav";
    const fileExtension = "wav";
    const supportedMediaType = mapToSupportedMediaType(blobType);
    const file = new File([recording.blob], `${recording.name}.${fileExtension}`, { type: blobType });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", supportedMediaType);
    try {
      const apiUrl = getApiUrl(`/File/upload?fileCategory=${fileCategory}&mediaType=${encodeURIComponent(supportedMediaType)}`);
      const uploadAbort = new AbortController();
      const uploadTimeout = setTimeout(() => uploadAbort.abort(), 30000);
      const response = await fetch(apiUrl, { method: "POST", headers: { ...getFileUploadHeaders() }, body: formData, signal: uploadAbort.signal });
      clearTimeout(uploadTimeout);
      if (!response.ok) { const errorText = await response.text(); throw new Error(`Upload failed: ${response.status} - ${errorText}`); }
      const data = await response.json();
      setRecordings(prev => { const updated = prev.map(r => r.id === recording.id ? { ...r, blobUrl: data.blobUrl, uploading: false, uploadError: undefined } : r); localStorage.setItem("recordings", JSON.stringify(updated)); return updated; });
      const shouldCallAIActions = !API_CONFIG.BASE_URL.includes("localhost");
      if (shouldCallAIActions) {
        try {
          const aiActionsUrl = getApiUrl(API_CONFIG.ENDPOINTS.AI_ACTIONS_VOICE("1"));
          const uid = localStorage.getItem("uid");
          const userid = localStorage.getItem("userid");
          const aiActionsPayload = createVoiceToTextPayload({ blobUrl: data.blobUrl, fileName: data.fileName || `${recording.name}.${fileExtension}`, mimeType: blobType, userId: userid ? parseInt(userid) : 1, language: "english" });
          const aiAbort = new AbortController();
          const aiTimeout = setTimeout(() => aiAbort.abort(), 15000);
          await fetch(aiActionsUrl, { method: "POST", headers: { accept: "application/json", "Content-Type": "application/json", ...(uid && { Authorization: `Bearer ${uid}` }) }, body: JSON.stringify(aiActionsPayload), signal: aiAbort.signal });
          clearTimeout(aiTimeout);
        } catch {}
      }
      setRecordings(prev => { const updated = prev.map(r => r.id === recording.id ? { ...r, processing: true } : r); localStorage.setItem("recordings", JSON.stringify(updated)); return updated; });
      try {
        const uid = localStorage.getItem("uid");
        const username = localStorage.getItem("username");
        const voiceCommandUrl = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_COMMANDS);
        await fetch(voiceCommandUrl, { method: "POST", headers: { "Content-Type": "application/json", ...getFileUploadHeaders() }, body: JSON.stringify({ commandType: recording.name, voiceBlobURL: data.blobUrl, actionTime: new Date().toISOString(), actionType: 1, status: "queued", useridstring: uid, userid: null, displayname: username }) });
      } catch {
        const voiceCommands = JSON.parse(localStorage.getItem("voiceCommands") || "[]");
        voiceCommands.push({ id: Date.now(), commandType: recording.name, voiceBlobURL: data.blobUrl, actionTime: new Date().toISOString(), actionType: 1, status: "queued", useridstring: localStorage.getItem("uid"), userid: null, displayname: localStorage.getItem("username") });
        localStorage.setItem("voiceCommands", JSON.stringify(voiceCommands));
      }
    } catch (error: any) {
      const errorMessage = error?.name === "AbortError" ? "Upload timed out — please try again" : error instanceof Error ? error.message : "Upload failed";
      setRecordings(prev => { const updated = prev.map(r => r.id === recording.id ? { ...r, uploadError: errorMessage, uploading: false } : r); localStorage.setItem("recordings", JSON.stringify(updated)); return updated; });
    }
  };

  const submitToAI = async () => {
    const recordingsToUpload = recordings.filter(r => !r.blobUrl && !r.uploading);
    if (recordingsToUpload.length > 0) await Promise.all(recordingsToUpload.map(r => uploadFileToAzure(r, "voiceinbound")));
    setTimeout(() => {
      const uploadedCount = recordings.filter(r => r.blobUrl).length;
      alert(`Processing ${uploadedCount} recording(s) through LunaAI...\n\n1. ✓ Files uploaded to Azure\n2. → Transcribing audio\n3. → Sending to AI providers\n4. → Delivering results to your desktop`);
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-full">
      <audio ref={audioPlayerRef} style={{ display: "none" }} />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Start Recording</h1>
          <p className="text-slate-600">Record audio prompts directly in your browser using your microphone</p>
        </div>

        {/* Microphone device selector */}
        {audioDevices.length > 1 && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
            <MicIcon sx={{ fontSize: 18 }} className="text-slate-500 flex-shrink-0" />
            <select
              value={selectedAudioDeviceId}
              onChange={e => handleAudioDeviceChange(e.target.value)}
              className="flex-1 text-sm bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {audioDevices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${i + 1}`}
                </option>
              ))}
            </select>
            {isRecording && <span className="text-xs text-amber-600 flex-shrink-0">Switching will restart recording</span>}
          </div>
        )}

        {/* Recording Interface */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md">
              {isRecording ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                  <FiberManualRecordIcon className="text-red-600 animate-pulse" />
                  <span className="text-lg font-semibold text-red-600">{isPaused ? "PAUSED" : "RECORDING"}</span>
                  <span className="text-2xl font-mono text-red-600">{formatTime(recordingTime)}</span>
                </div>
              ) : audioURL ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <AudioFileIcon className="text-green-600" />
                  <span className="text-lg font-semibold text-green-600">Recording Complete</span>
                  <span className="text-xl font-mono text-green-600">{formatTime(recordingTime)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
                  <MicIcon className="text-slate-600" />
                  <span className="text-lg font-semibold text-slate-600">Ready to Record</span>
                </div>
              )}
            </div>

            <div className={`p-8 rounded-full transition-all ${
              isRecording && !isPaused ? "bg-red-200 animate-pulse" : isRecording && isPaused ? "bg-yellow-200" : "bg-slate-200"
            }`}>
              <MicIcon className={isRecording && !isPaused ? "text-red-600" : "text-slate-600"} style={{ fontSize: 80 }} />
            </div>

            <div className="flex gap-4">
              {!isRecording && !audioURL && (
                <button onClick={() => startRecording(selectedAudioDeviceId || undefined)}
                  className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold">
                  <MicIcon /> Start Recording
                </button>
              )}
              {isRecording && (
                <>
                  <button onClick={isPaused ? resumeRecording : pauseRecording}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-4 rounded-lg hover:bg-yellow-700 transition-colors">
                    {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button onClick={stopRecording}
                    className="flex items-center gap-2 bg-slate-600 text-white px-6 py-4 rounded-lg hover:bg-slate-700 transition-colors">
                    <StopIcon /> Stop
                  </button>
                </>
              )}
              {audioURL && !isRecording && (
                <>
                  <button onClick={togglePlayback}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors">
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button onClick={saveRecording}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors">
                    <SaveIcon /> Save
                  </button>
                  <button onClick={discardRecording}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors">
                    <DeleteIcon /> Discard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Saved Recordings */}
        {recordings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Saved Recordings ({recordings.length})</h2>
              <button onClick={submitToAI} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">Submit to LunaAI</button>
            </div>
            <div className="space-y-3">
              {recordings.map(recording => (
                <div key={recording.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="p-2 bg-blue-100 rounded"><AudioFileIcon className="text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{recording.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-slate-600 mt-1">
                      <div className="flex gap-4">
                        <span>Duration: {formatTime(recording.duration)}</span>
                        <span>Created: {recording.createdAt}</span>
                      </div>
                      {recording.blobUrl && <a href={recording.blobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate">✓ Stored in Azure: {recording.blobUrl}</a>}
                      {recording.processing && <span className="text-green-600 text-xs font-semibold">🤖 Queued for AI processing</span>}
                      {recording.uploadError && <span className="text-red-600 text-xs">✗ Upload failed: {recording.uploadError}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {recording.uploading && <CircularProgress size={24} className="text-blue-600" />}
                    {recording.blobUrl && <div className="p-2 bg-green-100 rounded"><CheckCircleIcon className="text-green-600" /></div>}
                    {!recording.uploading && !recording.blobUrl && (
                      <button onClick={() => uploadFileToAzure(recording, "voiceinbound")} className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors text-sm">
                        <CloudUploadIcon fontSize="small" />
                      </button>
                    )}
                    <button onClick={() => deleteRecording(recording.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform & Format Info */}
        {platformInfo && (settingsFormat || currentFormat) && (
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <InfoIcon className="text-slate-700" />
              <h3 className="font-semibold text-slate-900">Recording Configuration</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Platform Detected</p>
                <div className="flex gap-2 flex-wrap">
                  <Chip label={platformInfo.os.toUpperCase()} size="small" color="primary" variant="outlined" />
                  <Chip label={platformInfo.browser.toUpperCase()} size="small" color="primary" variant="outlined" />
                  {platformInfo.isMobile && <Chip label="MOBILE" size="small" color="secondary" variant="outlined" />}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Audio Format</p>
                <div className="flex gap-2 flex-wrap">
                  <Chip label={(settingsFormat || currentFormat)!.description} size="small" color="success" />
                  <Chip label={`Quality: ${(settingsFormat || currentFormat)!.quality}`} size="small" variant="outlined" />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{(settingsFormat || currentFormat)!.mimeType}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">Audio format configured in Settings. Change format in Settings page.</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Browser-Based Recording</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2"><span className="font-bold">•</span><span>This recorder works directly in your browser — no external apps needed</span></li>
            <li className="flex items-start gap-2"><span className="font-bold">•</span><span>Your browser will ask for microphone permission on first use</span></li>
            <li className="flex items-start gap-2"><span className="font-bold">•</span><span>If multiple microphones are detected, a device selector will appear above</span></li>
            <li className="flex items-start gap-2"><span className="font-bold">•</span><span>Preview your recording before saving it</span></li>
            <li className="flex items-start gap-2"><span className="font-bold">•</span><span>Save multiple recordings and submit them all to LunaAI for processing</span></li>
          </ul>
        </div>

        {permissionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-red-900 mb-3">🎤 Microphone Permission Required</h3>
            <p className="text-red-800 whitespace-pre-line mb-4">{permissionError}</p>
            <button onClick={() => startRecording(selectedAudioDeviceId || undefined)}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
              <MicIcon /> Retry — Request Microphone Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
