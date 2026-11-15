import { useState } from 'react';
import { ChevronRight, ChevronsUpDown, Heart, MonitorSmartphone, ShieldCheck, Smartphone, UserRoundPlus } from 'lucide-react';
import { useNarra } from './state';
import { Avatar, Modal } from './ui';

export default function Profile({ onTutors }: { onTutors: () => void }) {
  const { profile, setProfile } = useNarra();
  const [account, setAccount] = useState(false);
  const [about, setAbout] = useState(false);
  function choose(key: 'level' | 'goal' | 'language' | 'dailyGoal', value: string) { setProfile(p => ({ ...p, [key]: key === 'dailyGoal' ? Number(value) : value })); }
  const fields = [
    { key: 'level' as const, label: 'Level', options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    { key: 'goal' as const, label: 'Goal', options: ['Study abroad', 'Career growth', 'Travel', 'Everyday confidence', 'Make friends'] },
    { key: 'language' as const, label: 'Native language', options: ['Vietnamese', 'English', 'Thai', 'Spanish', 'French', 'Japanese', 'Korean', 'Chinese'] },
    { key: 'dailyGoal' as const, label: 'Daily goal', options: ['5', '10', '15', '20', '30'] },
  ];
  return <div className="profile-page"><h1>Profile</h1><section className="card profile-summary"><Avatar /><div><h2>{profile.name}</h2><p>Guest on this device</p></div><Smartphone className="muted" size={23} /></section>
    <h2 className="section-label">Account</h2><section className="card account-card"><button className="account-action" onClick={() => setAccount(true)}><UserRoundPlus size={25} /><span>Sign in or create account</span><ChevronRight size={19} /></button><p>An account syncs your progress with the web app and unlocks the AI tutor.</p></section>
    <h2 className="section-label">Learning</h2><section className="card settings-card"><label className="setting-row"><span className="sr-only">Your name</span><input aria-label="Your name" value={profile.name} maxLength={35} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} onBlur={() => { if (!profile.name.trim()) setProfile(p => ({ ...p, name: 'Tuan Quoc' })); }} /></label>{fields.map(field => <label className="setting-row" key={field.key}><span>{field.label}</span><span className="select-wrap"><select aria-label={field.label} value={String(profile[field.key])} onChange={e => choose(field.key, e.target.value)}>{field.options.map(o => <option value={o} key={o}>{field.key === 'dailyGoal' ? `${o} min` : o}</option>)}</select><ChevronsUpDown size={18} /></span></label>)}<button className="setting-row" onClick={onTutors}><span>Tutor</span><span className="purple">{profile.tutor} <ChevronsUpDown size={18} /></span></button></section>
    <h2 className="section-label">Conversation</h2><section className="card settings-card"><div className="setting-row"><div><span>Feedback & corrections</span><small className="muted">A little guidance as you practise</small></div><button role="switch" aria-label="Feedback and corrections" aria-checked={profile.feedback} className={`switch ${profile.feedback ? 'on' : ''}`} onClick={() => setProfile(p => ({ ...p, feedback: !p.feedback }))} /></div><div className="setting-row"><span>Sound effects</span><button role="switch" aria-label="Sound effects" aria-checked={profile.sound} className={`switch ${profile.sound ? 'on' : ''}`} onClick={() => setProfile(p => ({ ...p, sound: !p.sound }))} /></div></section>
    <h2 className="section-label">Made for your journey</h2><section className="card settings-card"><button className="setting-row" onClick={() => setAbout(true)}><span><Heart size={19} /> About Narra</span><ChevronRight size={19} /></button><div className="setting-row"><span><ShieldCheck size={19} /> Your progress is saved</span><span className="muted">On this device</span></div></section><div className="profile-footer"><img src="/brand/logo-dark.webp" alt="Narra" /><span>Your voice. Your story.</span></div>
    {account && <Modal title="Your journey, everywhere" onClose={() => setAccount(false)}><div className="dialog-illustration tone-lavender"><MonitorSmartphone size={48} /></div><p className="dialog-description">You’re exploring the Narra interface preview. Your learning preferences and progress are saved in this browser.</p><p className="muted">Account sign-in, cloud sync and live AI tutoring are not connected in this preview.</p><button className="primary-button full-width" onClick={() => setAccount(false)}>Continue as guest</button></Modal>}
    {about && <Modal title="A little more you." onClose={() => setAbout(false)}><p className="dialog-description">Narra is a calmer place to find your voice in English. One small conversation, one new word, one good habit at a time.</p><p className="muted">Interface prototype · Built from the supplied app references.</p><button className="primary-button full-width" onClick={() => setAbout(false)}>Let’s keep learning</button></Modal>}
  </div>;
}
