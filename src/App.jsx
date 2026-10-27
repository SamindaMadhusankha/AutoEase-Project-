import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import CustomerProfile from './components/CustomerProfile';
import AdminDashboard from './components/AdminDashboard'; 
import Login from './pages/Login'; 
import CustomerDashboard from './pages/CustomerDashboard';
import frontImg from './assets/front.jpg';
import logo from './assets/logo.png';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Booking from './components/Booking'; 
import Services from './components/Services';
import Servicing from './components/Servicing';
import AutoDetailing from './components/AutoDetailing';
import MobileFirstAid from './components/MobileFirstAid'; 
import diagnosticsImg from './assets/diagnostics.jpg'; 
import tuneupImg from './assets/tuneup.jpg';
import detailingImg from './assets/detailing.jpg';
import Footer from './components/Footer';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [subTab, setSubTab] = useState('booking'); 
  const [serviceType, setServiceType] = useState('service');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [phoneInput, setPhoneInput] = useState(''); 
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedService, setSelectedService] = useState('');

  // default එක 'profile' ලෙසට හෝ අවශ්‍ය නම් වෙනස් කරගත හැක
  const [customerTab, setCustomerTab] = useState('profile');

  const isAdminPort = window.location.port === '3000';

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
        setUser(currentUser);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    let finalEmail = phoneInput === "autoease_admin@gmail.com" ? phoneInput : `${phoneInput.replace(/\s+/g, '')}@autoease.com`;
    try {
      if (isSignUp) { 
        await createUserWithEmailAndPassword(auth, finalEmail, password); 
        alert("Account Created Successfully!"); 
      } else { 
        await signInWithEmailAndPassword(auth, finalEmail, password); 
        alert("Logged in successfully!"); 
      }
    } catch (err) { 
      setMessage("Login failed: " + err.message); 
    }
  };

  const handleLogout = () => signOut(auth);

  if (isAdminPort) {
    return (
      <div className={`min-h-screen font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
        <nav className="bg-slate-900 text-white p-4 px-8 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl tracking-wide text-orange-500">AutoEase Admin Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-1 text-sm font-bold rounded-full border border-slate-700">
              {darkMode ? '☀️ LIGHT' : '🌙 DARK'}
            </button>
            {isLoggedIn && (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl text-sm transition">
                Logout
              </button>
            )}
          </div>
        </nav>

        <main className="p-6">
          {isLoggedIn ? (
            user?.email === "autoease_admin@gmail.com" ? (
              <AdminDashboard />
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-slate-500 mb-4">You do not have administrative privileges to view this portal.</p>
                <button onClick={handleLogout} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">Log out and try again</button>
              </div>
            )
          ) : (
            <div className="max-w-md mx-auto mt-16 p-8 border rounded-3xl shadow-xl bg-white dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-2xl font-black mb-6 text-red-600 text-center">Admin Portal Sign In</h2>
              {message && <p className="text-red-500 text-sm mb-4 text-center">{message}</p>}
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Admin Email</label>
                  <input 
                    type="text" 
                    onChange={(e) => setPhoneInput(e.target.value)} 
                    className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700" 
                    placeholder="autoease_admin@gmail.com" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Password</label>
                  <input 
                    type="password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold transition">
                  Login to Admin Console
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      <nav className={`sticky top-0 z-50 border-b px-6 py-4 flex justify-between items-center shadow-sm backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
          <img src={logo} alt="Logo" className="h-10 w-auto" /> 
        </div>
        
        <div className={`hidden md:flex items-center space-x-8 font-semibold text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          <button onClick={() => setCurrentTab('home')} className={`hover:text-blue-500 transition-colors ${currentTab === 'home' && 'text-blue-500 font-bold'}`}>Home</button>
          
          <div className="relative group">
            <button className={`flex items-center gap-1 transition-colors ${darkMode ? 'text-slate-200 hover:text-blue-400' : 'text-slate-600 hover:text-blue-500'}`}>Our Services ▾</button>
            <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl p-4 space-y-2 z-50 border transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} opacity-0 invisible group-hover:opacity-100 group-hover:visible`}>
              <button onClick={() => {setServiceType('Vehicle_Repair'); setCurrentTab('services');}} className={`block w-full text-left font-medium capitalize transition-colors ${darkMode ? 'text-slate-200 hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}>Vehicle Repair</button>
              <button onClick={() => setCurrentTab('servicing')} className={`block w-full text-left font-medium capitalize transition-colors ${darkMode ? 'text-slate-200 hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}>Vehicle Servicing</button>
              <button onClick={() => setCurrentTab('autoDetailing')} className={`block w-full text-left font-medium capitalize transition-colors ${darkMode ? 'text-slate-200 hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}>Auto Detailing</button>
              <button onClick={() => {setServiceType('Mobile_First_Aid'); setCurrentTab('mobileFirstAid');}} className={`block w-full text-left font-medium capitalize transition-colors ${darkMode ? 'text-slate-200 hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}>Mobile First Aid</button>
            </div>
          </div>
          <button onClick={() => setCurrentTab('about')} className="hover:text-blue-500">About Us</button>
          <button onClick={() => setCurrentTab('contact')} className="hover:text-blue-500">Contact Us</button>
        </div>

        <button className="md:hidden p-2 text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => {setCurrentTab('system'); setSubTab('login');}} 
            className={`font-bold hover:text-blue-500 ${currentTab === 'system' ? 'text-blue-500' : ''}`}
          >
            {isLoggedIn ? 'My Account' : 'Login'}
          </button>
          <div className={`h-6 w-[1px] ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
          <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 font-bold rounded-full border">{darkMode ? '☀️ LIGHT' : '🌙 DARK'}</button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className={`md:hidden p-6 space-y-4 border-b ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <button onClick={() => {setCurrentTab('home'); setIsMobileMenuOpen(false)}} className="block w-full text-left">Home</button>
          <button onClick={() => {setCurrentTab('autoDetailing'); setIsMobileMenuOpen(false)}} className="block w-full text-left">Auto Detailing</button>
          <button onClick={() => {setCurrentTab('servicing'); setIsMobileMenuOpen(false)}} className="block w-full text-left">Vehicle Servicing</button>
          <button onClick={() => {setCurrentTab('mobileFirstAid'); setIsMobileMenuOpen(false)}} className="block w-full text-left">Mobile First Aid</button>
          <button onClick={() => {setCurrentTab('about'); setIsMobileMenuOpen(false)}} className="block w-full text-left">About Us</button>
          <button onClick={() => {setCurrentTab('contact'); setIsMobileMenuOpen(false)}} className="block w-full text-left">Contact Us</button>
          <button onClick={() => {setCurrentTab('system'); setIsMobileMenuOpen(false)}} className="block w-full text-left font-bold text-blue-500">
            {isLoggedIn ? 'My Account' : 'Login'}
          </button>
        </div>
      )}

      <main className="flex-grow">
        {currentTab === 'home' && <Home darkMode={darkMode} setCurrentTab={setCurrentTab} setSubTab={setSubTab} frontImg={frontImg} diagnosticsImg={diagnosticsImg} tuneupImg={tuneupImg} detailingImg={detailingImg} />}
        
        {currentTab === 'services' && (
          <Services 
            darkMode={darkMode} 
            serviceType={serviceType} 
            setCurrentTab={setCurrentTab} 
            setSubTab={setSubTab} 
            setSelectedService={setSelectedService} 
          />
        )} 
        
        {currentTab === 'servicing' && <Servicing darkMode={darkMode} />}

        {currentTab === 'autoDetailing' && (
          <AutoDetailing 
            darkMode={darkMode} 
            setCurrentTab={setCurrentTab} 
            setSubTab={setSubTab} 
            setSelectedService={setSelectedService} 
          />
        )} 

        {currentTab === 'mobileFirstAid' && <MobileFirstAid darkMode={darkMode} />}
        {currentTab === 'about' && <About darkMode={darkMode} />}
        {currentTab === 'contact' && <Contact darkMode={darkMode} />}

        {currentTab === 'system' && (
          <div className="max-w-6xl mx-auto py-8 px-4">
            {isLoggedIn ? (
              <div className="relative">
                {/* Customer Portal Navigation Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 gap-4">
                  
                  {/* Tabs: My Profile (Left) & Dashboard (Right) */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                    <button
                      onClick={() => setCustomerTab('profile')}
                      className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
                        customerTab === 'profile'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      👤 My Profile
                    </button>
                    <button
                      onClick={() => setCustomerTab('dashboard')}
                      className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
                        customerTab === 'dashboard'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      📊 Dashboard & Bookings
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-md shadow-red-500/20 text-sm cursor-pointer"
                  >
                    Logout
                  </button>
                </div>

                {/* Tab Content Rendering */}
                {customerTab === 'dashboard' ? (
                  <CustomerDashboard user={user} darkMode={darkMode} />
                ) : (
                  <CustomerProfile user={user} />
                )}
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                {subTab === 'booking' ? (
                  <Booking darkMode={darkMode} user={user} selectedService={selectedService} />
                ) : (
                  <Login darkMode={darkMode} />
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;