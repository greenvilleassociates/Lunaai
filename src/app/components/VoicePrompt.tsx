import { useState, useRef } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MicIcon from "@mui/icons-material/Mic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import AudioFileIcon from "@mui/icons-material/AudioFile";

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  url: string;
  uploadedAt: string;
}

export function VoicePrompt() {
  const [uploadedFiles, setUploadedFiles] = useState<AudioFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: AudioFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if it's an audio file
      if (!file.type.startsWith("audio/")) {
        alert(`${file.name} is not an audio file`);
        continue;
      }

      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.src = url;

      // Wait for audio metadata to load to get duration
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          const audioFile: AudioFile = {
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            duration: audio.duration,
            url: url,
            uploadedAt: new Date().toLocaleString(),
          };
          newFiles.push(audioFile);
          resolve();
        };
      });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = (id: string, url: string) => {
    if (currentlyPlaying === id) {
      // Pause current
      audioRefs.current[id]?.pause();
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing audio
      if (currentlyPlaying) {
        audioRefs.current[currentlyPlaying]?.pause();
      }

      // Play new audio
      if (!audioRefs.current[id]) {
        const audio = new Audio(url);
        audio.onended = () => setCurrentlyPlaying(null);
        audioRefs.current[id] = audio;
      }
      audioRefs.current[id].play();
      setCurrentlyPlaying(id);
    }
  };

  const handleDelete = (id: string) => {
    // Stop audio if playing
    if (currentlyPlaying === id) {
      audioRefs.current[id]?.pause();
      setCurrentlyPlaying(null);
    }
    
    // Clean up audio element
    if (audioRefs.current[id]) {
      delete audioRefs.current[id];
    }

    // Remove from list
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmitToAI = () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one audio file first");
      return;
    }

    // Mock submission - in real app, would send to Azure API for transcription
    alert(`Submitting ${uploadedFiles.length} audio file(s) to LunaAI for processing...\n\nThe audio will be transcribed and sent to multiple AI providers (ChatGPT, Claude on Azure) for analysis.`);
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Voice Prompt Upload</h1>
          <p className="text-slate-600">
            Upload audio recordings to process through LunaAI's multi-provider AI orchestration platform
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-200 rounded-full">
              <MicIcon className="text-slate-600" style={{ fontSize: 48 }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Upload Voice Recordings
              </h3>
              <p className="text-slate-600 mb-4">
                Drag and drop audio files here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CloudUploadIcon />
                Select Audio Files
              </button>
              <p className="text-sm text-slate-500 mt-4">
                Supported formats: WAV, MP3, M4A, OGG, FLAC
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Uploaded Recordings ({uploadedFiles.length})
              </h2>
              <button
                onClick={handleSubmitToAI}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit to LunaAI
              </button>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded">
                      <AudioFileIcon className="text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {file.name}
                    </h3>
                    <div className="flex gap-4 text-sm text-slate-600 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span>Duration: {formatDuration(file.duration)}</span>
                      <span>Uploaded: {file.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlayPause(file.id, file.url)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title={currentlyPlaying === file.id ? "Pause" : "Play"}
                    >
                      {currentlyPlaying === file.id ? (
                        <PauseIcon />
                      ) : (
                        <PlayArrowIcon />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How it works</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Upload your audio recordings from Windows Sound Recordings or any location</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Preview and verify your recordings using the play button</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Click "Submit to LunaAI" to send your voice prompts for AI processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>LunaAI transcribes the audio and sends it to multiple AI providers (ChatGPT, Claude on Azure)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>Results are chained and delivered back to your desktop</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
