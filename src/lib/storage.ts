const STORAGE_KEY = 'eiken3-drill';
const SETS_KEY = 'eiken3-sets';

export type QuizType = 'fill' | 'definition';

export interface DayProgress {
  fill?: { completed: boolean; correct: number; total: number };
  definition?: { completed: boolean; correct: number; total: number };
}

export interface AppData {
  days: Record<number, DayProgress>;
}

function load(): AppData {
  if (typeof window === 'undefined') return { days: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { days: {} };
  } catch {
    return { days: {} };
  }
}

function save(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSets(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getDayProgress(day: number): DayProgress {
  return load().days[day] ?? {};
}

export function getAllProgress(): Record<number, DayProgress> {
  return load().days;
}

export function saveDayResult(day: number, type: QuizType, correct: number, total: number) {
  const data = load();
  if (!data.days[day]) data.days[day] = {};
  data.days[day][type] = { completed: true, correct, total };
  save(data);
}

/** 全問正解した後は次回セットを切り替える */
export function getNextSet(day: number, type: QuizType): number {
  const sets = loadSets();
  const key = `${type}-${day}`;
  const currentSet = sets[key] ?? 1;

  const progress = getDayProgress(day);
  const result = progress[type];

  // 前回全問正解 → セット切り替え
  if (result?.completed && result.correct === result.total) {
    const next = currentSet === 1 ? 2 : 1;
    return next;
  }
  return currentSet;
}

/** クイズ開始時にセットを保存 */
export function saveCurrentSet(day: number, type: QuizType, set: number) {
  const sets = loadSets();
  sets[`${type}-${day}`] = set;
  localStorage.setItem(SETS_KEY, JSON.stringify(sets));
}

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETS_KEY);
}
