"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/login/', { username, password });
      if (res.data.status === 'success') {
        localStorage.setItem('isAdmin', 'true');
        router.push('/admin');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tech-cyan/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tech-purple/10 blur-[150px] rounded-full"></div>

      <div className="glass p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-tech-cyan rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.4)]">
            <span className="text-background font-black text-3xl">FA</span>
          </div>
        </div>

        <h2 className="text-3xl font-black text-center mb-2 tracking-tighter">ADMIN <span className="text-tech-cyan">LOGIN</span></h2>
        <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-widest font-semibold">Security Level 1 Active</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 pl-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-tech-cyan/50 outline-none transition-all placeholder:text-gray-700"
              placeholder="Enter admin ID"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 pl-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-tech-cyan/50 outline-none transition-all placeholder:text-gray-700"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-bold animate-pulse">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-tech-cyan text-background py-5 rounded-2xl font-black text-lg tracking-tight hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            INITIALIZE AUTH
          </button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-white/5">
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-tech-cyan transition-colors text-xs font-bold uppercase tracking-widest">
            ← Return to Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
