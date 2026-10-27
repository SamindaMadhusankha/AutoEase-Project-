import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const CustomerDashboard = ({ darkMode }) => {
  const [myBookings, setMyBookings] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // User ගේ email එකෙන් phone එක හොයාගන්න (අපේ logic එකේ email එක වුනේ phone@autoease.com)
      const userPhone = user.email.split('@')[0];
      
      const q = query(collection(db, "bookings"), where("phone", "==", userPhone));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <h1 className="text-3xl font-black mb-8">My Bookings</h1>
      
      {myBookings.length === 0 ? (
        <p className="text-slate-500">No active bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {myBookings.map((b) => (
            <div key={b.id} className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{b.serviceTitle}</h3>
                  <p className="text-sm text-slate-500">{b.date} | {b.time}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {b.status}
                </span>
              </div>
              <div className="mt-4 text-sm">
                <p><strong>Vehicle:</strong> {b.vehicleNumber} ({b.model})</p>
                <p><strong>Fuel:</strong> {b.fuelType} - {b.engineType}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;