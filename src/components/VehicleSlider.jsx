import React from 'react';
import { motion } from 'framer-motion';

import car1 from '../assets/vehi/icon-1.png';
import car2 from '../assets/vehi/icon-2.png';
import car3 from '../assets/vehi/icon-3.png';
import car4 from '../assets/vehi/icon-4.png';
import car5 from '../assets/vehi/icon-5.png';
import car6 from '../assets/vehi/icon-6.png';
import car7 from '../assets/vehi/icon-7.png';
import car8 from '../assets/vehi/icon-8.png';
import car9 from '../assets/vehi/icon-9.png';
import car10 from '../assets/vehi/icon-10.png';
import car11 from '../assets/vehi/icon-11.png';
import car12 from '../assets/vehi/icon-12.png';
import car13 from '../assets/vehi/icon-13.png';
import car14 from '../assets/vehi/icon-14.png';
import car15 from '../assets/vehi/icon-15.png';
import car16 from '../assets/vehi/icon-16.png';
import car17 from '../assets/vehi/icon-17.png';
import car18 from '../assets/vehi/icon-18.png';
import car19 from '../assets/vehi/icon-19.png';
import car20 from '../assets/vehi/icon-20.webp';

const vehicles = [
  { name: "Toyota", img: car1 },
  { name: "Suzuki", img: car2 },
  { name: "Mitsubishi", img: car3 },
  { name: "Honda", img: car4 },
  { name: "Mazda", img: car5 },
  { name: "JAGUAR", img: car6 },
  { name: "Audi", img: car7 },
  { name: "MG", img: car8 },
  { name: "Bens", img: car9 },
  { name: "Land Rover", img: car10 },
  { name: "Nissan", img: car11 },
  { name: "Mini", img: car12 },
  { name: "Perodua", img: car13 },
  { name: "Lexus", img: car14 },
  { name: "Daihatsu", img: car15 },
  { name: "Ford", img: car16 },
  { name: "Volkswagen", img: car17 },
  { name: "Peugeot", img: car18 },
  { name: "Subaru", img: car19 },
  { name: "BYD", img: car20 },
];

const VehicleSlider = ({ darkMode }) => {
  return (
    <div className="py-12 overflow-hidden bg-white dark:bg-slate-950">
      <motion.div 
        className="flex gap-6" 
        animate={{ 
          x: ["0%", "-20%", "-20%", "-40%", "-40%", "-60%", "-60%", "-80%", "-80%", "0%"] 
        }}
        transition={{ 
          duration: 40, // මෙතන 40 කරලා තියෙන්නේ ගොඩක් slow වෙන්න
          ease: "easeInOut", 
          repeat: Infinity,
          times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 0.9, 0.95, 1]
        }}
      >
        {[...vehicles, ...vehicles].map((v, i) => (
          <div key={i} className="min-w-[120px] md:min-w-[140px] p-1"> 
            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl shadow-sm border dark:border-slate-800 transition-all hover:scale-105">
              <img src={v.img} alt={v.name} className="w-full h-16 object-contain rounded-lg" />
              <p className="mt-2 text-center font-semibold text-[10px] md:text-xs text-slate-500">{v.name}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default VehicleSlider;