import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { signOutUser } from '../lib/firebase';
import { Coins, LayoutDashboard, Ticket, PlaySquare, FileText, Star, LogOut, Trophy, Wallet, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const Layout = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard, color: 'text-blue-400' },
    { path: '/profile', label: 'Profile', icon: UserIcon, color: 'text-purple-400' },
    { path: '/spin', label: 'Spin & Win', icon: Ticket, color: 'text-cyan-400' },
    { path: '/scratch', label: 'Scratch Cards', icon: tk => <div className="text-teal-400 font-bold">&#10022;</div> },
    { path: '/tasks', label: 'Earn More', icon: PlaySquare, color: 'text-green-400' },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-400' },
    { path: '/withdraw', label: 'Withdraw', icon: Wallet, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen text-blue-50 flex overflow-hidden font-sans bg-transparent">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-[#0A102E]/60 backdrop-blur-xl border-r border-blue-900/50 hidden md:flex flex-col relative z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
        <div className="p-6 pb-2 relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Coins className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md">
              Earn Adda
            </h1>
          </Link>
        </div>
        
        <div className="flex-1 py-8 flex flex-col gap-2 px-4 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon as any;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10 ${
                  isActive ? 'text-white' : 'text-blue-300/70 hover:text-blue-100 hover:bg-blue-900/30'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl -z-10 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {typeof Icon === 'function' && !item.color ? <Icon /> : <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />}
                <span className="font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-blue-900/50 mt-auto relative z-10 bg-[#050A1F]/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                <span className="text-white font-bold">{profile?.name?.charAt(0) || 'U'}</span>
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-blue-100 truncate">{profile?.name}</p>
              <p className="text-xs text-blue-400 font-mono flex items-center gap-1">
                <Coins className="w-3 h-3" /> {profile?.balance?.toLocaleString() || 0} PTS
              </p>
            </div>
          </div>
          <Link 
            to="/admin"
            className="w-full flex items-center gap-2 px-4 py-2.5 text-cyan-400 font-bold hover:bg-cyan-500/10 hover:text-cyan-300 rounded-lg transition-colors text-sm mb-1"
          >
            <UserIcon className="w-4 h-4" /> {/* Or Lock icon if imported, but using UserIcon from lucide-react */}
            Admin Panel
          </Link>
          <button 
            onClick={signOutUser}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0A102E]/80 backdrop-blur-md border-b border-blue-900/50">
           <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-1.5 rounded-lg text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              <Coins className="w-5 h-5" />
            </div>
            <h1 className="font-black text-white">
              Earn Adda
            </h1>
          </Link>
           <div className="flex items-center gap-4">
             <Link to="/admin" className="text-cyan-400 p-1">
               <UserIcon className="w-5 h-5" />
             </Link>
             <div className="flex items-center gap-2 bg-[#050A1F] px-3 py-1.5 rounded-full border border-blue-800/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-mono text-sm font-bold text-blue-100">{profile?.balance?.toLocaleString() || 0}</span>
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center justify-around p-2 bg-[#0A102E]/90 backdrop-blur-xl border-t border-blue-900/50 pb-safe">
           {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon as any;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive ? 'text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-blue-500/60 hover:text-blue-300'
                }`}
              >
                {typeof Icon === 'function' && !item.color ? <Icon /> : <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />}
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  );
};
