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
          <p className="text-slate-600">support@capitoltechnology.net</p>
        </div>

        <div>
          <h3 className="text-lg mb-2">Support</h3>
          <p className="text-slate-600">support@capitoltechnology.net</p>
        </div>

        <div>
          <h3 className="text-lg mb-2">Sales</h3>
          <p className="text-slate-600">sales@capitoltechnology.net</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-slate-600">
          Visit our parent at{' '}
          <a 
            href="https://www.capitoltechnology.info" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            www.capitoltechnology.info
          </a>
        </p>
      </div>
    </div>
  );
}