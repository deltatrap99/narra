import { brandAsset } from './brand-variant';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CheckCheck, Clock3, Flame, Medal, Mic, Newspaper, Palette, Sparkles, Trophy, UsersRound, Zap } from 'lucide-react';
import { usePlayer, type DailyMission } from './game';
import { activityStreak, useCopy, useNarra } from './state';
import './motivation.css';
import BuddyAvatar from './BuddyAvatar';

export function MotivationStrip({ onOpenLeague, onOpenAchievements }: { onOpenLeague: () => void; onOpenAchievements: () => void }) {
  const tr = useCopy();
  const { stats } = useNarra();
  const { xp, level } = usePlayer();
  const [pulse, setPulse] = useState(0);
  const previousXP = useRef(xp);
  useEffect(() => {
    if (xp > previousXP.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPulse(value => value + 1);
    previousXP.current = xp;
  }, [xp]);
  const streak = activityStreak(stats.activity);
  return <div className="motivation-strip" aria-label={tr('Your little wins', 'Những bước tiến của bạn')}>
    <button className="motivation-chip chip-streak" onClick={onOpenAchievements} aria-label={tr(`${streak} day streak, view achievements.`, `Chuỗi ${streak} ngày, xem thành tích.`)}><span className="motivation-chip-icon"><Flame size={20} fill="currentColor" /></span><span><strong>{streak}<small>{tr('day streak', 'ngày liên tiếp')}</small></strong></span></button>
    <button className="motivation-chip chip-xp" onClick={onOpenAchievements} aria-label={tr(`${xp} XP, level ${level}, view achievements.`, `${xp} XP, cấp ${level}, xem thành tích.`)}><span className="motivation-chip-icon"><Zap size={21} fill="currentColor" /></span><span><strong className={pulse ? 'xp-celebration' : ''} key={`xp-${pulse}`} aria-live="polite">{xp.toLocaleString()}<small>XP · {tr('Level', 'Cấp')} {level}</small></strong></span></button>
    <button className="motivation-chip chip-league" onClick={onOpenLeague}><span className="motivation-chip-icon"><Trophy size={20} fill="currentColor" /></span><span><strong>{tr('Your league', 'Giải đấu')}<small>{tr('One little climb', 'Từng bước vươn lên')}</small></strong></span><ArrowRight className="motivation-chip-arrow" size={14} /></button>
  </div>;
}

function MissionRow({ mission, onAction }: { mission: DailyMission; onAction: () => void }) {
  const tr = useCopy();
  const progress = Math.max(0, Math.min(mission.progress, mission.target));
  const complete = mission.target > 0 && progress >= mission.target;
  const Icon = mission.id === 'say-practice' ? Mic : mission.id === 'review-words' ? BookOpen : Clock3;
  const action = mission.id === 'say-practice' ? tr('Speak', 'Luyện nói') : mission.id === 'review-words' ? tr('Review', 'Ôn từ') : tr('Learn', 'Học tiếp');
  return <div className={`daily-quest-row quest-${mission.id} ${complete ? 'is-complete' : ''}`}>
    <span className="daily-quest-icon">{complete ? <Check size={20} strokeWidth={3} /> : <Icon size={21} />}</span>
    <div className="daily-quest-copy"><div className="daily-quest-title"><h3>{tr(mission.title, mission.titleVi)}</h3><span className={`quest-reward ${complete ? 'earned' : ''}`}>{complete ? <CheckCheck size={12} /> : <Zap size={11} fill="currentColor" />}{complete ? '' : '+'}{mission.xp} XP</span></div><div className="quest-progress-row"><div className="quest-progress-track" role="progressbar" aria-label={tr(mission.title, mission.titleVi)} aria-valuemin={0} aria-valuemax={mission.target} aria-valuenow={progress}><span style={{ width: `${mission.target > 0 ? progress / mission.target * 100 : 0}%` }} /></div><span>{progress}/{mission.target}</span></div></div>
    <button className="daily-quest-action" onClick={onAction} aria-label={`${complete ? tr('Keep going', 'Luyện tiếp') : action}: ${tr(mission.title, mission.titleVi)}`}><span>{complete ? tr('Again', 'Tiếp nhé') : action}</span><ArrowRight size={15} /></button>
  </div>;
}

export function DailyQuests({ onLesson, onDictionary, onPractice }: { onLesson: () => void; onDictionary: () => void; onPractice: () => void }) {
  const tr = useCopy();
  const { dailyMissions } = usePlayer();
  const completed = dailyMissions.filter(mission => mission.progress >= mission.target).length;
  const totalXP = dailyMissions.reduce((sum, mission) => sum + mission.xp, 0);
  const allComplete = dailyMissions.length > 0 && completed === dailyMissions.length;
  const hasProgress = dailyMissions.some(mission => mission.progress > 0);
  return <section className="daily-quests" aria-labelledby="daily-quests-title">
    <div className="daily-quests-heading"><div><span className="motivation-eyebrow"><Sparkles size={12} />{tr('A little, every day', 'Mỗi ngày, một chút')}</span><h2 id="daily-quests-title">{tr('Your daily wins', 'Niềm vui nhỏ hôm nay')}</h2></div><div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}><BuddyAvatar mood={allComplete ? 'celebrate' : hasProgress ? 'encourage' : 'welcome'} size={50} /><span className="daily-quests-count" aria-label={tr(`${completed} of ${dailyMissions.length} quests complete`, `Đã xong ${completed} trên ${dailyMissions.length} nhiệm vụ`)}>{allComplete ? <Check size={19} /> : `${completed}/${dailyMissions.length}`}</span></div></div>
    <div className="daily-quests-list">{dailyMissions.map(mission => <MissionRow key={mission.id} mission={mission} onAction={mission.id === 'say-practice' ? onPractice : mission.id === 'review-words' ? onDictionary : onLesson} />)}</div>
    <p className="daily-quests-footer"><span><Zap size={12} fill="currentColor" />{completed === dailyMissions.length ? tr("All done, what a good day!", "Xong cả rồi, hôm nay thật tuyệt!") : tr(`Up to ${totalXP} XP in little steps`, `Thêm đến ${totalXP} XP từ những bước nhỏ`)}</span><span>{tr('You’ve got this.', 'Bạn làm được mà.')}</span></p>
  </section>;
}

type CommunityProps = { onLeague: () => void; onFriends: () => void; onFeed: () => void; onAchievements: () => void; onAvatar: () => void; onPlans: () => void };

export function CommunityShortcuts({ onLeague, onFriends, onFeed, onAchievements, onAvatar, onPlans }: CommunityProps) {
  const tr = useCopy();
  const { achievements, player } = usePlayer();
  const unlocked = achievements.filter(achievement => achievement.unlocked).length;
  const links = [
    { id: 'league', title: ['Your league', 'Giải đấu của bạn'], description: ['A little climb, together.', 'Cùng nhau tiến từng bước.'], Icon: Trophy, tone: 'league', action: onLeague },
    { id: 'friends', title: ['Learning friends', 'Bạn cùng học'], description: [player.friendIds.length ? `${player.friendIds.length} friends on your journey.` : "Good company, more little wins!", player.friendIds.length ? `${player.friendIds.length} người bạn cùng đồng hành.` : 'Có bạn đồng hành, thêm niềm vui.'], Icon: UsersRound, tone: 'friends', action: onFriends },
    { id: 'feed', title: ['Little wins feed', 'Bảng tin niềm vui'], description: ['See what’s worth celebrating.', 'Cùng chúc mừng những bước tiến.'], Icon: Newspaper, tone: 'feed', action: onFeed },
    { id: 'achievements', title: ['Your milestones', 'Cột mốc của bạn'], description: [`${unlocked}/${achievements.length} achievements unlocked.`, `Đã mở ${unlocked}/${achievements.length} thành tích.`], Icon: Medal, tone: 'achievements', action: onAchievements },
    { id: 'avatar', title: ['Make it you', 'Đúng chất bạn'], description: ["A little character, all yours!", 'Một nhân vật mang dấu ấn riêng.'], Icon: Palette, tone: 'avatar', action: onAvatar },
  ];
  return <section className="community-shortcuts" aria-labelledby="community-shortcuts-title"><div className="community-section-heading"><span className="motivation-eyebrow">{tr('Your Narra world', 'Thế giới Narra của bạn')}</span><h2 id="community-shortcuts-title">{tr('Better with a little company.', 'Có bạn, học thêm vui.')}</h2></div>
    <div className="community-shortcut-grid">{links.map(({ id, title, description, Icon, tone, action }) => <button className={`community-shortcut community-${tone}`} onClick={action} key={id}><span className="community-medallion"><Icon size={25} strokeWidth={2.25} /></span><span className="community-shortcut-copy"><strong>{tr(title[0], title[1])}</strong><small>{tr(description[0], description[1])}</small></span><ArrowRight size={16} /></button>)}</div>
    <article className="narra-plus-teaser"><span className="plus-orbit plus-orbit-cyan" aria-hidden="true" /><span className="plus-orbit plus-orbit-lime" aria-hidden="true" /><div className="plus-teaser-content"><span className="plus-wordmark"><img src={brandAsset('logo-light.webp')} alt="Narra" /><span>PLUS</span></span><h3>{tr("A little extra, a lot more you!", "Thêm cảm hứng, thêm chất bạn!")}</h3><p>{tr('Narry has a few new things to explore with you in Narra Plus.', 'Narry có vài điều mới muốn cùng bạn khám phá trong Narra Plus nè.')}</p><button onClick={onPlans}>{tr('What’s in Plus?', 'Plus có gì hay?')}<ArrowRight size={16} /></button></div><img src={brandAsset('mascot.webp')} alt="" className="plus-teaser-buddy" draggable={false} /></article>
  </section>;
}
