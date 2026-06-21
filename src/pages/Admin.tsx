import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lock, Search, CheckCircle, XCircle, List, User as UserIcon, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('admin') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users'>('withdrawals');
  
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [searchEmail, setSearchEmail] = useState('');
  const [balanceMod, setBalanceMod] = useState<number>(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'EARNADDA1221' && password === 'EARNADDA2112') {
      setIsAdmin(true);
      sessionStorage.setItem('admin', 'true');
    } else {
      alert('Invalid admin credentials');
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const q = query(collection(db, 'withdrawals'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchWithdrawals();
      fetchUsers();
    }
  }, [isAdmin]);

  const handleWithdrawal = async (id: string, status: 'approved' | 'rejected', userId: string, amount: number) => {
    try {
      const wRef = doc(db, 'withdrawals', id);
      await updateDoc(wRef, { status });

      if (status === 'rejected') {
        const uRef = doc(db, 'users', userId);
        await updateDoc(uRef, { balance: increment(amount) });
        
        const actRef = collection(db, 'users', userId, 'activities');
        await addDoc(actRef, {
          type: 'refund',
          amount: amount,
          description: `Refund for rejected withdrawal`,
          timestamp: serverTimestamp()
        });
      }
      
      alert(`Withdrawal ${status}`);
      fetchWithdrawals();
    } catch (e) {
      console.error(e);
      alert('Error updating withdrawal');
    }
  };

  const handleModifyBalance = async (userId: string, currentBalance: number) => {
    if (balanceMod === 0) return;
    try {
      const uRef = doc(db, 'users', userId);
      await updateDoc(uRef, { balance: increment(balanceMod) });
      
      const actRef = collection(db, 'users', userId, 'activities');
      await addDoc(actRef, {
        type: 'admin',
        amount: balanceMod,
        description: `Admin balance adjustment`,
        timestamp: serverTimestamp()
      });
      
      alert('Balance updated');
      setBalanceMod(0);
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Error updating balance');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-[#050B20] border border-blue-900 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6 flex items-center justify-center gap-2">
          <Lock className="w-6 h-6" /> Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-[#0A102E] border border-blue-800 rounded px-4 py-3 text-blue-50 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#0A102E] border border-blue-800 rounded px-4 py-3 text-blue-50 focus:outline-none focus:border-cyan-500"
          />
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded uppercase tracking-wider">
            Login
          </button>
        </form>
      </div>
    );
  }

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchEmail.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto drop-shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'withdrawals' ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/50' : 'text-blue-300 hover:bg-blue-900/30'}`}
          >
            <List className="w-5 h-5" /> Withdrawals
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/50' : 'text-blue-300 hover:bg-blue-900/30'}`}
          >
            <UserIcon className="w-5 h-5" /> Manage Users
          </button>
          <div className="pt-4 border-t border-blue-900/50 mt-4">
             <button
               onClick={() => { sessionStorage.setItem('admin', 'false'); setIsAdmin(false); }}
               className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-950/30 rounded-xl"
             >
               Logout Admin
             </button>
          </div>
        </div>

        <div className="flex-1 bg-[#050B20] border border-blue-900/50 p-6 rounded-2xl">
          {activeTab === 'withdrawals' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                 <Activity className="w-6 h-6" /> Withdrawal Requests
              </h3>
              
              {withdrawals.length === 0 ? (
                <p className="text-blue-300">No withdrawals found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-blue-200 text-sm">
                    <thead>
                      <tr className="border-b border-blue-800">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Method / Address</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map(w => (
                        <tr key={w.id} className="border-b border-blue-900/30 hover:bg-blue-900/10 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{w.userName}</div>
                            <div className="text-xs text-blue-400">{w.userEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-yellow-400">{w.amount}</span> PTS<br/>
                            <span className="text-xs text-green-400">₹{w.inr}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="uppercase text-xs font-bold text-blue-300">{w.method}</span><br/>
                            <span className="font-mono">{w.address}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${w.status === 'pending' ? 'bg-yellow-900/50 text-yellow-500' : w.status === 'approved' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {w.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleWithdrawal(w.id, 'approved', w.userId, w.amount)} className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded transition-colors" title="Approve">
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleWithdrawal(w.id, 'rejected', w.userId, w.amount)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded transition-colors" title="Reject">
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between mb-6 border-b border-blue-900/50 pb-4">
                <h3 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                   <UserIcon className="w-6 h-6" /> User Management
                </h3>
              </div>

              <div className="grid gap-4">
                {users.map((u, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={u.id} 
                    className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-cyan-500/30 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <span className="text-2xl font-bold text-white">{u.name?.charAt(0) || 'U'}</span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#050B20]"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-lg md:text-xl truncate">{u.name || 'No Name'}</div>
                        <div className="text-sm text-blue-400 font-mono truncate">{u.email || 'No email provided'}</div>
                        <div className="text-xs text-blue-500 mt-1 truncate">ID: {u.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto border-t border-blue-900/30 md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                      <div className="text-center px-4 md:border-r border-blue-900/50">
                        <div className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">Balance</div>
                        <div className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{u.balance || 0}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="+ / - Mod"
                          onChange={e => setBalanceMod(Number(e.target.value))}
                          className="w-24 bg-[#0A102E] border border-blue-800 rounded-lg px-3 py-2 text-blue-50 font-mono text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                        <button
                          onClick={() => handleModifyBalance(u.id, u.balance || 0)}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] active:scale-95"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
