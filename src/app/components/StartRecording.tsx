import { useState, useRef, useEffect } from "react";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AudioFileIcon from "@mui/icons-material/AudioFile";

export function StartRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<Array<{ id: string; name: string; url: string; duration: number; createdAt: string }>>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
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
    } catch (error) {
      setPermissionError("Unable to access microphone. Please ensure microphone permissions are granted.");
      console.error("Error accessing microphone:", error);
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

    const recording = {
      id: Date.now().toString(),
      name: `Recording ${new Date().toLocaleString()}`,
      url: audioURL,
      duration: recordingTime,
      createdAt: new Date().toLocaleString(),
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

  const submitToAI = () => {
    if (recordings.length === 0) {
      alert("Please save at least one recording first");
      return;
    }

    alert(`Submitting ${recordings.length} recording(s) to LunaAI for processing...\n\nThe audio will be:\n1. Uploaded to Azure Blob Storage\n2. Transcribed using Azure Speech Services\n3. Sent to multiple AI providers (ChatGPT, Claude on Azure)\n4. Results chained and delivered to your desktop`);
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
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded">
                      <AudioFileIcon className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{recording.name}</h3>
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>Duration: {formatTime(recording.duration)}</span>
                        <span>Created: {recording.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <DeleteIcon />
                  </button>
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
            <h3 className="font-semibold text-red-900 mb-3">Permission Error</h3>
            <p className="text-red-800">{permissionError}</p>
          </div>
        )}
      </div>
    </div>
  );
}