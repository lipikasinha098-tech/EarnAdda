import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addReward } from '../lib/firebase';
import { PlaySquare, FileText, Star, Loader2, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Tasks = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div>
         <h2 className="text-4xl font-extrabold text-blue-50 mb-2 tracking-tight">Earning Hub</h2>
         <p className="text-blue-300/80">Complete high-yield operations to expand your balance quickly.</p>
      </div>

      <div className="grid gap-6">
         {/* Ad Task */}
         <TaskCard 
           title="Watch Video Ad" 
           description="Full 15-second sponsor video."
           reward={10} 
           icon={PlaySquare} 
           type="ad"
           color="from-blue-500 to-cyan-500"
           glowColor="rgba(56,189,248,0.3)"
         />

         {/* Survey Task */}
         <TaskCard 
           title="Opinion Tracker Survey" 
           description="Complete a short questionnaire."
           reward={Math.floor(Math.random() * 41) + 10} // Random 10 to 50
           icon={FileText} 
           type="survey"
           color="from-indigo-500 to-purple-600"
           glowColor="rgba(139,92,246,0.3)"
         />

         {/* Review Task */}
         <TaskCard 
           title="App Store Review" 
           description="Leave a 5-star rating on the store."
           reward={12} 
           icon={Star} 
           type="review"
           color="from-blue-600 to-indigo-700"
           glowColor="rgba(79,70,229,0.3)"
         />
      </div>
    </div>
  );
};

const TaskCard = ({ title, description, reward, icon: Icon, type, color, glowColor }: any) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const startTask = () => {
    if (status !== 'idle' || !user) return;
    setStatus('running');
    
    const duration = type === 'ad' ? 15000 : type === 'survey' ? 8000 : 5000;
    const interval = 100;
    let current = 0;

    const timer = setInterval(() => {
       current += interval;
       setProgress((current / duration) * 100);
       
       if (current >= duration) {
          clearInterval(timer);
          completeTask();
       }
    }, interval);
  };

  const completeTask = async () => {
    if (!user) return;
    await addReward(user.uid, type, reward, `Completed task: ${title}`);
    setStatus('completed');
  };

  return (
    <div className="bg-[#0A102E]/80 backdrop-blur-xl border border-blue-900/50 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div 
         className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none blur-3xl transition-opacity opacity-20 group-hover:opacity-40" 
         style={{ background: glowColor }}
      />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
         <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} p-[1px] shadow-lg`}>
               <div className="w-full h-full bg-[#050A1F] rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-100 drop-shadow-md" />
               </div>
            </div>
            <div>
               <h3 className="text-xl font-bold text-blue-50 tracking-tight">{title}</h3>
               <p className="text-blue-300 flex items-center mt-1 text-sm font-medium">{description}</p>
            </div>
         </div>

         <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
            <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase font-black tracking-widest text-blue-400/80">REWARD YIELD</span>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <Coins className="w-5 h-5 text-yellow-400 drop-shadow-sm" />
                  <span className="text-2xl font-black text-white font-mono leading-none">+{reward}</span>
               </div>
            </div>

            <button 
               onClick={startTask}
               disabled={status !== 'idle'}
               className={`w-36 h-14 flex items-center justify-center rounded-xl font-black tracking-wide transition-all shadow-lg ${
                 status === 'completed' 
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                  : status === 'running'
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-200'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-[#020617] active:scale-[0.98]'
               }`}
            >
               {status === 'idle' && (
                 <span className="flex items-center gap-2">EXECUTE <ArrowRight className="w-4 h-4 text-[#020617]" /></span>
               )}
               {status === 'running' && (
                 <div className="flex items-center gap-2">
                   <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                   <span className="font-mono">{Math.round(progress)}%</span>
                 </div>
               )}
               {status === 'completed' && (
                 <span className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-5 h-5" /> DONE</span>
               )}
            </button>
         </div>
      </div>

      {status === 'running' && (
        <div className="absolute bottom-0 left-0 h-1.5 bg-[#050A1F] w-full">
           <div 
             className={`h-full bg-gradient-to-r ${color} transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(56,189,248,0.8)]`}
             style={{ width: `${progress}%` }}
           />
        </div>
      )}
    </div>
  );
};
