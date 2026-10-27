import React from 'react';
import mobileAidImg from '../assets/New/Mobile First Aid.jpg';

const MobileFirstAid = ({ darkMode }) => {
  const pageClass = darkMode ? 'bg-slate-950' : 'bg-white';
  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const titleClass = darkMode ? 'text-white' : 'text-slate-900';
  const bodyClass = darkMode ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`min-h-screen py-16 px-6 transition-colors duration-300 ${pageClass}`}>
      <div className={`max-w-3xl mx-auto shadow-2xl rounded-3xl overflow-hidden border ${cardClass}`}>
        
        {/* Image */}
        <img src={mobileAidImg} alt="Mobile First Aid" className="w-full h-80 object-cover" />
        
        {/* Content */}
        <div className="p-10">
          <h1 className={`text-2xl font-black mb-6 border-l-8 border-red-600 pl-3 ${titleClass}`}>
            Mobile First Aid
          </h1>
          <p className={`text-base leading-relaxed mb-8 ${bodyClass}`}>
            Contact - 011 234 5678 / 071 234 5678 for 24-hour roadside assistance. 
            We offer reliable support when you need it most, whether it's a breakdown, 
            flat tire, or any other emergency on the road.
          </p>
          
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
            Call for Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFirstAid;