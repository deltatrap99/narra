import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, FlaskConical, MessageCircle, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import BuddyAvatar from './BuddyAvatar';
import { speak, useCopy, useNarra } from './state';
import { correctedExample, demoTranscript, exampleEdits, naturalExamples, vocabularyUpgrades, type TranscriptMessage } from './session-review';
import './conversation-review.css';

type Props = { messages: TranscriptMessage[]; minutes: number; tutor: string; onRetry?: () => void; onContinue: () => void; saved?: boolean };
export default function ConversationReview({ messages, minutes, tutor, onRetry, onContinue, saved = false }: Props) {
  const tr = useCopy();
  const [section, setSection] = useState<'overview' | 'transcript' | 'upgrade'>('overview');
  const [sample, setSample] = useState(false);
  const [edits, setEdits] = useState(true);
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const turns = messages.filter(message => message.role === 'user').length;
  const locale = tutor === 'Henry' ? 'en-GB' : 'en-US';
  useEffect(() => { heading.current?.focus(); }, []);
  function navigate(next: typeof section) { setSection(next); if (content.current) content.current.scrollTop = 0; }
  function play(text: string) { if (!speak(text, locale)) setNotice(tr('Audio is unavailable in this browser.', 'Trình duyệt chưa phát được âm thanh, bạn đọc câu mẫu cùng Narry nhé.')); }
  return <div className="session-review">
    <div className="review-scroll" ref={content}>
      <header className="review-intro"><div><p className="eyebrow">{tr('YOUR CONVERSATION, REVISITED', 'CÙNG NHÌN LẠI CUỘC TRÒ CHUYỆN')}</p><h2 ref={heading} tabIndex={-1}>{tr('One conversation. A little more confident.', 'Nói một chút, tự tin thêm một chút.')}</h2><p>{tr(`Narry is here! Let’s revisit your ${turns} ${turns === 1 ? 'reply' : 'replies'}, one idea at a time.`, `Narry đây! Tớ cùng bạn xem lại ${turns} lượt trả lời, gỡ từng ý nhỏ nhé.`)}</p><span className="review-meta">{minutes} {tr('min', 'phút')} · {turns} {tr(turns === 1 ? 'reply' : 'replies', 'lượt trả lời')} · {tr('Voice', 'Giọng')} {tutor}</span></div><BuddyAvatar mood="celebrate" size={100} motion={false} /></header>
      <div className="review-demo-banner"><FlaskConical size={19}/><p><strong>{tr('Interface demo', 'Bản demo giao diện')}</strong>{tr('CEFR and scores are fixed illustrations, not an assessment of your speaking.', 'CEFR và điểm số là minh họa cố định, chưa phải đánh giá bài nói của bạn.')}</p></div>
      <nav className="review-section-nav" aria-label={tr('Review sections', 'Các phần tổng kết')}>
        {(['overview', 'transcript', 'upgrade'] as const).map((item, index) => <button type="button" key={item} aria-pressed={section === item} onClick={() => navigate(item)}>{[<Sparkles size={17}/>, <MessageCircle size={17}/>, <BookOpen size={17}/>][index]}{[tr('Overview', 'Tổng quan'), tr('Conversation', 'Hội thoại'), tr('Level up', 'Nâng cấp')][index]}</button>)}
      </nav>
      {section === 'overview' ? <>
        <section className="review-score-card" aria-labelledby="review-score-title"><div className="review-score-top"><div><p className="eyebrow">{tr('ILLUSTRATIVE CEFR', 'CEFR MINH HỌA')}</p><h3 id="review-score-title">B1 <span>{tr('Independent user', 'Giao tiếp độc lập')}</span></h3><p>{tr('Example goal: describe a familiar experience and give a simple reason.', 'Mục tiêu ví dụ: kể một trải nghiệm quen thuộc và giải thích lý do đơn giản.')}</p></div><div className="review-score-number"><strong>72<span>/100</span></strong><span>{tr('Demo score', 'Điểm demo')}</span></div></div><ol className="review-cefr-scale" aria-label={tr('CEFR levels, B1 is an illustration', 'Các bậc CEFR, B1 là minh họa')}>{['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => <li key={level} className={level === 'B1' ? 'selected' : ''}>{level}{level === 'B1' && <span>{tr('Demo', 'Mẫu')}</span>}</li>)}</ol><details className="review-framework"><summary>{tr('What does this framework describe?', 'Khung này mô tả điều gì?')}<ChevronDown size={15}/></summary><p>{tr('CEFR describes language ability from A1 to C2. These example numbers are a UI scale, not an official conversion to CEFR.', 'CEFR mô tả năng lực ngôn ngữ từ A1 đến C2. Các điểm số ví dụ ở đây là thang giao diện, không phải phép quy đổi chính thức sang CEFR.')} <a href="https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use" target="_blank" rel="noreferrer">{tr('See the CEFR descriptors', 'Xem mô tả CEFR')} ↗</a></p></details></section>
        <section className="review-criteria" aria-labelledby="review-criteria-title"><div className="review-section-heading"><h3 id="review-criteria-title">{tr('A closer look', 'Nhìn từng kỹ năng')}</h3><span>{tr('Illustrative scores', 'Điểm minh họa')}</span></div><div className="review-criteria-grid">{[
          [tr('Language range', 'Vốn từ & cấu trúc'), '74', 'B1'], [tr('Accuracy', 'Độ chính xác'), '68', 'B1'], [tr('Fluency', 'Độ trôi chảy'), '71', 'B1'], [tr('Interaction', 'Tương tác'), '76', 'B1'], [tr('Coherence', 'Mạch lạc'), '73', 'B1'], [tr('Pronunciation', 'Phát âm'), '', ''],
        ].map(([label, score, level]) => <div className="review-criterion" key={label}><div><span>{label}</span><strong>{score ? `${score}/100` : '—'}</strong></div>{score ? <><meter min={0} max={100} value={Number(score)} aria-label={`${label} · ${tr('demo', 'minh họa')}`}/><small>{level} · {tr('Demo', 'Minh họa')}</small></> : <p>{tr('Needs an audio assessment', 'Cần đánh giá từ bản ghi âm')}</p>}</div>)}</div></section>
        <section className="review-narry-tip"><BuddyAvatar mood="encourage" size={76} motion={false}/><div><h3>{tr('One small goal for next time', 'Lần tới, thử một điều nhỏ nhé')}</h3><p>{tr('Add a “because”, share a detail, then ask Narry a question back. That’s a conversation waiting to happen!', 'Thêm một “because”, kể một chi tiết rồi hỏi lại Narry một câu. Tớ hóng câu chuyện tiếp theo của bạn rồi đó!')}</p></div></section>
        <button type="button" className="review-next-section" onClick={() => navigate('transcript')}>{tr('Read the whole conversation', 'Xem lại toàn bộ hội thoại')}<ArrowRight size={18}/></button>
      </> : section === 'transcript' ? <>
        <div className="review-section-heading"><div><h3>{tr('Every turn, in order', 'Từng lượt nói, trọn câu chuyện')}</h3><p>{sample ? tr('Sample conversation for exploring corrections.', 'Hội thoại mẫu để xem cách hiển thị sửa lỗi.') : tr('Your original transcript, including both speakers.', 'Bản chép gốc của bạn, đầy đủ lời cả hai bên.')}</p></div></div>
        <div className="review-transcript-controls"><button type="button" aria-pressed={!sample} onClick={() => setSample(false)}>{tr('Your conversation', 'Hội thoại của bạn')}</button><button type="button" aria-pressed={sample} onClick={() => setSample(true)}>{tr('Sample conversation', 'Hội thoại mẫu')}</button></div>
        <label className="review-correction-toggle"><input type="checkbox" checked={edits} onChange={event => setEdits(event.target.checked)}/>{tr('Show example corrections', 'Hiện gợi ý sửa mẫu')}</label>
        <p className="review-legend"><del>{tr('Original', 'Câu gốc')}</del> → <ins>{tr('Suggestion', 'Gợi ý')}</ins><span>{tr('Only a few prepared examples are available in this demo.', 'Demo chỉ có một số mẫu sửa soạn sẵn.')}</span></p>
        <ol className="review-transcript">{(sample ? demoTranscript : messages).map((message, index) => <TranscriptTurn key={message.id} message={message} index={index} edits={edits} tutor={tutor} onPlay={play}/>)}</ol>
        <button type="button" className="review-next-section" onClick={() => navigate('upgrade')}>{tr('Explore more natural expressions', 'Thử cách diễn đạt tự nhiên hơn')}<ArrowRight size={18}/></button>
      </> : <>
        <div className="review-section-heading"><div><h3>{tr('Same you. More ways to say it.', 'Vẫn là ý của bạn, thêm cách để nói.')}</h3><p>{tr('Prepared examples to explore. These are not quotes from your conversation.', 'Ví dụ soạn sẵn để bạn thử, không phải trích dẫn từ bài nói của bạn.')}</p></div></div>
        <section className="review-natural-list" aria-label={tr('Natural expressions', 'Cách nói tự nhiên')}>{naturalExamples.map(item => <article className="review-natural-card" key={item.before}><span className="review-card-label"><Sparkles size={16}/>{tr('Try a different tone', 'Thử đổi sắc thái')}</span><p className="review-before" lang="en">{item.before}</p><div className="review-better"><p lang="en">{item.after}</p><button type="button" onClick={() => play(item.after)} aria-label={`${tr('Hear', 'Nghe')} ${item.after}`}><Volume2 size={19}/></button></div><p className="review-explanation">{tr(item.why.en, item.why.vi)}</p></article>)}</section>
        <section className="review-vocabulary" aria-labelledby="review-vocabulary-title"><div className="review-section-heading"><h3 id="review-vocabulary-title">{tr('Give your words a little upgrade', 'Bỏ túi vài cụm xịn cùng Narry')}</h3></div><div className="review-vocabulary-grid">{vocabularyUpgrades.map(item => <VocabularyCard key={item.word} item={item} onPlay={play}/>)}</div></section>
        <div className="review-practice-tip"><BuddyAvatar mood="thinking" size={68} motion={false}/><p>{tr('Narry’s tip: pick one phrase, put it in a sentence about you, then use it again tomorrow.', 'Mẹo của Narry: chọn một cụm, đặt câu đúng với chuyện của bạn rồi dùng lại vào ngày mai. Nhớ cả cụm, nói mới mượt nè!')}</p></div>
      </>}
      {notice && <p className="review-notice" role="status">{notice}</p>}
    </div>
    <footer className="session-review-actions">{onRetry && <button type="button" className="secondary-button" onClick={onRetry}><RotateCcw size={17}/>{tr('Keep practising', 'Luyện thêm')}</button>}<button type="button" className="primary-button" onClick={onContinue}>{saved ? tr('Back', 'Quay lại') : tr('Save & finish', 'Lưu & hoàn thành')}<Check size={18}/></button></footer>
  </div>;
}

function TranscriptTurn({ message, index, edits, tutor, onPlay }: { message: TranscriptMessage; index: number; edits: boolean; tutor: string; onPlay: (text: string) => void }) {
  const tr = useCopy();
  const corrections = message.role === 'user' ? exampleEdits(message.text) : [];
  const pieces = []; let cursor = 0;
  if (edits) for (const correction of corrections) { pieces.push(message.text.slice(cursor, correction.start)); pieces.push(<span className="review-inline-edit" key={correction.start}><del>{correction.before}</del>{' '}<ins>{correction.after}</ins></span>); cursor = correction.end; }
  pieces.push(message.text.slice(cursor));
  return <li className={`review-turn is-${message.role}`}><div className="review-turn-heading"><strong>{message.role === 'tutor' ? `Narry · ${tutor}` : tr('You', 'Bạn')}<span>{tr('Turn', 'Lượt')} {index + 1}</span></strong><button type="button" onClick={() => onPlay(message.text)} aria-label={`${tr('Read aloud turn', 'Đọc lại lượt')} ${index + 1}`}><Volume2 size={17}/></button></div><p className="review-turn-text" lang="en">{pieces}</p>{message.role === 'tutor' && message.translation && <details className="review-translation"><summary>{tr('Translation', 'Bản dịch')}</summary><p>{message.translation}</p></details>}{message.role === 'user' && <>{corrections.length > 0 && edits ? <details className="review-edit-explanation"><summary>{tr('Why this suggestion?', 'Vì sao sửa như vậy?')}<ChevronDown size={15}/></summary>{corrections.map(correction => <p key={correction.start}>{tr(correction.explanation.en, correction.explanation.vi)}</p>)}<button type="button" onClick={() => onPlay(correctedExample(message.text, corrections))}><Volume2 size={16}/>{tr('Hear the corrected example', 'Nghe câu đã sửa mẫu')}</button></details> : edits && <p className="review-no-example">{tr('No prepared correction matches this turn. It has not been assessed.', 'Chưa có mẫu sửa khớp với lượt này. Câu của bạn chưa được đánh giá.')}</p>}</>}</li>;
}

function VocabularyCard({ item, onPlay }: { item: typeof vocabularyUpgrades[number]; onPlay: (text: string) => void }) {
  const { words, setWords } = useNarra(); const tr = useCopy();
  const saved = words.some(word => word.word.toLowerCase() === item.word.toLowerCase());
  function save() { setWords(current => current.some(word => word.word.toLowerCase() === item.word.toLowerCase()) ? current : [...current, { id: `review-${crypto.randomUUID()}`, word: item.word, definition: item.definition, example: item.example, collection: 'Narry · Speaking', status: 'New', due: true }]); }
  return <article className="review-word-card"><span>{item.from} <ArrowRight size={14}/></span><h4 lang="en">{item.word}</h4><p lang="en">{item.example}</p><p>{tr(item.tip.en, item.tip.vi)}</p><div><button type="button" onClick={() => onPlay(item.example)}><Volume2 size={16}/>{tr('Listen', 'Nghe mẫu')}</button><button type="button" disabled={saved} onClick={save}>{saved ? <Check size={16}/> : <BookOpen size={16}/>}{saved ? tr('Saved', 'Đã lưu') : tr('Save phrase', 'Lưu cụm từ')}</button></div></article>;
}
