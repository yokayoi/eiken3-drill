'use client';

import { useEffect, useState } from 'react';
import Rabbit from './Rabbit';
import type { Reward } from '@/lib/rewards';
import { PixelStar, PixelNote } from './PixelIcons';

interface Props {
  reward: Reward;
  onClose: () => void;
}

const rarityText = { normal: 'NORMAL', rare: 'RARE', super: 'SUPER RARE' };
const rarityStars = { normal: 0, rare: 1, super: 3 };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      {/* Pixel confetti */}
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
          }}
        />
      ))}

      <div className="animate-slide-up pixel-dialog rounded-none p-8 mx-4 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <div className={`text-xs font-black tracking-[0.3em] mb-4 font-pixel ${rarityColor[reward.rarity]} flex items-center justify-center gap-1`}>
          {Array.from({ length: rarityStars[reward.rarity] }).map((_, i) => (
            <PixelStar key={i} size={8} color={reward.rarity === 'super' ? '#FDE047' : '#A855F7'} />
          ))}
          <span className="mx-1">{rarityText[reward.rarity]}</span>
          {Array.from({ length: rarityStars[reward.rarity] }).map((_, i) => (
            <PixelStar key={`r${i}`} size={8} color={reward.rarity === 'super' ? '#FDE047' : '#A855F7'} />
          ))}
        </div>

        <div className="text-7xl mb-4">{reward.emoji}</div>

        <h2 className="text-2xl font-black text-white mb-1 font-pixel">{reward.name}</h2>
        <p className="text-sm text-gray-300 mb-6">{reward.description}</p>

        <div className="flex justify-center mb-6">
          <Rabbit mood="cheer" dancing size={70} />
        </div>

        <p className="text-sm text-kpink font-bold mb-6 font-pixel inline-flex items-center justify-center gap-2 w-full">
          <PixelNote size={10} /> ダンスタイム！おめでとう！ <PixelNote size={10} />
        </p>

        <button
          onClick={onClose}
          className="btn-pixel w-full py-3 rounded-none bg-kpink text-white font-bold text-lg font-pixel"
        >
          やったー！
        </button>
      </div>
    </div>
  );
}
