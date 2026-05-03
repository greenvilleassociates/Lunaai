import { useState, useRef } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import { CircularProgress } from "@mui/material";
import { getApiUrl, API_CONFIG } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";
import { mapToSupportedMediaType, createVoiceToTextPayload } from "../utils/mediaTypeMapper";

interface UploadedRecording {
  id: string;
  name: string;
  size: number;
  duration: number;
  url: string;
  blob: Blob;               // ⭐ FIX: Store actual Blob
  uploadedAt: string;
  blobUrl?: string;
  uploading?: boolean;
  uploadError?: string;
  processing?: boolean;
}

export default function VoicePrompt() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedRecording[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedRecording[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const url = URL.createObjectURL(file);
      const audio = new Audio(url);

      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          newFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            duration: audio.duration,
            url,
            blob: file,                     // ⭐ FIX: Store actual File/Blob
            uploadedAt: new Date().toLocaleString(),
          });
          resolve();
        };
      });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const togglePlayPause = (id: string, url: string) => {
    if (currentlyPlaying === id) {
      audioRefs.current[id]?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        audioRefs.current[currentlyPlaying]?.pause();
      }
      if (!audioRefs.current[id]) {
        const audio = new Audio(url);
        audio.onended = () => setCurrentlyPlaying(null);
        audioRefs.current[id] = audio;
      }
      audioRefs.current[id].play();
      setCurrentlyPlaying(id);
    }
  };

  const uploadFileToAzure = async (recording: UploadedRecording) => {
    if (!recording.blob) return;

    setUploadedFiles((prev) =>
      prev.map((r) =>
        r.id === recording.id ? { ...r, uploading: true, uploadError: undefined } : r
      )
    );

    const blobType = recording.blob.type || "audio/wav";

    // ⭐ FIX: Force WAV mediaType when possible
    const supportedMediaType =
      blobType.includes("wav") ? "audio/wav" : mapToSupportedMediaType(blobType);

    const fileExtension = blobType.includes("wav") ? "wav" : "webm";

    const file = new File([recording.blob], `${recording.name}.${fileExtension}`, {
      type: blobType,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", supportedMediaType);

    try {
      const apiUrl = getApiUrl(
        `/File/upload?fileCategory=voiceinbound&mediaType=${encodeURIComponent(
          supportedMediaType
        )}`
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { ...getFileUploadHeaders() },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${text}`);
      }

      const data = await response.json();

      setUploadedFiles((prev) =>
        prev.map((r) =>
          r.id === recording.id
            ? { ...r, blobUrl: data.blobUrl, uploading: false }
            : r
        )
      );

      // ⭐ AI Actions
      const shouldCallAIActions = !API_CONFIG.BASE_URL.includes("localhost");

      if (shouldCallAIActions) {
        const aiUrl = getApiUrl(API_CONFIG.ENDPOINTS.AI_ACTIONS_VOICE("1"));
        const uid = localStorage.getItem("uid");
        const userid = localStorage.getItem("userid");

        const payload = createVoiceToTextPayload({
          blobUrl: data.blobUrl,
          fileName: data.fileName || `${recording.name}.${fileExtension}`,
          mimeType: blobType,
          userId: userid ? parseInt(userid) : 1,
          language: "english",
        });

        await fetch(aiUrl, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            ...(uid && { Authorization: `Bearer ${uid}` }),
          },
          body: JSON.stringify(payload),
        });

        setUploadedFiles((prev) =>
          prev.map((r) =>
            r.id === recording.id ? { ...r, processing: true } : r
          )
        );
      }
    } catch (err: any) {
      setUploadedFiles((prev) =>
        prev.map((r) =>
          r.id === recording.id
            ? { ...r, uploadError: err.message, uploading: false }
            : r
        )
      );
    }
  };

  const handleSubmitToAI = async () => {
    const toUpload = uploadedFiles.filter((f) => !f.blobUrl && !f.uploading);

    await Promise.all(toUpload.map((f) => uploadFileToAzure(f)));

    alert("Your recordings are being processed by LunaAI.");
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Voice Prompts</h1>

        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border"
              >
                <AudioFileIcon />

                <div className="flex-1">
                  <div className="font-semibold">{file.name}</div>
                  <div className="text-sm text-slate-600">
                    Duration: {file.duration.toFixed(1)}s
                  </div>

                  {file.blobUrl && (
                    <div className="text-green-600 text-xs">
                      ✓ Uploaded: {file.blobUrl}
                    </div>
                  )}

                  {file.uploadError && (
                    <div className="text-red-600 text-xs">
                      ✗ {file.uploadError}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => togglePlayPause(file.id, file.url)}
                  className="p-2 bg-blue-600 text-white rounded"
                >
                  {currentlyPlaying === file.id ? <PauseIcon /> : <PlayArrowIcon />}
                </button>

                {!file.blobUrl && !file.uploading && (
                  <button
                    onClick={() => uploadFileToAzure(file)}
                    className="p-2 bg-green-600 text-white rounded"
                  >
                    <CloudUploadIcon />
                  </button>
                )}

                {file.uploading && <CircularProgress size={24} />}

                <button
                  onClick={() =>
                    setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))
                  }
                  className="p-2 bg-red-600 text-white rounded"
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <button
            onClick={handleSubmitToAI}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Submit All to LunaAI
          </button>
        )}
      </div>
    </div>
  );
}