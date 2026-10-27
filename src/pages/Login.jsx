import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Login = ({ darkMode, isLoggedIn, handleLogout }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login"); // 'login', 'register', or 'forgot'
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 1. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      alert("Welcome back!");
      navigate('/customer-dashboard'); 
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Create Account / Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      alert("Account created successfully! Welcome to AutoEase.");
      navigate('/customer-dashboard');
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Password reset link sent! Check your email inbox.");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Switch view helper function
  const switchView = (newView) => {
    setView(newView);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        
        {isLoggedIn ? (
          // Logged in UI
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">You are already logged in!</h2>
            <button 
              onClick={() => {
                handleLogout();
                navigate('/');
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            {/* Notifications */}
            {message && (
              <div className="p-3 mb-4 text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 rounded-xl text-center">
                {message}
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-300 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {view === "login" && (
              <>
                <h2 className="text-3xl font-black text-center mb-2">Customer Login</h2>
                <p className="text-center text-slate-500 mb-8">Access your service records</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <input 
                    type="email" 
                    value={email}
                    placeholder="Email (e.g. 07XXXXXXXX@autoease.com)" 
                    className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  <input 
                    type="password" 
                    value={password}
                    placeholder="Password" 
                    className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-sm font-semibold text-orange-500 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 cursor-pointer"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                {/* Create Account Link */}
                <div className="text-center mt-6 pt-4 border-t dark:border-slate-800">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button
                      onClick={() => switchView("register")}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Create One
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* 2. REGISTER / CREATE ACCOUNT FORM */}
            {view === "register" && (
              <>
                <h2 className="text-3xl font-black text-center mb-2">Create Account</h2>
                <p className="text-center text-slate-500 mb-8">Sign up for a new AutoEase account</p>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <input 
                    type="email" 
                    value={email}
                    placeholder="Email Address" 
                    className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  <input 
                    type="password" 
                    value={password}
                    placeholder="Password (Min. 6 characters)" 
                    className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    placeholder="Confirm Password" 
                    className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500" 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 cursor-pointer"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                {/* Back to Login Link */}
                <div className="text-center mt-6 pt-4 border-t dark:border-slate-800">
                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}
                    <button
                      onClick={() => switchView("login")}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {view === "forgot" && (
              <>
                <h2 className="text-3xl font-black text-center mb-2">Reset Password</h2>
                <p className="text-center text-slate-500 mb-8">Enter your email to receive a reset link</p>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <input 
                    type="email" 
                    value={email}
                    placeholder="Enter your registered email" 
                    className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    {loading ? "Sending link..." : "Send Password Reset Link"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchView("login")}
                      className="text-sm font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;