import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCheck, ChevronRight, CircleCheck, Headphones, Mic, Play, RotateCcw, Send, Sparkles, Square, Volume2 } from 'lucide-react';
import { type Lesson, type Scenario, tutors } from './data';
import { speak, useNarra } from './state';
import { Art, Avatar, Empty, Modal } from './ui';

export function GoalDialog({ onClose }: { onClose: () => void }) {
  const { profile, setProfile, notify } = useNarra(); const [goal, setGoal] = useState(profile.dailyGoal);
  return <Modal title="Make a little time for you" onClose={onClose}><p className="dialog-description">Small steps make a big difference. Choose a daily goal that feels good.</p><div className="goal-options">{[{ minutes: 5, name: 'A little every day', label: 'Build a gentle habit' }, { minutes: 10, name: 'Find your rhythm', label: 'Make steady progress' }, { minutes: 15, name: 'Go a little further', label: 'Grow your confidence' }, { minutes: 20, name: 'Make it your moment', label: 'More time for your English' }].map(o => <button className={`goal-option ${goal === o.minutes ? 'selected' : ''}`} onClick={() => setGoal(o.minutes)} key={o.minutes} aria-pressed={goal === o.minutes}><span className="goal-option-minutes">{o.minutes}<small>min</small></span><span><strong>{o.name}</strong><small>{o.label}</small></span>{goal === o.minutes && <CircleCheck size={22} />}</button>)}</div><button className="primary-button full-width" onClick={() => { setProfile(p => ({ ...p, dailyGoal: goal })); notify(`Your daily goal is now ${goal} minutes`); onClose(); }}>Set my goal <Check size={18} /></button></Modal>;
}

export function TutorDialog({ onClose, onTalk }: { onClose: () => void; onTalk: () => void }) {
  const { profile, setProfile, notify } = useNarra(); const [selected, setSelected] = useState(profile.tutor);
  return <Modal title="Find your kind of conversation" onClose={onClose}><p className="dialog-description">A friendly face for every step of your journey.</p><div className="tutor-options">{tutors.map((t, i) => <button key={t.id} className={`tutor-option ${selected === t.name ? 'selected' : ''}`} onClick={() => setSelected(t.name)} aria-pressed={selected === t.name}>{t.name === 'Camila' || t.name === 'Skye' ? <Avatar name={t.name} /> : <span className={`tutor-initial tone-${['peach', 'lavender', 'green', 'blue'][i % 4]}`}>{t.name[0]}</span>}<span><strong>{t.name}</strong><small>{t.tagline}</small></span>{selected === t.name && <CircleCheck size={22} />}</button>)}</div><button className="primary-button full-width" onClick={() => { setProfile(p => ({ ...p, tutor: selected })); notify(`${selected} is now your tutor`); onTalk(); }}>Talk with {selected}<ArrowRight size={18} /></button></Modal>;
}

const lessonQuestions = [
  { prompt: 'What is a natural way to talk about a daily habit?', options: ['I usually start my day with a cup of coffee.', 'I coffee yesterday tomorrow.', 'I am always yesterday.'], correct: 0, hint: '“Usually” helps us describe things we do regularly.' },
  { prompt: 'Complete the sentence: “I look forward ___ my morning walk.”', options: ['for', 'to', 'at'], correct: 1, hint: 'We say “look forward to” something we enjoy.' },
  { prompt: 'Which phrase means using your time well?', options: ['Take it for granted', 'Make the most of it', 'Leave it behind'], correct: 1, hint: '“Make the most of” means to use something in the best possible way.' },
];

export function LessonDialog({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { stats, setStats, logActivity } = useNarra(); const [started, setStarted] = useState(false); const [step, setStep] = useState(0); const [answer, setAnswer] = useState<number | null>(null); const [complete, setComplete] = useState(false);
  const q = lessonQuestions[step];
  function finish() { setStats(s => ({ ...s, completed: s.completed.includes(lesson.id) ? s.completed : [...s.completed, lesson.id] })); logActivity(lesson.title, lesson.minutes); setComplete(true); }
  return <Modal title={complete ? 'A little closer. Well done!' : lesson.title} onClose={onClose}>{complete ? <div className="session-success"><span className="success-medallion"><CheckCheck size={44} /></span><h3>One more step on your path</h3><p>You completed {lesson.title}. Your progress has been saved.</p><div className="session-summary"><span><strong>{lesson.minutes}</strong>minutes practised</span><span><strong>{stats.completed.length}</strong>lessons complete</span></div><button className="primary-button full-width" onClick={onClose}>Keep exploring<ArrowRight size={18} /></button></div> : !started ? <><div className="lesson-cover tone-green"><Art name="plant" /></div><p className="eyebrow purple">Guided lesson · {lesson.minutes} min</p><h3 className="dialog-large-title">A small step. A little more confidence.</h3><p className="dialog-description">Practise useful everyday phrases, listen to an example, and try a few questions.</p><p className="preview-note">Interactive sample lesson</p><button className="primary-button full-width" onClick={() => setStarted(true)}><Play size={17} fill="currentColor" /> Let’s begin</button></> : <><div className="session-progress"><span>Question {step + 1} of {lessonQuestions.length}</span><div className="progress-track"><span style={{ width: `${(step + 1) / lessonQuestions.length * 100}%` }} /></div></div><button className="listen-example tone-lavender" onClick={() => speak('I usually start my day with a cup of coffee. I look forward to my morning walk, and I try to make the most of every day.')}><Volume2 size={24} /><span>Listen to the example</span><Play size={15} fill="currentColor" /></button><h3 className="question-title">{q.prompt}</h3><div className="answer-options">{q.options.map((option, i) => <button key={option} className={`answer-option ${answer === i ? (i === q.correct ? 'correct' : 'incorrect') : ''}`} disabled={answer !== null} onClick={() => setAnswer(i)}><span>{String.fromCharCode(65 + i)}</span>{option}{answer === i && i === q.correct && <Check size={19} />}</button>)}</div>{answer !== null && <div className={`answer-feedback ${answer === q.correct ? 'tone-green' : 'tone-peach'}`}><strong>{answer === q.correct ? 'That’s it!' : 'A little tip'}</strong><p>{q.hint}</p></div>}<button className="primary-button full-width" disabled={answer === null} onClick={() => { if (step === lessonQuestions.length - 1) finish(); else { setStep(s => s + 1); setAnswer(null); } }}>{step === lessonQuestions.length - 1 ? 'Complete lesson' : 'Continue'}<ArrowRight size={18} /></button></>}</Modal>;
}

export function FlashcardsDialog({ collection, onClose }: { collection?: string; onClose: () => void }) {
  const { words, setWords, setStats, logActivity } = useNarra(); const [index, setIndex] = useState(0); const [revealed, setRevealed] = useState(false); const [count, setCount] = useState(0);
  const [deck] = useState(() => words.filter(w => collection === 'due' ? w.due : collection ? w.collection === collection : true));
  const word = deck[index];
  function rate(mastered: boolean) { setWords(ws => ws.map(w => w.id === word.id ? { ...w, status: mastered ? 'Mastered' : 'Learning', due: !mastered } : w)); setStats(s => ({ ...s, reviews: s.reviews + 1 })); setCount(c => c + 1); setIndex(i => i + 1); setRevealed(false); if (index === deck.length - 1) logActivity('Flashcard review', 2); }
  return <Modal title={collection && collection !== 'due' ? collection : 'A word at a time'} onClose={onClose}>{deck.length === 0 ? <Empty title="You’re all caught up">No words are due for review. Add a few words and come back for a little practice.</Empty> : word ? <><div className="session-progress"><span>{index + 1} of {deck.length} words</span><div className="progress-track"><span style={{ width: `${index / deck.length * 100}%` }} /></div></div><button className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(!revealed)} aria-label={revealed ? 'Show word' : 'Reveal meaning'}><span className="eyebrow">{revealed ? 'The meaning' : 'Do you remember?'}</span><h3>{revealed ? word.definition : word.word}</h3>{revealed ? <p>“{word.example}”</p> : <p>Tap to reveal the meaning<RotateCcw size={16} /></p>}</button><button className="text-button listen-word" onClick={() => speak(word.word)}><Volume2 size={18} />Listen to the word</button>{revealed ? <div className="form-actions"><button className="secondary-button" onClick={() => rate(false)}>Keep practising</button><button className="primary-button" onClick={() => rate(true)}>Got it<Check size={17} /></button></div> : <button className="primary-button full-width" onClick={() => setRevealed(true)}>Reveal meaning</button>}</> : <div className="session-success"><span className="success-medallion"><Sparkles size={44} /></span><h3>A little more in your vocabulary</h3><p>You reviewed {count} words. Nicely done!</p><button className="primary-button full-width" onClick={onClose}>Finish review<Check size={18} /></button></div>}</Modal>;
}

export function SpeakingDialog({ shadowing = false, onClose }: { shadowing?: boolean; onClose: () => void }) {
  const { setStats, logActivity, notify } = useNarra();
  const phrases = ['I have a reservation for two nights.', 'I try to make the most of every day.', 'Could you tell me the departure time?'];
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState<'permission' | 'saving' | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioRef = useRef('');
  const playback = useRef<HTMLAudioElement | null>(null);
  const mounted = useRef(false);
  const requestGeneration = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      // Invalidate pending permission requests before stopping a live recorder.
      mounted.current = false;
      requestGeneration.current++;
      busy.current = false;
      const active = recorder.current;
      if (active) {
        active.ondataavailable = null;
        active.onstop = null;
        active.onerror = null;
        if (active.state !== 'inactive') active.stop();
      }
      stream.current?.getTracks().forEach(track => track.stop());
      recorder.current = null;
      stream.current = null;
      playback.current?.pause();
      if (audioRef.current) URL.revokeObjectURL(audioRef.current);
      audioRef.current = '';
      window.speechSynthesis?.cancel();
    };
  }, []);

  function clearAudio() {
    playback.current?.pause();
    if (audioRef.current) URL.revokeObjectURL(audioRef.current);
    audioRef.current = '';
    setAudioUrl('');
    window.speechSynthesis?.cancel();
  }

  async function record() {
    if (busy.current || !mounted.current) return;
    if (recorder.current?.state === 'recording') {
      busy.current = true;
      setPending('saving');
      recorder.current.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError('Recording is not available in this browser. You can still listen and practise aloud.'); return; }
    const generation = ++requestGeneration.current;
    busy.current = true;
    setPending('permission');
    setError('');
    clearAudio();
    let media: MediaStream | null = null;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || generation !== requestGeneration.current) {
        media.getTracks().forEach(track => track.stop());
        return;
      }
      const recordingStream = media;
      stream.current = recordingStream;
      const rec = new MediaRecorder(recordingStream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      rec.onstop = () => {
        recordingStream.getTracks().forEach(track => track.stop());
        if (!mounted.current || generation !== requestGeneration.current || recorder.current !== rec) return;
        recorder.current = null;
        stream.current = null;
        busy.current = false;
        setRecording(false);
        setPending(null);
        const blob = new Blob(chunks, { type: rec.mimeType });
        if (!blob.size) { setError('No audio was captured. Try another recording.'); return; }
        const url = URL.createObjectURL(blob);
        audioRef.current = url;
        setAudioUrl(url);
        setStats(stats => ({ ...stats, speakingTries: stats.speakingTries + 1 }));
        logActivity(shadowing ? 'Shadowing practice' : 'Read aloud', 1);
      };
      rec.onerror = () => {
        rec.onstop = null;
        if (rec.state !== 'inactive') rec.stop();
        recordingStream.getTracks().forEach(track => track.stop());
        if (!mounted.current || generation !== requestGeneration.current) return;
        recorder.current = null;
        stream.current = null;
        busy.current = false;
        setRecording(false);
        setPending(null);
        setError('Recording stopped unexpectedly. Please try again.');
      };
      recorder.current = rec;
      rec.start();
      busy.current = false;
      setPending(null);
      setRecording(true);
    } catch {
      media?.getTracks().forEach(track => track.stop());
      if (!mounted.current || generation !== requestGeneration.current) return;
      recorder.current = null;
      stream.current = null;
      busy.current = false;
      setRecording(false);
      setPending(null);
      setError('Microphone access is unavailable. Allow it in your browser settings, or use the typing practice below.');
    }
  }

  function check() {
    if (checked || !typed.trim()) return;
    setChecked(true);
    logActivity('Listen and type', 1);
  }

  function nextPhrase() {
    clearAudio();
    if (index === phrases.length - 1) onClose();
    else {
      setIndex(value => value + 1);
      setTyped('');
      setChecked(false);
      setError('');
    }
  }
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, ' ');
  return <Modal title={shadowing ? 'Shadowing Studio' : 'Find your speaking rhythm'} onClose={onClose}>
    <p className="dialog-description">{shadowing ? 'Listen closely. Make the words your own.' : 'Listen, say it aloud, and hear your progress.'}</p>
    <div className="speech-prompt tone-lavender"><p className="eyebrow">Phrase {index + 1} of {phrases.length}</p><h3>{phrases[index]}</h3><button className="pill-button" disabled={recording || !!pending} onClick={() => { playback.current?.pause(); if (!speak(phrases[index])) notify('Audio playback is unavailable in this browser'); }}><Volume2 size={18} />Listen</button></div>
    <div className="record-area"><button className={`record-button ${recording ? 'recording' : ''}`} disabled={!!pending} aria-busy={!!pending} onClick={record} aria-label={pending === 'permission' ? 'Waiting for microphone permission' : pending === 'saving' ? 'Saving recording' : recording ? 'Stop recording' : 'Start recording'}>{recording ? <Square size={27} fill="currentColor" /> : <Mic size={30} />}</button><p role="status">{pending === 'permission' ? 'Waiting for microphone permission…' : pending === 'saving' ? 'Saving your recording…' : recording ? 'Recording… tap to stop' : 'Tap to record yourself'}</p>{audioUrl && <><audio ref={element => { if (element) playback.current = element; }} controls src={audioUrl} onPlay={() => window.speechSynthesis?.cancel()} /><small className="muted">Listen back and compare with the example.</small></>}{error && <p className="inline-error" role="alert">{error}</p>}</div>
    <details className="typing-practice" open={shadowing || undefined}><summary>Or try a listening & typing exercise</summary><label className="form-field"><span>Type the phrase you hear</span><textarea value={typed} onChange={event => { setTyped(event.target.value); setChecked(false); }} rows={2} placeholder="Listen, then type it here…" /></label><button className="secondary-button" disabled={!typed.trim() || checked} onClick={check}>Check my words<Check size={17} /></button>{checked && <div className={`answer-feedback ${normalize(typed) === normalize(phrases[index]) ? 'tone-green' : 'tone-peach'}`}><strong>{normalize(typed) === normalize(phrases[index]) ? 'Every word, just right!' : 'Almost there. Compare the phrases.'}</strong><p>{phrases[index]}</p></div>}</details>
    <p className="preview-note">Recordings stay on your device. Live pronunciation scoring is not connected.</p>
    <button className="primary-button full-width" disabled={recording || !!pending} onClick={nextPhrase}>{index === phrases.length - 1 ? 'Finish practice' : 'Next phrase'}<ArrowRight size={18} /></button>
  </Modal>;
}

export function WritingDialog({ onClose }: { onClose: () => void }) {
  const { logActivity } = useNarra(); const [text, setText] = useState(''); const [checked, setChecked] = useState(false);
  const count = text.trim().split(/\s+/).filter(Boolean).length; const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  return <Modal title="A little space for your words" onClose={onClose}><p className="dialog-description">Tell us about a small habit that makes your day better. Aim for a few sentences.</p><label className="form-field"><span>Your writing</span><textarea rows={7} placeholder="One thing I look forward to every morning…" value={text} maxLength={10000} onChange={e => { setText(e.target.value); setChecked(false); }} /></label><div className="writing-meta"><span>{count} words</span><span>A little practice is enough.</span></div>{checked && <div className="writing-feedback tone-green"><h3>Your practice notes</h3><div className="writing-counts"><span><strong>{count}</strong>words written</span><span><strong>{sentences}</strong>sentences</span></div><p>{count < 30 ? 'A good beginning. Try adding one specific example and explain why this habit matters to you.' : 'You’ve made space for your ideas. Read your paragraph aloud and check that each sentence flows naturally into the next.'}</p>{text.trim() && !/[.!?]$/.test(text.trim()) && <p>Give your final sentence a full stop.</p>}<p className="preview-note">Local practice notes · AI writing assessment is not connected.</p></div>}<button className="primary-button full-width" disabled={count < 3 || checked} onClick={() => { setChecked(true); logActivity('Writing practice', Math.max(1, Math.round(count / 25))); }}>{checked ? 'Practice saved' : 'Review my writing'}{checked ? <Check size={18} /> : <Sparkles size={18} />}</button></Modal>;
}

export function ConversationDialog({ scenario, onClose }: { scenario?: Scenario; onClose: () => void }) {
  const { profile, setStats, logActivity } = useNarra(); const [started, setStarted] = useState(false); const [message, setMessage] = useState(''); const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([]); const [finished, setFinished] = useState(false);
  const initial = scenario?.type === 'Interview' ? 'Hi! It’s lovely to meet you. Could you tell me a little about yourself?' : scenario?.type === 'Debate' ? 'Let’s explore both sides. What do you think, and why?' : 'Hi! I’m glad you’re here. Tell me, what’s one small thing that made your day better?';
  const replies = ['That’s a lovely place to start. Could you tell me a little more about that?', 'Thank you for sharing. How did that make you feel?', 'I like the way you put that. What would you like to try next?'];
  function send() { if (!message.trim()) return; const response = replies[Math.min(Math.floor(messages.length / 2), replies.length - 1)]; setMessages(m => [...m, { text: message.trim(), user: true }, { text: response, user: false }]); setMessage(''); }
  function finish() { setStats(s => ({ ...s, conversations: s.conversations + 1 })); logActivity(scenario?.title ?? `Conversation with ${profile.tutor}`, Math.max(1, Math.round(messages.length / 2))); setFinished(true); }
  return <Modal title={scenario?.title ?? `Talk with ${profile.tutor}`} onClose={onClose} wide>{finished ? <div className="session-success"><span className="success-medallion"><CheckCheck size={44} /></span><h3>You showed up for your English.</h3><p>Your practice is saved. Every little conversation counts.</p><button className="primary-button full-width" onClick={onClose}>Keep exploring<ArrowRight size={18} /></button></div> : !started ? <><div className={`conversation-cover tone-${scenario?.tone ?? 'lavender'}`}>{scenario ? <Art name={scenario.asset.replace(/\.webp$/, '')} /> : <Avatar />}</div><p className="eyebrow purple">{scenario ? `${scenario.type} · ${scenario.level} · ${scenario.minutes} min` : 'Relaxed everyday conversations'}</p><h3 className="dialog-large-title">Find your voice with {profile.tutor}</h3><p className="dialog-description">{scenario?.description ?? 'Take a breath. Start with something small. Your English has a story to tell.'}</p><p className="preview-note">Conversation preview with sample replies. Live AI tutoring is not connected.</p><button className="primary-button full-width" onClick={() => { setStarted(true); setMessages([{ text: initial, user: false }]); }}>Let’s talk<ArrowRight size={18} /></button></> : <><div className="conversation-tutor"><Avatar /><span><strong>{profile.tutor}</strong><small>Conversation preview</small></span><Headphones size={21} className="purple" /></div><div className="chat-messages" aria-live="polite">{messages.map((m, i) => <div key={i} className={`chat-message ${m.user ? 'from-user' : 'from-tutor'}`}><p>{m.text}</p>{!m.user && <button aria-label="Listen to message" className="text-button" onClick={() => speak(m.text)}><Volume2 size={16} /></button>}</div>)}</div><form className="chat-input" onSubmit={e => { e.preventDefault(); send(); }}><input value={message} onChange={e => setMessage(e.target.value)} aria-label="Your reply" placeholder="Say something in English…" maxLength={1000} autoComplete="off" /><button className="icon-button" type="submit" disabled={!message.trim()} aria-label="Send reply"><Send size={20} /></button></form><button className="secondary-button full-width" onClick={finish} disabled={messages.length < 2}>Finish conversation<Check size={17} /></button></>}</Modal>;
}

export function CreateDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (s: Scenario) => void }) {
  const [topic, setTopic] = useState(''); const [type, setType] = useState<Scenario['type']>('Roleplay'); const [attachment, setAttachment] = useState('');
  return <Modal title="Make it your conversation" onClose={onClose}><p className="dialog-description">Something on your mind? Turn a topic into a little English practice.</p><form onSubmit={e => { e.preventDefault(); if (!topic.trim()) return; onCreate({ id: `custom-${Date.now()}`, title: topic.trim(), type, description: `A conversation about ${topic.trim().toLowerCase()}.`, level: 'Your level', minutes: 8, tone: 'lavender', asset: 'plant.webp' }); }}><label className="form-field"><span>What would you like to talk about?</span><textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="A job interview, your next trip, a favourite book…" rows={3} maxLength={150} required /></label><label className="form-field"><span>Conversation style</span><select value={type} onChange={e => setType(e.target.value as Scenario['type'])}>{['Roleplay', 'Interview', 'Debate', 'Discussion'].map(t => <option key={t}>{t}</option>)}</select></label><label className="file-field"><span>Add a file or photo as a reminder</span><input type="file" accept="image/*,.pdf,.txt" onChange={e => setAttachment(e.target.files?.[0]?.name ?? '')} />{attachment && <small>{attachment}</small>}</label><p className="preview-note">Your topic opens a sample conversation. File analysis and AI generation are not connected.</p><button className="primary-button full-width" type="submit" disabled={!topic.trim()}>Start my conversation<ChevronRight size={18} /></button></form></Modal>;
}
