import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialWords, type Word } from './data';
import { streakState } from './streaks';
import { useAccounts } from './AccountContext';

export type Tab = 'Lesson' | 'Practice' | 'Dictionary' | 'Profile';
export type Activity = { date: string; minutes: number; label: string; score?: number };
export type Stats = { minutes: number; conversations: number; reviews: number; speakingTries: number; speakingScore: number; completed: string[]; activity: Activity[] };
export type Profile = { name: string; level: string; goal: string; language: string; dailyGoal: number; tutor: string; feedback: boolean; sound: boolean; uiLanguage: 'English' | 'Tiếng Việt'; reminders: boolean; reminderTime: string; notifications: boolean; theme: 'light' | 'dark' | 'system' };
const defaultProfile: Profile = { name: 'Tuan Quoc', level: 'B2', goal: 'Study abroad', language: 'Vietnamese', dailyGoal: 5, tutor: 'Skye', feedback: true, sound: true, uiLanguage: 'Tiếng Việt', reminders: false, reminderTime: '20:00', notifications: false, theme: 'light' };
const defaultStats: Stats = { minutes: 11, conversations: 1, reviews: 0, speakingTries: 5, speakingScore: 0, completed: ['everyday-1'], activity: [] };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function restoreProfile(value: unknown): Profile {
  if (!isRecord(value)) return defaultProfile;
  const result = { ...defaultProfile };
  for (const key of ['name', 'level', 'goal', 'language', 'tutor'] as const) if (typeof value[key] === 'string' && value[key].trim()) result[key] = value[key].slice(0, 80);
  if (typeof value.dailyGoal === 'number' && Number.isFinite(value.dailyGoal) && value.dailyGoal >= 1 && value.dailyGoal <= 120) result.dailyGoal = value.dailyGoal;
  for (const key of ['feedback', 'sound', 'reminders', 'notifications'] as const) if (typeof value[key] === 'boolean') result[key] = value[key];
  if (value.uiLanguage === 'English' || value.uiLanguage === 'Tiếng Việt') result.uiLanguage = value.uiLanguage;
  if (value.theme === 'light' || value.theme === 'dark' || value.theme === 'system') result.theme = value.theme;
  if (typeof value.reminderTime === 'string' && /^\d{2}:\d{2}$/.test(value.reminderTime)) result.reminderTime = value.reminderTime;
  return result;
}
function restoreStats(value: unknown): Stats {
  if (!isRecord(value)) return defaultStats;
  const result = { ...defaultStats };
  for (const key of ['minutes', 'conversations', 'reviews', 'speakingTries', 'speakingScore'] as const) if (typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0) result[key] = value[key];
  if (Array.isArray(value.completed)) result.completed = value.completed.filter((v): v is string => typeof v === 'string');
  if (Array.isArray(value.activity)) result.activity = value.activity.filter((v): v is Activity => isRecord(v) && typeof v.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date) && typeof v.label === 'string' && typeof v.minutes === 'number' && Number.isFinite(v.minutes) && v.minutes >= 0);
  const scored = result.activity.filter(a => typeof a.score === 'number' && Number.isFinite(a.score) && a.score >= 0 && a.score <= 100);
  result.speakingScore = scored.length ? scored[0].score! : 0;
  return result;
}
function restoreWords(value: unknown): Word[] {
  if (!Array.isArray(value)) return initialWords;
  return value.filter((v): v is Word => isRecord(v) && ['id', 'word', 'definition', 'example', 'collection'].every(k => typeof v[k] === 'string') && ['New', 'Learning', 'Mastered'].includes(String(v.status)) && typeof v.due === 'boolean');
}
export function localDateKey(date = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
export function activityStreak(activity: Activity[]) {
  return streakState(activity.map(a => a.date), localDateKey()).current;
}
function useStored<T>(key: string, initial: T, restore: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try { const stored = localStorage.getItem(key); return stored ? restore(JSON.parse(stored)) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The app remains usable when browser storage is unavailable. */ } }, [key, value]);
  useEffect(() => {
    function sync(event: StorageEvent) { if (event.key !== key || event.newValue === null) return; try { const next = restore(JSON.parse(event.newValue)); setValue(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next); } catch { /* Ignore invalid data written by another tab. */ } }
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, [key, restore]);
  return [value, setValue] as const;
}

function useNarraState() {
  const { activeAccount, storageKey } = useAccounts();
  const [today, setToday] = useState(localDateKey);
  useEffect(() => { const timer = window.setInterval(() => setToday(localDateKey()), 60_000); return () => window.clearInterval(timer); }, []);
  const [profile, setProfile] = useStored(storageKey('narra-profile-v1'), { ...defaultProfile, name: activeAccount.name }, restoreProfile);
  const [stats, setStats] = useStored(storageKey('narra-stats-v1'), activeAccount.id === 'primary' ? defaultStats : { ...defaultStats, minutes: 0, conversations: 0, speakingTries: 0, completed: [] }, restoreStats);
  const [words, setWords] = useStored<Word[]>(storageKey('narra-words-v1'), activeAccount.id === 'primary' ? initialWords : [], restoreWords);
  const [tab, setTab] = useState<Tab>(() => {
    const name = location.hash.slice(1).split('?')[0];
    const legacy: Record<string, Tab> = { learn: 'Lesson', words: 'Dictionary', progress: 'Profile' };
    return legacy[name] ?? (['Lesson', 'Practice', 'Dictionary', 'Profile'] as Tab[]).find(t => t.toLowerCase() === name) ?? 'Lesson';
  });
  const [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  function navigate(next: Tab) { setTab(next); history.replaceState(null, '', `#${next.toLowerCase()}`); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function logActivity(label: string, minutes = 1, score?: number) {
    const today = localDateKey();
    setStats(s => ({ ...s, minutes: s.minutes + minutes, activity: [{ date: today, label, minutes, score }, ...s.activity] }));
  }
  return { profile, setProfile, stats, setStats, words, setWords, tab, navigate, toast, notify: setToast, logActivity, today };
}
const Context = createContext<ReturnType<typeof useNarraState> | null>(null);
export function NarraProvider({ children }: { children: ReactNode }) { const value = useNarraState(); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useNarra() { const value = useContext(Context); if (!value) throw new Error('NarraProvider is missing'); return value; }
export function useCopy() { const { profile } = useNarra(); return (english: string, vietnamese: string) => profile.uiLanguage === 'Tiếng Việt' ? vietnamese : english; }

export { speak, cancelSpeech } from './speech';
