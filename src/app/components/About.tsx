import { Box, Typography, Paper, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore, NewReleases } from "@mui/icons-material";
import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";

export function About() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* Hero */}
      <Box className="flex flex-col items-center gap-4 mb-8 py-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg">
        <img
          src={lunaLogo}
          alt="LunaAI Logo"
          style={{ width: 300, height: 300, borderRadius: 24, objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        />
        <Typography variant="h3" className="text-white font-bold tracking-tight">
          LunaAI
        </Typography>
        <Typography variant="subtitle1" className="text-slate-400 text-center max-w-md px-4">
          Intelligent orchestration platform for managing multiple Large Language Models
        </Typography>
        <Chip
          label="Version 28 — Current Build"
          color="success"
          icon={<NewReleases />}
          sx={{ fontSize: '0.95rem', padding: '18px 10px', fontWeight: 600 }}
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

        <section>
          <h3 className="text-xl mb-3">SuperLuna — Multi-Model Chaining</h3>
          <p className="text-slate-600 mb-3">
            SuperLuna is LunaAI's flagship orchestration mode. A single query is dispatched simultaneously
            to up to <strong>7 LLMs</strong> in one payload. Each provider processes the request independently
            and SuperLuna aggregates, ranks, and returns a synthesized result — giving you breadth of
            knowledge and cross-validation in a single search.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
            <li>Chain up to 7 providers: ChatGPT, Claude, Empowr, Grok, Gemini, and custom SLMs</li>
            <li>Configure Max Search Engines (1–7) and enable Chain Search in Settings → Search Engine</li>
            <li>Results are aggregated server-side via /api/SuperLunaSearch</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl mb-3">Context-Based Routing</h3>
          <p className="text-slate-600 mb-3">
            The <strong>Luna Context Router</strong> automatically detects the topic domain of your query
            and routes it to the LLM or SLM best suited for that domain. Context domains such as
            <em> Sports, Medicine, Food, Weather, Legal, Finance,</em> and <em>Technology</em> can each
            be mapped to a specific provider — ensuring specialist models answer specialist questions.
          </p>
          <p className="text-slate-600 mb-3">
            For example, a sports query can be directed to Grok (real-time knowledge), a medical question
            to Claude (advanced reasoning and safety), and a weather query to Gemini (multimodal and
            real-time data). Privacy-sensitive domains can be routed to an on-premises Custom SLM so
            sensitive data never leaves your network.
          </p>
          <p className="text-slate-600 text-sm bg-blue-50 border border-blue-200 rounded p-3">
            <strong>Configuration:</strong> Context domain → LLM mappings are managed in
            <strong> Settings → Context Router</strong>. Mappings are saved locally as JSON and
            sent with each query so the router knows which model to invoke.
          </p>
        </section>

        {/* Release History Section */}
        <section className="mt-8">
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ backgroundColor: '#f1f5f9' }}
            >
              <Box className="flex items-center gap-2">
                <NewReleases color="primary" />
                <Typography variant="h6">Release History</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box className="space-y-4">

                {/* Version 28 */}
                <Paper className="p-4 border-l-4 border-green-600 bg-green-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-green-800">
                      Version 28 - Current Build
                    </Typography>
                    <Chip label="May 11, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-green-700">
                    Search Billing, Geocoder, Security9 Log Manager &amp; Ask Luna
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Search Billing</strong> — New home page panel showing all /api/Websearch activity per user with per-search rebill rate and invoice generation</li>
                    <li><strong>Search Pricing Settings</strong> — New Settings tab to configure per-search rebill rate (default 5¢)</li>
                    <li><strong>IBM Geocoder</strong> — New /geocoder page calling /api/Geocoder with lat/lon inputs, full IBM response display, and Google Maps embed</li>
                    <li><strong>Empowr on Features</strong> — Empowr Enterprise Search added as Feature #13 on the Features page</li>
                    <li><strong>Security9 Log Manager</strong> — All 9 log APIs wired (/api/Adminlogs, /api/Apilogs, /api/Authlog, /api/Sessionlog, /api/Superuserlog, /api/Useractions, /api/Userlog, /api/Usernotices, /api/Usersession) with dynamic tab rendering and live API fetch</li>
                    <li><strong>Log Manager Settings</strong> — New Settings tab to enable/disable each of the 9 Security log APIs individually</li>
                    <li><strong>Ask Luna</strong> — Voice shortcut on Home page navigating directly to Start Recording</li>
                    <li><strong>API Warmup Ads</strong> — BannerAd commercials displayed on the Getting Ready loader; 60-second countdown shown below Luna logo</li>
                    <li><strong>Pre-login Warmup GET</strong> — Silent GET /api/Bu fires on Login page mount to wake the Azure API before any user input</li>
                  </ul>
                </Paper>

                {/* Version 27 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">
                      Version 27
                    </Typography>
                    <Chip label="May 11, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">
                    Login Stability, API Warmup Timeout &amp; Adbase Helper
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Login Fix</strong> — Authentication now uses GET /api/Users with client-side username/password filter; POST /api/Auth/login retired temporarily</li>
                    <li><strong>API Warmup Timeout</strong> — Warmup loader capped at 60 seconds maximum to prevent indefinite hangs</li>
                    <li><strong>AdbaseHelper</strong> — New postAdbase and postAdbaseMany helpers for individual and batch ad event posting via loop (nested JSON not yet supported server-side)</li>
                    <li><strong>Banner Ad Impression Queue</strong> — Ad impressions during login are queued and flushed to /api/Addbase only after uid is available post-login</li>
                    <li><strong>companyId</strong> — Now correctly stored in localStorage from API user record on login</li>
                  </ul>
                </Paper>

                {/* Version 26 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">
                      Version 26
                    </Typography>
                    <Chip label="May 10, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">
                    Adbase Activity Tracking &amp; Login Improvements
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Adbase Integration</strong> — Banner ad impression tracking wired to /api/Addbase with uid, IP, and geolocation</li>
                    <li><strong>Login Enhancements</strong> — Improved session handling, geolocation capture, and localStorage field population</li>
                    <li><strong>API Warmup Loader</strong> — Pre-login API warmup screen with animated status indicators</li>
                    <li><strong>Stability Improvements</strong> — General bug fixes and error handling across components</li>
                  </ul>
                </Paper>

                {/* Version 25 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">
                      Version 25
                    </Typography>
                    <Chip label="May 9, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">
                    HR &amp; Administrator Stability, Search Parameters &amp; Adbase Improvements
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>HR Manager Stability</strong> - Full CRUD operations for all tabs: Employees, Store Locations, Business Units, PTO Requests, Timesheets, and Employee Documents</li>
                    <li><strong>Administrator Stability</strong> - Complete Edit/Update functionality for Users, Business Units, Companies, and User Groups with icon-based actions</li>
                    <li><strong>Search Parameters</strong> - Enhanced search filtering and query parameter support across all search modules</li>
                    <li><strong>Adbase Improvements</strong> - Enhanced activity detail tracking, management features, and data integrity</li>
                  </ul>
                </Paper>

                {/* Version 24 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">
                      Version 24
                    </Typography>
                    <Chip label="May 8, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">
                    Claude &amp; Grok Search, Enterprise SQL Query Builder with D3 Graph
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Claude AI Search</strong> - Direct Anthropic Claude queries via /api/Zclaude with history</li>
                    <li><strong>Grok AI Search</strong> - xAI Grok queries via /api/ZGrok with history</li>
                    <li><strong>Enterprise SQL Query</strong> - AI-generated SQL via VoiceSearch executed against GRouter/GSwitch</li>
                    <li><strong>SQL → JS Translation</strong> - Client-side filter engine with WHERE, ORDER BY, TOP, LIKE, IN support</li>
                    <li><strong>Publish to Graph</strong> - Radio target (GRouter/GSwitch) renders filtered results as adaptive D3 horizontal bar chart</li>
                  </ul>
                </Paper>

                {/* Version 22 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">
                      Version 22
                    </Typography>
                    <Chip label="May 7, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">
                    Context Router, Search Engine Preferences &amp; SuperLuna API Integration
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Luna Context Router</strong> - New feature routing queries to best LLM via /api/ZLunaContextSearch with ABC icon</li>
                    <li><strong>SuperLuna Search</strong> - New feature page via /api/SuperLunaSearch with SuperLuna logo</li>
                    <li><strong>Weather Underground</strong> - New IBM Weather feature via /api/WeatherUnderground</li>
                    <li><strong>SuperLuna API Integration</strong> - SuperLuna config page now POSTs/PUTs to /api/SuperLuna with correct llM1–llM20 schema</li>
                    <li><strong>Search Engine Settings Tab</strong> - 7 radio options with SuperLuna sub-panel for maxsearchengines and chain search</li>
                    <li><strong>User Preferences</strong> - dse, maxsearchengines, chainsearch fields added to user record and localStorage</li>
                    <li><strong>AI Search Sort</strong> - Search history defaults to newest-first with arrow toggle</li>
                  </ul>
                </Paper>

                {/* Version 21 */}
                <Paper className="p-4 border-l-4 border-blue-400 bg-blue-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-blue-800">
                      Version 21
                    </Typography>
                    <Chip label="May 7, 2026" color="primary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-blue-700">
                    SuperLuna Orchestration &amp; Multi-Provider Search Features
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Google Gemini Search</strong> - New feature via /api/ZGoogle integration</li>
                    <li><strong>Empowr Search</strong> - Enterprise search via /api/ZEmpwr</li>
                    <li><strong>SuperLuna Config</strong> - Full LLM priority ordering with Global, ERP, and Accounting sections</li>
                    <li><strong>Backup API</strong> - Configurable fallback API destination in Settings</li>
                  </ul>
                </Paper>

                {/* Version 20 */}
                <Paper className="p-4 border-l-4 border-blue-600 bg-blue-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-blue-800">
                      Version 20.0
                    </Typography>
                    <Chip label="May 6, 2026" color="primary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-blue-700">
                    Sortable Desktop &amp; Features Keyword Search
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Sortable Desktop</strong> - AI Text Search History and Voice Commands History panels sortable by date via arrow toggle buttons</li>
                    <li><strong>Refresh Button</strong> - Dedicated refresh button on both Desktop history panels</li>
                    <li><strong>UID Column</strong> - Poster UID shown in left column of each Desktop history row</li>
                    <li><strong>Features Keyword Search</strong> - Text Search on the Features page now queries /api/WebSearch and returns matching records by keyword</li>
                    <li><strong>Centercourt Panel</strong> - Real-Time Graphics tab with 800×800 iframe, PDF snapshot export</li>
                  </ul>
                </Paper>

                {/* Release 7.5 */}
                <Paper className="p-4 border-l-4 border-blue-600 bg-blue-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-blue-800">
                      Release 7.5
                    </Typography>
                    <Chip label="February 20, 2026" color="primary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-blue-700">
                    HR Manager &amp; Advanced Administration
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>HR Manager System</strong> - Complete team and manager designation</li>
                    <li><strong>Business Unit Management</strong> - Multi-store/branch assignment with Corporate HQ auto-creation</li>
                    <li><strong>Settings Page</strong> - Tabbed superuser interface for LLM, API, Security, and System configuration</li>
                    <li><strong>Role-Based Access Control</strong> - Enhanced permissions for superusers and company admins</li>
                  </ul>
                </Paper>

                {/* Release 7.0 */}
                <Paper className="p-4 border-l-4 border-purple-600 bg-purple-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-purple-800">
                      Release 7.0
                    </Typography>
                    <Chip label="January 15, 2026" color="secondary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-purple-700">
                    LLM Agent Configuration &amp; Multi-Provider Support
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>LLM Agent Management</strong> - Configure ChatGPT, Claude, USC Empowr, and Grok AI</li>
                    <li><strong>EntraID Authentication</strong> - Microsoft Azure AD integration for enterprise security</li>
                    <li><strong>Dynamic Configuration</strong> - JSON-based agent settings with temperature, tokens, and prompts</li>
                    <li><strong>API-First Architecture</strong> - Azure backend with local JSON fallback</li>
                  </ul>
                </Paper>

                {/* Release 6.0 */}
                <Paper className="p-4 border-l-4 border-slate-600 bg-slate-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-slate-800">
                      Release 6.0
                    </Typography>
                    <Chip label="December 1, 2025" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-slate-700">
                    Authentication &amp; Session Management
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>User Authentication</strong> - Complete login/logout system with session tracking</li>
                    <li><strong>Geolocation Tracking</strong> - Login location capture for security auditing</li>
                    <li><strong>IP Address Logging</strong> - Network security and access monitoring</li>
                    <li><strong>Protected Routes</strong> - Role-based page access control</li>
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
