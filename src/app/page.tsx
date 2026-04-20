'use client';

import { useEffect, useState } from 'react';
import { getAllProgress, type DayProgress } from '@/lib/storage';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8];

function DayCard({ day, progress }: { day: number; progress?: DayProgress }) {
  const fillDone = progress?.fill?.completed;
  const defDone = progress?.definition?.completed;
  const allDone = fillDone && defDone;

  return (
    <a
      href={`/day/${day}`}
      className={`block rounded-2xl border-2 p-5 transition-all active:scale-95 ${
        allDone
          ? 'border-amber-300 bg-amber-50'
          : 'border-gray-200 bg-white hover:border-sky-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold">Day {day}</span>
        {allDone && <span className="text-2xl">⭐</span>}
      </div>

      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${fillDone ? 'bg-sky-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {fillDone ? '✓' : '·'}
          </span>
          <span className={fillDone ? 'text-gray-700' : 'text-gray-400'}>
            穴うめ {progress?.fill ? `${progress.fill.correct}/${progress.fill.total}` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${defDone ? 'bg-emerald-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {defDone ? '✓' : '·'}
          </span>
          <span className={defDone ? 'text-gray-700' : 'text-gray-400'}>
            英英 {progress?.definition ? `${progress.definition.correct}/${progress.definition.total}` : '—'}
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  const [progress, setProgress] = useState<Record<number, DayProgress>>({});

  useEffect(() => {
    setProgress(getAllProgress());
  }, []);

  const completedDays = DAYS.filter(d => progress[d]?.fill?.completed && progress[d]?.definition?.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero */}
      <header className="text-center pt-12 pb-8 px-4">
        <div className="text-5xl mb-3">🐰</div>
        <h1 className="text-2xl font-bold mb-1">英検3級ドリル</h1>
        <p className="text-sm text-gray-500">8日間で単語力アップ！</p>
        {completedDays > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold">
            ⭐ {completedDays}/8 日クリア
          </div>
        )}
      </header>

      {/* Day Grid */}
      <main className="max-w-lg mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {DAYS.map(day => (
            <DayCard key={day} day={day} progress={progress[day]} />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-10">英検3級 大問1対策 | 2022–2025 頻出語彙</p>
      </main>
    </div>
  );
}
