'use client';

const S = { shapeRendering: 'crispEdges' as const };

function Grid({ grid, color, w, h, size }: { grid: number[][]; color: string; w: number; h: number; size: number }) {
  const scale = size / Math.max(w, h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * scale} height={h * scale} style={S}>
      {grid.map((row, y) =>
        row.map((c, x) =>
          c ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null
        )
      )}
    </svg>
  );
}

function MultiGrid({ grid, colors, w, h, size }: { grid: number[][]; colors: Record<number, string>; w: number; h: number; size: number }) {
  const scale = size / Math.max(w, h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * scale} height={h * scale} style={S}>
      {grid.map((row, y) =>
        row.map((c, x) =>
          c && colors[c] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[c]} /> : null
        )
      )}
    </svg>
  );
}

// ===== Speaker (7x7) =====
const SPEAKER = [
  [0,0,0,1,0,0,0],
  [0,0,1,1,0,1,0],
  [1,1,1,1,0,0,1],
  [1,1,1,1,0,1,0],
  [1,1,1,1,0,0,1],
  [0,0,1,1,0,1,0],
  [0,0,0,1,0,0,0],
];

export function PixelSpeaker({ size = 16, color = '#FF2D78' }: { size?: number; color?: string }) {
  return <Grid grid={SPEAKER} color={color} w={7} h={7} size={size} />;
}

// ===== Star (5x5) =====
const STAR = [
  [0,0,1,0,0],
  [0,1,1,1,0],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

export function PixelStar({ size = 16, color = '#FDE047' }: { size?: number; color?: string }) {
  return <Grid grid={STAR} color={color} w={5} h={5} size={size} />;
}

// ===== Crown (7x5) =====
const CROWN = [
  [0,1,0,1,0,1,0],
  [0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0],
  [1,1,1,1,1,1,1],
];

export function PixelCrown({ size = 16, color = '#FDE047' }: { size?: number; color?: string }) {
  return <Grid grid={CROWN} color={color} w={7} h={5} size={size} />;
}

// ===== Trophy (7x8) =====
const TROPHY = [
  [1,1,1,1,1,1,1],
  [0,1,1,1,1,1,0],
  [1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0],
  [0,0,1,1,1,0,0],
];

export function PixelTrophy({ size = 20, color = '#FDE047' }: { size?: number; color?: string }) {
  return <Grid grid={TROPHY} color={color} w={7} h={8} size={size} />;
}

// ===== Globe / World (7x7) =====
const GLOBE = [
  [0,0,1,1,1,0,0],
  [0,1,0,1,0,1,0],
  [1,1,1,1,1,1,1],
  [1,0,1,0,1,0,1],
  [1,1,1,1,1,1,1],
  [0,1,0,1,0,1,0],
  [0,0,1,1,1,0,0],
];

export function PixelGlobe({ size = 16, color = '#60A5FA' }: { size?: number; color?: string }) {
  return <Grid grid={GLOBE} color={color} w={7} h={7} size={size} />;
}

// ===== Lock (5x7) =====
const LOCK = [
  [0,1,1,1,0],
  [1,0,0,0,1],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [1,1,0,1,1],
  [1,1,1,1,1],
  [1,1,1,1,1],
];

export function PixelLock({ size = 16, color = '#6b7280' }: { size?: number; color?: string }) {
  return <Grid grid={LOCK} color={color} w={5} h={7} size={size} />;
}

// ===== Lightning bolt (5x8) =====
const BOLT = [
  [0,0,0,1,1],
  [0,0,1,1,0],
  [0,1,1,0,0],
  [1,1,1,1,1],
  [0,0,1,1,0],
  [0,1,1,0,0],
  [1,1,0,0,0],
  [1,0,0,0,0],
];

export function PixelBolt({ size = 16, color = '#EF4444' }: { size?: number; color?: string }) {
  return <Grid grid={BOLT} color={color} w={5} h={8} size={size} />;
}

// ===== Party popper / confetti burst (7x7) =====
const PARTY = [
  [1,0,0,0,0,0,1],
  [0,0,0,1,0,1,0],
  [0,0,1,1,1,0,0],
  [0,1,1,1,0,0,0],
  [0,0,1,1,1,0,0],
  [0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0],
];

export function PixelParty({ size = 20 }: { size?: number }) {
  const colors: Record<number, string> = { 1: '#FDE047' };
  return <MultiGrid grid={PARTY} colors={colors} w={7} h={7} size={size} />;
}

// ===== Clap hands (7x7) =====
const CLAP = [
  [0,1,0,0,0,1,0],
  [1,1,0,0,0,1,1],
  [1,1,1,0,1,1,1],
  [0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
  [0,0,1,1,1,0,0],
];

export function PixelClap({ size = 20, color = '#FDE047' }: { size?: number; color?: string }) {
  return <Grid grid={CLAP} color={color} w={7} h={7} size={size} />;
}

// ===== Angry face (7x7) =====
const ANGRY = [
  [0,1,1,1,1,1,0],
  [1,0,0,0,0,0,1],
  [1,0,1,0,1,0,1],
  [1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1],
  [0,1,1,1,1,1,0],
];

export function PixelAngry({ size = 20 }: { size?: number }) {
  const g = ANGRY;
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={S}>
      {g.map((row, y) =>
        row.map((c, x) => {
          if (!c) return null;
          // Face outline and features
          let color = '#EF4444';
          if (y >= 1 && y <= 5 && x >= 1 && x <= 5) color = '#EF4444';
          if ((y === 2 && (x === 2 || x === 4))) color = '#ffffff'; // eyes
          if (y === 4 && x >= 2 && x <= 4) color = '#ffffff'; // frown
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />;
        })
      )}
    </svg>
  );
}

// ===== Musical note (5x7) =====
const NOTE = [
  [0,0,1,1,0],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [0,1,1,1,0],
  [0,1,1,0,0],
];

export function PixelNote({ size = 14, color = '#FF2D78' }: { size?: number; color?: string }) {
  return <Grid grid={NOTE} color={color} w={5} h={7} size={size} />;
}

// ===== Diamond (5x7) =====
const DIAMOND = [
  [0,0,1,0,0],
  [0,1,1,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

export function PixelDiamond({ size = 14, color = '#A855F7' }: { size?: number; color?: string }) {
  return <Grid grid={DIAMOND} color={color} w={5} h={7} size={size} />;
}

// ===== Checkmark (5x5) =====
const CHECK = [
  [0,0,0,0,1],
  [0,0,0,1,0],
  [1,0,1,0,0],
  [0,1,0,0,0],
  [0,0,0,0,0],
];

export function PixelCheck({ size = 10, color = '#34D399' }: { size?: number; color?: string }) {
  return <Grid grid={CHECK} color={color} w={5} h={5} size={size} />;
}
