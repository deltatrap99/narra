import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, Plus, Sparkles, Zap } from 'lucide-react';
import { chapters, type Lesson, type Scenario } from './data';
import { useCopy, useNarra, type Tab } from './state';
import { Avatar } from './ui';
import Learn from './Learn';
import Practice from './Practice';
import Words, { AddWordDialog } from './Words';
import Profile from './Profile';
import Tutors from './Tutors';
import MyWords from './MyWords';
import Conversation from './Conversation';
import WordWorkout from './WordWorkout';
import LessonPreparation from './LessonPreparation';
import LaunchScreen from './LaunchScreen';
import CommunityHub from './CommunityHub';
import { AvatarStudio, PlansPanel, ShareProfile } from './PlayerExtras';
import { usePlayer } from './game';
import LanguageSwitch from './LanguageSwitch';
import { CreateDialog, FlashcardsDialog, GoalDialog, SpeakingDialog, WritingDialog } from './Sessions';

type CommunitySection = 'league' | 'friends' | 'feed' | 'achievements';
type Overlay = { kind: 'goal' | 'tutors' | 'pronunciation' | 'word-pronunciation' | 'workout' | 'shadowing' | 'writing' | 'create' | 'add' | 'talk' | 'avatar' | 'plans' | 'share' } | { kind: 'lesson' | 'lesson-speaking'; lesson: Lesson } | { kind: 'scenario'; scenario: Scenario } | { kind: 'flashcards'; collection?: string } | { kind: 'community'; section: CommunitySection };
const tabs: Tab[] = ['Lesson', 'Practice', 'Dictionary', 'Profile'];

function NavIcon({ tab }: { tab: Tab }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">{tab === 'Lesson' ? <><path d="M2 14.5 16 3l14 11.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 14 16 5.5 26.5 14v15h-21z" fill="currentColor" /><rect x="12.5" y="19" width="7" height="10" rx=".8" className="icon-cutout" /></> : tab === 'Practice' ? <><path d="M3 3h17a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H9l-5 5v-6a5 5 0 0 1-5-5V8a5 5 0 0 1 4-5" transform="translate(2 0) scale(.9)" fill="currentColor" /><path d="M15 10h13a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-1v4l-6-4h-6a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4" fill="currentColor" stroke="var(--surface)" strokeWidth="1.5" /></> : tab === 'Dictionary' ? <><path d="M9 3h17v23H9a4 4 0 0 0 0 4h17M8 3a4 4 0 0 0-4 4v19a4 4 0 0 0 4 4" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M8 5v20m5-15h9m-9 5h7" stroke="var(--surface)" strokeWidth="1.7" strokeLinecap="round" /></> : <><circle cx="16" cy="16" r="14" fill="currentColor" /><circle cx="16" cy="12" r="5" className="icon-cutout" /><path d="M6.5 25a10 8 0 0 1 19 0 13 13 0 0 1-19 0" className="icon-cutout" /></>}</svg>;
}

export default function App() {
  const { tab, navigate, profile, toast } = useNarra();
  const { xp } = usePlayer();
  const tr = useCopy();
  const labels: Record<Tab, string> = { Lesson: tr('Lesson', 'Bài học'), Practice: tr('Practice', 'Luyện nói'), Dictionary: tr('Dictionary', 'Từ điển'), Profile: tr('Profile', 'Hồ sơ') };
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [communityExtra, setCommunityExtra] = useState<'share' | 'plans' | null>(null);
  const communityExtraRef = useRef(communityExtra); communityExtraRef.current = communityExtra;
  const communityTrigger = useRef<HTMLElement | null>(null);
  const openCommunityExtra = (kind: 'share' | 'plans') => { communityTrigger.current = document.activeElement as HTMLElement | null; setCommunityExtra(kind); };
  const closeCommunityExtra = () => { setCommunityExtra(null); requestAnimationFrame(() => { if (communityTrigger.current?.isConnected) communityTrigger.current.focus({ preventScroll: true }); }); };
  const [launching, setLaunching] = useState(() => { try { return sessionStorage.getItem('narra-launch-v2') !== 'seen'; } catch { return true; } });
  const finishLaunch = useCallback(() => { try { sessionStorage.setItem('narra-launch-v2', 'seen'); } catch { /* Opening remains available without storage. */ } setLaunching(false); }, []);
  const [dark, setDark] = useState(() => profile.theme === 'dark' || profile.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => { document.documentElement.lang = profile.uiLanguage === 'Tiếng Việt' ? 'vi' : 'en'; }, [profile.uiLanguage]);
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'); const apply = () => { const next = profile.theme === 'dark' || profile.theme === 'system' && media.matches; setDark(next); document.documentElement.dataset.theme = next ? 'dark' : 'light'; document.documentElement.style.colorScheme = next ? 'dark' : 'light'; }; apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply); }, [profile.theme]);
  useEffect(() => { const replay = () => { setOverlay(null); navigate('Lesson'); setLaunching(true); }; window.addEventListener('narra:replay-intro', replay); return () => window.removeEventListener('narra:replay-intro', replay); }, []);
  const close = () => { setCommunityExtra(null); setOverlay(null); }; const talk = () => setOverlay({ kind: 'talk' });
  const community = (section: CommunitySection) => setOverlay({ kind: 'community', section });
  const subpage = overlay?.kind === 'tutors' || overlay?.kind === 'word-pronunciation' || overlay?.kind === 'workout' || overlay?.kind === 'community' || overlay?.kind === 'avatar' || overlay?.kind === 'plans';
  function lessonScenario(lesson: Lesson): Scenario { const chapter = chapters.find(c => c.lessons.some(l => l.id === lesson.id))!; return { id: `lesson-${lesson.id}`, title: lesson.title, description: chapter.description, type: 'Roleplay', level: profile.level, minutes: lesson.minutes, tone: chapter.tone, asset: 'plant.webp' }; }
  function nextLesson(lesson: Lesson) { const all = chapters.flatMap(c => c.lessons); const next = all[all.findIndex(l => l.id === lesson.id) + 1]; if (next) setOverlay({ kind: 'lesson', lesson: next }); else close(); }
  return <><div className={`app app-refined ${tab === 'Profile' ? 'profile-background' : ''}`} inert={launching}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar" inert={subpage}><div className="topbar-inner"><button className="brand" onClick={() => navigate('Lesson')} aria-label="Narra home"><img src={`/brand/logo-${dark ? 'light' : 'dark'}.webp`} alt="Narra" /></button><span className="topbar-title">{labels[tab]}</span><div className="topbar-actions"><LanguageSwitch />{tab === 'Dictionary' ? <button className="device-button purple" aria-label={tr('Add a word', 'Thêm từ mới')} onClick={() => setOverlay({ kind: 'add' })}><Plus size={26} /></button> : <button className="header-xp" onClick={() => community('league')} aria-label={tr(`Your league, ${xp} XP`, `Giải đấu của bạn, ${xp} XP`)}><Zap size={17} fill="currentColor"/><strong>{xp}</strong><span>XP</span></button>}</div></div></header>
    <main id="main" className="main-content" key={tab} inert={subpage}>
      {tab === 'Lesson' && <Learn onGoal={() => setOverlay({ kind: 'goal' })} onLesson={lesson => setOverlay({ kind: 'lesson', lesson })} onTalk={talk} onWord={() => navigate('Dictionary')} onPractice={() => navigate('Practice')} onOpenLeague={() => community('league')} onOpenAchievements={() => community('achievements')} />}
      {tab === 'Practice' && <Practice onTutors={() => setOverlay({ kind: 'tutors' })} onScenario={scenario => setOverlay({ kind: 'scenario', scenario })} onCreate={() => setOverlay({ kind: 'create' })} onTalk={talk} />}
      {tab === 'Dictionary' && <Words onReview={collection => setOverlay(collection === 'due' ? { kind: 'workout' } : { kind: 'flashcards', collection })} onPronunciation={() => setOverlay({ kind: 'word-pronunciation' })} onShadowing={() => setOverlay({ kind: 'shadowing' })} onReadAloud={() => setOverlay({ kind: 'pronunciation' })} onWriting={() => setOverlay({ kind: 'writing' })} />}
      {tab === 'Profile' && <Profile onTutors={() => setOverlay({ kind: 'tutors' })} onWriting={() => setOverlay({ kind: 'writing' })} onLesson={() => navigate('Lesson')} onLeague={() => community('league')} onFriends={() => community('friends')} onFeed={() => community('feed')} onAchievements={() => community('achievements')} onAvatar={() => setOverlay({ kind: 'avatar' })} onPlans={() => setOverlay({ kind: 'plans' })} onShare={() => setOverlay({ kind: 'share' })} />}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation" style={{ '--active-index': tabs.indexOf(tab) } as CSSProperties}>{tabs.map(t => <button key={t} className={`nav-item ${tab === t ? 'active' : ''}`} onClick={() => { close(); navigate(t); }} aria-current={tab === t ? 'page' : undefined}><NavIcon tab={t} /><span>{labels[t]}</span></button>)}</nav>
    <div className="desktop-signoff"><Sparkles size={12} /><span>Your voice. Your story.</span></div>
    {toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}
    {overlay?.kind === 'goal' && <GoalDialog onClose={close} />}
    {overlay?.kind === 'lesson' && <LessonPreparation lesson={overlay.lesson} onClose={close} onStart={() => setOverlay({ kind: 'lesson-speaking', lesson: overlay.lesson })} />}
    {overlay?.kind === 'lesson-speaking' && <Conversation scenario={lessonScenario(overlay.lesson)} lesson={overlay.lesson} onClose={close} onNextLesson={() => nextLesson(overlay.lesson)} onReview={() => { close(); navigate('Dictionary'); }} />}
    {overlay?.kind === 'tutors' && <Tutors onClose={close} onTalk={talk} />}
    {overlay?.kind === 'word-pronunciation' && <MyWords onClose={close} />}
    {overlay?.kind === 'workout' && <WordWorkout onClose={close} />}
    {overlay?.kind === 'flashcards' && <FlashcardsDialog collection={overlay.collection} onClose={close} />}
    {(overlay?.kind === 'pronunciation' || overlay?.kind === 'shadowing') && <SpeakingDialog shadowing={overlay.kind === 'shadowing'} onClose={close} />}
    {overlay?.kind === 'writing' && <WritingDialog onClose={close} />}
    {overlay?.kind === 'talk' && <Conversation onClose={close} />}
    {overlay?.kind === 'scenario' && <Conversation scenario={overlay.scenario} onClose={close} />}
    {overlay?.kind === 'create' && <CreateDialog onClose={close} onCreate={scenario => setOverlay({ kind: 'scenario', scenario })} />}
    {overlay?.kind === 'add' && <AddWordDialog onClose={close} />}
    {overlay?.kind === 'community' && <div inert={communityExtra !== null}><CommunityHub section={overlay.section} onClose={() => { if (!communityExtraRef.current) close(); }} onLesson={() => { close(); navigate('Lesson'); }} onShare={() => openCommunityExtra('share')} onPlans={() => openCommunityExtra('plans')} /></div>}
    {overlay?.kind === 'avatar' && <AvatarStudio onClose={close} />}
    {overlay?.kind === 'plans' && <PlansPanel onClose={close} />}
    {overlay?.kind === 'share' && <ShareProfile onClose={close} />}
    {communityExtra === 'share' && <ShareProfile onClose={closeCommunityExtra} />}
    {communityExtra === 'plans' && <PlansPanel onClose={closeCommunityExtra} />}
  </div>{launching && <LaunchScreen onDone={finishLaunch} />}</>;
}
