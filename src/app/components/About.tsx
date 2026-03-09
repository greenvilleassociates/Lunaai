export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl mb-6">About LunaAI</h2>
      
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
      </div>
    </div>
  );
}