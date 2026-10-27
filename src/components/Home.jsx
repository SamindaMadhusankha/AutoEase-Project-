import React from 'react';
import { Wrench, Car, Droplets, Settings, ShieldCheck, Zap, Gauge, History } from 'lucide-react';
import VehicleSlider from './VehicleSlider';

function Home({ darkMode, setCurrentTab, setSubTab, frontImg, diagnosticsImg, tuneupImg, detailingImg }) {
  
  const services = [
    { icon: <Wrench />, title: 'General Repair', desc: 'Expert engine and mechanical fixes.' },
    { icon: <Car />, title: 'Body Wash', desc: 'Premium exterior and interior cleaning.' },
    { icon: <Droplets />, title: 'Oil Change', desc: 'High-quality synthetic oil replacement.' },
    { icon: <Settings />, title: 'Tune-up', desc: 'Complete performance optimization.' },
    { icon: <ShieldCheck />, title: 'Diagnostics', desc: 'Computerized car health checks.' },
    { icon: <Zap />, title: 'Battery Service', desc: 'Fast battery testing and replacement.' },
    { icon: <Gauge />, title: 'Tire Service', desc: 'Pressure checks and alignment.' },
    { icon: <History />, title: 'Maintenance', desc: 'Routine high-precision care.' },
  ];

  return (
    <div className={`w-full ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img src={frontImg} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        
        <div className="relative z-20 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Expert Maintenance for Your Vehicle
          </h1>
          <p className="text-lg md:text-xl text-slate-100 mb-10 font-medium">
            Professional care, reliable repairs, and precision diagnostics under one roof.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => { setCurrentTab('system'); setSubTab('booking'); }} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105"
            >
              Book Now
            </button>
            <button 
              onClick={() => { setCurrentTab('system'); setSubTab('login'); }} 
              className="bg-white/10 hover:bg-white/20 border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg backdrop-blur-sm transition transform hover:scale-105"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* 2. Core Services Section */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className={`text-4xl font-black text-center mb-16 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Our Core Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Diagnostics", img: diagnosticsImg, desc: "Accurate fault detection using advanced systems." },
            { title: "Tune-ups", img: tuneupImg, desc: "Engine performance optimization for smoother rides." },
            { title: "Detailing", img: detailingImg, desc: "Premium aesthetic care for your vehicle's exterior." }
          ].map((service, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <img src={service.img} alt={service.title} className="w-full h-56 object-cover rounded-xl mb-6" />
              <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{service.title}</h3>
              <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. New Common Services & Repairs Section */}
      <section className={`py-20 px-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Common Services & Repairs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-3xl border transition-transform hover:-translate-y-2 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="text-blue-500 mb-4">{service.icon}</div>
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. About Section */}
      <section className={`py-16 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose AutoEase?</h2>
          <p className="text-lg text-slate-600">
            We don't just fix cars; we ensure reliability and safety. As a one-stop shop, 
            we provide end-to-end solutions for all vehicle brands using the latest industry standards.
          </p>
        </div>
      </section>

      {/* 5. Vehicle Gallery Section */}
      <section className="py-16">
        <VehicleSlider darkMode={darkMode} />
      </section>
    </div>
  );
}

export default Home;