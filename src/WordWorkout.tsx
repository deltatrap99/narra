import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Headphones, RotateCcw, Volume2 } from 'lucide-react';
import type { Word } from './data';
import BuddyCoach from './BuddyCoach';
import BuddyAvatar from './BuddyAvatar';
import './buddy-learning.css';
import { speak, useCopy, useNarra } from './state';
import './word-workout.css';

type Mode = 'Recall' | 'Listening' | 'In context';
type Attempt = { word: Word; correct: boolean; revealed: boolean };
const modes: Mode[] = ['Recall', 'Listening', 'In context'];
const modeDescriptions: Record<Mode, string> = {
  Recall: "Which English word comes to mind when you look at the meaning?",
  Listening: 'Let’s listen once, then try writing what you hear.',
  'In context': 'Read the whole sentence, then try the missing word or phrase.',
};
function modeLabel(mode: Mode, tr: (english: string, vietnamese: string) => string) {
  return mode === 'Recall' ? tr('Recall', 'Gợi nhớ') : mode === 'Listening' ? tr('Listening', 'Nghe từ') : tr('In context', 'Trong ngữ cảnh');
}
const modeDescriptionsVi: Record<Mode, string> = {
  Recall: "Mình đọc nghĩa trước nhé, bạn nhớ ra từ tiếng Anh nào không?",
  Listening: 'Cùng nghe từ này rồi thử viết lại nhé.',
  'In context': 'Mình đọc cả câu rồi thử điền từ còn thiếu nhé.',
};

export function normalizeWorkoutAnswer(value: string) {
  return value.normalize('NFC').toLocaleLowerCase('en').replace(/[‘’]/g, "'").trim()
    .replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, '').replace(/\s+/g, ' ');
}

function clozeFor(word: Word) {
  const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_’'])${escaped}(?![\\p{L}\\p{N}_’'])`, 'giu');
  const sentence = word.example.replace(pattern, '________');
  return sentence !== word.example ? sentence : `________: ${word.definition}`;
}

function buddyWorkoutTip(mode: Mode, wordCount: number, tr: (en: string, vi: string) => string) {
  if (mode === 'Listening') return tr("Replay to hear the first sound and stressed part before trying the spelling, and listen again if you need to before checking.", "Bạn nghe lại, chú ý âm đầu và phần được nhấn rồi thử viết từ nhé, mình có thể nghe thêm trước khi kiểm tra.");
  if (mode === 'In context') return tr(`Read both sides of the gap to find a meaning that fits the whole sentence, then answer with ${wordCount} word${wordCount === 1 ? '' : 's'}.`, `Bạn đọc cả hai phía chỗ trống để tìm ý nghĩa phù hợp với cả câu rồi trả lời bằng ${wordCount} từ nhé.`);
  return tr(`Picture a situation where you would use this meaning, then try recalling the English before peeking to answer with ${wordCount} word${wordCount === 1 ? '' : 's'}.`, `Bạn hình dung một tình huống dùng ý nghĩa này rồi thử nhớ lại tiếng Anh trước khi xem đáp án nhé, câu trả lời gồm ${wordCount} từ.`);
}

function wordType(word: Word) {
  const referenceTypes: Record<string, string> = {
    itinerary: 'noun', reservation: 'noun', perspective: 'noun',
    thoughtful: 'adjective', serendipity: 'noun', departure: 'noun',
  };
  return referenceTypes[word.word.toLocaleLowerCase('en')] ?? (word.word.includes(' ') ? 'phrase' : 'word');
}

function Feedback({ attempt, chain, onHear }: { attempt: Attempt; chain: number; onHear: () => void }) {
  const tr = useCopy();
  return <section className={`workout-feedback ${attempt.correct ? 'is-correct' : 'is-missed'}`} role="status">
    <h3><BuddyAvatar key={attempt.word.id} mood={attempt.revealed ? 'curious' : attempt.correct ? chain >= 3 ? 'proud' : 'celebrate' : chain >= 2 ? 'encourage' : 'curious'} size={80} /><span>{attempt.revealed ? tr('A little clue, then we can try it together!', 'Một gợi ý nhỏ, rồi mình thử cùng nhau nhé!') : attempt.correct ? chain >= 3 ? tr(`${chain} in a row, Buddy is so proud of your practice!`, `${chain} từ đúng liên tiếp, Buddy tự hào về bạn lắm nè!`) : tr("That’s it, you remembered this one!", 'Đúng rồi, bạn nhớ từ này rồi.') : chain >= 2 ? tr('These words need a little more time, and Buddy is cheering you on!', 'Những từ này cần thêm chút thời gian, Buddy đang cổ vũ bạn nè!') : tr("Let’s try another way to remember this one.", "Từ này chưa khớp, mình thử cách khác nhé.")}</span></h3>
    <strong>{attempt.word.word}</strong><p>{attempt.word.definition}</p><p className="workout-example">{attempt.word.example}</p>
    <p className="workout-saved-note">{attempt.correct ? tr('Saved to your review history.', 'Đã lưu vào lịch sử ôn tập.') : tr("Marked for another review so you can retry it after this workout.", "Đã đánh dấu để bạn có thể ôn lại sau lượt này nhé.")}</p>
    <div className="workout-feedback-buddy"><BuddyCoach compact showAvatar={false} title={tr(attempt.correct ? 'Try a sentence of your own' : 'Let’s hear it together', attempt.correct ? 'Mình thử đặt một câu nhé' : 'Mình cùng nghe lại nhé')} message={tr(attempt.correct ? "Now that you’ve got the word, how would you use it in your day?" : 'Let’s read the meaning, hear the example, and say it once together.', attempt.correct ? "Bạn nhớ từ này rồi, nếu dùng trong ngày của bạn thì câu sẽ thế nào nhỉ?" : 'Mình đọc nghĩa, nghe câu ví dụ rồi thử nói lại một lần nhé.')} tip={tr('Connect the word to something you do, know, or plan to try. A personal example gives you another way to remember it.', 'Gắn từ này với một điều bạn làm, biết hoặc muốn thử. Ví dụ của riêng bạn giúp bạn có thêm cách ghi nhớ.')} actionLabel={tr('Listen to the example', 'Nghe câu ví dụ')} onAction={onHear} mood={attempt.correct ? 'cheer' : 'focus'} /></div>
  </section>;
}

export default function WordWorkout({ onClose }: { onClose: () => void }) {
  const { words, setWords, setStats, logActivity, notify } = useNarra();
  const tr = useCopy();
  const [deck, setDeck] = useState<Word[]>(() => words.filter(word => word.due).slice(0, 10));
  const [mode, setMode] = useState<Mode>('Recall');
  const [phase, setPhase] = useState<'intro' | 'question' | 'complete'>('intro');
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [feedback, setFeedback] = useState<Attempt | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reviewed = useRef(new Set<string>());
  const finished = useRef(false);
  const round = useRef(1);
  const word = deck[index];
  const missed = attempts.filter(attempt => !attempt.correct).map(attempt => attempt.word);
  const correct = attempts.filter(attempt => attempt.correct).length;
  let reactionChain = 0;
  for (let i = attempts.length - 1; i >= 0 && attempts[i].correct === attempts.at(-1)?.correct; i--) reactionChain++;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    dialogRef.current?.show();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = oldOverflow; previous?.focus(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => {
    if (phase === 'question' && !feedback) inputRef.current?.focus({ preventScroll: true });
    contentRef.current?.scrollTo({ top: 0 });
  }, [phase, index]);
  function hear(text: string) { if (!speak(text)) notify(tr('Speech playback is unavailable in this browser.', 'Trình duyệt chưa hỗ trợ đọc mẫu.')); }
  function start() { if (deck.length) setPhase('question'); }
  function checkAnswer(revealed = false) {
    if (!word || feedback || (!revealed && !answer.trim())) return;
    const correct = !revealed && normalizeWorkoutAnswer(answer) === normalizeWorkoutAnswer(word.word);
    const attempt = { word, correct, revealed };
    setFeedback(attempt);
    setAttempts(previous => [...previous, attempt]);
    setWords(previous => previous.map(item => item.id !== word.id ? item : {
      ...item, status: correct ? item.status === 'New' ? 'Learning' : 'Mastered' : 'Learning', due: !correct,
    }));
    if (!reviewed.current.has(word.id)) {
      reviewed.current.add(word.id);
      setStats(previous => ({ ...previous, reviews: previous.reviews + 1 }));
    }
    // Save an actual answer event even when the user closes the workout early.
    logActivity(`Word review · ${word.word} · ${correct ? 'remembered' : 'needs another review'}`, 0);
  }
  function next() {
    if (!feedback) return;
    if (index + 1 < deck.length) { setIndex(value => value + 1); setAnswer(''); setFeedback(null); }
    else {
      setPhase('complete');
      if (!finished.current) {
        finished.current = true;
        logActivity(`${round.current > 1 ? 'Retry word workout' : 'Word workout'} · ${correct}/${deck.length} remembered`, 2);
      }
    }
  }
  function retry() {
    if (!missed.length) return;
    setDeck(missed); setAttempts([]); setIndex(0); setAnswer(''); setFeedback(null);
    finished.current = false; round.current += 1; setPhase('question');
  }
  function submit(event: FormEvent) { event.preventDefault(); if (feedback) next(); else checkAnswer(); }
  return <dialog ref={dialogRef} className="workout-dialog" aria-labelledby="workout-title"
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="workout-shell">
      <header className="workout-header"><button className="workout-close" onClick={onClose}>{tr('Close', 'Đóng')}</button><h1 id="workout-title">{tr('Word workout', 'Ôn từ đến hạn')}</h1><span aria-hidden="true" /></header>
      <div className="workout-content" ref={contentRef}>
        {phase === 'intro' && <section className="workout-intro">
          <h2>{tr('Let’s give these words another try.', 'Mình gặp lại những từ này nhé.')}</h2><p>{tr("Review up to 10 words at your pace, with each answer saved as we go so you can stop when you need.", "Mình ôn tối đa 10 từ, từng từ một nhé, mỗi câu trả lời đều được lưu ngay nên bạn có thể dừng khi cần.")}</p>
          <div className="workout-segments" aria-label={tr('Workout mode', 'Hình thức ôn tập')}>{modes.map(item => <button key={item} className={mode === item ? 'active' : ''} aria-pressed={mode === item} onClick={() => setMode(item)}>{modeLabel(item, tr)}</button>)}</div>
          <div className="workout-explanation"><strong>{tr(modeDescriptions[mode], modeDescriptionsVi[mode])}</strong><p>{tr(`${deck.length} eligible words · answers ignore case and outer punctuation, but spelling matters.`, `${deck.length} từ đến hạn · không phân biệt hoa/thường và dấu câu ở hai đầu, nhưng cần viết đúng chính tả.`)}</p></div>
          {deck.length > 0 && <div className="workout-intro-buddy"><BuddyCoach compact message={tr("Take a little pause and see what comes back before we peek.", 'Mình dừng một chút để nhớ lại trước khi xem đáp án nhé.')} tip={tr(mode === 'Listening' ? 'Listen once without typing, then replay and write what you hear.' : mode === 'In context' ? "Read the whole sentence and think about the meaning the missing word needs to express." : 'Read the meaning, picture a real example, and try the English word before revealing it.', mode === 'Listening' ? 'Nghe một lần mà chưa gõ, rồi nghe lại và viết điều bạn nghe được.' : mode === 'In context' ? "Bạn đọc cả câu trước rồi nghĩ về ý nghĩa mà từ còn thiếu cần diễn đạt nhé." : 'Đọc ý nghĩa, hình dung một ví dụ thật và thử nhớ từ tiếng Anh trước khi mở đáp án.')} mood="guide" /></div>}
          {deck.length ? <button className="workout-primary" onClick={start}>{tr('Start workout', 'Bắt đầu ôn')}</button> : <div className="workout-empty"><div style={{ display: 'flex', justifyContent: 'center' }}><BuddyAvatar mood="encourage" size={104} /></div><h3>{words.length ? tr('You’re all caught up', 'Bạn đã ôn hết từ đến hạn') : tr('Your next word is waiting', 'Bắt đầu với một từ mới')}</h3><p>{words.length ? tr("With no words due for review, you can keep exploring or add a new discovery.", "Chưa có từ đến hạn ôn, mình khám phá thêm hoặc lưu một từ mới nhé.") : tr('Add a word to your collection to start a workout.', 'Thêm một từ vào bộ từ vựng để bắt đầu ôn.')}</p><button className="workout-primary" onClick={onClose}>{tr('Back to Dictionary', 'Quay lại Từ vựng')}</button></div>}
        </section>}
        {phase === 'question' && word && <form className="workout-question" onSubmit={submit}>
          <div className="workout-progress-label"><span>{tr(`${index + 1} of ${deck.length}`, `${index + 1} / ${deck.length}`)}</span><span>{modeLabel(mode, tr)}</span></div>
          <div className="workout-progress" role="progressbar" aria-label={tr('Words reviewed', 'Số từ đã ôn')} aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={index + Number(!!feedback)}><span style={{ width: `${(index + Number(!!feedback)) / deck.length * 100}%` }} /></div>
          <div className="workout-prompt">{mode === 'Listening' ? <><Headphones size={30} /><h2>{tr("Let’s listen and see which word you hear.", "Mình nghe thử nhé, bạn nghe được từ gì?")}</h2><button type="button" className="workout-listen" onClick={() => hear(word.word)}><Volume2 size={20} />{tr('Play word', 'Nghe từ')}</button></> : <><h2>{mode === 'Recall' ? word.definition : clozeFor(word)}</h2><span>{mode === 'In context' ? tr('complete the sentence', 'hoàn thành câu') : tr(wordType(word), wordType(word) === 'noun' ? 'danh từ' : wordType(word) === 'adjective' ? 'tính từ' : wordType(word) === 'phrase' ? 'cụm từ' : 'từ vựng')}</span></>}</div>
          {!feedback && <div className="workout-question-buddy"><BuddyCoach compact key={mode+'-'+word.id} message={tr('One little clue, then it’s your turn.', 'Mình thử một gợi ý rồi đến lượt bạn nhé.')} tip={buddyWorkoutTip(mode, word.word.trim().split(/\s+/).length, tr)} actionLabel={tr(mode === 'Listening' ? 'Replay the word' : 'Try my answer', mode === 'Listening' ? 'Nghe lại từ' : 'Thử trả lời')} onAction={() => { if (mode === 'Listening') hear(word.word); else inputRef.current?.focus(); }} mood="focus" /></div>}
          <label className="workout-answer-label"><span className="workout-sr-only">{tr('Your English answer', 'Câu trả lời bằng tiếng Anh')}</span><input ref={inputRef} value={answer} onChange={event => setAnswer(event.target.value)} placeholder={tr('Type the English word or phrase', 'Nhập từ hoặc cụm từ tiếng Anh')} disabled={!!feedback} autoComplete="off" autoCorrect="off" spellCheck={false} aria-describedby="workout-answer-help" /></label>
          {!feedback && <button type="button" id="workout-answer-help" className="workout-show" onClick={() => checkAnswer(true)}>{tr('Show me the answer', 'Cho mình xem đáp án')}</button>}
          {feedback && <Feedback attempt={feedback} chain={reactionChain} onHear={() => hear(word.example)} />}
          <div className="workout-bottom"><button className="workout-primary" type="submit" disabled={!feedback && !answer.trim()}>{feedback ? index + 1 === deck.length ? tr('Finish workout', 'Hoàn thành lượt ôn') : tr('Next word', 'Từ tiếp theo') : tr('Check answer', 'Kiểm tra đáp án')}</button></div>
        </form>}
        {phase === 'complete' && <section className="workout-complete"><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><BuddyAvatar mood={correct === deck.length ? 'celebrate' : 'proud'} size={112} /></div><h2>{tr('That’s this round done.', 'Mình xong lượt này rồi.')}</h2><p>{tr('A little closer to making these words yours.', 'Thêm một bước để sử dụng những từ này tự tin hơn.')}</p>
          <div className="workout-score"><strong>{correct}<span> / {deck.length}</span></strong><span>{tr('words recalled', 'từ nhớ đúng')}</span></div>
          <div className="workout-complete-buddy"><BuddyCoach compact showAvatar={false} title={tr('A little progress, together', 'Mình vừa tiến thêm một chút rồi')} message={tr(`You recalled ${correct} of ${deck.length} words in this round, with every answer saved in your review history.`, `Bạn đã nhớ đúng ${correct} trên ${deck.length} từ trong lượt này, từng câu trả lời đều đã được lưu vào lịch sử ôn nhé.`)} tip={missed.length ? tr(`${missed.length} word${missed.length === 1 ? ' is' : 's are'} marked for another review, ready for you to Retry below and make a personal sentence with one of them.`, `${missed.length} từ đã được đánh dấu để ôn thêm, bạn chọn ôn lại bên dưới rồi đặt một câu của riêng mình với một từ nhé.`) : tr('Try using one of these words in your next conversation. Remembering is the first step; using it makes the next connection.', 'Thử dùng một từ vừa ôn trong cuộc trò chuyện tiếp theo. Ghi nhớ là bước đầu; sử dụng sẽ giúp bạn kết nối thêm với từ.')} mood={missed.length ? 'focus' : 'cheer'} /></div>
          {missed.length ? <><h3>{tr('Words to keep practising', 'Những từ cần luyện thêm')}</h3><div className="workout-missed-list">{missed.map(item => <div key={item.id}><strong>{item.word}</strong><span>{item.definition}</span></div>)}</div><button className="workout-primary" onClick={retry}><RotateCcw size={18} />{tr('Retry missed words', 'Ôn lại từ chưa nhớ')}</button></> : <div className="workout-all-correct"><Check size={22} /><span>{tr("Well done, you remembered every word!", "Bạn đã nhớ tất cả các từ rồi, làm tốt lắm!")}</span></div>}
          <button className={`workout-primary ${missed.length ? 'workout-secondary' : ''}`} onClick={onClose}>{tr('Done', 'Xong')}</button>
        </section>}
      </div>
    </div>
  </dialog>;
}
