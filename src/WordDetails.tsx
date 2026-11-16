import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, BookOpen, Check, Headphones, Languages, LoaderCircle, Search, Square, Trash2, Volume2 } from 'lucide-react';
import type { Word, WordStatus } from './data';
import { getLexiconEntry, lookupDictionary, normalizeWord, type DictionaryLookup } from './lexicon';
import { cancelSpeech, speak, useSpeechPlayback, type SpeechLocale } from './speech';
import { useCopy, useNarra } from './state';
import { Modal } from './ui';
import BuddyAvatar from './BuddyAvatar';
import './word-details.css';

const speechParts: Record<string, [string, string]> = { noun: ['noun', 'danh từ'], verb: ['verb', 'động từ'], adjective: ['adjective', 'tính từ'], adverb: ['adverb', 'trạng từ'], idiom: ['idiom', 'thành ngữ'], 'phrasal verb': ['phrasal verb', 'cụm động từ'], interjection: ['interjection', 'thán từ'], preposition: ['preposition', 'giới từ'] };

export default function WordDetails({ word, onClose }: { word: Word; onClose: () => void }) {
  const { words, setWords, profile, notify } = useNarra();
  const tr = useCopy();
  const entry = getLexiconEntry(word.word);
  const saved = words.find(item => item.id === word.id) ?? words.find(item => normalizeWord(item.word) === normalizeWord(word.word));
  const [tab, setTab] = useState<'everyday' | 'ielts'>('everyday');
  const [translation, setTranslation] = useState(profile.uiLanguage === 'Tiếng Việt');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lookup, setLookup] = useState<DictionaryLookup | null>(null);
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'ready' | 'not-found' | 'error'>('idle');
  const request = useRef<AbortController | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const detailId = useId();
  const owner = `word-details-${word.id}`;
  const playback = useSpeechPlayback();
  const playing = playback.owner === owner && (playback.status === 'queued' || playback.status === 'speaking' || playback.status === 'paused');
  const example = entry ? entry[tab] : word.example ? { text: word.example, vi: '' } : null;

  useEffect(() => () => { request.current?.abort(); cancelSpeech(owner); }, [owner]);

  function listen(text: string, locale: SpeechLocale = 'en-US') {
    if (playing && playback.text === text && playback.locale === locale) { cancelSpeech(owner); return; }
    if (!speak(text, locale, owner)) notify(tr("While audio isn’t available in this browser, you can still follow the IPA below.", "Trình duyệt chưa phát được mẫu, bạn vẫn có thể theo dõi phiên âm bên dưới nhé."));
  }
  async function findDetails() {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setLookupState('loading');
    try {
      const result = await lookupDictionary(word.word, controller.signal);
      if (!controller.signal.aborted) { setLookup(result); setLookupState('ready'); }
    } catch (error) {
      if (!controller.signal.aborted) setLookupState(error instanceof Error && error.message === 'not-found' ? 'not-found' : 'error');
    }
  }
  function selectTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 1;
    else return;
    event.preventDefault(); setTab(next === 0 ? 'everyday' : 'ielts'); tabs.current[next]?.focus();
  }
  function saveWord() {
    setWords(current => current.some(item => normalizeWord(item.word) === normalizeWord(word.word)) ? current : [...current, { ...word, status: 'New', due: true }]);
    notify(tr("Saved, let’s try this word in a conversation later!", "Lưu rồi nè, lát nữa mình thử dùng từ này trong cuộc trò chuyện nhé."));
  }
  const posLabel = (part: string) => speechParts[part] ? tr(...speechParts[part]) : part;
  const statusLabel = (status: WordStatus) => status === 'New' ? tr('New', 'Mới') : status === 'Learning' ? tr('Learning', 'Đang học') : tr('Mastered', 'Đã nắm');

  return <Modal wide title={tr('A closer look at your word', 'Mình khám phá từ này nhé')} onClose={onClose}>
    <article className="word-details">
      <header className="wd-heading">
        <div><div className="wd-overline"><BookOpen size={15} />{tr('Your word, in context', 'Từ của bạn, trong ngữ cảnh')}</div><h3 lang="en">{word.word}</h3><div className="wd-badges">{entry && <span className="wd-pos">{posLabel(entry.partOfSpeech)}</span>}{entry?.grammar && <span>{tr(entry.grammar, entry.grammarVi ?? entry.grammar)}</span>}{saved && <span className="wd-saved"><Check size={13} />{tr('Saved', 'Đã lưu')}</span>}</div></div>
        <button type="button" className={`wd-word-audio ${playing && playback.text === word.word ? 'is-playing' : ''}`} aria-label={playing && playback.text === word.word ? tr('Stop pronunciation', 'Dừng đọc từ') : tr(`Listen to ${word.word}`, `Nghe từ ${word.word}`)} onClick={() => listen(word.word)}>{playing && playback.text === word.word ? <Square size={23} /> : <Volume2 size={25} />}</button>
      </header>

      <aside className="buddy-word-note"><BuddyAvatar mood={playing ? 'listening' : lookupState === 'loading' ? 'thinking' : lookupState === 'error' || lookupState === 'not-found' ? 'oops' : 'curious'} size={44} motion={!playing && lookupState !== 'loading'} /><p>{playing ? tr("Listen for the rhythm, then give the word a try, one little phrase at a time.", "Bạn nghe nhịp của từ cùng Narry trước, rồi thử đọc lại từng cụm ngắn nhé.") : lookupState === 'error' || lookupState === 'not-found' ? tr("Your saved notes are still here, so we can try the dictionary again in a little while.", "Narry chưa tra được từ này, ghi chú bạn lưu vẫn ở đây. Mình thử lại sau một chút nhé.") : tr("Hear it once, then try it in your own sentence to make this word yours.", "Narry có câu mẫu nè, bạn nghe một lần rồi thử đặt câu của riêng mình nhé.")}</p></aside>

      {entry && <section className="wd-pronunciation" aria-label={tr('Pronunciation and stress', 'Phiên âm và trọng âm')}>
        <div className="wd-pronunciation-lines">{([{ key: 'uk', label: 'UK', locale: 'en-GB' }, { key: 'us', label: 'US', locale: 'en-US' }] as const).map(accent => entry[accent.key] && <button type="button" key={accent.key} onClick={() => listen(word.word, accent.locale)} aria-label={tr(`Listen in ${accent.label} English`, `Nghe giọng ${accent.label}`)}><span>{accent.label}</span><span className="wd-ipa" lang="en">/{entry[accent.key]}/</span><Volume2 size={17} /></button>)}</div>
        <div className="wd-stress"><span>{entry.phraseStress ? tr('Try this emphasis', 'Thử nhấn giọng ở đây') : entry.syllables.length === 1 ? tr('One syllable', 'Một âm tiết') : tr('Word stress', 'Trọng âm')}<span className="wd-stress-help">{entry.phraseStress ? tr('Emphasis can change with your sentence.', 'Cách nhấn có thể thay đổi theo câu.') : entry.syllables.length > 1 ? tr('Give the bold part a little more weight.', 'Nhấn rõ hơn một chút ở phần in đậm nhé.') : ''}</span></span><div lang="en" aria-label={entry.phraseStress ? tr(`Emphasis on ${entry.syllables.filter((_, i) => entry.stress.includes(i)).join(' ')}`, `Nhấn vào ${entry.syllables.filter((_, i) => entry.stress.includes(i)).join(' ')}`) : tr(`Stress on syllable ${entry.stress.map(index => index + 1).join(', ')}`, `Trọng âm ở âm tiết ${entry.stress.map(index => index + 1).join(', ')}`)}>{entry.syllables.map((syllable, index) => <span key={`${index}-${syllable}`}>{index > 0 && <span className="wd-syllable-divider" aria-hidden="true">{entry.phraseStress ? ' ' : '·'}</span>}{entry.stress.includes(index) ? <strong>{syllable}</strong> : <span>{syllable}</span>}</span>)}</div></div>
      </section>}

      <section className="wd-meaning"><h4>{tr('Meaning', 'Ý nghĩa')}</h4><p lang="en">{word.definition}</p>{entry && !word.id.startsWith('custom-') && (profile.uiLanguage === 'Tiếng Việt' || translation) && <p className="wd-translation" lang="vi">{entry.meaningVi}</p>}{entry && word.id.startsWith('custom-') && <p className="wd-sense-note">{tr('The examples below explore this sense:', 'Các ví dụ dưới đây dùng nghĩa:')} <span lang="en">{entry.meaning}</span></p>}</section>

      {entry && <>
        <section className="wd-examples" aria-label={tr('Examples', 'Ví dụ')}>
          <div className="wd-example-tabs" role="tablist" aria-label={tr('Example style', 'Chọn kiểu ví dụ')}>{(['everyday', 'ielts'] as const).map((item, index) => <button type="button" role="tab" id={`${detailId}-${item}-tab`} aria-controls={`${detailId}-example-panel`} aria-selected={tab === item} tabIndex={tab === item ? 0 : -1} ref={node => { tabs.current[index] = node; }} onKeyDown={event => selectTab(event, index)} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item === 'everyday' ? tr('Everyday', 'Hằng ngày') : tr('IELTS practice', 'Luyện IELTS')}</button>)}</div>
          <div className={`wd-example-panel ${tab === 'ielts' ? 'wd-ielts-panel' : ''}`} id={`${detailId}-example-panel`} role="tabpanel" aria-labelledby={`${detailId}-${tab}-tab`} tabIndex={0}>
            <span className="wd-example-label">{tab === 'everyday' ? tr('Something you could say today', 'Một câu mình có thể nói hôm nay') : tr('A more developed idea', 'Mình phát triển ý thêm một chút')}</span>
            <blockquote lang="en">{example?.text}</blockquote>{translation && example?.vi && <p className="wd-example-translation" lang="vi">{example.vi}</p>}
            <div className="wd-example-actions"><button type="button" onClick={() => example && listen(example.text)}><Headphones size={17} />{playing && playback.text === example?.text ? tr('Stop example', 'Dừng câu mẫu') : tr('Listen to example', 'Nghe câu mẫu')}</button><button type="button" aria-pressed={translation} onClick={() => setTranslation(value => !value)}><Languages size={17} />{translation ? tr('Hide translation', 'Ẩn bản dịch') : tr('Vietnamese meaning', 'Xem bản dịch')}</button></div>
            {tab === 'ielts' && <p className="wd-original-note">{tr('Written by Narra for practice. This is not an official IELTS question or model answer.', 'Ví dụ do Narra biên soạn để luyện tập, không phải đề hay đáp án mẫu chính thức của IELTS.')}</p>}
          </div>
        </section>
        <section className="wd-usage"><span className="wd-section-icon"><BookOpen size={18} /></span><div><h4>{tr('A little help using it', 'Dùng từ tự nhiên hơn một chút')}</h4><p>{tr(entry.use, entry.useVi)}</p><div className="wd-collocations" lang="en">{entry.collocations.map(item => <span key={item}>{item}</span>)}</div></div></section>
        <section className="wd-relations" aria-label={tr('Related words in this meaning', 'Từ liên quan trong nghĩa này')}><div><h4>{tr('Similar meaning', 'Gần nghĩa')}</h4><div className="wd-word-chips" lang="en">{entry.synonyms.map(item => <span key={item}>{item}</span>)}</div></div><div><h4>{tr('Opposite meaning', 'Trái nghĩa')}</h4>{entry.antonyms.length > 0 ? <div className="wd-word-chips wd-opposites" lang="en">{entry.antonyms.map(item => <span key={item}>{item}</span>)}</div> : <p className="wd-no-opposite">{tr('No direct opposite for this meaning.', 'Nghĩa này không có từ trái nghĩa trực tiếp.')}</p>}</div><p className="wd-relations-note">{tr('These words are close in this context; their grammar and use can differ.', 'Các từ gần nghĩa trong ngữ cảnh này; cách dùng và ngữ pháp có thể khác nhau.')}</p></section>
        <footer className="wd-sources"><span>{tr('Pronunciation & word reference', 'Nguồn phiên âm & đối chiếu từ')}</span>{entry.sources.map(source => <a href={source.url} target="_blank" rel="noreferrer noopener" key={source.url}>{source.label}<ArrowUpRight size={13} /></a>)}</footer>
      </>}

      {!entry && <section className="wd-custom-details">
        {word.example && <div className="wd-example-panel"><span className="wd-example-label">{tr('Your example', 'Ví dụ bạn đã lưu')}</span><blockquote lang="en">{word.example}</blockquote><button type="button" className="wd-inline-audio" onClick={() => listen(word.example)}><Headphones size={17} />{tr('Listen to your example', 'Nghe câu bạn đã lưu')}</button></div>}
        <div className="wd-lookup-intro"><Search size={21} /><div><h4>{tr('Shall we look a little further?', 'Mình tìm hiểu thêm nhé?')}</h4><p>{tr("Look up pronunciation, word types and other meanings while keeping your saved notes as you wrote them.", "Bạn cứ tra thêm phiên âm, từ loại và các nghĩa khác nhé, những ghi chú đã lưu vẫn được giữ nguyên.")}</p></div></div>
        <button type="button" className="pill-button wd-lookup-button" onClick={findDetails} disabled={lookupState === 'loading'}>{lookupState === 'loading' ? <LoaderCircle size={17} className="wd-spinner" /> : <Search size={17} />}{lookupState === 'loading' ? tr('Looking it up…', 'Đang tìm từ…') : lookupState === 'error' || lookupState === 'not-found' ? tr('Try dictionary lookup again', 'Thử tra lại từ') : tr('Find dictionary details', 'Tra thông tin từ điển')}</button>
        <div aria-live="polite">{lookupState === 'not-found' && <p className="wd-lookup-message">{tr("Your saved meaning and example are still here, although I couldn’t find an entry for this spelling or phrase.", "Tớ chưa tìm thấy mục từ cho cách viết hoặc cụm từ này, còn nghĩa và ví dụ bạn lưu vẫn ở đây nhé.")}</p>}{lookupState === 'error' && <p className="wd-lookup-message">{tr("Let’s try the dictionary again when the connection is back, as it isn’t responding right now.", "Từ điển chưa phản hồi lúc này, mình thử lại khi kết nối ổn định nhé.")}</p>}</div>
        {lookup && <div className="wd-lookup-result"><h4>{tr('Dictionary results', 'Kết quả tra cứu')}</h4>{lookup.phonetics.length > 0 && <p className="wd-ipa">{lookup.phonetics.map(item => `/${item.replace(/^\/|\/$/g, '')}/`).join(' · ')}</p>}<p className="wd-sense-note">{tr('Choose the sense that matches your sentence. These results may describe a different meaning from your note.', 'Chọn nghĩa phù hợp với câu của bạn nhé. Kết quả này có thể dùng nghĩa khác với ghi chú bạn đã lưu.')}</p>{lookup.senses.map((sense, index) => <div className="wd-lookup-sense" key={`${sense.partOfSpeech}-${index}`}><span className="wd-pos">{posLabel(sense.partOfSpeech)}</span><p lang="en">{sense.definition}</p>{sense.synonyms.length > 0 && <p><span>{tr('Similar', 'Gần nghĩa')}: </span><span lang="en">{sense.synonyms.join(' · ')}</span></p>}{sense.antonyms.length > 0 && <p><span>{tr('Opposite', 'Trái nghĩa')}: </span><span lang="en">{sense.antonyms.join(' · ')}</span></p>}</div>)}<footer className="wd-sources"><a href="https://dictionaryapi.dev/" target="_blank" rel="noreferrer noopener">Free Dictionary API<ArrowUpRight size={13} /></a>{lookup.sources.map((url, index) => <a href={url} target="_blank" rel="noreferrer noopener" key={url}>{tr(`Source ${index + 1}`, `Nguồn ${index + 1}`)}<ArrowUpRight size={13} /></a>)}{lookup.license && <a href={lookup.license.url} target="_blank" rel="noreferrer noopener">{lookup.license.name}<ArrowUpRight size={13} /></a>}</footer></div>}
      </section>}

      <section className="wd-library-controls"><div><h4>{tr('Keep it in your words', 'Giữ từ trong hành trình của bạn')}</h4><p>{tr('Collection', 'Bộ từ')} · {word.collection === 'My words' ? tr('My words', 'Từ đã lưu') : word.collection === 'Travel smart' ? tr('Travel smart', 'Du lịch tự tin') : word.collection === 'Everyday essentials' ? tr('Everyday essentials', 'Từ vựng hằng ngày') : word.collection === 'Work & career' ? tr('Work & career', 'Công việc & sự nghiệp') : word.collection}</p></div>{saved ? <label className="wd-status-control"><span>{tr('Learning status', 'Trạng thái học')}</span><select value={saved.status} onChange={event => { const status = event.currentTarget.value as WordStatus; setWords(current => current.map(item => item.id === saved.id ? { ...item, status, due: status !== 'Mastered' } : item)); notify(tr('Learning status updated.', 'Đã cập nhật trạng thái học.')); }}>{(['New', 'Learning', 'Mastered'] as WordStatus[]).map(status => <option value={status} key={status}>{statusLabel(status)}</option>)}</select></label> : <button type="button" className="primary-button" onClick={saveWord}>{tr('Save this word', 'Lưu từ này')}</button>}</section>
      <div className="wd-bottom-actions"><button type="button" className="primary-button" onClick={onClose}>{tr('Back to my words', 'Về từ đã lưu')}</button>{saved && !confirmDelete && <button type="button" className="text-button danger-text" onClick={() => setConfirmDelete(true)}><Trash2 size={16} />{tr('Delete word', 'Xóa từ')}</button>}</div>
      {saved && confirmDelete && <div className="wd-delete-confirm" role="group" aria-label={tr('Confirm word deletion', 'Xác nhận xóa từ')}><p>{tr('Remove this word from your saved list?', 'Xóa từ này khỏi danh sách đã lưu nhé?')}</p><div><button type="button" className="pill-button" onClick={() => setConfirmDelete(false)}>{tr('Keep word', 'Giữ từ')}</button><button type="button" className="text-button danger-text" onClick={() => { setWords(current => current.filter(item => item.id !== saved.id)); notify(tr('Word removed from your saved list.', 'Đã xóa từ khỏi danh sách đã lưu.')); onClose(); }}><Trash2 size={16} />{tr('Yes, delete word', 'Đồng ý xóa từ')}</button></div></div>}
    </article>
  </Modal>;
}
