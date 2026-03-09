export function Contact() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl mb-6">Contact Us</h2>
      
      <p className="text-slate-600 mb-6">
        Have questions about LunaAI? We'd love to hear from you.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg mb-2">Email</h3>
          <p className="text-slate-600">contact@lunaai.com</p>
        </div>

        <div>
          <h3 className="text-lg mb-2">Support</h3>
          <p className="text-slate-600">support@lunaai.com</p>
        </div>

        <div>
          <h3 className="text-lg mb-2">Sales</h3>
          <p className="text-slate-600">sales@lunaai.com</p>
        </div>
      </div>
    </div>
  );
}
