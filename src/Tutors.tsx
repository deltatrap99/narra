import { useEffect, useRef } from 'react';
import { ArrowLeft, Check, Mic } from 'lucide-react';
import { tutors } from './data';
import { useNarra } from './state';
import './subpages.css';

export default function Tutors({ onClose, onTalk }: { onClose: () => void; onTalk: () => void }) {
  const { profile, setProfile, notify } = useNarra(); const back = useRef<HTMLButtonElement>(null);
  useEffect(() => { back.current?.focus({ preventScroll: true }); }, []);
  function select(name: string, talk = false) { setProfile(p => ({ ...p, tutor: name })); if (talk) onTalk(); else notify(`${name} is now your tutor`); }
  const ordered = [...tutors].sort((a, b) => ['Skye', 'Henry', 'Camila', 'Dwayne'].indexOf(a.name) - ['Skye', 'Henry', 'Camila', 'Dwayne'].indexOf(b.name));
  return <section className="app-subpage tutors-subpage" aria-label="Tutors"><header className="subpage-header"><button ref={back} className="device-button" onClick={onClose} aria-label="Back to practice"><ArrowLeft size={22} /></button><h1>Tutors</h1><span className="subpage-header-spacer" /></header><div className="subpage-content tutor-gallery">{ordered.map((t, i) => <article className={`tutor-profile tutor-profile-${t.id}`} key={t.id}><div className="tutor-body-frame"><img src={`/assets/${t.id}-body.webp`} alt={t.name} className="tutor-body" /></div><div className="tutor-profile-copy"><h2>{t.name} <span className="tutor-flag">{t.id === 'henry' ? '🇬🇧' : '🇺🇸'}</span></h2><p className="tutor-accent">{t.accent.replace(' English', '')} · {['Warm & encouraging', 'Curious & creative', 'Calm & thoughtful', 'Focused & motivating'][i]}</p><p>{t.description}</p><div className="tutor-profile-actions"><button className={`pill-button ${profile.tutor === t.name ? 'chosen' : ''}`} onClick={() => select(t.name)}>{profile.tutor === t.name ? <><Check size={14} />Chosen</> : `Choose ${t.name}`}</button><button className="pill-button" onClick={() => select(t.name, true)}><Mic size={15} />Talk</button></div></div></article>)}</div></section>;
}
