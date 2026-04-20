'use client';

import { useEffect, useState } from 'react';
import Rabbit from './Rabbit';
import type { Reward } from '@/lib/rewards';

interface Props {
  reward: Reward;
  onClose: () => void;
}

const rarityLabel = { normal: 'NORMAL', rare: 'RARE ⭐', super: 'SUPER RARE ⭐⭐⭐' };
const rarityColor = { normal: 'text-gray-300', rare: 'text-kpurple', super: 'text-kyellow' };

export default function RewardModal({ reward, onClose }: Props) {
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    const pieces = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#FF2D78', '#A855F7', '#FDE047', '#34D399', '#60A5FA'][i % 5],
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 8,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="confetti"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}

      <div className="animate-slide-up bg-kcard rounded-3xl p-8 mx-4 max-w-sm w-full text-center border-2 border-kpink shadow-[0_0_30px_rgba(255,45,120,0.3)]" onClick={e => e.stopPropagation()}>
        <p className={`text-xs font-black tracking-[0.3em] mb-4 ${rarityColor[reward.rarity]}`}>
          {rarityLabel[reward.rarity]}
        </p>

        <div className="text-7xl mb-4">{reward.emoji}</div>

        <h2 className="text-2xl font-black text-white mb-1">{reward.name}</h2>
        <p className="text-sm text-gray-400 mb-6">{reward.description}</p>

        <div className="flex justify-center mb-6">
          <Rabbit mood="cheer" dancing size={70} />
        </div>

        <p className="text-sm text-kpink font-bold mb-6">🎵 ダンスタイム！おめでとう！ 🎵</p>

        <button
          onClick={onClose}
          className="btn-neon w-full py-3 rounded-xl bg-gradient-to-r from-kpink to-kpurple text-white font-bold text-lg"
        >
          やったー！
        </button>
      </div>
    </div>
  );
}
