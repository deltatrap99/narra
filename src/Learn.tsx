import { useState } from 'react';
import { Check, Clock3, Flame, List, LockKeyhole, Play, Route, Sparkles, Users } from 'lucide-react';
import { chapters, type Lesson } from './data';
import { activityStreak, localDateKey, useCopy, useNarra } from './state';
import PathGraph from './PathGraph';
import './lesson-uat.css';
import { DailyQuests, MotivationStrip } from './Motivation';
import TutorSpotlight from './TutorSpotlight';
import { FocusHero, QuietSection } from './FocusLayout';

type Props = { onGoal: () => void; onLesson: (lesson: Lesson) => void; onTalk: () => void; onWord: () => void; onPractice: () => void; onOpenLeague: () => void; onOpenAchievements: () => void; onTutorPreview: (name: string) => void; onPlans: () => void };

export default function Learn({ onGoal, onLesson, onWord, onPractice, onOpenLeague, onOpenAchievements, onTutorPreview }: Props) {
  const { profile, stats, notify } = useNarra();
  const tr = useCopy();
  const [view, setView] = useState<'List' | 'Journey'>('Journey');
  const allLessons = chapters.flatMap(chapter => chapter.lessons);
  const next = allLessons.find(lesson => !stats.completed.includes(lesson.id)) ?? allLessons[0];
  const nextChapter = chapters.find(chapter => chapter.lessons.some(lesson => lesson.id === next.id))!;
  const unitIndex = chapters.indexOf(nextChapter);
  const completedCount = allLessons.filter(lesson => stats.completed.includes(lesson.id)).length;
  const journeyComplete = completedCount === allLessons.length;
  const minutesToday = stats.activity.filter(activity => activity.date === localDateKey()).reduce((sum, activity) => sum + activity.minutes, 0);
  const streak = activityStreak(stats.activity);
  const recent = allLessons.filter(lesson => stats.completed.includes(lesson.id)).slice(-2).reverse();
  const description = next.id === 'everyday-2'
    ? tr('Talk about the habits that make you feel good.', 'Trò chuyện về những thói quen giúp bạn cảm thấy tốt hơn.')
    : next.id === 'everyday-3' ? tr('Order a coffee and make a little small talk.', 'Gọi một ly cà phê và bắt đầu cuộc trò chuyện ngắn.')
      : tr("A short conversation, one little step forward!", "Một cuộc trò chuyện ngắn, thêm một bước tiến nhỏ!");
  function openLesson(lesson: Lesson, available: boolean) {
    if (available || stats.completed.includes(lesson.id)) onLesson(lesson);
    else notify(tr('One little step first: finish the previous lesson, then this one will open.', 'Bạn học xong bài trước nhé, rồi mình sẽ mở được bài này.'));
  }
  return <div className="learn-page lesson-uat focus-page">
    <FocusHero eyebrow={journeyComplete ? tr('A LITTLE REVISIT', 'MÌNH ÔN LẠI MỘT CHÚT') : tr('TODAY’S LITTLE LESSON', 'BÀI HỌC NHỎ HÔM NAY')} title={next.title} description={description} action={journeyComplete ? tr('Revisit with Buddy', 'Ôn lại cùng Buddy') : tr('Continue with Buddy', 'Học tiếp cùng Buddy')} onAction={() => onLesson(next)} mood={minutesToday >= profile.dailyGoal ? 'proud' : 'welcome'} meta={<><Clock3 size={15} /><span>{next.minutes} {tr('min', 'phút')}</span><span className="focus-meta-dot">·</span><span>{tr('Unit', 'Chủ đề')} {unitIndex + 1}</span></>} />
    <div className="focus-daily-row" aria-label={tr('Today’s progress', 'Tiến độ hôm nay')}><button type="button" onClick={onGoal} aria-label={tr('Today’s minutes, change daily goal', 'Số phút hôm nay, đổi mục tiêu học')}><Clock3 size={17} /><span>{minutesToday}/{profile.dailyGoal} {tr('min today', 'phút hôm nay')}</span></button><button type="button" onClick={onOpenAchievements}><Flame size={17} /><span>{streak} {tr('day streak', 'ngày liên tiếp')}</span></button></div>
    <div className="focus-disclosures">
    <QuietSection icon={<Route size={20} />} title={tr('My learning path', 'Lộ trình của mình')} summary={tr(`${completedCount}/${allLessons.length} lessons`, `${completedCount}/${allLessons.length} bài học`)}>
    {recent.length > 0 && <section className="lesson-recent"><h2>{tr('Keep it fresh', 'Ôn lại một chút')}</h2><div>{recent.map(lesson => <button key={lesson.id} onClick={() => onLesson(lesson)}><span className="lesson-recent-check"><Check size={15} /></span><span>{lesson.title}</span><small>{tr('Revisit', 'Ôn lại')}</small></button>)}</div></section>}
    <section className="learning-path" id="learning-path">
      <div className="page-intro"><h2 className="section-title">{tr('Your learning path', 'Lộ trình bài học')}</h2><p className="page-description">{tr("Choose a topic and tap a stop, and Buddy will meet you there.", "Bạn chọn chủ đề rồi chạm vào một bài nhé, Buddy sẽ ghé cùng bạn nè.")}</p></div>
      <div className="path-progress"><div className="progress-track"><span style={{ width: `${completedCount / allLessons.length * 100}%` }} /></div><span>{completedCount}/{allLessons.length} {tr('complete', 'đã hoàn thành')}</span></div>
      <div className="view-row"><span className="eyebrow muted">{tr('Explore', 'Cùng khám phá')}</span><div className="view-options"><button type="button" className={`pill-button ${view === 'Journey' ? 'active' : ''}`} onClick={() => setView('Journey')} aria-pressed={view === 'Journey'}><Route size={19} />{tr('Roadmap', 'Bản đồ')}</button><button type="button" className={`pill-button ${view === 'List' ? 'active' : ''}`} onClick={() => setView('List')} aria-pressed={view === 'List'}><List size={19} />{tr('List', 'Danh sách')}</button></div></div>
      {view === 'List' ? <div className="chapters-grid">{chapters.map(chapter => {
        const done = chapter.lessons.filter(lesson => stats.completed.includes(lesson.id)).length;
        return <section className="card chapter-card" key={chapter.id}><div className="chapter-heading"><div><h3>{chapter.title}</h3><p>{chapter.description}</p></div><span className={`chapter-count tone-${chapter.tone}`}>{done}/{chapter.lessons.length}</span></div><div className="lesson-list">{chapter.lessons.map((lesson, index) => {
          const completed = stats.completed.includes(lesson.id);
          const available = index === 0 || stats.completed.includes(chapter.lessons[index - 1].id);
          const current = lesson.id === next.id;
          return <button key={lesson.id} className={`lesson-row tone-${chapter.tone} ${completed ? 'completed' : ''} ${current ? 'current' : ''} ${!available ? 'locked' : ''}`} onClick={() => openLesson(lesson, available)} aria-disabled={!available && !completed} aria-label={`${lesson.title}, ${lesson.minutes} ${tr('minutes', 'phút')}${!available && !completed ? tr(', locked', ', chưa mở khóa') : ''}`}><span className={`lesson-symbol ${completed ? 'done' : ''}`}>{completed ? <Check size={18} /> : available ? <Play size={13} fill="currentColor" /> : <LockKeyhole size={21} />}</span><span className="lesson-name">{lesson.title}</span><span className="lesson-minutes">{lesson.minutes} {tr('min', 'phút')}</span></button>;
        })}</div></section>;
      })}</div> : <PathGraph chapters={chapters} completed={stats.completed} nextId={next.id} onLesson={openLesson} />}
    </section>
    </QuietSection>
    <QuietSection icon={<Users size={20} />} title={tr('My learning companion', 'Người bạn đồng hành')} summary={profile.tutor}><TutorSpotlight compact onPreview={onTutorPreview} /></QuietSection>
    <QuietSection icon={<Sparkles size={20} />} title={tr('My little wins', 'Những niềm vui nhỏ')} summary={tr('Quests & friends', 'Nhiệm vụ & bạn bè')}><MotivationStrip onOpenLeague={onOpenLeague} onOpenAchievements={onOpenAchievements} /><DailyQuests onLesson={() => onLesson(next)} onDictionary={onWord} onPractice={onPractice} /></QuietSection>
    </div>
  </div>;
}
