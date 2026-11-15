import { useState } from 'react';
import { Check, Monitor, Plus, Smartphone, Sparkles } from 'lucide-react';
import { type Lesson, type Scenario } from './data';
import { useNarra, type Tab } from './state';
import { Avatar } from './ui';
import Learn from './Learn';
import Practice from './Practice';
import Words, { AddWordDialog } from './Words';
import Progress from './Progress';
import Profile from './Profile';
import Tutors from './Tutors';
import MyWords from './MyWords';
import Conversation from './Conversation';
import WordWorkout from './WordWorkout';
import { CreateDialog, FlashcardsDialog, GoalDialog, LessonDialog, SpeakingDialog, WritingDialog } from './Sessions';

type Overlay = { kind: 'goal' | 'tutors' | 'pronunciation' | 'word-pronunciation' | 'workout' | 'shadowing' | 'writing' | 'create' | 'add' | 'talk' } | { kind: 'lesson'; lesson: Lesson } | { kind: 'scenario'; scenario: Scenario } | { kind: 'flashcards'; collection?: string };
const tabs: Tab[] = ['Learn', 'Practice', 'Words', 'Progress', 'Profile'];

function NavIcon({ tab }: { tab: Tab }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">{tab === 'Learn' ? <><path d="M2 14.5 16 3l14 11.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 14 16 5.5 26.5 14v15h-21z" fill="currentColor" /><rect x="12.5" y="19" width="7" height="10" rx=".8" className="icon-cutout" /></> : tab === 'Practice' ? <><path d="M3 3h17a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H9l-5 5v-6a5 5 0 0 1-5-5V8a5 5 0 0 1 4-5" transform="translate(2 0) scale(.9)" fill="currentColor" /><path d="M15 10h13a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-1v4l-6-4h-6a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4" fill="currentColor" stroke="var(--surface)" strokeWidth="1.5" /></> : tab === 'Words' ? <><path d="M9 3h17v23H9a4 4 0 0 0 0 4h17M8 3a4 4 0 0 0-4 4v19a4 4 0 0 0 4 4" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M8 5v20m5-15h9m-9 5h7" stroke="var(--surface)" strokeWidth="1.7" strokeLinecap="round" /></> : tab === 'Progress' ? <><rect x="2" y="13" width="7.5" height="17" rx="2.2" fill="currentColor" /><rect x="12.2" y="8" width="7.5" height="22" rx="2.2" fill="currentColor" /><rect x="22.5" y="3" width="7.5" height="27" rx="2.2" fill="currentColor" /></> : <><circle cx="16" cy="16" r="14" fill="currentColor" /><circle cx="16" cy="12" r="5" className="icon-cutout" /><path d="M6.5 25a10 8 0 0 1 19 0 13 13 0 0 1-19 0" className="icon-cutout" /></>}</svg>;
}

export default function App() {
  const { tab, navigate, profile, stats, words, toast } = useNarra();
  const [overlay, setOverlay] = useState<Overlay | null>(null); const [compact, setCompact] = useState(false);
  const close = () => setOverlay(null); const talk = () => setOverlay({ kind: 'talk' });
  const subpage = overlay?.kind === 'tutors' || overlay?.kind === 'word-pronunciation';
  return <div className={`app ${compact ? 'compact' : ''} ${tab === 'Profile' ? 'profile-background' : ''}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar" inert={subpage}><div className="topbar-inner"><button className="brand" onClick={() => navigate('Learn')} aria-label="Narra home"><img src="/brand/logo-dark.webp" alt="Narra" /></button><span className="topbar-title">{tab}</span><div className="topbar-actions">{tab === 'Learn' ? <button className="device-button" aria-label={compact ? 'Switch to desktop view' : 'Switch to mobile view'} title={compact ? 'Desktop view' : 'Mobile view'} onClick={() => setCompact(v => !v)}>{compact ? <Monitor size={21} /> : <Smartphone size={21} />}</button> : tab === 'Words' ? <button className="device-button purple" aria-label="Add a word" onClick={() => setOverlay({ kind: 'add' })}><Plus size={26} /></button> : <button className="header-profile" aria-label="Open profile" onClick={() => navigate('Profile')}><span>{profile.name}</span><Avatar /></button>}</div></div></header>
    <main id="main" className="main-content" key={tab} inert={subpage}>
      {tab === 'Learn' && <Learn onGoal={() => setOverlay({ kind: 'goal' })} onLesson={lesson => setOverlay({ kind: 'lesson', lesson })} onTalk={talk} onWord={() => navigate('Words')} />}
      {tab === 'Practice' && <Practice onWriting={() => setOverlay({ kind: 'writing' })} onPronunciation={() => setOverlay({ kind: 'pronunciation' })} onShadowing={() => setOverlay({ kind: 'shadowing' })} onTutors={() => setOverlay({ kind: 'tutors' })} onScenario={scenario => setOverlay({ kind: 'scenario', scenario })} onCreate={() => setOverlay({ kind: 'create' })} />}
      {tab === 'Words' && <Words onReview={collection => setOverlay(collection === 'due' ? { kind: 'workout' } : { kind: 'flashcards', collection })} onPronunciation={() => setOverlay({ kind: 'word-pronunciation' })} />}
      {tab === 'Progress' && <Progress stats={stats} words={words} onWriting={() => setOverlay({ kind: 'writing' })} />}
      {tab === 'Profile' && <Profile onTutors={() => setOverlay({ kind: 'tutors' })} />}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">{tabs.map(t => <button key={t} className={`nav-item ${tab === t ? 'active' : ''}`} onClick={() => { close(); navigate(t); }} aria-current={tab === t ? 'page' : undefined}><NavIcon tab={t} /><span>{t}</span></button>)}</nav>
    <div className="desktop-signoff"><Sparkles size={12} /><span>Your voice. Your story.</span></div>
    {toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}
    {overlay?.kind === 'goal' && <GoalDialog onClose={close} />}
    {overlay?.kind === 'lesson' && <LessonDialog lesson={overlay.lesson} onClose={close} />}
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
  </div>;
}
