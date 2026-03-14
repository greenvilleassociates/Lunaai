import { Box, Typography, Paper, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore, NewReleases } from "@mui/icons-material";

export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <Box className="flex items-center justify-between mb-6">
        <h2 className="text-3xl">About LunaAI</h2>
        <Chip 
          label="Release 8.0" 
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
                {/* Release 8.0 */}
                <Paper className="p-4 border-l-4 border-green-600 bg-green-50">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6" className="font-bold text-green-800">
                      Release 8.0 - Current Build
                    </Typography>
                    <Chip label="March 13, 2026" color="success" size="small" />
                  </Box>
                  <Typography variant="subtitle2" className="mb-3 text-green-700">
                    SuperLuna AI Orchestrator & Custom SLM Integration
                  </Typography>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>SuperLuna AI Orchestrator</strong> - Intelligent LLM routing with priority management</li>
                    <li><strong>Section-Based Preferences</strong> - Separate configurations for Global, ERP, and Accounting/Sales workflows</li>
                    <li><strong>SLM Privacy Mode</strong> - Enterprise data protection with local Small Language Models</li>
                    <li><strong>Custom SLM Configuration</strong> - Support for Llama, Mistral, Phi-3, and open-source models</li>
                    <li><strong>Google Gemini Integration</strong> - Added Gemini Pro with 8K token capacity and multimodal support</li>
                    <li><strong>USC Empowr Enhancement</strong> - Increased token capacity to 300,000 for research tasks</li>
                    <li><strong>Automatic Fallback</strong> - Smart defaults to ChatGPT when no SLM is available</li>
                    <li><strong>Enhanced Security</strong> - On-premises SLM deployment options for sensitive data</li>
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
                    HR Manager & Advanced Administration
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
                    LLM Agent Configuration & Multi-Provider Support
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
                    Authentication & Session Management
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