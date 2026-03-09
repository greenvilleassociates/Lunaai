import Iframe from "react-iframe";

export function TextSearch() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Text Search</h1>
        <p className="text-slate-600">
          Search through previous prompts, responses, and LLM interactions
        </p>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <Iframe
          url="https://console.capitoltechnology.net"
          width="100%"
          height="100%"
          id="textSearchIframe"
          className="border-0"
          display="block"
          position="relative"
          allowFullScreen
        />
      </div>
    </div>
  );
}
