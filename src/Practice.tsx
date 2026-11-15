import { useState } from 'react';
import { AudioLines, ChevronRight, FileSearch, Mic, Plus } from 'lucide-react';
import { scenarios, type Scenario } from './data';
import { Art, Avatar } from './ui';

export default function Practice({ onWriting, onPronunciation, onShadowing, onTutors, onScenario, onCreate }: { onWriting: () => void; onPronunciation: () => void; onShadowing: () => void; onTutors: () => void; onScenario: (s: Scenario) => void; onCreate: () => void }) {
  const [filter, setFilter] = useState('All');
  return <div className="practice-page"><div className="page-intro"><h1 className="section-title">Practice</h1><p className="page-description">Real conversations for real life.</p></div>
    <div className="practice-tools"><button className="tool-card tone-green" onClick={onWriting}><FileSearch size={28} /><span>Writing check</span></button><button className="tool-card tone-peach" onClick={onPronunciation}><AudioLines size={28} /><span>Pronunciation</span></button></div>
    <button className="feature-row tone-blue" onClick={onShadowing}><span className="feature-icon"><AudioLines size={23} /><Mic size={15} /></span><span><strong>Shadowing Studio</strong><small>Listen, repeat, or type what you hear</small></span><ChevronRight /></button>
    <button className="feature-row tone-lavender tutors-row" onClick={onTutors}><span className="avatar-stack"><Avatar name="Skye" /><span className="mini-tutor violet">A</span><Avatar /><span className="mini-tutor dark">M</span></span><strong>Choose your tutor</strong><ChevronRight /></button>
    <div className="chips scenario-filters" aria-label="Conversation type">{['All', 'Roleplay', 'Interview', 'Debate', 'Discussion'].map(type => <button className={`chip ${filter === type ? 'active' : ''}`} key={type} onClick={() => setFilter(type)} aria-pressed={filter === type}>{type}</button>)}</div>
    <div className="scenario-grid">{filter === 'All' && <button className="create-scenario" onClick={onCreate}><Plus size={35} strokeWidth={1.8} /><h2>Create your own</h2><p>From a topic, file or photo</p></button>}{scenarios.filter(s => filter === 'All' || s.type === filter).map(s => <button className={`scenario-card tone-${s.tone}`} key={s.id} onClick={() => onScenario(s)}><Art name={s.asset.replace(/\.webp$/, '')} /><div className="scenario-copy"><span className="scenario-tag">{s.type}</span><h2>{s.title}</h2><p>{s.description}</p><small>{s.level} · {s.minutes} min</small></div></button>)}</div>
  </div>;
}
