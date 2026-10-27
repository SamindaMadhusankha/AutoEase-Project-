import React, { useState } from 'react';

// Main Services Images
import periodicImg from '../assets/New/Periodical Maintenance.webp';
import mechanicalImg from '../assets/New/Mechanical Repair.webp';
import hvImg from '../assets/New/High Voltage System.jpg';
import electricalImg from '../assets/New/Electrical & Electronic.jpg';
import acImg from '../assets/New/AC Repair and Service.webp';
import inspectionImg from '../assets/New/Mulipoint Inspection Report.jpg';

// Sub-services Imports
import coolentImg from '../assets/New/Coolant Change.jpg';
import brakeFluidImg from '../assets/New/Brake fluid change.jpg';
import brakePadImg from '../assets/New/Brake Pad Replace.jpg';
import engineTuneImg from '../assets/New/Engine Tune Up.jpg';
import transmissionFluidImg from '../assets/New/Transmission Fluid Change.jpg';
import brakeRepairImg from '../assets/New/Brake Repair.jpg';
import suspensionRepairImg from '../assets/New/Suspension Repair.jpg';
import transmissionRepairImg from '../assets/New/Transmission Repair.jpg';
import engineRepairImg from '../assets/New/Engine Repair.jpg';
import hybridMaintenanceImg from '../assets/New/Hybrid System Maintenance.jpg';
import hvFaultRepairImg from '../assets/New/HV System Fault Repair.jpg';
import hvFaultDiagnosisImg from '../assets/New/HV System Fault Diagnosis.jpg';
import electronicRepairImg from '../assets/New/Electronic Repair.jpg';
import vehicleProgrammingImg from '../assets/New/Vehicle Programming.jpg';
import electricalSystemRepairImg from '../assets/New/Electrical System Repair.jpg';
import vehicleScanningImg from '../assets/New/Vehicle Scanning.jpg';
import acServiceImg from '../assets/New/AC Service.jpg';
import acRepairImg from '../assets/New/AC Repair.jpg';

// 👈 setSelectedService Prop එක එකතු කළා
const Services = ({ darkMode, setCurrentTab, setSubTab, setSelectedService }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const pageTextClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-300' : 'text-gray-600';
  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const subCardClass = darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200';

  const Vehicle_Repair = [
    { id: 'periodic', title: "Periodical Maintenance", img: periodicImg, desc: "Proper maintenance is essential to keep the vehicle functioning properly." },
    { id: 'mechanical', title: "Mechanical Repair", img: mechanicalImg, desc: "Precise technical knowledge and the right tools for repairs." },
    { id: 'hv', title: "High Voltage System", img: hvImg, desc: "Expertise in diagnosing and resolving issues in high-voltage systems." },
    { id: 'electrical', title: "Electrical & Electronic", img: electricalImg, desc: "Troubleshooting complex electrical systems in automobiles." },
    { id: 'ac', title: "A/C Repair and Service", img: acImg, desc: "Repairs and services of the air conditioning systems." },
    { id: 'inspection', title: "Mulipoint Inspection Report", img: inspectionImg, desc: "Detailed assessment based on 140+ inspection points." }
  ];
  
  const subVehicle_Repair = {
    periodic: [
      { title: "Coolant Change", img: coolentImg, desc: "Proper maintenance of the cooling system and use of proper coolant is one of the factors that contribute to engine life." },
      { title: "Brake fluid change", img: brakeFluidImg, desc: "The brake system is one of the most essential safety systems that must be properly operated in a vehicle." },
      { title: "Brake Pad Replace", img: brakePadImg, desc: "The brake system is one of the most essential safety systems that must be properly operated in a vehicle." },
      { title: "Engine Tune Up", img: engineTuneImg, desc: "Proper engine tune up for a vehicle is essential for doing periodically to make the constant performance." },
      { title: "Transmission Fluid Change", img: transmissionFluidImg, desc: "Gear oil is an essential element to prevent overheating of the transmission system." }
    ],
    mechanical: [
      { title: "Brake Repair", img: brakeRepairImg, desc: "The brake system is one of the core safety features in a motor vehicle." },
      { title: "Suspension Repair", img: suspensionRepairImg, desc: "The one main fact of vehicle comparability assured by good suspension system and car manufacturers." },
      { title: "Transmission Repair", img: transmissionRepairImg, desc: "The gear system is considered to be one of the most important and complex systems in the vehicle." },
      { title: "Engine Repair", img: engineRepairImg, desc: "Vehicle engine is one of main mechanical component of the vehicle." }
    ],
    hv: [
      { title: "Hybrid System Maintenance", img: hybridMaintenanceImg, desc: "Hybrid batteries in hybrid or electric vehicles are one of the core component of the vehicle." },
      { title: "HV System Fault Repair", img: hvFaultRepairImg, desc: "The diagnosed HV system faults need to be correctly repair and fixed for the proper function." },
      { title: "HV System Fault Diagnosis", img: hvFaultDiagnosisImg, desc: "High voltage system is one of the placed that highest advanced technology used in a vehicle." }
    ],
    electrical: [
      { title: "Electronic Repair", img: electronicRepairImg, desc: "Today's world many vehicles comes with high tech electrical systems contain of many expensive cont..." },
      { title: "Vehicle Programming", img: vehicleProgrammingImg, desc: "Vehicle programming is one of the core function required to use modern high tech vehicles in today..." },
      { title: "Electrical System Repair", img: electricalSystemRepairImg, desc: "Electrical faults do not usually appear as mechanical faults, and the services of expert automotive..." },
      { title: "Vehicle Scanning", img: vehicleScanningImg, desc: "Vehicle scanning is a essential process to diagnose the faults of the vehicle and today's world, s..." }
    ],
    ac: [
      { title: "A/C Service", img: acServiceImg, desc: "Air conditioning system is a crucial component of a vehicle to provide comfortability of the vehicle." },
      { title: "A/C Repair", img: acRepairImg, desc: "Air conditioning system is a crucial component of a vehicle to provide comfortability of the vehicle." }
    ],
    inspection: [
      { title: "Mulipoint Inspection Report", img: inspectionImg, desc: "Our multi point inspection report gives you the right assessment of the vehicle with over 140 touch points." }
    ]
  };

  // 👈 Sub-service Title එක argument එකක් ලෙස ලබා ගැනේ
  const handleBookNow = (subTitle) => {
    // Current category object එක සොයා ගැනේ
    const categoryObj = Vehicle_Repair.find(item => item.id === activeCategory);
    const categoryTitle = categoryObj ? categoryObj.title : '';

    // "Periodic Maintenance(Coolant Change)" ආකෘතියට format කිරීම
    const formattedService = `${categoryTitle}(${subTitle})`;

    // State එක Update කිරීම
    if (setSelectedService) {
      setSelectedService(formattedService);
    }

    // Booking Tab එකට Redirect වීම
    setCurrentTab('system');
    setSubTab('booking');
  };

  return (
    <div className={`max-w-6xl mx-auto py-12 px-6 transition-colors duration-300 ${pageTextClass}`}>
      {!activeCategory ? (
        <>
          <h1 className="text-4xl font-black text-center mb-12">Our Services</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Vehicle_Repair.map((item) => (
              <div key={item.id} className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition ${cardClass}`}>
                <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className={`text-sm mb-4 ${mutedTextClass}`}>{item.desc}</p>
                  <button onClick={() => setActiveCategory(item.id)} className="bg-red-600 text-white px-4 py-2 rounded">Read more</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setActiveCategory(null)} className="mb-6 text-blue-600 font-bold hover:underline">← Back to Services</button>
          <h1 className="text-4xl font-black text-center mb-12 capitalize">{activeCategory} Services</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subVehicle_Repair[activeCategory]?.map((sub, index) => (
              <div key={index} className={`border rounded-lg shadow-sm p-6 flex flex-col h-full ${subCardClass}`}>
                <div className="flex-grow">
                  <img src={sub.img} alt={sub.title} className="w-full h-40 object-cover mb-4 rounded" />
                  <h3 className="font-bold text-lg mb-2">{sub.title}</h3>
                  <p className={`text-sm mb-6 ${mutedTextClass}`}>{sub.desc}</p>
                </div>
                <div className="mt-auto">
                  {/* 👈 Sub-service Title එක handleBookNow එකට Pass කර ඇත */}
                  <button onClick={() => handleBookNow(sub.title)} className="bg-red-600 text-white px-4 py-1.5 text-sm rounded font-bold hover:bg-red-700 transition w-auto">Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;