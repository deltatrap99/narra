import { useEffect, useState, type CSSProperties } from 'react';
import { Award, Check, Crown, Download, Eye, Flame, LockKeyhole, Share2, Sparkles, Trophy } from 'lucide-react';
import { useCopy, useNarra } from './state';
import { usePlayer } from './game';
import BuddyAvatar from './BuddyAvatar';
import { brandAsset, isOption5 } from './brand-variant';
import { Modal } from './ui';
import { STREAK_MILESTONES, type StreakMilestone } from './streaks';
import { createStreakCard, streakMascotAsset } from './streak-share';
import './streak-journey.css';

function milestoneStyle(milestone: StreakMilestone): CSSProperties { return { '--streak-color': milestone.color } as CSSProperties; }

function StreakBadge({ milestone, locked = false }: { milestone: StreakMilestone; locked?: boolean }) {
  const Icon = milestone.days === 365 ? Trophy : milestone.days >= 180 ? Crown : milestone.days >= 30 ? Award : milestone.days >= 7 ? Flame : Sparkles;
  return <span className={`streak-medal ${locked ? 'is-locked' : ''}`} style={milestoneStyle(milestone)} aria-hidden="true"><span><Icon /><strong>{milestone.days}</strong></span><i /></span>;
}

export function StreakShareDialog({ milestone, onClose }: { milestone: StreakMilestone; onClose: () => void }) {
  const tr = useCopy(); const { profile } = useNarra(); const { streakJourney } = usePlayer();
  const achievedAt = streakJourney.earnedDates[milestone.days];
  const earned = !!achievedAt;
  const [capture, setCapture] = useState(false); const [file, setFile] = useState<File | null>(null); const [notice, setNotice] = useState('');
  const title = tr(milestone.title, milestone.titleVi);
  const earnedLabel = achievedAt ? new Intl.DateTimeFormat(tr('en-GB', 'vi-VN'), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(achievedAt + 'T12:00:00Z')) : tr('A milestone still ahead', 'Một cột mốc đang chờ mình');
  const preview = earned ? '' : tr('PREVIEW · NOT EARNED YET', 'XEM TRƯỚC · CHƯA ĐẠT');
  const encouragement = tr('One little step, every day!', 'Mỗi ngày một chút, cùng nhau nhé!');
  useEffect(() => {
    let active = true; setFile(null); setNotice('');
    createStreakCard(milestone, { name: profile.name, title, days: tr('DAYS TOGETHER', 'NGÀY CÙNG NHAU'), streak: tr('MY ENGLISH STREAK', 'CHUỖI NGÀY HỌC CỦA MÌNH'), earned: earnedLabel, preview, encouragement }).then(value => { if (active) setFile(value); }).catch(() => { if (active) setNotice(tr('The image could not be prepared, but you can still take a screenshot of the card.', 'Chưa chuẩn bị được ảnh, bạn vẫn có thể chụp màn hình thẻ thành tích nhé.')); });
    return () => { active = false; };
  }, [milestone, profile.name, title, earnedLabel, preview, encouragement]);
  function download() {
    if (!file) return;
    const url = URL.createObjectURL(file), link = document.createElement('a'); link.href = url; link.download = file.name; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setNotice(tr('Your image is ready to save and post on Facebook whenever you like!', 'Ảnh đã sẵn sàng để lưu và đăng Facebook khi bạn muốn nhé!'));
  }
  async function share() {
    if (!file) return;
    if (!navigator.canShare?.({ files: [file] })) { download(); return; }
    try { await navigator.share({ files: [file], title: `Narra · ${milestone.days} ${tr('days', 'ngày')}`, text: `${title}, Your voice, your story! #NarraStreak` }); }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setNotice(tr('Use Save image to keep your card and post it on Facebook.', 'Bạn dùng Lưu ảnh để giữ thẻ và đăng lên Facebook nhé.')); }
  }
  return <div className={`streak-dialog-shell ${capture ? 'is-capture' : ''}`} onKeyDown={event => event.stopPropagation()}><Modal wide title={earned ? tr('This little win is yours!', 'Niềm vui này là của bạn!') : tr('A little look ahead', 'Mình ngắm trước nhé')} onClose={onClose}>
    <div className="streak-share-layout">
      <article className={`streak-share-card ${earned ? '' : 'is-preview'}`} style={milestoneStyle(milestone)} aria-label={tr(`${milestone.days}-day Narra streak card${earned ? '' : ', preview only'}`, `Thẻ thành tích ${milestone.days} ngày Narra${earned ? '' : ', chỉ xem trước'}`)}>
        <header><img src={brandAsset('logo-dark.webp')} alt="Narra" /><span>NARRA STREAK CLUB</span></header>
        <p className="streak-share-kicker">{tr('MY ENGLISH STREAK', 'CHUỖI NGÀY HỌC CỦA MÌNH')}</p>
        <div className="streak-share-count"><strong>{milestone.days}</strong><span>{tr('DAYS TOGETHER', 'NGÀY CÙNG NHAU')}</span></div>
        <div className="streak-share-art" data-effect={milestone.effect}><span /><img src={streakMascotAsset} alt={isOption5 ? tr('Buddy winking with a goofy head tilt and curled body', 'Buddy nháy mắt, nghiêng đầu và uốn người ngố ngố') : tr('Buddy winking with a happy thumbs-up', 'Buddy nháy mắt và giơ tay like thật vui')} /></div>
        <h3>{title}</h3><p className="streak-share-name">{profile.name}</p><p className="streak-share-date">{earnedLabel}</p><p className="streak-share-encouragement">{encouragement}</p>
        <footer><strong lang="en">Your voice, your story!</strong><span>#NarraStreak · #YourVoiceYourStory</span></footer>
        {preview && <span className="streak-share-watermark">{preview}</span>}
      </article>
      <div className="streak-share-controls">
        <StreakBadge milestone={milestone} /><h3>{tr(milestone.cheer, milestone.cheerVi)}</h3>
        <p>{earned ? tr('Your badge and matching card theme are unlocked, ready for a screenshot or a little Facebook celebration!', 'Huy hiệu và phông thẻ của mốc này đã mở, mình chụp màn hình hoặc lưu ảnh để khoe một chút trên Facebook nhé!') : tr('You can explore this card now, and the preview label stays until you earn the milestone.', 'Bạn cứ ngắm trước thẻ này nhé, nhãn xem trước sẽ được giữ cho đến khi mình đạt mốc.')}</p>
        <button type="button" onClick={() => setCapture(value => !value)}><Eye size={18} />{capture ? tr('Back to controls', 'Quay lại các nút') : tr('Screenshot mode', 'Chế độ chụp ảnh')}</button>
        <button type="button" disabled={!file} onClick={download}><Download size={18} />{tr(earned ? 'Save image' : 'Save preview image', earned ? 'Lưu ảnh thành tích' : 'Lưu ảnh xem trước')}</button>
        {earned && <button type="button" className="streak-share-primary" disabled={!file} onClick={share}><Share2 size={18} />{tr('Share this little win', 'Khoe niềm vui này')}</button>}
        <small>{tr('1080 × 1350 PNG with Narra identity, ready for your Facebook feed.', 'Ảnh PNG 1080 × 1350 có nhận diện Narra, vừa khung bài đăng Facebook.')}</small>
        {notice && <p role="status" className="streak-share-notice">{notice}</p>}
      </div>
    </div>
  </Modal></div>;
}

export default function StreakJourney({ onLesson }: { onLesson: () => void }) {
  const tr = useCopy(); const { streakJourney, setPlayer } = usePlayer();
  const [selected, setSelected] = useState<StreakMilestone | null>(null);
  const earnedCount = STREAK_MILESTONES.filter(m => streakJourney.earnedDates[m.days]).length;
  const next = streakJourney.next;
  function open(milestone: StreakMilestone) { setSelected(milestone); if (streakJourney.earnedDates[milestone.days]) setPlayer(p => ({ ...p, seenStreakMilestones: [...new Set([...p.seenStreakMilestones, ...STREAK_MILESTONES.filter(m => m.days <= milestone.days).map(m => m.days)])] })); }
  return <section className="streak-journey" aria-labelledby="streak-journey-title">
    <header className="streak-journey-header"><div><span className="community-eyebrow">NARRA STREAK CLUB</span><h2 id="streak-journey-title">{tr('365 days, a little more you!', '365 ngày, thêm một chút là bạn!')}</h2><p>{tr('Eleven little celebrations, with badges and card themes that stay yours.', 'Mười một lần ăn mừng, cùng huy hiệu và phông thẻ thành tích dành riêng cho bạn.')}</p></div><BuddyAvatar mood={streakJourney.current > 0 ? 'celebrate' : 'encourage'} size={100} /></header>
    <div className="streak-journey-summary"><div><Flame size={22} /><strong>{streakJourney.current}</strong><span>{tr('current streak', 'ngày liên tiếp')}</span></div><div><Trophy size={20} /><strong>{streakJourney.best}</strong><span>{tr('personal best', 'kỷ lục của bạn')}</span></div><div><Award size={20} /><strong>{earnedCount}/11</strong><span>{tr('streak badges', 'huy hiệu streak')}</span></div></div>
    <div className="streak-next"><div><span>{next ? tr('Your next little celebration', 'Lần ăn mừng tiếp theo') : tr('A whole year, and beyond!', 'Trọn một năm, rồi mình đi tiếp!')}</span><strong>{next ? tr(`${next.days} days, ${next.title}`, `${next.days} ngày, ${next.titleVi}`) : tr('Your 365-day badge is yours to keep', 'Huy hiệu 365 ngày đã là của bạn')}</strong></div><button type="button" onClick={onLesson}>{tr(streakJourney.practisedToday ? 'A little more practice?' : 'Let’s keep our rhythm', streakJourney.practisedToday ? 'Mình học thêm chút nhé?' : 'Cùng giữ nhịp nhé')}</button></div>
    {next && <div className="streak-next-progress" role="progressbar" aria-label={tr('Current streak toward the next milestone', 'Chuỗi ngày hiện tại tới mốc tiếp theo')} aria-valuemin={0} aria-valuemax={next.days} aria-valuenow={Math.min(streakJourney.current, next.days)}><span style={{ width: Math.min(100, streakJourney.current / next.days * 100) + '%' }} /></div>}
    <p className="streak-calendar-note">{tr('A lesson or word review keeps your day going, with a new study day at midnight in UTC+7 and earned badges kept even if a streak breaks.', 'Một bài học hoặc lượt ôn từ đều giúp mình giữ nhịp, ngày học mới bắt đầu lúc 0h theo giờ Việt Nam và huy hiệu đã đạt vẫn ở lại khi chuỗi ngày bị ngắt nhé.')}</p>
    <ol className="streak-milestones">{STREAK_MILESTONES.map(milestone => {
      const earned = !!streakJourney.earnedDates[milestone.days];
      return <li key={milestone.days} style={milestoneStyle(milestone)} className={earned ? 'is-earned' : ''}>
        <button type="button" className="streak-milestone-open" onClick={() => open(milestone)} aria-label={tr(`${milestone.days} days, ${milestone.title}, ${earned ? 'earned, open your card' : 'preview this milestone'}`, `${milestone.days} ngày, ${milestone.titleVi}, ${earned ? 'đã đạt, mở thẻ thành tích' : 'xem trước cột mốc'}`)}>
          <span className="streak-milestone-top"><strong>{milestone.days}<small>{tr('days', 'ngày')}</small></strong><span>{earned ? <Check size={15} /> : <LockKeyhole size={14} />}{tr(earned ? 'Yours!' : 'Up ahead', earned ? 'Đã là của bạn!' : 'Đang chờ bạn')}</span></span>
          <div className="streak-celebration-stage" data-effect={milestone.effect}><span className="streak-celebration-orbit" /><BuddyAvatar mood={milestone.mood} size={125} /><i /><i /><i />{milestone.days >= 180 && <Crown className="streak-celebration-crown" size={30} />}</div>
          <h3>{tr(milestone.title, milestone.titleVi)}</h3><p>{tr(milestone.cheer, milestone.cheerVi)}</p>
          <span className="streak-reward"><StreakBadge milestone={milestone} locked={!earned} /><span><strong>{tr('A badge + your card theme', 'Huy hiệu + phông thẻ riêng')}</strong><small>{tr(earned ? 'Open your celebration card' : 'Have a little preview', earned ? 'Mở thẻ để cùng ăn mừng' : 'Mình ngắm trước một chút nhé')}</small></span></span>
        </button>
      </li>;
    })}</ol>
    {selected && <StreakShareDialog milestone={selected} onClose={() => setSelected(null)} />}
  </section>;
}

/** Celebrate once after practice closes, rather than interrupting an active lesson. */
export function StreakMilestoneCelebration({ paused }: { paused: boolean }) {
  const { player, setPlayer, streakJourney } = usePlayer();
  const [selected, setSelected] = useState<StreakMilestone | null>(null);
  const pending = [...STREAK_MILESTONES].reverse().find(m => streakJourney.earnedDates[m.days] && !player.seenStreakMilestones.includes(m.days));
  useEffect(() => { if (!paused && pending && !selected && !document.querySelector('dialog[open]')) setSelected(pending); }, [paused, pending, selected]);
  function close() { if (selected) { const days = selected.days; setPlayer(p => ({ ...p, seenStreakMilestones: [...new Set([...p.seenStreakMilestones, ...STREAK_MILESTONES.filter(m => m.days <= days).map(m => m.days)])] })); } setSelected(null); }
  return selected ? <StreakShareDialog milestone={selected} onClose={close} /> : null;
}
