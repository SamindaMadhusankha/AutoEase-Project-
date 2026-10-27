import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

function Booking({ darkMode, user, selectedService: propSelectedService }) {
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '', 
    phone: '', 
    vehicleNo: '', 
    model: '', 
    fuelType: 'Petrol', 
    serviceType: 'Full Service', 
    date: '', 
    time: ''
  });

  // ⏰ Slot Capacity Limit (එක් Time Slot එකකට උපරිම Bookings 2යි)
  const MAX_SLOT_LIMIT = 2;

  // 📊 Selected Date එකේ එක් එක් Time Slot වලට දැනට තියෙන Bookings ගණන
  const [slotCounts, setSlotCounts] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 📅 අද සිට ඉදිරියට දින 7ක් සීමා කිරීම
  const todayObj = new Date();
  const minDate = todayObj.toISOString().split('T')[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(todayObj.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // 👈 1. Prop/URL Query Parameter එකෙන් Service එක Select කරගැනීම
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlService = queryParams.get('service'); 
    const activeService = propSelectedService || urlService;

    if (activeService) {
      setFormData(prev => ({ ...prev, serviceType: activeService }));
    }
  }, [location, propSelectedService]);

  // 👈 2. User Log වී සිටී නම් Phone Number එක Autofill කිරීම
  useEffect(() => {
    if (user && user.email) {
      const phoneNumber = user.email.split('@')[0];
      setFormData(prev => ({ ...prev, phone: phoneNumber }));
    }
  }, [user]);

  // 👈 3. Date එක Select කල විට Slot Availability ගෙන ඒම
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

  // ⏱️ පෙ.ව. 8:30 සිට ප.ව. 5:00 දක්වා විනාඩි 30න් 30ට Slots සෑදීම
  const generateTimeSlots = () => {
    const times = [];
    // 510 = 8:30 AM, 1020 = 5:00 PM, Step = 30 mins
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

    try {
      // Direct Submit Double Checking
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
      
      setFormData({ 
        name: '', 
        phone: user ? user.email.split('@')[0] : '', 
        vehicleNo: '', 
        model: '', 
        fuelType: 'Petrol',
        serviceType: 'Full Service', 
        date: '', 
        time: '' 
      });
      setSlotCounts({});
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl transition-all ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight">📅 Book Your Service</h2>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Select date and available time slot to schedule your appointment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Customer Name</label>
            <input 
              type="text" 
              placeholder="Enter Name" 
              className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
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

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Vehicle Number</label>
            <input 
              type="text" 
              placeholder="e.g. WP CAB-1234" 
              className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 uppercase font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.vehicleNo} 
              onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Vehicle Model</label>
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

        {/* Service Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Fuel Type</label>
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
            <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Service Type</label>
            <select 
              className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold outline-none cursor-pointer" 
              value={formData.serviceType} 
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            >
              <option value="Full Service">Full Service</option>
              <option value="Body Wash">Body Wash</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Repair">Repair</option>
              <option value="Periodical Maintenance(Coolant Change)">Periodical Maintenance(Coolant Change)</option>
              <option value="Periodical Maintenance(Brake fluid change)">Periodical Maintenance(Brake fluid change)</option>
              <option value="Periodical Maintenance(Brake Pad Replace)">Periodical Maintenance(Brake Pad Replace)</option>
              <option value="Periodical Maintenance(Engine Tune Up)">Periodical Maintenance(Engine Tune Up)</option>
              <option value="Periodical Maintenance(Transmission Fluid Change)">Periodical Maintenance(Transmission Fluid Change)</option>
              <option value="High Voltage System(Hybrid System Maintenance)">High Voltage System(Hybrid System Maintenance)</option>
              <option value="High Voltage System(HV System Fault Repair)">High Voltage System(HV System Fault Repair)</option>
              <option value="High Voltage System(HV System Fault Diagnosis)">High Voltage System(HV System Fault Diagnosis)</option>
              <option value="Electrical & Electronic(Electronic Repair)">Electrical & Electronic(Electronic Repair)</option>
              <option value="Electrical & Electronic(Vehicle Programming)">Electrical & Electronic(Vehicle Programming)</option>
              <option value="Electrical & Electronic(Electrical System Repair)">Electrical & Electronic(Electrical System Repair)</option>
              <option value="Electrical & Electronic(Vehicle Scanning)">Electrical & Electronic(Vehicle Scanning)</option>
              <option value="A/C Repair and Service(A/C Service)">A/C Repair and Service(A/C Service)</option>
              <option value="A/C Repair and Service(A/C Repair)">A/C Repair and Service(A/C Repair)</option>
              <option value="Mechanical Repair(Brake Repair)">Mechanical Repair(Brake Repair)</option>
              <option value="Mechanical Repair(Suspension Repair)">Mechanical Repair(Suspension Repair)</option>
              <option value="Mechanical Repair(Transmission Repair)">Mechanical Repair(Transmission Repair)</option>
              <option value="Mechanical Repair(Engine Repair)">Mechanical Repair(Engine Repair)</option>

              {formData.serviceType && ![
                "Full Service", "Body Wash", "Oil Change", "Repair",
                "Periodical Maintenance(Coolant Change)", "Periodical Maintenance(Brake fluid change)",
                "Periodical Maintenance(Brake Pad Replace)", "Periodical Maintenance(Engine Tune Up)",
                "Periodical Maintenance(Transmission Fluid Change)",
                "High Voltage System(Hybrid System Maintenance)", "High Voltage System(HV System Fault Repair)",
                "High Voltage System(HV System Fault Diagnosis)",
                "Electrical & Electronic(Electronic Repair)", "Electrical & Electronic(Vehicle Programming)",
                "Electrical & Electronic(Electrical System Repair)", "Electrical & Electronic(Vehicle Scanning)",
                "A/C Repair and Service(A/C Service)", "A/C Repair and Service(A/C Repair)",
                "Mechanical Repair(Brake Repair)", "Mechanical Repair(Suspension Repair)",
                "Mechanical Repair(Transmission Repair)", "Mechanical Repair(Engine Repair)"
              ].includes(formData.serviceType) && (
                <option value={formData.serviceType}>{formData.serviceType}</option>
              )}
            </select>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Select Service Date</label>
          <input 
            type="date" 
            min={minDate}
            max={maxDate}
            className="w-full p-3.5 border rounded-2xl dark:bg-slate-800 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
            value={formData.date} 
            onChange={(e) => {
              setFormData({...formData, date: e.target.value, time: ''});
            }} 
            required 
          />
        </div>

        {/* 🎨 Professional Time Slot Selection Grid (30-Min Intervals) */}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                    <span className="text-sm font-extrabold">{time12}</span>
                    
                    {/* Status Pill */}
                    <span className={`text-[10px] font-black mt-1 px-2 py-0.5 rounded-full ${
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

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-4 rounded-2xl font-black text-base transition shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 mt-4"
          disabled={loadingSlots || !formData.date || !formData.time}
        >
          Confirm Service Booking
        </button>
      </form>
    </div>
  );
}

export default Booking;