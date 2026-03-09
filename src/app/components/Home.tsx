import lunaLogo from "figma:asset/97a2e4984c2367786c9db0dc16a816860615bd7e.png";

export function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <img src={lunaLogo} alt="LunaAI Logo" className="w-[300px] h-[300px] rounded-2xl object-cover" />
      </div>
      <h2 className="text-3xl mb-4">Welcome to LunaAI</h2>
      <p className="text-slate-600 mb-4">
        Your intelligent LLM orchestration platform. Process requests across multiple AI models including 
        ChatGPT and Claude AI on Azure, with advanced chaining capabilities for enhanced results.
      </p>
      <p className="text-slate-600">
        Navigate through the app to learn more about how LunaAI manages multiple Large Language Models 
        to deliver powerful AI solutions to your desktop.
      </p>
    </div>
  );
}
