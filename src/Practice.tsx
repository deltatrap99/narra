import { useState } from 'react';
import { BriefcaseBusiness, ChevronRight, Clock3, Drama, MessagesSquare, Plus, Scale, Users } from 'lucide-react';
import { scenarios, type Scenario } from './data';
import { useCopy, useNarra } from './state';
import { Avatar } from './ui';
import { FocusHero, QuietSection } from './FocusLayout';
import './lesson-uat.css';
import './practice-polish.css';

type Props = { onTutors: () => void; onScenario: (scenario: Scenario) => void; onCreate: () => void; onTalk: () => void; onTutorPreview: (name: string) => void };
const modes = [
  { type: 'Roleplay', vi: 'Nhập vai', Icon: Drama },
  { type: 'Discussion', vi: 'Thảo luận', Icon: MessagesSquare },
  { type: 'Debate', vi: 'Tranh luận', Icon: Scale },
  { type: 'Interview', vi: 'Phỏng vấn', Icon: BriefcaseBusiness },
] as const;
const goalsVi: Record<string, string> = {
  usual: 'Gọi món ở quán cà phê.', anywhere: 'Kể về chuyến đi bạn mong chờ.', impression: 'Chuẩn bị cho buổi phỏng vấn.',
  remote: 'Chia sẻ quan điểm về làm việc từ xa.', habits: 'Kể một thói quen khiến bạn vui hơn.',
};

export default function Practice({ onTutors, onScenario, onCreate, onTalk, onTutorPreview }: Props) {
  const tr = useCopy(); const { profile } = useNarra();
  const [filter, setFilter] = useState<Scenario['type'] | 'All'>('Roleplay');
  const visible = scenarios.filter(s => filter === 'All' || s.type === filter);
  const suggested = scenarios.filter(s => ['usual', 'habits', 'impression'].includes(s.id)).slice(0, 3);
  return <div className="practice-page practice-uat focus-page">
    <FocusHero eyebrow={tr('A LITTLE ROOM TO TALK', 'MỘT CHÚT CHUYỆN ĐỂ KỂ')} title={tr('What’s on your mind?', 'Có chuyện gì, kể Narry nghe!')} description={tr('I’m all ears, bring me a little story!', 'Tớ hóng sẵn rồi, bạn mang câu chuyện tới nhé!')} action={tr('Let’s talk', 'Mình nói chuyện nhé')} onAction={onTalk} mood="listening" meta={<><Avatar name={profile.tutor} /><span>{tr('With', 'Cùng')} {profile.tutor}</span></>} />
    <section className="focus-suggestions" aria-labelledby="suggestions-title"><h2 id="suggestions-title">{tr('Or try a little situation', 'Hoặc thử một tình huống nhỏ')}</h2><div>{suggested.map(s => <button type="button" key={s.id} onClick={() => onScenario(s)}><span><strong>{s.title}</strong><small>{s.minutes} {tr('min', 'phút')}</small></span><ChevronRight size={18} /></button>)}</div></section>
    <div className="focus-disclosures">
      <QuietSection icon={<Drama size={20} />} title={tr('More ways to practise', 'Thử một cách luyện khác')} summary={tr('4 ways', '4 hình thức')}>
        <div className="focus-mode-tabs" aria-label={tr('Speaking practice modes', 'Các hình thức luyện nói')}>{modes.map(({ type, vi, Icon }) => <button type="button" key={type} aria-pressed={filter === type} onClick={() => setFilter(type)}><Icon size={17} />{tr(type, vi)}</button>)}<button type="button" aria-pressed={filter === 'All'} onClick={() => setFilter('All')}>{tr('All', 'Tất cả')}</button></div>
        <div className="focus-scenario-grid">{visible.map(s => <article key={s.id} data-scenario-id={s.id}><img src={`/assets/${s.asset}`} alt="" loading="lazy" /><div><h3>{s.title}</h3><p>{tr(s.description, goalsVi[s.id] ?? s.description)}</p><span><Clock3 size={13} />{s.minutes} {tr('min', 'phút')}</span><button type="button" className="focus-secondary" onClick={() => onScenario(s)} aria-label={tr('Try ', 'Thử ')+s.title}>{tr('Try this one', 'Thử chuyện này')}<ChevronRight size={16} /></button></div></article>)}</div>
        {!visible.length && <p>{tr('Try another mode for your next conversation.', 'Mình chọn một hình thức khác nhé.')}</p>}
        <button type="button" className="focus-tool-row" onClick={onCreate}><Plus size={20} /><span>{tr('Bring my own topic', 'Tự chọn một chủ đề')}</span><ChevronRight size={17} /></button>
      </QuietSection>
      <QuietSection icon={<Users size={20} />} title={tr('My learning companion', 'Người bạn đồng hành')} summary={profile.tutor}><div className="focus-tutor-row"><button type="button" className="focus-tutor-preview" onClick={() => onTutorPreview(profile.tutor)}><Avatar name={profile.tutor} /><span><strong>{profile.tutor}</strong><small>{tr('Hear a little hello', 'Nghe một lời chào')}</small></span></button><button type="button" className="focus-text-button" onClick={onTutors}>{tr('Change tutor', 'Đổi gia sư')}<ChevronRight size={16} /></button></div></QuietSection>
    </div>
  </div>;
}
