'use client';

// 8-bit pixel lightbulb (5x7)
const BULB = [
  [0,1,1,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

function PixelBulb({ active }: { active: boolean }) {
  const color = active ? '#FDE047' : '#4a4a6a';
  return (
    <svg viewBox="0 0 5 7" width={14} height={20} style={{ shapeRendering: 'crispEdges' }}>
      {BULB.map((row, y) =>
        row.map((c, x) =>
          c ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null
        )
      )}
    </svg>
  );
}

interface HintButtonProps {
  hintsLeft: number;
  onUseHint: () => void;
  disabled?: boolean;
}

export default function HintButton({ hintsLeft, onUseHint, disabled }: HintButtonProps) {
  const canUse = hintsLeft > 0 && !disabled;
  return (
    <button
      onClick={canUse ? onUseHint : undefined}
      disabled={!canUse}
      className={`btn-pixel flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold font-pixel transition-all ${
        canUse
          ? 'bg-kcard text-kyellow'
          : 'bg-kcard text-gray-500 opacity-50 cursor-not-allowed'
      }`}
    >
      <PixelBulb active={canUse} />
      <span>×{hintsLeft}</span>
    </button>
  );
}
