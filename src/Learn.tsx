import { brandAsset } from './brand-variant';
import { useState } from 'react';
import { Check, Clock3, Flame, GitFork, List, LockKeyhole, Play } from 'lucide-react';
import { chapters, type Lesson } from './data';
import { activityStreak, localDateKey, useCopy, useNarra } from './state';
import PathGraph from './PathGraph';
import './lesson-uat.css';
import { DailyQuests, MotivationStrip } from './Motivation';
import BuddyCoach from './BuddyCoach';
import TutorSpotlight from './TutorSpotlight';

type Props = { onGoal: () => void; onLesson: (lesson: Lesson) => void; onTalk: () => void; onWord: () => void; onPractice: () => void; onOpenLeague: () => void; onOpenAchievements: () => void; onTutorPreview: (name: string) => void };

export default function Learn({ onGoal, onLesson, onWord, onPractice, onOpenLeague, onOpenAchievements, onTutorPreview }: Props) {
  const { profile, stats, notify } = useNarra();
  const tr = useCopy();
  const [view, setView] = useState<'List' | 'Graph'>('List');
  const allLessons = chapters.flatMap(chapter => chapter.lessons);
  const next = allLessons.find(lesson => !stats.completed.includes(lesson.id)) ?? allLessons[0];
  const nextChapter = chapters.find(chapter => chapter.lessons.some(lesson => lesson.id === next.id))!;
  const unitIndex = chapters.indexOf(nextChapter);
  const doneInUnit = nextChapter.lessons.filter(lesson => stats.completed.includes(lesson.id)).length;
  const completedCount = allLessons.filter(lesson => stats.completed.includes(lesson.id)).length;
  const minutesToday = stats.activity.filter(activity => activity.date === localDateKey()).reduce((sum, activity) => sum + activity.minutes, 0);
  const streak = activityStreak(stats.activity);
  const recent = allLessons.filter(lesson => stats.completed.includes(lesson.id)).slice(-2).reverse();
  const description = next.id === 'everyday-2'
    ? tr('Talk about the habits that make you feel good.', 'Trò chuyện về những thói quen giúp bạn cảm thấy tốt hơn.')
    : next.id === 'everyday-3' ? tr('Order a coffee and make a little small talk.', 'Gọi một ly cà phê và bắt đầu cuộc trò chuyện ngắn.')
      : tr('A short conversation. One little step forward.', 'Một cuộc trò chuyện ngắn. Thêm một bước tiến nhỏ.');
  function openLesson(lesson: Lesson, available: boolean) {
    if (available || stats.completed.includes(lesson.id)) onLesson(lesson);
    else notify(tr('One little step first: finish the previous lesson, then this one will open.', 'Bạn học xong bài trước nhé, rồi mình sẽ mở được bài này.'));
  }
  return <div className="learn-page lesson-uat">
    <header className="lesson-greeting"><p className="eyebrow">{tr('Your next little win', 'Bước tiến nhỏ tiếp theo')}</p><h1>{tr('Let’s keep going', 'Cùng học tiếp nhé')}, {profile.name}.</h1></header>
    <section className="lesson-focus-card" aria-labelledby="next-lesson-title">
      <div className="lesson-focus-top"><div className="lesson-focus-copy"><p className="lesson-unit-label">{tr('Unit', 'Chủ đề')} {String(unitIndex + 1).padStart(2, '0')}: {nextChapter.title}</p><h2 id="next-lesson-title">{next.title}</h2><p className="lesson-focus-description">{description}</p><span className="lesson-focus-meta"><Clock3 size={15} />{next.minutes} {tr('min', 'phút')}<span aria-hidden="true">·</span>{profile.level}<span aria-hidden="true">·</span>{tr('Speaking lesson', 'Bài luyện nói')}</span></div><img src={brandAsset('mascot.webp')} alt="" className="lesson-buddy" /></div>
      <button className="lesson-focus-cta primary-button" onClick={() => onLesson(next)}><Play size={19} fill="currentColor" />{doneInUnit ? tr('Continue lesson', 'Học tiếp bài này') : tr('Start lesson', 'Bắt đầu bài học')}</button>
      <div className="lesson-unit-progress"><span>{tr('This unit', 'Chủ đề này')}</span><div className="progress-track" role="progressbar" aria-label={tr('Current unit progress', 'Tiến độ chủ đề hiện tại')} aria-valuemin={0} aria-valuemax={nextChapter.lessons.length} aria-valuenow={doneInUnit}><span style={{ width: `${doneInUnit / nextChapter.lessons.length * 100}%` }} /></div><strong>{doneInUnit}/{nextChapter.lessons.length} {tr('complete', 'đã hoàn thành')}</strong></div>
    </section>
    <div className="lesson-daily-strip" aria-label={tr('Your daily progress', 'Tiến độ hôm nay')}><span><Clock3 size={16} /><strong>{minutesToday}/{profile.dailyGoal}</strong> {tr('min today', 'phút hôm nay')}</span><span><Flame size={17} /><strong>{streak}</strong> {tr('day streak', 'ngày liên tiếp')}</span><button onClick={onGoal}>{tr('Change goal', 'Đổi mục tiêu')}</button></div>
    <TutorSpotlight compact onPreview={onTutorPreview} />
    <BuddyCoach compact mood={minutesToday >= profile.dailyGoal ? 'cheer' : 'guide'} title={tr('A little practice, with Buddy.', 'Cùng tớ nói một chút nhé?')} message={minutesToday >= profile.dailyGoal ? tr(`You’ve made ${minutesToday} minutes for English today. If you’d like one more little step, “${next.title}” is ready for you.`, `Bạn đã dành ${minutesToday} phút cho tiếng Anh hôm nay rồi. Nếu muốn học thêm một chút, “${next.title}” đang chờ mình nè.`) : tr(`No need to get it perfect. Let’s start “${next.title}” with one short sentence.`, `Chưa cần hoàn hảo đâu. Mình bắt đầu “${next.title}” bằng một câu ngắn nhé.`)} tip={tr('Listen once, then tap the big mic and tell the tutor one little thing. If you get stuck, replay the example and try again. There’s no rush.', 'Bạn nghe mẫu một lần, rồi chạm micro lớn và nói một ý nhỏ thôi. Nếu bí từ, mình nghe lại rồi thử tiếp nhé. Không cần vội.')} phrase={next.id === 'everyday-2' ? 'I usually start my day with a cup of coffee.' : undefined} actionLabel={tr('Open this lesson', 'Mở bài học này')} onAction={() => onLesson(next)} />
    <MotivationStrip onOpenLeague={onOpenLeague} onOpenAchievements={onOpenAchievements}/>
    <DailyQuests onLesson={() => onLesson(next)} onDictionary={onWord} onPractice={onPractice}/>
    {recent.length > 0 && <section className="lesson-recent"><h2>{tr('Keep it fresh', 'Ôn lại một chút')}</h2><div>{recent.map(lesson => <button key={lesson.id} onClick={() => onLesson(lesson)}><span className="lesson-recent-check"><Check size={15} /></span><span>{lesson.title}</span><small>{tr('Revisit', 'Ôn lại')}</small></button>)}</div></section>}
    <section className="learning-path" id="learning-path">
      <div className="page-intro"><h2 className="section-title">{tr('Your learning path', 'Lộ trình bài học')}</h2><p className="page-description">{tr('Pick a lesson. We’ll take it one little conversation at a time.', 'Bạn chọn một bài nhé. Mình cứ thử từng cuộc trò chuyện nhỏ thôi.')}</p></div>
      <div className="path-progress"><div className="progress-track"><span style={{ width: `${completedCount / allLessons.length * 100}%` }} /></div><span>{completedCount}/{allLessons.length} {tr('complete', 'đã hoàn thành')}</span></div>
      <div className="view-row"><span className="eyebrow muted">{tr('View', 'Hiển thị')}</span><div className="view-options"><button className={`pill-button ${view === 'List' ? 'active' : ''}`} onClick={() => setView('List')} aria-pressed={view === 'List'}><List size={19} />{tr('List', 'Danh sách')}</button><button className={`pill-button ${view === 'Graph' ? 'active' : ''}`} onClick={() => setView('Graph')} aria-pressed={view === 'Graph'}><GitFork size={19} />{tr('Graph', 'Sơ đồ')}</button></div></div>
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
  </div>;
}
