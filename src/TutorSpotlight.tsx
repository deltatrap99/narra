import { Check, Play, Volume2 } from 'lucide-react';
import { tutors } from './data';
import { useCopy, useNarra } from './state';
import { Avatar } from './ui';
import './tutor-spotlight.css';

export type TutorSpotlightProps = { onPreview: (name: string) => void; compact?: boolean };
const order = ['Skye', 'Henry', 'Camila', 'Dwayne'];

export function TutorSpotlight({ onPreview, compact = false }: TutorSpotlightProps) {
  const tr = useCopy(); const { profile } = useNarra();
  return <section className={'tutor-spotlight '+(compact ? 'is-compact' : '')} aria-label={tr('Meet your tutors and hear a greeting', 'Gặp gia sư và nghe lời chào')}>
    <div className="tutor-spotlight-heading"><div><span>{tr('AI TUTORS, A LITTLE HELLO', 'GIA SƯ AI, MỘT LỜI CHÀO NHỎ')}</span><h2>{tr('Your AI tutors', 'Gia sư AI của bạn')}</h2></div><p>{tr('Tap a tutor. Hear a hello. Find your kind of conversation.', 'Mình chọn gia sư nhé? Bạn chạm vào một gương mặt để nghe lời chào nè.')}</p></div>
    <div className="tutor-spotlight-grid">{[...tutors].sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name)).map(tutor=><button type="button" className={'tutor-spotlight-card tutor-card-'+tutor.id+(profile.tutor===tutor.name?' is-selected':'')} key={tutor.id} onClick={()=>onPreview(tutor.name)} aria-label={tr('Hear '+tutor.name+' say hello','Nghe lời chào của '+tutor.name)}><span className="tutor-spotlight-portrait"><Avatar name={tutor.name}/><span className="tutor-spotlight-play"><Play size={13} fill="currentColor"/></span></span><strong>{tutor.name}</strong><small>{tr(tutor.accent,tutor.id==='henry'?'Giọng Anh':'Giọng Mỹ')}</small><span className="tutor-spotlight-hear"><Volume2 size={15}/>{tr('Hear a hello','Nghe lời chào')}</span>{profile.tutor===tutor.name&&<span className="tutor-spotlight-chosen"><Check size={10}/>{tr('Your companion','Đang đồng hành')}</span>}</button>)}</div>
  </section>;
}

export default TutorSpotlight;
