import { Box, Typography, Paper, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore, NewReleases } from "@mui/icons-material";

export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <Box className="flex items-center justify-between mb-6">
        <h2 className="text-3xl">About LunaAI</h2>
        <Chip
          label="Version 33"
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

                {/* Version 33 */}
                <Paper className="p-4 border-l-4 border-green-600 bg-green-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-green-800">Version 33 - Current Build</Typography>
                    <Chip label="September 17, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-green-700">3-Step Authentication — Hardcoded Users, JSON Data, Azure API</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>3-Step Auth Flow</strong> - Login checks hardcoded users first, then /Data/users.json, then POST /api/Auth/login</li>
                    <li><strong>Hardcoded Users</strong> - guest/guest, admin/admin, john/john always available with no network dependency</li>
                    <li><strong>Auth Helper Refactor</strong> - Extracted authenticateLocalUser and postLoginFireAndForget to eliminate duplicated login logic</li>
                  </ul>
                </Paper>

                {/* Version 32 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 32</Typography>
                    <Chip label="September 15, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">LLM Comparisons, Voice Response &amp; Multi-Session Chat</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>LLM Comparisons</strong> - Side-by-side response view across multiple AI providers for direct quality comparison</li>
                    <li><strong>Voice Response</strong> - TTS playback button on all AI search results via /api/VoiceResponse two-step flow</li>
                    <li><strong>Multi-Session Chat</strong> - Run concurrent independent AI conversations without losing context</li>
                    <li><strong>AdBase Pro</strong> - Inline Switch toggle per campaign row; Customer Name promoted to primary column with Client ID subtitle</li>
                    <li><strong>API Auth Fix</strong> - Login now uses POST /api/Auth/login instead of client-side password matching against GET /api/Users</li>
                    <li><strong>MUI v9 Fixes</strong> - Replaced deprecated InputProps with slotProps; fixed empty-body JSON crash on 204 responses</li>
                  </ul>
                </Paper>

                {/* Version 31 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 31</Typography>
                    <Chip label="July 19, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Video Shorts, AccuWeather, Visual Prompts &amp; LunaMobile Support</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Video Shorts (VideoQuestions)</strong> - Record video clips directly in the browser; audio extracted and processed through the LunaAI voice-to-text pipeline</li>
                    <li><strong>Visual Prompts (VideoOCR)</strong> - Capture photos via device camera or upload images for AI vision analysis, classification, and OCR</li>
                    <li><strong>LunaMobile Support</strong> - ChatQueryType 100–199 identifies mobile client requests; MyDesktop shows LunaMobile badge for mobile-originated queries</li>
                    <li><strong>AccuWeather Integration</strong> - Dedicated AccuWeather page plus inline widget on MyDesktop</li>
                    <li><strong>MyDesktop Detail Modal</strong> - Full response viewer with file attachments, token/cost breakdown, and source badge</li>
                  </ul>
                </Paper>

                {/* Version 30 */}
                <Paper className="p-4 border-l-4 border-teal-600 bg-teal-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-teal-800">Version 30</Typography>
                    <Chip label="June 21, 2026" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-teal-700">Desktop API Upgrades, Login Performance &amp; ChatQueryType Alignment</Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>ChatQueryType Mapping</strong> - Standardized provider codes: WebSearch(1), VoiceSearch(2), Empwr(3), Claude(4), Gemini(5), Grok(6), Wikipedia(7)</li>
                    <li><strong>MyDesktop Source Badges</strong> - Activity feed now displays correct AI provider badges for all sources</li>
                    <li><strong>Login Performance</strong> - Navigate to main screen immediately; geolocation, IP, log &amp; session are fire-and-forget</li>
                    <li><strong>Password Validation</strong> - Local JSON login now validates both username AND password</li>
                    <li><strong>ApiWarmupLoader</strong> - 10s max load, progress capped at 99%, no decimal display</li>
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

                {/* Release 7.5 */}
                <Paper className="p-4 border-l-4 border-blue-600 bg-blue-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-blue-800">Release 7.5</Typography>
                    <Chip label="February 20, 2026" color="primary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-blue-700">HR Manager &amp; Advanced Administration</Typography>
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
                    <Typography variant="h6" className="font-bold text-purple-800">Release 7.0</Typography>
                    <Chip label="January 15, 2026" color="secondary" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-purple-700">LLM Agent Configuration &amp; Multi-Provider Support</Typography>
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
                    <Typography variant="h6" className="font-bold text-slate-800">Release 6.0</Typography>
                    <Chip label="December 1, 2025" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-slate-700">Authentication &amp; Session Management</Typography>
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
