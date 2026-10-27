import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0a141c] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Company information section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">AutoEase</h2>
          <p className="text-gray-400 text-sm">
            Join us for reliable vehicle services and technical solutions.
          </p>
        </div>

        {/* Services section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Services</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Engine Diagnostics</li>
            <li>Vehicle Repair</li>
            <li>Auto Detailing</li>
            <li>Emergency Time</li>
          </ul>
        </div>

        {/* Quick links section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Home</li>
            <li>About Us</li>
            <li>Services</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Contact information section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contact Us</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📍 Colombo 07, Sri Lanka</li>
            <li>📞 +94 11 234 5678</li>
            <li>✉️ info@autoease.com</li>
          </ul>
        </div>
      </div>

      {/* Copyright section */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        <p>© 2026 AutoEase. All Rights Reserved. | Developed by Your Team</p>
      </div>
    </footer>
  );
};

export default Footer;