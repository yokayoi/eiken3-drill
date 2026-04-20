'use client';

import { useState, useEffect, useCallback } from 'react';
import SpeechButton from './SpeechButton';
import RabbitMessage from './RabbitMessage';
import RewardModal from './RewardModal';
import { saveDayResult } from '@/lib/storage';
import { getEncourageMessage, getWrongMessage, getScoreComment, getBlackMessage, getBlackFollowUp, getDanceTimeMessage } from '@/lib/rabbit';
import { determineReward, type Reward } from '@/lib/rewards';

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
  const [rabbitMood, setRabbitMood] = useState<'happy' | 'cheer' | 'angry'>('happy');
  const [rabbitVariant, setRabbitVariant] = useState<'normal' | 'black'>('normal');
  const [rabbitDancing, setRabbitDancing] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState('');
  const [reward, setReward] = useState<Reward | null>(null);
  const [showReward, setShowReward] = useState(false);

  const q = questions[current];
  const isCorrect = selected === q?.answer;

  useEffect(() => {
    setRabbitMsg('');
    setSelected(null);
    setRabbitVariant('normal');
    setRabbitDancing(false);
    setShowFollowUp(false);
  }, [current]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.answer) {
      setScore(s => s + 1);
      setRabbitMsg(getEncourageMessage());
      setRabbitMood('cheer');
      setRabbitDancing(true);
    } else {
      setRabbitMsg(getWrongMessage());
      setRabbitMood('happy');
      setRabbitDancing(false);
    }
  }

  const handleFinish = useCallback((finalScore: number) => {
    saveDayResult(day, 'definition', finalScore, questions.length);
    setFinished(true);
    const rate = finalScore / questions.length;

    if (rate < 0.6) {
      setRabbitVariant('black');
      setRabbitMood('angry');
      setRabbitMsg(getBlackMessage());
      setRabbitDancing(false);
      setTimeout(() => {
        setShowFollowUp(true);
        setFollowUpMsg(getBlackFollowUp());
      }, 2500);
    } else {
      setRabbitVariant('normal');
      setRabbitMood('cheer');
      setRabbitDancing(true);
      if (rate >= 0.8) {
        setRabbitMsg(getDanceTimeMessage());
      } else {
        setRabbitMsg(getScoreComment(finalScore, questions.length));
      }
      const r = determineReward(finalScore, questions.length);
      if (r) {
        setReward(r);
        setTimeout(() => setShowReward(true), 1200);
      }
    }
  }, [day, questions.length]);

  function handleNext() {
    if (current + 1 >= questions.length) {
      handleFinish(score);
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
    setRabbitVariant('normal');
    setRabbitDancing(false);
    setShowFollowUp(false);
    setReward(null);
    setShowReward(false);
  }

  if (finished) {
    const rate = score / questions.length;
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        {showReward && reward && <RewardModal reward={reward} onClose={() => setShowReward(false)} />}

        <div className="text-6xl">{rate >= 0.8 ? '🎉' : rate >= 0.6 ? '👏' : '😈'}</div>
        <h2 className="text-2xl font-black text-white">結果発表</h2>
        <div className="text-5xl font-black">
          <span className="text-kpurple">{score}</span>
          <span className="text-2xl text-gray-500">/{questions.length}</span>
        </div>

        <RabbitMessage message={rabbitMsg} variant={rabbitVariant} mood={rabbitMood} dancing={rabbitDancing} />

        {showFollowUp && (
          <RabbitMessage message={followUpMsg} variant="normal" mood="happy" />
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={handleRetry} className="btn-neon px-6 py-3 rounded-xl bg-gradient-to-r from-kpurple to-kpink text-white font-bold text-lg">
            もう一回
          </button>
          <a href="/" className="btn-neon px-6 py-3 rounded-xl bg-kcard border border-gray-600 text-gray-300 font-bold text-lg">
            ホームへ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Q{current + 1} / {questions.length}</span>
        <span className="text-kpurple font-bold">🎵 {score}点</span>
      </div>
      <div className="h-2 bg-kcard rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{
          width: `${((current + 1) / questions.length) * 100}%`,
          background: 'linear-gradient(90deg, #A855F7, #FF2D78)',
          boxShadow: '0 0 8px rgba(168,85,247,0.4)',
        }} />
      </div>

      {/* Definition */}
      <div className="bg-kcard rounded-2xl border border-gray-700 p-5 shadow-lg">
        <p className="text-xs font-black text-kpurple mb-2 tracking-[0.2em]">DEFINITION</p>
        <p className="text-lg leading-relaxed italic text-gray-200">&ldquo;{q.definition}&rdquo;</p>
        <p className="mt-3 text-sm text-gray-500">この意味の英単語はどれ？</p>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-3">
        {q.choices.map((c, i) => {
          let cls = 'btn-neon w-full text-left px-5 py-4 rounded-xl border-2 text-base font-medium transition-all flex items-center justify-between ';
          if (selected === null) {
            cls += 'border-gray-700 bg-kcard text-gray-200 active:border-kpurple active:shadow-[0_0_12px_rgba(168,85,247,0.3)]';
          } else if (i === q.answer) {
            cls += 'border-green-400 bg-green-900/30 text-green-300';
          } else if (i === selected) {
            cls += 'border-red-400 bg-red-900/30 text-red-300';
          } else {
            cls += 'border-gray-800 bg-kcard/50 text-gray-600';
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
          <RabbitMessage message={rabbitMsg} mood={rabbitMood} dancing={rabbitDancing} />
          {!isCorrect && (
            <div className="bg-kcard border border-kpurple/30 rounded-xl p-4 text-sm text-gray-300">
              <p className="font-bold mb-1 text-kyellow">💡 ヒント</p>
              <p>{q.hint}</p>
            </div>
          )}
          <button onClick={handleNext} className="self-end btn-neon px-6 py-3 rounded-xl bg-gradient-to-r from-kpurple to-kpink text-white font-bold text-lg">
            {current + 1 >= questions.length ? '結果を見る' : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
