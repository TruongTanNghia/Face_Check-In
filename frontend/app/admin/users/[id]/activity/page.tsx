"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

export default function UserActivity() {
  const { id } = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [userRes, logsRes] = await Promise.all([
        axios.get('http://localhost:8000/users/'),
        axios.get(`http://localhost:8000/users/${id}/logs`)
      ]);
      const currentUser = userRes.data.find((u: any) => u.id === Number(id));
      setUser(currentUser);
      setLogs(logsRes.data);
    } catch (err) {
      console.error("Error fetching activity data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-tech-cyan animate-pulse font-mono">LOADING ENCRYPTED DATA...</div>;
  if (!user) return <div className="p-20 text-center text-red-500 font-bold">USER_NOT_FOUND</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <button 
            onClick={() => router.back()}
            className="text-tech-cyan hover:text-white transition-colors mb-4 flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Management
          </button>
          <h2 className="text-4xl font-extrabold text-glow-cyan mb-2 tracking-tight uppercase">
            Activity Logs: <span className="text-white">{user.full_name}</span>
          </h2>
          <p className="text-gray-400 font-mono text-sm tracking-widest">{user.employee_id} // BIO_DATA_SECURE</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {logs.map((log) => (
          <div key={log.id} className="glass group overflow-hidden border border-white/5 hover:border-tech-cyan/30 transition-all duration-300 rounded-3xl p-6 flex items-center gap-8">
            <div className={`p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] ${
              log.log_type === 'Check-in' ? 'bg-green-500/10 border border-green-500/20' : 'bg-tech-blue/10 border border-tech-blue/20'
            }`}>
              <span className={`text-[0.6rem] font-black uppercase tracking-[0.2em] mb-1 ${
                log.log_type === 'Check-in' ? 'text-green-400' : 'text-tech-blue'
              }`}>Status</span>
              <span className={`text-lg font-black uppercase ${
                log.log_type === 'Check-in' ? 'text-green-400' : 'text-tech-blue'
              }`}>{log.log_type}</span>
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Timestamp</p>
              <div className="flex items-baseline gap-4">
                <p className="text-2xl font-bold text-gray-200">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-gray-500 font-mono">
                  {new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {log.snapshot_path && (
               <div className="flex items-center gap-4 pr-4">
                  <div className="text-right">
                    <p className="text-[0.6rem] text-gray-600 font-black uppercase">Identity Verified</p>
                    <p className="text-[0.5rem] text-tech-cyan/40 font-mono uppercase">Snapshot_ID: {log.id}</p>
                  </div>
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 glass">
                     {/* In a real app, this would be an img tag pointing to the backend. 
                         For this demo, we'll use a placeholder or tech icon if file serving isn't setup. */}
                     <div className="w-full h-full flex items-center justify-center bg-white/5 text-tech-cyan">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                     </div>
                  </div>
               </div>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="glass p-20 text-center rounded-[2rem] border-dashed border-2 border-white/5">
            <p className="text-gray-500 font-mono uppercase tracking-[0.3em]">No activity history found for this operative</p>
          </div>
        )}
      </div>
    </div>
  );
}
