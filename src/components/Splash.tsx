'use client';

import { useState, useEffect, useMemo } from 'react';
import Rabbit from './Rabbit';
import { PixelStar } from './PixelIcons';

const PARTICLE_CHARS = ['★', '♪', '✦', '◆', '♦', '●', '■', '▲'];
const PARTICLE_COLORS = ['text-kpink', 'text-kpurple', 'text-kyellow', 'text-kpink', 'text-kpurple', 'text-white'];

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0=enter, 1=show, 2=exit

  // Generate stable random positions on mount
  const particles = useMemo(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${10 + Math.random() * 18}px`,
      animationDelay: `${Math.random() * 3}s`,
      char: PARTICLE_CHARS[i % PARTICLE_CHARS.length],
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    })),
  []);

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
        {particles.map((p, i) => (
          <div
            key={i}
            className={`absolute animate-pixel-sparkle font-pixel ${p.color}`}
            style={{
              left: p.left,
              top: p.top,
              fontSize: p.fontSize,
              animationDelay: p.animationDelay,
            }}
          >
            {p.char}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className={phase >= 1 ? 'animate-splash' : 'opacity-0'}>
        <div className="flex justify-center mb-4">
          <Rabbit mood="cheer" dancing size={100} />
        </div>
        <h1 className="text-3xl md:text-5xl text-white text-center mb-2 tracking-wide font-pixel">
          <span className="text-kpink animate-pixel-blink">さらちゃん</span>の
        </h1>
        <h2 className="text-4xl md:text-6xl text-white text-center mb-3 tracking-wider font-pixel">
          英検ステージ
        </h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          <PixelStar size={12} color="#A855F7" />
          <p className="text-sm md:text-base text-kpurple font-bold tracking-widest font-pixel">EIKEN GRADE 3 DRILL</p>
          <PixelStar size={12} color="#A855F7" />
        </div>
        <div className="flex justify-center">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-300 font-pixel">らんちゃんと一緒にがんばろう！</p>
            <p className="text-[10px] md:text-xs text-gray-300 mt-4 font-pixel animate-pixel-blink">タップしてスタート</p>
          </div>
        </div>
      </div>
    </div>
  );
}
