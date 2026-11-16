import { useState } from 'react';
import { ArrowRight, Award, BookOpen, ChevronRight, Clock3, Flame, Headphones, Sparkles } from 'lucide-react';
import BuddyAvatar from './BuddyAvatar';
import { Avatar } from './ui';
import { useCopy, useNarra } from './state';
import { usePlayer } from './game';
import { STREAK_MILESTONES, type StreakMilestone } from './streaks';
import { StreakShareDialog } from './StreakJourney';
import type { Chapter, Lesson } from './data';
import HomeChapterPath from './HomeChapterPath';

type Props = {
  lesson: Lesson;
  chapter: Chapter;
  unitIndex: number;
  journeyComplete: boolean;
  minutesToday: number;
  onLesson: (lesson: Lesson, available: boolean) => void;
  onGoal: () => void;
  onAchievements: () => void;
  onWord: () => void;
  onTutorPreview: (name: string) => void;
};

export default function HomeToday({ lesson, chapter, unitIndex, journeyComplete, minutesToday, onLesson, onGoal, onAchievements, onWord, onTutorPreview }: Props) {
  const tr = useCopy();
  const { profile, stats, words } = useNarra();
  const { streakJourney } = usePlayer();
  const [shareCard, setShareCard] = useState<StreakMilestone | null>(null);
  const nextMilestone = streakJourney.next;
  const latestEarned = [...STREAK_MILESTONES].reverse().find(m => streakJourney.earnedDates[m.days]);
  const dueWords = words.filter(word => word.due);
  const previewWords = (dueWords.length ? dueWords : words).slice(0, 3);
  const dayProgress = Math.min(100, minutesToday / Math.max(1, profile.dailyGoal) * 100);
  const streakProgress = nextMilestone ? Math.min(100, streakJourney.current / nextMilestone.days * 100) : 100;

  return <>
    <header className="home-welcome">
      <div><span>{tr('YOUR DAILY LITTLE ADVENTURE', 'CHUYẾN PHIÊU LƯU NHỎ MỖI NGÀY')}</span><p>{tr(`Hey ${profile.name}, Narry’s here!`, `Chào ${profile.name}, Narry đây nè!`)}</p></div>
      <button type="button" className="home-goal" onClick={onGoal} aria-label={tr('Change my daily practice goal', 'Đổi mục tiêu luyện tập mỗi ngày')}>
        <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" /><circle cx="16" cy="16" r="12" pathLength="100" strokeDasharray={`${dayProgress} 100`} /></svg>
        <span><strong>{minutesToday}/{profile.dailyGoal}</strong> {tr('min today', 'phút hôm nay')}</span>
      </button>
    </header>

    <div className="home-feature-grid">
      <section className="home-lesson" aria-labelledby="home-lesson-title">
        <div className="home-lesson-copy">
          <span className="home-lesson-eyebrow"><span />{journeyComplete ? tr('A LITTLE REVISIT', 'MÌNH ÔN LẠI MỘT CHÚT') : tr('TODAY’S LITTLE LESSON', 'BÀI HỌC NHỎ HÔM NAY')}</span>
          <h1 id="home-lesson-title">{lesson.title}</h1>
          <p>{tr('Tell Narry a little story, and we’ll try it one sentence at a time!', 'Kể Narry một chuyện nhỏ, tớ cùng bạn luyện từng câu nhé!')}</p>
          <button type="button" className="home-start" onClick={() => onLesson(lesson, true)}>{journeyComplete ? tr('Revisit with Narry', 'Ôn lại cùng Narry') : tr('Continue with Narry', 'Học tiếp cùng Narry')}<ArrowRight size={19} /></button>
          <div className="home-lesson-meta"><Clock3 size={14} /><span>{lesson.minutes} {tr('min', 'phút')}</span><span>·</span><span>{tr('Unit', 'Chủ đề')} {String(unitIndex + 1).padStart(2, '0')}</span></div>
        </div>
        <div className="home-buddy-stage" aria-hidden="true"><span className="home-buddy-orbit" /><Sparkles className="home-buddy-spark" size={25} /><span className="home-buddy-note">{tr('A little practice, a lot of cool!', 'Học xíu, ngầu xíu!')}</span><BuddyAvatar mood={minutesToday >= profile.dailyGoal ? 'celebrate' : 'welcome'} size={260} motion={false} /><span className="home-buddy-ground" /></div>
      </section>

      <section className="home-streak" aria-labelledby="home-streak-title">
        <header><h2 id="home-streak-title">NARRA STREAK CLUB</h2><button type="button" onClick={onAchievements} aria-label={tr('Explore all 11 streak milestones', 'Khám phá đủ 11 mốc streak')}><Award size={21} /></button></header>
        <div className="home-streak-score"><span className="home-streak-flame" aria-hidden="true"><Flame size={58} strokeWidth={1.5} /><i /><i /></span><div><strong>{streakJourney.current}</strong><span>{tr(streakJourney.current === 1 ? 'day in a row' : 'days in a row', 'ngày liên tiếp')}</span></div></div>
        <p className="home-streak-vibe">{streakJourney.current > 0 ? tr('Oops, made it a habit!', 'Lỡ chăm mất rồi!') : tr('Let’s light the first spark!', 'Châm lửa đầu tiên nhé!')}</p>
        <div className="home-streak-next"><span>{nextMilestone ? tr(`Next badge: ${nextMilestone.days} ${nextMilestone.days === 1 ? 'day' : 'days'}`, `Huy hiệu tiếp theo: ${nextMilestone.days} ngày`) : tr('365 days, and beyond!', '365 ngày, rồi mình đi tiếp!')}</span><strong>{nextMilestone ? `${streakJourney.current}/${nextMilestone.days}` : '365+'}</strong></div>
        <div className="home-streak-track" role="progressbar" aria-label={tr('Streak toward the next badge', 'Chuỗi ngày tới huy hiệu tiếp theo')} aria-valuemin={0} aria-valuemax={nextMilestone?.days ?? 365} aria-valuenow={Math.min(streakJourney.current, nextMilestone?.days ?? 365)}><span style={{ width: `${streakProgress}%` }} /></div>
        <button type="button" className="home-streak-action" onClick={() => latestEarned ? setShareCard(latestEarned) : onAchievements()}>{latestEarned ? tr(`Show off my ${latestEarned.days}-day badge`, `Khoe mốc ${latestEarned.days} ngày nào!`) : tr('Meet my first badge', 'Ngắm huy hiệu đầu tiên')}<ArrowRight size={16} /></button>
      </section>
    </div>

    <HomeChapterPath chapter={chapter} completed={stats.completed} nextId={lesson.id} onLesson={onLesson} />

    <div className="home-little-extras">
      <button type="button" className="home-word-invite" onClick={onWord}><span className="home-extra-icon"><BookOpen size={25} /></span><span className="home-extra-copy"><small>{tr('A LITTLE WORD REUNION', 'HỘI NGỘ VÀI TỪ QUEN')}</small><strong>{dueWords.length ? tr(dueWords.length === 1 ? 'One word is calling you!' : `${dueWords.length} words are calling you!`, `${dueWords.length} từ đang réo bạn!`) : tr('Keep a little discovery', 'Góp nhặt một từ hay')}</strong><span className="home-word-tags">{previewWords.length ? previewWords.map(word => <span key={word.id}>{word.word}</span>) : tr('Your collection starts here', 'Bộ sưu tập bắt đầu từ đây')}</span></span><ChevronRight size={18} /></button>
      <button type="button" className="home-tutor-invite" onClick={() => onTutorPreview(profile.tutor)} aria-label={tr(`Hear a hello from ${profile.tutor}`, `Nghe lời chào của ${profile.tutor}`)}><Avatar name={profile.tutor} /><span className="home-extra-copy"><small>{tr('WITH', 'CÙNG')} {profile.tutor.toUpperCase()}</small><strong>{tr('Narry’s all ears!', 'Narry đang hóng chuyện bạn nè!')}</strong><span><Headphones size={13} />{tr('Hear a little hello', 'Nghe một lời chào')}</span></span><ChevronRight size={18} /></button>
    </div>
    {shareCard && <StreakShareDialog milestone={shareCard} onClose={() => setShareCard(null)} />}
  </>;
}
