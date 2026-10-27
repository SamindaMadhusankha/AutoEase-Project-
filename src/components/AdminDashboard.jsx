import React, { useEffect, useState, useMemo } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import BillingModal from './BillingModal';

// 📊 Recharts Imports
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

// Initialize secondary Firebase app safely outside render cycle
const secondaryApp = getApps().find(app => app.name === 'Secondary') 
  || initializeApp(auth.app.options, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function AdminDashboard() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // 🔄 Real-time Firestore Listener
  useEffect(() => {
    let unsubscribe;
    const bookingsCol = collection(db, "bookings");
    const q = query(bookingsCol, orderBy("date", "desc"));

    unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllBookings(data);
        setLoading(false);
      }, 
      (error) => {
        console.error("Indexed query failed, using fallback query:", error);
        // Fallback if index isn't created yet in Firestore
        unsubscribe = onSnapshot(bookingsCol, (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAllBookings(data);
          setLoading(false);
        });
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 📊 Analytics & Chart Data Calculation (Memoized for performance)
  const { revenueChartData, serviceChartData } = useMemo(() => {
    const monthlyRevenue = {};
    const serviceCounts = {};

    allBookings.forEach((b) => {
      // 1. Monthly Revenue calculation (Completed / Billed bookings with amount)
      if (b.status === 'Completed' || b.status === 'Billed') {
        const dateObj = b.date ? new Date(b.date) : new Date();
        const monthKey = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        const billAmount = Number(b.totalAmount || b.amount || b.billTotal || 0);

        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + billAmount;
      }

      // 2. Popular Services Count
      const service = b.serviceType || b.serviceTitle || 'General Service';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const revenueChartData = Object.keys(monthlyRevenue).map(month => ({
      month,
      Revenue: monthlyRevenue[month]
    }));

    const serviceChartData = Object.keys(serviceCounts)
      .map(service => ({
        name: service.length > 18 ? service.substring(0, 15) + '...' : service,
        fullName: service,
        value: serviceCounts[service]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { revenueChartData, serviceChartData };
  }, [allBookings]);

  // ✅ Approve Booking & Secondary Auth User Creation
  const approveBooking = async (booking) => {
    const phone = booking.phone || booking.mobile || '';

    if (!phone) {
      alert("❌ Sorry! No phone number available to create an account.");
      return;
    }

    const estTime = window.prompt("Enter the estimated end time. (e.g. 2:30 PM, 2 Hours):", "2.5 Hours");
    setApprovingId(booking.id);

    try {
      const cleanPhone = phone.toString().replace(/\s+/g, '');
      const email = `${cleanPhone}@autoease.com`;
      const password = cleanPhone; 

      await createUserWithEmailAndPassword(secondaryAuth, email, password);

      const userData = {
        name: booking.name || booking.ownerName || 'Customer',
        email: email,
        phone: phone,
        vehicleNo: booking.vehicleNo || booking.vehicleNumber || 'N/A',
        model: booking.model || 'N/A',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", phone), userData);

      await updateDoc(doc(db, "bookings", booking.id), { 
        status: 'Approved',
        estimatedTime: estTime || 'In Progress'
      });

      alert(`✅ Account Created & Booking Approved!\n\nEmail: ${email}\nPassword: ${password}\nEstimated Time: ${estTime}`);

    } catch (error) {
      console.error("Error during approval:", error);

      if (error.code === 'auth/email-already-in-use') {
        await updateDoc(doc(db, "bookings", booking.id), { 
          status: 'Approved',
          estimatedTime: estTime || 'In Progress'
        });
        alert("ℹ️ This phone number already has an account. Booking updated to Approved!");
      } else {
        alert("❌ Error: " + error.message);
      }
    } finally {
      setApprovingId(null);
    }
  };

  // ❌ Cancel / Reject Booking Function
  const cancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setCancellingId(id);
      try {
        await updateDoc(doc(db, "bookings", id), { status: 'Cancelled' });
        alert("⚠️ Booking එක අවලංගු (Cancelled) කරන ලදී!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("❌ Error cancelling booking: " + error.message);
      } finally {
        setCancellingId(null);
      }
    }
  };

  const markAsCompleted = async (id) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: 'Completed' });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const removeBooking = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this booking?")) {
      try {
        await deleteDoc(doc(db, "bookings", id));
      } catch (error) {
        console.error("Error removing booking:", error);
      }
    }
  };

  // 🔍 Filtering Logic (Memoized)
  const filteredBookings = useMemo(() => {
    return allBookings
      .filter(b => {
        const status = b.status || 'Pending';
        const matchesStatus = filterStatus === 'All' || status === filterStatus;
        
        const matchesSearch = 
          (b.name || b.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.phone || '').includes(searchTerm) ||
          (b.vehicleNo || b.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = !selectedDate || (b.date && b.date.startsWith(selectedDate));

        return matchesStatus && matchesSearch && matchesDate;
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [allBookings, filterStatus, searchTerm, selectedDate]);

  // Counts
  const pendingCount = useMemo(() => allBookings.filter(b => (b.status || 'Pending') === 'Pending').length, [allBookings]);
  const approvedCount = useMemo(() => allBookings.filter(b => b.status === 'Approved').length, [allBookings]);
  const completedCount = useMemo(() => allBookings.filter(b => b.status === 'Completed' || b.status === 'Billed').length, [allBookings]);
  const cancelledCount = useMemo(() => allBookings.filter(b => b.status === 'Cancelled').length, [allBookings]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex justify-center items-center text-slate-500 font-black text-lg">
        ⚡ Loading Analytics & Booking Management...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-6 md:px-12 py-8 font-sans bg-[#f8fafc] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="mb-8 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-base font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics, revenue tracking & appointment control.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 w-fit">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
            Total System Records: <span className="text-indigo-600 dark:text-indigo-400">{allBookings.length}</span>
          </span>
        </div>
      </div>

      {/* 📊 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8 w-full">
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Bookings</p>
          <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{allBookings.length}</h3>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-amber-500 uppercase tracking-wider">Pending</p>
          <h3 className="text-4xl font-black text-amber-500 mt-2">{pendingCount}</h3>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-blue-500 uppercase tracking-wider">Approved</p>
          <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">{approvedCount}</h3>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-emerald-500 uppercase tracking-wider">Completed / Billed</p>
          <h3 className="text-4xl font-black text-emerald-500 mt-2">{completedCount}</h3>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-rose-500 uppercase tracking-wider">Cancelled</p>
          <h3 className="text-4xl font-black text-rose-500 mt-2">{cancelledCount}</h3>
        </div>
      </div>

      {/* 📈 ANALYTICS & CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart 1: Monthly Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              📊 Monthly Revenue Overview (LKR)
            </h3>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Completed Orders
            </span>
          </div>

          <div className="h-64 w-full">
            {revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-extrabold text-sm">
                No billed revenue data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="Revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Top Popular Services */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            🔥 Popular Services
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {serviceChartData.length === 0 ? (
              <div className="text-slate-400 font-extrabold text-sm">
                No service booking data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {serviceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 🔍 Search and Filters Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8 w-full flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
        
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          {['All', 'Pending', 'Approved', 'Completed', 'Billed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
                filterStatus === st 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Date Filter & Search Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 text-xs md:text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 cursor-pointer outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-3 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs md:text-sm font-extrabold rounded-xl transition cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>

          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="🔍 Search name, phone, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 text-xs md:text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>

        </div>

      </div>

      {/* 📋 Bookings List Cards */}
      {filteredBookings.length === 0 ? (
        <div className="w-full p-16 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold text-base">
          No matching bookings found.
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {filteredBookings.map((b) => {
            const status = b.status || 'Pending';
            const isPending = status === 'Pending';
            const isApproved = status === 'Approved';
            const isCompleted = status === 'Completed';
            const isBilled = status === 'Billed';
            const isCancelled = status === 'Cancelled';
            const isProcessing = approvingId === b.id;
            const isCancelling = cancellingId === b.id;

            return (
              <div 
                key={b.id} 
                className="w-full bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-md transition"
              >
                <div className="space-y-3 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">
                      {b.name || b.ownerName || 'Customer Name'}
                    </h3>
                    
                    <span className={`px-4 py-1 rounded-full text-xs md:text-sm font-extrabold flex items-center gap-1.5 ${
                      isBilled 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/60'
                        : isCompleted 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60' 
                        : isApproved 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/60'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/60'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60'
                    }`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium pt-1">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-slate-400 block">Vehicle</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{b.vehicleNo || b.vehicleNumber || 'N/A'}</strong> {b.model ? `(${b.model})` : ''}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-slate-400 block">Phone</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{b.phone || 'N/A'}</strong>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-slate-400 block">Fuel Type</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{b.fuelType || 'N/A'}</strong>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-slate-400 block">Date & Time</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{b.date || 'N/A'}</strong> {b.time ? `| ${b.time}` : ''}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-sm md:text-base font-extrabold">
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-900/50">
                      🔧 Service: <span className="underline">{b.serviceType || b.serviceTitle || b.service || 'General Service'}</span>
                    </span>
                    
                    {b.estimatedTime && (
                      <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/50 text-xs md:text-sm">
                        ⏱️ Est. Finish: {b.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* 🎯 ACTION BUTTONS SECTION */}
                <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-4 xl:pt-0 border-slate-200 dark:border-slate-800">
                  
                  {/* 1. Pending: Approve Button */}
                  {isPending && (
                    <button 
                      onClick={() => approveBooking(b)}
                      disabled={isProcessing || isCancelling}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-extrabold transition text-xs md:text-sm shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? "Approving..." : "Approve"}
                    </button>
                  )}

                  {/* 2. Pending: Reject / Cancel Button */}
                  {isPending && (
                    <button 
                      onClick={() => cancelBooking(b.id)}
                      disabled={isProcessing || isCancelling}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl font-extrabold transition text-xs md:text-sm shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Reject / Cancel"}
                    </button>
                  )}

                  {/* 3. Approved: Mark Completed Button */}
                  {isApproved && (
                    <button 
                      onClick={() => markAsCompleted(b.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-extrabold transition text-xs md:text-sm shadow-md cursor-pointer"
                    >
                      ✓ Mark Completed
                    </button>
                  )}

                  {/* 4. Completed: Generate Bill Button */}
                  {isCompleted && (
                    <button 
                      onClick={() => setSelectedBookingForBill(b)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-extrabold transition text-xs md:text-sm shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      💵 Generate Bill
                    </button>
                  )}

                  {/* 5. Billed: View Bill Button */}
                  {isBilled && (
                    <button 
                      onClick={() => setSelectedBookingForBill(b)}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl font-extrabold transition text-xs md:text-sm shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      📄 View Bill
                    </button>
                  )}

                  {/* 6. Remove Button (Always Available) */}
                  <button 
                    onClick={() => removeBooking(b.id)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-extrabold transition text-xs md:text-sm shadow-md cursor-pointer"
                  >
                    Remove
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📄 Billing / Invoice Modal */}
      {selectedBookingForBill && (
        <BillingModal 
          booking={selectedBookingForBill} 
          onClose={() => setSelectedBookingForBill(null)} 
        />
      )}
    </div>
  );
}

export default AdminDashboard;