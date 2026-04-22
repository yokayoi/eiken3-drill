'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import SpeechButton from './SpeechButton';
import RabbitMessage from './RabbitMessage';
import RewardModal from './RewardModal';
import HintButton from './HintButton';
import { saveDayResult, addMissedQuestion, removeMissedQuestion, isAllPerfect } from '@/lib/storage';
import { getEncourageMessage, getWrongMessage, getScoreComment, getBlackMessage, getBlackFollowUp, getDanceTimeMessage } from '@/lib/rabbit';
import { determineReward, type Reward } from '@/lib/rewards';
import EndCredits from './EndCredits';
import { PixelParty, PixelClap, PixelAngry, PixelNote, PixelStar } from './PixelIcons';

interface InnerQuestion {
  q: string;
  choices: string[];
  answer: number;
  explanation: string;
  translation: string;
}

interface Passage {
  id: number;
  day: number;
  type: 'notice' | 'email' | 'passage';
  title: string;
  passage: string;
  translation: string;
  questions: InnerQuestion[];
}

interface FlatQuestion extends InnerQuestion {
  passageId: number;
  passageType: Passage['type'];
  passageTitle: string;
  passageText: string;
  passageTranslation: string;
  qIdxInPassage: number;
  globalId: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function flattenPassages(passages: Passage[]): FlatQuestion[] {
  const flat: FlatQuestion[] = [];
  for (const p of passages) {
    p.questions.forEach((q, qIdx) => {
      flat.push({
        ...q,
        passageId: p.id,
        passageType: p.type,
        passageTitle: p.title,
        passageText: p.passage,
        passageTranslation: p.translation,
        qIdxInPassage: qIdx,
        globalId: p.id * 100 + qIdx,
      });
    });
  }
  return flat;
}

const TYPE_LABEL: Record<Passage['type'], string> = {
  notice: 'NOTICE / 掲示',
  email: 'EMAIL / メール',
  passage: 'STORY / 物語',
};

export default function ReadingQuiz({ day, world = 1, passages }: { day: number; world?: number; passages: Passage[] }) {
  const questions = useMemo(() => flattenPassages(passages), [passages]);

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

  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [retryQuestions, setRetryQuestions] = useState<FlatQuestion[]>([]);
  const [isRetryRound, setIsRetryRound] = useState(false);
  const [firstRoundScore, setFirstRoundScore] = useState(0);

  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const [showEndCredits, setShowEndCredits] = useState(false);

  const activeQuestions = isRetryRound ? retryQuestions : questions;
  const q = activeQuestions[current];

  useEffect(() => {
    setRabbitMsg('');
    setSelected(null);
    setRabbitVariant('normal');
    setRabbitDancing(false);
    setShowFollowUp(false);
    setShowHint(false);
    setShowTranslation(false);
  }, [current, isRetryRound]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.answer) {
      if (!isRetryRound) setScore(s => s + 1);
      setRabbitMsg(getEncourageMessage());
      setRabbitMood('cheer');
      setRabbitDancing(true);
      removeMissedQuestion(day, 'reading', q.globalId);
    } else {
      setRabbitMsg(getWrongMessage());
      setRabbitMood('happy');
      setRabbitDancing(false);
      setWrongIds(prev => [...prev, q.globalId]);
      addMissedQuestion(day, 'reading', q.globalId);
    }
  }

  const handleFinish = useCallback((finalScore: number) => {
    saveDayResult(day, 'reading', finalScore, questions.length, world);
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

    setTimeout(() => {
      if (isAllPerfect()) setShowEndCredits(true);
    }, 2000);
  }, [day, questions.length, world]);

  function handleNext() {
    if (current + 1 >= activeQuestions.length) {
      if (!isRetryRound) {
        setFirstRoundScore(score);
        if (wrongIds.length > 0) {
          const retryQs = shuffleArray(questions.filter(qq => wrongIds.includes(qq.globalId)));
          setRetryQuestions(retryQs);
          setWrongIds([]);
          setCurrent(0);
          setIsRetryRound(true);
          setRabbitMsg('間違えた問題をもう一回！全部正解するまでがんばろう！');
          setRabbitMood('cheer');
          setRabbitDancing(false);
          return;
        }
        handleFinish(score);
      } else {
        if (wrongIds.length > 0) {
          const retryQs = shuffleArray(activeQuestions.filter(qq => wrongIds.includes(qq.globalId)));
          setRetryQuestions(retryQs);
          setWrongIds([]);
          setCurrent(0);
          return;
        }
        handleFinish(firstRoundScore);
      }
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
    setWrongIds([]);
    setRetryQuestions([]);
    setIsRetryRound(false);
    setFirstRoundScore(0);
    setHintsLeft(3);
    setShowHint(false);
    setShowTranslation(false);
  }

  function handleUseHint() {
    if (hintsLeft > 0 && selected === null) {
      setHintsLeft(h => h - 1);
      setShowHint(true);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-300 font-pixel">このステージの読解問題はまだ準備中です。</p>
      </div>
    );
  }

  if (finished) {
    const finalScore = isRetryRound ? firstRoundScore : score;
    const rate = finalScore / questions.length;
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        {showEndCredits && <EndCredits onClose={() => setShowEndCredits(false)} />}
        {showReward && reward && <RewardModal reward={reward} onClose={() => setShowReward(false)} />}

        <div className="flex justify-center">{rate >= 0.8 ? <PixelParty size={48} /> : rate >= 0.6 ? <PixelClap size={48} /> : <PixelAngry size={48} />}</div>
        <h2 className="text-2xl font-black text-white font-pixel">結果発表</h2>
        <div className="text-5xl font-black font-pixel">
          <span style={{ color: 'var(--color-kgreen)' }}>{finalScore}</span>
          <span className="text-2xl text-gray-300">/{questions.length}</span>
        </div>
        <div className="text-lg text-kyellow font-bold font-pixel">
          正解率 {Math.round(rate * 100)}%
        </div>

        <RabbitMessage message={rabbitMsg} variant={rabbitVariant} mood={rabbitMood} dancing={rabbitDancing} />

        {showFollowUp && (
          <RabbitMessage message={followUpMsg} variant="normal" mood="happy" />
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRetry}
            className="btn-pixel px-6 py-3 rounded-none text-white font-bold text-lg font-pixel"
            style={{ background: 'var(--color-kgreen)' }}
          >
            もう一回
          </button>
          <a href="/" className="btn-pixel px-6 py-3 rounded-none bg-kcard text-gray-200 font-bold text-lg font-pixel">
            ホームへ
          </a>
        </div>
      </div>
    );
  }

  if (!q) return null;

  // Detect passage boundary (first question of each passage)
  const prevQ = current > 0 ? activeQuestions[current - 1] : null;
  const isNewPassage = !prevQ || prevQ.passageId !== q.passageId;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400 font-pixel">
        <span>
          {isRetryRound && <span className="text-red-400 mr-1">再チャレンジ</span>}
          Q{current + 1} / {activeQuestions.length}
        </span>
        <div className="flex items-center gap-3">
          <HintButton hintsLeft={hintsLeft} onUseHint={handleUseHint} disabled={selected !== null} />
          <span className="font-bold inline-flex items-center gap-1" style={{ color: 'var(--color-kgreen)' }}>
            <PixelNote size={10} color="#10B981" /> {isRetryRound ? firstRoundScore : score}点
          </span>
        </div>
      </div>
      <div className="h-3 rounded-none pixel-progress-track overflow-hidden">
        <div
          className="h-full rounded-none transition-all duration-300"
          style={{ width: `${((current + 1) / activeQuestions.length) * 100}%`, background: 'var(--color-kgreen)' }}
        />
      </div>

      {/* Passage */}
      <div className="pixel-card rounded-none p-5">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <p
            className="text-xs font-black tracking-[0.2em] font-pixel"
            style={{ color: 'var(--color-kgreen)' }}
          >
            {TYPE_LABEL[q.passageType]}
          </p>
          {q.qIdxInPassage === 0 && isNewPassage && (
            <span className="text-[10px] text-kyellow font-pixel animate-fade-in">NEW PASSAGE!</span>
          )}
        </div>
        <h3 className="text-base font-bold text-white font-pixel mb-3">{q.passageTitle}</h3>
        <div className="text-sm md:text-base leading-relaxed text-gray-100 whitespace-pre-line mb-3">
          {q.passageText}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SpeechButton text={q.passageText} />
          <span className="text-xs text-gray-300 font-pixel">読み上げ</span>
          <button
            onClick={() => setShowTranslation(v => !v)}
            className="ml-auto text-xs text-kyellow font-pixel underline decoration-dotted"
          >
            {showTranslation ? '日本語訳を隠す' : '日本語訳を見る'}
          </button>
        </div>
        {showTranslation && (
          <div className="mt-3 px-3 py-2 bg-kyellow/10 border-2 border-kyellow/30 rounded-none animate-fade-in">
            <p className="text-xs text-kyellow font-bold font-pixel mb-1">JP 訳</p>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{q.passageTranslation}</p>
          </div>
        )}
      </div>

      {/* Question */}
      <div
        className="pixel-card rounded-none p-5"
        style={{ borderColor: 'var(--color-kgreen)' }}
      >
        <p className="text-xs font-black text-kyellow mb-2 tracking-[0.2em] font-pixel">
          QUESTION {q.qIdxInPassage + 1}
        </p>
        <p className="text-lg leading-relaxed text-gray-100">{q.q}</p>
        {showHint && (
          <div className="mt-3 px-3 py-2 bg-kyellow/10 border-2 border-kyellow/30 rounded-none animate-fade-in">
            <p className="text-sm text-kyellow font-pixel">HINT: {q.translation}</p>
          </div>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-3">
        {q.choices.map((c, i) => {
          let cls = 'btn-pixel w-full text-left px-5 py-4 rounded-none text-base font-medium transition-all ';
          if (selected === null) {
            cls += 'bg-kcard text-gray-200';
          } else if (i === q.answer) {
            cls += 'bg-green-950 text-green-300';
          } else if (i === selected) {
            cls += 'bg-red-950 text-red-300';
          } else {
            cls += 'bg-kcard text-gray-400 opacity-70';
          }
          const borderStyle = selected !== null
            ? i === q.answer
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
          <div
            className="pixel-dialog rounded-none p-4 text-sm text-gray-300"
            style={{ borderColor: 'var(--color-kgreen)', outlineColor: 'var(--color-kborder)' }}
          >
            <p className="font-bold mb-1 text-kyellow font-pixel inline-flex items-center gap-1">
              <PixelStar size={10} /> 解説
            </p>
            <p>{q.explanation}</p>
            <p className="text-xs text-gray-300 border-t border-gray-700 pt-2 mt-2">
              <span className="font-bold font-pixel" style={{ color: 'var(--color-kgreen)' }}>JP</span> {q.translation}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="self-end btn-pixel px-6 py-3 rounded-none text-white font-bold text-lg font-pixel"
            style={{ background: 'var(--color-kgreen)' }}
          >
            {current + 1 >= activeQuestions.length
              ? wrongIds.length > 0 ? '再チャレンジへ' : '結果を見る'
              : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
