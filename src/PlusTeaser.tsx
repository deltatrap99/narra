import { ArrowRight, Sparkles } from 'lucide-react';
import BuddyAvatar from './BuddyAvatar';
import { useCopy } from './state';
import './plans.css';

export default function PlusTeaser({ onOpen, compact = false }: { onOpen: () => void; compact?: boolean }) {
  const tr = useCopy();
  return <aside className={`plus-discovery ${compact ? 'plus-discovery-compact' : ''}`} aria-label={tr('Discover Narra Plus', 'Khám phá Narra Plus')}>
    <BuddyAvatar mood="curious" className="plus-discovery-buddy" motion={false} />
    <div className="plus-discovery-copy"><span className="plans-eyebrow"><Sparkles size={13} />NARRA PLUS <span>{tr('Coming soon', 'Sắp ra mắt')}</span></span><h2>{tr('Shall we learn a little more together?', 'Mình học thêm cùng nhau nhé?')}</h2><p>{tr('Narry has a few new things to explore with you in Narra Plus.', 'Narry có vài điều mới muốn cùng bạn khám phá trong Narra Plus nè.')}</p></div>
    <button type="button" onClick={onOpen}>{tr('What’s in Plus?', 'Plus có gì hay?')}<ArrowRight size={17} /></button>
  </aside>;
}
