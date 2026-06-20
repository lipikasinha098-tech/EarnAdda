import React from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';
import { Coins, Sparkles, Target, Zap } from 'lucide-react';
import { RainingBackground } from '../components/RainingBackground';

export const Login = () => {
  const { user } = useAuth();

  const [error, setError] = React.useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to sign in. Please try opening the app in a new tab if you are inside an iframe.");
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

        <div className="text-center mt-8 mb-10">
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

        <div className="space-y-4 mb-10">
          <div className="flex flex-col gap-3">
             <FeatureItem icon={Zap} text="Instant Data Integration" color="text-yellow-400" bg="bg-yellow-400/10 border border-yellow-400/20" />
             <FeatureItem icon={Target} text="Decrypt Nodes for Points" color="text-cyan-400" bg="bg-cyan-400/10 border border-cyan-400/20" />
             <FeatureItem icon={Sparkles} text="Accelerated INR Layouts" color="text-pink-400" bg="bg-pink-400/10 border border-pink-400/20" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium text-center">
            {error}
            <div className="mt-2 text-xs text-blue-300">
              Note: If login is popping up and closing instantly, it may be blocked by your browser's cross-site cookie settings in this preview iframe. Please explicitly open the preview in a new window using the "Open in new tab" icon at the top right of this panel.
            </div>
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#050A1F] hover:bg-blue-50 py-4 px-6 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-wide"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          ACTIVATE WITH GOOGLE
        </button>
      </motion.div>

      <div className="absolute bottom-6 text-blue-500/50 text-xs font-mono uppercase tracking-widest">
         Securely powered by Firebase Auth Engine
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, text, color, bg }: { icon: any, text: string, color: string, bg: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#050A1F]/50 border border-blue-900/50">
    <div className={`p-2 rounded-lg ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <span className="text-sm font-bold text-blue-200">{text}</span>
  </div>
)
