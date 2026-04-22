'use client';

import { useState, useEffect } from 'react';

interface RabbitProps {
  variant?: 'normal' | 'black';
  mood?: 'happy' | 'cheer' | 'angry';
  dancing?: boolean;
  superDance?: boolean;
  size?: number;
}

// Color palettes
const COLORS_NORMAL: Record<number, string> = {
  1: '#d4a574', // body tan
  3: '#f5a0b5', // ear pink
  4: '#1a1a1a', // eye black
  5: '#ffffff', // eye highlight
  6: '#a06040', // nose
  7: '#ffb6c1', // cheek
  8: '#f5ead6', // belly
  9: '#c47a7a', // mouth
};

const COLORS_BLACK: Record<number, string> = {
  1: '#2d2d2d', // body dark
  3: '#8b0000', // ear inner red
  4: '#ff0000', // eye red
  5: '#ff6666', // eye glow
  6: '#444444', // nose
  7: '#440000', // cheek dark red
  8: '#3d3d3d', // belly
  9: '#ff4444', // mouth
};

// Base sprite 16x24 (happy mood — normal open eyes)
const BASE: number[][] = [
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0], // 0: ear tips
  [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0], // 1: ears
  [0,0,0,1,3,3,1,0,0,1,3,3,1,0,0,0], // 2: pink inner
  [0,0,0,1,3,3,1,0,0,1,3,3,1,0,0,0], // 3
  [0,0,0,1,3,3,1,0,0,1,3,3,1,0,0,0], // 4
  [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0], // 5: ear base
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0], // 6: head top
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0], // 7: head
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0], // 8: head wide
  [0,0,1,4,4,4,1,1,1,1,4,4,4,1,0,0], // 9: eyes
  [0,0,1,4,4,5,1,1,1,1,4,4,5,1,0,0], // 10: eyes highlight
  [0,0,1,4,4,4,1,1,1,1,4,4,4,1,0,0], // 11: eyes bottom
  [0,0,1,1,1,1,1,6,6,1,1,1,1,1,0,0], // 12: nose
  [0,0,7,7,1,1,1,1,1,1,1,1,7,7,0,0], // 13: cheeks
  [0,0,1,1,1,1,1,9,9,1,1,1,1,1,0,0], // 14: mouth
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0], // 15: chin
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0], // 16: neck
  [0,0,0,1,1,8,8,8,8,8,8,1,1,0,0,0], // 17: body
  [0,0,1,1,8,8,8,8,8,8,8,8,1,1,0,0], // 18: body wide
  [0,0,1,1,8,8,8,8,8,8,8,8,1,1,0,0], // 19: body wide
  [0,0,0,1,1,8,8,8,8,8,8,1,1,0,0,0], // 20: body
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0], // 21: hips
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0], // 22: legs
  [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0], // 23: feet
];

function getSprite(mood: 'happy' | 'cheer' | 'angry'): number[][] {
  const s = BASE.map(r => [...r]);
  if (mood === 'cheer') {
    s[9]  = [0,0,1,1,4,1,1,1,1,1,1,4,1,1,0,0];
    s[10] = [0,0,1,4,1,4,1,1,1,4,1,4,1,1,0,0];
    s[11] = [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0];
  } else if (mood === 'angry') {
    s[9]  = [0,0,1,4,1,1,1,1,1,1,1,1,4,1,0,0];
    s[10] = [0,0,1,1,4,1,1,1,1,1,1,4,1,1,0,0];
    s[11] = [0,0,1,1,1,4,1,1,1,1,4,1,1,1,0,0];
    s[14] = [0,0,1,1,1,1,9,9,9,9,1,1,1,1,0,0];
  }
  return s;
}

// ===== Dance faces =====
type DanceFace = 'cheer' | 'wink' | 'excited';

function applyFace(s: number[][], face: DanceFace): void {
  switch (face) {
    case 'cheer': // ^^ happy squint
      s[9]  = [0,0,1,1,4,1,1,1,1,1,1,4,1,1,0,0];
      s[10] = [0,0,1,4,1,4,1,1,1,4,1,4,1,1,0,0];
      s[11] = [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0];
      break;
    case 'wink': // left ^ right open
      s[9]  = [0,0,1,1,4,1,1,1,1,1,4,4,4,1,0,0];
      s[10] = [0,0,1,4,1,4,1,1,1,1,4,4,5,1,0,0];
      s[11] = [0,0,1,1,1,1,1,1,1,1,4,4,4,1,0,0];
      break;
    case 'excited': // ^^ eyes + wide smile
      s[9]  = [0,0,1,1,4,1,1,1,1,1,1,4,1,1,0,0];
      s[10] = [0,0,1,4,1,4,1,1,1,4,1,4,1,1,0,0];
      s[11] = [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0];
      s[14] = [0,0,1,1,1,9,9,9,9,9,9,1,1,1,0,0];
      break;
  }
}

// ===== Spin stars (8-bit pixel art) =====
const SPIN_STARS = [
  { x: -60, y: -50, dx: -12, dy: -10, color: '#FF2D78', s: 10 },
  { x:  65, y: -40, dx:  14, dy:  -8, color: '#A855F7', s: 8  },
  { x: -55, y:  40, dx: -10, dy:  12, color: '#FDE047', s: 10 },
  { x:  58, y:  48, dx:  12, dy:  10, color: '#FF2D78', s: 8  },
  { x: -70, y:   5, dx: -14, dy:   0, color: '#A855F7', s: 12 },
  { x:  72, y:  -8, dx:  14, dy:  -4, color: '#FDE047', s: 10 },
  { x:   6, y: -58, dx:   0, dy: -14, color: '#FF2D78', s: 8  },
  { x: -10, y:  55, dx:  -4, dy:  14, color: '#A855F7', s: 12 },
];

// 5x5 pixel star pattern (1=filled, 0=empty)
const STAR_PIXELS = [
  [0,0,1,0,0],
  [0,1,1,1,0],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

function PixelStar({ size, color }: { size: number; color: string }) {
  const px = size / 5;
  return (
    <svg width={size} height={size} viewBox="0 0 5 5" style={{ shapeRendering: 'crispEdges', display: 'block' }}>
      {STAR_PIXELS.map((row, y) =>
        row.map((c, x) =>
          c ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null
        )
      )}
    </svg>
  );
}

// ===== Dance animation =====
type DancePose = 'base' | 'rightArm' | 'leftArm' | 'bothArms' | 'rightKick' | 'leftKick' | 'stepRight' | 'stepLeft' | 'crouch' | 'spin';

type DanceFrame = {
  pose: DancePose;
  face: DanceFace;
  transform: string;
};

const DANCE_SEQUENCE: DanceFrame[] = [
  { pose: 'rightArm',  face: 'wink',    transform: 'translateY(-4px) rotate(4deg)' },
  { pose: 'leftArm',   face: 'wink',    transform: 'translateY(-4px) rotate(-4deg)' },
  { pose: 'stepRight',  face: 'cheer',   transform: 'translateY(0px) rotate(3deg)' },
  { pose: 'stepLeft',   face: 'cheer',   transform: 'translateY(0px) rotate(-3deg)' },
  { pose: 'crouch',    face: 'excited', transform: 'translateY(4px) rotate(0deg)' },
  { pose: 'bothArms',  face: 'excited', transform: 'translateY(-12px) rotate(0deg)' },
  { pose: 'base',      face: 'cheer',   transform: 'translateY(2px) rotate(0deg)' },
  { pose: 'rightKick', face: 'cheer',   transform: 'translateY(0px) rotate(5deg)' },
  { pose: 'leftKick',  face: 'cheer',   transform: 'translateY(0px) rotate(-5deg)' },
  { pose: 'bothArms',  face: 'excited', transform: 'translateY(-6px) rotate(0deg)' },
  { pose: 'spin',      face: 'cheer',   transform: 'translateY(-2px) scaleX(-1)' },
  { pose: 'base',      face: 'excited', transform: 'translateY(0px) rotate(0deg)' },
];

function applyDancePose(sprite: number[][], pose: DancePose): number[][] {
  if (pose === 'base') return sprite;

  const s = sprite.map(r => [...r]);

  switch (pose) {
    case 'rightArm':
      s[15][13] = 1;
      s[14][14] = 1;
      s[13][15] = 1;
      break;
    case 'leftArm':
      s[15][2] = 1;
      s[14][1] = 1;
      s[13][0] = 1;
      break;
    case 'bothArms':
      s[15][13] = 1; s[15][2] = 1;
      s[14][14] = 1; s[14][1] = 1;
      s[13][15] = 1; s[13][0] = 1;
      s[22] = [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0];
      s[23] = [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0];
      break;
    case 'rightKick':
      s[22] = [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0];
      s[23] = [0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0];
      break;
    case 'leftKick':
      s[22] = [0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0];
      s[23] = [0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0];
      break;
    case 'stepRight':
      // Left leg only, right leg lifted
      s[22] = [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0];
      s[23] = [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0];
      break;
    case 'stepLeft':
      // Right leg only, left leg lifted
      s[22] = [0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0];
      s[23] = [0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0];
      break;
    case 'crouch':
      // Wider bent legs
      s[22] = [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0];
      s[23] = [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0];
      break;
    case 'spin':
      for (let y = 0; y < s.length; y++) {
        s[y].reverse();
      }
      break;
  }
  return s;
}

// Super dance: faster, more spins, rainbow stars
const SUPER_DANCE_SEQUENCE: DanceFrame[] = [
  { pose: 'bothArms',  face: 'excited', transform: 'translateY(-12px) rotate(0deg)' },
  { pose: 'spin',      face: 'excited', transform: 'translateY(-6px) scaleX(-1)' },
  { pose: 'rightKick', face: 'cheer',   transform: 'translateY(-4px) rotate(8deg)' },
  { pose: 'spin',      face: 'wink',    transform: 'translateY(-2px) scaleX(-1)' },
  { pose: 'leftKick',  face: 'cheer',   transform: 'translateY(-4px) rotate(-8deg)' },
  { pose: 'bothArms',  face: 'excited', transform: 'translateY(-16px) rotate(0deg)' },
  { pose: 'crouch',    face: 'wink',    transform: 'translateY(4px) rotate(0deg)' },
  { pose: 'spin',      face: 'excited', transform: 'translateY(-2px) scaleX(-1)' },
  { pose: 'stepRight',  face: 'cheer',   transform: 'translateY(0px) rotate(6deg)' },
  { pose: 'stepLeft',   face: 'cheer',   transform: 'translateY(0px) rotate(-6deg)' },
  { pose: 'spin',      face: 'excited', transform: 'translateY(-8px) scaleX(-1)' },
  { pose: 'bothArms',  face: 'excited', transform: 'translateY(-10px) rotate(0deg)' },
];

const RAINBOW_COLORS = ['#FF2D78', '#FF6B35', '#FDE047', '#34D399', '#60A5FA', '#A855F7'];

const SUPER_STARS = [
  { x: -72, y: -60, dx: -16, dy: -12, s: 14 },
  { x:  78, y: -50, dx:  18, dy: -10, s: 12 },
  { x: -68, y:  50, dx: -14, dy:  16, s: 14 },
  { x:  70, y:  58, dx:  16, dy:  12, s: 12 },
  { x: -82, y:   8, dx: -18, dy:   0, s: 16 },
  { x:  85, y: -12, dx:  18, dy:  -6, s: 14 },
  { x:   8, y: -70, dx:   0, dy: -18, s: 12 },
  { x: -14, y:  68, dx:  -6, dy:  18, s: 16 },
  { x: -50, y: -70, dx: -10, dy: -16, s: 10 },
  { x:  55, y:  70, dx:  12, dy:  16, s: 10 },
  { x:  45, y: -65, dx:  10, dy: -14, s: 10 },
  { x: -48, y:  65, dx: -10, dy:  14, s: 10 },
];

export default function Rabbit({ variant = 'normal', mood = 'happy', dancing = false, superDance = false, size = 80 }: RabbitProps) {
  const colors = variant === 'black' ? COLORS_BLACK : COLORS_NORMAL;
  const W = 16, H = 24;
  const isSuper = superDance && dancing;
  const sequence = isSuper ? SUPER_DANCE_SEQUENCE : DANCE_SEQUENCE;
  const starConfig = isSuper ? SUPER_STARS : SPIN_STARS;

  const [danceFrame, setDanceFrame] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [showStars, setShowStars] = useState(false);
  const [rainbowIdx, setRainbowIdx] = useState(0);

  useEffect(() => {
    if (!dancing) {
      setDanceFrame(0);
      return;
    }
    const speed = isSuper ? 180 : 250;
    const id = setInterval(() => {
      setDanceFrame(f => (f + 1) % sequence.length);
      if (isSuper) setRainbowIdx(i => (i + 1) % RAINBOW_COLORS.length);
    }, speed);
    return () => clearInterval(id);
  }, [dancing, isSuper, sequence.length]);

  // Detect spin → trigger stars
  useEffect(() => {
    if (dancing && sequence[danceFrame]?.pose === 'spin') {
      setSpinCount(c => c + 1);
      setShowStars(true);
    }
  }, [dancing, danceFrame, sequence]);

  // Auto-hide stars
  useEffect(() => {
    if (!showStars) return;
    const t = setTimeout(() => setShowStars(false), 800);
    return () => clearTimeout(t);
  }, [spinCount]);

  // Build sprite: base → face → pose
  const frame = dancing ? sequence[danceFrame] : null;
  let sprite: number[][];
  if (frame) {
    sprite = BASE.map(r => [...r]);
    applyFace(sprite, frame.face);
    sprite = applyDancePose(sprite, frame.pose);
  } else {
    sprite = getSprite(mood);
  }

  const animClass = !dancing && variant === 'black' ? 'animate-shake' : '';

  return (
    <div className="relative inline-block" style={{ width: size, height: size * (H / W), overflow: 'visible' }}>
      {/* 8-bit stars burst on spin */}
      {showStars && (
        <div key={spinCount} className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
          {starConfig.map((star, i) => {
            const color = isSuper
              ? RAINBOW_COLORS[(rainbowIdx + i) % RAINBOW_COLORS.length]
              : ('color' in star ? (star as typeof SPIN_STARS[number]).color : RAINBOW_COLORS[i % RAINBOW_COLORS.length]);
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '40%',
                  marginLeft: star.x,
                  marginTop: star.y,
                  animation: `star-pop 0.7s ease-out ${i * 0.04}s both`,
                  '--star-dx': `${star.dx}px`,
                  '--star-dy': `${star.dy}px`,
                } as React.CSSProperties}
              >
                <PixelStar size={star.s} color={color} />
              </div>
            );
          })}
        </div>
      )}

      <div
        className={animClass}
        style={{
          width: size,
          height: size * (H / W),
          transform: frame?.transform,
          transition: dancing ? 'transform 0.15s ease-out' : undefined,
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={size}
          height={size * (H / W)}
          xmlns="http://www.w3.org/2000/svg"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {sprite.map((row, y) =>
            row.map((c, x) =>
              c > 0 ? (
                <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[c]} />
              ) : null
            )
          )}
          {variant === 'black' && (
            <>
              <rect x={13} y={4} width={1} height={1} fill="#ff4444" />
              <rect x={15} y={4} width={1} height={1} fill="#ff4444" />
              <rect x={14} y={5} width={1} height={1} fill="#ff4444" />
              <rect x={13} y={6} width={1} height={1} fill="#ff4444" />
              <rect x={15} y={6} width={1} height={1} fill="#ff4444" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
