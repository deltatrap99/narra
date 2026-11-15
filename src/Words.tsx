import { useState, type FormEvent } from 'react';
import { ChevronRight, Ellipsis, Layers3, Mic, Trash2, Volume2 } from 'lucide-react';
import { initialWords, type Word, type WordStatus } from './data';
import { speak, useNarra } from './state';
import { Art, Empty, Modal } from './ui';

const collections = [
  { name: 'Everyday essentials', art: 'house' },
  { name: 'Travel smart', art: 'plane' },
  { name: 'Work & career', art: 'briefcase' },
];

const careerWords: Word[] = [
  { id: 'career-feedback', word: 'feedback', definition: 'comments that help someone improve', example: 'Thank you for the helpful feedback.', status: 'New', collection: 'Work & career', due: true },
  { id: 'career-collaborate', word: 'collaborate', definition: 'to work together', example: 'We collaborate on new ideas.', status: 'New', collection: 'Work & career', due: true },
  { id: 'career-deadline', word: 'deadline', definition: 'the latest time by which something must be done', example: 'The deadline for this project is Friday.', status: 'New', collection: 'Work & career', due: true },
];

function Status({ value }: { value: WordStatus }) {
  return <span className={`word-status status-${value.toLowerCase()}`}>{value}</span>;
}

export default function Words({ onReview, onPronunciation }: { onReview: (collection?: string) => void; onPronunciation: () => void }) {
  const { words, setWords, stats, notify } = useNarra();
  const [filter, setFilter] = useState('All');
  const [dueOnly, setDueOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [options, setOptions] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const selectedWord = words.find(word => word.id === selectedId);
  const filteredWords = words.filter(word => (filter === 'All' || word.status === filter) && (!dueOnly || word.due));

  function addCollection(name: string) {
    const source = name === 'Work & career' ? careerWords : initialWords.filter(word => word.collection === name);
    setWords(current => [...current, ...source.filter(word => !current.some(saved => saved.word.toLowerCase() === word.word.toLowerCase()))]);
    notify(`${name} added to your words.`);
  }

  function closeOptions() { setOptions(null); setConfirmRemove(false); }

  return <div className="words-page">
    <section className="word-overview"><h1>Words</h1><div className="word-metrics"><div><strong>{words.length}</strong><span>words</span></div><div><strong>{words.filter(w => w.status === 'Learning').length}</strong><span>learning</span></div><div><strong>{words.filter(w => w.status === 'Mastered').length}</strong><span>mastered</span></div></div><h2>{words.filter(w => w.due).length} words ready for review</h2><p>Recall + listen + use in a sentence. A little practice makes each new word your own.</p></section>
    <div className="review-actions">
      <p>{stats.reviews} word {stats.reviews === 1 ? 'review' : 'reviews'} recorded</p>
      <button className="primary-button" onClick={() => onReview('due')}>Start due-word workout</button>
      <hr />
      <button className="primary-button" onClick={() => onReview()}><Layers3 size={25} />Review flashcards</button>
      <button className="secondary-button" onClick={onPronunciation}><Mic size={25} />Practise pronunciation</button>
    </div>

    <h2 className="section-label">Collections</h2>
    <div className="card collections-card">
      {collections.map(collection => {
        const count = words.filter(word => word.collection === collection.name).length;
        return <div className="collection-row" key={collection.name}>
          <Art name={collection.art} className="collection-art" />
          <div className="collection-text"><h3>{collection.name}</h3><p className="muted">{count || 3} words</p></div>
          {count > 0 ? <>
            <button className="pill-button" onClick={() => onReview(collection.name)}>Review</button>
            <button className="icon-button" aria-label={`Options for ${collection.name}`} onClick={() => setOptions(collection.name)}><Ellipsis size={23} /></button>
          </> : <button className="primary-button collection-add" onClick={() => addCollection(collection.name)}>Add</button>}
        </div>;
      })}
    </div>

    <h2 className="section-label">My words</h2>
    <div className="card words-card">
      <div className="segmented" aria-label="Filter words by learning status">
        {['All', 'New', 'Learning', 'Mastered'].map(status => <button key={status} className={`segment ${filter === status ? 'active' : ''}`} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status}</button>)}
      </div>
      <div className="toggle-row"><span>Due for review only</span><button type="button" role="switch" aria-checked={dueOnly} aria-label="Due for review only" className={`switch ${dueOnly ? 'on' : ''}`} onClick={() => setDueOnly(value => !value)}><span /></button></div>
      {filteredWords.length > 0 ? filteredWords.map(word => <button className="word-row" key={word.id} onClick={() => setSelectedId(word.id)}>
        <span className="word-copy"><strong>{word.word}</strong><span className="muted">{word.definition}</span></span>
        <Status value={word.status} /><ChevronRight size={21} aria-hidden="true" />
      </button>) : <Empty title={dueOnly ? 'You’re all caught up' : `No ${filter === 'All' ? 'saved' : filter.toLowerCase()} words yet`}>
        {dueOnly ? 'Your next review will be ready soon. Turn off the filter to see all your words.' : 'Add a word with the + button, or explore another learning status.'}
      </Empty>}
    </div>

    {selectedWord && <WordDetails word={selectedWord} onClose={() => setSelectedId(null)} />}
    {options && <Modal title={options} onClose={closeOptions}>
      {confirmRemove ? <>
        <p>Remove the saved words in this collection? You can add the collection again later.</p>
        <div className="form-actions"><button className="pill-button" onClick={() => setConfirmRemove(false)}>Keep collection</button><button className="primary-button danger-button" onClick={() => { setWords(current => current.filter(word => word.collection !== options)); notify(`${options} removed.`); closeOptions(); }}>Remove collection</button></div>
      </> : <>
        <p className="muted">{words.filter(word => word.collection === options).length} words in your collection.</p>
        <div className="form-actions"><button className="primary-button" onClick={() => { onReview(options); closeOptions(); }}><Layers3 size={20} />Review collection</button><button className="text-button danger-text" onClick={() => setConfirmRemove(true)}><Trash2 size={18} />Remove collection</button></div>
      </>}
    </Modal>}
  </div>;
}

function WordDetails({ word, onClose }: { word: Word; onClose: () => void }) {
  const { setWords, notify } = useNarra();
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <Modal title="Your word" onClose={onClose}>
    <div className="detail-word"><h3>{word.word}</h3><button className="icon-button" aria-label={`Listen to ${word.word}`} onClick={() => { if (!speak(word.word)) notify('Speech playback is not supported in this browser.'); }}><Volume2 size={25} /></button></div>
    <p>{word.definition}</p>
    {word.example && <blockquote className="example">“{word.example}”</blockquote>}
    <p className="muted">Collection · {word.collection}</p>
    <label className="form-field">Learning status<select value={word.status} onChange={event => { const status = event.currentTarget.value as WordStatus; setWords(current => current.map(saved => saved.id === word.id ? { ...saved, status, due: status !== 'Mastered' } : saved)); notify(`Marked as ${status.toLowerCase()}.`); }}><option>New</option><option>Learning</option><option>Mastered</option></select></label>
    <div className="form-actions"><button className="primary-button" onClick={onClose}>Done</button>{confirmDelete ? <><p className="muted">Delete this word from your saved list?</p><button className="text-button danger-text" onClick={() => { setWords(current => current.filter(saved => saved.id !== word.id)); notify('Word deleted.'); onClose(); }}><Trash2 size={18} />Yes, delete word</button><button className="text-button" onClick={() => setConfirmDelete(false)}>Keep word</button></> : <button className="text-button danger-text" onClick={() => setConfirmDelete(true)}><Trash2 size={18} />Delete word</button>}</div>
  </Modal>;
}

export function AddWordDialog({ onClose }: { onClose: () => void }) {
  const { words, setWords, notify } = useNarra();
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [collection, setCollection] = useState('My words');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanWord = word.trim(); const cleanDefinition = definition.trim();
    if (!cleanWord || !cleanDefinition) { setError('Add a word and its meaning to continue.'); return; }
    if (words.some(saved => saved.word.toLowerCase() === cleanWord.toLowerCase())) { setError('This word is already in your saved words.'); return; }
    setWords(current => [...current, { id: `custom-${crypto.randomUUID()}`, word: cleanWord, definition: cleanDefinition, example: example.trim(), status: 'New', collection, due: true }]);
    notify(`“${cleanWord}” added to your words.`); onClose();
  }

  return <Modal title="Add a word" onClose={onClose}>
    <p className="muted">Keep a new discovery close. Make it part of your English.</p>
    <form onSubmit={submit}>
      <label className="form-field">Word or phrase<input value={word} onChange={event => { setWord(event.target.value); setError(''); }} placeholder="e.g. serendipity" required maxLength={80} autoComplete="off" /></label>
      <label className="form-field">Meaning<textarea value={definition} onChange={event => { setDefinition(event.target.value); setError(''); }} placeholder="What does it mean?" required maxLength={300} rows={3} /></label>
      <label className="form-field">Example sentence <span className="muted">(optional)</span><textarea value={example} onChange={event => setExample(event.target.value)} placeholder="Use it in a sentence…" maxLength={500} rows={2} /></label>
      <label className="form-field">Collection<select value={collection} onChange={event => setCollection(event.target.value)}><option>My words</option>{collections.map(item => <option key={item.name}>{item.name}</option>)}</select></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="form-actions"><button type="submit" className="primary-button">Add word</button><button type="button" className="text-button" onClick={onClose}>Cancel</button></div>
    </form>
  </Modal>;
}
