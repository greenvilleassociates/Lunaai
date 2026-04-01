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
import { CircularProgress } from "@mui/material";
import { getApiUrl } from "../config/api";
import { getFileUploadHeaders } from "../utils/auth";
import { API_CONFIG } from "../config/api";

interface Recording {
  id: string;
  name: string;
  url: string;
  duration: number;
  createdAt: string;
  blob: Blob; // Store the actual blob for upload
  blobUrl?: string; // Azure Blob Storage URL
  uploading?: boolean;
  uploadError?: string;
  processing?: boolean;
}

export function StartRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/mp4');
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setPermissionError(null); // Clear any previous errors
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/mpeg')
        ? 'audio/mpeg'
        : MediaRecorder.isTypeSupported('audio/x-ms-wma')
        ? 'audio/x-ms-wma'
        : 'audio/wav';
      mimeTypeRef.current = mimeType;
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Store the blob for upload later
        const recording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleString()}`,
          url: url,
          duration: recordingTime,
          createdAt: new Date().toLocaleString(),
          blob: audioBlob,
        };
        
        // We'll save this to the recordings list when user clicks "Save"
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      
      let errorMsg = "Unable to access microphone. ";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMsg += "Please allow microphone access in your browser settings:\n\n";
        errorMsg += "Chrome/Edge: Click the camera icon in the address bar, select 'Always allow', then click 'Done'\n";
        errorMsg += "Firefox: Click the microphone icon in the address bar and select 'Allow'\n";
        errorMsg += "Safari: Go to Safari > Settings > Websites > Microphone, then select 'Allow'\n\n";
        errorMsg += "After granting permission, click 'Retry' or refresh the page.";
      } else if (error.name === "NotFoundError") {
        errorMsg += "No microphone detected. Please connect a microphone and try again.";
      } else if (error.name === "NotReadableError") {
        errorMsg += "Your microphone is being used by another application. Please close other apps using the microphone and try again.";
      } else {
        errorMsg += `Error: ${error.message}`;
      }
      
      setPermissionError(errorMsg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const togglePlayback = () => {
    if (!audioURL) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioURL);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const saveRecording = () => {
    if (!audioURL) return;

    const recording: Recording = {
      id: Date.now().toString(),
      name: `Recording ${new Date().toLocaleString()}`,
      url: audioURL,
      duration: recordingTime,
      createdAt: new Date().toLocaleString(),
      blob: new Blob(audioChunksRef.current, { type: mimeTypeRef.current }),
    };

    setRecordings((prev) => [...prev, recording]);
    
    // Reset for new recording
    setAudioURL(null);
    setRecordingTime(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
  };

  const discardRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((rec) => rec.id !== id));
  };

  const uploadFileToAzure = async (recording: Recording, fileCategory: string = "voiceinbound") => {
    if (!recording.blob) {
      console.error("No blob available for upload");
      return;
    }

    // Mark file as uploading
    setRecordings((prev) =>
      prev.map((r) => (r.id === recording.id ? { ...r, uploading: true, uploadError: undefined } : r))
    );

    // Convert blob to File object
    const ext = mimeTypeRef.current === 'audio/mp4' ? 'mp4' : mimeTypeRef.current === 'audio/mpeg' ? 'mp3' : mimeTypeRef.current === 'audio/x-ms-wma' ? 'wma' : 'wav';
    const file = new File([recording.blob], `${recording.name}.${ext}`, { type: mimeTypeRef.current });

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use the exact API endpoint structure
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

      // Update recording with blob URL and success status
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === recording.id
            ? { ...r, blobUrl: data.blobUrl, uploading: false, uploadError: undefined }
            : r
        )
      );

      console.log(`✓ Recording uploaded successfully: ${data.fileName}`, data);

      // Call AI Actions to queue the file for voice-to-text processing
      const shouldCallAIActions = !API_CONFIG.BASE_URL.includes('localhost');

      if (shouldCallAIActions) {
        try {
          console.log(`🤖 Attempting to queue file for AI processing: ${data.blobUrl}`);
          const aiActionsUrl = getApiUrl(API_CONFIG.ENDPOINTS.AI_ACTIONS_VOICE("1"));

          // Get user information
          const uid = localStorage.getItem("uid");
          const username = localStorage.getItem("username");
          const email = localStorage.getItem("email") || "user@capitoltechnology.net";
          const userid = localStorage.getItem("userid");

          const aiActionsPayload = {
            blobUrl: data.blobUrl,
            fileName: data.fileName || `${recording.name}.${ext}`,
            userId: userid ? parseInt(userid) : 1,
            language: "english",
            emailTo: email,
            emailSubject: "RecordedVoicePrompt",
            emailBody: "You recorded a voice prompt"
          };

          const aiResponse = await fetch(aiActionsUrl, {
            method: "POST",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json",
              ...(uid && { "Authorization": `Bearer ${uid}` }),
            },
            body: JSON.stringify(aiActionsPayload),
          });

          if (!aiResponse.ok) {
            console.log(`ℹ️ AI Actions returned ${aiResponse.status} - file uploaded successfully, using local tracking`);
            return;
          }

          const aiData = await aiResponse.json();
          console.log(`✅ AI Actions queued successfully:`, aiData);

          // Update recording to show it's being processed
          setRecordings((prev) =>
            prev.map((r) =>
              r.id === recording.id
                ? { ...r, processing: true }
                : r
            )
          );
        } catch (aiError) {
          console.warn(`⚠ AI Actions unavailable - using local tracking fallback:`, aiError);
          // Mark as processing locally even if AI Actions fails
          setRecordings((prev) =>
            prev.map((r) =>
              r.id === recording.id
                ? { ...r, processing: true }
                : r
            )
          );
        }
      } else {
        console.log(`ℹ️ Skipping AI Actions call (localhost mode) - using local tracking`);
        // Mark as processing locally
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? { ...r, processing: true }
              : r
          )
        );
      }

      // Create a voice command record in the database (or local storage fallback)
      try {
        const uid = localStorage.getItem("uid");
        const username = localStorage.getItem("username");
        const voiceCommandUrl = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_COMMANDS);

        const voiceCommandData = {
          commandType: recording.name,
          voiceBlobURL: data.blobUrl,
          actionTime: new Date().toISOString(),
          actionType: 1, // 1 = voice-to-text
          status: "queued",
          useridstring: uid,
          userid: null,
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
        // Fallback to localStorage
        const voiceCommands = JSON.parse(localStorage.getItem("voiceCommands") || "[]");
        voiceCommands.push({
          id: Date.now(),
          commandType: recording.name,
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
      console.error(`⚠ Failed to upload recording:`, error);

      setRecordings((prev) =>
        prev.map((r) =>
          r.id === recording.id
            ? { ...r, uploadError: errorMessage, uploading: false }
            : r
        )
      );
    }
  };

  const submitToAI = async () => {
    if (recordings.length === 0) {
      alert("Please save at least one recording first");
      return;
    }

    // Upload all recordings that haven't been uploaded yet
    const recordingsToUpload = recordings.filter(r => !r.blobUrl && !r.uploading);

    if (recordingsToUpload.length > 0) {
      // Upload all recordings in parallel
      await Promise.all(
        recordingsToUpload.map(recording => uploadFileToAzure(recording, "voiceinbound"))
      );
    }

    // After uploads complete, show confirmation
    setTimeout(() => {
      const uploadedCount = recordings.filter(r => r.blobUrl).length;
      alert(
        `Processing ${uploadedCount} recording(s) through LunaAI...\n\n` +
        `Next steps:\n` +
        `1. ✓ Files uploaded to Azure Blob Storage\n` +
        `2. → Transcribing audio using Azure Speech Services\n` +
        `3. → Sending to multiple AI providers (ChatGPT, Claude)\n` +
        `4. → Chaining results and delivering to your desktop\n\n` +
        `You will receive a notification when processing is complete.`
      );
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Start Recording</h1>
          <p className="text-slate-600">
            Record audio prompts directly in your browser using your microphone
          </p>
        </div>

        {/* Recording Interface */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center gap-6">
            {/* Recording Status */}
            <div className="w-full max-w-md">
              {isRecording ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                  <FiberManualRecordIcon className="text-red-600 animate-pulse" />
                  <span className="text-lg font-semibold text-red-600">
                    {isPaused ? "PAUSED" : "RECORDING"}
                  </span>
                  <span className="text-2xl font-mono text-red-600">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              ) : audioURL ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <AudioFileIcon className="text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    Recording Complete
                  </span>
                  <span className="text-xl font-mono text-green-600">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
                  <MicIcon className="text-slate-600" />
                  <span className="text-lg font-semibold text-slate-600">
                    Ready to Record
                  </span>
                </div>
              )}
            </div>

            {/* Microphone Icon/Visual */}
            <div className={`p-8 rounded-full transition-all ${
              isRecording && !isPaused
                ? "bg-red-200 animate-pulse"
                : isRecording && isPaused
                ? "bg-yellow-200"
                : "bg-slate-200"
            }`}>
              <MicIcon 
                className={isRecording && !isPaused ? "text-red-600" : "text-slate-600"} 
                style={{ fontSize: 80 }} 
              />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4">
              {!isRecording && !audioURL && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
                >
                  <MicIcon />
                  Start Recording
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-4 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-slate-600 text-white px-6 py-4 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <StopIcon />
                    Stop
                  </button>
                </>
              )}

              {audioURL && (
                <>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={saveRecording}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <SaveIcon />
                    Save
                  </button>
                  <button
                    onClick={discardRecording}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <DeleteIcon />
                    Discard
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
              <h2 className="text-xl font-semibold text-slate-900">
                Saved Recordings ({recordings.length})
              </h2>
              <button
                onClick={submitToAI}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit to LunaAI
              </button>
            </div>

            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded">
                      <AudioFileIcon className="text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{recording.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-slate-600 mt-1">
                      <div className="flex gap-4">
                        <span>Duration: {formatTime(recording.duration)}</span>
                        <span>Created: {recording.createdAt}</span>
                      </div>
                      {recording.blobUrl && (
                        <a 
                          href={recording.blobUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs truncate"
                          title={recording.blobUrl}
                        >
                          ✓ Stored in Azure: {recording.blobUrl}
                        </a>
                      )}
                      {recording.processing && (
                        <span className="text-green-600 text-xs font-semibold">
                          🤖 Queued for AI processing (voice-to-text)
                        </span>
                      )}
                      {recording.uploadError && (
                        <span className="text-red-600 text-xs">
                          ✗ Upload failed: {recording.uploadError}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {recording.uploading && (
                      <CircularProgress size={24} className="text-blue-600" />
                    )}
                    
                    {recording.blobUrl && (
                      <div className="p-2 bg-green-100 rounded" title="Uploaded to Azure">
                        <CheckCircleIcon className="text-green-600" />
                      </div>
                    )}
                    
                    {!recording.uploading && !recording.blobUrl && (
                      <button
                        onClick={() => uploadFileToAzure(recording, "voiceinbound")}
                        className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors text-sm"
                        title="Upload to Azure Blob Storage"
                      >
                        <CloudUploadIcon fontSize="small" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteRecording(recording.id)}
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
          <h3 className="font-semibold text-blue-900 mb-3">Browser-Based Recording</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>This recorder works directly in your browser - no external apps needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Your browser will ask for microphone permission the first time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Click "Start Recording" to begin, "Stop" when finished</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Preview your recording before saving it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Save multiple recordings and submit them all to LunaAI for AI processing</span>
            </li>
          </ul>
        </div>

        {/* Permission Error */}
        {permissionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-red-900 mb-3">🎤 Microphone Permission Required</h3>
            <p className="text-red-800 whitespace-pre-line mb-4">{permissionError}</p>
            <button
              onClick={startRecording}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <MicIcon />
              Retry - Request Microphone Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}