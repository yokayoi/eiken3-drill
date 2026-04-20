'use client';

interface RabbitProps {
  variant?: 'normal' | 'black';
  mood?: 'happy' | 'cheer' | 'angry';
  dancing?: boolean;
  size?: number;
}

export default function Rabbit({ variant = 'normal', mood = 'happy', dancing = false, size = 80 }: RabbitProps) {
  const isBlack = variant === 'black';

  // Colors
  const bodyColor = isBlack ? '#2d2d2d' : '#e8d5b7';
  const earInner = isBlack ? '#8b0000' : '#f5b0c5';
  const cheekColor = isBlack ? 'transparent' : '#f5a0b5';
  const eyeColor = isBlack ? '#ff0000' : '#3d2b1f';
  const mouthColor = isBlack ? '#ff4444' : '#c47a7a';

  const animClass = dancing ? 'animate-dance' : isBlack ? 'animate-shake' : '';

  // Expressions
  const eyeShape = mood === 'angry'
    ? { left: 'M28,36 L32,33 L36,36', right: 'M44,36 L48,33 L52,36' }  // angry V eyes
    : mood === 'cheer'
    ? { left: 'M30,34 Q33,30 36,34', right: 'M44,34 Q47,30 50,34' }  // happy ^ eyes
    : null; // default dot eyes

  return (
    <div className={`inline-block ${animClass}`} style={{ width: size, height: size * 1.4 }}>
      <svg viewBox="0 0 80 112" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size * 1.4}>
        {/* Left ear */}
        <ellipse cx="28" cy="18" rx="8" ry="22" fill={bodyColor} />
        <ellipse cx="28" cy="18" rx="5" ry="18" fill={earInner} opacity="0.6" />
        {/* Right ear */}
        <ellipse cx="52" cy="18" rx="8" ry="22" fill={bodyColor} />
        <ellipse cx="52" cy="18" rx="5" ry="18" fill={earInner} opacity="0.6" />

        {/* Body */}
        <ellipse cx="40" cy="72" rx="22" ry="26" fill={bodyColor} />
        {/* Belly */}
        <ellipse cx="40" cy="76" rx="14" ry="16" fill={isBlack ? '#3d3d3d' : '#f5ead6'} />

        {/* Head */}
        <circle cx="40" cy="46" r="20" fill={bodyColor} />

        {/* Eyes */}
        {eyeShape ? (
          <>
            <path d={eyeShape.left} stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" className={isBlack ? 'animate-sparkle' : ''} />
            <path d={eyeShape.right} stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" className={isBlack ? 'animate-sparkle' : ''} />
          </>
        ) : (
          <>
            <circle cx="33" cy="44" r="3" fill={eyeColor} />
            <circle cx="47" cy="44" r="3" fill={eyeColor} />
            {/* Eye highlights */}
            {!isBlack && (
              <>
                <circle cx="34" cy="43" r="1" fill="white" />
                <circle cx="48" cy="43" r="1" fill="white" />
              </>
            )}
          </>
        )}

        {/* Cheeks */}
        <circle cx="25" cy="50" r="4" fill={cheekColor} opacity="0.5" />
        <circle cx="55" cy="50" r="4" fill={cheekColor} opacity="0.5" />

        {/* Nose */}
        <ellipse cx="40" cy="49" rx="2" ry="1.5" fill={isBlack ? '#ff4444' : '#e8a0a0'} />

        {/* Mouth */}
        {mood === 'angry' ? (
          <path d="M35,54 Q40,51 45,54" stroke={mouthColor} strokeWidth="1.5" fill="none" />
        ) : mood === 'cheer' ? (
          <path d="M34,52 Q40,58 46,52" stroke={mouthColor} strokeWidth="1.5" fill="none" />
        ) : (
          <path d="M36,53 Q40,56 44,53" stroke={mouthColor} strokeWidth="1.5" fill="none" />
        )}

        {/* Arms */}
        {dancing ? (
          <>
            <path d="M18,66 Q10,56 8,48" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M62,66 Q70,56 72,48" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M18,68 Q14,76 12,80" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M62,68 Q66,76 68,80" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Feet */}
        <ellipse cx="30" cy="96" rx="8" ry="4" fill={bodyColor} />
        <ellipse cx="50" cy="96" rx="8" ry="4" fill={bodyColor} />

        {/* Black rabbit: angry marks */}
        {isBlack && (
          <>
            <text x="58" y="32" fontSize="10" fill="#ff4444">💢</text>
          </>
        )}
      </svg>
    </div>
  );
}
