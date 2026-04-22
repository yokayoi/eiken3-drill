'use client';

import { use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FillQuiz from '@/components/FillQuiz';
import DefinitionQuiz from '@/components/DefinitionQuiz';
import ReadingQuiz from '@/components/ReadingQuiz';
import RabbitMessage from '@/components/RabbitMessage';
import fillData from '@/data/fill-in-the-blank.json';
import defData from '@/data/definition-quiz.json';
import readingData from '@/data/reading-comprehension.json';
import { getStartMessage } from '@/lib/rabbit';
import BgmPlayer from '@/components/BgmPlayer';
import { PixelNote, PixelDiamond } from '@/components/PixelIcons';

type Tab = 'reading' | 'fill' | 'definition';

export default function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const day = parseInt(id, 10);
  const world = parseInt(searchParams.get('world') ?? '1', 10) as 1 | 2;
  const [tab, setTab] = useState<Tab>('reading');
  const [startMsg] = useState(() => getStartMessage());

  const fillQuestions = fillData.filter((q: { day: number }) => q.day === day);
  const defQuestions = defData.filter((q: { day: number }) => q.day === day);
  const readingPassages = readingData.filter((p: { day: number }) => p.day === day);

  if (day < 1 || day > 8 || isNaN(day)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-kdark">
        <p className="text-xl font-bold text-white font-pixel">ページが見つかりません</p>
        <a href="/" className="mt-4 text-kpink underline font-pixel">ホームへ戻る</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kdark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-kdark" style={{ borderBottom: '3px solid #fff' }}>
        <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BgmPlayer src="/bgm/chopsticks.mp3" className="w-8 h-8 flex items-center justify-center btn-pixel bg-kcard rounded-none" />
            <a href="/" className="text-kpink font-bold text-sm font-pixel">← もどる</a>
          </div>
          <h1 className="text-base font-black font-pixel">
            <span className="text-gray-400 text-xs mr-1">W{world}</span>
            <span className="text-kpink">ステージ</span> {day}
          </h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-6">
        {/* Rabbit greeting */}
        <div className="mb-5">
          <RabbitMessage message={`ステージ ${day}！${startMsg}`} mood="cheer" dancing />
        </div>

        {/* Tab */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab('reading')}
            className={`btn-pixel flex-1 min-w-[100px] py-3 rounded-none font-black text-sm font-pixel transition-all inline-flex items-center justify-center gap-2 ${
              tab === 'reading' ? 'text-white' : 'bg-kcard text-gray-400'
            }`}
            style={tab === 'reading' ? { background: 'var(--color-kgreen)' } : {}}
          >
            <PixelNote size={12} color={tab === 'reading' ? '#ffffff' : '#9ca3af'} />
            読解
          </button>
          <button
            onClick={() => setTab('fill')}
            className={`btn-pixel flex-1 min-w-[100px] py-3 rounded-none font-black text-sm font-pixel transition-all inline-flex items-center justify-center gap-2 ${
              tab === 'fill'
                ? 'bg-kpink text-white'
                : 'bg-kcard text-gray-400'
            }`}
          >
            <PixelNote size={12} color={tab === 'fill' ? '#ffffff' : '#9ca3af'} />
            穴うめ
          </button>
          <button
            onClick={() => setTab('definition')}
            className={`btn-pixel flex-1 min-w-[100px] py-3 rounded-none font-black text-sm font-pixel transition-all inline-flex items-center justify-center gap-2 ${
              tab === 'definition'
                ? 'bg-kpurple text-white'
                : 'bg-kcard text-gray-400'
            }`}
          >
            <PixelDiamond size={12} color={tab === 'definition' ? '#ffffff' : '#9ca3af'} />
            英英
          </button>
        </div>

        {/* Quiz */}
        {tab === 'reading' ? (
          <ReadingQuiz day={day} world={world} passages={readingPassages as Parameters<typeof ReadingQuiz>[0]['passages']} />
        ) : tab === 'fill' ? (
          <FillQuiz day={day} world={world} questions={fillQuestions} />
        ) : (
          <DefinitionQuiz day={day} world={world} questions={defQuestions} />
        )}
      </div>
    </div>
  );
}
