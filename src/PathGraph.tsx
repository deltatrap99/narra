import { useRef, type CSSProperties } from 'react';
import { Check, Crosshair, LockKeyhole, Play, Trophy } from 'lucide-react';
import type { Chapter, Lesson } from './data';
import './path-graph.css';

type Props = {
  chapters: Chapter[];
  completed: string[];
  nextId: string;
  onLesson: (lesson: Lesson, available: boolean) => void;
};

export default function PathGraph({ chapters, completed, nextId, onLesson }: Props) {
  const currentRef = useRef<HTMLButtonElement | null>(null);
  const done = new Set(completed);
  return <div className="path-map">
    <div className="path-map-toolbar">
      <div className="path-map-legend"><span><i className="path-dot-done" />Done</span><span><i className="path-dot-next" />Up next</span><span><i className="path-dot-locked" />Locked</span></div>
      <button onClick={() => currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Crosshair size={17} />Next</button>
    </div>
    <div className="path-map-canvas">
      {chapters.map((chapter, chapterIndex) => {
        const count = chapter.lessons.filter(lesson => done.has(lesson.id)).length;
        const startsLeft = chapterIndex % 2 === 0;
        const points = chapter.lessons.map((_, index) => ({ x: (index % 2 === 0) === startsLeft ? 100 : 260, y: 170 + index * 95 }));
        const states = chapter.lessons.map((lesson, index) => done.has(lesson.id) ? 'done' : lesson.id === nextId ? 'next'
          : index === 0 || done.has(chapter.lessons[index - 1].id) ? 'open' : 'locked');
        const currentUnit = chapter.lessons.some(lesson => lesson.id === nextId);
        const paths = [
          `M180 80 C180 115 ${points[0].x} 125 ${points[0].x} ${points[0].y}`,
          ...points.slice(1).map((point, index) => `M${points[index].x} ${points[index].y} C${points[index].x} ${points[index].y + 47} ${point.x} ${point.y - 47} ${point.x} ${point.y}`),
          `M${points[2].x} ${points[2].y} C${points[2].x} 403 180 413 180 440`,
        ];
        const lineStates = [states[0], states[1], states[2], count === chapter.lessons.length ? 'done' : 'locked'];
        return <section className="path-map-unit" key={chapter.id} aria-label={`Unit ${chapterIndex + 1}: ${chapter.title}`}>
          <svg className="path-map-connectors" viewBox="0 0 360 440" preserveAspectRatio="none" aria-hidden="true">
            {paths.map((path, index) => <g key={index} className={`path-line-${lineStates[index]}`}>
              <path d={path} className="path-line-halo" /><path d={path} className="path-line-dots" />
            </g>)}
          </svg>
          <div className={`path-map-unit-heading ${currentUnit ? 'is-current' : ''}`}>
            <span className="path-map-unit-ring" style={{ '--unit-progress': `${count / chapter.lessons.length * 100}%` } as CSSProperties}><span>{String(chapterIndex + 1).padStart(2, '0')}</span></span>
            <div><p>Unit {String(chapterIndex + 1).padStart(2, '0')} · {count}/{chapter.lessons.length} done</p><h3>{chapter.title}</h3><span>{chapter.description}</span></div>
          </div>
          {chapter.lessons.map((lesson, index) => {
            const state = states[index];
            return <button key={lesson.id} ref={lesson.id === nextId ? currentRef : undefined}
              className={`path-map-lesson path-map-lesson--${points[index].x === 100 ? 'left' : 'right'} is-${state}`}
              style={{ top: `${points[index].y / 440 * 100}%` }} aria-disabled={state === 'locked'}
              aria-label={`${lesson.title}, ${state === 'done' ? 'completed' : state === 'next' ? 'up next' : state === 'open' ? 'available' : 'locked'}, ${lesson.minutes} minutes`}
              onClick={() => onLesson(lesson, state !== 'locked')}>
              <span className="path-map-lesson-node">{state === 'next' && <span className="path-map-continue">Continue</span>}
                {state === 'done' ? <Check strokeWidth={3} /> : state === 'locked' ? <LockKeyhole fill="currentColor" /> : <Play fill="currentColor" />}
              </span>
              <span className="path-map-lesson-label"><strong>{lesson.title}</strong><span>{state === 'done' ? 'Completed' : state === 'next' ? 'Up next' : state === 'open' ? 'Open now' : 'Locked'} · {lesson.minutes} min</span></span>
            </button>;
          })}
        </section>;
      })}
      <div className="path-map-finish"><span><Trophy size={21} fill="currentColor" /></span><p>Finish line</p></div>
    </div>
  </div>;
}
