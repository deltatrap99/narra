import { useState, type CSSProperties } from 'react';
import { brandAsset } from './brand-variant';
import './buddy-avatar.css';
import { legacyNarryMood, narryFrame, type NarryMood } from './narry-poses';

export type BuddyMood = NarryMood;
export type BuddyAvatarProps = {
  mood: BuddyMood;
  className?: string;
  size?: number | string;
  decorative?: boolean;
  alt?: string;
  motion?: boolean;
  priority?: boolean;
};

/** A mood is an illustration state, never an assessment of the learner. */
export function BuddyAvatar({ mood, className = '', size, decorative = true, alt = 'Narry', motion = true, priority = false }: BuddyAvatarProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const atlas = brandAsset('narry-emotions.png');
  const legacy = legacyNarryMood[mood];
  const primary = brandAsset(legacy === 'welcome' ? 'mascot.webp' : `mood-${legacy}.webp`);
  const candidates = [...new Set([atlas, primary, brandAsset('mascot.webp'), '/brand/mascot.webp'])];
  const source = candidates.find(candidate => !failed.includes(candidate));
  const classes = `buddy-avatar ${className}`.trim();
  const frame = narryFrame(mood);
  const style = { ...(size === undefined ? {} : { width: size, height: size }), '--narry-x': frame.x, '--narry-y': frame.y } as CSSProperties;
  const fail = () => setFailed(previous => !source || previous.includes(source) ? previous : [...previous, source]);

  // The brand mascot is the first fallback. A tiny local face also prevents a
  // broken-image glyph if the browser cannot retrieve any image at all.
  if (!source) return <span className={`${classes} buddy-avatar-placeholder`} style={style} data-buddy-mood={mood} data-buddy-motion={motion ? 'gentle' : 'still'} aria-hidden={decorative || undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt}><i /><i /></span>;

  if (source === atlas) return <span className={`${classes} narry-avatar-atlas`} style={style} data-buddy-mood={mood} data-buddy-motion={motion ? 'gentle' : 'still'} aria-hidden={decorative || undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt}><img className="narry-avatar-sheet" src={atlas} alt="" width={1254} height={1254} decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} draggable={false} onError={fail} /></span>;

  return <img className={classes} style={style} src={source} alt={decorative ? '' : alt} aria-hidden={decorative || undefined} data-buddy-mood={mood} data-buddy-motion={motion ? 'gentle' : 'still'} width={768} height={768} decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} draggable={false} onError={fail} />;
}

export default BuddyAvatar;
