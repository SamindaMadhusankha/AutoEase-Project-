// components/AdminLogin.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      alert("අවසර නැත!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleAdminAuth} className="p-8 border rounded-xl">
        <h2 className="text-xl font-bold mb-4">Admin Portal</h2>
        <input type="email" onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border mb-2" placeholder="Admin Email" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border mb-4" placeholder="Password" />
        <button className="bg-red-600 text-white p-2 w-full">Login to Admin</button>
      </form>
    </div>
  );
}
export default AdminLogin;