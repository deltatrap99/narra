import { brandAsset } from './brand-variant';
import BuddyAvatar from './BuddyAvatar';
import './buddy-touchpoints.css';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCheck, Clock3, Copy, Flag, LoaderCircle, LockKeyhole, Mic, MicOff, RotateCcw, Share2, ShieldCheck, Sparkles, Square, Target, UsersRound, X } from 'lucide-react';
import { challengePrompts, challengeTarget, countChallengeWords, type ChallengeApiResponse, type ChallengeDuration, type ChallengeRoomView, type ChallengeSession } from './challenge-data';
import { cancelSpeech } from './speech';
import { useCopy, useNarra } from './state';
import { useVoiceInput } from './useVoiceInput';
import './challenge-room.css';

type Props = { roomId?: string; friend?: { id: string; name: string }; onClose: () => void };
type Phase = 'choose' | 'loading' | 'join' | 'waiting' | 'ready' | 'countdown' | 'active' | 'saving' | 'save-error' | 'results' | 'expired';
type FinishPayload = { wordCount: number; elapsedMs: number };
const sessionKey = (id: string) => `narra-challenge-pass-v1:${id}`;
function readSession(id: string): ChallengeSession | null {
  try { const saved = JSON.parse(localStorage.getItem(sessionKey(id)) ?? 'null'); return saved?.roomId === id && typeof saved?.participantId === 'string' && typeof saved?.token === 'string' ? saved : null; } catch { return null; }
}
function invitationUrl(id: string) { const url = new URL(location.href); url.search = ''; url.searchParams.set('challenge', id); url.hash = ''; return url.toString(); }
class RoomRequestError extends Error { constructor(public code: string, message: string) { super(message); } }
async function requestRoom(roomId: string, action?: Record<string, unknown>, token?: string, signal?: AbortSignal): Promise<ChallengeApiResponse> {
  const response = await fetch(action ? '/api/challenges' : `/api/challenges?roomId=${encodeURIComponent(roomId)}`, { method: action ? 'POST' : 'GET', headers: action ? { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } : {}, body: action ? JSON.stringify(action) : undefined, cache: 'no-store', signal });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.room) throw new RoomRequestError(result?.error?.code ?? 'unavailable', result?.error?.message ?? "The shared room could not connect right now, so please give it another try.");
  return result as ChallengeApiResponse;
}

export default function ChallengeRoom({ roomId: suppliedRoomId, friend, onClose }: Props) {
  const tr = useCopy(); const { profile, logActivity, setStats } = useNarra(); const inputId = useId();
  const dialog = useRef<HTMLDialogElement>(null); const closeButton = useRef<HTMLButtonElement>(null); const mounted = useRef(true);
  const [roomId, setRoomId] = useState(suppliedRoomId ?? ''); const [room, setRoom] = useState<ChallengeRoomView | null>(null);
  const [session, setSession] = useState<ChallengeSession | null>(() => suppliedRoomId ? readSession(suppliedRoomId) : null); const sessionRef = useRef(session); sessionRef.current = session;
  const [phase, setPhase] = useState<Phase>(suppliedRoomId ? 'loading' : 'choose'); const phaseRef = useRef(phase);
  const [name, setName] = useState(profile.name.slice(0, 40)); const [duration, setDuration] = useState<ChallengeDuration>(30); const [promptId, setPromptId] = useState(challengePrompts[0].id);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [offline, setOffline] = useState(false); const [leaving, setLeaving] = useState(false);
  const [remaining, setRemaining] = useState(0); const [countdown, setCountdown] = useState(3); const [transcript, setTranscript] = useState(''); const textRef = useRef('');
  const [resumed, setResumed] = useState(false); const [attemptedMic, setAttemptedMic] = useState(false); const finishing = useRef(false); const finishPayload = useRef<FinishPayload | null>(null);
  const runtime = useRef<{ start: number; end: number } | null>(null); const autoStart = useRef(false); const savedRoom = useRef<ChallengeRoomView | null>(null); savedRoom.current = room;
  const clock = useRef({ epoch: Date.now(), perf: performance.now() }); const deferredTimers = useRef<Set<number>>(new Set()); const finishRef = useRef<() => void>(() => {});
  const voice = useVoiceInput(turn => {
    if (!['active', 'saving'].includes(phaseRef.current)) return;
    textRef.current = `${textRef.current} ${turn.text}`.trim(); setTranscript(textRef.current);
  });
  const voiceRef = useRef(voice); voiceRef.current = voice;
  function changePhase(next: Phase) { phaseRef.current = next; setPhase(next); }
  function serverNow() { return clock.current.epoch + performance.now() - clock.current.perf; }
  function after(callback: () => void, delay: number) { const id = window.setTimeout(() => { deferredTimers.current.delete(id); callback(); }, delay); deferredTimers.current.add(id); }
  function localizedError(code: string, english: string) {
    const vietnamese: Record<string, string> = { invalid_id: "Link thử thách này chưa đúng, bạn kiểm tra lại link mời nhé.", not_found: "Tớ chưa tìm thấy phòng này, bạn kiểm tra lại link mời nhé.", expired: "Link đã hết hạn rồi, mình tạo một lời mời mới nhé.", room_full: "Phòng đã có đủ hai người, bạn nhờ gửi một lời mời mới nhé.", unauthorized: 'Bạn mở lại phòng trên trình duyệt đã tham gia nhé.', unavailable: "Phòng chưa kết nối được lúc này, bạn thử lại sau một chút nhé.", rate_limited: 'Mình chờ một lát rồi thử lại nhé.', turn_expired: "Lượt này đã kết thúc mà chưa lưu kết quả, bạn tạo phòng mới để thử lại nhé.", invalid_name: 'Bạn nhập tên từ 1-40 ký tự nhé.', waiting: 'Bạn của mình cần vào phòng trước khi bắt đầu nhé.' };
    return tr(english, vietnamese[code] ?? "Thao tác chưa xong, bạn thử lại một lần nữa nhé.");
  }
  function showError(value: unknown) { setError(value instanceof RoomRequestError ? localizedError(value.code, value.message) : tr("Check your connection and try again, as the shared room could not connect.", "Phòng chưa kết nối được, bạn kiểm tra mạng rồi thử lại nhé.")); }
  function accept(response: ChallengeApiResponse, incomingSession = sessionRef.current) {
    if (!mounted.current) return;
    const snapshot = response.room; clock.current = { epoch: snapshot.serverNow, perf: performance.now() }; setRoom(snapshot); setOffline(false);
    const person = snapshot.participants.find(p => p.id === incomingSession?.participantId);
    if (person?.result) { finishing.current = false; voiceRef.current.cancel(); changePhase('results'); return; }
    if (['active', 'countdown', 'saving', 'save-error'].includes(phaseRef.current)) return;
    if (!person) { changePhase('join'); return; }
    if (person.start) {
      if (person.start.deadlineAt <= snapshot.serverNow) { changePhase('expired'); return; }
      const perf = performance.now(); runtime.current = { start: perf + person.start.startedAt - snapshot.serverNow, end: perf + person.start.deadlineAt - snapshot.serverNow };
      setResumed(true); setRemaining(Math.max(0, person.start.deadlineAt - snapshot.serverNow)); changePhase(person.start.startedAt > snapshot.serverNow ? 'countdown' : 'active'); return;
    }
    changePhase(snapshot.participants.length < 2 ? 'waiting' : 'ready');
  }
  useEffect(() => {
    mounted.current = true; const prior = document.activeElement as HTMLElement | null; const bodyOverflow = document.body.style.overflow; const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden'; if (dialog.current && !dialog.current.open) dialog.current.showModal(); closeButton.current?.focus({ preventScroll: true });
    return () => { mounted.current = false; cancelSpeech(); deferredTimers.current.forEach(clearTimeout); deferredTimers.current.clear(); document.body.style.overflow = bodyOverflow; document.documentElement.style.overflow = htmlOverflow; requestAnimationFrame(() => { if (prior?.isConnected && !prior.closest('[inert]')) prior.focus({ preventScroll: true }); }); };
  }, []);
  useEffect(() => {
    if (!roomId) return; let disposed = false; let timer: number | undefined; let controller: AbortController | null = null;
    async function poll() {
      if (disposed) return;
      if (document.visibilityState === 'hidden') { timer = window.setTimeout(poll, 5000); return; }
      controller = new AbortController();
      try { const response = await requestRoom(roomId, undefined, undefined, controller.signal); if (!disposed) accept(response); }
      catch (value) { if (!disposed && !(value instanceof DOMException && value.name === 'AbortError')) { if (!savedRoom.current) { showError(value); changePhase('loading'); } else setOffline(true); } }
      if (!disposed) timer = window.setTimeout(poll, 5000);
    }
    void poll(); return () => { disposed = true; if (timer) clearTimeout(timer); controller?.abort(); };
  }, [roomId]);
  useEffect(() => {
    if (phase !== 'active' && phase !== 'countdown') return;
    function tick() {
      const timing = runtime.current; if (!timing) return;
      const now = performance.now(); setRemaining(Math.max(0, timing.end - now)); setCountdown(Math.max(0, Math.ceil((timing.start - now) / 1000)));
      if (now < timing.start) return;
      if (phaseRef.current === 'countdown') {
        changePhase('active');
        if (autoStart.current) { autoStart.current = false; setAttemptedMic(true); voiceRef.current.start(); }
      }
      if (now >= timing.end && !finishing.current) {
        if (resumed && !attemptedMic && !textRef.current) { voiceRef.current.cancel(); changePhase('expired'); }
        else finishRef.current();
      }
    }
    tick(); const interval = window.setInterval(tick, 100); return () => clearInterval(interval);
  }, [phase, resumed, attemptedMic]);
  // A completed browser turn can stop at a pause. The user explicitly resumes,
  // rather than a hidden loop repeatedly requesting the microphone.
  async function createRoom(event: React.FormEvent) {
    event.preventDefault(); if (busy || !name.trim()) return; setBusy(true); setError('');
    try {
      const response = await requestRoom('', { action: 'create', name: name.trim(), duration, promptId }); if (!mounted.current) return;
      const pass = response.session!; sessionRef.current = pass; setSession(pass); try { localStorage.setItem(sessionKey(pass.roomId), JSON.stringify(pass)); } catch { setNotice(tr('Keep this tab open; this browser cannot save your room pass.', 'Bạn giữ tab này mở nhé; trình duyệt chưa lưu được vé vào phòng.')); }
      accept(response, pass); setRoomId(pass.roomId); const url = new URL(location.href); url.searchParams.set('challenge', pass.roomId); history.replaceState(null, '', url);
    } catch (value) { if (mounted.current) showError(value); } finally { if (mounted.current) setBusy(false); }
  }
  async function joinRoom(event: React.FormEvent) {
    event.preventDefault(); if (busy || !name.trim() || !room) return; setBusy(true); setError('');
    const nonceKey = `narra-challenge-join-v1:${room.id}`; let nonce: string;
    try { nonce = localStorage.getItem(nonceKey) ?? crypto.randomUUID(); localStorage.setItem(nonceKey, nonce); } catch { nonce = crypto.randomUUID(); }
    try {
      const response = await requestRoom(room.id, { action: 'join', roomId: room.id, name: name.trim(), nonce }); if (!mounted.current) return;
      const pass = response.session!; sessionRef.current = pass; setSession(pass); try { localStorage.setItem(sessionKey(pass.roomId), JSON.stringify(pass)); } catch { setNotice(tr('Keep this tab open; this browser cannot save your room pass.', 'Bạn giữ tab này mở nhé; trình duyệt chưa lưu được vé vào phòng.')); } accept(response, pass);
    } catch (value) { if (mounted.current) showError(value); } finally { if (mounted.current) setBusy(false); }
  }
  async function startTurn() {
    if (busy || !room || !session || !voice.supported) return; setBusy(true); setError(''); cancelSpeech();
    try {
      if (navigator.mediaDevices?.getUserMedia) { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.getTracks().forEach(track => track.stop()); }
      if (!mounted.current) return;
      const response = await requestRoom(room.id, { action: 'start', roomId: room.id }, session.token); if (!mounted.current) return;
      const person = response.room.participants.find(p => p.id === session.participantId); if (person?.result) { accept(response); return; }
      if (!person?.start || person.start.deadlineAt <= response.room.serverNow) { accept(response); changePhase('expired'); return; }
      textRef.current = ''; setTranscript(''); finishing.current = false; finishPayload.current = null; setResumed(false);
      const perf = performance.now(); runtime.current = { start: perf + person.start.startedAt - response.room.serverNow, end: perf + person.start.deadlineAt - response.room.serverNow }; autoStart.current = true;
      setRoom(response.room); clock.current = { epoch: response.room.serverNow, perf }; setRemaining(person.start.deadlineAt - response.room.serverNow); changePhase('countdown');
    } catch (value) { if (mounted.current) { if (value instanceof DOMException && ['NotAllowedError', 'NotFoundError', 'NotReadableError'].includes(value.name)) setError(tr('Allow microphone access and check your microphone before starting. Your timer has not started.', 'Bạn cho phép truy cập mic và kiểm tra mic trước nhé. Đồng hồ của bạn chưa chạy đâu.')); else showError(value); } } finally { if (mounted.current) setBusy(false); }
  }
  async function saveResult(payload: FinishPayload) {
    const pass = sessionRef.current; const snapshot = savedRoom.current; if (!pass || !snapshot) return;
    try {
      const response = await requestRoom(snapshot.id, { action: 'finish', roomId: snapshot.id, ...payload }, pass.token); if (!mounted.current) return;
      const result = response.room.participants.find(p => p.id === pass.participantId)?.result;
      if (result) {
        const key = `narra-challenge-logged-v1:${snapshot.id}:${pass.participantId}`; let logged = false; try { logged = !!localStorage.getItem(key); localStorage.setItem(key, '1'); } catch { /* A live result is only saved once by this component. */ }
        if (!logged) { logActivity(tr('Speaking challenge', 'Thử thách nói'), Math.round(result.elapsedMs / 600) / 100); setStats(previous => ({ ...previous, speakingTries: previous.speakingTries + 1 })); }
      }
      setError(''); accept(response);
    } catch (value) { if (mounted.current) { showError(value); changePhase('save-error'); } }
  }
  async function finishTurn() {
    if (finishing.current || !runtime.current || !savedRoom.current) return;
    finishing.current = true; const elapsedMs = Math.max(1000, Math.min(savedRoom.current.duration * 1000, Math.round(performance.now() - runtime.current.start))); changePhase('saving');
    if (voiceRef.current.listening) voiceRef.current.stop(); else if (voiceRef.current.pending) voiceRef.current.cancel();
    // Give the browser one short chance to deliver its final recognition result.
    after(() => {
      if (!mounted.current) return; voiceRef.current.cancel(); const payload = { wordCount: countChallengeWords(textRef.current), elapsedMs }; finishPayload.current = payload; void saveResult(payload);
    }, 1800);
  }
  finishRef.current = () => { void finishTurn(); };
  function requestClose() { if (['active', 'countdown', 'saving', 'save-error'].includes(phaseRef.current)) setLeaving(true); else onClose(); }
  async function shareInvite(native: boolean) {
    if (!room) return; setNotice(''); const url = invitationUrl(room.id);
    try {
      if (native && navigator.share) await navigator.share({ title: tr('A little speaking challenge on Narra', 'Cùng thử một thử thách nói trên Narra'), text: tr(`Let’s try “${room.prompt.title}” - ${room.duration} seconds each.`, `Mình thử “${room.prompt.titleVi}” nhé - mỗi người ${room.duration} giây.`), url });
      else { await navigator.clipboard.writeText(url); setNotice(tr("Invitation copied, ready to send to the person you want to play with.", "Đã chép link, bạn gửi cho người muốn thử cùng nhé.")); }
    } catch (value) { if (!(value instanceof DOMException && value.name === 'AbortError')) setNotice(tr('Copy the invitation link below and send it to your friend.', 'Bạn chép link mời bên dưới rồi gửi cho bạn nhé.')); }
  }
  const me = room?.participants.find(p => p.id === session?.participantId); const other = room?.participants.find(p => p.id !== session?.participantId); const bothFinished = room?.participants.length === 2 && room.participants.every(p => !!p.result);
  const currentWords = countChallengeWords(transcript + (phase === 'active' ? ` ${voice.interim}` : '')); const target = challengeTarget(room?.duration ?? duration);
  const isLive = phase === 'active' || phase === 'countdown'; const prompt = room?.prompt ?? challengePrompts.find(p => p.id === promptId)!;
  const secondsLeft = Math.max(0, Math.ceil(remaining / 1000)); const elapsed = room ? Math.max(0, room.duration - remaining / 1000) : 0;
  const percent = room ? Math.max(0, Math.min(100, remaining / (room.duration * 1000) * 100)) : 100;

  return <dialog ref={dialog} className="challenge-dialog" aria-labelledby={`${inputId}-title`} onCancel={event => { event.preventDefault(); requestClose(); }}>
    <div className="challenge-shell">
      <header className="challenge-header"><div className="challenge-brand"><img src={brandAsset('icon.webp')} alt="" /><span>{tr('Speak together', 'Cùng nhau lên tiếng')}</span></div><button ref={closeButton} className="challenge-icon-button" type="button" aria-label={tr('Close challenge', 'Đóng thử thách')} onClick={requestClose}><X size={22} /></button></header>
      {leaving && <div className="challenge-leave" role="alert"><strong>{tr('Leave this turn?', 'Bạn muốn rời lượt này chứ?')}</strong><p>{tr("While the timer keeps running, words are shared only when you finish and save your turn.", "Đồng hồ vẫn tiếp tục chạy, còn số từ chỉ được chia sẻ khi bạn kết thúc và lưu lượt nhé.")}</p><div><button type="button" className="challenge-secondary" onClick={() => setLeaving(false)}>{tr('Stay here', 'Ở lại nói tiếp')}</button><button type="button" className="challenge-secondary" onClick={onClose}>{tr('Leave room', 'Rời phòng')}</button></div></div>}
      <main className="challenge-content">
        {phase === 'choose' && <>
          <div className="challenge-intro"><div className="challenge-kicker"><Sparkles size={16} /> {tr('A friendly speaking challenge', 'Một thử thách nhỏ, thêm chuyện để nói')}</div><h1 id={`${inputId}-title`}>{tr("One prompt, two voices!", "Một chủ đề, hai giọng nói!")}</h1><p>{tr("Create a room and send the link to a real friend, whose name will appear here when they join.", "Bạn tạo một phòng rồi gửi link cho người muốn thử cùng nhé, tên bạn ấy sẽ hiện ở đây khi tham gia.")} </p><BuddyAvatar className="challenge-buddy" mood="welcome" size={140}/></div>
          <form className="challenge-create-form" onSubmit={createRoom}>
            <label className="challenge-name" htmlFor={inputId}>{tr('Your name in this room', 'Tên bạn trong phòng này')}<input id={inputId} value={name} maxLength={40} autoComplete="nickname" required onChange={event => setName(event.target.value)} /></label>
            <fieldset className="challenge-duration"><legend>{tr('How long shall we try?', 'Mình thử bao lâu nhỉ?')}</legend><div>{([30, 60] as const).map(value => <button type="button" key={value} className={duration === value ? 'selected' : ''} aria-pressed={duration === value} onClick={() => setDuration(value)}><Clock3 size={19} /><strong>{value}</strong><span>{tr('seconds each', 'giây mỗi người')}</span>{duration === value && <Check size={18} />}</button>)}</div></fieldset>
            <fieldset className="challenge-topics"><legend>{tr('Choose your conversation starter', 'Chọn chuyện để mở lời')}</legend>{challengePrompts.map(item => <button type="button" key={item.id} className={promptId === item.id ? 'selected' : ''} aria-pressed={promptId === item.id} onClick={() => setPromptId(item.id)}><span className="challenge-topic-dot"><Target size={19} /></span><span><strong>{tr(item.title, item.titleVi)}</strong><small>{tr(item.task, item.taskVi)}</small></span>{promptId === item.id ? <Check size={20} /> : <ArrowRight size={18} />}</button>)}</fieldset>
            <button className="challenge-primary" disabled={busy || !name.trim()} type="submit">{busy ? <LoaderCircle className="challenge-spin" size={20} /> : <UsersRound size={20} />}{tr('Create invitation', 'Tạo lời mời')}<ArrowRight size={18} /></button>
          </form>
          <div className="challenge-privacy"><ShieldCheck size={18} /><p>{tr('A real room for two people. No account needed. We share counts and timing, never your recording or transcript.', 'Phòng thật dành cho hai người, không cần tài khoản. Mình chỉ chia sẻ số từ và thời gian, không chia sẻ bản ghi âm hay nội dung bạn nói.')}</p></div>
        </>}
        {phase === 'loading' && <div className="challenge-state"><LoaderCircle className="challenge-spin" size={34} /><h1 id={`${inputId}-title`}>{tr('Opening your room…', 'Tớ đang mở phòng…')}</h1><p>{tr('Finding your invitation and the people who joined.', 'Đang tìm lời mời và những người đã tham gia.')}</p>{error && <button type="button" className="challenge-secondary" onClick={() => { setError(''); setRoomId(''); after(() => setRoomId(suppliedRoomId ?? roomId), 0); }}>{tr('Try connecting again', 'Kết nối lại')}</button>}</div>}
        {room && phase !== 'choose' && <>
          <div className="challenge-room-heading"><span className="challenge-kicker"><UsersRound size={16} /> {tr('Your shared room', 'Phòng thử thách của mình')}</span><h1 id={`${inputId}-title`}>{tr(prompt.title, prompt.titleVi)}</h1><div className="challenge-room-tags"><span><Clock3 size={14} />{room.duration}{tr(' sec each', ' giây mỗi người')}</span><span><Target size={14} />{target}{tr('-word goal', ' từ để chạm mốc')}</span><span><LockKeyhole size={14} />{tr('Invitation only', 'Vào bằng link mời')}</span></div></div>
          <section className="challenge-players" aria-label={tr('Participants', 'Người tham gia')}>
            {[room.participants[0], room.participants[1]].map((person, index) => <div key={person?.id ?? 'open'} className={`challenge-player ${person?.id === me?.id ? 'is-you' : ''}`}><span className="challenge-player-avatar">{person ? person.name.slice(0, 1).toLocaleUpperCase() : <UsersRound size={22} />}</span><span><strong>{person?.name ?? tr('Your friend', 'Người bạn của mình')}{person?.id === me?.id && <small>{tr(' · you', ' · bạn')}</small>}</strong><small>{!person ? tr('Waiting for the invitation to be opened', 'Đang chờ bạn ấy mở lời mời') : person.result ? tr('Turn saved', 'Đã lưu lượt nói') : person.start ? person.start.deadlineAt < serverNow() ? tr('Turn ended', 'Đã hết thời gian') : tr('Taking their turn', 'Đang trong lượt nói') : index === 0 && room.participants.length < 2 ? tr('Ready when your friend joins', 'Sẵn sàng khi bạn mình vào') : tr('Ready to speak', 'Sẵn sàng lên tiếng')}</small></span>{person?.result && <CheckCheck size={20} />}</div>)}
          </section>
          {(phase === 'waiting' || phase === 'ready') && <div className="challenge-invite"><div><strong>{tr('Send this little invitation', 'Gửi một lời mời nhỏ nhé')}</strong><p>{tr("Each person starts their own timer when ready, with the same topic and duration.", "Mỗi người tự bắt đầu đồng hồ khi sẵn sàng, với cùng chủ đề và thời lượng nhé.")}</p></div><div className="challenge-invite-actions"><button type="button" className="challenge-secondary" onClick={() => void shareInvite(false)}><Copy size={16} />{tr('Copy link', 'Chép link')}</button>{!!navigator.share && <button type="button" className="challenge-icon-button" aria-label={tr('Share invitation', 'Chia sẻ lời mời')} onClick={() => void shareInvite(true)}><Share2 size={19} /></button>}</div><input className="challenge-invite-url" aria-label={tr('Invitation link', 'Link mời')} value={invitationUrl(room.id)} readOnly onFocus={event => event.currentTarget.select()} /></div>}
          {phase === 'join' && (room.participants.length < 2 ? <form className="challenge-join" onSubmit={joinRoom}><BuddyAvatar mood="welcome" size={100}/><h2>{tr(`${room.participants[0]?.name ?? 'A friend'} saved you a spot.`, `${room.participants[0]?.name ?? 'Một người bạn'} đang chờ bạn đó.`)}</h2><p>{tr("Join first, have a look, then take your turn, with the mic starting only when you choose.", "Mình vào phòng, xem chủ đề rồi hãy chọn bật mic để bắt đầu nhé.")}</p><label className="challenge-name" htmlFor={inputId}>{tr('What should we call you?', 'Mình gọi bạn là gì nhỉ?')}<input id={inputId} value={name} maxLength={40} autoComplete="nickname" required onChange={event => setName(event.target.value)} /></label><button type="submit" className="challenge-primary" disabled={busy || !name.trim()}>{busy ? <LoaderCircle className="challenge-spin" size={20} /> : <UsersRound size={20} />}{tr('Join this challenge', 'Vào thử thách cùng bạn')}</button></form> : <div className="challenge-state"><UsersRound size={34} /><h2>{tr('This room is full.', 'Phòng này đủ hai người rồi.')}</h2><p>{tr('If you already joined, reopen it in that browser. Otherwise, ask your friend for a new room.', 'Nếu đã tham gia, bạn mở lại trên trình duyệt cũ nhé. Nếu chưa, mình nhờ bạn gửi một phòng mới.')}</p><button type="button" className="challenge-secondary" onClick={onClose}>{tr('Back to Narra', 'Về Narra')}</button></div>)}
          {phase === 'waiting' && <div className="challenge-waiting"><BuddyAvatar className="challenge-waiting-buddy" mood="curious" size={100}/><h2>{tr('A little better with a friend.', 'Có bạn, câu chuyện vui hơn.')}</h2><p>{tr("Share the link above, and your friend will appear here when they join.", "Bạn gửi link bên trên nhé, tên người bạn sẽ hiện ở đây khi bạn ấy thật sự vào phòng.")}</p><span className="challenge-connection"><span />{tr('Checking for your friend', 'Đang chờ bạn mình vào')}</span></div>}
          {(phase === 'ready' || isLive) && <section className="challenge-prompt"><span><Flag size={16} />{tr('Your conversation starter', 'Chuyện mình sẽ kể')}</span><h2>{prompt.prompt}</h2>{profile.uiLanguage === 'Tiếng Việt' && <p>{prompt.promptVi}</p>}<div className="challenge-starter"><Sparkles size={17} /><span>{tr('A first line, if you need one:', 'Nếu cần một câu mở đầu:')}<strong>{prompt.starter}</strong></span></div></section>}
          {phase === 'ready' && <div className="challenge-start"><div className="challenge-buddy-nudge"><BuddyAvatar mood="encourage" size={64}/><span>{tr("I’m right here with you, so take a breath and think of a little story.", "Tớ ở đây nè, mình hít một hơi, nghĩ một chuyện nhỏ rồi bắt đầu nhé.")}</span></div><p>{tr(`Tell the story your way and try for ${target} recognized words, with the word goal as the only automatic task check.`, `Bạn cứ kể theo cách của mình và thử chạm ${target} từ được nhận diện nhé, hệ thống chỉ kiểm tra mốc số từ thôi.`)}</p><button type="button" className="challenge-primary" disabled={busy || !voice.supported} onClick={() => void startTurn()}>{busy ? <LoaderCircle className="challenge-spin" size={21} /> : <Mic size={21} />}{busy ? tr('Checking your mic…', 'Đang kiểm tra mic…') : tr('I’m ready - start my turn', 'Sẵn sàng rồi - bắt đầu lượt của mình')}</button><small>{tr('Allow the microphone, then a 3-second countdown. Your friend starts separately.', 'Cho phép bật mic, rồi mình đếm ngược 3 giây. Bạn của mình bắt đầu riêng nhé.')}</small></div>}
          {isLive && <section className={`challenge-live ${remaining < 10000 ? 'challenge-last-seconds' : ''}`}>
            <div className="challenge-timer" style={{ '--challenge-progress': `${percent}%` } as React.CSSProperties}><div><span>{phase === 'countdown' ? countdown : secondsLeft}</span><small>{phase === 'countdown' ? tr('get ready', 'chuẩn bị nhé') : tr('seconds left', 'giây còn lại')}</small></div></div>
            <div className="challenge-live-copy"><BuddyAvatar className="challenge-live-buddy" mood="focus" motion={false} size={64}/><span className="challenge-connection"><span className={voice.listening ? 'listening' : ''} />{phase === 'countdown' ? tr('Your turn is about to begin', 'Sắp đến lượt mình rồi') : voice.listening ? tr('Listening to your voice', 'Tớ đang nghe bạn nói') : voice.pending ? tr('The browser is processing your voice…', 'Trình duyệt đang xử lý giọng nói…') : tr('Mic paused - tap to continue', 'Mic đang tạm nghỉ - chạm để nói tiếp')}</span><h2>{phase === 'countdown' ? tr("Take a breath, you’ve got a story to tell!", "Hít một hơi nhé, mình có chuyện để kể mà!") : tr('Your story, your words.', 'Câu chuyện của bạn, lời kể của bạn.')}</h2><div className="challenge-live-metrics"><span><strong>{currentWords}</strong>{tr('recognized words', 'từ được nhận diện')}</span><span><strong>{Math.floor(elapsed)}s</strong>{tr('elapsed', 'đã trôi qua')}</span><span><strong>{target}</strong>{tr('word goal', 'mốc số từ')}</span></div></div>
            {resumed && <p className="challenge-resume-note">{tr('Your timer was already running. This browser did not keep the earlier transcript; only words recognized in this open tab can be saved.', 'Đồng hồ của bạn đã chạy từ trước. Trình duyệt không giữ nội dung cũ; chỉ những từ được nhận diện trong tab đang mở này mới lưu được.')}</p>}
            {phase === 'active' && <><div className="challenge-mic-controls"><button type="button" className={`challenge-primary ${voice.listening ? 'is-recording' : ''}`} disabled={voice.pending || !voice.supported || finishing.current} onClick={() => { setAttemptedMic(true); if (voice.listening) voice.stop(); else voice.start(); }}>{voice.pending ? <LoaderCircle className="challenge-spin" size={21} /> : voice.listening ? <Square size={19} /> : <Mic size={21} />}{voice.listening ? tr('Pause mic', 'Tạm dừng mic') : tr('Continue speaking', 'Nói tiếp nhé')}</button><button type="button" className="challenge-secondary" disabled={(!currentWords && remaining > 0) || voice.pending} onClick={() => void finishTurn()}><Flag size={18} />{tr('Finish my turn', 'Kết thúc lượt của mình')}</button></div><div className="challenge-transcript" aria-live="polite"><strong>{tr('Only you can see these words', 'Chỉ bạn thấy những dòng này')}</strong><p>{transcript}{voice.interim && <span> {voice.interim}</span>}{!transcript && !voice.interim && tr("Start with a sentence and let the rest follow.", "Mình bắt đầu bằng một câu thôi, những câu sau sẽ đến mà.")}</p></div>{attemptedMic && !voice.listening && !voice.pending && !voice.error && <p className="challenge-mic-note">{tr('A pause can stop the browser mic. Tap “Continue speaking” to add another sentence before time runs out.', 'Khi bạn ngừng nói, mic của trình duyệt có thể tự dừng. Chạm “Nói tiếp nhé” để kể thêm trước khi hết giờ.')}</p>}</>}
          </section>}
          {(phase === 'saving' || phase === 'save-error') && <div className="challenge-state"><span className="challenge-finish-icon">{phase === 'saving' ? <LoaderCircle className="challenge-spin" size={30} /> : <RotateCcw size={30} />}</span><h2>{phase === 'saving' ? tr('Saving your little speaking win…', 'Đang lưu lượt nói của bạn…') : tr("Your words are here, let’s save them!", "Lời kể vẫn ở đây, mình lưu lại nhé.")}</h2><p>{tr('Only your word count and timing go to the shared room.', 'Chỉ số từ và thời gian được gửi vào phòng chung.')}</p>{phase === 'save-error' && <button type="button" className="challenge-primary" onClick={() => { if (finishPayload.current) { changePhase('saving'); setError(''); void saveResult(finishPayload.current); } }}>{tr('Try saving again', 'Lưu lại lần nữa')}</button>}</div>}
          {phase === 'results' && <section className="challenge-results"><div className="challenge-result-heading"><BuddyAvatar mood={me?.result?.taskCompleted ? 'proud' : 'celebrate'} size={112}/><h2>{bothFinished ? tr("Two voices, a shared little win!", "Hai giọng nói, một niềm vui chung!") : tr('Your turn is safely saved.', 'Lượt nói của bạn đã được lưu rồi.')}</h2><p>{bothFinished ? tr('Here’s what you both said, measured in words and time.', 'Đây là lượt nói của hai bạn, được đo bằng số từ và thời gian.') : tr(`We’ll show ${other?.name ?? 'your friend'}’s result when they finish their real turn.`, `Khi ${other?.name ?? 'bạn của mình'} hoàn tất lượt nói thật, kết quả sẽ xuất hiện ở đây.`)}</p></div><div className="challenge-result-grid">{room.participants.map(person => <article key={person.id} className={`challenge-result-card ${person.id === me?.id ? 'is-you' : ''}`}><h3>{person.name}<small>{person.id === me?.id ? tr('You', 'Bạn') : tr('Your friend', 'Người bạn của mình')}</small></h3>{person.result ? <><strong className="challenge-result-number">{person.result.wordCount}<small>{tr('recognized words', 'từ được nhận diện')}</small></strong><div className="challenge-result-details"><span><strong>{Math.round(person.result.elapsedMs / 1000)}s</strong>{tr('speaking window', 'thời gian lượt')}</span><span><strong>{person.result.wpm}</strong>{tr('words / minute', 'từ / phút')}</span></div><div className={`challenge-goal-result ${person.result.taskCompleted ? 'complete' : ''}`}>{person.result.taskCompleted ? <Check size={17} /> : <Target size={17} />}<span>{person.result.taskCompleted ? tr('Word goal reached', 'Đã chạm mốc số từ') : tr(`${person.result.wordCount} of ${person.result.targetWords} words`, `${person.result.wordCount} / ${person.result.targetWords} từ`)}<small>{tr('Automatic task check: word count only', 'Kiểm tra tự động: chỉ tính số từ')}</small></span></div></> : <div className="challenge-result-pending"><Clock3 size={28} /><strong>{person.start && person.start.deadlineAt < serverNow() ? tr('No saved result yet', 'Chưa có kết quả được lưu') : tr('Their turn is still open', 'Lượt của bạn ấy vẫn đang mở')}</strong><p>{tr('A result appears only after this person records and saves a turn.', 'Kết quả chỉ hiện khi người này thực sự nói và lưu lượt.')}</p></div>}</article>)}</div><div className="challenge-measure-note"><ShieldCheck size={19} /><p>{tr('Words and WPM come from the browser transcript and elapsed turn time. They aren’t a pronunciation score or an English level. The conversation task above is yours to reflect on together.', 'Số từ và từ/phút được tính từ nội dung trình duyệt nhận diện và thời gian lượt. Đây không phải điểm phát âm hay trình độ tiếng Anh. Hai bạn có thể cùng xem lại mình đã kể đủ ý của chủ đề chưa nhé.')}</p></div><button type="button" className="challenge-primary" onClick={onClose}>{tr('Back to Narra', 'Về Narra')}<ArrowRight size={19} /></button><p className="challenge-expires">{tr('This invitation expires 24 hours after it was created.', 'Lời mời hết hạn sau 24 giờ kể từ khi tạo.')}</p></section>}
          {phase === 'expired' && <div className="challenge-state"><Clock3 size={34} /><h2>{tr('That timed turn has ended.', 'Lượt nói đó đã hết giờ rồi.')}</h2><p>{tr('There isn’t a saved result for this turn. Your earlier words weren’t kept on reload, so we won’t invent a score. You can make a fresh invitation when you’re ready.', 'Lượt này chưa có kết quả được lưu. Nội dung trước đó không được giữ khi tải lại trang, nên mình không tự tạo kết quả. Khi sẵn sàng, bạn có thể tạo lời mời mới nhé.')}</p><button type="button" className="challenge-primary" onClick={onClose}>{tr('Back to Narra', 'Về Narra')}</button></div>}
          {phase !== 'active' && phase !== 'countdown' && phase !== 'results' && <div className="challenge-privacy"><ShieldCheck size={18} /><p>{tr('Only names, recognized-word counts, and turn timing are stored. No audio or transcript is uploaded to Narra. Browser speech recognition may use your browser provider’s speech service.', 'Narra chỉ lưu tên, số từ được nhận diện và thời gian lượt. Bản ghi âm và nội dung nói không được gửi lên Narra. Nhận diện giọng nói có thể dùng dịch vụ của nhà cung cấp trình duyệt.')}</p></div>}
        </>}
        {!voice.supported && !['loading', 'results', 'expired'].includes(phase) && <div className="challenge-warning"><MicOff size={21} /><div><strong>{tr('Voice recognition isn’t available here.', 'Trình duyệt này chưa nhận diện được giọng nói.')}</strong><p>{tr('You can browse the topic and share the invitation, but a timed voice turn needs a supported Chrome or Edge browser with microphone permission. Typed text won’t be submitted as speech.', 'Bạn vẫn xem chủ đề và gửi lời mời được. Để nói có bấm giờ, bạn dùng Chrome hoặc Edge hỗ trợ nhận diện giọng nói và cho phép truy cập mic nhé. Nội dung gõ sẽ không được tính là lời nói.')}</p></div></div>}
        {phase === 'active' && voice.error && <div className="challenge-warning" role="alert"><MicOff size={20} /><p>{voice.error}{profile.uiLanguage === 'Tiếng Việt' && <span>{tr('', ' Bạn kiểm tra quyền truy cập mic hoặc mạng rồi chạm “Nói tiếp nhé”. Đồng hồ vẫn chạy.')}</span>}</p></div>}
        {offline && <div className="challenge-warning challenge-buddy-error" role="status"><BuddyAvatar mood="encourage" motion={false} size={54}/><p>{tr("We’re trying to reconnect the room while your local timer keeps running.", "Kết nối phòng đang tạm ngắt, tớ đang thử kết nối lại trong khi đồng hồ trên máy vẫn chạy nhé.")}</p></div>}
        {error && <div className="challenge-error challenge-buddy-error" role="alert"><BuddyAvatar mood="encourage" motion={false} size={54}/><p>{error}</p></div>}
        {notice && <div className="challenge-notice" role="status">{notice}</div>}
      </main>
      <footer className="challenge-footer"><span><ShieldCheck size={14} />{tr("A real friend, a little courage and your own voice.", "Một người bạn thật, một chút can đảm và giọng nói của bạn.")}</span></footer>
    </div>
  </dialog>;
}
