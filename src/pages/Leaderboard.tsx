import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Trophy, Coins, Medal } from 'lucide-react';
import { motion } from 'motion/react';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('balance', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserProfile);
        setLeaders(users);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div className="text-center mb-12">
         <h2 className="text-4xl font-extrabold text-blue-50 mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            Top Earners
         </h2>
         <p className="text-blue-300">The highest rolling reward hunters on the platform.</p>
      </div>

      <div className="bg-[#0A102E]/80 backdrop-blur-2xl border border-blue-900/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.2)]">
         {loading ? (
           <div className="p-12 flex justify-center">
             <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
           </div>
         ) : leaders.length === 0 ? (
           <div className="p-12 text-center text-blue-500/50 uppercase tracking-widest font-bold">No users detected.</div>
         ) : (
           <div className="divide-y divide-blue-900/50">
             {leaders.map((user, index) => (
               <motion.div 
                 key={user.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className="flex items-center justify-between p-4 md:p-6 hover:bg-blue-900/20 transition-all group"
               >
                 <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-10 text-center font-black text-xl text-blue-800 drop-shadow-sm group-hover:text-blue-500 transition-colors">
                       {index === 0 ? <Medal className="w-8 h-8 text-yellow-400 mx-auto drop-shadow-md" /> : 
                        index === 1 ? <Medal className="w-8 h-8 text-slate-300 mx-auto drop-shadow-md" /> : 
                        index === 2 ? <Medal className="w-8 h-8 text-amber-600 mx-auto drop-shadow-md" /> : 
                        `#${index + 1}`}
                    </div>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-blue-600 bg-blue-900/50 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                          <span className="text-lg font-bold text-white">{user.name?.charAt(0) || 'U'}</span>
                      </div>
                    )}
                    <div>
                       <h3 className="font-bold text-blue-100 text-lg md:text-xl tracking-tight">{user.name}</h3>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 bg-[#050B20] px-4 py-2 rounded-xl border border-blue-800/50 shadow-inner">
                    <Coins className="w-5 h-5 text-yellow-400 drop-shadow-sm" />
                    <span className="font-mono font-black text-white text-lg md:text-xl">{user.balance?.toLocaleString() || 0}</span>
                 </div>
               </motion.div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};
