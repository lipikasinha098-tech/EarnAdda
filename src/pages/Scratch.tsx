import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addReward } from '../lib/firebase';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { Coins } from 'lucide-react';
import { audioSynth } from '../lib/audio';

const getWeightedReward = () => {
    const r = Math.random() * 100;
    if (r < 1) return 9;
    if (r < 16) return Math.random() < 0.5 ? 7 : 8;
    if (r < 56) return Math.floor(Math.random() * 3) + 4;
    return Math.floor(Math.random() * 4);
};

export const Scratch = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState(() => Array(3).fill(null).map((_, i) => ({ id: i, amount: getWeightedReward(), scratched: false })));

  const handleScratchComplete = async (id: number, amount: number) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, scratched: true } : c));
    if (amount > 0 && user) {
      audioSynth.playWin();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 }, colors: ['#38bdf8', '#60a5fa', '#facc15'] });
      await addReward(user.uid, 'scratch', amount, `Scratched card and won ${amount} points`);
    } else if (amount === 0 && user) {
      audioSynth.playLose();
      await addReward(user.uid, 'scratch', 0, `Scratched card but won nothing`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 relative z-10">
      <div className="text-center mb-12">
         <h2 className="text-4xl font-extrabold text-blue-50 mb-2 flex items-center justify-center gap-3 drop-shadow-md">
            <span className="text-cyan-400 font-bold text-5xl leading-none">&#10022;</span> 
            Decrypt Cards
         </h2>
         <p className="text-blue-300">Uncover the encrypted zones to reveal your data points!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map(card => (
          <ScratchCardUI 
            key={card.id} 
            amount={card.amount} 
            isScratched={card.scratched} 
            onComplete={() => handleScratchComplete(card.id, card.amount)} 
          />
        ))}
      </div>
    </div>
  );
};

const ScratchCardUI: React.FC<{ amount: number, isScratched: boolean, onComplete: () => void }> = ({ amount, isScratched, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isScratched) {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       return;
    }

    // High tech noise cover
    ctx.fillStyle = '#0f172a'; // slate-900 base
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add matrix-like noise/pattern
    ctx.fillStyle = '#1e3a8a';
    for (let i = 0; i < 500; i++) {
       ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
    }
    
    ctx.font = "bold 24px 'Inter', sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText("DECRYPT", canvas.width/2, canvas.height/2);

  }, [isScratched]);

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (Math.random() > 0.8) {
       audioSynth.playScratch();
    }

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const totalPixels = pixels.length / 4;
    const currentPercent = (transparent / totalPixels) * 100;
    
    if (currentPercent > 50 && !isScratched) {
      onComplete();
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(30,58,138,0.5)] border-2 border-blue-900 select-none group touch-none bg-[#050B20]">
      {/* Underlying Reward Content */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A102E] to-[#050A1F] flex flex-col items-center justify-center p-6 text-center">
        {amount > 0 ? (
          <motion.div initial={{ scale: 0.8 }} animate={isScratched ? { scale: 1 } : { scale: 0.8 }} className="flex flex-col items-center gap-2">
             <Coins className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse" />
             <span className="text-5xl font-black text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">+{amount}</span>
             <span className="text-cyan-400 font-bold uppercase tracking-widest mt-2">Yield Secured</span>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-blue-500/50">
             <span className="text-2xl font-black bg-blue-950/50 px-6 py-3 rounded-xl border border-blue-900/50">0 REWARD</span>
             <span className="font-medium tracking-widest uppercase">Decryption Failed</span>
          </div>
        )}
      </div>

      {/* Foil Cover Array */}
      <canvas
        ref={canvasRef}
        width={300}
        height={225}
        className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-300 ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseMove={scratch}
        onTouchStart={() => setIsDrawing(true)}
        onTouchEnd={() => setIsDrawing(false)}
        onTouchMove={scratch}
      />
    </div>
  );
};
