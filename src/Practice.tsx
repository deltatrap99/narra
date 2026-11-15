import { useState } from 'react';
import { BriefcaseBusiness, ChevronRight, Clock3, Drama, MessageCircle, MessagesSquare, Mic, Play, Plus, Scale } from 'lucide-react';
import { scenarios, type Scenario } from './data';
import { useCopy, useNarra } from './state';
import { Avatar } from './ui';
import BuddyCoach from './BuddyCoach';
import './lesson-uat.css';
import './practice-polish.css';

type Props = { onTutors: () => void; onScenario: (scenario: Scenario) => void; onCreate: () => void; onTalk: () => void };
const modeEntries = [
  { type: 'Roleplay', vietnamese: 'Nhập vai', detail: ['A little everyday life', 'Tình huống quen thuộc'], Icon: Drama, tone: 'peach' },
  { type: 'Discussion', vietnamese: 'Thảo luận', detail: ['Let’s share a few ideas', 'Cùng chia sẻ ý tưởng'], Icon: MessagesSquare, tone: 'blue' },
  { type: 'Debate', vietnamese: 'Tranh luận', detail: ['Pick a side. Talk it through.', 'Thử bảo vệ ý kiến nhé'], Icon: Scale, tone: 'green' },
  { type: 'Interview', vietnamese: 'Phỏng vấn', detail: ['Tell a little of your story', 'Kể một chút về bạn'], Icon: BriefcaseBusiness, tone: 'yellow' },
] as const;
const scenarioGoalsVi: Record<string, string> = {
  usual: 'Gọi một ly cà phê và trò chuyện ngắn với nhân viên.',
  anywhere: 'Biến chuyến phiêu lưu tiếp theo thành một cuộc trò chuyện thú vị.',
  impression: 'Bước vào buổi phỏng vấn tiếp theo với sự tự tin.',
  remote: 'Chọn một phía, nêu lý lẽ và tự tin chia sẻ quan điểm.',
  habits: 'Chia sẻ những thói quen giúp bạn cảm thấy tốt hơn.',
};
const modeCoaching = {
  Roleplay: { message: ['Imagine we’ve just walked into a café. What would you like to order?', 'Mình thử ghé một quán cà phê nhé. Bạn muốn gọi món gì nào?'], tip: ['A friendly question is enough to get going.', 'Một câu hỏi thân thiện là đủ để bắt đầu.'], phrase: 'Could I have a latte, please?' },
  Discussion: { message: ['Got a little habit that makes your day better? Let’s start there.', 'Có thói quen nhỏ nào giúp ngày của bạn dễ chịu hơn không? Mình bắt đầu từ đó nhé.'], tip: ['Tell your tutor one small example from your own day.', 'Bạn thử kể một ví dụ nhỏ từ chính ngày của mình nhé.'], phrase: 'I think small habits make a big difference.' },
  Debate: { message: ['Working from home: better or worse? Pick a side, then let’s try one reason.', 'Làm việc ở nhà có tốt hơn không? Bạn chọn một phía, rồi mình thử nói lý do nhé.'], tip: ['You can disagree and still keep it friendly.', 'Mình vẫn có thể bất đồng một cách thân thiện mà.'], phrase: 'In my opinion, working from home is better because…' },
  Interview: { message: ['Let’s keep it simple: one strength, one real example. We can start there.', 'Mình cứ bắt đầu đơn giản nhé: một điểm mạnh, một ví dụ thật của bạn.'], tip: ['A short first answer gives your tutor something to ask about.', 'Cứ nói ngắn gọn trước, tutor sẽ hỏi thêm để bạn kể tiếp.'], phrase: 'One strength I would bring to the team is…' },
  All: { message: ['Something familiar makes it easier to begin. How about a little café roleplay?', 'Chuyện quen thuộc sẽ dễ mở lời hơn. Mình thử nhập vai ở quán cà phê nhé?'], tip: ['Pick a conversation you can imagine having in real life.', 'Bạn cứ chọn chuyện nào thấy gần gũi với mình nhé.'], phrase: 'Could I have a latte, please?' },
} as const;

export default function Practice({ onTutors, onScenario, onCreate, onTalk }: Props) {
  const tr = useCopy();
  const { profile } = useNarra();
  const [filter, setFilter] = useState<Scenario['type'] | 'All'>('Roleplay');
  const visibleScenarios = scenarios.filter(scenario => filter === 'All' || scenario.type === filter);
  const activeMode = modeEntries.find(mode => mode.type === filter);
  const coaching = modeCoaching[filter];
  return <div className="practice-page practice-uat">
    <div className="page-intro"><h1 className="section-title">{tr('What shall we talk about?', 'Mình nói chuyện gì hôm nay?')}</h1><p className="page-description">{tr('Pick something that feels like you. We’ll take it from there.', 'Chọn một chuyện gần gũi, rồi mình thử nói nhé.')}</p></div>
    <div className="practice-mode-grid" aria-label={tr('Speaking practice modes', 'Các hình thức luyện nói')}>{modeEntries.map(({ type, vietnamese, detail, Icon, tone }) => <button key={type} className={`practice-mode tone-${tone} ${filter === type ? 'active' : ''}`} aria-pressed={filter === type} onClick={() => setFilter(type)}><Icon size={23} /><span><strong>{tr(type, vietnamese)}</strong><small>{tr(detail[0], detail[1])}</small></span></button>)}</div>
    <BuddyCoach compact mood={filter === 'Debate' || filter === 'Interview' ? 'focus' : 'guide'} title={tr('Let’s find your first words.', 'Tớ gợi ý câu mở đầu nhé.')} message={tr(coaching.message[0], coaching.message[1])} tip={tr(coaching.tip[0], coaching.tip[1])} phrase={coaching.phrase} actionLabel={tr('Try this conversation', 'Mình thử nói nhé')} onAction={() => { if (visibleScenarios[0]) onScenario(visibleScenarios[0]); else setFilter('Roleplay'); }} />
    <div className="practice-results-heading"><h2>{activeMode ? tr(activeMode.type, activeMode.vietnamese) : tr('All conversations', 'Tất cả cuộc trò chuyện')}<span>{visibleScenarios.length}</span></h2><button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')} aria-pressed={filter === 'All'}>{tr('View all', 'Xem tất cả')}</button></div>
    <div className="practice-scenario-grid">{visibleScenarios.map(scenario => <article className={`practice-conversation-card card tone-${scenario.tone}`} key={scenario.id} data-scenario-id={scenario.id} aria-labelledby={`practice-title-${scenario.id}`}>
      <div className="practice-scenario-art" aria-hidden="true"><img src={`/assets/${scenario.asset}`} className="art practice-reserved-art" alt="" width="320" height="172" loading="lazy" decoding="async" draggable={false} /></div>
      <div className="practice-scenario-copy"><span className="scenario-tag">{tr(scenario.type, modeEntries.find(mode => mode.type === scenario.type)?.vietnamese ?? scenario.type)}</span><h2 id={`practice-title-${scenario.id}`}>{scenario.title}</h2><p className="practice-goal-label">{tr('Let’s try this', 'Mình thử nhé')}</p><p className="practice-scenario-goal">{tr(scenario.description, scenarioGoalsVi[scenario.id] ?? scenario.description)}</p><p className="practice-scenario-meta"><span>{tr('Level', 'Trình độ')} {scenario.level}</span><span><Clock3 size={13} />{scenario.minutes} {tr('min', 'phút')}</span></p></div>
      <button className="practice-start primary-button" onClick={() => onScenario(scenario)} aria-label={`${tr('Start practice', 'Bắt đầu luyện')}: ${scenario.title}`}><Play size={15} fill="currentColor" />{tr('Start practice', 'Bắt đầu luyện')}</button>
    </article>)}</div>
    {visibleScenarios.length === 0 && <p className="practice-no-results">{tr('Try another mode to find your next conversation.', 'Thử một hình thức khác để chọn cuộc trò chuyện tiếp theo.')}</p>}
    <button className="practice-create-row" onClick={onCreate}><Plus size={20} /><span><strong>{tr('Got something on your mind?', 'Bạn đang muốn nói về chuyện gì?')}</strong><small>{tr('Bring a topic and make it your next practice conversation.', 'Tự chọn chủ đề, rồi mình tạo một cuộc trò chuyện để thử nhé.')}</small></span><ChevronRight size={18} /></button>
    <section className="practice-secondary"><h2>{tr('Make it feel like you', 'Luyện theo cách bạn thích')}</h2><button className="practice-secondary-row" onClick={onTutors}><Avatar name={profile.tutor} /><span><strong>{tr('Choose your tutor', 'Chọn gia sư hợp với bạn')}</strong><small>{tr(`You’re speaking with ${profile.tutor}. Fancy a change?`, `Mình đang luyện cùng ${profile.tutor}. Bạn muốn đổi thử không?`)}</small></span><ChevronRight size={19} /></button><button className="practice-secondary-row" onClick={onTalk}><span className="practice-free-icon"><MessageCircle size={24} /><Mic size={13} /></span><span><strong>{tr('Free talk', 'Trò chuyện tự do')}</strong><small>{tr('No plan needed. Bring whatever’s on your mind.', 'Không cần nghĩ sẵn chủ đề. Có gì muốn kể, mình cứ nói thôi.')}</small></span><ChevronRight size={19} /></button></section>
  </div>;
}
