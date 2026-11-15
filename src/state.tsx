import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialWords, type Word } from './data';

export type Tab = 'Learn' | 'Practice' | 'Words' | 'Progress' | 'Profile';
export type Activity = { date: string; minutes: number; label: string; score?: number };
export type Stats = { minutes: number; conversations: number; reviews: number; speakingTries: number; speakingScore: number; completed: string[]; activity: Activity[] };
export type Profile = { name: string; level: string; goal: string; language: string; dailyGoal: number; tutor: string; feedback: boolean; sound: boolean };
const defaultProfile: Profile = { name: 'Tuan Quoc', level: 'B2', goal: 'Study abroad', language: 'Vietnamese', dailyGoal: 5, tutor: 'Skye', feedback: true, sound: true };
const defaultStats: Stats = { minutes: 11, conversations: 1, reviews: 0, speakingTries: 5, speakingScore: 80, completed: ['everyday-1'], activity: [] };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function restoreProfile(value: unknown): Profile {
  if (!isRecord(value)) return defaultProfile;
  const result = { ...defaultProfile };
  for (const key of ['name', 'level', 'goal', 'language', 'tutor'] as const) if (typeof value[key] === 'string' && value[key].trim()) result[key] = value[key].slice(0, 80);
  if (typeof value.dailyGoal === 'number' && Number.isFinite(value.dailyGoal) && value.dailyGoal >= 1 && value.dailyGoal <= 120) result.dailyGoal = value.dailyGoal;
  for (const key of ['feedback', 'sound'] as const) if (typeof value[key] === 'boolean') result[key] = value[key];
  return result;
}
function restoreStats(value: unknown): Stats {
  if (!isRecord(value)) return defaultStats;
  const result = { ...defaultStats };
  for (const key of ['minutes', 'conversations', 'reviews', 'speakingTries', 'speakingScore'] as const) if (typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0) result[key] = value[key];
  if (Array.isArray(value.completed)) result.completed = value.completed.filter((v): v is string => typeof v === 'string');
  if (Array.isArray(value.activity)) result.activity = value.activity.filter((v): v is Activity => isRecord(v) && typeof v.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date) && typeof v.label === 'string' && typeof v.minutes === 'number' && Number.isFinite(v.minutes) && v.minutes >= 0);
  return result;
}
function restoreWords(value: unknown): Word[] {
  if (!Array.isArray(value)) return initialWords;
  return value.filter((v): v is Word => isRecord(v) && ['id', 'word', 'definition', 'example', 'collection'].every(k => typeof v[k] === 'string') && ['New', 'Learning', 'Mastered'].includes(String(v.status)) && typeof v.due === 'boolean');
}
export function localDateKey(date = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
export function activityStreak(activity: Activity[]) {
  const dates = new Set(activity.map(a => a.date)); let streak = 0; const cursor = new Date();
  while (streak < 366 && dates.has(localDateKey(cursor))) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  return streak;
}
function useStored<T>(key: string, initial: T, restore: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try { const stored = localStorage.getItem(key); return stored ? restore(JSON.parse(stored)) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The app remains usable when browser storage is unavailable. */ } }, [key, value]);
  return [value, setValue] as const;
}

function useNarraState() {
  const [profile, setProfile] = useStored('narra-profile-v1', defaultProfile, restoreProfile);
  const [stats, setStats] = useStored('narra-stats-v1', defaultStats, restoreStats);
  const [words, setWords] = useStored<Word[]>('narra-words-v1', initialWords, restoreWords);
  const [tab, setTab] = useState<Tab>(() => {
    const name = location.hash.slice(1);
    return (['Learn', 'Practice', 'Words', 'Progress', 'Profile'] as Tab[]).find(t => t.toLowerCase() === name) ?? 'Learn';
  });
  const [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  function navigate(next: Tab) { setTab(next); history.replaceState(null, '', `#${next.toLowerCase()}`); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function logActivity(label: string, minutes = 1, score?: number) {
    const today = localDateKey();
    setStats(s => ({ ...s, minutes: s.minutes + minutes, activity: [{ date: today, label, minutes, score }, ...s.activity] }));
  }
  return { profile, setProfile, stats, setStats, words, setWords, tab, navigate, toast, notify: setToast, logActivity };
}
const Context = createContext<ReturnType<typeof useNarraState> | null>(null);
export function NarraProvider({ children }: { children: ReactNode }) { const value = useNarraState(); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useNarra() { const value = useContext(Context); if (!value) throw new Error('NarraProvider is missing'); return value; }

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.rate = .85; window.speechSynthesis.speak(utterance); return true;
}
