import { useEffect, useState } from "react";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";
import { getApiUrl, API_CONFIG } from "../config/api";

interface ApiWarmupLoaderProps {
  onComplete: () => void;
}

export function ApiWarmupLoader({ onComplete }: ApiWarmupLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing LunaAI...");

  useEffect(() => {
    // Warm up the API by calling the users endpoint
    const warmupApi = async () => {
      try {
        setStatusMessage("Waking up API services...");
        const usersUrl = getApiUrl(API_CONFIG.ENDPOINTS.USERS);
        
        // Make the API call to wake up the server
        await fetch(usersUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        setStatusMessage("API services ready!");
      } catch (error) {
        console.log("API warmup call completed (may be in development mode)");
        setStatusMessage("Loading application...");
      }
    };

    // Start the warmup call immediately
    warmupApi();

    // Progress bar animation over 10 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; // Increment by 1% every 100ms for 10 seconds total
      });
    }, 100);

    // Complete after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 500); // Small delay after reaching 100%
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Luna Logo */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-amber-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <img
          src={lunaLogo}
          alt="LunaAI Logo"
          className="w-32 h-32 rounded-2xl object-cover relative z-10 shadow-2xl animate-[flash_2s_ease-in-out_infinite]"
        />
      </div>

      {/* Loading Text */}
      <h1 className="text-4xl font-bold text-white mb-4">LunaAI</h1>
      <p className="text-slate-300 mb-8 text-center px-4">{statusMessage}</p>

      {/* Progress Bar */}
      <div className="w-full max-w-md px-4">
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-slate-400 text-sm text-center mt-3">{progress}%</p>
      </div>

      {/* Info Text */}
      <div className="mt-12 text-center px-4">
        <p className="text-slate-500 text-sm">
          Powered by Capitol Technology Solutions
        </p>
        <p className="text-slate-600 text-xs mt-2">
          Version 9.0 • Multi-Provider AI Management Platform
        </p>
      </div>
    </div>
  );
}
