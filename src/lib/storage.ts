const STORAGE_KEY = 'eiken3-drill';

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

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
}
