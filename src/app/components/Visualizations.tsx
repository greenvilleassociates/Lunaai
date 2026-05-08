import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { API_CONFIG, getApiUrl } from "../config/api";
import { DATA_URLS, fetchExternalData } from "../config/dataUrls";
import { Button, Tabs, Tab, Box, TextField, CircularProgress, Chip, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import { applySqlToData, SqlTranslation } from "../utils/sqlFilter";
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
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResult, setSqlResult] = useState("");
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState("");
  const [queryTarget, setQueryTarget] = useState<"GRouter" | "GSwitch">("GRouter");
  const [graphData, setGraphData] = useState<Record<string, unknown>[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState("");
  const [sqlTranslation, setSqlTranslation] = useState<SqlTranslation | null>(null);
  const queryGraphRef = useRef<SVGSVGElement>(null);
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

  // Draw adaptive D3 bar chart from query result data
  const drawQueryGraph = (data: Record<string, unknown>[]) => {
    if (!queryGraphRef.current || data.length === 0) return;

    d3.select(queryGraphRef.current).selectAll("*").remove();

    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    const labelKey = keys.find(k => typeof firstRow[k] === "string") ?? keys[0];
    const valueKey = keys.find(k => typeof firstRow[k] === "number" && k !== labelKey) ?? keys[1];

    const margin = { top: 16, right: 24, bottom: 60, left: 160 };
    const width = 740 - margin.left - margin.right;
    const barHeight = 28;
    const height = Math.max(200, data.length * (barHeight + 6));

    const svg = d3
      .select(queryGraphRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const labels = data.map(d => String(d[labelKey] ?? ""));
    const values = data.map(d => Number(d[valueKey] ?? 0));
    const maxVal = Math.max(...values, 1);

    const y = d3.scaleBand().domain(labels).range([0, height]).padding(0.2);
    const x = d3.scaleLinear().domain([0, maxVal]).nice().range([0, width]);

    // Color ramp: teal → blue by target
    const barColor = queryTarget === "GRouter" ? "#0ea5e9" : "#6366f1";

    svg.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "11px");

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
      .style("font-size", "11px");

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => y(String(d[labelKey] ?? ""))!)
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", d => x(Number(d[valueKey] ?? 0)))
      .attr("fill", barColor)
      .attr("rx", 3);

    svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(Number(d[valueKey] ?? 0)) + 5)
      .attr("y", d => (y(String(d[labelKey] ?? ""))! + y.bandwidth() / 2 + 4))
      .style("font-size", "11px")
      .style("fill", "#475569")
      .text(d => String(d[valueKey] ?? ""));

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text(valueKey);
  };

  const publishToGraph = async () => {
    if (!sqlResult.trim()) return;
    setGraphLoading(true);
    setGraphData([]);
    setSqlTranslation(null);
    setGraphError("");
    try {
      const uid = localStorage.getItem("uid") || "";
      // Step 1 — GET all records from the selected endpoint
      const endpoint = queryTarget === "GRouter"
        ? API_CONFIG.ENDPOINTS.GROUTER
        : API_CONFIG.ENDPOINTS.GSWITCH;
      const url = getApiUrl(endpoint);
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();
      const allRows: Record<string, unknown>[] = Array.isArray(raw) ? raw : raw.results ?? raw.data ?? [];

      // Step 2 — Translate SQL → JS filter and apply client-side
      const { rows, translation } = applySqlToData(sqlResult, allRows);
      setSqlTranslation(translation);
      setGraphData(rows);
    } catch (err) {
      setGraphError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setGraphLoading(false);
    }
  };

  // Redraw graph whenever data or target changes
  useEffect(() => {
    if (graphData.length > 0) drawQueryGraph(graphData);
  }, [graphData, queryTarget]);

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;
    setSqlLoading(true);
    setSqlResult("");
    setSqlError("");
    try {
      const uid = localStorage.getItem("uid") || "";
      const url = getApiUrl(API_CONFIG.ENDPOINTS.VOICE_SEARCH);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${uid}` },
        body: JSON.stringify({
          question: `Enterprise Query: ${sqlQuery.trim()}`,
          requestType: 2,
          uid,
          model: "voice-search",
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSqlResult(data.response || data.Response || "");
    } catch (err) {
      setSqlError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSqlLoading(false);
    }
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

      {/* SQL Query Bar */}
      {activeTab === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-5" style={{ width: "800px" }}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-slate-800">Enterprise SQL Query</h3>
            <Chip
              label="AI-Generated"
              size="small"
              sx={{ backgroundColor: "#f0f4ff", color: "#3b5bdb", fontSize: "0.7rem" }}
            />
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Describe what you want to query — the AI generates SQL against the enterprise database (Grouter, Gswitch, Gserver, Gemployee, etc.)
          </p>
          <div className="flex gap-2 items-start">
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              placeholder="e.g. Show all routers added in the last 30 days"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) executeQuery();
              }}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.875rem" } }}
            />
            <Button
              variant="contained"
              onClick={executeQuery}
              disabled={sqlLoading || !sqlQuery.trim()}
              sx={{
                minWidth: 100,
                backgroundColor: "#1e293b",
                textTransform: "none",
                fontWeight: 500,
                alignSelf: "flex-start",
                "&:hover": { backgroundColor: "#334155" },
              }}
            >
              {sqlLoading ? <CircularProgress size={18} color="inherit" /> : "Generate SQL"}
            </Button>
          </div>
          {sqlError && (
            <p className="text-xs text-red-600 mt-2">{sqlError}</p>
          )}
          {sqlResult && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Generated SQL</span>
                <button
                  className="text-xs text-slate-400 hover:text-slate-600"
                  onClick={() => navigator.clipboard.writeText(sqlResult)}
                >
                  Copy
                </button>
              </div>
              <pre className="bg-slate-900 text-green-300 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {sqlResult}
              </pre>

              {/* Publish to Graph */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 flex-wrap">
                <Box>
                  <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Publish Target
                  </FormLabel>
                  <RadioGroup
                    row
                    value={queryTarget}
                    onChange={(e) => setQueryTarget(e.target.value as "GRouter" | "GSwitch")}
                    sx={{ mt: 0.5 }}
                  >
                    <FormControlLabel
                      value="GRouter"
                      control={<Radio size="small" sx={{ color: "#0ea5e9", "&.Mui-checked": { color: "#0ea5e9" } }} />}
                      label={<span style={{ fontSize: "0.85rem", color: "#0ea5e9", fontWeight: 600 }}>GRouter</span>}
                    />
                    <FormControlLabel
                      value="GSwitch"
                      control={<Radio size="small" sx={{ color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }} />}
                      label={<span style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: 600 }}>GSwitch</span>}
                    />
                  </RadioGroup>
                </Box>
                <Button
                  variant="contained"
                  onClick={publishToGraph}
                  disabled={graphLoading}
                  sx={{
                    backgroundColor: queryTarget === "GRouter" ? "#0ea5e9" : "#6366f1",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: queryTarget === "GRouter" ? "#0284c7" : "#4f46e5" },
                  }}
                >
                  {graphLoading
                    ? <><CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />Running…</>
                    : `Publish to Graph — ${queryTarget}`}
                </Button>
                {graphError && <p className="text-xs text-red-600">{graphError}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQL Translation Summary */}
      {activeTab === 1 && sqlTranslation && (
        <div className="rounded-lg p-4 mb-3 border text-xs" style={{ width: "800px", backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
          <p className="font-semibold text-slate-600 uppercase tracking-wide mb-2">SQL → JS Translation</p>
          <div className="flex flex-wrap gap-3">
            <span className="text-slate-500">
              <span className="font-medium text-slate-700">Source:</span> {sqlTranslation.rowsIn} rows from {queryTarget}
            </span>
            {sqlTranslation.filters.length > 0 && (
              <span className="text-slate-500">
                <span className="font-medium text-slate-700">Filters:</span>{" "}
                {sqlTranslation.filters.join(" AND ")}
              </span>
            )}
            {sqlTranslation.orderBy && (
              <span className="text-slate-500">
                <span className="font-medium text-slate-700">Sort:</span>{" "}
                {sqlTranslation.orderBy} {sqlTranslation.orderDir}
              </span>
            )}
            {sqlTranslation.limit !== null && (
              <span className="text-slate-500">
                <span className="font-medium text-slate-700">Limit:</span> {sqlTranslation.limit}
              </span>
            )}
            <span className="font-semibold" style={{ color: queryTarget === "GRouter" ? "#0369a1" : "#4f46e5" }}>
              → {sqlTranslation.rowsOut} rows matched
            </span>
          </div>
        </div>
      )}

      {/* D3 Query Results Graph */}
      {activeTab === 1 && graphData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-5" style={{ width: "800px" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800">Query Results</h3>
              <Chip
                label={queryTarget}
                size="small"
                sx={{
                  backgroundColor: queryTarget === "GRouter" ? "#e0f2fe" : "#ede9fe",
                  color: queryTarget === "GRouter" ? "#0369a1" : "#4f46e5",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`${graphData.length} rows`}
                size="small"
                sx={{ backgroundColor: "#f1f5f9", color: "#64748b", fontSize: "0.7rem" }}
              />
            </div>
            <button
              className="text-xs text-slate-400 hover:text-slate-600"
              onClick={() => { setGraphData([]); setSqlTranslation(null); }}
            >
              Clear
            </button>
          </div>
          <div className="overflow-x-auto">
            <svg ref={queryGraphRef}></svg>
          </div>
        </div>
      )}

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