import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { chapters, scenarios } from './data';
import { localDateKey, useNarra } from './state';

export type Appearance = { skin: string; hair: string; hairStyle: 'swoop' | 'curly' | 'short'; shirt: string; accessory: 'none' | 'glasses' | 'headphones' };
export type Player = { handle: string; friendIds: string[]; likedPosts: string[]; dismissedFriends: string[]; appearance: Appearance; planInterest: 'free' | 'plus' | 'family'; shareId: string };
export type DailyMission = { id: 'say-practice' | 'review-words' | 'daily-goal'; title: string; titleVi: string; progress: number; target: number; xp: number };
export type Achievement = { id: string; title: string; titleVi: string; description: string; descriptionVi: string; unlocked: boolean; progress: number; target: number; icon: 'talk' | 'word' | 'streak' | 'lesson' };
const defaultAppearance: Appearance = { skin: '#edb69b', hair: '#25313b', hairStyle: 'swoop', shirt: '#6dd9ff', accessory: 'none' };
function readPlayer(fallback: Player): Player {
  try { const value: unknown = JSON.parse(localStorage.getItem('narra-player-v1') ?? 'null'); if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
    const raw = value as Record<string, unknown>; const result = { ...fallback, appearance: { ...defaultAppearance } };
    for (const key of ['handle', 'shareId'] as const) if (typeof raw[key] === 'string' && raw[key].length > 0) result[key] = raw[key].slice(0, 50);
    for (const key of ['friendIds', 'likedPosts', 'dismissedFriends'] as const) if (Array.isArray(raw[key])) result[key] = raw[key].filter((v): v is string => typeof v === 'string').slice(0, 100);
    if (['free', 'plus', 'family'].includes(String(raw.planInterest))) result.planInterest = raw.planInterest as Player['planInterest'];
    if (raw.appearance && typeof raw.appearance === 'object') { const art = raw.appearance as Record<string, unknown>; for (const key of ['skin', 'hair', 'shirt'] as const) if (typeof art[key] === 'string' && /^#[\da-f]{6}$/i.test(art[key])) result.appearance[key] = art[key]; if (['swoop', 'curly', 'short'].includes(String(art.hairStyle))) result.appearance.hairStyle = art.hairStyle as Appearance['hairStyle']; if (['none', 'glasses', 'headphones'].includes(String(art.accessory))) result.appearance.accessory = art.accessory as Appearance['accessory']; }
    return result;
  } catch { return fallback; }
}
const lessonNames = new Set(chapters.flatMap(c => c.lessons.map(l => l.title)));
const scenarioNames = new Set(scenarios.map(s => s.title));
const isConversation = (label: string) => lessonNames.has(label) || scenarioNames.has(label) || /^(Conversation with|Practice ·)/.test(label);
function bestHistoricalStreak(dates: string[]) {
  let best = 0;
  let current = 0;
  let previous = Number.NEGATIVE_INFINITY;
  for (const date of [...new Set(dates)].sort()) {
    const day = Date.parse(`${date}T00:00:00Z`) / 86400000;
    if (!Number.isFinite(day)) continue;
    current = day === previous + 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return best;
}
function usePlayerState() {
  const { stats, words, profile } = useNarra();
  const [player, setPlayer] = useState<Player>(() => readPlayer({ handle: `narra_${profile.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/[^a-z0-9]/gi, '').toLowerCase()}`, friendIds: [], likedPosts: [], dismissedFriends: [], appearance: defaultAppearance, planInterest: 'free', shareId: crypto.randomUUID().slice(0, 8) }));
  useEffect(() => { try { localStorage.setItem('narra-player-v1', JSON.stringify(player)); } catch { /* Local play remains available without storage. */ } }, [player]);
  useEffect(() => { const sync = (event: StorageEvent) => { if (event.key === 'narra-player-v1' && event.newValue) setPlayer(current => { const next = readPlayer(current); return JSON.stringify(next) === JSON.stringify(current) ? current : next; }); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);
  const today = stats.activity.filter(a => a.date === localDateKey());
  const dailyMissions: DailyMission[] = [
    { id: 'say-practice', title: 'Have one real conversation', titleVi: 'Hoàn thành một cuộc hội thoại', progress: today.filter(a => isConversation(a.label)).length, target: 1, xp: 15 },
    { id: 'review-words', title: 'Complete five word reviews', titleVi: 'Ôn lại năm lượt từ vựng', progress: today.filter(a => /^Word review ·/.test(a.label)).length, target: 5, xp: 10 },
    { id: 'daily-goal', title: 'Make five minutes for you', titleVi: 'Dành năm phút cho tiếng Anh', progress: today.reduce((sum, a) => sum + a.minutes, 0), target: 5, xp: 20 },
  ];
  const dates = [...new Set(stats.activity.map(a => a.date))];
  const missionXP = dates.reduce((sum, date) => { const rows = stats.activity.filter(a => a.date === date); return sum + (rows.some(a => isConversation(a.label)) ? 15 : 0) + (rows.filter(a => /^Word review ·/.test(a.label)).length >= 5 ? 10 : 0) + (rows.reduce((n, a) => n + a.minutes, 0) >= 5 ? 20 : 0); }, 0);
  const xp = stats.completed.filter(id => chapters.some(c => c.lessons.some(l => l.id === id))).length * 30 + stats.reviews * 5 + stats.conversations * 20 + stats.speakingTries * 2 + missionXP;
  const level = Math.floor(xp / 150) + 1;
  const criteria = [
    { id: 'first-conversation', title: 'Found your voice', titleVi: 'Cất tiếng tự tin', description: 'Complete your first conversation.', descriptionVi: 'Hoàn thành cuộc hội thoại đầu tiên.', progress: stats.conversations, target: 1, icon: 'talk' as const },
    { id: 'word-explorer', title: 'Word explorer', titleVi: 'Nhà khám phá từ vựng', description: 'Keep ten useful words in your Dictionary.', descriptionVi: 'Lưu mười từ hữu ích trong Từ điển.', progress: words.length, target: 10, icon: 'word' as const },
    { id: 'three-day-streak', title: 'A little, every day', titleVi: 'Mỗi ngày một chút', description: 'Build a three-day learning streak.', descriptionVi: 'Duy trì ba ngày học liên tiếp.', progress: bestHistoricalStreak(dates), target: 3, icon: 'streak' as const },
    { id: 'five-lessons', title: 'Your story is growing', titleVi: 'Câu chuyện đang lớn dần', description: 'Complete five lessons on your path.', descriptionVi: 'Hoàn thành năm bài học trong lộ trình.', progress: stats.completed.length, target: 5, icon: 'lesson' as const },
  ];
  const achievements: Achievement[] = criteria.map(item => ({ ...item, unlocked: item.progress >= item.target }));
  return { player, setPlayer, xp, level, dailyMissions, achievements };
}
const PlayerContext = createContext<ReturnType<typeof usePlayerState> | null>(null);
export function PlayerProvider({ children }: { children: ReactNode }) { const value = usePlayerState(); return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>; }
export function usePlayer() { const value = useContext(PlayerContext); if (!value) throw new Error('PlayerProvider is missing'); return value; }
