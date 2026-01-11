"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const adminStatus = typeof window !== 'undefined' ? localStorage.getItem('isAdmin') === 'true' : false;
    setIsLoggedIn(adminStatus);

    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !adminStatus) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    router.push('/admin/login');
  };

  return (
    <nav className="w-64 glass border-r border-white/10 p-6 flex flex-col gap-8 hidden md:flex z-50">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-tech-cyan rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.5)]">
          <span className="text-background font-bold text-xl">FA</span>
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-glow-cyan">FACE<span className="text-tech-cyan">CHECK</span></h1>
      </Link>

      <div className="flex flex-col gap-2">
        <p className="text-gray-500 uppercase text-xs font-semibold tracking-widest pl-2 mb-2">System</p>
        <Link href="/" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${pathname === '/' ? 'bg-tech-cyan/20 text-tech-cyan' : 'text-gray-300 hover:text-tech-cyan hover:bg-white/5'}`}>
          <span>Attendance</span>
        </Link>
        <Link href="/admin" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${pathname.startsWith('/admin') && pathname !== '/admin/login' ? 'bg-tech-cyan/20 text-tech-cyan' : 'text-gray-300 hover:text-tech-cyan hover:bg-white/5'}`}>
           <span>Admin Panel</span>
        </Link>
      </div>

      <div className="mt-auto space-y-4">
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            Logout Session
          </button>
        ) : (
          <Link href="/admin/login" className="w-full flex items-center gap-3 p-3 rounded-xl text-tech-cyan hover:bg-tech-cyan/10 transition-all font-bold text-sm border border-tech-cyan/20 text-center justify-center">
            Admin Login
          </Link>
        )}
        
        <div className="p-4 glass rounded-2xl border-white/5">
          <p className="text-xs text-gray-400">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-500">Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
