'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAllProgress, type DayProgress } from '@/lib/storage';
import { getCollectedRewards, getAllRewards, getCollectionCount } from '@/lib/rewards';
import Splash from '@/components/Splash';
import Rabbit from '@/components/Rabbit';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8];

function DayCard({ day, progress }: { day: number; progress?: DayProgress }) {
  const fillDone = progress?.fill?.completed;
  const defDone = progress?.definition?.completed;
  const allDone = fillDone && defDone;

  return (
    <a
      href={`/day/${day}`}
      className={`block rounded-2xl p-4 transition-all active:scale-95 ${
        allDone
          ? 'holo-card bg-kcard'
          : 'bg-kcard border border-gray-700 hover:border-kpink/50 hover:shadow-[0_0_15px_rgba(255,45,120,0.15)]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-black text-white">
          <span className="text-kpink">Day</span> {day}
        </span>
        {allDone && <span className="text-xl">⭐</span>}
      </div>

      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${fillDone ? 'bg-kpink text-white' : 'bg-gray-700 text-gray-500'}`}>
            {fillDone ? '✓' : '·'}
          </span>
          <span className={fillDone ? 'text-gray-300' : 'text-gray-600'}>
            穴うめ {progress?.fill ? `${progress.fill.correct}/${progress.fill.total}` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${defDone ? 'bg-kpurple text-white' : 'bg-gray-700 text-gray-500'}`}>
            {defDone ? '✓' : '·'}
          </span>
          <span className={defDone ? 'text-gray-300' : 'text-gray-600'}>
            英英 {progress?.definition ? `${progress.definition.correct}/${progress.definition.total}` : '—'}
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  const [progress, setProgress] = useState<Record<number, DayProgress>>({});
  const [showSplash, setShowSplash] = useState(true);
  const [collection, setCollection] = useState({ collected: 0, total: 0 });

  useEffect(() => {
    setProgress(getAllProgress());
    setCollection(getCollectionCount());
    // スプラッシュを一度見たらスキップ
    if (sessionStorage.getItem('splash_seen')) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splash_seen', '1');
  }, []);

  const completedDays = DAYS.filter(d => progress[d]?.fill?.completed && progress[d]?.definition?.completed).length;
  const collectedRewards = getCollectedRewards();
  const allRewards = getAllRewards();

  return (
    <div className="min-h-screen bg-kdark">
      {showSplash && <Splash onComplete={handleSplashComplete} />}

      {/* Hero */}
      <header className="text-center pt-10 pb-6 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-kpink/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex justify-center mb-3">
          <Rabbit mood="cheer" dancing size={90} />
        </div>
        <h1 className="text-2xl font-black mb-1">
          <span className="text-kpink animate-neon">さらちゃん</span>
          <span className="text-white">の英検ステージ</span>
        </h1>
        <p className="text-xs text-kpurple font-bold tracking-[0.2em]">✨ EIKEN GRADE 3 DRILL ✨</p>

        {completedDays > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-kcard border border-kpink/30 text-kpink px-4 py-2 rounded-full text-sm font-bold">
            ⭐ {completedDays}/8 日クリア
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 pb-12">
        {/* Day Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {DAYS.map(day => (
            <DayCard key={day} day={day} progress={progress[day]} />
          ))}
        </div>

        {/* Collection */}
        <div className="bg-kcard rounded-2xl border border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-sm text-kpink tracking-wider">🎁 K-POPグッズコレクション</h2>
            <span className="text-xs text-gray-500">{collection.collected}/{collection.total}</span>
          </div>

          {collectedRewards.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">
              クイズで60点以上とるとグッズがもらえるよ！
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {allRewards.map(r => {
                const owned = collectedRewards.some(cr => cr.id === r.id);
                return (
                  <div key={r.id} className={`text-center ${owned ? '' : 'opacity-20 grayscale'}`}>
                    <div className="text-2xl mb-1">{r.emoji}</div>
                    <p className="text-[10px] text-gray-400 leading-tight">{r.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-700 mt-8">英検3級 大問1対策 | 2022–2025 頻出語彙</p>
      </main>
    </div>
  );
}
