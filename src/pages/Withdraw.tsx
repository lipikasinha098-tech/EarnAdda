import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Coins, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const Withdraw = () => {
  const { profile, user } = useAuth();
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const withdrawAmount = async () => {
    if (!user || !profile) return;
    if (!amount || amount < 50) {
      setMessage('Minimum withdraw is 50 Points (10 INR)');
      setStatus('error');
      return;
    }
    if (profile.balance < amount) {
      setMessage('Insufficient balance');
      setStatus('error');
      return;
    }
    if (!address) {
      setMessage('Please enter payout details');
      setStatus('error');
      return;
    }

    setStatus('loading');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-amount)
      });

      const activitiesRef = collection(db, 'users', user.uid, 'activities');
      await addDoc(activitiesRef, {
        type: 'withdraw',
        amount: -amount,
        description: `Withdrew ${amount} Points (${amount / 5} INR) to ${method.toUpperCase()}`,
        timestamp: serverTimestamp()
      });

      const globalWithdrawalRef = collection(db, 'withdrawals');
      await addDoc(globalWithdrawalRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: profile.name,
        amount,
        inr: amount / 5,
        method,
        address,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      setStatus('success');
      setMessage(`Successfully requested withdrawal of ${amount / 5} INR.`);
      setAddress('');
      setAmount('');
    } catch (e) {
      setStatus('error');
      setMessage('Failed to process withdrawal. Try again later.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div className="text-center mb-12">
         <h2 className="text-3xl font-extrabold text-blue-50 mb-2 flex items-center justify-center gap-3">
            <Wallet className="w-8 h-8 text-blue-400" />
            Cash Out Funds
         </h2>
         <p className="text-blue-300">Convert your points into real cash! 5 Points = 1 INR. Min 50 Points.</p>
      </div>

      <div className="bg-[#0A102E]/80 backdrop-blur-2xl border border-blue-900/50 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(30,58,138,0.2)]">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-blue-950/50 p-6 rounded-2xl border border-blue-800/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <p className="text-blue-200 text-sm font-medium mb-2">Available Balance</p>
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-400" />
                <span className="text-4xl font-black text-white font-mono">{profile?.balance?.toLocaleString() || 0}</span>
                <span className="text-xl text-blue-400 font-bold ml-1">PTS</span>
              </div>
              <div className="mt-2 text-green-400 font-medium">
                 ≈ {((profile?.balance || 0) / 5).toLocaleString()} INR
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Payout Method</label>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setMethod('upi')}
                       className={`flex-1 py-3 px-4 rounded-xl border ${method === 'upi' ? 'bg-blue-600/30 border-blue-400 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-transparent border-blue-900/50 text-blue-400'} transition-all`}
                     >
                        UPI ID
                     </button>
                     <button 
                       onClick={() => setMethod('bank')}
                       className={`flex-1 py-3 px-4 rounded-xl border ${method === 'bank' ? 'bg-blue-600/30 border-blue-400 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-transparent border-blue-900/50 text-blue-400'} transition-all`}
                     >
                        Bank Transfer
                     </button>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    {method === 'upi' ? 'UPI Address' : 'Account Details (Acc No, IFSC)'}
                  </label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={method === 'upi' ? "e.g., yourname@upi" : "Acc: 123..., IFSC: SBIN00... "}
                    className="w-full bg-[#050B20] border border-blue-800 rounded-xl px-4 py-3 text-blue-50 placeholder:text-blue-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Points to Withdraw</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Min. 50"
                    min="50"
                    className="w-full bg-[#050B20] border border-blue-800 rounded-xl px-4 py-3 text-blue-50 placeholder:text-blue-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                  {amount && Number(amount) >= 50 && (
                     <p className="text-sm text-green-400 mt-2">You will receive: {(Number(amount) / 5).toFixed(2)} INR</p>
                  )}
               </div>
            </div>

            {status === 'error' && (
               <div className="flex items-center gap-2 text-red-400 bg-red-950/50 p-3 rounded-lg border border-red-900">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{message}</span>
               </div>
            )}
            {status === 'success' && (
               <div className="flex items-center gap-2 text-green-400 bg-green-950/50 p-3 rounded-lg border border-green-900">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{message}</span>
               </div>
            )}

            <button 
              onClick={withdrawAmount}
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wide"
            >
               {status === 'loading' ? 'Processing...' : 'Withdraw Now'}
            </button>
          </div>
          
          <div className="flex-1">
             <div className="bg-blue-950/20 p-6 rounded-2xl border border-blue-900/30 h-full flex flex-col justify-center">
                <h3 className="font-bold text-blue-200 mb-4 text-xl">Payment Guidelines</h3>
                <ul className="space-y-4 text-sm text-blue-300">
                   <li className="flex gap-3 items-start">
                     <span className="text-blue-500 text-lg mt-[-2px]">❖</span>
                     <span className="leading-snug">Payments are processed directly to your account within 24-48 working hours.</span>
                   </li>
                   <li className="flex gap-3 items-start">
                     <span className="text-blue-500 text-lg mt-[-2px]">❖</span>
                     <span className="leading-snug">Ensure your UPI ID or Bank details are 100% accurate. We are not responsible for wrong transfers.</span>
                   </li>
                   <li className="flex gap-3 items-start">
                     <span className="text-blue-500 text-lg mt-[-2px]">❖</span>
                     <span className="leading-snug flex items-center gap-1 bg-blue-900/50 px-2 py-1 rounded inline-flex"><b>5 Points</b> = <b>₹1.00 INR</b></span>
                   </li>
                   <li className="flex gap-3 items-start">
                     <span className="text-blue-500 text-lg mt-[-2px]">❖</span>
                     <span className="leading-snug">Minimum withdrawal is clearly set at <b className="text-green-400">50 Points (₹10 INR)</b>.</span>
                   </li>
                </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
