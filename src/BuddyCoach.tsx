import { useId, useState } from 'react';
import { ArrowRight, ChevronDown, Lightbulb, Sparkles, Target, Volume2 } from 'lucide-react';
import { speak, useCopy, useNarra } from './state';
import BuddyAvatar, { type BuddyMood } from './BuddyAvatar';
import './buddy-coach.css';

export type BuddyCoachProps = {
  title?: string;
  message: string;
  tip?: string;
  phrase?: string;
  actionLabel?: string;
  onAction?: () => void;
  mood?: 'guide' | 'cheer' | 'focus';
  compact?: boolean;
  avatarMood?: BuddyMood;
  showAvatar?: boolean;
};

export function BuddyCoach({ title, message, tip, phrase, actionLabel, onAction, mood = 'guide', compact = false, avatarMood, showAvatar = true }: BuddyCoachProps) {
  const tr = useCopy(); const { notify, profile } = useNarra(); const [expanded, setExpanded] = useState(false); const tipId = useId();
  const heading = title ?? (mood === 'cheer' ? tr('Narry is cheering for you!', 'Narry cổ vũ bạn nè!') : mood === 'focus' ? tr('One sentence with Narry.', 'Thử một câu với Narry nhé.') : tr('Narry has a little idea.', 'Narry có ý này nè!'));
  const Icon = mood === 'cheer' ? Sparkles : mood === 'focus' ? Target : Lightbulb;
  const expression: BuddyMood = expanded ? 'thinking' : avatarMood ?? (mood === 'cheer' ? 'celebrate' : mood === 'focus' ? 'focus' : 'curious');
  return <aside className={'buddy-coach buddy-coach-'+mood+(compact ? ' buddy-coach-compact' : '')} aria-label={heading}>
    <div className="buddy-coach-main">{showAvatar && <div className="buddy-coach-portrait" aria-hidden="true"><BuddyAvatar mood={expression} /><span className="buddy-coach-badge"><Icon size={16} strokeWidth={2.5} /></span></div>}<div className="buddy-coach-copy"><h2>{heading}</h2><p>{message}</p><div className="buddy-coach-controls">{(tip || phrase) && <button type="button" className="buddy-coach-tip-toggle" aria-expanded={expanded} aria-controls={tipId} onClick={() => setExpanded(value => !value)}><Lightbulb size={17} />{expanded ? tr('Hide the hint', 'Ẩn gợi ý') : tr('A little hint from Narry', 'Gợi ý nhỏ từ Narry')}<ChevronDown size={16} className={expanded ? 'is-open' : ''} /></button>}{actionLabel && onAction && <button type="button" className="buddy-coach-action" onClick={onAction}>{actionLabel}<ArrowRight size={17} /></button>}</div></div></div>
    {(tip || phrase) && <div id={tipId} className="buddy-coach-expanded" hidden={!expanded}>{tip && <p>{tip}</p>}{phrase && <div className="buddy-coach-phrase"><span>{tr('Shall we try this phrase?', 'Mình thử câu này nhé?')}</span><p lang="en">“{phrase}”</p><button type="button" onClick={() => { if (!speak(phrase, profile.tutor === 'Henry' ? 'en-GB' : 'en-US')) notify(tr("While audio isn’t available in this browser just yet, you can read the phrase and give it a try.", "Trình duyệt này chưa phát được âm thanh, bạn thử đọc câu này với tớ nhé.")); }}><Volume2 size={19} />{tr('Listen to the phrase', 'Nghe câu mẫu')}</button></div>}</div>}
  </aside>;
}

export default BuddyCoach;
