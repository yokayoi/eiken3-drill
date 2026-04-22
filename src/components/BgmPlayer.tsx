'use client';

import { useEffect, useRef, useState } from 'react';

const VOLUME = 0.3;
const STORAGE_KEY = 'bgm_muted';

// 8-bit pixel art music note (7x8)
const NOTE_ON = [
  [0,0,0,0,1,1,0],
  [0,0,0,1,1,1,0],
  [0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0],
  [0,1,1,1,0,0,0],
  [0,1,1,0,0,0,0],
];

// Same note with X overlay
const NOTE_OFF = [
  [1,0,0,0,1,1,0],
  [0,1,0,1,1,1,0],
  [0,0,1,1,0,0,0],
  [0,0,0,1,0,0,0],
  [0,0,1,1,0,0,0],
  [0,1,0,1,0,0,0],
  [1,1,1,1,0,0,0],
  [0,1,1,0,0,0,1],
];

function PixelNote({ muted }: { muted: boolean }) {
  const grid = muted ? NOTE_OFF : NOTE_ON;
  const noteColor = muted ? '#6b7280' : '#FDE047';
  const xColor = '#EF4444';
  const onGrid = NOTE_ON;
  return (
    <svg viewBox="0 0 7 8" width={18} height={20} style={{ shapeRendering: 'crispEdges' }}>
      {grid.map((row, y) =>
        row.map((c, x) => {
          if (!c) return null;
          // X pixels are ones that exist in OFF but not in ON
          const isX = muted && !onGrid[y][x];
          return (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={isX ? xColor : noteColor} />
          );
        })
      )}
    </svg>
  );
}

export default function BgmPlayer({ src, className }: { src: string; className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isMuted = stored === '1';
    setMuted(isMuted);
    setReady(true);

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.muted = isMuted;
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        const resume = () => {
          if (!audio.muted) {
            audio.play().catch(() => {});
          }
          document.removeEventListener('pointerdown', resume);
        };
        document.addEventListener('pointerdown', resume, { once: true });
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  function toggle() {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    if (audioRef.current) {
      audioRef.current.muted = next;
      if (!next) {
        audioRef.current.play().catch(() => {});
      }
    }
  }

  if (!ready) return null;

  return (
    <button
      onClick={toggle}
      className={className ?? "fixed top-4 right-4 z-40 w-10 h-10 flex items-center justify-center btn-pixel bg-kcard rounded-none"}
      aria-label={muted ? 'BGM ON' : 'BGM OFF'}
    >
      <PixelNote muted={muted} />
    </button>
  );
}
