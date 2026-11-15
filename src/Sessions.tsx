import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCheck, ChevronRight, CircleCheck, Headphones, Mic, Play, RotateCcw, Send, Sparkles, Square, Volume2 } from 'lucide-react';
import { type Lesson, type Scenario, tutors } from './data';
import { speak, useCopy, useNarra } from './state';
import { Art, Avatar, Empty, Modal } from './ui';

export function GoalDialog({ onClose }: { onClose: () => void }) {
  const { profile, setProfile, notify } = useNarra(); const tr = useCopy(); const [goal, setGoal] = useState(profile.dailyGoal);
  const goals = [{ minutes: 5, name: tr('A little every day', 'Một chút mỗi ngày'), label: tr('Build a gentle habit', 'Bắt đầu thói quen nhẹ nhàng') }, { minutes: 10, name: tr('Find your rhythm', 'Tìm nhịp học phù hợp'), label: tr('Make steady progress', 'Tiến bộ đều đặn') }, { minutes: 15, name: tr('Go a little further', 'Tiến thêm một chút'), label: tr('Grow your confidence', 'Tự tin hơn mỗi ngày') }, { minutes: 20, name: tr('Make it your moment', 'Dành thời gian cho bạn'), label: tr('More time for your English', 'Thêm thời gian luyện tiếng Anh') }];
  return <Modal title={tr('Make a little time for you', 'Dành một chút thời gian cho bạn')} onClose={onClose}><p className="dialog-description">{tr('How much time feels right today? A few easy minutes are a lovely place to start.', 'Mỗi ngày bạn muốn dành cho tiếng Anh bao lâu nè? Vài phút vừa sức là mình bắt đầu được rồi.')}</p><div className="goal-options">{goals.map(option => <button className={`goal-option ${goal === option.minutes ? 'selected' : ''}`} onClick={() => setGoal(option.minutes)} key={option.minutes} aria-pressed={goal === option.minutes}><span className="goal-option-minutes">{option.minutes}<small>{tr('min', 'phút')}</small></span><span><strong>{option.name}</strong><small>{option.label}</small></span>{goal === option.minutes && <CircleCheck size={22} />}</button>)}</div><button className="primary-button full-width" onClick={() => { setProfile(profile => ({ ...profile, dailyGoal: goal })); notify(tr(`Your daily goal is now ${goal} minutes`, `Đã đặt mục tiêu ${goal} phút mỗi ngày`)); onClose(); }}>{tr('Set my goal', 'Lưu mục tiêu')}<Check size={18} /></button></Modal>;
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
  const { words, setWords, setStats, logActivity, notify } = useNarra(); const tr = useCopy(); const [index, setIndex] = useState(0); const [revealed, setRevealed] = useState(false); const [count, setCount] = useState(0);
  const [deck] = useState(() => words.filter(w => collection === 'due' ? w.due : collection ? w.collection === collection : true));
  const word = deck[index];
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function rate(mastered: boolean) { setWords(ws => ws.map(w => w.id === word.id ? { ...w, status: mastered ? 'Mastered' : 'Learning', due: !mastered } : w)); setStats(s => ({ ...s, reviews: s.reviews + 1 })); logActivity('Word review · ' + word.word, 0); setCount(c => c + 1); setIndex(i => i + 1); setRevealed(false); if (index === deck.length - 1) logActivity('Flashcard review', 2); }
  const title = collection && collection !== 'due' ? tr(collection, ({ 'Everyday essentials': 'Từ vựng hằng ngày', 'Travel smart': 'Du lịch tự tin', 'Work & career': 'Công việc & sự nghiệp' } as Record<string, string>)[collection] ?? collection) : tr('Flashcards', 'Thẻ ghi nhớ');
  return <Modal title={title} onClose={onClose}>{deck.length === 0 ? <Empty title={tr('No words in this deck yet', 'Chưa có từ trong bộ thẻ')}>{tr('Add a few words in Dictionary and come back for a little practice.', 'Thêm vài từ trong Từ vựng rồi quay lại luyện với thẻ nhé.')}</Empty> : word ? <><div className="session-progress"><span>{tr(`${index + 1} of ${deck.length} words`, `Từ ${index + 1} / ${deck.length}`)}</span><div className="progress-track"><span style={{ width: `${index / deck.length * 100}%` }} /></div></div><button className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(!revealed)} aria-label={revealed ? tr('Show word', 'Xem từ') : tr('Reveal meaning', 'Xem ý nghĩa')}><span className="eyebrow">{revealed ? tr('The meaning', 'Ý nghĩa') : tr('Do you remember?', 'Bạn còn nhớ không?')}</span><h3>{revealed ? word.definition : word.word}</h3>{revealed ? <p>“{word.example}”</p> : <p>{tr('Tap to reveal the meaning', 'Chạm để xem ý nghĩa')}<RotateCcw size={16} /></p>}</button><button className="text-button listen-word" onClick={() => { if (!speak(word.word)) notify(tr('Audio playback is unavailable in this browser.', 'Trình duyệt chưa hỗ trợ đọc mẫu.')); }}><Volume2 size={18} />{tr('Listen to the word', 'Nghe từ')}</button>{revealed ? <div className="form-actions"><button className="secondary-button" onClick={() => rate(false)}>{tr('Keep practising', 'Cần luyện thêm')}</button><button className="primary-button" onClick={() => rate(true)}>{tr('Got it', 'Đã nhớ')}<Check size={17} /></button></div> : <button className="primary-button full-width" onClick={() => setRevealed(true)}>{tr('Reveal meaning', 'Xem ý nghĩa')}</button>}</> : <div className="session-success"><span className="success-medallion"><Sparkles size={44} /></span><h3>{tr('A little more in your vocabulary', 'Thêm một chút vào vốn từ của bạn')}</h3><p>{tr(`You reviewed ${count} words. Nicely done!`, `Bạn đã ôn ${count} từ. Làm tốt lắm!`)}</p><button className="primary-button full-width" onClick={onClose}>{tr('Finish review', 'Hoàn thành ôn tập')}<Check size={18} /></button></div>}</Modal>;
}

export function SpeakingDialog({ shadowing = false, onClose }: { shadowing?: boolean; onClose: () => void }) {
  const { setStats, logActivity, notify } = useNarra(); const tr = useCopy();
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
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError(tr('Recording is not available in this browser. You can still listen and practise aloud.', 'Trình duyệt chưa hỗ trợ ghi âm. Bạn vẫn có thể nghe mẫu và đọc thành tiếng.')); return; }
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
        if (!blob.size) { setError(tr('No audio was captured. Try another recording.', 'Chưa nghe được bạn rồi. Mình thử ghi âm lại nhé?')); return; }
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
        setError(tr('Recording stopped unexpectedly. Please try again.', 'Bản ghi vừa bị ngắt. Bạn thử thêm một lần nữa nhé.'));
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
      setError(tr('Microphone access is unavailable. Allow it in your browser settings. You can still listen and practise aloud.', 'Chưa truy cập được mic. Hãy cho phép trong cài đặt trình duyệt. Bạn vẫn có thể nghe mẫu và đọc thành tiếng.'));
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
  return <Modal title={shadowing ? tr('Shadowing Studio', 'Nghe và nhắc lại') : tr('Find your speaking rhythm', 'Luyện phát âm theo nhịp của bạn')} onClose={onClose}>
    <p className="dialog-description">{shadowing ? tr('Listen once, then say it your way. We can take it slowly.', 'Mình nghe một lần rồi thử nói theo nhé. Cứ chậm rãi thôi.') : tr('Have a listen, give it a go, then hear yourself back.', 'Nghe mẫu trước, thử cất tiếng rồi cùng nghe lại nào.')}</p>
    <div className="speech-prompt tone-lavender"><p className="eyebrow">{tr(`Phrase ${index + 1} of ${phrases.length}`, `Câu ${index + 1} / ${phrases.length}`)}</p><h3>{phrases[index]}</h3><button className="pill-button" disabled={recording || !!pending} onClick={() => { playback.current?.pause(); if (!speak(phrases[index])) notify(tr('Audio playback is unavailable in this browser', 'Trình duyệt chưa hỗ trợ đọc mẫu')); }}><Volume2 size={18} />{tr('Listen', 'Nghe mẫu')}</button></div>
    <div className="record-area"><button className={`record-button ${recording ? 'recording' : ''}`} disabled={!!pending} aria-busy={!!pending} onClick={record} aria-label={pending === 'permission' ? tr('Waiting for microphone permission', 'Đang chờ quyền dùng mic') : pending === 'saving' ? tr('Saving recording', 'Đang lưu bản ghi') : recording ? tr('Stop recording', 'Dừng ghi âm') : tr('Start recording', 'Bắt đầu ghi âm')}>{recording ? <Square size={27} fill="currentColor" /> : <Mic size={30} />}</button><p role="status">{pending === 'permission' ? tr('Waiting for microphone permission…', 'Đang chờ quyền truy cập mic…') : pending === 'saving' ? tr('Saving your recording…', 'Đang lưu bản ghi…') : recording ? tr('Recording… tap to stop', 'Đang ghi âm… bấm để dừng') : tr('Tap to record yourself', 'Bấm mic để tự ghi âm')}</p>{audioUrl && <><audio ref={element => { if (element) playback.current = element; }} controls src={audioUrl} onPlay={() => window.speechSynthesis?.cancel()} /><small className="muted">{tr('Listen back and compare with the example.', 'Nghe lại và so sánh với câu mẫu.')}</small></>}{error && <p className="inline-error" role="alert">{error}</p>}</div>
    {shadowing && <details className="typing-practice"><summary>{tr('Or try a listening & typing exercise', 'Hoặc luyện nghe và nhập lại câu')}</summary><label className="form-field"><span>{tr('Type the phrase you hear', 'Nhập câu tiếng Anh bạn nghe được')}</span><textarea value={typed} onChange={event => { setTyped(event.target.value); setChecked(false); }} rows={2} placeholder={tr('Listen, then type it here…', 'Nghe mẫu rồi nhập câu tại đây…')} /></label><button className="secondary-button" disabled={!typed.trim() || checked} onClick={check}>{tr('Check my words', 'Kiểm tra câu')}<Check size={17} /></button>{checked && <div className={`answer-feedback ${normalize(typed) === normalize(phrases[index]) ? 'tone-green' : 'tone-peach'}`}><strong>{normalize(typed) === normalize(phrases[index]) ? tr('Every word, just right!', 'Đúng hết rồi nè! Bạn thử đọc câu này thành tiếng nhé.') : tr('Almost there. Compare the phrases.', 'Gần đúng rồi đó. Mình nhìn lại câu mẫu rồi thử thêm nhé.')}</strong><p>{phrases[index]}</p></div>}</details>}
    <p className="preview-note">{tr('Recordings stay on your device. No pronunciation score is estimated.', 'Bản ghi ở trên thiết bị của bạn. Ứng dụng không tự ước lượng điểm phát âm.')}</p>
    <button className="primary-button full-width" disabled={recording || !!pending} onClick={nextPhrase}>{index === phrases.length - 1 ? tr('Finish practice', 'Hoàn thành luyện tập') : tr('Next phrase', 'Câu tiếp theo')}<ArrowRight size={18} /></button>
  </Modal>;
}

export function WritingDialog({ onClose }: { onClose: () => void }) {
  const { logActivity } = useNarra(); const tr = useCopy(); const [text, setText] = useState(''); const [checked, setChecked] = useState(false); const lastSaved = useRef('');
  const count = text.trim().split(/\s+/).filter(Boolean).length; const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  function review() { if (count < 30 || checked) return; setChecked(true); if (lastSaved.current !== text.trim()) { lastSaved.current = text.trim(); logActivity('Writing practice', Math.max(1, Math.round(count / 25))); } }
  return <Modal title={tr('Writing Check', 'Kiểm tra bài viết')} onClose={onClose}>
    <p className="dialog-description">{tr('Tell me about a little habit that makes your day better. Aim for 30 words or more, and try a word or two you’ve saved.', 'Kể mình nghe một thói quen nhỏ khiến ngày của bạn vui hơn nhé. Viết từ 30 từ trở lên và thử dùng vài từ bạn đã lưu nha.')}</p>
    <label className="form-field"><span>{tr('Your writing', 'Bài viết của bạn')}</span><textarea rows={7} placeholder="One thing I look forward to every morning…" value={text} maxLength={10000} onChange={event => { setText(event.target.value); setChecked(false); }} aria-describedby="writing-threshold" /></label>
    <div className="writing-meta"><span>{tr(`${count} words`, `${count} từ`)}</span><span id="writing-threshold" role="status">{count < 30 ? tr(`Add ${30 - count} more words to review.`, `Viết thêm ${30 - count} từ để xem ghi chú.`) : tr('Ready for a local writing review.', 'Đã đủ độ dài để xem ghi chú.')}</span></div>
    {checked && <div className="writing-feedback tone-green"><h3>{tr('Your practice notes', 'Ghi chú cho bài viết')}</h3><div className="writing-counts"><span><strong>{count}</strong>{tr('words written', 'từ đã viết')}</span><span><strong>{sentences}</strong>{tr('sentences', 'câu')}</span></div><p>{tr('Read your paragraph aloud. Check that each sentence adds one clear idea, and include a specific example to explain why this habit matters to you.', 'Bạn thử đọc đoạn này thành tiếng nhé. Mỗi câu một ý thôi, rồi thêm một ví dụ để mình hình dung rõ hơn thói quen của bạn.')}</p>{!/[.!?]$/.test(text.trim()) && <p>{tr('Give your final sentence a full stop.', 'Câu cuối còn thiếu dấu chấm nè. Thêm một chút là gọn rồi.')}</p>}<p>{tr('You can edit the paragraph and review it again.', 'Bạn cứ sửa theo cách mình thích rồi cùng xem lại nhé.')}</p><p className="preview-note">{tr('Local practice notes only. No AI assessment, language level, or writing score is generated.', 'Đây là ghi chú luyện tập trên thiết bị. Ứng dụng không tạo điểm viết, xếp trình độ hay đánh giá bằng AI.')}</p></div>}
    <button className="primary-button full-width" disabled={count < 30 || checked} onClick={review}>{checked ? tr('Practice saved — edit to review again', 'Đã lưu — chỉnh sửa để xem lại') : tr('Review my writing', 'Xem ghi chú bài viết')}{checked ? <Check size={18} /> : <Sparkles size={18} />}</button>
  </Modal>;
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
