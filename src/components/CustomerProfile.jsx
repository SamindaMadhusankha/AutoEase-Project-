import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, addDoc, query, where, getDocs } from 'firebase/firestore';

function CustomerProfile({ user }) {
  const [myBookings, setMyBookings] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  // Invoice Modal States
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [fetchingInvoiceId, setFetchingInvoiceId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userEmail = user.email ? user.email.toLowerCase().trim() : '';
    const userPhone = userEmail.includes('@autoease.com') 
      ? userEmail.split('@')[0].trim() 
      : (user.phoneNumber || '').trim();

    const bookingsRef = collection(db, "bookings");

    const unsubscribe = onSnapshot(bookingsRef, (snapshot) => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userBookings = allDocs.filter(b => {
        const cleanBookingPhone = b.phone ? b.phone.toString().trim() : '';
        const cleanBookingEmail = b.customerEmail ? b.customerEmail.toLowerCase().trim() : '';
        return (userEmail && cleanBookingEmail === userEmail) || (userPhone && cleanBookingPhone === userPhone);
      });

      setMyBookings(userBookings);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // View Original Invoice Action
  const handleViewInvoice = async (booking) => {
    setFetchingInvoiceId(booking.id);
    try {
      const q = query(collection(db, "invoices"), where("bookingId", "==", booking.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const invoiceData = querySnapshot.docs[0].data();
        setSelectedInvoice({ ...invoiceData, id: querySnapshot.docs[0].id });
      } else {
        const total = Number(booking.totalAmount || 2850);
        setSelectedInvoice({
          invoiceNo: `INV-${booking.id ? booking.id.slice(0, 6).toUpperCase() : '235831'}`,
          repairOrderNo: booking.repairOrderNo || 'RO-5258',
          docRefNo: booking.docRefNo || 'AUTO/SERV/01',
          date: booking.date || new Date().toLocaleDateString(),
          customerName: booking.customerName || booking.name || user?.displayName || 'Valued Customer',
          address: booking.address || 'N/A',
          contactNo: booking.phone || user?.email?.split('@')[0] || 'N/A',
          makeModel: `${booking.make || 'TATA'} / ${booking.model || 'Standard Model'}`,
          currentMileage: booking.currentMileage || '186,625',
          nextServMileage: booking.nextServMileage || '191,625',
          vehicleNo: booking.vehicleNo || 'DAX-7897',
          serviceAdvisor: booking.serviceAdvisor || 'Admin / Chief Tech',
          chassisEngine: booking.chassisEngine || 'N/A',
          items: booking.items || [
            { 
              category: 'Services', 
              code: 'SRV-01', 
              description: booking.serviceType || 'Oil Change', 
              qty: 1, 
              unitPrice: total, 
              amount: total 
            }
          ],
          subTotal: total,
          discount: 0,
          grandTotal: total,
          paidAmount: total,
          balance: 0
        });
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Invoice loading failed!");
    } finally {
      setFetchingInvoiceId(null);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return alert("Please write something!");
    try {
      await addDoc(collection(db, "feedbacks"), {
        userEmail: user?.email || '',
        comment: feedback,
        createdAt: new Date()
      });
      setFeedback('');
      alert("✅ Thank you for your feedback!");
    } catch (error) {
      alert("Error submitting feedback: " + error.message);
    }
  };

  const getStepNumber = (status) => {
    if (status === 'Approved') return 2;
    if (status === 'Completed' || status === 'Billed') return 3;
    return 1;
  };

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getCustomerDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (myBookings.length > 0 && myBookings[0].customerName) return myBookings[0].customerName;
    if (user?.email) {
      const prefix = user.email.split('@')[0];
      return prefix.match(/^\d+$/) ? `Customer (${prefix})` : prefix;
    }
    return "Customer";
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading your booking history...
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice-modal, #printable-invoice-modal * { visibility: visible; }
          #printable-invoice-modal {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white !important; color: black !important;
            box-shadow: none !important; border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* WELCOME BANNER WITH CUSTOMER NAME */}
      <h2 className="text-2xl font-black text-center mb-6 text-slate-800 dark:text-slate-100">
        Welcome, <span className="text-blue-600 dark:text-blue-400">{getCustomerDisplayName()}</span>
      </h2>

      {/* TRACKER CARD */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-3xl font-black text-center mb-8 text-slate-900 dark:text-white">
          My Service Tracker
        </h3>

        <div className="space-y-6 mb-8">
          {myBookings.length === 0 ? (
            <p className="text-slate-500 text-center py-6 border border-dashed rounded-2xl dark:border-slate-700">
              No bookings found for your account.
            </p>
          ) : (
            myBookings.map(b => {
              const status = b.status || 'Completed';
              const currentStep = getStepNumber(status);

              return (
                <div key={b.id} className="p-6 border rounded-3xl bg-slate-50/50 dark:bg-slate-800/40 shadow-sm border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                  
                  {/* Top Bar */}
                  <div className="flex flex-wrap justify-between items-center text-sm font-semibold text-slate-500 dark:text-slate-400 gap-2">
                    <span>📅 Date: {b.date || '2026-08-20'} | {b.time || '11:45'}</span>
                    <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-extrabold text-xs">
                      🛠️ {b.serviceType || 'Oil Change'}
                    </span>
                  </div>

                  {/* Vehicle Details */}
                  <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Vehicle Details</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white uppercase">
                        {b.vehicleNo || 'DAX-7897'} <span className="text-slate-500 text-sm font-semibold">({b.model || 'TATA'})</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Fuel Type</p>
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200">{b.fuelType || 'Diesel'}</p>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Service Live Status</p>
                    <div className="flex items-center justify-between relative">
                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>1</div>
                        <span className="text-xs font-bold mt-1 text-slate-600 dark:text-slate-300">Requested</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 rounded ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-300'}`}>2</div>
                        <span className="text-xs font-bold mt-1 text-amber-600">In Service</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 rounded ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-300'}`}>3</div>
                        <span className="text-xs font-bold mt-1 text-emerald-600">Ready / Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Completed / Invoice Banner */}
                  {(status === 'Completed' || status === 'Billed' || currentStep === 3) && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div>
                        <p className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">✅ Service Complete & Ready for Pickup!</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Bill: Rs. {formatCurrency(b.totalAmount || 2850)}</p>
                      </div>
                      <button 
                        onClick={() => handleViewInvoice(b)}
                        disabled={fetchingInvoiceId === b.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-2"
                      >
                        {fetchingInvoiceId === b.id ? '⏳ Loading...' : '🧾 View / Print Original Invoice'}
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Feedback Section */}
        <div className="border-t pt-6 dark:border-slate-800">
          <h4 className="font-bold mb-3 text-slate-800 dark:text-white">Leave your feedback</h4>
          <textarea 
            className="w-full p-4 border rounded-2xl mb-4 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="How was our service?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button 
            onClick={submitFeedback}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            Submit Feedback
          </button>
        </div>

      </div>

      {/* 🧾 ORIGINAL AUTOEASE INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="printable-invoice-modal"
            className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 my-6"
          >
            {/* Modal Title Bar */}
            <div className="flex justify-between items-center border-b pb-3 mb-4 no-print">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <span>🧾 AutoEase Invoice Generator</span>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Inner Bordered Invoice Sheet */}
            <div className="border border-slate-800 p-6 rounded-md bg-white">
              
              {/* Header with AutoEase Official Logo */}
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logo.png" 
                    alt="AutoEase Logo" 
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} 
                  />
                  <div className="hidden items-center gap-2 font-black text-2xl text-blue-900 tracking-tighter">
                    <span className="text-3xl">🚗</span> AUTOEASE
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-2xl font-black text-slate-900 tracking-wider">INVOICE</h2>
                  <p className="text-[11px] font-bold text-slate-600">AutoEase Vehicle Service Center</p>
                  <p className="text-[10px] text-slate-500">Tel: 011 228 3350 | Email: info@autoease.lk</p>
                </div>
              </div>

              {/* Bill Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-slate-800 mb-6 font-medium">
                <div className="flex">
                  <span className="w-36 font-semibold">Repair Order No</span>
                  <span>: <strong className="underline">{selectedInvoice.repairOrderNo}</strong></span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Invoice No</span>
                  <span>: <strong className="text-blue-700 font-bold">{selectedInvoice.invoiceNo}</strong></span>
                </div>

                <div className="flex">
                  <span className="w-36 font-semibold">Customer Name</span>
                  <span>: <strong>{selectedInvoice.customerName}</strong></span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Doc / Ref No</span>
                  <span>: <span className="underline">{selectedInvoice.docRefNo}</span></span>
                </div>

                <div className="flex">
                  <span className="w-36 font-semibold">Address</span>
                  <span>: {selectedInvoice.address}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Invoice Date</span>
                  <span>: {selectedInvoice.date}</span>
                </div>

                <div className="flex">
                  <span className="w-36 font-semibold">Contact No</span>
                  <span>: {selectedInvoice.contactNo}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Vehicle No</span>
                  <span>: <strong className="text-sm font-black">{selectedInvoice.vehicleNo}</strong></span>
                </div>

                <div className="flex">
                  <span className="w-36 font-semibold">Make / Model</span>
                  <span>: <span className="underline">{selectedInvoice.makeModel}</span></span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Next Serv. Mileage</span>
                  <span>: <span className="underline">{selectedInvoice.nextServMileage}</span> KM</span>
                </div>

                <div className="flex">
                  <span className="w-36 font-semibold">Current Mileage</span>
                  <span>: <span className="underline">{selectedInvoice.currentMileage}</span> KM</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Service Advisor</span>
                  <span>: <span className="underline">{selectedInvoice.serviceAdvisor}</span></span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-sm overflow-hidden mb-6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Category</th>
                      <th className="p-2 border-r border-slate-300">Code</th>
                      <th className="p-2 border-r border-slate-300">Item Description</th>
                      <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right">Unit Price</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-200">{item.category || 'Services'}</td>
                        <td className="p-2 border-r border-slate-200">{item.code || 'SRV-01'}</td>
                        <td className="p-2 border-r border-slate-200 font-medium">{item.description}</td>
                        <td className="p-2 border-r border-slate-200 text-center">{item.qty || 1}</td>
                        <td className="p-2 border-r border-slate-200 text-right">{formatCurrency(item.unitPrice || item.amount)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end mb-12">
                <div className="w-64 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Sub Total:</span>
                    <span>Rs. {formatCurrency(selectedInvoice.subTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Discount (%):</span>
                    <span className="border border-slate-400 px-2 py-0.5 rounded text-right w-16">
                      {selectedInvoice.discount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm border-t border-b border-slate-800 py-1">
                    <span>Final Amount:</span>
                    <span>Rs. {formatCurrency(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Paid Amount:</span>
                    <span className="border border-emerald-500 px-2 py-0.5 rounded text-right w-24">
                      {formatCurrency(selectedInvoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Balance:</span>
                    <span>Rs. {formatCurrency(selectedInvoice.balance || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-8 pt-8 text-center text-[11px] text-slate-500 font-medium">
                <div className="border-t border-slate-400 pt-1">Customer Signature</div>
                <div className="border-t border-slate-400 pt-1">Service Advisor</div>
                <div className="border-t border-slate-400 pt-1">Authorized Officer</div>
              </div>

            </div>

            {/* Print & Close Buttons */}
            <div className="flex gap-4 mt-6 no-print">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                💾 Save & Open PDF Bill
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerProfile;