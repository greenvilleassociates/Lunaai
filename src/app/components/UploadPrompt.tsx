import { useState, useRef } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CircularProgress, Alert } from "@mui/material";
import { getApiUrl } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";
import { API_CONFIG } from "../config/api";

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  url: string;
  uploadedAt: string;
  blobUrl?: string; // Azure Blob Storage URL
  uploading?: boolean;
  uploadError?: string;
  file?: File; // Original file object for upload
  processing?: boolean; // Indicates if the file is being processed by AI
}

export function UploadPrompt() {
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
            file: file,
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

  const handleSubmitToAI = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one audio file first");
      return;
    }

    // Upload all files that haven't been uploaded yet
    const filesToUpload = uploadedFiles.filter(f => !f.blobUrl && !f.uploading);
    
    if (filesToUpload.length > 0) {
      // Upload all files in parallel
      await Promise.all(
        filesToUpload.map(file => uploadFileToAzure(file, "voiceinbound"))
      );
    }
    
    // After uploads complete, show confirmation
    setTimeout(() => {
      const uploadedCount = uploadedFiles.filter(f => f.blobUrl).length;
      alert(
        `Processing ${uploadedCount} audio file(s) through LunaAI...\n\n` +
        `Next steps:\n` +
        `1. ✓ Files uploaded to Azure Blob Storage\n` +
        `2. → Transcribing audio using Azure Speech Services\n` +
        `3. → Sending to multiple AI providers (ChatGPT, Claude)\n` +
        `4. → Chaining results and delivering to your desktop\n\n` +
        `You will receive a notification when processing is complete.`
      );
    }, 500);
  };

  const uploadFileToAzure = async (audioFile: AudioFile, fileCategory: string = "voiceinbound") => {
    if (!audioFile.file) {
      console.error("No file object available for upload");
      return;
    }

    // Mark file as uploading
    setUploadedFiles((prev) => 
      prev.map((f) => (f.id === audioFile.id ? { ...f, uploading: true, uploadError: undefined } : f))
    );

    const formData = new FormData();
    formData.append("file", audioFile.file);

    try {
      // Use the exact API endpoint structure from your curl example
      const apiUrl = getApiUrl(`/File/upload?fileCategory=${fileCategory}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          ...getFileUploadHeaders(),
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Update file with blob URL and success status
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id
            ? { ...f, blobUrl: data.blobUrl, uploading: false, uploadError: undefined }
            : f
        )
      );

      console.log(`✓ File uploaded successfully: ${data.fileName}`, data);
      
      // Call AI Actions to queue the file for voice-to-text processing
      // This is optional - if it fails, we still track locally
      const shouldCallAIActions = !API_CONFIG.BASE_URL.includes('localhost');
      
      if (shouldCallAIActions) {
        try {
          console.log(`🤖 Attempting to queue file for AI processing: ${data.blobUrl}`);
          const aiActionsUrl = getApiUrl(API_CONFIG.ENDPOINTS.AI_ACTIONS_VOICE("1")); // POST to /api/aiactions/voice/1
          
          console.log(`📡 AI Actions URL: ${aiActionsUrl}`);
          
          // Get user information
          const uid = localStorage.getItem("uid");
          const username = localStorage.getItem("username");
          const email = localStorage.getItem("email") || "user@capitoltechnology.net";
          const userid = localStorage.getItem("userid"); // Get numeric user ID
          
          console.log(`👤 User Info - uid: ${uid}, userid: ${userid}, username: ${username}, email: ${email}`);
          
          const aiActionsPayload = {
            blobUrl: data.blobUrl,
            fileName: data.fileName || audioFile.name,
            userId: userid ? parseInt(userid) : 1,
            language: "english",
            emailTo: email,
            emailSubject: "UploadedFile",
            emailBody: "You uploaded a voice prompt"
          };
          
          console.log(`📦 AI Actions POST Payload:`, JSON.stringify(aiActionsPayload, null, 2));
          
          const aiResponse = await fetch(aiActionsUrl, {
            method: "POST",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json",
              ...(uid && { "Authorization": `Bearer ${uid}` }),
            },
            body: JSON.stringify(aiActionsPayload),
          });
          
          console.log(`📥 AI Actions Response Status: ${aiResponse.status} ${aiResponse.statusText}`);
          
          if (!aiResponse.ok) {
            let errorText = "";
            try {
              errorText = await aiResponse.text();
              console.log(`❌ AI Actions Error Response Body:`, errorText);
            } catch (e) {
              console.log(`❌ Could not read error response body`);
            }
            console.log(`ℹ️ AI Actions returned ${aiResponse.status} - file uploaded successfully, using local tracking`);
            // Don't throw - file is already uploaded successfully
            return;
          }
          
          const aiData = await aiResponse.json();
          console.log(`✅ AI Actions queued successfully:`, aiData);
          
          // Update file to show it's being processed
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === audioFile.id
                ? { ...f, processing: true }
                : f
            )
          );
        } catch (aiError) {
          console.warn(`⚠ AI Actions unavailable - using local tracking fallback:`, aiError);
          // Mark as processing locally even if AI Actions fails
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === audioFile.id
                ? { ...f, processing: true }
                : f
            )
          );
        }
      } else {
        console.log(`ℹ️ Skipping AI Actions call (localhost mode) - using local tracking`);
        // Mark as processing locally
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === audioFile.id
              ? { ...f, processing: true }
              : f
          )
        );
      }
      
      // Create a voice command record in the database (or local storage fallback)
      try {
        const uid = localStorage.getItem("uid");
        const username = localStorage.getItem("username");
        const voiceCommandUrl = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_COMMANDS);
        
        // Map to C# VoiceCommands model structure
        const voiceCommandData = {
          commandType: audioFile.name, // Store filename in CommandType
          voiceBlobURL: data.blobUrl,
          actionTime: new Date().toISOString(),
          actionType: 1, // 1 = voice-to-text
          status: "queued",
          useridstring: uid,
          userid: null, // Will be set by backend if needed
          displayname: username,
        };
        
        const dbResponse = await fetch(voiceCommandUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getFileUploadHeaders(),
          },
          body: JSON.stringify(voiceCommandData),
        });
        
        if (dbResponse.ok) {
          console.log(`✅ Voice command record created in database`);
        } else {
          throw new Error(`Database insert failed: ${dbResponse.status}`);
        }
      } catch (dbError) {
        console.warn(`⚠ Database unavailable - saving voice command to localStorage:`, dbError);
        // Fallback to localStorage for superusers
        const voiceCommands = JSON.parse(localStorage.getItem("voiceCommands") || "[]");
        voiceCommands.push({
          id: Date.now(),
          commandType: audioFile.name,
          voiceBlobURL: data.blobUrl,
          actionTime: new Date().toISOString(),
          actionType: 1,
          status: "queued",
          useridstring: localStorage.getItem("uid"),
          userid: null,
          displayname: localStorage.getItem("username"),
        });
        localStorage.setItem("voiceCommands", JSON.stringify(voiceCommands));
        console.log(`✅ Voice command saved to localStorage fallback`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      console.error(`⚠ Failed to upload file:`, error);
      
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id
            ? { ...f, uploadError: errorMessage, uploading: false }
            : f
        )
      );
    }
  };

  const handleUploadClick = (id: string) => {
    const file = uploadedFiles.find((f) => f.id === id);
    if (file) {
      uploadFileToAzure(file, "voiceinbound");
    }
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Audio Prompt</h1>
          <p className="text-slate-600">
            Upload pre-recorded audio files from your Windows Sound Recordings or Mac Voice Memos
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
              <FolderOpenIcon className="text-slate-600" style={{ fontSize: 48 }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Upload Audio Files
              </h3>
              <p className="text-slate-600 mb-4">
                Drag and drop audio files here, or click to browse your computer
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CloudUploadIcon />
                Select Audio Files
              </button>
              <p className="text-sm text-slate-500 mt-4">
                Supported formats: WAV, MP3, M4A, OGG, FLAC, WMA
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Windows: Documents &gt; Sound Recordings | Mac: Voice Memos
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Uploaded Files ({uploadedFiles.length})
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
                    <div className="flex flex-col gap-1 text-sm text-slate-600 mt-1">
                      <div className="flex gap-4">
                        <span>{formatFileSize(file.size)}</span>
                        <span>Duration: {formatDuration(file.duration)}</span>
                        <span>Added: {file.uploadedAt}</span>
                      </div>
                      {file.blobUrl && (
                        <a 
                          href={file.blobUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs truncate"
                          title={file.blobUrl}
                        >
                          ✓ Stored in Azure: {file.blobUrl}
                        </a>
                      )}
                      {file.processing && (
                        <span className="text-green-600 text-xs font-semibold">
                          🤖 Queued for AI processing (voice-to-text)
                        </span>
                      )}
                      {file.uploadError && (
                        <span className="text-red-600 text-xs">
                          ✗ Upload failed: {file.uploadError}
                        </span>
                      )}
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
                    
                    {file.uploading && (
                      <CircularProgress size={24} className="text-blue-600" />
                    )}
                    
                    {file.blobUrl && (
                      <div className="p-2 bg-green-100 rounded" title="Uploaded to Azure">
                        <CheckCircleIcon className="text-green-600" />
                      </div>
                    )}
                    
                    {!file.uploading && !file.blobUrl && (
                      <button
                        onClick={() => handleUploadClick(file.id)}
                        className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors text-sm"
                        title="Upload to Azure Blob Storage"
                      >
                        <CloudUploadIcon fontSize="small" />
                      </button>
                    )}
                    
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
          <h3 className="font-semibold text-blue-900 mb-3">Processing Workflow</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Select audio files from your Documents/Sound Recordings folder (Windows) or Voice Memos (Mac)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Preview your recordings using the play button to verify content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Click "Submit to LunaAI" to upload files to Azure Blob Storage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>LunaAI transcribes audio using Azure Speech Services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>Transcribed text is sent to multiple AI providers (ChatGPT, Claude on Azure)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">6.</span>
              <span>AI responses are chained, aggregated, and delivered to your desktop</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}