import { useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronRight, ChevronUp, Clock3, Flame, MessageCircle, Settings as SettingsIcon, Sparkles, Star } from 'lucide-react';
import { chapters, tutors } from './data';
import { activityStreak, localDateKey, useCopy, useNarra } from './state';
import { Avatar } from './ui';
import Progress from './Progress';
import Settings from './Settings';
import { CommunityShortcuts } from './Motivation';
import { PersonalAvatar } from './PlayerExtras';
import { usePlayer } from './game';
import './profile-uat.css';
import BuddyCoach from './BuddyCoach';

type Props = { onTutors: () => void; onWriting: () => void; onLesson: () => void; onLeague:()=>void; onFriends:()=>void; onFeed:()=>void; onAchievements:()=>void; onAvatar:()=>void; onPlans:()=>void; onShare:()=>void };
const goals: Record<string, string> = { 'Study abroad': 'Du học', 'Career growth': 'Phát triển sự nghiệp', Travel: 'Du lịch', 'Everyday confidence': 'Tự tin mỗi ngày', 'Make friends': 'Kết bạn' };

export default function Profile({ onTutors, onWriting, onLesson, onLeague, onFriends, onFeed, onAchievements, onAvatar, onPlans, onShare }: Props) {
  const { profile, stats, words } = useNarra(); const tr = useCopy();
  const { player, level } = usePlayer();
  const [settings, setSettings] = useState(false); const [details, setDetails] = useState(false);
  const today = localDateKey();
  const minutesToday = stats.activity.filter(item => item.date === today).reduce((sum, item) => sum + item.minutes, 0);
  const streak = activityStreak(stats.activity);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today+'T12:00:00Z'); date.setUTCDate(date.getUTCDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    return { key, day: date.getUTCDate(), label: date.toLocaleDateString(profile.uiLanguage === 'Tiếng Việt' ? 'vi-VN' : 'en-GB', { weekday: 'narrow', timeZone: 'UTC' }), active: stats.activity.some(item => item.date === key) };
  });
  const allLessons = chapters.flatMap(chapter => chapter.lessons);
  const completed = allLessons.filter(lesson => stats.completed.includes(lesson.id)).length;
  const next = allLessons.find(lesson => !stats.completed.includes(lesson.id));
  const unit = Math.max(0, chapters.findIndex(chapter => chapter.lessons.some(lesson => lesson.id === next?.id)));
  const percent = Math.round(completed / allLessons.length * 100);
  const tutor = tutors.find(item => item.name === profile.tutor) ?? tutors[0];
  const names = profile.name.trim().split(/\s+/).filter(Boolean);
  const initials = (names[0]?.[0] ?? 'N')+(names.length > 1 ? names.at(-1)?.[0] ?? '' : '');
  const metrics = [
    { Icon: Clock3, value: stats.minutes, label: tr('Minutes practised', 'Phút luyện tập') },
    { Icon: MessageCircle, value: stats.conversations, label: tr('Conversations', 'Cuộc hội thoại') },
    { Icon: Star, value: words.filter(word => word.status === 'Mastered').length, label: tr('Words mastered', 'Từ đã nắm vững') },
    { Icon: Sparkles, value: stats.speakingScore || '—', label: tr('Speaking score', 'Điểm luyện nói') },
  ];
  return <>
    <div className="profile-page profile-overview" inert={settings}>
      <header className="profile-overview-heading"><div><p className="eyebrow">{tr('A LITTLE SPACE FOR YOU', 'GÓC NHỎ CỦA BẠN')}</p><h1>{tr('My profile', 'Hồ sơ của bạn')}</h1></div><button className="profile-settings-button" onClick={() => setSettings(true)} aria-label={tr('Open settings', 'Mở cài đặt')}><SettingsIcon size={21} /><span>{tr('Settings', 'Cài đặt')}</span></button></header>
      <section className="card profile-identity" aria-label={tr('Personal information', 'Thông tin cá nhân')}><button className="profile-personal-avatar" onClick={onAvatar} aria-label={tr('Customize your avatar', 'Tạo diện mạo của bạn')}><PersonalAvatar/></button><div className="profile-identity-copy"><h2>{profile.name}</h2><p>@{player.handle}</p><div className="profile-identity-tags"><span>{tr('Level', 'Trình độ')} {profile.level}</span><span>{tr('Explorer', 'Nhà khám phá')} · {level}</span></div></div><button className="profile-share-button" onClick={onShare} aria-label={tr('Share profile QR', 'Chia sẻ hồ sơ bằng QR')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3h-6v-3m6-6v3"/></svg></button></section>
      <BuddyCoach compact mood={minutesToday >= profile.dailyGoal ? 'cheer' : 'guide'} title={tr(`Hey, ${profile.name}. Shall we keep going?`, `${profile.name} ơi, mình học tiếp nhé?`)} message={minutesToday > 0 ? tr(`You’ve spent ${minutesToday} minutes with English today. Want a little more? Your next lesson is waiting right here.`, `Hôm nay bạn đã dành ${minutesToday} phút cho tiếng Anh. Mình học thêm một chút nữa không? Bài tiếp theo ở ngay đây nè.`) : tr(`Let’s make room for ${profile.dailyGoal} minutes today. One little conversation is a lovely start.`, `Mình dành ${profile.dailyGoal} phút cho hôm nay nhé. Một cuộc trò chuyện nhỏ thôi cũng là khởi đầu rồi.`)} tip={tr('Your Study Plan shows where we’ll pick up next. After you finish a practice, your minutes and conversations appear here. You can change your goal any time in Settings.', 'Lộ trình học bên dưới cho bạn biết mình sẽ tiếp tục từ đâu. Học xong, số phút và lượt hội thoại sẽ hiện ở đây. Muốn học nhẹ hơn một chút, bạn đổi mục tiêu trong Cài đặt nhé.')} actionLabel={tr('Find my next lesson', 'Xem bài học tiếp theo')} onAction={onLesson} />
      <div className="profile-overview-grid">
        <section className="card profile-activity-card">
          <div className="profile-card-heading"><h2><Flame size={19} />{streak} {tr('day streak', 'ngày liên tục')}</h2><span>{tr('Last 7 days', '7 ngày gần đây')}</span></div>
          <div className="profile-week" aria-label={tr('Practice over the last seven days', 'Luyện tập trong 7 ngày gần đây')}>{days.map(day => <div className={'profile-week-day '+(day.active ? 'has-activity ' : '')+(day.key === today ? 'is-today' : '')} key={day.key} aria-label={day.key+' · '+tr(day.active ? 'Practice recorded' : 'No practice recorded', day.active ? 'Đã luyện tập' : 'Chưa luyện tập')}><span>{day.label}</span><span className="profile-week-dot">{day.active ? <Check size={15} /> : day.day}</span></div>)}</div>
          <div className="profile-goal-label"><span>{tr("Today's goal", 'Mục tiêu hôm nay')}</span><strong>{minutesToday} / {profile.dailyGoal} {tr('min', 'phút')}</strong></div><div className="profile-meter" role="progressbar" aria-label={tr("Today's learning goal", 'Mục tiêu học hôm nay')} aria-valuemin={0} aria-valuemax={profile.dailyGoal} aria-valuenow={Math.min(minutesToday, profile.dailyGoal)}><span style={{ width: Math.min(100, minutesToday / profile.dailyGoal * 100)+'%' }} /></div><button className="profile-subtle-link" onClick={() => setSettings(true)}>{tr('Change daily goal', 'Đổi mục tiêu hằng ngày')}<ChevronRight size={14} /></button>
        </section>
        <section className="card profile-study-card"><div className="profile-card-heading"><h2><BookOpen size={19} />{tr('Study Plan', 'Lộ trình học')}</h2><span>{percent}%</span></div><span className="profile-plan-unit">{tr('UNIT', 'CHỦ ĐỀ')} {String(unit+1).padStart(2, '0')}</span><h3>{next ? chapters[unit].title : tr('Your path is complete', 'Bạn đã hoàn thành lộ trình')}</h3><p>{next ? next.title : tr('Revisit a lesson and keep your English growing.', 'Ôn lại bài học và tiếp tục trau dồi tiếng Anh.')}</p><div className="profile-meter" role="progressbar" aria-label={tr('Study plan progress', 'Tiến độ lộ trình học')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: percent+'%' }} /></div><div className="profile-plan-bottom"><span>{completed} / {allLessons.length} {tr('lessons', 'bài học')}</span><button onClick={onLesson}>{tr(next ? 'Continue lesson' : 'Review lessons', next ? 'Học tiếp' : 'Ôn bài học')}<ChevronRight size={15} /></button></div></section>
      </div>
      <section className="card profile-progress-summary"><div className="profile-card-heading"><h2>{tr('Your progress', 'Tiến độ của bạn')}</h2><button className="profile-details-button" onClick={() => setDetails(value => !value)} aria-expanded={details} aria-controls="profile-progress-details">{tr(details ? 'Hide details' : 'View details', details ? 'Thu gọn' : 'Xem chi tiết')}{details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></div><div className="profile-metrics">{metrics.map(({ Icon, value, label }) => <div key={label}><Icon size={18} /><strong>{value}</strong><span>{label}</span></div>)}</div><p className="profile-local-note">{tr('Your progress is here when you want a little nudge.', 'Khi muốn xem mình đã đi tới đâu, bạn ghé đây nhé.')}</p></section>
      {details && <section id="profile-progress-details" className="profile-progress-details" aria-label={tr('Detailed learning progress', 'Chi tiết tiến độ học tập')}><Progress stats={stats} words={words} onWriting={onWriting} /></section>}
      <section className="card profile-current-tutor"><Avatar name={tutor.name} /><div><p className="eyebrow">{tr('YOUR AI TUTOR', 'GIA SƯ AI CỦA BẠN')}</p><h2>{tutor.name}</h2><p>{tr(tutor.accent, tutor.id === 'henry' ? 'Tiếng Anh – giọng Anh' : 'Tiếng Anh – giọng Mỹ')}</p></div><button className="profile-tutor-button" onClick={onTutors}>{tr('Choose tutor', 'Chọn gia sư')}<ChevronRight size={16} /></button></section>
      <CommunityShortcuts onLeague={onLeague} onFriends={onFriends} onFeed={onFeed} onAchievements={onAchievements} onAvatar={onAvatar} onPlans={onPlans}/>
      <div className="profile-footer"><img src="/brand/logo-dark.webp" alt="Narra" /><span>Your voice. Your story.</span></div>
    </div>
    {settings && <Settings onClose={() => setSettings(false)} onTutors={onTutors} />}
  </>;
}

