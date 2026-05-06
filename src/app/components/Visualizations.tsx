import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";
import { Button, Tabs, Tab, Box } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface MonthlyData {
  month: string;
  textSearches: number;
  voiceCommands: number;
}

interface WebSearchResult {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata: string;
  expectedtokens: number;
  expectedcost: number;
}

interface VoiceCommand {
  id: number;
  commandType?: string | null;
  voiceBlobURL?: string | null;
  actionTime?: string | null;
  actionType?: number | null;
  status?: string | null;
  useridstring?: string | null;
  userid?: number | null;
  displayname?: string | null;
}

// Update this URL when your D3/SQL render endpoint is ready
const REALTIME_GRAPHS_URL = "";

export function Visualizations() {
  const [activeTab, setActiveTab] = useState(0);
  const centercountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"current" | "all">("current");
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Check if user is superuser
    const role = localStorage.getItem("role");
    setIsSuperuser(role === "superuser");
  }, []);

  useEffect(() => {
    loadData();
  }, [viewMode]);

  useEffect(() => {
    if (monthlyData.length > 0) {
      drawChart();
    }
  }, [monthlyData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const uid = localStorage.getItem("uid");
      
      // Fetch AI Text Searches
      let searchData: WebSearchResult[] = [];
      try {
        const searchUrl = getApiUrl(API_CONFIG.ENDPOINTS.WEB_SEARCH);
        const searchResponse = await fetch(searchUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
        });

        if (searchResponse.ok) {
          searchData = await searchResponse.json();
        } else {
          throw new Error("API not available");
        }
      } catch (error) {
        // Fallback to local JSON data
        console.log("Falling back to local websearch data");
        searchData = await fetchExternalData<WebSearchResult[]>(DATA_URLS.WEBSEARCH);
      }

      // Fetch Voice Commands
      let voiceData: VoiceCommand[] = [];
      try {
        const voiceUrl = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_COMMANDS);
        const voiceResponse = await fetch(voiceUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
        });

        if (voiceResponse.ok) {
          voiceData = await voiceResponse.json();
        } else {
          throw new Error("API not available");
        }
      } catch (error) {
        // Fallback to localStorage
        voiceData = JSON.parse(localStorage.getItem("voiceCommands") || "[]");
      }

      // Filter by current user if not in "all" mode
      if (viewMode === "current") {
        searchData = searchData.filter(item => item.uid === uid);
        voiceData = voiceData.filter(item => item.useridstring === uid);
      }

      // Aggregate data by month
      const aggregated = aggregateByMonth(searchData, voiceData);
      setMonthlyData(aggregated);
    } catch (err) {
      console.error("Error loading visualization data:", err);
    } finally {
      setLoading(false);
    }
  };

  const aggregateByMonth = (
    searches: WebSearchResult[],
    voices: VoiceCommand[]
  ): MonthlyData[] => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentYear = new Date().getFullYear();
    const monthlyMap: { [key: string]: { textSearches: number; voiceCommands: number } } = {};

    // Initialize all months
    months.forEach(month => {
      monthlyMap[month] = { textSearches: 0, voiceCommands: 0 };
    });

    // Count text searches by month
    searches.forEach(item => {
      const date = new Date(item.timestamp);
      if (date.getFullYear() === currentYear) {
        const month = months[date.getMonth()];
        monthlyMap[month].textSearches++;
      }
    });

    // Count voice commands by month
    voices.forEach(item => {
      if (item.actionTime) {
        const date = new Date(item.actionTime);
        if (date.getFullYear() === currentYear) {
          const month = months[date.getMonth()];
          monthlyMap[month].voiceCommands++;
        }
      }
    });

    // Convert to array
    return months.map(month => ({
      month,
      textSearches: monthlyMap[month].textSearches,
      voiceCommands: monthlyMap[month].voiceCommands,
    }));
  };

  const saveSnapshotToPDF = async () => {
    if (!centercountRef.current) return;
    const canvas = await html2canvas(centercountRef.current, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [800, 800] });
    pdf.addImage(imgData, "PNG", 0, 0, 800, 800);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    pdf.save(`Centercourt-${timestamp}.pdf`);
  };

  const drawChart = () => {
    if (!chartRef.current || monthlyData.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 120, bottom: 40, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x0 = d3
      .scaleBand()
      .domain(monthlyData.map(d => d.month))
      .rangeRound([0, width])
      .paddingInner(0.1);

    // X1 scale for grouped bars
    const x1 = d3
      .scaleBand()
      .domain(["textSearches", "voiceCommands"])
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .nice()
      .rangeRound([height, 0]);

    // Color scale
    const color = d3
      .scaleOrdinal()
      .domain(["textSearches", "voiceCommands"])
      .range(["#4A90E2", "#8B0000"]); // Blue for text, dark red for voice

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("font-size", "12px");

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(10))
      .selectAll("text")
      .style("font-size", "12px");

    // Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#475569")
      .text("Count");

    // Add bars
    const monthGroups = svg
      .selectAll(".month-group")
      .data(monthlyData)
      .enter()
      .append("g")
      .attr("class", "month-group")
      .attr("transform", d => `translate(${x0(d.month)},0)`);

    // Text searches bars
    monthGroups
      .append("rect")
      .attr("x", x1("textSearches")!)
      .attr("y", d => y(d.textSearches))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.textSearches))
      .attr("fill", color("textSearches") as string)
      .attr("rx", 2);

    // Voice commands bars
    monthGroups
      .append("rect")
      .attr("x", x1("voiceCommands")!)
      .attr("y", d => y(d.voiceCommands))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.voiceCommands))
      .attr("fill", color("voiceCommands") as string)
      .attr("rx", 2);

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    const legendData = [
      { label: "AI Text Searches", color: "#4A90E2" },
      { label: "Voice AI Commands", color: "#8B0000" },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", item.color)
        .attr("rx", 2);

      legendRow
        .append("text")
        .attr("x", 24)
        .attr("y", 14)
        .style("font-size", "13px")
        .style("fill", "#475569")
        .text(item.label);
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl mb-6">Visualizations</h2>
      <p className="text-slate-600 mb-6">
        View and analyze AI Text Searches and Voice AI Commands through interactive visualizations.
      </p>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
            "& .Mui-selected": { color: "#000000 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#000000" },
          }}
        >
          <Tab label="Activity Charts" />
          <Tab label="Real-Time Graphics" />
        </Tabs>
      </Box>

      {/* Centercourt Tab */}
      {activeTab === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden" ref={centercountRef} style={{ width: "800px" }}>
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-2xl">Centercourt</h3>
            <p className="text-slate-600 text-sm mt-1">
              Live D3 visualizations from router &amp; switch data via AI-generated SQL
            </p>
          </div>
          {REALTIME_GRAPHS_URL ? (
            <iframe
              src={REALTIME_GRAPHS_URL}
              title="Centercourt"
              style={{ width: "800px", height: "800px", border: "none" }}
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-3" style={{ width: "800px", height: "800px" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <p className="text-lg font-medium text-slate-500">Centercourt endpoint not yet configured</p>
              <p className="text-sm">Set <code className="bg-slate-100 px-1 rounded">REALTIME_GRAPHS_URL</code> in Visualizations.tsx when your render endpoint is ready</p>
            </div>
          )}
        </div>
      )}

      {/* Save Snapshot Button */}
      {activeTab === 1 && (
        <div className="mt-4" style={{ width: "800px" }}>
          <Button
            variant="contained"
            onClick={saveSnapshotToPDF}
            sx={{
              backgroundColor: "#000000",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { backgroundColor: "#1a1a1a" },
            }}
          >
            Save Snapshot as PDF
          </Button>
        </div>
      )}

      {/* Activity Charts Tab */}
      {activeTab === 0 && <>
      {/* View Mode Toggle */}
      {isSuperuser && (
        <div className="mb-6 flex gap-3">
          <Button
            variant={viewMode === "current" ? "contained" : "outlined"}
            onClick={() => setViewMode("current")}
            sx={{
              backgroundColor: viewMode === "current" ? "#000000" : "transparent",
              color: viewMode === "current" ? "#ffffff" : "#000000",
              borderColor: "#000000",
              "&:hover": {
                backgroundColor: viewMode === "current" ? "#1a1a1a" : "#f5f5f5",
              },
            }}
          >
            My Data
          </Button>
          <Button
            variant={viewMode === "all" ? "contained" : "outlined"}
            onClick={() => setViewMode("all")}
            sx={{
              backgroundColor: viewMode === "all" ? "#8B0000" : "transparent",
              color: viewMode === "all" ? "#ffffff" : "#8B0000",
              borderColor: "#8B0000",
              "&:hover": {
                backgroundColor: viewMode === "all" ? "#a00000" : "#fff5f5",
              },
            }}
          >
            All Users
          </Button>
        </div>
      )}

      {/* Monthly Activity Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <h3 className="text-2xl mb-4">
          {viewMode === "current" ? "My Monthly AI Activity" : "All Users Monthly AI Activity"}
        </h3>
        <p className="text-slate-600 text-sm mb-6">
          AI Text Searches and Voice AI Commands by month for {new Date().getFullYear()}
        </p>
        {loading ? (
          <div className="flex items-center justify-center h-96 text-slate-500">
            Loading data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg ref={chartRef}></svg>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-xl mb-3">Total AI Text Searches</h3>
          <p className="text-4xl text-blue-600 mb-2">
            {monthlyData.reduce((sum, d) => sum + d.textSearches, 0)}
          </p>
          <p className="text-sm text-slate-600">
            {viewMode === "current" ? "Your searches" : "All users"} in {new Date().getFullYear()}
          </p>
        </div>
        <div className="p-6 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-xl mb-3">Total Voice AI Commands</h3>
          <p className="text-4xl mb-2" style={{ color: "#8B0000" }}>
            {monthlyData.reduce((sum, d) => sum + d.voiceCommands, 0)}
          </p>
          <p className="text-sm text-slate-600">
            {viewMode === "current" ? "Your commands" : "All users"} in {new Date().getFullYear()}
          </p>
        </div>
        <div className="p-6 border border-slate-200 rounded-lg bg-white">
          <h3 className="text-xl mb-3">Total AI Processes</h3>
          <p className="text-4xl text-slate-900 mb-2">
            {monthlyData.reduce((sum, d) => sum + d.textSearches + d.voiceCommands, 0)}
          </p>
          <p className="text-sm text-slate-600">
            Combined activity in {new Date().getFullYear()}
          </p>
        </div>
      </div>
      </>}
    </div>
  );
}