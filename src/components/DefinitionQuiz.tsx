'use client';

import { useState, useEffect, useCallback } from 'react';
import SpeechButton from './SpeechButton';
import RabbitMessage from './RabbitMessage';
import RewardModal from './RewardModal';
import HintButton from './HintButton';
import { saveDayResult, getSetForWorld, addMissedQuestion, removeMissedQuestion, isAllPerfect } from '@/lib/storage';
import { speak } from '@/lib/speech';
import { getEncourageMessage, getWrongMessage, getScoreComment, getBlackMessage, getBlackFollowUp, getDanceTimeMessage } from '@/lib/rabbit';
import { determineReward, type Reward } from '@/lib/rewards';
import EndCredits from './EndCredits';
import { PixelParty, PixelClap, PixelAngry, PixelNote, PixelStar } from './PixelIcons';

interface Question {
  id: number;
  word: string;
  definition: string;
  choices: string[];
  answer: number;
  hint: string;
  translation: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DefinitionQuiz({ day, world = 1, questions: allQuestions }: { day: number; world?: number; questions: Question[] }) {
  // Slice questions based on world
  const set = getSetForWorld(world);
  const questions = set === 2 && allQuestions.length > 10
    ? allQuestions.slice(10, 20)
    : allQuestions.slice(0, 10);

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

  // Wrong answer re-presentation
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [retryQuestions, setRetryQuestions] = useState<Question[]>([]);
  const [isRetryRound, setIsRetryRound] = useState(false);
  const [firstRoundScore, setFirstRoundScore] = useState(0);

  // Hint system
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false);

  // End credits
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
  }, [current, isRetryRound]);

  // Auto-play speech when answer is selected (only on user action, not question change)
  const [spokenForCurrent, setSpokenForCurrent] = useState(false);

  useEffect(() => {
    setSpokenForCurrent(false);
  }, [current, isRetryRound]);

  useEffect(() => {
    if (selected !== null && q && !spokenForCurrent) {
      setSpokenForCurrent(true);
      speak(q.word);
    }
  }, [selected]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.answer) {
      if (!isRetryRound) setScore(s => s + 1);
      setRabbitMsg(getEncourageMessage());
      setRabbitMood('cheer');
      setRabbitDancing(true);
      removeMissedQuestion(day, 'definition', q.id);
    } else {
      setRabbitMsg(getWrongMessage());
      setRabbitMood('happy');
      setRabbitDancing(false);
      if (!isRetryRound) {
        setWrongIds(prev => [...prev, q.id]);
      } else {
        setWrongIds(prev => [...prev, q.id]);
      }
      addMissedQuestion(day, 'definition', q.id);
    }
  }

  const handleFinish = useCallback((finalScore: number) => {
    saveDayResult(day, 'definition', finalScore, questions.length, world);
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

    // Check for complete clear
    setTimeout(() => {
      if (isAllPerfect()) {
        setShowEndCredits(true);
      }
    }, 2000);
  }, [day, questions.length, world]);

  function handleNext() {
    if (current + 1 >= activeQuestions.length) {
      if (!isRetryRound) {
        setFirstRoundScore(score);
        if (wrongIds.length > 0) {
          const retryQs = shuffleArray(questions.filter(q => wrongIds.includes(q.id)));
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
          const retryQs = shuffleArray(activeQuestions.filter(q => wrongIds.includes(q.id)));
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
  }

  function handleUseHint() {
    if (hintsLeft > 0 && selected === null) {
      setHintsLeft(h => h - 1);
      setShowHint(true);
    }
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
          <span className="text-kpurple">{finalScore}</span>
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
          <button onClick={handleRetry} className="btn-pixel px-6 py-3 rounded-none bg-kpurple text-white font-bold text-lg font-pixel">
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
          <span className="text-kpurple font-bold inline-flex items-center gap-1"><PixelNote size={10} color="#A855F7" /> {isRetryRound ? firstRoundScore : score}点</span>
        </div>
      </div>
      <div className="h-3 rounded-none pixel-progress-track overflow-hidden">
        <div className="h-full rounded-none transition-all duration-300" style={{ width: `${((current + 1) / activeQuestions.length) * 100}%`, background: '#A855F7' }} />
      </div>

      {/* Definition */}
      <div className="pixel-card rounded-none p-5">
        <p className="text-xs font-black text-kpurple mb-2 tracking-[0.2em] font-pixel">DEFINITION</p>
        <p className="text-lg leading-relaxed italic text-gray-200">&ldquo;{q.definition}&rdquo;</p>
        <div className="mt-3 flex items-center gap-2">
          <SpeechButton text={q.definition} />
          <span className="text-xs text-gray-300 font-pixel">発音を聞く</span>
        </div>
        <p className="mt-2 text-sm text-gray-300">この意味の英単語はどれ？</p>

        {/* Hint display */}
        {showHint && (
          <div className="mt-3 px-3 py-2 bg-kyellow/10 border-2 border-kyellow/30 rounded-none animate-fade-in">
            <p className="text-sm text-kyellow font-pixel">HINT: {q.hint}</p>
          </div>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-3">
        {q.choices.map((c, i) => {
          let cls = 'btn-pixel w-full text-left px-5 py-4 rounded-none text-base font-medium transition-all flex items-center justify-between ';
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
              <span>
                <span className="inline-block w-7 text-center font-bold mr-2 opacity-60 font-pixel">{['A', 'B', 'C', 'D'][i]}</span>
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
          <div className="pixel-dialog rounded-none p-4 text-sm text-gray-300" style={{ borderColor: 'var(--color-kpurple)', outlineColor: 'var(--color-kborder)' }}>
            <p className="font-bold mb-1 text-kyellow font-pixel inline-flex items-center gap-1"><PixelStar size={10} /> 解説</p>
            <p>{q.hint}</p>
            <p className="text-xs text-gray-300 border-t border-gray-700 pt-2 mt-2">
              <span className="text-kpurple font-bold font-pixel">{q.word}</span> = {q.translation}
            </p>
          </div>
          <button onClick={handleNext} className="self-end btn-pixel px-6 py-3 rounded-none bg-kpurple text-white font-bold text-lg font-pixel">
            {current + 1 >= activeQuestions.length
              ? (wrongIds.length > 0)
                ? '再チャレンジへ'
                : '結果を見る'
              : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}
