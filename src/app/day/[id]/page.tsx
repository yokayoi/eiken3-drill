'use client';

import { use, useState } from 'react';
import FillQuiz from '@/components/FillQuiz';
import DefinitionQuiz from '@/components/DefinitionQuiz';
import RabbitMessage from '@/components/RabbitMessage';
import fillData from '@/data/fill-in-the-blank.json';
import defData from '@/data/definition-quiz.json';
import { getStartMessage } from '@/lib/rabbit';

type Tab = 'fill' | 'definition';

export default function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const day = parseInt(id, 10);
  const [tab, setTab] = useState<Tab>('fill');
  const [startMsg] = useState(() => getStartMessage());

  const fillQuestions = fillData.filter((q: { day: number }) => q.day === day);
  const defQuestions = defData.filter((q: { day: number }) => q.day === day);

  if (day < 1 || day > 8 || isNaN(day)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-kdark">
        <p className="text-xl font-bold text-white">ページが見つかりません</p>
        <a href="/" className="mt-4 text-kpink underline">ホームへ戻る</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kdark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-kdark/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-kpink font-bold text-sm">← もどる</a>
          <h1 className="text-base font-black">
            <span className="text-kpink">Day</span> {day}
          </h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Rabbit greeting */}
        <div className="mb-5">
          <RabbitMessage message={`Day ${day}！${startMsg}`} mood="cheer" dancing />
        </div>

        {/* Tab */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('fill')}
            className={`btn-neon flex-1 py-3 rounded-xl font-black text-sm transition-all ${
              tab === 'fill'
                ? 'bg-gradient-to-r from-kpink to-kpurple text-white shadow-[0_0_15px_rgba(255,45,120,0.3)]'
                : 'bg-kcard text-gray-500 border border-gray-700'
            }`}
          >
            🎤 穴うめ問題
          </button>
          <button
            onClick={() => setTab('definition')}
            className={`btn-neon flex-1 py-3 rounded-xl font-black text-sm transition-all ${
              tab === 'definition'
                ? 'bg-gradient-to-r from-kpurple to-kpink text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-kcard text-gray-500 border border-gray-700'
            }`}
          >
            💃 英英クイズ
          </button>
        </div>

        {/* Quiz */}
        {tab === 'fill' ? (
          <FillQuiz day={day} questions={fillQuestions} />
        ) : (
          <DefinitionQuiz day={day} questions={defQuestions} />
        )}
      </div>
    </div>
  );
}
