import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

import periodicMaintImg from '../assets/New/Periodic Maintenance main.jpg';
import lubricantServiceImg from '../assets/New/Lubricant Service.jpg';
import washDetailImg from '../assets/New/Wash & Detail.jpg';

// -------------------------------------------------------------
// 1. UPDATED BOOKING MODAL (SAME LOGIC AS BOOKING.JSX)
// -------------------------------------------------------------
const BookingModal = ({ isOpen, onClose, serviceTitle, darkMode, user }) => {
  const MAX_SLOT_LIMIT = 2;

  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    vehicleNumber: '',
    model: '',
    fuelType: 'Petrol',
    serviceTitle: serviceTitle || 'Periodic Maintenance',
    date: '',
    time: ''
  });

  const [slotCounts, setSlotCounts] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 📅 Date Limits (Today to Next 7 Days)
  const todayObj = new Date();
  const minDate = todayObj.toISOString().split('T')[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(todayObj.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Update selected service title when modal opens
  useEffect(() => {
    if (serviceTitle) {
      setFormData(prev => ({ ...prev, serviceTitle }));
    }
  }, [serviceTitle]);

  // Autofill user phone if logged in
  useEffect(() => {
    if (user && user.email) {
      const phoneNumber = user.email.split('@')[0];
      setFormData(prev => ({ ...prev, phone: phoneNumber }));
    }
  }, [user]);

  // Fetch Firestore slot availability when date changes
  useEffect(() => {
    const fetchSlotAvailability = async () => {
      if (!formData.date) return;

      setLoadingSlots(true);
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("date", "==", formData.date));
        const querySnapshot = await getDocs(q);

        const counts = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'Cancelled' && data.time) {
            counts[data.time] = (counts[data.time] || 0) + 1;
          }
        });

        setSlotCounts(counts);
      } catch (error) {
        console.error("Error checking slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlotAvailability();
  }, [formData.date]);

  // ⏱️ Generate 30-Min Time Slots (8:30 AM - 5:00 PM)
  const generateTimeSlots = () => {
    const times = [];
    for (let i = 510; i <= 1020; i += 30) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      const formattedHour = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const time12 = `${formattedHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      
      times.push({ time24, time12 });
    }
    return times;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.time) {
      alert("❌ කරුණාකර වේලාවක් (Time Slot) තෝරන්න!");
      return;
    }

    setSubmitting(true);
    try {
      // Double check availability before final submit
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef, 
        where("date", "==", formData.date), 
        where("time", "==", formData.time)
      );
      const querySnapshot = await getDocs(q);
      const activeBookings = querySnapshot.docs.filter(doc => doc.data().status !== 'Cancelled').length;

      if (activeBookings >= MAX_SLOT_LIMIT) {
        alert("❌ කණගාටුයි! මෙම Time Slot එක සඳහා දැනටමත් Bookings පිරී ඇත. වෙනත් වේලාවක් තෝරන්න.");
        setSubmitting(false);
        return;
      }

      const formattedPhone = formData.phone.trim();
      const derivedEmail = user ? user.email : `${formattedPhone}@autoease.com`;

      await addDoc(collection(db, "bookings"), {
        ...formData,
        phone: formattedPhone,
        customerEmail: derivedEmail,
        status: 'Pending',
        createdAt: new Date()
      });

      alert("✅ Your booking has been confirmed!");
      
      // Reset Form State
      setFormData({ 
        ownerName: '', 
        phone: user ? user.email.split('@')[0] : '', 
        vehicleNumber: '', 
        model: '', 
        fuelType: 'Petrol',
        serviceTitle: serviceTitle || 'Periodic Maintenance', 
        date: '', 
        time: '' 
      });
      setSlotCounts({});
      onClose();
    } catch (error) {
      alert("❌ Error saving booking: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-2xl border ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        } max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>📅</span> Book Your Service
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Select date and available time slot to schedule your appointment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Customer Name</label>
              <input 
                type="text" 
                placeholder="Enter Name" 
                className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.ownerName} 
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Phone Number</label>
              <input 
                type="tel" 
                placeholder="07XXXXXXXX (10 Digits)" 
                className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.phone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({...formData, phone: val});
                }} 
                required 
              />
            </div>
          </div>

          {/* Vehicle No & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Vehicle Number</label>
              <input 
                type="text" 
                placeholder="e.g. WP CAB-1234" 
                className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 uppercase font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.vehicleNumber} 
                onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Vehicle Model</label>
              <input 
                type="text" 
                placeholder="e.g. Toyota Axio" 
                className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.model} 
                onChange={(e) => setFormData({...formData, model: e.target.value})} 
                required 
              />
            </div>
          </div>

          {/* Fuel Type & Service Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Fuel Type</label>
              <select 
                className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold outline-none cursor-pointer" 
                value={formData.fuelType} 
                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="EV">Electric (EV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Service Type</label>
              <select 
                className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold outline-none cursor-pointer" 
                value={formData.serviceTitle} 
                onChange={(e) => setFormData({...formData, serviceTitle: e.target.value})}
              >
                <option value="Periodic Maintenance">Periodic Maintenance</option>
                <option value="Lubricant Service">Lubricant Service</option>
                <option value="Wash & Detail">Wash & Detail</option>
              </select>
            </div>
          </div>

          {/* Select Date */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">Select Service Date</label>
            <input 
              type="date" 
              min={minDate}
              max={maxDate}
              className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
              value={formData.date} 
              onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} 
              required 
            />
          </div>

          {/* Time Slot Selection Grid */}
          {formData.date && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase text-slate-400">
                  Select Time Slot (30 Mins Interval)
                </label>
                {loadingSlots && (
                  <span className="text-xs font-extrabold text-blue-500 animate-pulse">
                    ⚡ Checking live capacity...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {generateTimeSlots().map(({ time24, time12 }) => {
                  const count = slotCounts[time24] || 0;
                  const isFull = count >= MAX_SLOT_LIMIT;
                  const isSelected = formData.time === time24;

                  return (
                    <button
                      key={time24}
                      type="button"
                      disabled={isFull}
                      onClick={() => setFormData({ ...formData, time: time24 })}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isFull
                          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-95 font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-extrabold">{time12}</span>
                      <span className={`text-[9px] font-black mt-1 px-2 py-0.5 rounded-full ${
                        isFull 
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'
                          : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      }`}>
                        {isFull ? "Fully Booked" : `${MAX_SLOT_LIMIT - count} slot left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-2">
            <button 
              type="submit" 
              disabled={submitting || loadingSlots || !formData.date || !formData.time}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black py-4 rounded-2xl transition shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Confirming..." : "Confirm Service Booking"}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-2 text-slate-400 text-xs font-bold hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. MAIN SERVICING PAGE
// -------------------------------------------------------------
const Servicing = ({ darkMode, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleBookNow = (title) => {
    setSelectedService(title);
    setIsModalOpen(true);
  };

  const services = [
    { title: "Periodic Maintenance", img: periodicMaintImg, desc: "Our periodic maintenance service includes a comprehensive 40+ point inspection every 5,000 km.", list: ["Replacing Engine Oil & Filter", "Engine Scan & Inspection Report", "Exterior Waxing & Polishing", "Interior Vacuum Cleaning"] },
    { title: "Lubricant Service", img: lubricantServiceImg, desc: "Regular engine oil changes are essential to keep your engine running smoothly and efficiently.", list: ["Replacing Engine Oil & Filter", "Engine Scan & Inspection Report", "Cleaning or Changing the Air Filter"] },
    { title: "Wash & Detail", img: washDetailImg, desc: "Maintain the vehicle in a clean and good environment to enhance its lifetime and shine.", list: ["Vehicle Body Wash", "Engine Room Compartment Clean", "Exterior Waxing", "Interior Vacuum Detail"] }
  ];

  return (
    <div className={`max-w-6xl mx-auto py-12 px-4 transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-2">Vehicle Servicing</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <div 
            key={i} 
            className={`border rounded-3xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
            }`}
          >
            <div>
              <img src={s.img} alt={s.title} className="w-full h-48 object-cover mb-5 rounded-2xl" />
              <h3 className="font-black text-xl mb-2">{s.title}</h3>
              <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{s.desc}</p>
              
              <ul className={`text-xs space-y-2 mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {s.list.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => handleBookNow(s.title)} 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/20 cursor-pointer mt-auto"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BookingModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            serviceTitle={selectedService} 
            darkMode={darkMode} 
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Servicing;