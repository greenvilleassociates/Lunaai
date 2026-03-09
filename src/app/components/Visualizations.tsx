export function Visualizations() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl mb-6">Visualizations</h2>
      <p className="text-slate-600 mb-4">
        View and analyze LLM responses through interactive visualizations and data comparisons.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">Response Comparison</h3>
          <p className="text-slate-600 text-sm">
            Compare responses from different LLM providers side-by-side to identify the best answers.
          </p>
        </div>
        <div className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">Performance Metrics</h3>
          <p className="text-slate-600 text-sm">
            Track response times, token usage, and cost metrics across all LLM providers.
          </p>
        </div>
        <div className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">Chain Analysis</h3>
          <p className="text-slate-600 text-sm">
            Visualize multi-step LLM chains and their data flow for complex workflows.
          </p>
        </div>
        <div className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">Usage Analytics</h3>
          <p className="text-slate-600 text-sm">
            Monitor usage patterns and trends across your organization's LLM requests.
          </p>
        </div>
      </div>
    </div>
  );
}
