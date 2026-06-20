import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, Target, Zap, Phone, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { RainingBackground } from '../components/RainingBackground';
import { auth, db } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const Login = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number with country code (e.g. +91...)");
      return;
    }

    try {
      setLoading(true);
      setupRecaptcha();
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('OTP');
    } catch (e: any) {
      console.error("SMS Sending Error:", e);
      setError(e.message || "Failed to send OTP. Make sure Phone Auth is enabled in Firebase.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
       setError("Please enter a valid 6-digit OTP");
       return;
    }
    if (!confirmationResult) return;

    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);
      
      // Ensure user document exists
      if (result.user) {
        const u = result.user;
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
             name: u.phoneNumber || 'Anonymous',
             email: '',
             photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`,
             balance: 0,
             createdAt: serverTimestamp(),
          });
        }
      }

    } catch (e: any) {
      console.error("OTP Verification Error:", e);
      setError(e.message || "Invalid OTP entered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020512] flex flex-col items-center justify-center relative overflow-hidden text-blue-50">
      <RainingBackground />
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md p-8 md:p-12 bg-[#0A102E]/70 backdrop-blur-2xl border border-blue-900/50 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.3)] relative"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 p-[3px] rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]"
           >
              <div className="bg-[#050A1F] p-4 rounded-xl">
                 <Coins className="w-10 h-10 text-cyan-400" />
              </div>
           </motion.div>
        </div>

        <div className="text-center mt-8 mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black mb-3 text-white tracking-tight drop-shadow-md"
          >
            Earn Adda
          </motion.h1>
          <p className="text-blue-300 text-sm font-medium">Log in to extract high-yield data points directly via secure tasks.</p>
        </div>

        <div id="recaptcha-container"></div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'PHONE' ? (
            <motion.form 
              key="phone-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="tel"
                    placeholder="+91 9999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#050A1F] border border-blue-900/50 rounded-xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-blue-900/50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 py-4 px-6 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(30,58,138,0.4)] tracking-wide disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    SEND OTP <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Enter OTP</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input 
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#050A1F] border border-cyan-900/50 rounded-xl py-4 pl-12 pr-4 text-cyan-50 font-black tracking-widest text-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-cyan-900/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setStep('PHONE'); setError(null); }}
                  className="bg-[#050A1F] border border-blue-900/50 text-blue-400 p-4 rounded-xl hover:bg-blue-900/20 hover:text-blue-300 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 py-4 px-6 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)] tracking-wide disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "VERIFY"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute bottom-6 text-blue-500/50 text-xs font-mono uppercase tracking-widest">
         Securely powered by Firebase Auth Engine
      </div>
    </div>
  );
};

