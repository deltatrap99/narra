import { useState } from 'react';
import { brandAsset, isOption5 } from './brand-variant';
import type { TutorPose } from './tutor-art';
import './tutor-avatar.css';

const tutorSprite = brandAsset(isOption5 ? 'tutor-mic-sprites.png' : 'tutor-desk-sprites.png');

export function TutorArtwork({ pose = 'speaking', name, onLoad, onError, className = '' }: { pose?: TutorPose; name: string; onLoad?: () => void; onError?: () => void; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={`tutor-artwork ${className}`} data-pose={pose} role="img" aria-label={`${name} · Narry, ${isOption5 ? 'headphones' : 'smartphone'} & study desk`}>{failed ? <img className="tutor-artwork-fallback" src={brandAsset('mascot.webp')} alt="" /> : <img className="tutor-artwork-sheet" src={tutorSprite} width={2172} height={724} alt="" aria-hidden="true" draggable={false} decoding="async" onLoad={onLoad} onError={() => { setFailed(true); onError?.(); }} />}</span>;
}

export function TutorPortrait({ name, className = '' }: { name: string; className?: string }) {
  const [fallback, setFallback] = useState(false);
  return <span className={`avatar tutor-portrait ${className}`} role="img" aria-label={name}>{fallback ? <img src={brandAsset('mascot.webp')} alt="" /> : <span className="tutor-portrait-crop"><img src={tutorSprite} alt="" width={2172} height={724} draggable={false} onError={() => setFallback(true)} /></span>}</span>;
}
