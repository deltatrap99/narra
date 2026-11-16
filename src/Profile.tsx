import { useState } from 'react';
import { BookOpen, Check, ChevronRight, Flame, LogOut, MessageCircle, Settings as SettingsIcon, Share2, TrendingUp, UserPlus, Users } from 'lucide-react';
import { chapters, tutors } from './data';
import { activityStreak, localDateKey, useCopy, useNarra } from './state';
import { Avatar } from './ui';
import SessionArchive from './SessionArchive';
import Progress from './Progress';
import Settings from './Settings';
import { CommunityShortcuts } from './Motivation';
import { PersonalAvatar } from './PlayerExtras';
import { usePlayer } from './game';
import { FocusHero, QuietSection } from './FocusLayout';
import './profile-uat.css';
import AccountsDialog from './AccountsDialog';
import FamilyMembers from './FamilyMembers';
import './profile-accounts.css';

type Props = { onTutors: () => void; onWriting: () => void; onLesson: () => void; onLeague:()=>void; onFriends:()=>void; onFeed:()=>void; onAchievements:()=>void; onAvatar:()=>void; onPlans:()=>void; onShare:()=>void };
export default function Profile({ onTutors, onWriting, onLesson, onLeague, onFriends, onFeed, onAchievements, onAvatar, onPlans, onShare }: Props) {
  const { profile, stats, words, sessions } = useNarra(); const tr = useCopy(); const { level, player } = usePlayer();
  const [settings, setSettings] = useState(false);
  const [dialog, setDialog] = useState<'accounts' | 'family' | 'sessions' | null>(null);
  const today = localDateKey();
  const minutesToday = stats.activity.filter(a => a.date === today).reduce((n, a) => n + a.minutes, 0);
  const streak = activityStreak(stats.activity);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today+'T12:00:00Z'); date.setUTCDate(date.getUTCDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    return { key, day: date.getUTCDate(), label: date.toLocaleDateString(profile.uiLanguage === 'Tiếng Việt' ? 'vi-VN' : 'en-GB', { weekday: 'narrow', timeZone: 'UTC' }), active: stats.activity.some(item => item.date === key) };
  });
  const allLessons = chapters.flatMap(c => c.lessons);
  const completed = allLessons.filter(l => stats.completed.includes(l.id)).length;
  const next = allLessons.find(l => !stats.completed.includes(l.id));
  const tutor = tutors.find(t => t.name === profile.tutor) ?? tutors[0];
  const metrics = [
    { value: stats.minutes, label: tr('Minutes practised', 'Phút luyện tập') },
    { value: stats.conversations, label: tr('Conversations', 'Cuộc hội thoại') },
    { value: words.filter(w => w.status === 'Mastered').length, label: tr('Words mastered', 'Từ đã nắm') },
  ];
  return <>
    <div className="profile-page focus-page focus-profile" inert={settings}>
      <header className="focus-profile-identity"><button type="button" className="focus-profile-avatar" onClick={onAvatar} aria-label={tr('Customize your avatar', 'Tạo diện mạo của bạn')}><PersonalAvatar /></button><div><strong>{profile.name}</strong><span>{tr('Explorer', 'Nhà khám phá')} · {level}</span></div><button type="button" className="focus-icon-button" onClick={onShare} aria-label={tr('Share profile QR', 'Chia sẻ hồ sơ bằng QR')}><Share2 size={20} /></button><button type="button" className="focus-icon-button" onClick={() => setSettings(true)} aria-label={tr('Open settings', 'Mở cài đặt')}><SettingsIcon size={21} /></button></header>
      <div className="profile-account-actions" aria-label={tr('Account actions', 'Thao tác tài khoản')}><button type="button" onClick={() => setDialog('accounts')}><UserPlus size={17} />{tr('Add / switch account', 'Thêm / đổi tài khoản')}</button><button type="button" onClick={() => window.dispatchEvent(new Event('narra:sign-out'))}><LogOut size={17} />{tr('Sign out', 'Đăng xuất')}</button></div>
      <FocusHero eyebrow={tr('YOUR LITTLE JOURNEY', 'HÀNH TRÌNH NHỎ CỦA BẠN')} title={streak ? tr(`${streak} ${streak === 1 ? 'day' : 'days'} together`, `${streak} ngày cùng nhau`) : tr('A little, every day', 'Mỗi ngày, một chút nhé')} description={tr('Narry is cheering for you, every little habit is part of your story.', 'Narry cổ vũ bạn nè! Mỗi thói quen nhỏ là một bước trên hành trình của bạn.')} action={tr('See my little wins', 'Ngắm huy hiệu của mình')} onAction={onAchievements} mood={streak ? 'proud' : 'encourage'} meta={<><Flame size={15} /><span>{tr('A journey to 365 days', 'Hành trình tới 365 ngày')}</span></>} />
      <section className="focus-calendar" aria-label={tr('Practice over the last seven days', 'Luyện tập trong 7 ngày gần đây')}><span>{tr('Your week', 'Một tuần của mình')}</span><div>{days.map(day => <div className={(day.active ? 'has-activity ' : '')+(day.key === today ? 'is-today' : '')} key={day.key} aria-label={day.key+' · '+tr(day.active ? 'Practice recorded' : 'No practice recorded', day.active ? 'Đã luyện tập' : 'Chưa luyện tập')}><small>{day.label}</small><span>{day.active ? <Check size={15} /> : day.day}</span></div>)}</div></section>
      <div className="focus-profile-metrics">{metrics.map(m => <div key={m.label}><strong>{m.value}</strong><span>{m.label}</span></div>)}</div>
      <div className="focus-disclosures">
        <QuietSection icon={<BookOpen size={20} />} title={tr('My study plan', 'Nhịp học của mình')} summary={tr(`${completed}/${allLessons.length} lessons`, `${completed}/${allLessons.length} bài học`)}>
          <button type="button" className="focus-tool-row" onClick={onLesson}><BookOpen size={20} /><span><strong>{next?.title ?? tr('Revisit a lesson', 'Ôn lại một bài nhé')}</strong><small>{tr('Your next little lesson', 'Bài học nhỏ tiếp theo')}</small></span><ChevronRight size={18} /></button>
          <button type="button" className="focus-tool-row" onClick={onTutors}><Avatar name={tutor.name} /><span><strong>{tutor.name}</strong><small>{tr('Choose your learning companion', 'Chọn người bạn đồng hành')}</small></span><ChevronRight size={18} /></button>
          <button type="button" className="focus-tool-row" onClick={() => setSettings(true)}><SettingsIcon size={20} /><span>{tr(`${minutesToday}/${profile.dailyGoal} minutes today, adjust my goal`, `${minutesToday}/${profile.dailyGoal} phút hôm nay, chỉnh mục tiêu học`)}</span><ChevronRight size={18} /></button>
        </QuietSection>
        <button type="button" className="focus-tool-row" onClick={() => setDialog('sessions')}><MessageCircle size={20}/><span><strong>{tr('Saved conversations', 'Hội thoại đã lưu')}</strong><small>{tr(`${sessions.length} sessions · Transcript & practice ideas`, `${sessions.length} buổi · Nội dung & gợi ý luyện tập`)}</small></span><ChevronRight size={18}/></button>
        <QuietSection icon={<TrendingUp size={20} />} title={tr('A closer look at my progress', 'Nhìn lại những bước tiến')}><Progress stats={stats} words={words} onWriting={onWriting} /></QuietSection>
        <QuietSection icon={<Users size={20} />} title={tr('A little company', 'Có bạn, học thêm vui')} summary={tr('Friends & challenges', 'Bạn bè & thử thách')}><CommunityShortcuts onLeague={onLeague} onFriends={onFriends} onFeed={onFeed} onAchievements={onAchievements} onAvatar={onAvatar} onPlans={onPlans} /></QuietSection>
      </div>
      <section className="focus-plan-row" aria-label={tr('Your current plan', 'Gói học hiện tại')}><span>Narra Free</span><button type="button" className="focus-text-button" onClick={onPlans}>{tr('Plus & Family, what’s inside?', 'Plus & Family có gì hay?')}<ChevronRight size={16} /></button></section>
      {(player.planInterest === 'family' || player.familyMembers.length > 0) && <button type="button" className="profile-family-card" onClick={() => setDialog('family')}><span className="account-round-icon"><Users size={24} /></span><span><strong>{tr('My Family members', 'Thành viên gia đình')}</strong><small>{tr(`Preview list · ${player.familyMembers.length + 1}/4 people`, `Danh sách xem trước · ${player.familyMembers.length + 1}/4 người`)}</small></span><ChevronRight size={20} /></button>}
    </div>
    {settings && <Settings onClose={() => setSettings(false)} onTutors={onTutors} />}
    {dialog === 'accounts' && <AccountsDialog onClose={() => setDialog(null)} />}
    {dialog === 'sessions' && <SessionArchive onClose={() => setDialog(null)} />}
    {dialog === 'family' && <FamilyMembers onClose={() => setDialog(null)} />}
  </>;
}
