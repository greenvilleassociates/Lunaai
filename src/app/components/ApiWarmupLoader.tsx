import { useEffect, useState } from "react";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";
import { getApiUrl, API_CONFIG } from "../config/api";
import { BannerAd } from "./BannerAd";

interface ApiWarmupLoaderProps {
  onComplete: () => void;
}

export function ApiWarmupLoader({ onComplete }: ApiWarmupLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Getting ready.... please wait...");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Warm up the API by calling the users endpoint
    const warmupApi = async () => {
      try {
        setStatusMessage("Getting ready.... please wait...");
        const usersUrl = getApiUrl(API_CONFIG.ENDPOINTS.USERS);

        await fetch(usersUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        setStatusMessage("Getting ready.... please wait...");
      } catch (error) {
        console.log("API warmup call completed (may be in development mode)");
        setStatusMessage("Getting ready.... please wait...");
      }
    };

    warmupApi();

    // Progress bar animation over 60 seconds (60000ms)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; // 1% every 600ms → 60 seconds total
      });
    }, 600);

    // Countdown from 60 to 0
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Hard cap at 60 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      clearInterval(countdownInterval);
      setProgress(100);
      setCountdown(0);

      setTimeout(() => {
        onComplete();
      }, 500);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
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
      <h1 className="text-4xl font-bold text-white mb-2">LunaAI</h1>
      <p className="text-amber-400 text-2xl font-semibold mb-2">{countdown}s</p>
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
      <div className="mt-8 text-center px-4">
        <p className="text-slate-500 text-sm">
          Powered by Capitol Technology Solutions
        </p>
        <p className="text-slate-600 text-xs mt-2">
          Version 11.0 • Multi-Provider AI Management Platform
        </p>
      </div>

      {/* Banner Ads */}
      <div className="w-full max-w-4xl px-4 mt-8">
        <BannerAd />
      </div>
    </div>
  );
}
