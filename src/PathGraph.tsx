import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, Crosshair, Flag, LockKeyhole, Play, Route, Sparkles } from 'lucide-react';
import type { Chapter, Lesson } from './data';
import { brandAsset, isOption5 } from './brand-variant';
import BuddyAvatar from './BuddyAvatar';
import { useCopy } from './state';
import { Art } from './ui';
import './journey-map.css';

type Props = { chapters: Chapter[]; completed: string[]; nextId: string; onLesson: (lesson: Lesson, available: boolean) => void };
type LessonState = 'done' | 'next' | 'open' | 'locked';
const TRAVEL_MS = 900;
const stops = [
  { x: 16, y: 68, mobileX: 28, mobileY: 28 },
  { x: 50, y: 36, mobileX: 72, mobileY: 52 },
  { x: 84, y: 68, mobileX: 28, mobileY: 76 },
];
const chapterArt: Record<string, string> = { everyday: 'plant', possibilities: 'plane', professional: 'briefcase', shopping: 'house', home: 'house', friends: 'plant', directions: 'plane', career: 'briefcase', services: 'house', feelings: 'plant', conversation: 'books', hobbies: 'plant', culture: 'books', online: 'books', nature: 'plant', health: 'plant', food: 'house', study: 'books', future: 'plane', stories: 'books' };

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  return reduced;
}

export default function PathGraph({ chapters, completed, nextId, onLesson }: Props) {
  const tr = useCopy(); const reducedMotion = useReducedMotion(); const selectId = useId();
  const all = chapters.flatMap(chapter => chapter.lessons); const known = new Set(all.map(lesson => lesson.id)); const done = new Set(completed.filter(id => known.has(id)));
  const current = all.find(lesson => lesson.id === nextId && !done.has(lesson.id)) ?? all.find(lesson => !done.has(lesson.id));
  const [selection, setSelection] = useState(() => {
    const chapter = chapters.find(item => item.lessons.some(lesson => lesson.id === current?.id)) ?? chapters[0];
    return { chapterId: chapter?.id ?? '', lessonId: current?.id ?? chapter?.lessons[0]?.id ?? '' };
  });
  const [moving, setMoving] = useState(false); const [direction, setDirection] = useState<'left' | 'right'>('right'); const [arrival, setArrival] = useState(0); const [crawlFailed, setCrawlFailed] = useState(false);
  const timer = useRef<number | null>(null); const companion = useRef<HTMLDivElement>(null); const rail = useRef<HTMLDivElement>(null); const activeChapterButton = useRef<HTMLButtonElement>(null);
  const chapterIndex = Math.max(0, chapters.findIndex(item => item.id === selection.chapterId)); const chapter = chapters[chapterIndex];
  const lessonIndex = Math.max(0, chapter?.lessons.findIndex(lesson => lesson.id === selection.lessonId) ?? 0); const selected = chapter?.lessons[lessonIndex];
  const position = stops[lessonIndex] ?? stops[0]; const chapterDone = chapter?.lessons.filter(lesson => done.has(lesson.id)).length ?? 0;
  const complete = all.length > 0 && done.size === all.length;
  function stateFor(lesson: Lesson, index: number, unit: Chapter): LessonState {
    if (done.has(lesson.id)) return 'done';
    const available = index === 0 || done.has(unit.lessons[index - 1].id);
    if (!available) return 'locked';
    return lesson.id === current?.id ? 'next' : 'open';
  }
  const selectedState = selected ? stateFor(selected, lessonIndex, chapter) : 'locked';
  const previousLesson = chapter?.lessons[lessonIndex - 1];
  const stateLabel = (state: LessonState) => state === 'done' ? tr('Completed', 'Đã hoàn thành') : state === 'next' ? tr('Up next', 'Bài tiếp theo') : state === 'open' ? tr('Ready to start', 'Có thể bắt đầu') : tr('Locked', 'Chưa mở khóa');
  function cancelTravel() { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; }
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);
  useEffect(() => { if (reducedMotion) { cancelTravel(); setMoving(false); } }, [reducedMotion]);
  useEffect(() => {
    const list = rail.current; const button = activeChapterButton.current; if (!list || !button) return;
    const top = button.offsetTop;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + button.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + button.offsetHeight - list.clientHeight;
  }, [selection.chapterId]);
  function chooseChapter(index: number) {
    const unit = chapters[index]; if (!unit) return; cancelTravel(); setMoving(false);
    const first = unit.lessons.find(lesson => lesson.id === current?.id) ?? unit.lessons.find(lesson => !done.has(lesson.id)) ?? unit.lessons[0];
    setSelection({ chapterId: unit.id, lessonId: first.id }); setArrival(value => value + 1);
  }
  function chooseLesson(lesson: Lesson, button: HTMLButtonElement) {
    cancelTravel();
    if (lesson.id === selected?.id) { setMoving(false); setArrival(value => value + 1); return; }
    const target = button.querySelector('.journey-node-mark')?.getBoundingClientRect(); const origin = companion.current?.getBoundingClientRect();
    setDirection(target && origin && target.left + target.width / 2 < origin.left + origin.width / 2 ? 'left' : 'right');
    setSelection({ chapterId: chapter.id, lessonId: lesson.id });
    if (reducedMotion) { setMoving(false); setArrival(value => value + 1); return; }
    setMoving(true); timer.current = window.setTimeout(() => { timer.current = null; setMoving(false); setArrival(value => value + 1); }, TRAVEL_MS);
  }
  function findNext() { const index = chapters.findIndex(unit => unit.lessons.some(lesson => lesson.id === current?.id)); chooseChapter(index < 0 ? 0 : index); }
  if (!chapter || !selected) return null;
  const markerStyle = (point: typeof stops[number]): CSSProperties => ({ '--stop-x': `${point.x}%`, '--stop-y': `${point.y}%`, '--stop-mobile-x': `${point.mobileX}%`, '--stop-mobile-y': `${point.mobileY}%` } as CSSProperties);
  const unlockNote = selectedState === 'locked' && previousLesson ? tr(`Finish “${previousLesson.title}” first. You can still explore this stop.`, `Bạn hoàn thành “${previousLesson.title}” trước nhé. Mình vẫn có thể xem trước bài này.`) : '';

  return <div className="journey-map" style={{ '--journey-travel-ms': `${TRAVEL_MS}ms` } as CSSProperties}>
    <div className="journey-overview"><div><span className="journey-eyebrow"><Route size={15} />{tr('YOUR ENGLISH, ONE LITTLE STOP AT A TIME', 'TỪNG ĐIỂM DỪNG, THÊM MỘT CHÚT TIẾNG ANH')}</span><h3>{complete ? tr('Look how far you’ve come.', 'Mình đã đi một chặng đường rồi nè.') : tr('Where shall we go next?', 'Mình ghé đâu tiếp theo nhỉ?')}</h3></div><div className="journey-overview-progress"><strong>{done.size}<span>/{all.length}</span></strong><small>{complete ? tr('Journey complete. Revisit any lesson.', 'Đã hoàn thành. Mình ôn bài nào cũng được nhé.') : tr('lessons completed', 'bài đã hoàn thành')}</small></div></div>
    <div className="journey-layout">
      <aside className="journey-chapters"><div className="journey-chapters-heading"><strong>{tr('Your topics', 'Các chủ đề')}</strong><span>{chapters.length}</span></div><div ref={rail} className="journey-chapter-list" role="navigation" aria-label={tr('Choose a learning topic', 'Chọn chủ đề học')}>{chapters.map((unit, index) => {
        const finished = unit.lessons.filter(lesson => done.has(lesson.id)).length; const isCurrent = unit.lessons.some(lesson => lesson.id === current?.id);
        return <button type="button" key={unit.id} ref={index === chapterIndex ? activeChapterButton : undefined} className={index === chapterIndex ? 'is-selected' : ''} aria-pressed={index === chapterIndex} onClick={() => chooseChapter(index)}><span className={'journey-topic-number '+(finished === unit.lessons.length ? 'is-complete' : '')}>{finished === unit.lessons.length ? <Check size={15} /> : String(index + 1).padStart(2, '0')}</span><span><strong>{unit.title}</strong><small>{finished}/{unit.lessons.length} {tr('complete', 'đã xong')}{isCurrent && <em>{tr('Up next', 'Tiếp theo')}</em>}</small></span><ChevronRight size={14} /></button>;
      })}</div></aside>
      <div className="journey-content"><div className="journey-mobile-picker"><label htmlFor={selectId}>{tr('Choose a topic', 'Chọn một chủ đề')}</label><div><button type="button" aria-label={tr('Previous topic', 'Chủ đề trước')} disabled={chapterIndex === 0} onClick={() => chooseChapter(chapterIndex - 1)}><ChevronLeft size={20} /></button><select id={selectId} value={chapter.id} onChange={event => chooseChapter(chapters.findIndex(unit => unit.id === event.target.value))}>{chapters.map((unit, index) => <option key={unit.id} value={unit.id}>{String(index + 1).padStart(2, '0')}: {unit.title}</option>)}</select><button type="button" aria-label={tr('Next topic', 'Chủ đề tiếp theo')} disabled={chapterIndex === chapters.length - 1} onClick={() => chooseChapter(chapterIndex + 1)}><ChevronRight size={20} /></button></div></div>
        <section className={'journey-board journey-tone-' + chapter.tone} aria-label={tr('Roadmap for ' + chapter.title, 'Bản đồ chủ đề ' + chapter.title)}><header className="journey-board-heading"><div><span>{tr('TOPIC', 'CHỦ ĐỀ')} {String(chapterIndex + 1).padStart(2, '0')}<i />{chapterDone}/{chapter.lessons.length} {tr('complete', 'đã xong')}</span><h3>{chapter.title}</h3><p>{chapter.description}</p></div><button type="button" className="journey-find-next" onClick={findNext} aria-label={complete ? tr('Revisit the first topic', 'Ôn lại chủ đề đầu tiên') : tr('Find my next lesson', 'Về bài học tiếp theo')}><Crosshair size={18} /><span>{complete ? tr('Revisit', 'Ôn lại') : tr('Up next', 'Tiếp theo')}</span></button></header>
          <div className="journey-stage"><div className="journey-stage-glow" /><svg className="journey-track journey-track-desktop" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M16 68 C23 68 26 36 50 36 S76 68 84 68" className="journey-track-bed" /><path d="M16 68 C23 68 26 36 50 36 S76 68 84 68" className="journey-track-line" /></svg><svg className="journey-track journey-track-mobile" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M28 28 C28 38 72 40 72 52 S28 64 28 76" className="journey-track-bed" /><path d="M28 28 C28 38 72 40 72 52 S28 64 28 76" className="journey-track-line" /></svg><div className="journey-landmark" aria-hidden="true"><Art name={chapterArt[chapter.id] ?? 'books'} /><span><Sparkles size={14} /></span></div><span className="journey-landscape-dot dot-one" /><span className="journey-landscape-dot dot-two" />
            {chapter.lessons.map((lesson, index) => { const state = stateFor(lesson, index, chapter); const chosen = lesson.id === selected.id; return <button type="button" key={lesson.id} className={`journey-node is-${state}${chosen ? ' is-selected' : ''}`} style={markerStyle(stops[index] ?? stops[0])} aria-pressed={chosen} aria-label={`${tr('Preview lesson', 'Xem trước bài')} ${index + 1}: ${lesson.title}. ${stateLabel(state)}. ${lesson.minutes} ${tr('minutes', 'phút')}.`} onClick={event => chooseLesson(lesson, event.currentTarget)}><span className="journey-node-mark">{state === 'done' ? <Check size={26} strokeWidth={2.8} /> : <strong>{String(index + 1).padStart(2, '0')}</strong>}{state === 'locked' && <i><LockKeyhole size={12} /></i>}{state === 'next' && <span className="journey-next-dot" />}</span><span className="journey-node-label"><strong>{lesson.title}</strong><span>{stateLabel(state)}</span></span></button>; })}
            <div ref={companion} className={'journey-companion ' + (moving ? 'is-moving ' : '') + (isOption5 ? 'is-caterpillar' : 'is-blue-buddy')} data-direction={direction} style={markerStyle(position)} aria-hidden="true"><div className="journey-companion-art">{moving && isOption5 && !crawlFailed ? <img className="journey-crawl" src={brandAsset('crawl.webp')} alt="" width={1024} height={1024} draggable={false} onError={() => setCrawlFailed(true)} /> : <BuddyAvatar key={arrival + '-' + (moving ? 'travel' : selected.id)} mood={moving ? 'welcome' : selectedState === 'done' ? 'celebrate' : selectedState === 'locked' ? 'curious' : 'welcome'} motion={!moving && !reducedMotion} size={96} />}</div></div>
          </div><div className="journey-legend"><span><i className="is-done" />{tr('Completed', 'Đã hoàn thành')}</span><span><i className="is-open" />{tr('Ready', 'Có thể học')}</span><span><LockKeyhole size={12} />{tr('Preview locked stops too', 'Có thể xem trước bài chưa mở')}</span></div>
        </section>
        <section className="journey-preview" aria-labelledby={`${selectId}-lesson-title`}><div className="journey-preview-top"><span className={'journey-preview-status is-' + selectedState}>{selectedState === 'done' ? <Check size={14} /> : selectedState === 'locked' ? <LockKeyhole size={14} /> : <Flag size={14} />}{stateLabel(selectedState)}</span><span><Clock3 size={14} />{selected.minutes} {tr('min', 'phút')}</span></div><div className="journey-preview-body"><div><p>{tr('SELECTED LESSON', 'BÀI ĐANG CHỌN')} {String(lessonIndex + 1).padStart(2, '0')}</p><h3 id={`${selectId}-lesson-title`}>{selected.title}</h3><p className="journey-preview-note">{selectedState === 'locked' ? unlockNote : selectedState === 'done' ? tr('You’ve finished this one. A little revisit can help the words feel familiar.', 'Bạn đã hoàn thành bài này rồi. Mình ôn một chút cho câu từ quen thuộc hơn nhé.') : tr('A little story, one short sentence. We can start there.', 'Một chuyện nhỏ, một câu ngắn. Mình cứ bắt đầu từ đó nhé.')}</p></div><button type="button" className="journey-start primary-button" disabled={selectedState === 'locked'} onClick={() => onLesson(selected, selectedState !== 'locked')}>{selectedState === 'locked' ? <LockKeyhole size={17} /> : <Play size={16} fill="currentColor" />}{selectedState === 'done' ? tr('Revisit lesson', 'Ôn lại bài này') : selectedState === 'locked' ? tr('Finish the previous lesson', 'Học xong bài trước nhé') : tr('Start this lesson', 'Bắt đầu bài này')}<ArrowRight size={17} /></button></div></section>
        <div className="journey-topic-controls"><button type="button" disabled={chapterIndex === 0} onClick={() => chooseChapter(chapterIndex - 1)}><ArrowLeft size={15} />{tr('Previous topic', 'Chủ đề trước')}</button><span>{chapterIndex + 1}/{chapters.length}</span><button type="button" disabled={chapterIndex === chapters.length - 1} onClick={() => chooseChapter(chapterIndex + 1)}>{tr('Next topic', 'Chủ đề tiếp theo')}<ArrowRight size={15} /></button></div>
      </div>
    </div><p className="journey-selection-announcement" role="status" aria-live="polite" aria-atomic="true">{tr('Selected: ', 'Đang chọn: ')}{selected.title}. {stateLabel(selectedState)}. {unlockNote}</p>
  </div>;
}
