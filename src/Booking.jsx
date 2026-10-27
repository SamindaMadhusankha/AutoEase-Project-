import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

function Booking({ darkMode }) {
  const [formData, setFormData] = useState({
    name: '', phone: '', vehicleNo: '', serviceType: 'Full Service', date: '', time: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "bookings"), {
        ...formData,
        status: 'Pending',
        createdAt: new Date()
      });
      alert("✅ ඔබේ Booking එක සාර්ථකව සිදු විය!");
      setFormData({ name: '', phone: '', vehicleNo: '', serviceType: 'Full Service', date: '', time: '' });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className={`p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-black mb-6">📅 Service Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="ඔබේ නම" className="w-full p-3 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <input type="text" placeholder="දුරකථන අංකය" className="w-full p-3 border rounded-xl" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
        <input type="text" placeholder="වාහන අංකය" className="w-full p-3 border rounded-xl" value={formData.vehicleNo} onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})} required />
        <select className="w-full p-3 border rounded-xl" value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value})}>
          <option value="Full Service">Full Service</option>
          <option value="Body Wash">Body Wash</option>
          <option value="Oil Change">Oil Change</option>
          <option value="Repair">Repair</option>
        </select>
        <div className="flex gap-4">
          <input type="date" className="w-full p-3 border rounded-xl" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          <input type="time" className="w-full p-3 border rounded-xl" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition">Booking එක තහවුරු කරන්න</button>
      </form>
    </div>
  );
}

export default Booking;