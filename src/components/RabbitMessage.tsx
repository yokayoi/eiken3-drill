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
  const nameColor = isBlack ? 'text-red-400' : 'text-kpink';
  const textColor = isBlack ? 'text-red-200' : 'text-gray-200';
  const name = isBlack ? 'ブラックらんちゃん' : 'らんちゃん';

  return (
    <div className="flex items-start gap-3 animate-bounce-in">
      <div className="flex-shrink-0">
        <Rabbit variant={variant} mood={mood} dancing={dancing} size={50} />
      </div>
      <div
        className={`relative pixel-dialog rounded-none px-4 py-3 text-sm leading-relaxed max-w-xs`}
        style={isBlack ? { borderColor: '#7f1d1d', outlineColor: '#450a0a' } : undefined}
      >
        <span className={`font-black text-xs font-pixel ${nameColor}`}>{name}</span>
        <p className={`mt-1 ${textColor}`}>{message}</p>
      </div>
    </div>
  );
}
