import { Box, Typography, Paper, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore, NewReleases } from "@mui/icons-material";

export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <Box className="flex items-center justify-between mb-6">
        <h2 className="text-3xl">About LunaAI</h2>
        <Chip
          label="Version 30"
          color="success"
          icon={<NewReleases />}
          sx={{ fontSize: '1rem', padding: '20px 10px' }}
        />
      </Box>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-2xl mb-3">Manager of LLMs</h3>
          <p className="text-slate-600 mb-4">
            LunaAI is an intelligent orchestration platform that manages multiple Large Language Models (LLMs). 
            Our system processes requests across various AI providers, chains results, and delivers comprehensive 
            responses directly to your desktop.
          </p>
        </section>

        <section>
          <h3 className="text-xl mb-3">Supported AI Models</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>ChatGPT on Azure - OpenAI's powerful language model with enterprise-grade security</li>
            <li>Claude AI on Azure - Anthropic's advanced conversational AI with enhanced reasoning</li>
            <li>USC Empowr - Specialized educational and research-focused AI with 300K token capacity</li>
            <li>Grok AI - xAI's real-time knowledge model with conversational personality</li>
            <li>Google Gemini - Multimodal AI with advanced reasoning and long-context processing</li>
            <li>Custom SLMs - Llama, Mistral, Phi-3, and other open-source models for privacy-focused deployments</li>
            <li>Multi-model chaining for complex workflows and comparative analysis</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl mb-3">Key Capabilities</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Orchestrate requests across multiple LLM providers simultaneously</li>
            <li>Chain outputs from one model as inputs to another for enhanced results</li>
            <li>Compare responses from different models side-by-side</li>
            <li>Secure Azure-based infrastructure for enterprise deployment</li>
            <li>Seamless desktop integration for efficient workflows</li>
            <li>SuperLuna AI Orchestrator with intelligent routing and SLM privacy options</li>
            <li>Section-based LLM preferences (Global, ERP, Accounting/Sales)</li>
            <li>Custom Small Language Model (SLM) configuration for on-premises deployment</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl mb-3">Why LunaAI?</h3>
          <p className="text-slate-600">
            Instead of managing multiple AI subscriptions and interfaces, LunaAI provides a unified platform 
            to leverage the strengths of different LLMs. Whether you need ChatGPT's versatility or Claude's 
            reasoning capabilities, LunaAI intelligently routes your requests and combines results for 
            optimal outcomes.
          </p>
        </section>

        <section className="mt-8">
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: '#f1f5f9' }}>
              <Box className="flex items-center gap-2">
                <NewReleases color="primary" />
                <Typography variant="h6">Release History</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box className="space-y-4">
                {/* Version 30 */}
                <Paper className="p-4 border-l-4 border-green-600 bg-green-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-green-800">Version 30 - Current Build</Typography>
                    <Chip label="June 21, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-green-700">Desktop API Upgrades, Login Performance &amp; ChatQueryType Alignment</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>ChatQueryType Mapping</strong> - Standardized provider codes: WebSearch(1), VoiceSearch(2), Empwr(3), Claude(4), Gemini(5), Grok(6), Wikipedia(7)</li>
                    <li><strong>MyDesktop Source Badges</strong> - Activity feed now displays correct AI provider badges for all sources</li>
                    <li><strong>Login Performance</strong> - Navigate to main screen immediately; geolocation, IP, log &amp; session are fire-and-forget</li>
                    <li><strong>Password Validation</strong> - Local JSON login now validates both username AND password</li>
                    <li><strong>API Auth Fallback</strong> - Switched to GET /api/Users filter (avoids broken Auth endpoint)</li>
                    <li><strong>ApiWarmupLoader</strong> - 10s max load, progress capped at 99%, no decimal display</li>
                  </ul>
                </Paper>

                {/* Version 29 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 29</Typography>
                    <Chip label="May 11, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Build Stabilization &amp; Multi-Log Login Events</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Role-Based Login Logging</strong> - postLoginEvents dispatches to AuthLog, UserNotices, UserLog, AdminLogs, SuperuserLog based on role</li>
                    <li><strong>API Auth via /api/Users</strong> - Login fallback uses GET /api/Users with plainpassword filter instead of broken Auth endpoint</li>
                  </ul>
                </Paper>

                {/* Version 28 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 28</Typography>
                    <Chip label="May 11, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Search Rebilling, Empowr &amp; Geocode Features</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Search Rebilling</strong> - Improved billing and cost tracking for AI search requests</li>
                    <li><strong>Empowr to Features</strong> - USC Empowr added to Features page</li>
                    <li><strong>Geocode to Features</strong> - Geocode lookup added to Features page</li>
                  </ul>
                </Paper>

                {/* Version 27 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 27</Typography>
                    <Chip label="May 11, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Context Based Router Configuration</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Context Router Config</strong> - Dynamic routing configuration for Luna Context Router</li>
                  </ul>
                </Paper>

                {/* Version 25 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 25</Typography>
                    <Chip label="May 9, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">HR &amp; Administrator Stability, Search Parameters &amp; Adbase Improvements</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>HR Manager Stability</strong> - Full CRUD for Employees, Store Locations, Business Units, PTO, Timesheets, Documents</li>
                    <li><strong>Administrator Stability</strong> - Edit/Update for Users, Business Units, Companies, User Groups</li>
                    <li><strong>Search Parameters</strong> - Enhanced filtering across all search modules</li>
                    <li><strong>Adbase Improvements</strong> - Enhanced activity detail tracking and data integrity</li>
                  </ul>
                </Paper>

                {/* Version 24 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 24</Typography>
                    <Chip label="May 8, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Claude &amp; Grok Search, Enterprise SQL Query Builder with D3 Graph</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Claude AI Search</strong> - Direct Anthropic Claude queries via /api/Zclaude with history</li>
                    <li><strong>Grok AI Search</strong> - xAI Grok queries via /api/ZGrok with history</li>
                    <li><strong>Enterprise SQL Query</strong> - AI-generated SQL via VoiceSearch executed against GRouter/GSwitch</li>
                    <li><strong>Publish to Graph</strong> - Filtered results render as adaptive D3 horizontal bar chart</li>
                  </ul>
                </Paper>

                {/* Version 22 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 22</Typography>
                    <Chip label="May 7, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Context Router, Search Engine Preferences &amp; SuperLuna API Integration</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Luna Context Router</strong> - Routes queries to best LLM via /api/ZLunaContextSearch</li>
                    <li><strong>SuperLuna Search</strong> - New feature page via /api/SuperLunaSearch</li>
                    <li><strong>Weather Underground</strong> - IBM Weather feature via /api/WeatherUnderground</li>
                    <li><strong>Search Engine Settings</strong> - 7 radio options with SuperLuna sub-panel</li>
                  </ul>
                </Paper>

                {/* Version 20 */}
                <Paper className="p-4 border-l-4 border-blue-600 bg-blue-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-blue-800">Version 20.0</Typography>
                    <Chip label="May 6, 2026" color="primary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-blue-700">Sortable Desktop &amp; Features Keyword Search</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Sortable Desktop</strong> - AI Text Search and Voice Commands history sortable by date</li>
                    <li><strong>Google Gemini</strong> - Multimodal AI search via /api/ZGoogle</li>
                    <li><strong>Features Keyword Search</strong> - Queries /api/WebSearch by keyword</li>
                  </ul>
                </Paper>
              </Box>
            </AccordionDetails>
          </Accordion>
        </section>
      </div>
    </div>
  );
}
