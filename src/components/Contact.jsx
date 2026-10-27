import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

function Contact({ darkMode }) {
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Main Content */}
      <main className="flex-grow py-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Contact Us</h1>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { title: "Email Address", val: ["info@autoease.com"], icon: <Mail size={32} /> },
              { title: "Phone Number", val: ["+94 11 234 5678", "+94 71 234 5678"], icon: <Phone size={32} /> },
              { title: "Office Address", val: ["AutoEase Core, Colombo 07"], icon: <MapPin size={32} /> }
            ].map((item, idx) => (
              <div key={idx} className={`p-8 rounded-3xl border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="text-blue-500 mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <div className="text-blue-600 font-medium">
                  {item.val.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Map Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-black mb-6 text-center">Find Us on Map</h2>
            <div className="w-full h-96 rounded-3xl overflow-hidden border shadow-xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7985787257263!2d79.86124317503889!3d6.914674793077797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25963120b22d9%3A0x673c683b58473855!2sColombo%2007!5e0!3m2!1sen!2slk!4v1680000000000!5m2!1sen!2slk" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contact;