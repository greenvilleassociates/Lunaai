export function Administrator() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl mb-6">Administrator</h2>
      <p className="text-slate-600 mb-4">
        Manage LunaAI settings, user permissions, and LLM provider configurations.
      </p>
      
      <div className="space-y-6 mt-8">
        <section className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">User Management</h3>
          <p className="text-slate-600 text-sm mb-4">
            Add, remove, and manage user permissions and roles within the LunaAI platform.
          </p>
          <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors">
            Manage Users
          </button>
        </section>

        <section className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">LLM Provider Settings</h3>
          <p className="text-slate-600 text-sm mb-4">
            Configure API keys, endpoints, and preferences for ChatGPT and Claude AI on Azure.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium">ChatGPT on Azure</p>
                <p className="text-sm text-slate-600">Status: Connected</p>
              </div>
              <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 transition-colors">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium">Claude AI on Azure</p>
                <p className="text-sm text-slate-600">Status: Connected</p>
              </div>
              <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 transition-colors">
                Configure
              </button>
            </div>
          </div>
        </section>

        <section className="p-6 border border-slate-200 rounded-lg">
          <h3 className="text-xl mb-3">System Configuration</h3>
          <p className="text-slate-600 text-sm mb-4">
            Adjust system-wide settings, logging, and monitoring preferences.
          </p>
          <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors">
            System Settings
          </button>
        </section>
      </div>
    </div>
  );
}
