import { useState, type CSSProperties } from 'react';
import { brandAsset } from './brand-variant';
import './buddy-avatar.css';

export type BuddyMood = 'welcome' | 'focus' | 'curious' | 'encourage' | 'celebrate' | 'proud';
export type BuddyAvatarProps = {
  mood: BuddyMood;
  className?: string;
  size?: number | string;
  decorative?: boolean;
  alt?: string;
  motion?: boolean;
};

/** A mood is an illustration state, never an assessment of the learner. */
export function BuddyAvatar({ mood, className = '', size, decorative = true, alt = 'Buddy', motion = true }: BuddyAvatarProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const primary = brandAsset(mood === 'welcome' ? 'mascot.webp' : `mood-${mood}.webp`);
  const candidates = [...new Set([primary, brandAsset('mascot.webp'), '/brand/mascot.webp'])];
  const source = candidates.find(candidate => !failed.includes(candidate));
  const classes = `buddy-avatar ${className}`.trim();
  const style: CSSProperties | undefined = size === undefined ? undefined : { width: size, height: size };

  // The brand mascot is the first fallback. A tiny local face also prevents a
  // broken-image glyph if the browser cannot retrieve any image at all.
  if (!source) return <span className={`${classes} buddy-avatar-placeholder`} style={style} data-buddy-mood={mood} data-buddy-motion={motion ? 'gentle' : 'still'} aria-hidden={decorative || undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt}><i /><i /></span>;

  return <img className={classes} style={style} src={source} alt={decorative ? '' : alt} aria-hidden={decorative || undefined} data-buddy-mood={mood} data-buddy-motion={motion ? 'gentle' : 'still'} width={768} height={768} decoding="async" loading="lazy" draggable={false} onError={() => setFailed(previous => previous.includes(source) ? previous : [...previous, source])} />;
}

export default BuddyAvatar;
