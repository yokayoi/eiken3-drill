const STORAGE_KEY = 'eiken3-drill';
const SETS_KEY = 'eiken3-sets';
const MISSED_KEY = 'eiken3-missed';

export type QuizType = 'fill' | 'definition' | 'reading';

export interface QuizResult {
  completed: boolean;
  correct: number;
  total: number;
  perfect?: boolean;
}

export interface DayProgress {
  fill?: QuizResult;
  definition?: QuizResult;
  reading?: QuizResult;
}

export interface AppData {
  days: Record<number, DayProgress>;
}

export interface MissedQuestion {
  day: number;
  type: QuizType;
  questionId: number;
  count: number;
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

export function getDayProgress(day: number, world: number = 1): DayProgress {
  const key = world === 2 ? day + 8 : day;
  return load().days[key] ?? {};
}

export function getAllProgress(): Record<number, DayProgress> {
  return load().days;
}

export function saveDayResult(day: number, type: QuizType, correct: number, total: number, world: number = 1) {
  const data = load();
  const key = world === 2 ? day + 8 : day;
  if (!data.days[key]) data.days[key] = {};
  data.days[key][type] = { completed: true, correct, total, perfect: correct === total };
  save(data);
}

/** World に基づいてセット番号を返す（World 1 = Set 1, World 2 = Set 2） */
export function getSetForWorld(world: number): number {
  return world;
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
  localStorage.removeItem(MISSED_KEY);
}

// ===== World functions =====

const STAGES = [1, 2, 3, 4, 5, 6, 7, 8];

/** World 1 = stages 1-8, World 2 = stages 9-16 (stored as day+8) */
export function getWorldProgress(world: number): Record<number, DayProgress> {
  const all = load().days;
  const result: Record<number, DayProgress> = {};
  for (const stage of STAGES) {
    const key = world === 2 ? stage + 8 : stage;
    if (all[key]) result[stage] = all[key];
  }
  return result;
}

export function isWorldCleared(world: number): boolean {
  const progress = getWorldProgress(world);
  return STAGES.every(s => progress[s]?.fill?.completed && progress[s]?.definition?.completed && progress[s]?.reading?.completed);
}

export function isAllPerfect(): boolean {
  const data = load().days;
  for (const world of [1, 2]) {
    for (const stage of STAGES) {
      const key = world === 2 ? stage + 8 : stage;
      const p = data[key];
      if (!p?.fill?.perfect || !p?.definition?.perfect || !p?.reading?.perfect) return false;
    }
  }
  return true;
}

// ===== Missed questions =====

function loadMissed(): MissedQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMissed(data: MissedQuestion[]) {
  localStorage.setItem(MISSED_KEY, JSON.stringify(data));
}

export function getMissedQuestions(): MissedQuestion[] {
  return loadMissed();
}

export function addMissedQuestion(day: number, type: QuizType, questionId: number) {
  const missed = loadMissed();
  const existing = missed.find(m => m.day === day && m.type === type && m.questionId === questionId);
  if (existing) {
    existing.count++;
  } else {
    missed.push({ day, type, questionId, count: 1 });
  }
  saveMissed(missed);
}

export function removeMissedQuestion(day: number, type: QuizType, questionId: number) {
  const missed = loadMissed().filter(
    m => !(m.day === day && m.type === type && m.questionId === questionId)
  );
  saveMissed(missed);
}
