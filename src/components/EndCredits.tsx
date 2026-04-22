'use client';

import { useState, useEffect } from 'react';
import Rabbit from './Rabbit';
import { PixelStar, PixelCrown, PixelNote, PixelDiamond, PixelParty } from './PixelIcons';

const CONFETTI_COLORS = ['#FF2D78', '#A855F7', '#FDE047', '#34D399', '#60A5FA', '#FF6B35'];

function PixelConfetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 3}s`,
    duration: `${2.5 + Math.random() * 2}s`,
  }));

  return (
    <>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}

type CreditLine =
  | { type: 'spacer' }
  | { type: 'title' | 'subtitle' | 'heading' | 'text'; content: React.ReactNode };

const CREDITS: CreditLine[] = [
  { type: 'title', content: <><PixelParty size={28} /> 完全クリア！ <PixelParty size={28} /></> },
  { type: 'subtitle', content: 'さらちゃん、全ステージパーフェクト！' },
  { type: 'spacer' },
  { type: 'heading', content: <><PixelStar size={14} color="#A855F7" /> CONGRATULATIONS <PixelStar size={14} color="#A855F7" /></> },
  { type: 'text', content: 'すべてのワールド、すべてのステージを' },
  { type: 'text', content: '全問正解でクリアしました！' },
  { type: 'spacer' },
  { type: 'heading', content: <><PixelNote size={12} color="#A855F7" /> スタッフ <PixelNote size={12} color="#A855F7" /></> },
  { type: 'text', content: 'プロデューサー: さらちゃん' },
  { type: 'text', content: 'メインキャラ: らんちゃん' },
  { type: 'text', content: 'ブラック担当: ブラックらんちゃん' },
  { type: 'spacer' },
  { type: 'heading', content: <><PixelDiamond size={12} /> ステージ <PixelDiamond size={12} /></> },
  { type: 'text', content: 'ワールド1: ステージ 1〜8' },
  { type: 'text', content: 'ワールド2: ステージ 1〜8' },
  { type: 'text', content: '特別ステージ: 苦手克服' },
  { type: 'spacer' },
  { type: 'heading', content: <><PixelStar size={14} color="#A855F7" /> SPECIAL THANKS <PixelStar size={14} color="#A855F7" /></> },
  { type: 'text', content: 'がんばったさらちゃんに' },
  { type: 'text', content: '最大の拍手を！' },
  { type: 'spacer' },
  { type: 'title', content: <><PixelCrown size={24} /> THE END <PixelCrown size={24} /></> },
  { type: 'spacer' },
  { type: 'subtitle', content: 'さらちゃんは最強アイドル！' },
];

export default function EndCredits({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false);
  const [scrollDone, setScrollDone] = useState(false);

  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setScrollDone(true), 18000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
      onClick={scrollDone ? onClose : undefined}
    >
      <PixelConfetti />

      {/* Scrolling credits */}
      <div
        className="absolute w-full text-center"
        style={{
          animation: show ? 'credits-scroll 18s linear forwards' : 'none',
        }}
      >
        {CREDITS.map((line, i) => {
          if (line.type === 'spacer') return <div key={i} className="h-16" />;
          const cls = {
            title: 'text-3xl font-black text-kyellow font-pixel mb-4 flex items-center justify-center gap-3',
            subtitle: 'text-xl font-bold text-kpink font-pixel mb-2',
            heading: 'text-lg font-black text-kpurple font-pixel mb-3 tracking-[0.2em] flex items-center justify-center gap-2',
            text: 'text-base text-gray-200 font-pixel mb-1',
          }[line.type];
          return <div key={i} className={cls}>{line.content}</div>;
        })}
      </div>

      {/* Rabbit super dance at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <Rabbit mood="cheer" dancing superDance size={120} />
      </div>

      {scrollDone && (
        <button
          onClick={onClose}
          className="fixed bottom-4 right-4 btn-pixel px-4 py-2 bg-kcard text-gray-200 text-sm font-pixel rounded-none animate-fade-in"
        >
          とじる
        </button>
      )}
    </div>
  );
}
