import { useState, useEffect, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { API_CONFIG, getApiUrl } from "../config/api";

interface BannerAdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
}

// Fallback commercials in case JSON fetch fails
const fallbackCommercials: BannerAdData[] = [
  {
    id: "ad-001",
    title: "World Cup 2026 - USA • CANADA • MEXICO",
    description: "The world's greatest soccer tournament comes to North America! Get your tickets now!",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=300&fit=crop",
    linkUrl: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026",
    bgColor: "linear-gradient(135deg, #00843D 0%, #006633 100%)",
    textColor: "#ffffff",
  },
  {
    id: "ad-002",
    title: "Corona Extra - Find Your Beach",
    description: "Relax with an ice-cold Corona. The perfect beer for sunny days and good times.",
    imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&h=300&fit=crop",
    linkUrl: "https://www.corona.com",
    bgColor: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    textColor: "#1a1a1a",
  },
  {
    id: "ad-003",
    title: "Coppertone SPORT - Play Longer, Stay Protected",
    description: "Waterproof • Sweatproof • SPF 50+ protection for active days in the sun",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=300&fit=crop",
    linkUrl: "https://www.coppertone.com",
    bgColor: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
    textColor: "#ffffff",
  },
  {
    id: "ad-004",
    title: "Heineken - Open Your World",
    description: "Brewed with pure malt, water and hops. Premium lager beer since 1873.",
    imageUrl: "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=1200&h=300&fit=crop",
    linkUrl: "https://www.heineken.com",
    bgColor: "linear-gradient(135deg, #008200 0%, #005700 100%)",
    textColor: "#ffffff",
  },
  {
    id: "ad-005",
    title: "Neutrogena Beach Defense - Water + Sun = No Problem",
    description: "SPF 70 • Beach-strength sunscreen that's proven to protect in 7 skin-damaging conditions",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=300&fit=crop",
    linkUrl: "https://www.neutrogena.com",
    bgColor: "linear-gradient(135deg, #0099CC 0%, #006699 100%)",
    textColor: "#ffffff",
  },
  {
    id: "ad-006",
    title: "Premier League - The World's Best Football",
    description: "Watch every match live! Arsenal, Man City, Liverpool, Chelsea & more!",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=300&fit=crop",
    linkUrl: "https://www.premierleague.com",
    bgColor: "linear-gradient(135deg, #3D195B 0%, #2B0A3D 100%)",
    textColor: "#ffffff",
  },
  {
    id: "ad-007",
    title: "Modelo Especial - Fighting Spirit",
    description: "The beer with a rich golden hue and a crisp, refreshing taste. Brewed for those with a fighting spirit.",
    imageUrl: "https://images.unsplash.com/photo-1589988944170-745eb5926452?w=1200&h=300&fit=crop",
    linkUrl: "https://www.modelousa.com",
    bgColor: "linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)",
    textColor: "#1a1a1a",
  },
  {
    id: "ad-008",
    title: "Hawaiian Tropic - Island-Inspired Protection",
    description: "Exotic botanicals with SPF 50. Indulge your senses while protecting your skin.",
    imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&h=300&fit=crop",
    linkUrl: "https://www.hawaiiantropic.com",
    bgColor: "linear-gradient(135deg, #FF1493 0%, #FF6347 100%)",
    textColor: "#ffffff",
  },
];

export function BannerAd() {
  const [commercials, setCommercials] = useState<BannerAdData[]>(fallbackCommercials);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  const impressionQueue = useRef<object[]>([]);

  // Helper functions for conditional debug logging
  const debugLog = (...args: any[]) => {
    if (debugMode) {
      console.log(...args);
    }
  };

  const debugWarn = (...args: any[]) => {
    if (debugMode) {
      console.warn(...args);
    }
  };

  // Load debug mode setting
  useEffect(() => {
    const savedDebugMode = localStorage.getItem("debugMode");
    if (savedDebugMode !== null) {
      setDebugMode(savedDebugMode === "true");
    }

    // Listen for changes to debug mode from Settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "debugMode") {
        setDebugMode(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Load commercials from JSON file
  useEffect(() => {
    const loadCommercials = async () => {
      try {
        const response = await fetch("/data/commercials.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCommercials(data);
          debugLog("✅ Commercials loaded from JSON:", data.length);
        }
      } catch (error) {
        debugWarn("⚠️ Failed to load commercials from JSON, using fallback:", error);
        // Keep fallback commercials that were already set
      }
    };
    loadCommercials();
  }, []);

  useEffect(() => {
    if (isHovered || commercials.length === 0) return; // Don't auto-rotate when user is hovering or no commercials

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % commercials.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [isHovered, commercials]);

  // Flush queued impressions once uid is available
  const flushImpressionQueue = async (uid: string) => {
    if (impressionQueue.current.length === 0) return;
    const addbaseUrl = getApiUrl(API_CONFIG.ENDPOINTS.ADDBASE);
    const queued = [...impressionQueue.current];
    impressionQueue.current = [];
    for (const impression of queued) {
      try {
        await fetch(addbaseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
          body: JSON.stringify({ ...impression, uid, clientid: uid }),
        });
        debugLog("✅ Queued ad impression flushed");
      } catch (error) {
        debugWarn("⚠️ Failed to flush queued impression:", error);
      }
    }
  };

  // Listen for uid becoming available after login, then flush queue
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "uid" && e.newValue) {
        flushImpressionQueue(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Track ad impressions — queue if not yet logged in, post immediately if logged in
  useEffect(() => {
    if (commercials.length === 0) return;

    const trackImpression = async () => {
      const currentAd = commercials[currentAdIndex];
      const ipAddress = localStorage.getItem("ipAddress") || "N/A";
      const latitude = localStorage.getItem("latitude") || "0";
      const longitude = localStorage.getItem("longitude") || "0";

      const impressionData = {
        addid: currentAd.id,
        sourceip: ipAddress,
        destinationip: "login-banner",
        mktgurl: currentAd.linkUrl,
        origplatform: "web-login",
        targetplatform: "banner-ad",
        ulat: parseFloat(latitude),
        ulong: parseFloat(longitude),
        cost: 0,
        price: 0,
        discount: 0,
      };

      const uid = localStorage.getItem("uid");
      if (!uid) {
        // Queue it — will be flushed after login completes
        impressionQueue.current.push(impressionData);
        debugLog(`📋 Ad impression queued (not yet logged in): ${currentAd.title}`);
        return;
      }

      try {
        const addbaseUrl = getApiUrl(API_CONFIG.ENDPOINTS.ADDBASE);
        await fetch(addbaseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
          body: JSON.stringify({ ...impressionData, uid, clientid: uid }),
        });
        debugLog(`✅ Ad impression tracked: ${currentAd.title}`);
      } catch (error) {
        debugWarn("⚠️ Failed to track ad impression:", error);
      }
    };

    trackImpression();
  }, [currentAdIndex, commercials]);

  const currentAd = commercials[currentAdIndex];

  const handlePrevious = () => {
    setCurrentAdIndex((prev) => (prev - 1 + commercials.length) % commercials.length);
  };

  const handleNext = () => {
    setCurrentAdIndex((prev) => (prev + 1) % commercials.length);
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: "100%", lg: "1600px" },
        height: "200px",
        margin: "0 auto",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${currentAd.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.4)",
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: currentAd.bgColor,
          opacity: 0.85,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: "20px 50px", lg: "20px 80px" },
          height: "200px",
          textAlign: "center",
          color: currentAd.textColor,
        }}
      >
        <h3
          style={{
            fontSize: "clamp(1rem, 3vw, 1.5rem)",
            fontWeight: 700,
            margin: 0,
            marginBottom: "6px",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          {currentAd.title}
        </h3>
        <p
          style={{
            fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
            margin: 0,
            opacity: 0.95,
            textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)",
            maxWidth: "900px",
          }}
        >
          {currentAd.description}
        </p>

        {/* Learn More Button */}
        <a
          href={currentAd.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: "12px",
            padding: "6px 20px",
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: `2px solid ${currentAd.textColor}`,
            borderRadius: "24px",
            color: currentAd.textColor,
            textDecoration: "none",
            fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            fontWeight: 600,
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = currentAd.textColor;
            e.currentTarget.style.color = currentAd.bgColor.includes("gradient")
              ? "#1a1a1a"
              : currentAd.bgColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.color = currentAd.textColor;
          }}
        >
          Learn More →
        </a>
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={handlePrevious}
        sx={{
          position: "absolute",
          left: { xs: 8, lg: 16 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          color: currentAd.textColor,
          width: { xs: 32, lg: 40 },
          height: { xs: 32, lg: 40 },
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        <ChevronLeft sx={{ fontSize: { xs: 20, lg: 24 } }} />
      </IconButton>
      <IconButton
        onClick={handleNext}
        sx={{
          position: "absolute",
          right: { xs: 8, lg: 16 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          color: currentAd.textColor,
          width: { xs: 32, lg: 40 },
          height: { xs: 32, lg: 40 },
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        <ChevronRight sx={{ fontSize: { xs: 20, lg: 24 } }} />
      </IconButton>

      {/* Indicator Dots */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 8, lg: 12 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: { xs: 0.5, lg: 1 },
        }}
      >
        {commercials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentAdIndex(index)}
            style={{
              width: index === currentAdIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              border: "none",
              background: index === currentAdIndex ? currentAd.textColor : "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            aria-label={`View ad ${index + 1}`}
          />
        ))}
      </Box>
    </Box>
  );
}
