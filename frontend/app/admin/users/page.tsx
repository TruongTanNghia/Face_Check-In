"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', employee_id: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users/');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/users/', newUser);
      setNewUser({ full_name: '', employee_id: '' });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      alert("Error adding user. ID might exist.");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this user? All face data and attendance will be removed.")) {
      try {
        await axios.delete(`http://localhost:8000/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Error deleting user.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-glow-cyan mb-2 tracking-tight">USER <span className="text-tech-cyan">MANAGEMENT</span></h2>
          <p className="text-gray-400">Register new employees and manage face database.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-tech-cyan text-background px-6 py-3 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all"
        >
          Add New User
        </button>
      </header>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-8 rounded-[2rem] border-tech-cyan/30 border w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6 text-tech-cyan">Register User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tech-cyan outline-none transition-colors"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Employee ID</label>
                <input 
                  type="text" 
                  value={newUser.employee_id}
                  onChange={(e) => setNewUser({...newUser, employee_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tech-cyan outline-none transition-colors"
                  placeholder="e.g. EMP001"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-tech-cyan text-background py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-all font-mono"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass rounded-[2rem] overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-5 text-gray-400 font-semibold text-sm">Full Name</th>
                <th className="p-5 text-gray-400 font-semibold text-sm">ID</th>
                <th className="p-5 text-gray-400 font-semibold text-sm text-center">Face Registered</th>
                <th className="p-5 text-gray-400 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-5 font-bold text-gray-200">{user.full_name}</td>
                  <td className="p-5 text-gray-400 font-mono text-sm">{user.employee_id}</td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      {user.face_registered ? (
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Missing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                     <div className="flex justify-end gap-3">
                        <Link 
                          href={`/admin/register-face/${user.id}`}
                          className="px-4 py-2 bg-tech-blue/20 text-tech-blue border border-tech-blue/30 rounded-xl text-xs font-bold hover:bg-tech-blue hover:text-white transition-all"
                        >
                          {user.face_registered ? 'Retrain Face' : 'Register Face'}
                        </Link>
                        <Link 
                          href={`/admin/users/${user.id}/activity`}
                          className="px-4 py-2 bg-tech-purple/20 text-tech-purple border border-tech-purple/30 rounded-xl text-xs font-bold hover:bg-tech-purple hover:text-white transition-all"
                        >
                          Activity
                        </Link>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                        >
                          Delete
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
