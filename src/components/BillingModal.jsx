import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import autoEaseLogo from '../assets/logo.png'; // 👈 Local Logo

// සියලුම Categories සහ ඒවාට අදාළ Sub-Services
const SERVICE_CATEGORIES = {
  "Vehicle Servicing": [
    "Periodic Maintenance",
    "Lubricant Service",
    "Wash & Detail"
  ],
  "Periodic Services": [
    "Coolant Change",
    "Brake Fluid Change",
    "Brake Pad Replace",
    "Engine Tune Up",
    "Transmission Fluid Change"
  ],
  "Mechanical Services": [
    "Brake Repair",
    "Suspension Repair",
    "Transmission Repair",
    "Engine Repair"
  ],
  "Hv Services": [
    "Hybrid System Maintenance",
    "HV System Fault Repair",
    "HV System Fault Diagnosis"
  ],
  "Electrical Services": [
    "Electronic Repair",
    "Vehicle Programming",
    "Electrical System Repair",
    "Vehicle Scanning"
  ],
  "AC Services": [
    "A/C Service",
    "A/C Repair"
  ],
  "Inspection Services": [
    "Multipoint Inspection Report"
  ],
  "Exterior Detailing Services": [
    "Rust Proofing Undercoating",
    "Towa Body Coating",
    "Glass Polishing",
    "Cut and Polish"
  ],
  "Interior Detailing Services": [
    "Leather Treatment",
    "Upholstery Cleaning",
    "Full Interior Detailing"
  ],
  "Parts": [
    "Spare Parts",
    "Engine Oil",
    "Filters",
    "Other Parts"
  ],
  "Other": [
    "Miscellaneous"
  ]
};

// Booking එකේ එන Service Name එක static SERVICE_CATEGORIES එකට Match කරන Function එක
const findMatchingCategoryAndService = (bookingServiceStr) => {
  if (!bookingServiceStr) {
    return { category: "Exterior Detailing Services", service: "Rust Proofing Undercoating" };
  }

  const cleanStr = bookingServiceStr.toLowerCase();

  // 1. Direct Category & Sub-Service Match එකක් සෙවීම
  for (const [category, services] of Object.entries(SERVICE_CATEGORIES)) {
    if (cleanStr.includes(category.toLowerCase())) {
      return { category, service: services[0] };
    }
    for (const service of services) {
      if (cleanStr.includes(service.toLowerCase())) {
        return { category, service };
      }
    }
  }

  // 2. A/C / AC සඳහා විශේෂ Keyword Matching Logic එක
  if (cleanStr.includes('a/c') || cleanStr.includes('ac') || cleanStr.includes('air con')) {
    if (cleanStr.includes('repair')) {
      return { category: "AC Services", service: "A/C Repair" };
    }
    return { category: "AC Services", service: "A/C Service" };
  }

  // Matching කිසිවක් නැත්නම් Default Category එක
  return { category: "Other", service: bookingServiceStr };
};

function BillingModal({ booking, onClose }) {
  const [adminDetails, setAdminDetails] = useState({
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    repairOrderNo: `RO-${Math.floor(1000 + Math.random() * 9000)}`,
    docRefNo: 'AUTO/SERV/01',
    serviceAdvisor: 'Admin / Chief Tech',
    currentMileage: booking?.mileage || '186,625',
    nextServiceMileage: '191,625',
    chassisNo: booking?.chassisNo || '',
    engineNo: booking?.engineNo || '',
    makeCode: booking?.make || 'TOYOTA',
    modelCode: booking?.model || 'Toyota Yaris'
  });

  const [items, setItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingInvoice, setFetchingInvoice] = useState(true);

  // 🔄 Firestore එකෙන් Invoice Data Auto Fetch කිරීම
  useEffect(() => {
    const fetchExistingInvoice = async () => {
      if (!booking?.id) {
        setFetchingInvoice(false);
        return;
      }

      try {
        setFetchingInvoice(true);
        const invoiceRef = doc(db, "invoices", booking.id);
        const invoiceSnap = await getDoc(invoiceRef);

        if (invoiceSnap.exists()) {
          const data = invoiceSnap.data();
          
          // Firestore හි දැනටමත් Invoice එකක් තිබේ නම් එම දත්ත Set කිරීම
          setAdminDetails({
            invoiceNo: data.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
            repairOrderNo: data.repairOrderNo || `RO-${Math.floor(1000 + Math.random() * 9000)}`,
            docRefNo: data.docRefNo || 'AUTO/SERV/01',
            serviceAdvisor: data.serviceAdvisor || 'Admin / Chief Tech',
            currentMileage: data.currentMileage || booking?.mileage || '186,625',
            nextServiceMileage: data.nextServiceMileage || '191,625',
            chassisNo: data.chassisNo || booking?.chassisNo || '',
            engineNo: data.engineNo || booking?.engineNo || '',
            makeCode: data.makeCode || booking?.make || 'TOYOTA',
            modelCode: data.modelCode || booking?.model || 'Toyota Yaris'
          });

          if (data.items && data.items.length > 0) {
            setItems(data.items);
          }

          setDiscountPercent(data.discountPercent || 0);
          setPaidAmount(data.paidAmount || 0);
        } else {
          // කලින් Saved Invoice එකක් නැත්නම් Booking එකෙන් Default Data Initialise කිරීම
          const rawService = booking?.service || booking?.serviceType || booking?.serviceName || booking?.title || '';
          const matched = findMatchingCategoryAndService(rawService);

          setItems([
            { 
              category: matched.category, 
              itemCode: matched.category === "AC Services" ? "AC-01" : "SRV-01", 
              description: matched.service, 
              qty: 1, 
              unitValue: 5000 
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching invoice data:", error);
      } finally {
        setFetchingInvoice(false);
      }
    };

    fetchExistingInvoice();
  }, [booking]);

  // Admin Field Change Handler
  const handleAdminChange = (e) => {
    setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });
  };

  // 1. Single Item එකක් එකතු කිරීම
  const handleAddItem = () => {
    const firstCat = "Exterior Detailing Services";
    setItems([
      ...items, 
      { 
        category: firstCat, 
        itemCode: '', 
        description: SERVICE_CATEGORIES[firstCat][0], 
        qty: 1, 
        unitValue: 0 
      }
    ]);
  };

  // 2. Category එකේ ඇති සියලුම Sub-services එකවර එකතු කිරීම (Quick Action)
  const handleAddAllFromCategory = (catName) => {
    const subServices = SERVICE_CATEGORIES[catName] || [];
    const newItems = subServices.map((service, index) => ({
      category: catName,
      itemCode: `SRV-${index + 1}`,
      description: service,
      qty: 1,
      unitValue: 0
    }));

    setItems([...items, ...newItems]);
  };

  // Category වෙනස් වන විට Description auto change වීම
  const handleCategoryChange = (index, value) => {
    const updated = [...items];
    updated[index].category = value;
    if (SERVICE_CATEGORIES[value] && SERVICE_CATEGORIES[value].length > 0) {
      updated[index].description = SERVICE_CATEGORIES[value][0];
    } else {
      updated[index].description = '';
    }
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'qty' || field === 'unitValue' ? Number(value) || 0 : value;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + ((Number(item.qty) || 1) * (Number(item.unitValue) || 0)), 0);
  const discountAmount = (subTotal * (Number(discountPercent) || 0)) / 100;
  const finalTotal = subTotal - discountAmount;
  const balance = (Number(paidAmount) || 0) - finalTotal;

  // Auto PDF Generation & Print Function
  const generateAndOpenPDF = () => {
    const printContent = document.getElementById('printable-area');
    const win = window.open('', '_blank');
    
    win.document.write(`
      <html>
        <head>
          <title>Invoice_${adminDetails.invoiceNo}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body { font-family: sans-serif; padding: 20px; }
            input, select { border: none !important; background: transparent !important; appearance: none; }
          </style>
        </head>
        <body onload="window.print();">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
  };

  // Save to Firebase & Trigger PDF
  const handleSaveBill = async () => {
    setLoading(true);
    try {
      const invoiceData = {
        bookingId: booking?.id || '',
        customerName: booking?.name || booking?.ownerName || 'Valued Customer',
        phone: booking?.phone || '',
        address: booking?.address || 'N/A',
        vehicleNo: booking?.vehicleNo || booking?.vehicleNumber || 'N/A',
        ...adminDetails,
        items,
        subTotal,
        discountPercent: Number(discountPercent) || 0,
        discountAmount,
        totalAmount: finalTotal,
        paidAmount: Number(paidAmount) || 0,
        balance,
        billedAt: new Date().toISOString()
      };

      if (booking?.id) {
        // 1. Save to Invoices Collection
        await setDoc(doc(db, "invoices", booking.id), invoiceData);

        // 2. Update Booking Status to 'Billed'
        await updateDoc(doc(db, "bookings", booking.id), {
          status: 'Billed',
          totalAmount: finalTotal,
          invoiceNo: adminDetails.invoiceNo
        });
      }

      alert("✅ Invoice Saved Successfully! Generating PDF...");
      
      // 3. Open Auto Generated PDF Window
      generateAndOpenPDF();

      onClose();
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-6 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-300 my-auto relative">
        
        {/* Loading Indicator for Fetching Data */}
        {fetchingInvoice && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="text-center font-bold text-slate-700">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-2"></div>
              Loading Invoice Data...
            </div>
          </div>
        )}

        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex justify-between items-center border-b pb-4 mb-6 print:hidden">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">🧾 AutoEase Invoice Generator</h3>
            <p className="text-xs text-slate-500">Fill in the bill details below.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={generateAndOpenPDF} className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold transition">
              📄 Preview PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl font-bold px-2">✕</button>
          </div>
        </div>

        {/* ================= PRINTABLE / PDF INVOICE AREA ================= */}
        <div id="printable-area" className="text-xs font-sans text-slate-900 border p-6 rounded-lg bg-white">
          
          {/* Header with AutoEase Official Image Logo */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <img 
                src={autoEaseLogo} 
                alt="AutoEase Logo" 
                className="h-14 w-auto object-contain mb-1" 
              />
            </div>
            
            <div className="text-right">
              <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800">INVOICE</h2>
              <p className="text-[11px] text-slate-600 font-bold">AutoEase Vehicle Service Center</p>
              <p className="text-[11px] text-slate-500">Tel: 011 228 3350 | Email: info@autoease.lk</p>
            </div>
          </div>

          {/* Customer & Technical Details Grid */}
          <div className="grid grid-cols-2 gap-6 border-b pb-4 mb-4">
            
            {/* Left Column */}
            <div className="space-y-1.5">
              <div className="flex"><span className="w-32 font-bold text-slate-600">Repair Order No</span>: 
                <input name="repairOrderNo" value={adminDetails.repairOrderNo} onChange={handleAdminChange} className="border-b px-1 font-semibold w-36" />
              </div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Customer Name</span>: <span className="font-bold">{booking?.name || booking?.ownerName || booking?.customerName || 'N/A'}</span></div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Address</span>: <span>{booking?.address || 'N/A'}</span></div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Contact No</span>: <span>{booking?.phone || booking?.contactNo || 'N/A'}</span></div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Make / Model</span>: 
                <input name="makeCode" value={adminDetails.makeCode} onChange={handleAdminChange} className="border-b px-1 w-16" /> / 
                <input name="modelCode" value={adminDetails.modelCode} onChange={handleAdminChange} className="border-b px-1 w-28" />
              </div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Current Mileage</span>: 
                <input name="currentMileage" value={adminDetails.currentMileage} onChange={handleAdminChange} className="border-b px-1 w-24 font-bold" /> KM
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-1.5">
              <div className="flex"><span className="w-32 font-bold text-slate-600">Invoice No</span>: <span className="font-bold text-blue-700">{adminDetails.invoiceNo}</span></div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Doc / Ref No</span>: 
                <input name="docRefNo" value={adminDetails.docRefNo} onChange={handleAdminChange} className="border-b px-1 w-36" />
              </div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Invoice Date</span>: <span>{new Date().toLocaleDateString()}</span></div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Vehicle No</span>: <span className="font-bold uppercase text-sm">{booking?.vehicleNo || booking?.vehicleNumber || 'N/A'}</span></div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Next Serv. Mileage</span>: 
                <input name="nextServiceMileage" value={adminDetails.nextServiceMileage} onChange={handleAdminChange} className="border-b px-1 w-24 font-bold" /> KM
              </div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Service Advisor</span>: 
                <input name="serviceAdvisor" value={adminDetails.serviceAdvisor} onChange={handleAdminChange} className="border-b px-1 w-36" />
              </div>
              <div className="flex"><span className="w-32 font-bold text-slate-600">Chassis / Engine</span>: 
                <input name="chassisNo" placeholder="Chassis" value={adminDetails.chassisNo} onChange={handleAdminChange} className="border-b px-1 w-20" /> / 
                <input name="engineNo" placeholder="Engine" value={adminDetails.engineNo} onChange={handleAdminChange} className="border-b px-1 w-20" />
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full border-collapse border border-slate-300 text-left my-2">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                <th className="p-2 border-r border-slate-300 w-44">Category</th>
                <th className="p-2 border-r border-slate-300 w-20">Code</th>
                <th className="p-2 border-r border-slate-300">Item Description</th>
                <th className="p-2 border-r border-slate-300 w-16 text-center">Qty</th>
                <th className="p-2 border-r border-slate-300 w-24 text-right">Unit Price</th>
                <th className="p-2 text-right w-28">Amount</th>
                <th className="p-1 print:hidden w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const itemAmount = (Number(item.qty) || 1) * (Number(item.unitValue) || 0);
                const subServices = SERVICE_CATEGORIES[item.category] || [];

                return (
                  <tr key={index} className="border-b border-slate-200">
                    
                    {/* Category Select Dropdown */}
                    <td className="p-1 border-r border-slate-200">
                      <select 
                        value={item.category} 
                        onChange={(e) => handleCategoryChange(index, e.target.value)} 
                        className="w-full bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        {Object.keys(SERVICE_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>

                    {/* Item Code */}
                    <td className="p-1 border-r border-slate-200">
                      <input 
                        value={item.itemCode} 
                        onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)} 
                        placeholder="Code" 
                        className="w-full border-none focus:outline-none" 
                      />
                    </td>

                    {/* Sub-Service Dropdown / Input */}
                    <td className="p-1 border-r border-slate-200">
                      {subServices.length > 0 ? (
                        <select
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
                        >
                          {subServices.map((sub, i) => (
                            <option key={i} value={sub}>{sub}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          value={item.description} 
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                          placeholder="Description" 
                          className="w-full border-none focus:outline-none font-medium" 
                        />
                      )}
                    </td>

                    {/* Qty */}
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input 
                        type="number" 
                        value={item.qty} 
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)} 
                        className="w-12 text-center border-none focus:outline-none font-bold" 
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="p-1 border-r border-slate-200 text-right">
                      <input 
                        type="number" 
                        value={item.unitValue} 
                        onChange={(e) => handleItemChange(index, 'unitValue', e.target.value)} 
                        className="w-20 text-right border-none focus:outline-none font-bold" 
                      />
                    </td>

                    {/* Amount */}
                    <td className="p-2 text-right font-bold">
                      {itemAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Remove Action */}
                    <td className="p-1 print:hidden text-center">
                      {items.length > 1 && (
                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 font-bold hover:bg-red-50 px-1 rounded">✕</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Action Buttons for Adding Services */}
          <div className="flex gap-4 print:hidden my-2">
            <button onClick={handleAddItem} className="text-xs font-bold text-blue-600 hover:underline">
              + Add Line Item
            </button>
            <button onClick={() => handleAddAllFromCategory("Exterior Detailing Services")} className="text-xs font-bold text-emerald-600 hover:underline">
              + Add All Exterior Detailing Services
            </button>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-1 text-right text-xs">
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">Sub Total:</span>
                <span className="font-bold">Rs. {subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Discount (%):</span>
                <input 
                  type="number" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(e.target.value)} 
                  className="w-16 border text-right font-bold"
                />
              </div>

              <div className="flex justify-between font-black text-sm border-t border-b py-1 border-slate-800">
                <span>Final Amount:</span>
                <span>Rs. {finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Paid Amount:</span>
                <input 
                  type="number" 
                  value={paidAmount} 
                  onChange={(e) => setPaidAmount(e.target.value)} 
                  className="w-24 border text-right font-bold text-emerald-600"
                />
              </div>

              <div className="flex justify-between font-bold text-slate-800">
                <span>Balance:</span>
                <span className={balance >= 0 ? "text-emerald-700 font-black" : "text-red-600 font-black"}>
                  Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="mt-12 pt-4 border-t flex justify-between text-center text-[10px] text-slate-500">
            <div>
              <div className="h-8"></div>
              <p className="border-t w-32 border-slate-400">Customer Signature</p>
            </div>
            <div>
              <div className="h-8"></div>
              <p className="border-t w-32 border-slate-400">Service Advisor</p>
            </div>
            <div>
              <div className="h-8"></div>
              <p className="border-t w-32 border-slate-400">Authorized Officer</p>
            </div>
          </div>

        </div>
        {/* ================= END PRINTABLE AREA ================= */}

        {/* Modal Action Buttons */}
        <div className="flex gap-3 mt-6 print:hidden">
          <button 
            onClick={handleSaveBill}
            disabled={loading || fetchingInvoice}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "💾 Save & Open PDF Bill"}
          </button>
          <button 
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default BillingModal;