'use client';

import { useState, useEffect } from 'react';
import Rabbit from './Rabbit';

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0=enter, 1=show, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => onComplete(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-kdark overflow-hidden cursor-pointer"
      onClick={() => { setPhase(2); setTimeout(onComplete, 400); }}
      style={{
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${12 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 1.5}s`,
            }}
          >
            {['✨', '💖', '🎵', '⭐', '🎤', '💃'][i % 6]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className={phase >= 1 ? 'animate-splash' : 'opacity-0'}>
        <div className="flex justify-center mb-4">
          <Rabbit mood="cheer" dancing size={100} />
        </div>
        <h1 className="text-3xl font-black text-white text-center mb-2 tracking-wide">
          <span className="text-kpink animate-neon">さらちゃん</span>の
        </h1>
        <h2 className="text-4xl font-black text-white text-center mb-3 tracking-wider">
          英検ステージ
        </h2>
        <p className="text-sm text-kpurple text-center font-bold tracking-widest mb-6">
          ✨ EIKEN GRADE 3 DRILL ✨
        </p>
        <div className="flex justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-400 animate-sparkle">らんちゃんと一緒にがんばろう！</p>
            <p className="text-[10px] text-gray-600 mt-4">タップしてスタート</p>
          </div>
        </div>
      </div>
    </div>
  );
}
