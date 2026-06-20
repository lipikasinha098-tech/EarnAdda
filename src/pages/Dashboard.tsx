import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { UserActivity } from '../types';
import { Coins, ArrowUpRight, Copy, CheckCircle2, Ticket, PlaySquare, FileText, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const iconMap = {
  spin: Ticket,
  scratch: SparklesIcon,
  ad: PlaySquare,
  survey: FileText,
  review: Star,
  referral: ArrowUpRight,
  withdraw: ArrowUpRight
};

function SparklesIcon(props: any) {
  return <div className="text-teal-400 font-bold drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]" {...props}>&#10022;</div>;
}

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const acts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserActivity);
      setActivities(acts);
    });
    return () => unsub();
  }, [user]);

  const copyId = () => {
    if (user) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative z-10">
      
      {/* Header Profile Section */}
      <div className="bg-[#0A102E]/80 backdrop-blur-2xl border border-blue-900/50 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.3)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-5">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-20 h-20 rounded-2xl border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-500/20 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{profile?.name?.charAt(0) || 'U'}</span>
                </div>
              )}
              <div>
                 <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                    Welcome, {profile?.name?.split(' ')[0]}
                 </h2>
                 <p className="text-blue-300 font-medium text-sm mt-1">Ready to extract resources today?</p>
                 <div className="flex items-center gap-2 mt-3 cursor-pointer group" onClick={copyId}>
                    <code className="text-xs font-mono font-bold text-cyan-300 bg-cyan-900/40 border border-cyan-800/50 px-2 py-1 rounded">ID: {user?.uid.substring(0,8)}...</code>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" /> : <Copy className="w-4 h-4 text-blue-500 group-hover:text-cyan-400 transition-colors" />}
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px] rounded-2xl w-full md:w-auto shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <div className="bg-[#050A1F] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                 <div>
                    <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Total Yield</p>
                    <div className="flex items-center gap-2">
                       <Coins className="w-7 h-7 text-yellow-400 drop-shadow-md" />
                       <span className="text-4xl font-black font-mono text-white leading-none">{profile?.balance?.toLocaleString() || 0}</span>
                    </div>
                 </div>
                 <Link to="/withdraw" className="bg-blue-600/20 hover:bg-blue-500/30 text-blue-100 font-bold px-6 py-3 rounded-xl text-sm transition-all border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] text-center">
                    Withdraw
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction to="/spin" icon={Ticket} label="Spin Wheel" color="from-blue-600 to-cyan-500" />
        <QuickAction to="/scratch" icon={SparklesIcon} label="Decrypt Card" color="from-cyan-500 to-teal-400" />
        <QuickAction to="/tasks" icon={PlaySquare} label="Watch Ad" color="from-blue-500 to-indigo-500" />
        <QuickAction to="/tasks" icon={FileText} label="Survey Hub" color="from-indigo-500 to-purple-600" />
      </div>

      {/* Recent Activity */}
      <div className="bg-[#0A102E]/80 backdrop-blur-2xl border border-blue-900/50 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
         <h3 className="text-xl font-black text-blue-50 mb-6 flex items-center gap-3">
            <ArrowUpRight className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            Activity Log
         </h3>

         {activities.length === 0 ? (
            <div className="text-center py-12 text-blue-500/50 font-bold uppercase tracking-widest">
               No node activity recorded.
            </div>
         ) : (
            <div className="space-y-3">
               {activities.map((act, index) => {
                 const ActivityIcon = iconMap[act.type] || Coins;
                 return (
                   <motion.div 
                     key={act.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.05 }}
                     className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#050A1F] rounded-2xl border border-blue-900/50 hover:bg-blue-900/20 transition-all group"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] group-hover:border-blue-600 transition-colors">
                           <ActivityIcon className="w-6 h-6 text-blue-400 group-hover:text-cyan-400" />
                        </div>
                        <div>
                           <p className="font-bold text-blue-100">{act.description}</p>
                           <p className="text-xs text-blue-500 font-medium mt-1 uppercase tracking-wider">
                             {act.timestamp?.toDate ? act.timestamp.toDate().toLocaleString() : 'Just now'}
                           </p>
                        </div>
                     </div>
                     <div className={`flex items-center self-end sm:self-auto gap-1.5 px-4 py-2 rounded-xl border font-bold font-mono ${act.amount > 0 ? 'bg-green-950/40 border-green-900/50 text-green-400' : act.amount < 0 ? 'bg-red-950/40 border-red-900/50 text-red-400' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                        <span>{act.amount > 0 ? '+' : ''}{act.amount}</span>
                        <Coins className="w-4 h-4 ml-1" />
                     </div>
                   </motion.div>
                 )
               })}
            </div>
         )}
      </div>
    </div>
  );
};

const QuickAction = ({ to, icon: Icon, label, color }: { to: string, icon: any, label: string, color: string }) => (
  <Link to={to} className="block group">
     <div className="bg-[#0A102E]/80 backdrop-blur-md border border-blue-900/50 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-all relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} p-[2px] shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-transform duration-300`}>
           <div className="w-full h-full bg-[#050A1F] rounded-2xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-white drop-shadow-md" />
           </div>
        </div>
        <span className="font-bold text-blue-200 group-hover:text-white transition-colors text-sm text-center uppercase tracking-wider">{label}</span>
     </div>
  </Link>
);
