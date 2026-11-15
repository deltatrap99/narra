import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, CircleCheck, CopyPlus, Keyboard, Lightbulb, MessageCircle, Mic, Sparkles, SpellCheck, UserRound, Volume2, X } from 'lucide-react';
import type { Scenario, Word } from './data';
import { speak, useNarra } from './state';
import { Avatar, Modal } from './ui';
import './conversation.css';

type Message = { id: string; role: 'tutor' | 'user'; text: string; translation?: string };
type ChatKind = 'cafe' | 'interview' | 'travel' | 'free';
type Panel = 'hint' | 'translate' | 'feedback' | 'level' | null;
type UsefulWord = Pick<Word, 'word' | 'definition' | 'example'>;
const id = () => crypto.randomUUID();
const freeOpening = { text: 'Hey! I’m glad you’re here. What has been the best part of your day?', translation: 'Chào bạn! Mình rất vui vì bạn có mặt ở đây. Điều tuyệt nhất trong ngày hôm nay của bạn là gì?' };

function kindFor(scenario?: Scenario): ChatKind {
  if (scenario?.type === 'Interview') return 'interview';
  if (scenario?.id === 'usual' || /café|cafe|coffee/i.test(`${scenario?.title} ${scenario?.description}`)) return 'cafe';
  if (scenario?.id === 'anywhere') return 'travel';
  return 'free';
}

function openingFor(kind: ChatKind) {
  if (kind === 'cafe') return { text: 'Welcome to our little café! What can I get you today?', translation: 'Chào mừng bạn đến với quán cà phê nhỏ của chúng mình! Hôm nay bạn muốn dùng gì?' };
  if (kind === 'interview') return { text: 'Hi! It’s lovely to meet you. Could you tell me a little about yourself and the role you’re interested in?', translation: 'Chào bạn! Rất vui được gặp bạn. Bạn có thể giới thiệu đôi nét về bản thân và vị trí mà bạn quan tâm không?' };
  if (kind === 'travel') return { text: 'Welcome! Where are you planning to go on your next adventure?', translation: 'Chào bạn! Bạn đang dự định đến đâu trong chuyến phiêu lưu tiếp theo?' };
  return freeOpening;
}

function sampleReply(text: string, kind: ChatKind, turn: number): Pick<Message, 'text' | 'translation'> {
  if (/guess what/i.test(text)) return { text: 'Guess what? I love a good surprise — tell me everything! What’s the news?', translation: 'Có chuyện gì vậy? Mình rất thích những điều bất ngờ thú vị — kể cho mình nghe tất cả nhé! Có tin gì mới thế?' };
  if (/\bno\b.*(chan[gp]ed|change)/i.test(text)) return { text: 'Got it, so it’s still nice and cool where you are. Try saying that as a full sentence: “No, the weather hasn’t changed much.” What’s your favourite thing to do outside when it’s cool like this?', translation: 'Mình hiểu rồi, vậy chỗ bạn vẫn dễ chịu và mát mẻ. Hãy thử nói thành câu đầy đủ: “Không, thời tiết không thay đổi nhiều.” Bạn thích làm gì nhất ngoài trời khi thời tiết mát mẻ như thế này?' };
  if (/walk|park|morning|weather|cool|sunny|raining/i.test(text) && kind === 'free') return { text: 'That sounds so peaceful! You could describe cool, fresh weather as “crisp”. What did you notice on your walk?', translation: 'Nghe thật yên bình! Bạn có thể dùng từ “crisp” để miêu tả thời tiết mát và trong lành. Bạn đã để ý thấy điều gì trong lúc đi dạo?' };
  if (kind === 'cafe') {
    if (/takeaway|take away|to go/i.test(text)) return { text: 'Of course — I’ll prepare that to take away. Would you like anything to eat with your drink?', translation: 'Tất nhiên rồi — mình sẽ chuẩn bị đồ mang đi cho bạn. Bạn có muốn dùng thêm món gì cùng đồ uống không?' };
    if (/pastry|pastries|croissant|cake|recommend/i.test(text)) return { text: 'The almond croissant is a favourite. Would you like one with your drink? There’s a cosy table by the window.', translation: 'Bánh sừng bò hạnh nhân là món được nhiều người yêu thích. Bạn có muốn dùng một chiếc cùng đồ uống không? Có một bàn ấm cúng bên cửa sổ đấy.' };
    if (/coffee|latte|cappuccino|tea|drink|usual|espresso/i.test(text)) return { text: 'Lovely choice! Would you like that to stay or to take away? I can also recommend our almond croissant.', translation: 'Lựa chọn tuyệt đấy! Bạn muốn dùng tại quán hay mang đi? Mình cũng có thể gợi ý món bánh sừng bò hạnh nhân của quán.' };
    return { text: 'Take your time! What do you usually like to drink? I’m happy to recommend something.', translation: 'Bạn cứ từ từ chọn nhé! Bạn thường thích uống gì? Mình rất sẵn lòng gợi ý một món cho bạn.' };
  }
  if (kind === 'interview') return /team|skill|experience|project|worked/i.test(text)
    ? { text: 'That’s a helpful example. What did you personally contribute, and what did you learn from the experience?', translation: 'Đó là một ví dụ hữu ích. Cá nhân bạn đã đóng góp điều gì và học được gì từ trải nghiệm đó?' }
    : { text: 'Thank you for introducing yourself. Could you share a specific example of a challenge you helped solve?', translation: 'Cảm ơn bạn đã giới thiệu bản thân. Bạn có thể chia sẻ một ví dụ cụ thể về khó khăn mà bạn đã góp phần giải quyết không?' };
  if (kind === 'travel') return { text: 'That sounds like a lovely adventure. What would you put on your itinerary, and what are you most looking forward to?', translation: 'Nghe như một chuyến phiêu lưu tuyệt vời. Bạn sẽ đưa những gì vào lịch trình và mong chờ điều gì nhất?' };
  return turn % 2 === 0
    ? { text: 'Thanks for sharing that with me. Could you tell me one specific example? A little detail helps bring your story to life.', translation: 'Cảm ơn bạn đã chia sẻ với mình. Bạn có thể kể một ví dụ cụ thể không? Một chút chi tiết sẽ giúp câu chuyện của bạn sinh động hơn.' }
    : { text: 'That sounds interesting. What do you enjoy most about it, and why?', translation: 'Nghe thú vị đấy. Bạn thích điều gì nhất ở việc đó, và vì sao?' };
}

function hintFor(kind: ChatKind, previous: string) {
  if (/guess what/i.test(previous)) return 'You won’t believe it, but I just got accepted into the exchange program I applied for. I’m still in shock!';
  if (/chan[gp]ed|weather/i.test(previous)) return 'No, the weather hasn’t changed much. It’s still cool, so I’ve been enjoying my morning walks.';
  if (kind === 'cafe') return 'Hi! Could I have a latte, please? What pastries would you recommend?';
  if (kind === 'interview') return 'I enjoy working with a team. In my last project, I helped us solve a problem by listening carefully and sharing a clear plan.';
  if (kind === 'travel') return 'I’d love to visit somewhere new. I’m looking forward to trying the local food and making the most of every day.';
  return 'The best part of my day was my morning walk. The weather was cool, and it helped me feel ready for the day.';
}

function improvedReply(text: string, kind: ChatKind) {
  if (/\bno\b.*(chan[gp]ed|change)/i.test(text)) return { suggestion: 'No, the weather hasn’t changed much.', note: /chanped/i.test(text) ? 'Use “changed” instead of “chanped”. Naming “the weather” makes your meaning clearer, and “hasn’t” sounds natural in conversation.' : 'Your meaning is clear. Naming “the weather” adds context, and “hasn’t” sounds natural in conversation.' };
  if (/guess what/i.test(text)) return { suggestion: 'Guess what? I’ve got some exciting news to share!', note: '“Guess what?” is a natural conversation starter. Add a second sentence to give your listener a little more context.' };
  if (kind === 'cafe' && /latte|coffee|cappuccino|tea|espresso/i.test(text)) {
    const drink = text.match(/latte|coffee|cappuccino|tea|espresso/i)?.[0].toLowerCase() ?? 'coffee';
    return { suggestion: `Could I have a ${drink}, please? What pastry would you recommend?`, note: '“Could I have …, please?” is a friendly way to order. A follow-up question helps keep the conversation going.' };
  }
  return { suggestion: `${text.trim().replace(/[.!?]+$/, '')}. One thing I especially enjoy about it is…`, note: 'Try adding one specific detail or a reason. Finish this suggested sentence with your own idea so it stays true to your experience.' };
}

function wordsFor(kind: ChatKind): UsefulWord[] {
  if (kind === 'cafe') return [
    { word: 'usual', definition: 'the thing you normally have, do, or choose', example: 'Could I have my usual coffee, please?' },
    { word: 'recommend', definition: 'to suggest something that you think is good or suitable', example: 'What pastry would you recommend?' },
    { word: 'takeaway', definition: 'food or a drink bought to be eaten or drunk somewhere else', example: 'I’d like a takeaway coffee, please.' },
  ];
  if (kind === 'interview') return [
    { word: 'contribute', definition: 'to give your time, ideas, or effort to help achieve something', example: 'Everyone on the team can contribute a different idea.' },
    { word: 'experience', definition: 'knowledge or skill gained by doing something', example: 'This project gave me valuable experience.' },
    { word: 'initiative', definition: 'the ability to act and make decisions without being told', example: 'She showed initiative by suggesting a better way to work.' },
  ];
  if (kind === 'travel') return [
    { word: 'itinerary', definition: 'a plan for a journey', example: 'Our itinerary includes two museums.' },
    { word: 'adventure', definition: 'an exciting or unusual experience', example: 'Our trip was a wonderful adventure.' },
    { word: 'look forward to', definition: 'to feel pleased and excited about something that is going to happen', example: 'I look forward to trying the local food.' },
  ];
  return [
    { word: 'crisp', definition: 'pleasantly cool and fresh, especially when describing weather', example: 'It was a crisp morning, perfect for a walk.' },
    { word: 'peaceful', definition: 'quiet and calm, without worry or disturbance', example: 'The park is peaceful in the early morning.' },
    { word: 'make the most of', definition: 'to use something in the best possible way', example: 'I try to make the most of every day.' },
  ];
}

function restoreDraft(key: string, opening: ReturnType<typeof openingFor>): Message[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (Array.isArray(stored)) {
      const messages = stored.filter((message): message is Message => message !== null && typeof message === 'object' && typeof message.id === 'string' && (message.role === 'tutor' || message.role === 'user') && typeof message.text === 'string' && message.text.trim().length > 0 && message.text.length <= 5000 && (message.translation === undefined || (typeof message.translation === 'string' && message.translation.length <= 5000))).slice(-120);
      if (messages.some(message => message.role === 'tutor')) return messages;
      if (messages.length) return [{ id: id(), role: 'tutor', ...opening }, ...messages];
    }
  } catch { /* A new conversation remains available when a draft cannot be read. */ }
  return [{ id: id(), role: 'tutor', ...opening }];
}

export default function Conversation({ scenario, onClose }: { scenario?: Scenario; onClose: () => void }) {
  const { profile, setStats, logActivity, notify } = useNarra();
  const kind = kindFor(scenario);
  const draftKey = `narra-conversation-v1:${profile.tutor}:${scenario?.id ?? 'free'}`;
  const [messages, setMessages] = useState<Message[]>(() => restoreDraft(draftKey, openingFor(kind)));
  const [input, setInput] = useState('');
  const [view, setView] = useState<'chat' | 'avatar'>('chat');
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedReply, setSelectedReply] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedFinish = useRef(false);
  const userMessages = messages.filter(message => message.role === 'user');
  const lastUser = userMessages.at(-1)?.text ?? '';
  const lastTutor = [...messages].reverse().find(message => message.role === 'tutor')!;
  const hint = hintFor(kind, lastUser);
  const title = scenario?.title ?? 'Let’s just talk';
  const suggestedWords = wordsFor(kind);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = oldOverflow; window.speechSynthesis?.cancel(); previous?.focus(); };
  }, []);
  useEffect(() => {
    try { if (finished) localStorage.removeItem(draftKey); else localStorage.setItem(draftKey, JSON.stringify(messages)); } catch { /* Conversation stays usable without storage. */ }
  }, [draftKey, messages, finished]);
  useEffect(() => { const scroll = scrollRef.current; if (scroll) scroll.scrollTop = scroll.scrollHeight; }, [messages, view, panel]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);

  function useReply(text: string) { setInput(text); setPanel(null); setView('chat'); window.requestAnimationFrame(() => inputRef.current?.focus()); }
  function listen() { if (!speak(lastTutor.text)) setNotice('Audio playback is not available in this browser.'); }
  function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(current => [...current, { id: id(), role: 'user', text }, { id: id(), role: 'tutor', ...sampleReply(text, kind, userMessages.length) }]);
    setInput(''); setPanel(null); setSelectedReply('');
  }
  function finish() {
    if (savedFinish.current || !userMessages.length) return;
    savedFinish.current = true;
    setStats(stats => ({ ...stats, conversations: stats.conversations + 1 }));
    logActivity(scenario?.title ?? `Conversation with ${profile.tutor}`, Math.max(1, Math.ceil(userMessages.length / 2)));
    setFinished(true); setPanel(null); window.speechSynthesis?.cancel();
  }
  function tool(next: Panel) { setSelectedReply(lastUser); setPanel(current => current === next ? null : next); }

  return <dialog ref={dialog} className={`narra-conversation ${view === 'avatar' && !finished ? 'is-avatar' : ''}`} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="conversation-shell">
      <header className="conversation-header"><button className="conversation-close" aria-label="Close conversation" onClick={onClose}><X size={24} /></button><div className="conversation-heading"><h1>{title}</h1><p>with {profile.tutor} · {scenario?.type ?? 'Free talk'}</p></div>{!finished && <><div className="conversation-view-switch" aria-label="Conversation view"><button className={view === 'chat' ? 'active' : ''} aria-pressed={view === 'chat'} aria-label="Text conversation" onClick={() => setView('chat')}><MessageCircle size={22} /></button><button className={view === 'avatar' ? 'active' : ''} aria-pressed={view === 'avatar'} aria-label="Avatar conversation" onClick={() => setView('avatar')}><UserRound size={22} /></button></div><button className="conversation-finish" disabled={!userMessages.length} onClick={finish}>Finish</button></>}</header>
      {finished ? <ConversationSummary count={userMessages.length} minutes={Math.max(1, Math.ceil(userMessages.length / 2))} onClose={onClose} /> : <>
        {view === 'chat' ? <div className="conversation-thread" ref={scrollRef}><div className="conversation-thread-inner">
          <GoalCard kind={kind} scenario={scenario} words={suggestedWords} />
          <div className="conversation-message-list" aria-live="polite" aria-relevant="additions">{messages.map(message => message.role === 'tutor' ? <div className="conversation-tutor-message" key={message.id}><Avatar name={profile.tutor} /><div className="conversation-bubble"><p>{message.text}</p><button onClick={() => { if (!speak(message.text)) setNotice('Audio playback is not available in this browser.'); }}><Volume2 size={16} fill="currentColor" />Listen</button></div></div> : <div className="conversation-user-message" key={message.id}><div className="conversation-bubble"><p>{message.text}</p></div><button className="conversation-level-up" onClick={() => { setSelectedReply(message.text); setPanel('level'); }}><Sparkles size={15} />Level up this answer</button></div>)}</div>
        </div></div> : <div className="conversation-avatar-stage"><div className="conversation-avatar-portrait">{profile.tutor === 'Skye' ? <img src="/assets/skye-body.webp" alt="Skye, your conversation tutor" /> : <Avatar name={profile.tutor} />}</div><p className="conversation-avatar-caption" aria-live="polite">{lastTutor.text}</p><div className="conversation-voice-controls"><button aria-label="Listen to tutor" onClick={listen}><Volume2 size={23} fill="currentColor" /></button><button className="voice-main" aria-label="Voice input preview" onClick={() => { setPanel('hint'); setNotice('Voice input is a preview. Try a suggested reply, or switch to the keyboard.'); }}><Mic size={29} /></button><button aria-label="Type a reply" onClick={() => { setView('chat'); window.requestAnimationFrame(() => inputRef.current?.focus()); }}><Keyboard size={23} /></button></div></div>}
        <footer className="conversation-dock">
          {panel && <ConversationPanel panel={panel} lastUser={selectedReply || lastUser} lastTutor={lastTutor} hint={hint} kind={kind} onClose={() => setPanel(null)} onUse={useReply} />}
          {notice && <p className="conversation-notice" role="status">{notice}</p>}
          <p className="conversation-progress-copy">{Math.min(userMessages.length, 3)}/3 tutor replies · {userMessages.length < 3 ? 'A little more practice with every reply' : 'You’ve made time for your English'}</p>
          <div className="conversation-tools" aria-label="Conversation tools"><button className={panel === 'hint' ? 'active' : ''} onClick={() => tool('hint')} aria-pressed={panel === 'hint'}><Lightbulb size={18} />Hint</button><button className={panel === 'translate' ? 'active' : ''} onClick={() => tool('translate')} aria-pressed={panel === 'translate'}><SpellCheck size={18} />Translate</button><button className={panel === 'feedback' ? 'active' : ''} onClick={() => tool('feedback')} aria-pressed={panel === 'feedback'}><CircleCheck size={18} />Feedback</button><button onClick={() => setSaveOpen(true)}><CopyPlus size={18} />Save word</button></div>
          {view === 'chat' && <form className="conversation-composer" onSubmit={event => { event.preventDefault(); send(); }}><input ref={inputRef} aria-label="Your reply" value={input} onChange={event => setInput(event.target.value)} placeholder="Type your reply…" autoComplete="off" maxLength={1500} /><button type={input.trim() ? 'submit' : 'button'} aria-label={input.trim() ? 'Send reply' : 'Switch to voice view'} onClick={() => { if (!input.trim()) setView('avatar'); }}>{input.trim() ? <ArrowUp size={24} /> : <Mic size={25} />}</button></form>}
          <p className="conversation-demo-note">Conversation saved on this device · Sample replies</p>
        </footer>
      </>}
    </div>
    {saveOpen && <SaveConversationWord words={suggestedWords} onClose={() => setSaveOpen(false)} onSaved={word => { setNotice(`“${word}” saved to your words.`); notify(`“${word}” added to your words.`); setSaveOpen(false); }} />}
  </dialog>;
}

function GoalCard({ kind, scenario, words }: { kind: ChatKind; scenario?: Scenario; words: UsefulWord[] }) {
  const goal = kind === 'cafe' ? 'You are visiting a new café. Order your favorite drink, ask about the pastries, and find a place to sit.' : kind === 'interview' ? 'Introduce yourself, share your experience, and give a specific example of what you can contribute.' : scenario?.description ?? 'Choose any everyday topic. Ask a question, share an opinion, and keep the conversation going.';
  return <section className={`conversation-goal ${kind === 'cafe' ? 'goal-peach' : ''}`}><h2>Your goal</h2><p>{goal}</p><span>Try: {words.map(word => word.word).join(' · ')}</span></section>;
}

function ConversationPanel({ panel, lastUser, lastTutor, hint, kind, onClose, onUse }: { panel: Exclude<Panel, null>; lastUser: string; lastTutor: Message; hint: string; kind: ChatKind; onClose: () => void; onUse: (text: string) => void }) {
  const improved = improvedReply(lastUser, kind);
  const title = panel === 'hint' ? 'Hint' : panel === 'translate' ? 'Vietnamese translation' : panel === 'level' ? 'Level up your answer' : 'Feedback';
  return <section className="conversation-help-panel" aria-label={title}><div className="conversation-panel-heading"><h2><Sparkles size={17} />{title}</h2><button aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}><X size={14} /></button></div>
    {panel === 'hint' ? <><p>{hint}</p><button className="conversation-use-reply" onClick={() => onUse(hint)}>Use this reply</button></> : panel === 'translate' ? <><p lang="vi">{lastTutor.translation ?? 'Bản dịch cho tin nhắn này chưa được lưu. Hãy bắt đầu một lượt trò chuyện mới để xem các câu mẫu có bản dịch.'}</p><span className="conversation-panel-note">Translation of the latest tutor reply</span></> : !lastUser ? <p>Send a reply first, then explore a small tip to help your English flow.</p> : <><p className="conversation-feedback-label">{panel === 'level' ? 'Try a little more natural phrasing:' : 'A small language tip for your last reply:'}</p><blockquote>{improved.suggestion}</blockquote><p>{improved.note}</p><button className="conversation-use-reply" onClick={() => onUse(improved.suggestion)}>Use this reply</button><span className="conversation-panel-note">Local practice suggestion · no automated score</span></>}
  </section>;
}

function SaveConversationWord({ words: suggestions, onClose, onSaved }: { words: UsefulWord[]; onClose: () => void; onSaved: (word: string) => void }) {
  const { words, setWords } = useNarra();
  const [selected, setSelected] = useState(suggestions[0].word);
  const word = suggestions.find(item => item.word === selected)!;
  const exists = words.some(item => item.word.toLowerCase() === selected.toLowerCase());
  function save() {
    if (exists) return;
    setWords(current => current.some(item => item.word.toLowerCase() === word.word.toLowerCase()) ? current : [...current, { id: `chat-${id()}`, ...word, collection: 'My words', status: 'New', due: true }]);
    onSaved(word.word);
  }
  return <Modal title="A word to keep" onClose={onClose}><p className="dialog-description">Choose a useful word from this practice.</p><div className="conversation-word-choices">{suggestions.map(item => <button className={selected === item.word ? 'selected' : ''} aria-pressed={selected === item.word} key={item.word} onClick={() => setSelected(item.word)}>{item.word}</button>)}</div><div className="conversation-word-definition"><h3>{word.word}</h3><p>{word.definition}</p><blockquote>“{word.example}”</blockquote></div><button className="primary-button full-width" disabled={exists} onClick={save}>{exists ? <><Check size={18} />Already in your words</> : <><CopyPlus size={18} />Save to my words</>}</button></Modal>;
}

function ConversationSummary({ count, minutes, onClose }: { count: number; minutes: number; onClose: () => void }) {
  return <div className="conversation-summary"><span className="conversation-summary-check"><Check size={38} /></span><h2>You showed up for your English.</h2><p>Every conversation is a little step forward.<br />Your practice has been saved on this device.</p><div className="conversation-summary-stats"><div><strong>{count}</strong><span>replies shared</span></div><div><strong>{minutes}</strong><span>practice {minutes === 1 ? 'minute' : 'minutes'}</span></div></div><button className="primary-button" onClick={onClose}>Keep exploring<Check size={18} /></button><small>Sample conversation · no AI assessment</small></div>;
}
