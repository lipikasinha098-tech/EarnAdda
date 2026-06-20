import React, { useEffect, useRef } from 'react';

export const RainingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const drops: { x: number, y: number, speed: number, length: number, opacity: number }[] = [];
    for (let i = 0; i < 200; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 15 + 10,
        length: Math.random() * 25 + 15,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      ctx.lineWidth = 1.5;
      drops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        gradient.addColorStop(0, `rgba(56, 189, 248, 0)`);
        gradient.addColorStop(1, `rgba(96, 165, 250, ${drop.opacity})`);
        
        ctx.strokeStyle = gradient;
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 mix-blend-screen" />;
};
