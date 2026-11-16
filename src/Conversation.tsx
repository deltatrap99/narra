import BuddyAvatar from './BuddyAvatar';
import PlusTeaser from './PlusTeaser';
import './buddy-touchpoints.css';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, Check, CircleCheck, CopyPlus, Keyboard, Lightbulb, MessageCircle, Mic, RotateCcw, Sparkles, SpellCheck, Square, UserRound, Volume2, X } from 'lucide-react';
import type { Lesson, Scenario, Word } from './data';
import { speak, useCopy, useNarra } from './state';
import { useVoiceInput } from './useVoiceInput';
import { Avatar, Modal } from './ui';
import BuddyCoach from './BuddyCoach';
import { useAccounts } from './AccountContext';
import CallCamera from './CallCamera';
import { isOption5 } from './brand-variant';
import { cancelSpeech, useSpeechPlayback } from './speech';
import { Video, PhoneOff } from 'lucide-react';
import './buddy-learning.css';
import './conversation.css';
import './conversation-uat.css';
import './video-call.css';
const TutorAvatar = lazy(() => import('./TutorAvatar'));

type Message = { id: string; role: 'tutor' | 'user'; text: string; translation?: string; voiceSeconds?: number };
type ChatKind = 'cafe' | 'interview' | 'travel' | 'free';
type Panel = 'hint' | 'translate' | 'feedback' | 'level' | null;
type UsefulWord = Pick<Word, 'word' | 'definition' | 'example'>;
const id = () => crypto.randomUUID();
const freeOpening = { text: 'Hey! I’m glad you’re here. What has been the best part of your day?', translation: 'Chào bạn! Mình rất vui vì bạn có mặt ở đây. Điều tuyệt nhất trong ngày hôm nay của bạn là gì?' };

function kindFor(scenario?: Scenario): ChatKind {
  if (scenario?.type === 'Interview' || /interview|impression|professional|salary|make your case|present your project/i.test(`${scenario?.title} ${scenario?.description}`)) return 'interview';
  if (scenario?.id === 'usual' || /café|cafe|coffee|your usual/i.test(`${scenario?.title} ${scenario?.description}`)) return 'cafe';
  if (scenario?.id === 'anywhere' || /where will you go|travel|trip|journey|station|taxi|lost and found/i.test(`${scenario?.title} ${scenario?.description}`)) return 'travel';
  return 'free';
}

function openingFor(kind: ChatKind) {
  if (kind === 'cafe') return { text: 'Welcome to our little café! What can I get you today?', translation: 'Chào mừng bạn đến với quán cà phê nhỏ của chúng mình! Hôm nay bạn muốn dùng gì?' };
  if (kind === 'interview') return { text: 'Hi! It’s lovely to meet you. Could you tell me a little about yourself and the role you’re interested in?', translation: 'Chào bạn! Rất vui được gặp bạn. Bạn có thể giới thiệu đôi nét về bản thân và vị trí mà bạn quan tâm không?' };
  if (kind === 'travel') return { text: 'Welcome! Where are you planning to go on your next adventure?', translation: 'Chào bạn! Bạn đang dự định đến đâu trong chuyến phiêu lưu tiếp theo?' };
  return freeOpening;
}

function sampleReply(text: string, kind: ChatKind, turn: number): Pick<Message, 'text' | 'translation'> {
  if (/guess what/i.test(text)) return { text: 'Guess what? I love a good surprise - tell me everything! What’s the news?', translation: 'Có chuyện gì vậy? Mình rất thích những điều bất ngờ thú vị - kể cho mình nghe tất cả nhé! Có tin gì mới thế?' };
  if (/\bno\b.*(chan[gp]ed|change)/i.test(text)) return { text: 'Got it, so it’s still nice and cool where you are. Try saying that as a full sentence: “No, the weather hasn’t changed much.” What’s your favourite thing to do outside when it’s cool like this?', translation: 'Mình hiểu rồi, vậy chỗ bạn vẫn dễ chịu và mát mẻ. Hãy thử nói thành câu đầy đủ: “Không, thời tiết không thay đổi nhiều.” Bạn thích làm gì nhất ngoài trời khi thời tiết mát mẻ như thế này?' };
  if (/walk|park|morning|weather|cool|sunny|raining/i.test(text) && kind === 'free') return { text: 'That sounds so peaceful! You could describe cool, fresh weather as “crisp”. What did you notice on your walk?', translation: 'Nghe thật yên bình! Bạn có thể dùng từ “crisp” để miêu tả thời tiết mát và trong lành. Bạn đã để ý thấy điều gì trong lúc đi dạo?' };
  if (kind === 'cafe') {
    if (/takeaway|take away|to go/i.test(text)) return { text: 'Of course - I’ll prepare that to take away. Would you like anything to eat with your drink?', translation: 'Tất nhiên rồi - mình sẽ chuẩn bị đồ mang đi cho bạn. Bạn có muốn dùng thêm món gì cùng đồ uống không?' };
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
    if (/want\s+order/i.test(text)) return { suggestion: `I’d like to order a ${drink}, please.`, note: 'Use “want to order” rather than “want order”. “I’d like to…” makes your request sound a little more polite.' };
    return { suggestion: `Could I have a ${drink}, please? What pastry would you recommend?`, note: '“Could I have …, please?” is a friendly way to order. A follow-up question helps keep the conversation going.' };
  }
  return { suggestion: `${text.trim().replace(/[.!?]+$/, '')}. One thing I especially enjoy about it is…`, note: 'Try adding one specific detail or a reason. Finish this suggested sentence with your own idea so it stays true to your experience.' };
}

function explanationVi(text: string, kind: ChatKind) {
  if (/\bno\b.*(chan[gp]ed|change)/i.test(text)) return 'Dùng “changed” để viết đúng chính tả. Nói rõ “the weather” giúp người nghe hiểu ý; “hasn’t” là cách rút gọn tự nhiên khi trò chuyện.';
  if (/guess what/i.test(text)) return '“Guess what?” là cách mở lời tự nhiên khi có tin mới. Thêm một câu để người nghe biết bạn muốn chia sẻ điều gì.';
  if (kind === 'cafe' && /want\s+order/i.test(text)) return 'Sau “want” cần “to”: “want to order”. Cách nói “I’d like to…” giúp lời gọi món lịch sự, tự nhiên hơn.';
  if (kind === 'cafe') return '“Could I have…, please?” là mẫu gọi món lịch sự. Thêm một câu hỏi ngắn để tiếp tục trò chuyện với nhân viên.';
  return 'Bổ sung một ví dụ hoặc lý do cụ thể. Hoàn thành câu gợi ý bằng chính trải nghiệm của bạn để câu nói rõ nghĩa và tự nhiên hơn.';
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
      if (messages.some(message => message.role === 'tutor')) return messages.map(message => message.role === 'tutor' ? { ...message, text: message.text.replace(/[\u2013\u2014]/g, '-'), translation: message.translation?.replace(/[\u2013\u2014]/g, '-') } : message);
      if (messages.length) return [{ id: id(), role: 'tutor', ...opening }, ...messages];
    }
  } catch { /* A new conversation remains available when a draft cannot be read. */ }
  return [{ id: id(), role: 'tutor', ...opening }];
}

export default function Conversation({ scenario, lesson, onClose, onNextLesson, onReview, onPlans }: { scenario?: Scenario; lesson?: Lesson; onClose: () => void; onNextLesson?: () => void; onReview?: () => void; onPlans?: () => void }) {
  const { profile, words: savedWords, setStats, logActivity, notify } = useNarra();
  const tr = useCopy();
  const kind = kindFor(scenario);
  const { storageKey } = useAccounts();
  const draftKey = storageKey(`narra-conversation-v1:${profile.tutor}:${scenario?.id ?? 'free'}`);
  const [messages, setMessages] = useState<Message[]>(() => restoreDraft(draftKey, openingFor(kind)));
  const [input, setInput] = useState('');
  const [view, setView] = useState<'chat' | 'avatar'>('avatar');
  const [modelReady,setModelReady]=useState(false);
  const playback=useSpeechPlayback();
  const spokenAuto=useRef('');
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedReply, setSelectedReply] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedFinish = useRef(false);
  const sessionStarted = useRef(performance.now());
  const userMessages = messages.filter(message => message.role === 'user');
  const lastUser = userMessages.at(-1)?.text ?? '';
  const lastTutor = [...messages].reverse().find(message => message.role === 'tutor')!;
  const hint = hintFor(kind, lastUser);
  const title = scenario?.title ?? 'Let’s just talk';
  const tutorLocale = profile.tutor === 'Henry' ? 'en-GB' : 'en-US';
  const suggestedWords = wordsFor(kind);
  const minutes = Math.max(1, Math.ceil((performance.now() - sessionStarted.current) / 60000));
  const voice = useVoiceInput(turn => { if (reviewing || finished) return; setStats(stats => ({ ...stats, speakingTries: stats.speakingTries + 1 })); sendMessage(turn.text, turn.seconds); });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = oldOverflow; cancelSpeech(); previous?.focus(); };
  }, []);
  useEffect(() => {
    try { if (finished) localStorage.removeItem(draftKey); else localStorage.setItem(draftKey, JSON.stringify(messages)); } catch { /* Conversation stays usable without storage. */ }
  }, [draftKey, messages, finished]);
  useEffect(() => { const scroll = scrollRef.current; if (scroll) scroll.scrollTop = scroll.scrollHeight; }, [messages, view, panel]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (profile.sound && !finished && !reviewing && (view==='chat'||modelReady) && spokenAuto.current!==lastTutor.id) {spokenAuto.current=lastTutor.id;speak(lastTutor.text,tutorLocale,'conversation:'+profile.tutor);} }, [lastTutor.id, profile.sound, finished, reviewing, tutorLocale,view,modelReady,profile.tutor]);

  function useReply(text: string) { setInput(text); setPanel(null); setView('chat'); setKeyboardOpen(true); window.requestAnimationFrame(() => inputRef.current?.focus()); }
  function listen() { if (!speak(lastTutor.text, tutorLocale, 'conversation:'+profile.tutor)) setNotice(tr('Audio playback is not available in this browser.', "Trình duyệt chưa phát được âm thanh, bạn đọc câu mẫu cùng tớ nhé.")); }
  function sendMessage(value: string, voiceSeconds?: number) {
    if (!value.trim()) return;
    const text = value.trim();
    setMessages(current => [...current, { id: id(), role: 'user', text, voiceSeconds }, { id: id(), role: 'tutor', ...sampleReply(text, kind, userMessages.length) }]);
    setInput(''); setPanel(null); setSelectedReply('');
  }
  function send() { sendMessage(input); }
  function finish() {
    if (!userMessages.length) return;
    voice.cancel(); setReviewing(true); setPanel(null); cancelSpeech();
  }
  function completeSession() {
    if (savedFinish.current || !userMessages.length) return;
    savedFinish.current = true;
    setStats(stats => ({ ...stats, conversations: stats.conversations + 1, completed: lesson && !stats.completed.includes(lesson.id) ? [...stats.completed, lesson.id] : stats.completed }));
    logActivity(lesson?.title ?? (scenario ? `Practice · ${scenario.title}` : `Conversation with ${profile.tutor}`), minutes);
    setFinished(true); setPanel(null); cancelSpeech();
  }
  function tool(next: Panel) { setSelectedReply(lastUser); setPanel(current => current === next ? null : next); }

  return <dialog ref={dialog} data-mic-active={voice.listening || voice.pending} className={`narra-conversation voice-first ${view === 'avatar' && !finished && !reviewing ? 'is-avatar video-call-mode' : ''}`} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="conversation-shell">
      <header className="conversation-header"><button className="conversation-close" aria-label={tr('Close conversation', 'Đóng hội thoại')} onClick={onClose}><X size={24} /></button><div className="conversation-heading"><h1>{title}</h1><p>{tr('with', 'cùng')} {profile.tutor} · {scenario?.type ?? tr('Free talk', 'Trò chuyện tự do')}</p></div>{!finished && !reviewing && <><div className="conversation-view-switch" aria-label="Conversation view"><button className={view === 'chat' ? 'active' : ''} aria-pressed={view === 'chat'} aria-label={tr('Conversation transcript', 'Nội dung hội thoại')} onClick={() => setView('chat')}><MessageCircle size={22} /></button><button className={view === 'avatar' ? 'active' : ''} aria-pressed={view === 'avatar'} aria-label={tr('Video conversation', 'Gọi video với gia sư')} onClick={() => setView('avatar')}><Video size={22} /></button></div><button className="conversation-finish" disabled={!userMessages.length} onClick={finish}>{tr('Finish', 'Kết thúc')}</button></>}</header>
      {finished ? <ConversationSummary onPlans={onPlans} count={userMessages.length} minutes={minutes} onClose={onClose} onNext={onNextLesson} onReview={onReview} lessonTitle={lesson?.title} savedCount={savedWords.filter(w => w.collection === (lesson ? `Lesson · ${lesson.title}` : scenario?.title ? `Practice · ${scenario.title}` : 'My words')).length} /> : reviewing ? <SessionFeedback lastUser={userMessages.at(-1)!} kind={kind} onRetry={() => { setReviewing(false); setSelectedReply(lastUser); setPanel('level'); }} onContinue={completeSession} /> : <>
        {view === 'chat' ? <div className="conversation-thread" ref={scrollRef}><div className="conversation-thread-inner">
          <GoalCard kind={kind} scenario={scenario} words={suggestedWords} />
          <div className="conversation-message-list" aria-live="polite" aria-relevant="additions">{messages.map(message => message.role === 'tutor' ? <div className="conversation-tutor-message" key={message.id}><Avatar name={profile.tutor} /><div className="conversation-bubble"><p>{message.text}</p><button onClick={() => { if (!speak(message.text, tutorLocale)) setNotice('Audio playback is not available in this browser.'); }}><Volume2 size={16} fill="currentColor" />{tr('Hear it', 'Nghe câu này')}</button></div></div> : <div className="conversation-user-message" key={message.id}><div className="conversation-bubble"><p>{message.text}</p></div><button className="conversation-level-up" onClick={() => { setSelectedReply(message.text); setPanel('level'); }}><Sparkles size={15} />{tr('Try another way', 'Thử cách khác')}</button></div>)}</div>
          {userMessages.length === 0 && !panel && <div className="conversation-start-buddy"><BuddyCoach compact title={tr('Buddy’s here', 'Buddy đây')} message={tr('One little detail is enough to start.', 'Mình thử một chi tiết nhỏ trước nhé.')} tip={tr(kind === 'cafe' ? 'Name a drink you like, then ask a short question about it.' : kind === 'interview' ? 'Say what you enjoy doing, then add one example from your experience.' : kind === 'travel' ? 'Choose a place you would like to visit and say one thing you want to do there.' : 'Think of one good moment from today. Say what happened and how you felt.', kind === 'cafe' ? 'Nói tên một đồ uống bạn thích rồi hỏi một câu ngắn về món đó.' : kind === 'interview' ? 'Nói điều bạn thích làm rồi thêm một ví dụ từ trải nghiệm của bạn.' : kind === 'travel' ? 'Chọn một nơi bạn muốn đến và nói một điều bạn muốn làm ở đó.' : 'Nghĩ về một khoảnh khắc vui hôm nay. Kể điều đã xảy ra và cảm xúc của bạn.')} actionLabel={tr('Help me start', 'Gợi ý mở lời')} onAction={() => tool('hint')} mood="guide" /></div>}
        </div></div> : <div className="conversation-avatar-stage call-stage"><div className="call-stage-light" aria-hidden="true"/><div className="call-status" data-state={!modelReady?'loading':voice.listening?'listening':playback.status==='speaking'?'speaking':'ready'}><span/>{profile.tutor}<small>{!modelReady?tr('Getting ready','Đang chuẩn bị'):voice.listening?tr('Listening to you','Đang lắng nghe bạn'):playback.status==='speaking'?tr('Speaking','Đang nói'):tr('Ready when you are','Sẵn sàng cùng bạn')}</small></div><div className="call-tutor-media"><Suspense fallback={<div className="call-model-loading" role="status">{tr('Your tutor is getting ready…','Gia sư đang chuẩn bị một chút nhé…')}</div>}><TutorAvatar tutor={profile.tutor} mode={voice.listening?'listening':playback.status==='speaking'?'speaking':'idle'} speech={playback} greeting={userMessages.length===0} onReady={()=>setModelReady(true)} onError={()=>setModelReady(true)}/></Suspense></div><CallCamera/><div className="call-caption" tabIndex={0}><div className="call-caption-label"><span>{profile.tutor}</span><span>{tr('Animated tutor','Gia sư ảo')}</span></div><p lang="en" aria-live="polite">{lastTutor.text}</p><div className="call-caption-tools"><button type="button" onClick={listen} disabled={voice.listening||voice.pending}><Volume2 size={16}/>{tr('Hear it again','Nghe lại')}</button><button type="button" onClick={()=>tool('translate')}><SpellCheck size={16}/>{tr('Translate','Dịch câu')}</button></div></div></div>}
        <footer className={`conversation-dock ${view==='avatar'?'call-control-dock':''}`}>
          {panel && <ConversationPanel panel={panel} lastUser={selectedReply || lastUser} lastTutor={lastTutor} hint={hint} kind={kind} onClose={() => setPanel(null)} onUse={useReply} />}
          {notice && <p className="conversation-notice" role="status">{notice}</p>}
          <p className="conversation-progress-copy">{Math.min(userMessages.length, 3)}/3 {tr('replies · Your voice, your pace.', 'lượt nói · Nói theo nhịp của bạn.')}</p>
          <div className="conversation-tools" aria-label="Conversation tools"><button className={panel === 'hint' ? 'active' : ''} onClick={() => tool('hint')} aria-pressed={panel === 'hint'}><Lightbulb size={18} />{tr('Hint', 'Gợi ý')}</button><button className={panel === 'translate' ? 'active' : ''} onClick={() => tool('translate')} aria-pressed={panel === 'translate'}><SpellCheck size={18} />{tr('Translate', 'Dịch câu')}</button><button className={panel === 'feedback' ? 'active' : ''} onClick={() => tool('feedback')} aria-pressed={panel === 'feedback'}><CircleCheck size={18} />{tr('Feedback', 'Góp ý')}</button><button onClick={() => setSaveOpen(true)}><CopyPlus size={18} />{tr('Save word', 'Lưu từ')}</button></div>
          <div className={`conversation-speaking-controls ${view==='avatar'?'call-controls':''}`}><button className="voice-side-control" aria-label={tr('Hear tutor again', 'Nghe gia sư nói lại')} onClick={listen} disabled={voice.listening || voice.pending}><Volume2 size={21}/></button><button className={`conversation-primary-mic ${voice.listening ? 'is-listening' : ''}`} disabled={voice.pending} aria-label={voice.listening ? tr('Stop speaking', 'Dừng nói') : tr('Start speaking', 'Bắt đầu nói')} onClick={voice.start} aria-pressed={voice.listening}>{voice.listening ? <Square size={25} fill="currentColor"/> : <Mic size={32}/>}{isOption5 && view === 'avatar' && <span className="option5-mic-label">{voice.pending ? tr('Opening mic…', 'Đang mở mic…') : voice.listening ? tr('Listening…', 'Đang nghe…') : userMessages.length ? tr('Your next turn', 'Nói tiếp nhé') : tr('Tap to begin', 'Nhấn để bắt đầu')}</span>}</button><button className={`voice-side-control ${keyboardOpen ? 'active' : ''}`} aria-label={tr('Keyboard alternative', 'Bàn phím hỗ trợ')} aria-pressed={keyboardOpen} onClick={() => setKeyboardOpen(v => !v)}><Keyboard size={21}/></button>{view==='avatar'&&<button className="call-end-button" type="button" aria-label={tr('End this call','Kết thúc cuộc gọi')} onClick={()=>userMessages.length?finish():onClose()}><PhoneOff size={23}/><span>{tr('End call','Kết thúc')}</span></button>}</div>
          <p className="voice-prompt-label" role="status">{voice.pending ? tr('Getting your microphone ready…', 'Đang chuẩn bị micro…') : voice.listening ? tr('Listening… tap again when you’re done.', 'Đang nghe… chạm lần nữa khi bạn nói xong.') : tr("Tap the mic and say it your way!", 'Chạm micro và nói theo cách của bạn.')}</p>
          {voice.interim && <p className="voice-live-transcript" aria-live="polite">{voice.interim}</p>}
          {voice.error && <div className="conversation-voice-error" role="alert"><p>{tr(voice.error, "Bạn cho phép micro trên trình duyệt rồi thử nói lại, hoặc mở bàn phím hỗ trợ nhé.")}</p><button onClick={voice.start}><RotateCcw size={14}/>{tr('Try again', 'Thử lại')}</button></div>}
          {keyboardOpen && <form className="conversation-composer" onSubmit={event => { event.preventDefault(); send(); }}><input ref={inputRef} aria-label={tr('Your reply', 'Câu trả lời của bạn')} value={input} onChange={event => setInput(event.target.value)} placeholder={tr('Keyboard alternative', 'Câu trả lời hỗ trợ')} autoComplete="off" maxLength={1500} /><button type="submit" disabled={!input.trim()} aria-label={tr('Send reply', 'Gửi câu trả lời')}><ArrowUp size={24}/></button></form>}
          {view==='avatar'&&<button type="button" className="call-buddy-hint" onClick={()=>tool('hint')} aria-expanded={panel==='hint'}><BuddyAvatar mood={voice.error ? 'encourage' : voice.listening || voice.pending ? 'focus' : panel === 'hint' ? 'curious' : 'welcome'} motion={!voice.listening && !voice.pending} size={38}/><span>{tr('Buddy, a little help?','Buddy gợi ý cho mình nhé?')}</span><Lightbulb size={16}/></button>}<p className="conversation-demo-note">{tr('Saved on this device · Sample tutor replies', 'Lưu trên thiết bị này · Câu trả lời gia sư mẫu')}</p>
        </footer>
      </>}
    </div>
    {saveOpen && <SaveConversationWord words={suggestedWords} collection={lesson ? `Lesson · ${lesson.title}` : scenario ? `Practice · ${scenario.title}` : 'My words'} onClose={() => setSaveOpen(false)} onSaved={word => { setNotice(`“${word}” saved to your words.`); notify(`“${word}” added to your words.`); setSaveOpen(false); }} />}
  </dialog>;
}

function GoalCard({ kind, scenario, words }: { kind: ChatKind; scenario?: Scenario; words: UsefulWord[] }) {
  const tr = useCopy();
  const goal = kind === 'cafe' ? tr("At our new café, try ordering a drink you like, asking about a pastry, and finding a seat.", "Ở quán cà phê mới này, bạn thử gọi món thích uống, hỏi về một loại bánh và tìm chỗ ngồi nhé.") : kind === 'interview' ? tr('Let’s get to know you: introduce yourself, share an experience, and give one example of what you can bring.', 'Mình cùng làm quen nhé: bạn giới thiệu bản thân, kể một trải nghiệm và nêu một điều mình có thể đóng góp.') : scenario?.description ?? tr("Pick something from your day to tell me about, then ask a question back.", "Bạn chọn một điều trong ngày rồi kể một chút và thử hỏi lại một câu nhé.");
  return <section className={`conversation-goal ${kind === 'cafe' ? 'goal-peach' : ''}`}><h2>{tr('Let’s try this together', 'Mình thử tình huống này nhé')}</h2><p>{goal}</p><span>{tr('A few words to try:', 'Mình có thể thử:')} {words.map(word => word.word).join(' · ')}</span></section>;
}

function ConversationPanel({ panel, lastUser, lastTutor, hint, kind, onClose, onUse }: { panel: Exclude<Panel, null>; lastUser: string; lastTutor: Message; hint: string; kind: ChatKind; onClose: () => void; onUse: (text: string) => void }) {
  const tr = useCopy();
  const { profile } = useNarra();
  const tutorLocale = profile.tutor === 'Henry' ? 'en-GB' : 'en-US';
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeButton.current?.focus({ preventScroll: true }); }, [panel]);
  const improved = improvedReply(lastUser, kind);
  const title = panel === 'hint' ? tr('A little nudge', 'Một gợi ý nhỏ') : panel === 'translate' ? tr('What your tutor said', 'Gia sư vừa nói gì nhỉ?') : panel === 'level' ? tr('Let’s try another way', 'Mình thử cách khác nhé') : tr('One small thing to try', 'Một điều nhỏ mình có thể thử');
  return <section className="conversation-help-panel" aria-label={title}><div className="conversation-panel-heading"><h2><Sparkles size={17} />{title}</h2><button ref={closeButton} type="button" aria-label={`${tr('Close', 'Đóng')} ${title.toLowerCase()}`} onClick={onClose}><X size={14} /></button></div>
    {panel === 'hint' ? <><div className="conversation-buddy-nudge"><BuddyAvatar mood="curious" size={56}/><span>{tr("Let’s take one idea at a time and find a detail that feels like you.", "Mình gỡ từng ý nhé, chi tiết nào giống câu chuyện của bạn nhất?")}</span></div><p>{hint}</p><button type="button" className="conversation-use-reply" onClick={() => speak(hint, tutorLocale)}><Volume2 size={14}/>{tr('Hear this example', 'Nghe câu mẫu')}</button></> : panel === 'translate' ? <><p lang="vi">{lastTutor.translation ?? 'Bản dịch cho tin nhắn này chưa được lưu.'}</p><span className="conversation-panel-note">{tr('Translation of the latest tutor reply', 'Bản dịch câu trả lời gần nhất của gia sư')}</span></> : !lastUser ? <p>{tr("Say a little reply first, then we can look at one thing to try.", "Bạn thử nói một câu trước nhé, rồi mình cùng xem có thể thử cách nào khác.")}</p> : <><h3 className="concise-feedback-heading">{tr('Here’s another way to say it', 'Mình thử câu này xem nhé')}</h3><blockquote>{improved.suggestion}</blockquote><h3 className="concise-feedback-heading">{tr('Why this works', 'Vì sao cách này hữu ích')}</h3><p>{tr(improved.note, explanationVi(lastUser, kind))}</p><button type="button" className="conversation-use-reply" onClick={() => speak(improved.suggestion, tutorLocale)}><Volume2 size={14}/>{tr('Hear the improved sentence', 'Nghe câu gợi ý')}</button><span className="conversation-panel-note">{tr('When you’re ready, tap the mic below and give it another go.', 'Khi sẵn sàng, bạn chạm micro bên dưới để thử lại nhé.')}</span></>}
  </section>;
}

function SaveConversationWord({ words: suggestions, collection, onClose, onSaved }: { words: UsefulWord[]; collection: string; onClose: () => void; onSaved: (word: string) => void }) {
  const { words, setWords } = useNarra();
  const [selected, setSelected] = useState(suggestions[0].word);
  const word = suggestions.find(item => item.word === selected)!;
  const exists = words.some(item => item.word.toLowerCase() === selected.toLowerCase());
  function save() {
    if (exists) return;
    setWords(current => current.some(item => item.word.toLowerCase() === word.word.toLowerCase()) ? current : [...current, { id: `chat-${id()}`, ...word, collection, status: 'New', due: true }]);
    onSaved(word.word);
  }
  return <Modal title="A word to keep" onClose={onClose}><p className="dialog-description">Choose a useful word from this practice.</p><div className="conversation-word-choices">{suggestions.map(item => <button className={selected === item.word ? 'selected' : ''} aria-pressed={selected === item.word} key={item.word} onClick={() => setSelected(item.word)}>{item.word}</button>)}</div><div className="conversation-word-definition"><h3>{word.word}</h3><p>{word.definition}</p><blockquote>“{word.example}”</blockquote></div><button className="primary-button full-width" disabled={exists} onClick={save}>{exists ? <><Check size={18} />Already in your words</> : <><CopyPlus size={18} />Save to my words</>}</button></Modal>;
}

function ConversationSummary({ count, minutes, onClose, onNext, onReview, lessonTitle, savedCount, onPlans }: { count: number; minutes: number; onClose: () => void; onNext?: () => void; onReview?: () => void; lessonTitle?: string; savedCount: number; onPlans?: () => void }) {
  const tr = useCopy();
  return <div className="conversation-summary"><BuddyAvatar mood="proud" className="completion-buddy" size={112}/><h2>{tr('You showed up for your English.', 'Bạn đã tiến thêm một bước!')}</h2><p>{lessonTitle ?? tr('Every conversation is a little step forward.', 'Mỗi cuộc trò chuyện là một bước tiến.')}<br/>{tr('Your practice has been saved on this device.', 'Bài luyện của bạn đã được lưu trên thiết bị này.')}</p><div className="conversation-summary-stats"><div><strong>{count}</strong><span>{tr('replies shared', 'lượt trả lời')}</span></div><div><strong>{minutes}</strong><span>{tr('minutes practised', 'phút luyện tập')}</span></div><div><strong>{savedCount}</strong><span>{tr('words saved', 'từ đã lưu')}</span></div></div>{onNext && <button className="primary-button" onClick={onNext}>{tr('Next lesson', 'Bài tiếp theo')}<ArrowRight size={18}/></button>}{onReview && <button className="secondary-button" onClick={onReview}>{tr('Review vocabulary', 'Ôn từ vựng')}</button>}<button className={onNext ? 'text-button' : 'primary-button'} onClick={onClose}>{tr(lessonTitle ? 'Back to Lesson' : 'Back to Practice', lessonTitle ? 'Về Bài học' : 'Về Luyện nói')}<Check size={18}/></button>{onPlans && <PlusTeaser compact onOpen={onPlans} />}</div>;
}

function SessionFeedback({ lastUser, kind, onRetry, onContinue }: { lastUser: Message; kind: ChatKind; onRetry: () => void; onContinue: () => void }) {
  const tr = useCopy(); const improved = improvedReply(lastUser.text, kind); const seconds = typeof lastUser.voiceSeconds === 'number' && Number.isFinite(lastUser.voiceSeconds) ? lastUser.voiceSeconds : 0; const count = lastUser.text.split(/\s+/).length;
  return <div className="session-feedback-page"><p className="eyebrow purple">{tr("A little feedback for one more try!", "Một góp ý nhỏ để mình thử lại tự tin hơn!")}</p><h2>{tr('Make it your own.', 'Nói theo cách của bạn.')}</h2><section className="session-feedback-card"><span className="eyebrow muted">{tr('You said', 'Bạn đã nói')}</span><p className="your-original-answer">“{lastUser.text}”</p><h3>{tr('Here’s another way to say it', 'Mình thử câu này xem nhé')}</h3><blockquote>{improved.suggestion}</blockquote><h3>{tr('Why this works', 'Vì sao cách này hữu ích')}</h3><p>{tr(improved.note, explanationVi(lastUser.text, kind))}</p></section><section className="session-pronunciation-card"><h3>{tr('A look at that speaking turn', 'Mình xem lượt nói vừa rồi nhé')}</h3><div className="speech-evidence-grid"><span><strong>{seconds ? `${seconds}s` : '-'}</strong>{tr('Turn duration', 'Thời lượng lượt nói')}</span><span><strong>{seconds ? Math.round(count / seconds * 60) : '-'}</strong>{tr('Words per minute', 'Từ mỗi phút')}</span><span><strong>-</strong>{tr('Pronunciation', 'Phát âm')}</span></div><p className="muted">{tr('Pronunciation is not scored in this preview. No score is inferred from typing or from speech-recognition confidence.', 'Bản xem thử chưa chấm được phát âm. Điểm không được suy ra từ câu gõ hoặc độ tin cậy của nhận dạng giọng nói.')}</p></section><div className="conversation-feedback-buddy"><BuddyCoach compact title={tr('Let’s try one small change', 'Mình thử một thay đổi nhỏ nhé')} message={tr('Let’s hear the example, then say the idea your own way.', 'Mình cùng nghe câu mẫu rồi thử nói theo cách của bạn nhé.')} tip={tr('Pick one thing to improve: a clearer phrase, one extra detail, or a calmer pace. Then use Say it again below.', 'Chọn một điểm để thử lại: cách diễn đạt rõ hơn, thêm một chi tiết hoặc nói chậm hơn. Sau đó chọn Thử nói lại bên dưới.')} phrase={improved.suggestion} mood="focus" /></div><div className="session-feedback-actions"><button className="primary-button" onClick={onRetry}><Mic size={19}/>{tr('Say it again', 'Thử nói lại')}</button><button className="secondary-button" onClick={onContinue}>{tr('Continue & finish', 'Tiếp tục & hoàn thành')}<ArrowRight size={18}/></button></div></div>;
}
