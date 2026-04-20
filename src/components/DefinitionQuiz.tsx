'use client';

import { useState, useEffect } from 'react';
import SpeechButton from './SpeechButton';
import RabbitMessage from './RabbitMessage';
import { saveDayResult } from '@/lib/storage';
import { getEncourageMessage, getWrongMessage, getScoreComment } from '@/lib/rabbit';

interface Question {
  id: number;
  word: string;
  definition: string;
  choices: string[];
  answer: number;
  hint: string;
}

export default function DefinitionQuiz({ day, questions }: { day: number; questions: Question[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rabbitMsg, setRabbitMsg] = useState('');
  const [rabbitMood, setRabbitMood] = useState<'happy' | 'sad' | 'cheer'>('happy');

  const q = questions[current];
  const isCorrect = selected === q?.answer;

  useEffect(() => {
    setRabbitMsg('');
    setSelected(null);
  }, [current]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.answer) {
      setScore(s => s + 1);
      setRabbitMsg(getEncourageMessage());
      setRabbitMood('cheer');
    } else {
      setRabbitMsg(getWrongMessage());
      setRabbitMood('sad');
    }
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      const finalScore = score;
      saveDayResult(day, 'definition', finalScore, questions.length);
      setFinished(true);
      setRabbitMsg(getScoreComment(finalScore, questions.length));
      setRabbitMood('cheer');
    } else {
      setCurrent(c => c + 1);
    }
  }

  function handleRetry() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setRabbitMsg('');
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">結果発表</h2>
        <div className="text-5xl font-bold text-emerald-600">{score}<span className="text-2xl text-gray-400">/{questions.length}</span></div>
        <RabbitMessage message={rabbitMsg} mood={rabbitMood} />
        <div className="flex gap-3 mt-4">
          <button onClick={handleRetry} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-lg active:bg-emerald-600 transition-colors">もう一回</button>
          <a href="/" className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold text-lg active:bg-gray-300 transition-colors">ホームへ</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Q{current + 1} / {questions.length}</span>
        <span>正解 {score}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Definition */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <p className="text-xs font-bold text-emerald-600 mb-2 tracking-wider">DEFINITION</p>
        <p className="text-lg leading-relaxed italic text-gray-700">&ldquo;{q.definition}&rdquo;</p>
        <p className="mt-3 text-sm text-gray-400">この意味の英単語はどれ？</p>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-3">
        {q.choices.map((c, i) => {
          let cls = 'w-full text-left px-5 py-4 rounded-xl border-2 text-base font-medium transition-all flex items-center justify-between ';
          if (selected === null) {
            cls += 'border-gray-200 bg-white active:border-emerald-400 active:bg-emerald-50';
          } else if (i === q.answer) {
            cls += 'border-green-400 bg-green-50 text-green-800';
          } else if (i === selected) {
            cls += 'border-red-300 bg-red-50 text-red-700';
          } else {
            cls += 'border-gray-100 bg-gray-50 text-gray-400';
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
              <span>
                <span className="inline-block w-7 text-center font-bold mr-2 opacity-60">{['A', 'B', 'C', 'D'][i]}</span>
                {c}
              </span>
              {selected !== null && i === q.answer && <SpeechButton text={c} />}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <RabbitMessage message={rabbitMsg} mood={rabbitMood} />
          {!isCorrect && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
              <p className="font-bold mb-1">💡 ヒント</p>
              <p>{q.hint}</p>
            </div>
          )}
          <button onClick={handleNext} className="self-end px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-lg active:bg-emerald-600 transition-colors">
            {current + 1 >= questions.length ? '結果を見る' : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
