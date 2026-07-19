import { useState, useRef, useEffect } from "react";
import { CircularProgress, Alert, Chip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import { getApiUrl, API_CONFIG } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";

interface VisualCapture {
  id: string;
  name: string;
  size: number;
  url: string;
  blob: Blob;
  capturedAt: string;
  blobUrl?: string;
  uploading?: boolean;
  uploadError?: string;
  processing?: boolean;
}

export function VisualPrompt() {
  const [captures, setCaptures] = useState<VisualCapture[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [tab, setTab] = useState<"camera" | "upload">("camera");

  // Device selection
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>("");

  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (tab === "camera") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [tab, facingMode]);

  const startCamera = async (videoId?: string) => {
    stopCamera();
    setCameraError(null);
    try {
      const videoConstraint = videoId
        ? { deviceId: { exact: videoId } }
        : { facingMode };
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: false,
      });
      streamRef.current = stream;
      if (previewRef.current) previewRef.current.srcObject = stream;
      setCameraReady(true);
      // Re-enumerate after permission to get labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter(d => d.kind === "videoinput");
      setVideoDevices(vids);
      if (!videoId && vids.length) setSelectedVideoDeviceId(vids[0].deviceId);
    } catch (err: any) {
      setCameraError(err.message || "Camera access denied.");
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const handleVideoDeviceChange = (deviceId: string) => {
    setSelectedVideoDeviceId(deviceId);
    startCamera(deviceId);
  };

  const handleFlip = () => {
    setSelectedVideoDeviceId("");
    setFacingMode(m => m === "user" ? "environment" : "user");
  };

  const capturePhoto = () => {
    const video = previewRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const id = `img-${Date.now()}`;
      const name = `visual-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`;
      const url = URL.createObjectURL(blob);
      setCaptures(prev => [...prev, { id, name, size: blob.size, url, blob, capturedAt: new Date().toLocaleString() }]);
    }, "image/jpeg", 0.92);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setCaptures(prev => [...prev, { id: `img-${Date.now()}-${Math.random()}`, name: file.name, size: file.size, url, blob: file, capturedAt: new Date().toLocaleString() }]);
    });
  };

  const uploadToAzure = async (cap: VisualCapture) => {
    setCaptures(prev => prev.map(c => c.id === cap.id ? { ...c, uploading: true, uploadError: undefined } : c));
    const mimeType = cap.blob.type || "image/jpeg";
    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const file = new File([cap.blob], `${cap.name}.${ext}`, { type: mimeType });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mimeType);
    try {
      const apiUrl = getApiUrl(`/File/upload?fileCategory=visualinbound&mediaType=${encodeURIComponent(mimeType)}`);
      const response = await fetch(apiUrl, { method: "POST", headers: { ...getFileUploadHeaders() }, body: formData });
      if (!response.ok) { const text = await response.text(); throw new Error(`Upload failed: ${response.status} - ${text}`); }
      const data = await response.json();
      setCaptures(prev => prev.map(c => c.id === cap.id ? { ...c, blobUrl: data.blobUrl, uploading: false, processing: true } : c));
      if (!API_CONFIG.BASE_URL.includes("localhost")) {
        const uid = localStorage.getItem("uid");
        const userid = localStorage.getItem("userid");
        const aiUrl = getApiUrl("/aiactions/vision/1");
        await fetch(aiUrl, { method: "POST", headers: { accept: "application/json", "Content-Type": "application/json", ...(uid && { Authorization: `Bearer ${uid}` }) }, body: JSON.stringify({ blobUrl: data.blobUrl, fileName: data.fileName || `${cap.name}.${ext}`, mimeType, userId: userid ? parseInt(userid) : 1 }) }).catch(() => {});
      }
    } catch (err: any) {
      setCaptures(prev => prev.map(c => c.id === cap.id ? { ...c, uploadError: err.message, uploading: false } : c));
    }
  };

  const uploadAll = async () => {
    const pending = captures.filter(c => !c.blobUrl && !c.uploading);
    await Promise.all(pending.map(c => uploadToAzure(c)));
  };

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon sx={{ fontSize: 40 }} className="text-slate-700" />
        <div>
          <h1 className="text-3xl font-bold">Visual Prompts</h1>
          <p className="text-slate-600 text-sm">Capture or upload images for AI visual analysis via LunaAI</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("camera")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "camera" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}>
          <CameraAltIcon fontSize="small" /> Camera
        </button>
        <button onClick={() => setTab("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "upload" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}>
          <PhotoLibraryIcon fontSize="small" /> Upload
        </button>
      </div>

      {/* Camera device selector */}
      {tab === "camera" && videoDevices.length > 1 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <VideocamIcon sx={{ fontSize: 18 }} className="text-slate-500 flex-shrink-0" />
          <select
            value={selectedVideoDeviceId}
            onChange={e => handleVideoDeviceChange(e.target.value)}
            className="flex-1 text-sm bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {videoDevices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {tab === "camera" && (
        <div className="mb-6">
          <div className="bg-slate-900 rounded-xl overflow-hidden relative aspect-video max-h-72 mb-4">
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <CameraAltIcon sx={{ fontSize: 48 }} className="text-slate-500" />
                <p className="text-slate-400 text-sm text-center px-4">{cameraError}</p>
                <button onClick={() => startCamera()} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm">Retry Camera</button>
              </div>
            ) : (
              <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            )}
            {/* Flip camera — shown only when no explicit device selected (mobile) */}
            {cameraReady && videoDevices.length <= 1 && (
              <button onClick={handleFlip}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                title="Flip camera">
                <FlipCameraIosIcon fontSize="small" />
              </button>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex justify-center">
            <button onClick={capturePhoto} disabled={!cameraReady}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-full font-medium transition-colors shadow-lg">
              <CameraAltIcon /> Capture Photo
            </button>
          </div>
        </div>
      )}

      {tab === "upload" && (
        <div className="mb-6">
          <div onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl p-12 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100">
            <PhotoLibraryIcon sx={{ fontSize: 48 }} className="text-slate-400 mb-3" />
            <p className="text-slate-700 font-medium mb-1">Click to select images</p>
            <p className="text-slate-500 text-sm">JPG, PNG, WEBP, GIF supported</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
        </div>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Visual AI:</strong> Images are uploaded to Azure and processed through the LunaAI vision pipeline for analysis, classification, and description.
      </Alert>

      {captures.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Captured Images ({captures.length})</h2>
            {captures.some(c => !c.blobUrl && !c.uploading) && (
              <button onClick={uploadAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                <CloudUploadIcon fontSize="small" /> Upload All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {captures.map(cap => (
              <div key={cap.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="relative aspect-square bg-slate-100">
                  <img src={cap.url} alt={cap.name} className="w-full h-full object-cover" />
                  {cap.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <CircularProgress size={28} sx={{ color: "white" }} />
                    </div>
                  )}
                  {cap.blobUrl && (
                    <div className="absolute top-2 right-2">
                      <Chip label="✓ Uploaded" size="small" sx={{ backgroundColor: "#16a34a", color: "white", fontSize: "10px" }} />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-500 truncate mb-1">{formatSize(cap.size)}</p>
                  {cap.uploadError && <p className="text-xs text-red-600 mb-1">✗ {cap.uploadError}</p>}
                  {cap.processing && <p className="text-xs text-blue-600 mb-1">⚙ Analyzing...</p>}
                  <div className="flex gap-1">
                    {!cap.blobUrl && !cap.uploading && (
                      <button onClick={() => uploadToAzure(cap)}
                        className="flex-1 flex items-center justify-center gap-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors">
                        <CloudUploadIcon sx={{ fontSize: 14 }} /> Upload
                      </button>
                    )}
                    <button onClick={() => setCaptures(prev => prev.filter(c => c.id !== cap.id))}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
