import { useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import BuddyAvatar, { type BuddyMood } from './BuddyAvatar';

export function FocusHero({ eyebrow, title, description, action, onAction, mood = 'welcome', meta }: { eyebrow: string; title: string; description: string; action: string; onAction: () => void; mood?: BuddyMood; meta?: ReactNode }) {
  return <section className="focus-hero">
    <div className="focus-hero-copy"><span className="focus-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p><button type="button" className="focus-primary" onClick={onAction}>{action}<ArrowRight size={20} /></button>{meta && <div className="focus-hero-meta">{meta}</div>}</div>
    <div className="focus-hero-stage" aria-hidden="true"><span className="focus-hero-orbit" /><BuddyAvatar mood={mood} size={248} /></div>
  </section>;
}

export function QuietSection({ title, summary, icon, children }: { title: string; summary?: string; icon?: ReactNode; children: ReactNode }) {
  const [visited, setVisited] = useState(false);
  return <details className="quiet-section" onToggle={event => { if (event.currentTarget.open) setVisited(true); }}><summary><span className="quiet-section-label">{icon}<strong>{title}</strong></span>{summary && <small>{summary}</small>}<ChevronDown className="quiet-section-arrow" size={19} /></summary><div className="quiet-section-content">{visited && children}</div></details>;
}
