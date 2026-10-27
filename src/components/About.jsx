import React from 'react';
import autoEaseLogo from '../assets/logo.png';

function About({ darkMode }) {
  const pageClass = darkMode ? 'bg-[#0b162c] text-gray-100' : 'bg-white text-gray-900';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const introTextClass = darkMode ? 'text-gray-300' : 'text-gray-600';
  const cardClass = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardTextClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const valuesSectionClass = darkMode ? 'bg-[#142340]' : 'bg-gray-50';
  const valuesCardClass = darkMode ? 'bg-[#0b162c]' : 'bg-white';
  const valuesTextClass = darkMode ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className={`${pageClass} min-h-screen transition-colors duration-500`}>
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className={`flex flex-col md:flex-row items-center justify-between border-b pb-12 ${borderClass}`}>
          <div className="md:w-3/5">
            <h1 className={`text-5xl font-black mb-6 ${valuesTextClass}`}>About AutoEase</h1>
            <p className={`leading-relaxed text-lg ${introTextClass}`}>
              AutoEase is your premier destination for professional automotive care. We are committed to providing top-quality service, ensuring your vehicle remains in peak condition.
            </p>
          </div>
          <img src={autoEaseLogo} alt="AutoEase Logo" className="w-56 mt-8 md:mt-0" />
        </div>

        {/* Vision & Mission - Responsive Cards */}
        <div className="grid md:grid-cols-2 gap-8 py-16">
          {[
            { title: "Vision", desc: "To be the most trusted automotive partner by delivering innovative solutions and unmatched service excellence." },
            { title: "Mission", desc: "To empower vehicle owners with reliable care, cutting-edge technology, and a commitment to quality." }
          ].map((item, index) => (
            <div key={index} className={`p-10 rounded-2xl border-l-8 border-red-600 shadow-lg ${cardClass}`}>
              <h2 className={`text-3xl font-bold mb-4 ${valuesTextClass}`}>{item.title}</h2>
              <p className={`leading-relaxed ${cardTextClass}`}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className={`${valuesSectionClass} p-10 rounded-3xl shadow-xl`}>
          <h2 className={`text-4xl font-black mb-12 text-center uppercase ${valuesTextClass}`}>Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Positivity: Approaching every challenge with a positive mindset.",
              "Simplicity: Creating great results through honest solutions.",
              "Determination: Unwavering commitment to excellence.",
              "Adaptation: Evolving with global technological trends.",
              "Honesty: Transparency is the foundation of our work."
            ].map((val, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl shadow-sm ${valuesCardClass}`}>
                <div className="text-red-600 font-bold text-xl">●</div>
                <p className={`font-medium ${valuesTextClass}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;