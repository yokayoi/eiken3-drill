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
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <p className="text-xl font-bold">ページが見つかりません</p>
        <a href="/" className="mt-4 text-sky-500 underline">ホームへ戻る</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-sky-500 font-bold text-sm">← もどる</a>
          <h1 className="text-base font-bold">Day {day}</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Rabbit greeting */}
        <div className="mb-5">
          <RabbitMessage message={`Day ${day}！${startMsg}`} mood="cheer" />
        </div>

        {/* Tab */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('fill')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === 'fill'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            📝 穴うめ問題
          </button>
          <button
            onClick={() => setTab('definition')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === 'definition'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            📖 英英クイズ
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
