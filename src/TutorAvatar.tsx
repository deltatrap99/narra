import { useEffect, useRef, useState } from 'react';
import type { SpeechPlayback } from './speech';
import { brandAsset } from './brand-variant';
import { useCopy } from './state';
import { TutorArtwork } from './TutorArtwork';
import { tutorPose, type TutorMode } from './tutor-art';
import './tutor-avatar.css';

export type TutorAvatarProps = {
  tutor: string;
  mode: TutorMode;
  speech?: Pick<SpeechPlayback, 'id' | 'charIndex' | 'charLength' | 'text' | 'boundaryAt'>;
  greeting?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
};

/** Illustrated expressions follow playback state, without a simulated camera
 * connection or a claim of phoneme-accurate lip synchronization. */
export default function TutorAvatar(props: TutorAvatarProps) {
  const tr = useCopy();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [beat, setBeat] = useState(0);
  const [welcoming, setWelcoming] = useState(!!props.greeting);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const live = useRef(props); live.current = props;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!props.greeting || reduced || status !== 'ready') return;
    const timer = setTimeout(() => setWelcoming(false), 1100);
    return () => clearTimeout(timer);
  }, [props.greeting, reduced, status]);
  useEffect(() => {
    setBeat(0);
    if (props.mode !== 'speaking' || reduced || status !== 'ready') return;
    const timer = setInterval(() => setBeat(value => (value + 1) % 8), 420);
    return () => clearInterval(timer);
  }, [props.mode, props.speech?.id, reduced, status]);

  const pose = tutorPose(props.mode, beat, welcoming && !reduced);
  return <div className="tutor-avatar-render mascot-tutor" data-state={status} data-mode={props.mode} data-reduced={reduced}>
    {status !== 'error' ? <TutorArtwork key={attempt} pose={pose} name={props.tutor} onLoad={() => { setStatus('ready'); live.current.onReady?.(); }} onError={() => { setStatus('error'); live.current.onError?.('Mascot illustration could not load'); }} /> : <div className="mascot-tutor-fallback"><img src={brandAsset('mascot.webp')} alt={tr(`${props.tutor}, your Buddy companion`, `${props.tutor}, người bạn Buddy`)} /><p>{tr('The desk scene could not load, your conversation still works.', 'Cảnh bàn học chưa tải được, mình vẫn trò chuyện được nhé.')}<button type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>{tr('Reload mascot', 'Tải lại mascot')}</button></p></div>}
    {status === 'loading' && <div className="call-model-loading" role="status"><span className="avatar-load-ring" /><strong>{tr(`${props.tutor} is getting comfy at the desk…`, `${props.tutor} đang vào bàn, hóng chuyện bạn nè…`)}</strong></div>}
  </div>;
}
