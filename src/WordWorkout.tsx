import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Headphones, RotateCcw, Sparkles, Trophy, Volume2 } from 'lucide-react';
import type { Word } from './data';
import { speak, useNarra } from './state';
import './word-workout.css';

type Mode = 'Recall' | 'Listening' | 'In context';
type Attempt = { word: Word; correct: boolean; revealed: boolean };
const modes: Mode[] = ['Recall', 'Listening', 'In context'];
const modeDescriptions: Record<Mode, string> = {
  Recall: 'Read the meaning. Recall the English word or phrase without peeking.',
  Listening: 'Listen to the word. Type what you hear without peeking.',
  'In context': 'Read the sentence. Fill in the missing English word or phrase.',
};

export function normalizeWorkoutAnswer(value: string) {
  return value.normalize('NFC').toLocaleLowerCase('en').replace(/[‘’]/g, "'").trim()
    .replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, '').replace(/\s+/g, ' ');
}

function clozeFor(word: Word) {
  const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');
  return pattern.test(word.example) ? word.example.replace(pattern, '________') : `________: ${word.definition}`;
}

function wordType(word: Word) {
  const referenceTypes: Record<string, string> = {
    itinerary: 'phrase', reservation: 'phrase', perspective: 'noun',
    thoughtful: 'adjective', serendipity: 'noun', departure: 'noun',
  };
  return referenceTypes[word.word.toLocaleLowerCase('en')] ?? (word.word.includes(' ') ? 'phrase' : 'word');
}

function Feedback({ attempt, onHear }: { attempt: Attempt; onHear: () => void }) {
  return <section className={`workout-feedback ${attempt.correct ? 'is-correct' : 'is-missed'}`} role="status">
    <h3>{attempt.correct ? <Check size={20} /> : <RotateCcw size={20} />}{attempt.correct ? 'That’s right — you remembered it!' : 'Not quite — learn from this one'}</h3>
    <strong>{attempt.word.word}</strong><p>{attempt.word.definition}</p><p className="workout-example">{attempt.word.example}</p>
    <button className="workout-text-button" onClick={onHear} type="button"><Volume2 size={19} />Hear the example</button>
    <p className="workout-saved-note">{attempt.correct ? 'Saved to your review history.' : 'Marked for another review. You can retry it after this workout.'}</p>
  </section>;
}

export default function WordWorkout({ onClose }: { onClose: () => void }) {
  const { words, setWords, setStats, logActivity, notify } = useNarra();
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
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    dialogRef.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = oldOverflow; previous?.focus(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => {
    if (phase === 'question' && !feedback) inputRef.current?.focus({ preventScroll: true });
    contentRef.current?.scrollTo({ top: 0 });
  }, [phase, index]);
  function hear(text: string) { if (!speak(text)) notify('Speech playback is unavailable in this browser.'); }
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
      <header className="workout-header"><button className="workout-close" onClick={onClose}>Close</button><h1 id="workout-title">Word workout</h1><span aria-hidden="true" /></header>
      <div className="workout-content" ref={contentRef}>
        {phase === 'intro' && <section className="workout-intro">
          <h2>Remember it. Use it.</h2><p>A focused workout of up to 10 words. Each answer is saved to your review history, even if you leave early.</p>
          <div className="workout-segments" aria-label="Workout mode">{modes.map(item => <button key={item} className={mode === item ? 'active' : ''} aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>)}</div>
          <div className="workout-explanation"><strong>{modeDescriptions[mode]}</strong><p>{deck.length} eligible {deck.length === 1 ? 'word' : 'words'} · answers ignore case and outer punctuation, but spelling matters.</p></div>
          {deck.length ? <button className="workout-primary" onClick={start}>Start workout</button> : <div className="workout-empty"><Sparkles size={32} /><h3>{words.length ? 'You’re all caught up' : 'Your next word is waiting'}</h3><p>{words.length ? 'No words are due for review. Keep exploring or add a new discovery.' : 'Add a word to your collection to start a workout.'}</p><button className="workout-primary" onClick={onClose}>Back to Words</button></div>}
        </section>}
        {phase === 'question' && word && <form className="workout-question" onSubmit={submit}>
          <div className="workout-progress-label"><span>{index + 1} of {deck.length}</span><span>{mode}</span></div>
          <div className="workout-progress" role="progressbar" aria-label="Words reviewed" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={index + Number(!!feedback)}><span style={{ width: `${(index + Number(!!feedback)) / deck.length * 100}%` }} /></div>
          <div className="workout-prompt">{mode === 'Listening' ? <><Headphones size={30} /><h2>Listen. What do you hear?</h2><button type="button" className="workout-listen" onClick={() => hear(word.word)}><Volume2 size={20} />Play word</button></> : <><h2>{mode === 'Recall' ? word.definition : clozeFor(word)}</h2><span>{mode === 'In context' ? 'complete the sentence' : wordType(word)}</span></>}</div>
          <label className="workout-answer-label"><span className="workout-sr-only">Your English answer</span><input ref={inputRef} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Type the English word or phrase" disabled={!!feedback} autoComplete="off" autoCorrect="off" spellCheck={false} aria-describedby="workout-answer-help" /></label>
          {!feedback && <button type="button" id="workout-answer-help" className="workout-show" onClick={() => checkAnswer(true)}>I don’t remember — show me</button>}
          {feedback && <Feedback attempt={feedback} onHear={() => hear(word.example)} />}
          <div className="workout-bottom"><button className="workout-primary" type="submit" disabled={!feedback && !answer.trim()}>{feedback ? index + 1 === deck.length ? 'Finish workout' : 'Next word' : 'Check answer'}</button></div>
        </form>}
        {phase === 'complete' && <section className="workout-complete"><span className="workout-trophy"><Trophy size={35} /></span><h2>Workout complete</h2><p>A little closer to making these words yours.</p>
          <div className="workout-score"><strong>{correct}<span> / {deck.length}</span></strong><span>correct answers</span></div>
          {missed.length ? <><h3>Words to keep practising</h3><div className="workout-missed-list">{missed.map(item => <div key={item.id}><strong>{item.word}</strong><span>{item.definition}</span></div>)}</div><button className="workout-primary" onClick={retry}><RotateCcw size={18} />Retry missed words</button></> : <div className="workout-all-correct"><Check size={22} /><span>You remembered every word. Well done!</span></div>}
          <button className={`workout-primary ${missed.length ? 'workout-secondary' : ''}`} onClick={onClose}>Done</button>
        </section>}
      </div>
    </div>
  </dialog>;
}
