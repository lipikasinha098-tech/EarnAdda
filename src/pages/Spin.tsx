import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import confetti from 'canvas-confetti';
import { addReward } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Coins, Ticket } from 'lucide-react';
import { audioSynth } from '../lib/audio';

const PRIZES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const Spin = () => {
  const { user } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const controls = useAnimation();

  useEffect(() => {
    if (!isSpinning) return;

    let targetRot = rotation;
    let currentRot = rotation;
    let lastTickAngle = Math.floor(rotation / (360 / PRIZES.length));

    const checkTick = () => {
      if (!isSpinning) return;
    };
  }, [isSpinning]);

  const handleSpin = async () => {
    if (isSpinning || !user) return;
    
    setIsSpinning(true);
    setResult(null);
    let spinning = true;

    // Advanced Probability Logic
    // 9, 8, 7, 0 = 0.5% each (2% total)
    // 1-6 = 98%
    const r = Math.random() * 100;
    let prizeIndex = 0;
    if (r < 0.5) {
       prizeIndex = 9;
    } else if (r < 1.0) {
       prizeIndex = 8;
    } else if (r < 1.5) {
       prizeIndex = 7;
    } else if (r < 2.0) {
       prizeIndex = 0;
    } else {
       prizeIndex = Math.floor(Math.random() * 6) + 1; // 1, 2, 3, 4, 5, 6
    }

    const prize = PRIZES[prizeIndex];
    
    // Calculate rotation
    const sliceAngle = 360 / PRIZES.length;
    const targetBase = 360 - (prizeIndex * sliceAngle);
    const extraSpins = 360 * 5; 
    const finalRotation = rotation + extraSpins + targetBase - (rotation % 360);

    // Sound effect interval simulation for ticks
    let tickCount = 0;
    const totalTicks = 5 * PRIZES.length + prizeIndex;
    let currentDelay = 50;

    const tick = () => {
        if (!spinning) return;
        audioSynth.playTick();
        tickCount++;
        if (tickCount < totalTicks) {
           currentDelay = 50 + Math.pow((tickCount / totalTicks) * 10, 2);
           setTimeout(tick, currentDelay);
        }
    };
    
    tick();

    await controls.start({
      rotate: finalRotation,
      transition: { duration: 4, type: 'tween', ease: "circOut" }
    });

    spinning = false;
    setRotation(finalRotation);
    setResult(prize);
    
    if (prize > 0) {
      audioSynth.playWin();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#60a5fa', '#facc15']
      });
      await addReward(user.uid, 'spin', prize, `Spun the wheel and won ${prize} points`);
    } else {
      audioSynth.playLose();
      await addReward(user.uid, 'spin', 0, `Spun the wheel but won nothing`);
    }

    setIsSpinning(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] relative z-10">
      
      <div className="text-center mb-12">
         <h2 className="text-4xl font-extrabold text-blue-50 mb-2 flex items-center justify-center gap-3 drop-shadow-md">
            <Ticket className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            Fortunes Wheel
         </h2>
         <p className="text-blue-300">Spin the high-tech wheel daily to earn huge points. Chances of big wins are live!</p>
      </div>

      <div className="relative mb-12">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 pointer-events-none drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
           <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 w-full h-full">
              <path d="M12 2L2 22h20L12 2z" />
           </svg>
        </div>

        {/* Wheel container */}
        <div className="relative w-80 h-80 rounded-full border-8 border-blue-900/80 shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden bg-[#050B20]">
          <motion.div 
            animate={controls}
            initial={{ rotate: 0 }}
            className="w-full h-full relative"
          >
            {/* Array mapped visually using SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 -rotate-90">
              {PRIZES.map((prize, i) => {
                const angle = 360 / PRIZES.length;
                const offset = i * angle;
                return (
                  <g key={i} transform={`rotate(${offset} 50 50)`}>
                    <path
                      d={`M50 50 L100 50 A50 50 0 0 1 ${50 + 50 * Math.cos(angle * Math.PI / 180)} ${50 + 50 * Math.sin(angle * Math.PI / 180)} Z`}
                      fill={i % 2 === 0 ? '#1e3a8a' : '#172554'}
                      stroke="#0f172a"
                      strokeWidth="0.5"
                    />
                    <text 
                      x="80" 
                      y="50" 
                      transform={`rotate(${angle/2} 80 50)`} 
                      fill={prize >= 7 ? '#facc15' : '#e0e7ff'} 
                      fontSize="6" 
                      fontWeight="900" 
                      textAnchor="middle" 
                      alignmentBaseline="middle"
                    >
                      {prize}
                    </text>
                  </g>
                )
              })}
            </svg>
          </motion.div>
          {/* Wheel Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0B1536] rounded-full border-4 border-blue-900 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
             <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSpin}
        disabled={isSpinning}
        className="px-14 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xl rounded-2xl disabled:opacity-50 disabled:scale-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.4)] uppercase tracking-widest border border-blue-400/30"
      >
        {isSpinning ? 'Initiating...' : 'SPIN THE CORE'}
      </button>

      {result !== null && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          {result > 0 ? (
            <div className="bg-blue-900/30 backdrop-blur-md border border-cyan-500/50 text-cyan-50 px-8 py-5 rounded-2xl flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
               <span className="text-xl font-bold">Reward Acquired!</span>
               <span className="flex items-center gap-3 text-3xl">
                  <Coins className="text-yellow-400 w-8 h-8 drop-shadow-md" /> <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">+{result}</span> POINTS
               </span>
            </div>
          ) : (
             <div className="bg-[#0A102E]/80 text-blue-300 px-8 py-4 rounded-2xl border border-blue-800 backdrop-blur-sm">
               <span className="text-xl font-bold uppercase tracking-wider">Zero Yield. Try again later.</span>
            </div>
          )}
        </motion.div>
      )}

    </div>
  );
};
