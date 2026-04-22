'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getWorldProgress, isWorldCleared, getMissedQuestions, type DayProgress } from '@/lib/storage';
import { getCollectedRewards, getAllRewards, getCollectionCount } from '@/lib/rewards';
import Splash from '@/components/Splash';
import Rabbit from '@/components/Rabbit';
import BgmPlayer from '@/components/BgmPlayer';
import { PixelStar, PixelCrown, PixelGlobe, PixelLock, PixelBolt, PixelNote, PixelCheck } from '@/components/PixelIcons';

const STAGES = [1, 2, 3, 4, 5, 6, 7, 8];
const EXAM_DATE_ISO = '2026-05-31'; // 英検3級 一次試験

function getDifficulty(stage: number): 1 | 2 | 3 {
  if (stage <= 2) return 1;
  if (stage <= 5) return 2;
  return 3;
}

const DIFF_LABEL: Record<1 | 2 | 3, string> = {
  1: 'やさしい',
  2: 'ふつう',
  3: 'むずかしい',
};
const DIFF_COLOR: Record<1 | 2 | 3, string> = {
  1: '#34D399',
  2: '#FDE047',
  3: '#EF4444',
};

function getDaysUntilExam(): number {
  const nowJst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  nowJst.setHours(0, 0, 0, 0);
  const exam = new Date(`${EXAM_DATE_ISO}T00:00:00+09:00`);
  return Math.ceil((exam.getTime() - nowJst.getTime()) / (1000 * 60 * 60 * 24));
}

function StageCard({ stage, world, progress, locked }: { stage: number; world: number; progress?: DayProgress; locked: boolean }) {
  const fillDone = progress?.fill?.completed;
  const defDone = progress?.definition?.completed;
  const readDone = progress?.reading?.completed;
  const allDone = fillDone && defDone && readDone;
  const fillPerfect = progress?.fill?.perfect;
  const defPerfect = progress?.definition?.perfect;
  const readPerfect = progress?.reading?.perfect;
  const allPerfect = fillPerfect && defPerfect && readPerfect;

  const diff = getDifficulty(stage);
  const diffStars = '★'.repeat(diff) + '☆'.repeat(3 - diff);

  if (locked) {
    return (
      <div className="block rounded-none p-4 pixel-card opacity-60 cursor-not-allowed relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-black text-gray-500 font-pixel">
            ステージ {stage}
          </span>
          <PixelLock size={18} />
        </div>
        <div className="text-[11px] font-pixel mb-2" style={{ color: DIFF_COLOR[diff] }}>
          {diffStars} <span className="text-gray-500 ml-1">{DIFF_LABEL[diff]}</span>
        </div>
        <p className="text-[10px] text-gray-400 font-pixel leading-relaxed">
          まえのステージを<br />クリアしてね
        </p>
      </div>
    );
  }

  return (
    <a
      href={`/day/${stage}?world=${world}`}
      className={`block rounded-none p-4 transition-all active:translate-x-[2px] active:translate-y-[2px] ${
        allDone ? 'pixel-card-complete' : 'pixel-card'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-black text-white font-pixel">
          <span className="text-kpink">ステージ</span> {stage}
        </span>
        {allDone && (
          <span className="inline-flex">
            {allPerfect ? <PixelCrown size={18} /> : <PixelStar size={16} />}
          </span>
        )}
      </div>
      <div className="text-[11px] font-pixel mb-2" style={{ color: DIFF_COLOR[diff] }}>
        {diffStars} <span className="text-gray-400 ml-1">{DIFF_LABEL[diff]}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-4 h-4 rounded-none flex items-center justify-center border ${readDone ? 'border-transparent' : 'bg-transparent border-gray-400'}`}
            style={readDone ? { background: 'var(--color-kgreen)', borderColor: 'var(--color-kgreen)' } : {}}
          >
            {readDone ? <PixelCheck size={8} color="#ffffff" /> : <span className="text-[10px] text-gray-300">·</span>}
          </span>
          <span className={`font-pixel ${readDone ? 'text-gray-200' : 'text-gray-300'}`}>
            読解 {progress?.reading ? `${progress.reading.correct}/${progress.reading.total}` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-none flex items-center justify-center border ${fillDone ? 'bg-kpink border-kpink' : 'bg-transparent border-gray-400'}`}>
            {fillDone ? <PixelCheck size={8} color="#ffffff" /> : <span className="text-[10px] text-gray-300">·</span>}
          </span>
          <span className={`font-pixel ${fillDone ? 'text-gray-200' : 'text-gray-300'}`}>
            穴うめ {progress?.fill ? `${progress.fill.correct}/${progress.fill.total}` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-none flex items-center justify-center border ${defDone ? 'bg-kpurple border-kpurple' : 'bg-transparent border-gray-400'}`}>
            {defDone ? <PixelCheck size={8} color="#ffffff" /> : <span className="text-[10px] text-gray-300">·</span>}
          </span>
          <span className={`font-pixel ${defDone ? 'text-gray-200' : 'text-gray-300'}`}>
            英英 {progress?.definition ? `${progress.definition.correct}/${progress.definition.total}` : '—'}
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  const [world, setWorld] = useState(1);
  const [progress, setProgress] = useState<Record<number, DayProgress>>({});
  const [showSplash, setShowSplash] = useState(true);
  const [collection, setCollection] = useState({ collected: 0, total: 0 });
  const [world1Cleared, setWorld1Cleared] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    setProgress(getWorldProgress(world));
    setCollection(getCollectionCount());
    setWorld1Cleared(isWorldCleared(1));
    setMissedCount(getMissedQuestions().filter(m => m.type !== 'reading').length);
    if (sessionStorage.getItem('splash_seen')) {
      setShowSplash(false);
    }
  }, [world]);

  useEffect(() => {
    setDaysLeft(getDaysUntilExam());
    const id = setInterval(() => setDaysLeft(getDaysUntilExam()), 60000);
    return () => clearInterval(id);
  }, []);

  const unlockedMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    for (const s of STAGES) {
      if (s === 1) {
        map[s] = true;
      } else {
        const prev = progress[s - 1];
        map[s] = !!(prev?.fill?.completed && prev?.definition?.completed && prev?.reading?.completed);
      }
    }
    return map;
  }, [progress]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splash_seen', '1');
  }, []);

  const completedStages = STAGES.filter(s => progress[s]?.fill?.completed && progress[s]?.definition?.completed && progress[s]?.reading?.completed).length;
  const collectedRewards = getCollectedRewards();
  const allRewards = getAllRewards();

  // Accuracy calculation
  let totalCorrect = 0;
  let totalQuestions = 0;
  for (const s of STAGES) {
    const p = progress[s];
    if (p?.fill) { totalCorrect += p.fill.correct; totalQuestions += p.fill.total; }
    if (p?.definition) { totalCorrect += p.definition.correct; totalQuestions += p.definition.total; }
    if (p?.reading) { totalCorrect += p.reading.correct; totalQuestions += p.reading.total; }
  }
  const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-kdark">
      {showSplash && <Splash onComplete={handleSplashComplete} />}

      {/* Hero */}
      <header className="text-center pt-10 pb-6 px-4">
        <div className="flex justify-center mb-3">
          <Rabbit mood="cheer" dancing size={90} />
        </div>
        <h1 className="text-2xl mb-1 font-pixel">
          <span className="text-kpink animate-pixel-blink">さらちゃん</span>
          <span className="text-white">の英検ステージ</span>
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <PixelStar size={10} color="#A855F7" />
          <p className="text-xs text-kpurple font-bold tracking-[0.2em] font-pixel">EIKEN GRADE 3 DRILL</p>
          <PixelStar size={10} color="#A855F7" />
        </div>

        {completedStages > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <div
              className="inline-flex items-center gap-2 bg-kcard text-kpink px-4 py-2 rounded-none text-sm font-bold font-pixel"
              style={{ border: '3px solid var(--color-kpink)', boxShadow: '3px 3px 0 #000' }}
            >
              <PixelStar size={12} color="#FF2D78" />
              {completedStages}/8 ステージクリア
            </div>
            {totalQuestions > 0 && (
              <div
                className="inline-flex items-center gap-1 bg-kcard text-kyellow px-3 py-2 rounded-none text-sm font-bold font-pixel"
                style={{ border: '3px solid var(--color-kyellow)', boxShadow: '3px 3px 0 #000' }}
              >
                正解率 {accuracyPercent}%
              </div>
            )}
          </div>
        )}

        {/* 試験カウントダウン */}
        {daysLeft !== null && (
          <div className="mt-5 flex flex-col items-center gap-1">
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-none bg-kcard font-pixel"
              style={{ border: '3px solid var(--color-kyellow)', boxShadow: '4px 4px 0 #000' }}
            >
              <span className="text-[11px] text-gray-300 tracking-wider">英検3級 一次試験まで</span>
              {daysLeft > 0 ? (
                <span className="text-2xl md:text-3xl font-black text-kyellow animate-pixel-blink">
                  あと {daysLeft} 日
                </span>
              ) : daysLeft === 0 ? (
                <span className="text-2xl md:text-3xl font-black text-kpink animate-pixel-blink">本日！</span>
              ) : (
                <span className="text-sm font-bold text-gray-400">試験日をすぎました</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-pixel">試験日: 2026年5月31日 (日)</p>
          </div>
        )}
      </header>

      <main className="max-w-lg md:max-w-3xl mx-auto px-4 pb-12">
        {/* World Tabs */}
        <div className="flex gap-2 mb-6 items-stretch">
          <BgmPlayer src="/bgm/powerup.mp3" className="w-10 shrink-0 flex items-center justify-center btn-pixel bg-kcard rounded-none" />
          <button
            onClick={() => setWorld(1)}
            className={`btn-pixel flex-1 py-3 rounded-none font-black text-sm font-pixel transition-all inline-flex items-center justify-center gap-2 ${
              world === 1 ? 'bg-kpink text-white' : 'bg-kcard text-gray-400'
            }`}
          >
            <PixelGlobe size={14} color={world === 1 ? '#ffffff' : '#9ca3af'} />
            ワールド1
          </button>
          <button
            onClick={() => { if (world1Cleared) setWorld(2); }}
            className={`btn-pixel flex-1 py-3 rounded-none font-black text-sm font-pixel transition-all inline-flex items-center justify-center gap-2 ${
              world === 2 ? 'bg-kpurple text-white' : 'bg-kcard text-gray-400'
            } ${!world1Cleared ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!world1Cleared}
          >
            {world1Cleared
              ? <PixelGlobe size={14} color={world === 2 ? '#ffffff' : '#9ca3af'} />
              : <PixelLock size={14} />}
            ワールド2
          </button>
        </div>

        {!world1Cleared && world === 1 && (
          <p className="text-xs text-gray-400 text-center mb-4 font-pixel">
            ワールド1の全ステージをクリアするとワールド2が開くよ！
          </p>
        )}

        {/* Stage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {STAGES.map(stage => (
            <StageCard
              key={stage}
              stage={stage}
              world={world}
              progress={progress[stage]}
              locked={!unlockedMap[stage]}
            />
          ))}
        </div>

        {/* Special Stage */}
        {missedCount >= 5 && (
          <a
            href="/day/special"
            className="block rounded-none p-5 mb-8 transition-all active:translate-x-[2px] active:translate-y-[2px]"
            style={{ border: '3px solid #EF4444', boxShadow: '4px 4px 0px #000', background: 'var(--color-kcard)' }}
          >
            <div className="flex items-center gap-3">
              <PixelBolt size={24} />
              <div>
                <span className="text-lg font-black text-red-400 font-pixel">特別ステージ</span>
                <p className="text-xs text-gray-300 font-pixel mt-1">
                  よく間違える問題 {missedCount}問にチャレンジ！
                </p>
              </div>
            </div>
          </a>
        )}

        {/* Collection */}
        <div className="pixel-card rounded-none p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-sm text-kpink tracking-wider font-pixel inline-flex items-center gap-2">
              <PixelNote size={12} /> グッズコレクション
            </h2>
            <span className="text-xs text-gray-300 font-pixel">{collection.collected}/{collection.total}</span>
          </div>

          {collectedRewards.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-4">
              クイズで60点以上とるとグッズがもらえるよ！
            </p>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {allRewards.map(r => {
                const owned = collectedRewards.some(cr => cr.id === r.id);
                return (
                  <div key={r.id} className={`text-center ${owned ? '' : 'opacity-20 grayscale'}`}>
                    <div className="text-2xl mb-1">{r.emoji}</div>
                    <p className="text-[10px] text-gray-300 leading-tight">{r.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-8 font-pixel">英検3級 読解(大問3) + 大問1 語彙 | Reading重点ドリル</p>
      </main>
    </div>
  );
}
