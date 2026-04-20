'use client';

export default function RabbitMessage({ message, mood = 'happy' }: { message: string; mood?: 'happy' | 'sad' | 'cheer' }) {
  const face = mood === 'sad' ? '(；・ω・)' : mood === 'cheer' ? '(＾▽＾)/' : '(・ω・)';
  return (
    <div className="flex items-start gap-3 animate-bounce-in">
      <div className="flex-shrink-0 text-3xl select-none" aria-hidden="true">🐰</div>
      <div className="relative bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-xs">
        <span className="font-bold text-amber-700">{face}</span>{' '}
        <span className="text-amber-900">{message}</span>
      </div>
    </div>
  );
}
