"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, checked_in_today: 0, checked_out_today: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          axios.get('http://localhost:8000/stats/'),
          axios.get('http://localhost:8000/attendance/')
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-glow-cyan mb-2 tracking-tight">ADMIN <span className="text-tech-cyan">DASHBOARD</span></h2>
        <p className="text-gray-400">System overview and real-time attendance tracking.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-8 rounded-3xl border-l-4 border-tech-cyan">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-5xl font-black text-white">{stats.total_users}</p>
        </div>
        <div className="glass p-8 rounded-3xl border-l-4 border-green-500">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Checked In Today</p>
          <p className="text-5xl font-black text-green-400">{stats.checked_in_today}</p>
        </div>
        <div className="glass p-8 rounded-3xl border-l-4 border-tech-blue">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Checked Out Today</p>
          <p className="text-5xl font-black text-tech-blue">{stats.checked_out_today}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="glass rounded-[2rem] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <Link href="/admin/users" className="text-tech-cyan hover:underline text-sm font-semibold">Manage Users →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-5 text-gray-400 font-semibold text-sm">Employee</th>
                <th className="p-5 text-gray-400 font-semibold text-sm">Date</th>
                <th className="p-5 text-gray-400 font-semibold text-sm">Check In</th>
                <th className="p-5 text-gray-400 font-semibold text-sm">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tech-purple/20 border border-tech-purple/50 flex items-center justify-center text-tech-purple font-bold">
                        {record.user?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200">{record.user?.full_name}</p>
                        <p className="text-xs text-gray-500">{record.user?.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-gray-400 font-mono text-sm">{record.date}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-mono">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '--:--'}
                    </span>
                  </td>
                  <td className="p-5">
                    {record.check_out ? (
                      <span className="px-3 py-1 bg-tech-blue/10 text-tech-blue border border-tech-blue/20 rounded-lg text-sm font-mono">
                        {new Date(record.check_out).toLocaleTimeString()}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-sm italic pr-4">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr>
                   <td colSpan={4} className="p-10 text-center text-gray-500 italic">No activity recorded for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
