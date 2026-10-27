import React, { useState } from 'react';
import exteriorImg from '../assets/New/Exterior Detailing.jpg'; 
import interiorImg from '../assets/New/Interior detailing.jpg';
import rustImg from '../assets/New/Rust Proofing Undercoating.jpg'; 
import towaImg from '../assets/New/Towa Body Coating.jpg';
import glassImg from '../assets/New/Glass Polishing.jpg';
import cutPolishImg from '../assets/New/Cut and Polish.jpg';
import leatherImg from '../assets/New/Leather Treatment.jpg';
import upholsteryImg from '../assets/New/Upholstery Cleaning.jpg';
import fullInteriorImg from '../assets/New/Full Interior detailing.jpg';

// 👈 Props ලෙස setCurrentTab, setSubTab, setSelectedService ලබාගන්න
const AutoDetailing = ({ darkMode, setCurrentTab, setSubTab, setSelectedService }) => {
  const [view, setView] = useState('main'); // 'main', 'exterior', 'interior', 'fullInterior'

  const pageTextClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const secondaryTextClass = darkMode ? 'text-slate-300' : 'text-gray-600';
  const subTextClass = darkMode ? 'text-slate-400' : 'text-gray-700';

  const mainDetails = [
    { title: "Exterior Detailing", img: exteriorImg, desc: "Experience our exterior detailing to make sure the long lasting shining and elegance to your vehicle." },
    { title: "Interior Detailing", img: interiorImg, desc: "Your vehicle interior will be so great; you wish you could remain inside for longer." }
  ];

  const exteriorSubServices = [
    { title: "Rust Proofing Undercoating", img: rustImg, desc: "Rustproofing and undercoating protects is important to maintain your vehicle with highest standard and more longevity." },
    { title: "Towa Body Coating", img: towaImg, desc: "Towa body coating is one of the best body coating option you may treat to your vehicle." },
    { title: "Glass Polishing", img: glassImg, desc: "Glass cleaning removes road grime, water marks, insects remain, oil, grease, and mineral deposits." },
    { title: "Cut and Polish", img: cutPolishImg, desc: "A vehicle cut and polish correct paint errors. It will remove scratches & marks from the paintwork." }
  ];

  const interiorSubServices = [
    { title: "Leather Treatment", img: leatherImg, desc: "A leather interior needs to be cleaned and nourished regularly to replace the oils that keep it supple." },
    { title: "Upholstery Cleaning", img: upholsteryImg, desc: "Proper upholstery cleaning is essential for a vehicle to keep the vehicle tidy and more elegance." },
    { title: "Full Interior detailing", img: fullInteriorImg, desc: "Experience a comprehensive interior rejuvenation." }
  ];

  // 👈 Book Now click කළ විට ක්‍රියාත්මක වන Function එක
  const handleBookNow = (serviceTitle) => {
    // Parent state එකට Selected service එක set කිරීම
    if (setSelectedService) {
      // Direct category name + service title (e.g., Exterior Detailing(Cut and Polish))
      const categoryPrefix = view === 'exterior' ? 'Exterior Detailing' : 'Interior Detailing';
      setSelectedService(`${categoryPrefix}(${serviceTitle})`);
    }

    // Booking page එකට Redirect වීම
    if (setCurrentTab && setSubTab) {
      setCurrentTab('system');
      setSubTab('booking');
    }
  };

  return (
    <div className={`max-w-6xl mx-auto py-12 px-6 transition-colors duration-300 ${pageTextClass}`}>
      {view === 'main' && (
        <div className="animate-fade-in">
          <h1 className="text-4xl font-black text-center mb-12">Auto Detailing</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {mainDetails.map((item, index) => (
              <div key={index} className={`max-w-sm border rounded-xl shadow-lg overflow-hidden ${cardClass}`}>
                <img src={item.img} alt={item.title} className="w-full h-60 object-cover" />
                <div className="p-6">
                  <h3 className="font-bold text-2xl mb-4">{item.title}</h3>
                  <p className={`mb-6 ${secondaryTextClass}`}>{item.desc}</p>
                  <button onClick={() => setView(item.title === "Exterior Detailing" ? 'exterior' : 'interior')} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg cursor-pointer">Read more</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(view === 'exterior' || view === 'interior') && (
        <div className="animate-fade-in">
          <button onClick={() => setView('main')} className="mb-6 text-blue-600 font-bold hover:underline cursor-pointer">← Back to Auto Detailing</button>
          <h1 className="text-3xl font-black mb-8">{view === 'exterior' ? 'Exterior' : 'Interior'} Detailing Services</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(view === 'exterior' ? exteriorSubServices : interiorSubServices).map((s, i) => (
              <div key={i} className={`border rounded-xl shadow-md p-4 flex flex-col justify-between ${cardClass}`}>
                <div>
                  <img src={s.img} alt={s.title} className="w-full h-40 object-cover mb-4 rounded-lg" />
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className={`text-sm mb-4 ${secondaryTextClass}`}>{s.desc}</p>
                </div>

                {/* 👈 Book Now සහ Read More වෙනස */}
                <button 
                  onClick={() => {
                    if (s.title === "Full Interior detailing") {
                      setView('fullInterior');
                    } else {
                      handleBookNow(s.title);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white w-auto px-4 py-2 rounded-lg font-bold text-sm self-start transition cursor-pointer"
                >
                  {s.title === "Full Interior detailing" ? "Read more" : "Book Now"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'fullInterior' && (
        <div className="animate-fade-in">
          <button onClick={() => setView('interior')} className="mb-6 text-blue-600 font-bold hover:underline cursor-pointer">← Back to Interior</button>
          <div className="max-w-4xl mx-auto">
            <img src={fullInteriorImg} alt="Full Interior Detailing" className="w-full h-80 object-cover rounded-2xl mb-8" />
            <h1 className="text-3xl font-black mb-4">Full Interior detailing</h1>
            <p className="mb-4">Experience a comprehensive interior rejuvenation including;</p>
            <ul className={`list-disc pl-6 space-y-2 mb-8 ${subTextClass}`}>
              <li>Remove, shampoo, and reinstall all seats</li>
              <li>Vacuuming and shampooing floorboard</li>
              <li>Shampooing carpets</li>
              <li>Shampooing upholstery boards</li>
              <li>Applying plastic care on door upholstery and dashboard</li>
              <li>Deep cleaning of interior</li>
              <li>Free Body wash</li>
            </ul>

            {/* 👈 Full Interior Page එකේ Book Now Button එක */}
            <button 
              onClick={() => handleBookNow("Full Interior detailing")} 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-md cursor-pointer"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoDetailing;