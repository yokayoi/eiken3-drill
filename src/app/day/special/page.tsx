'use client';

import { useState, useEffect, useCallback } from 'react';
import SpeechButton from '@/components/SpeechButton';
import RabbitMessage from '@/components/RabbitMessage';
import HintButton from '@/components/HintButton';
import { getMissedQuestions, removeMissedQuestion, addMissedQuestion, type MissedQuestion } from '@/lib/storage';
import { speak } from '@/lib/speech';
import { getEncourageMessage, getWrongMessage, getDanceTimeMessage } from '@/lib/rabbit';
import fillData from '@/data/fill-in-the-blank.json';
import defData from '@/data/definition-quiz.json';
import BgmPlayer from '@/components/BgmPlayer';
import { PixelBolt, PixelParty, PixelClap, PixelStar } from '@/components/PixelIcons';

interface FillQuestion {
  id: number;
  day: number;
  sentence: string;
  choices: string[];
  answer: number;
  explanation: string;
  word: string;
  translation: string;
}

interface DefQuestion {
  id: number;
  day: number;
  word: string;
  definition: string;
  choices: string[];
  answer: number;
  hint: string;
  translation: string;
}

type SpecialQuestion = {
  type: 'fill';
  data: FillQuestion;
  missedDay: number;
} | {
  type: 'definition';
  data: DefQuestion;
  missedDay: number;
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSpecialQuestions(missed: MissedQuestion[]): SpecialQuestion[] {
  // reading タイプはパッセージ＋複数設問なので特別ステージのUIには乗せず、除外する
  // （読解は各Day内の再チャレンジで繰り返し練習する設計）
  const filtered = missed.filter(m => m.type === 'fill' || m.type === 'definition');
  const sorted = [...filtered].sort((a, b) => b.count - a.count).slice(0, 10);
  const result: SpecialQuestion[] = [];

  for (const m of sorted) {
    if (m.type === 'fill') {
      const q = (fillData as FillQuestion[]).find(q => q.id === m.questionId);
      if (q) result.push({ type: 'fill', data: q, missedDay: m.day });
    } else if (m.type === 'definition') {
      const q = (defData as DefQuestion[]).find(q => q.id === m.questionId);
      if (q) result.push({ type: 'definition', data: q, missedDay: m.day });
    }
  }

  return shuffleArray(result);
}

export default function SpecialStagePage() {
  const [questions, setQuestions] = useState<SpecialQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rabbitMsg, setRabbitMsg] = useState('');
  const [rabbitMood, setRabbitMood] = useState<'happy' | 'cheer' | 'angry'>('happy');
  const [rabbitDancing, setRabbitDancing] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false);

  // Wrong answer re-presentation
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [retryQuestions, setRetryQuestions] = useState<SpecialQuestion[]>([]);
  const [isRetryRound, setIsRetryRound] = useState(false);
  const [firstRoundScore, setFirstRoundScore] = useState(0);

  useEffect(() => {
    const missed = getMissedQuestions();
    setQuestions(buildSpecialQuestions(missed));
  }, []);

  const activeQuestions = isRetryRound ? retryQuestions : questions;
  const q = activeQuestions[current];

  useEffect(() => {
    setSelected(null);
    setRabbitMsg('');
    setRabbitDancing(false);
    setShowHint(false);
  }, [current, isRetryRound]);

  const [spokenForCurrent, setSpokenForCurrent] = useState(false);

  useEffect(() => {
    setSpokenForCurrent(false);
  }, [current, isRetryRound]);

  useEffect(() => {
    if (selected !== null && q && !spokenForCurrent) {
      setSpokenForCurrent(true);
      speak(q.data.word);
    }
  }, [selected]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.data.answer) {
      if (!isRetryRound) setScore(s => s + 1);
      setRabbitMsg(getEncourageMessage());
      setRabbitMood('cheer');
      setRabbitDancing(true);
      removeMissedQuestion(q.missedDay, q.type, q.data.id);
    } else {
      setRabbitMsg(getWrongMessage());
      setRabbitMood('happy');
      setRabbitDancing(false);
      if (!isRetryRound) {
        setWrongIndices(prev => [...prev, current]);
      } else {
        setWrongIndices(prev => [...prev, current]);
      }
      addMissedQuestion(q.missedDay, q.type, q.data.id);
    }
  }

  function handleNext() {
    if (current + 1 >= activeQuestions.length) {
      if (!isRetryRound) {
        setFirstRoundScore(score);
        if (wrongIndices.length > 0) {
          const retryQs = shuffleArray(wrongIndices.map(i => activeQuestions[i]));
          setRetryQuestions(retryQs);
          setWrongIndices([]);
          setCurrent(0);
          setIsRetryRound(true);
          setRabbitMsg('間違えた問題をもう一回！');
          return;
        }
        setFinished(true);
      } else {
        if (wrongIndices.length > 0) {
          const retryQs = shuffleArray(wrongIndices.map(i => activeQuestions[i]));
          setRetryQuestions(retryQs);
          setWrongIndices([]);
          setCurrent(0);
          return;
        }
        setFinished(true);
      }
    } else {
      setCurrent(c => c + 1);
    }
  }

  function handleUseHint() {
    if (hintsLeft > 0 && selected === null) {
      setHintsLeft(h => h - 1);
      setShowHint(true);
    }
  }

  if (questions.length === 0 && !finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-kdark">
        <p className="text-xl font-bold text-white font-pixel">間違えた問題がないよ！</p>
        <a href="/" className="mt-4 text-kpink underline font-pixel">ホームへ戻る</a>
      </div>
    );
  }

  if (finished) {
    const finalScore = isRetryRound ? firstRoundScore : score;
    const total = questions.length;
    const rate = total > 0 ? finalScore / total : 0;
    return (
      <div className="min-h-screen bg-kdark">
        <header className="sticky top-0 z-10 bg-kdark" style={{ borderBottom: '3px solid #fff' }}>
          <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BgmPlayer src="/bgm/chopsticks.mp3" className="w-8 h-8 flex items-center justify-center btn-pixel bg-kcard rounded-none" />
              <a href="/" className="text-kpink font-bold text-sm font-pixel">← もどる</a>
            </div>
            <h1 className="text-base font-black font-pixel text-red-400 inline-flex items-center gap-1"><PixelBolt size={14} /> 特別ステージ</h1>
            <div className="w-14" />
          </div>
        </header>
        <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center">{rate >= 0.8 ? <PixelParty size={48} /> : <PixelClap size={48} />}</div>
            <h2 className="text-2xl font-black text-white font-pixel">結果発表</h2>
            <div className="text-5xl font-black font-pixel">
              <span className="text-red-400">{finalScore}</span>
              <span className="text-2xl text-gray-300">/{total}</span>
            </div>
            <div className="text-lg text-kyellow font-bold font-pixel">
              正解率 {Math.round(rate * 100)}%
            </div>
            <RabbitMessage message={rate >= 0.8 ? getDanceTimeMessage() : 'よくがんばったね！苦手な問題、少しずつ克服しよう！'} mood="cheer" dancing={rate >= 0.8} />
            <a href="/" className="btn-pixel px-6 py-3 rounded-none bg-kcard text-gray-200 font-bold text-lg font-pixel">
              ホームへ
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const isFill = q.type === 'fill';
  const data = q.data;

  return (
    <div className="min-h-screen bg-kdark">
      <header className="sticky top-0 z-10 bg-kdark" style={{ borderBottom: '3px solid #fff' }}>
        <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BgmPlayer src="/bgm/chopsticks.mp3" className="w-8 h-8 flex items-center justify-center btn-pixel bg-kcard rounded-none" />
            <a href="/" className="text-kpink font-bold text-sm font-pixel">← もどる</a>
          </div>
          <h1 className="text-base font-black font-pixel text-red-400 inline-flex items-center gap-1"><PixelBolt size={14} /> 特別ステージ</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-5">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-400 font-pixel">
            <span>
              {isRetryRound && <span className="text-red-400 mr-1">再チャレンジ</span>}
              Q{current + 1} / {activeQuestions.length}
            </span>
            <div className="flex items-center gap-3">
              <HintButton hintsLeft={hintsLeft} onUseHint={handleUseHint} disabled={selected !== null} />
              <span className="text-red-400 font-bold inline-flex items-center gap-1"><PixelBolt size={10} /> {isRetryRound ? firstRoundScore : score}点</span>
            </div>
          </div>
          <div className="h-3 rounded-none pixel-progress-track overflow-hidden">
            <div className="h-full rounded-none transition-all duration-300" style={{ width: `${((current + 1) / activeQuestions.length) * 100}%`, background: '#EF4444' }} />
          </div>

          {/* Question */}
          {isFill ? (() => {
            const fillQ = data as FillQuestion;
            const parts = fillQ.sentence.split('____');
            return (
              <div className="pixel-card rounded-none p-5">
                <p className="text-xs font-black text-kpink mb-2 tracking-[0.2em] font-pixel">FILL IN THE BLANK</p>
                <p className="text-lg leading-relaxed text-gray-100">
                  {parts[0]}
                  <span className="inline-block mx-1 px-3 py-0.5 bg-kpink/20 border-2 border-kpink rounded-none font-bold text-kpink min-w-[80px] text-center">
                    {selected !== null ? fillQ.choices[fillQ.answer] : '____'}
                  </span>
                  {parts[1]}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <SpeechButton text={fillQ.sentence.replace('____', ' ... ')} />
                  <span className="text-xs text-gray-300 font-pixel">発音を聞く</span>
                </div>
                {showHint && (
                  <div className="mt-3 px-3 py-2 bg-kyellow/10 border-2 border-kyellow/30 rounded-none animate-fade-in">
                    <p className="text-sm text-kyellow font-pixel">HINT: {fillQ.translation}</p>
                  </div>
                )}
              </div>
            );
          })() : (() => {
            const defQ = data as DefQuestion;
            return (
              <div className="pixel-card rounded-none p-5">
                <p className="text-xs font-black text-kpurple mb-2 tracking-[0.2em] font-pixel">DEFINITION</p>
                <p className="text-lg leading-relaxed italic text-gray-200">&ldquo;{defQ.definition}&rdquo;</p>
                <p className="mt-3 text-sm text-gray-300">この意味の英単語はどれ？</p>
                {showHint && (
                  <div className="mt-3 px-3 py-2 bg-kyellow/10 border-2 border-kyellow/30 rounded-none animate-fade-in">
                    <p className="text-sm text-kyellow font-pixel">HINT: {defQ.hint}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Choices */}
          <div className="grid grid-cols-1 gap-3">
            {data.choices.map((c, i) => {
              let cls = 'btn-pixel w-full text-left px-5 py-4 rounded-none text-base font-medium transition-all ';
              if (selected === null) {
                cls += 'bg-kcard text-gray-200';
              } else if (i === data.answer) {
                cls += 'bg-green-950 text-green-300';
              } else if (i === selected) {
                cls += 'bg-red-950 text-red-300';
              } else {
                cls += 'bg-kcard text-gray-400 opacity-70';
              }
              const borderStyle = selected !== null
                ? i === data.answer
                  ? { border: '3px solid #34D399' }
                  : i === selected
                    ? { border: '3px solid #EF4444' }
                    : {}
                : {};
              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={cls} style={borderStyle}>
                  <span className="inline-block w-7 text-center font-bold mr-2 opacity-60 font-pixel">{['A', 'B', 'C', 'D'][i]}</span>
                  {c}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {selected !== null && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <RabbitMessage message={rabbitMsg} mood={rabbitMood} dancing={rabbitDancing} />
              <div className="pixel-dialog rounded-none p-4 text-sm text-gray-300" style={{ borderColor: isFill ? 'var(--color-kpurple)' : 'var(--color-kpurple)', outlineColor: 'var(--color-kborder)' }}>
                <p className="font-bold mb-1 text-kyellow font-pixel inline-flex items-center gap-1"><PixelStar size={10} /> 解説</p>
                {isFill ? (
                  <>
                    <p>{(data as FillQuestion).explanation}</p>
                    <p className="text-xs text-gray-300 border-t border-gray-700 pt-2 mt-2">
                      <span className="text-kpink font-bold font-pixel">JP</span> {data.translation}
                    </p>
                  </>
                ) : (
                  <>
                    <p>{(data as DefQuestion).hint}</p>
                    <p className="text-xs text-gray-300 border-t border-gray-700 pt-2 mt-2">
                      <span className="text-kpurple font-bold font-pixel">{data.word}</span> = {data.translation}
                    </p>
                  </>
                )}
              </div>
              <button onClick={handleNext} className="self-end btn-pixel px-6 py-3 rounded-none bg-red-500 text-white font-bold text-lg font-pixel">
                {current + 1 >= activeQuestions.length
                  ? wrongIndices.length > 0 ? '再チャレンジへ' : '結果を見る'
                  : '次の問題 →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
