import { useState } from 'react';
import { Check, ChevronRight, Flame, GitFork, List, LockKeyhole, Mic, Play, Sparkles, Sun } from 'lucide-react';
import { chapters, type Lesson } from './data';
import { activityStreak, localDateKey, useNarra } from './state';
import { Art, Avatar } from './ui';
import PathGraph from './PathGraph';

export default function Learn({ onGoal, onLesson, onTalk, onWord }: { onGoal: () => void; onLesson: (lesson: Lesson) => void; onTalk: () => void; onWord: () => void }) {
  const { profile, stats, notify } = useNarra();
  const [view, setView] = useState<'List' | 'Graph'>('List');
  const allLessons = chapters.flatMap(c => c.lessons);
  const next = allLessons.find(l => !stats.completed.includes(l.id)) ?? allLessons[0];
  const nextChapter = chapters.find(c => c.lessons.some(l => l.id === next.id))!;
  const nextDescription = next.id === 'everyday-2' ? 'Talk about the habits that make you feel good.' : next.id === 'everyday-3' ? 'Order a coffee and make a little small talk.' : nextChapter.description;
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Bangkok' }).format(new Date());
  const todayKey = localDateKey();
  const minutesToday = stats.activity.filter(a => a.date === todayKey).reduce((n, a) => n + a.minutes, 0);
  const streak = activityStreak(stats.activity);
  function openLesson(lesson: Lesson, available: boolean) { if (available || stats.completed.includes(lesson.id)) onLesson(lesson); else notify('Complete the previous lesson to unlock this one.'); }
  return <div className="learn-page">
    <section className="greeting"><p className="date-line">{today}</p><div className="greeting-title"><h1>Good to see you, {profile.name}</h1><Sun className="greeting-sun" strokeWidth={1.6} /></div><p className="page-description">A little closer to the English-speaking you.</p></section>
    <div className="home-top-grid">
      <section className="card daily-goal" aria-label="Today's learning goal">
        <div className="goal-ring" style={{ '--progress': `${Math.min(100, minutesToday / profile.dailyGoal * 100)}%` } as React.CSSProperties}><div><strong>{minutesToday}</strong><span>of {profile.dailyGoal} min</span></div></div>
        <div><h2>Today’s goal</h2><p className="streak-line"><Flame size={22} fill="currentColor" /> {streak}-day streak</p><button className="text-button" onClick={onGoal}>Change goal</button></div>
      </section>
      <section className={`continue-card tone-${nextChapter.tone}`}>
        <div className="continue-copy"><p className="eyebrow purple">Continue · {nextChapter.title}</p><h2>{next.title}</h2><p>{nextDescription}</p><button className="primary-button" onClick={() => onLesson(next)}><Play size={18} fill="currentColor" /> Start lesson</button></div><img src="/brand/mascot.webp" alt="" className="art hero-plant brand-mascot" />
      </section>
    </div>
    <div className="home-support-grid">
      <button className="card tutor-card" onClick={onTalk}><Avatar name={profile.tutor} /><div><h2>Talk with {profile.tutor}</h2><p>{profile.tutor === 'Skye' ? 'Your biggest cheerleader. Turn everyday conversations into little wins.' : 'Find your voice with relaxed conversations and a little extra encouragement.'}</p></div><span className="mic-circle"><Mic size={25} /></span></button>
      <button className="word-of-day tone-yellow" onClick={onWord}><p className="eyebrow">Word of the day</p><h2>reservation</h2><p>an arrangement to keep a place for you</p><p className="muted">“I have a reservation for two nights.”</p></button>
    </div>
    <section className="learning-path" id="learning-path">
      <div className="page-intro"><h2 className="section-title">Your path</h2><p className="page-description">Explore the lessons at your own pace.</p></div>
      <div className="path-progress"><div className="progress-track"><span style={{ width: `${stats.completed.length / allLessons.length * 100}%` }} /></div><span>{stats.completed.length} of {allLessons.length} complete</span></div>
      <div className="view-row"><span className="eyebrow muted">View</span><div className="view-options"><button className={`pill-button ${view === 'List' ? 'active' : ''}`} onClick={() => setView('List')} aria-pressed={view === 'List'}><List size={19} />List</button><button className={`pill-button ${view === 'Graph' ? 'active' : ''}`} onClick={() => setView('Graph')} aria-pressed={view === 'Graph'}><GitFork size={19} />Graph</button></div></div>
      <button className="up-next tone-lavender" onClick={() => onLesson(next)}><Sparkles size={23} fill="currentColor" /><span>Up next: {next.title}</span><strong>Continue</strong><ChevronRight size={20} className="mobile-chevron" /></button>
      {view === 'List' ? <div className="chapters-grid">{chapters.map(chapter => {
        const done = chapter.lessons.filter(l => stats.completed.includes(l.id)).length;
        return <section className="card chapter-card" key={chapter.id}><div className="chapter-heading"><div><h3>{chapter.title}</h3><p>{chapter.description}</p></div><span className={`chapter-count tone-${chapter.tone}`}>{done}/3</span></div><div className="lesson-list">{chapter.lessons.map((lesson, i) => {
          const completed = stats.completed.includes(lesson.id); const available = i === 0 || stats.completed.includes(chapter.lessons[i - 1].id); const current = lesson.id === next.id;
          return <button key={lesson.id} className={`lesson-row tone-${chapter.tone} ${completed ? 'completed' : ''} ${current ? 'current' : ''} ${!available ? 'locked' : ''}`} onClick={() => openLesson(lesson, available)} aria-disabled={!available && !completed} aria-label={`${lesson.title}, ${lesson.minutes} minutes${!available && !completed ? ', locked' : ''}`}><span className={`lesson-symbol ${completed ? 'done' : ''}`}>{completed ? <Check size={18} /> : available ? <Play size={13} fill="currentColor" /> : <LockKeyhole size={21} />}</span><span className="lesson-name">{lesson.title}</span><span className="lesson-minutes">{lesson.minutes} min</span></button>;
        })}</div></section>;
      })}</div> : <PathGraph chapters={chapters} completed={stats.completed} nextId={next.id} onLesson={openLesson} />}
    </section>
  </div>;
}
