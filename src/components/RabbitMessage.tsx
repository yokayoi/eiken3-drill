'use client';

import Rabbit from './Rabbit';

interface Props {
  message: string;
  variant?: 'normal' | 'black';
  mood?: 'happy' | 'cheer' | 'angry';
  dancing?: boolean;
}

export default function RabbitMessage({ message, variant = 'normal', mood = 'happy', dancing = false }: Props) {
  const isBlack = variant === 'black';
  const bgColor = isBlack ? 'bg-red-950 border-red-700' : 'bg-kcard border-kpink/30';
  const textColor = isBlack ? 'text-red-200' : 'text-gray-200';
  const nameColor = isBlack ? 'text-red-400' : 'text-kpink';
  const name = isBlack ? 'ブラックらんちゃん' : 'らんちゃん';

  return (
    <div className="flex items-start gap-3 animate-bounce-in">
      <div className="flex-shrink-0">
        <Rabbit variant={variant} mood={mood} dancing={dancing} size={50} />
      </div>
      <div className={`relative ${bgColor} border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-xs`}>
        <span className={`font-black text-xs ${nameColor}`}>{name}</span>
        <p className={`mt-1 ${textColor}`}>{message}</p>
      </div>
    </div>
  );
}
