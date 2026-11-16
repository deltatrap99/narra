import type { CSSProperties } from 'react';
import { Check, Flag, LockKeyhole, Play, Sparkles, Sun } from 'lucide-react';
import type { Chapter, Lesson } from './data';
import { useCopy } from './state';
import BuddyAvatar from './BuddyAvatar';
import { Art } from './ui';

const stops = [
  { x: '15%', y: '64.94%', mx: '24%', my: '24%' },
  { x: '50%', y: '38.31%', mx: '76%', my: '54%' },
  { x: '85%', y: '64.94%', mx: '24%', my: '84%' },
];
const desktopSegments = ['M150 200 C280 200 305 118 500 118', 'M500 118 C695 118 710 200 850 200', 'M850 200 Q910 200 935 148'];
const mobileSegments = ['M24 24 C24 38 76 40 76 54', 'M76 54 C76 68 24 70 24 84'];
const landmarkArt: Record<string, string> = { possibilities: 'plane', professional: 'briefcase', career: 'briefcase', study: 'books', culture: 'books', online: 'books', directions: 'plane', future: 'plane', home: 'house', shopping: 'house' };
type Props = { chapter: Chapter; completed: string[]; nextId: string; onLesson: (lesson: Lesson, available: boolean) => void };

export default function HomeChapterPath({ chapter, completed, nextId, onLesson }: Props) {
  const tr = useCopy();
  const done = chapter.lessons.filter(item => completed.includes(item.id)).length;
  const chapterComplete = done === chapter.lessons.length;
  const currentIndex = chapter.lessons.findIndex(item => item.id === nextId && !completed.includes(item.id));
  return <section className="home-chapter home-chapter-map" aria-labelledby="home-chapter-title">
    <header><div><span>{tr('MY CURRENT CHAPTER', 'CHẶNG NÀY CỦA MÌNH')}</span><h2 id="home-chapter-title">{chapter.title}</h2></div><span className="home-chapter-count">{done}/{chapter.lessons.length}<Check size={13} /></span></header>
    <div className="chapter-path-stage">
      <span className="chapter-path-meadow meadow-one" aria-hidden="true" /><span className="chapter-path-meadow meadow-two" aria-hidden="true" />
      <svg className="chapter-path-road road-desktop" viewBox="0 0 1000 308" preserveAspectRatio="none" aria-hidden="true">
        {desktopSegments.map((d, index) => <g key={d}><path d={d} className="chapter-road-edge" /><path d={d} className={`chapter-road-fill ${completed.includes(chapter.lessons[index]?.id) ? 'is-travelled' : ''}`} /><path d={d} className="chapter-road-dashes" /></g>)}
      </svg>
      <svg className="chapter-path-road road-mobile" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {mobileSegments.map((d, index) => <g key={d}><path d={d} className="chapter-road-edge" /><path d={d} className={`chapter-road-fill ${completed.includes(chapter.lessons[index]?.id) ? 'is-travelled' : ''}`} /><path d={d} className="chapter-road-dashes" /></g>)}
      </svg>
      <div className="chapter-path-landmark" aria-hidden="true"><Art name={landmarkArt[chapter.id] ?? 'plant'} /><Sparkles size={16} /></div>
      <Sun className="chapter-path-sun" size={26} aria-hidden="true" />
      <div className={`chapter-path-finish ${chapterComplete ? 'is-complete' : ''}`} aria-hidden="true"><Flag size={27} /><span />{chapterComplete && <Sparkles size={18} />}</div>
      <ol className="chapter-path-stops">{chapter.lessons.map((item, index) => {
        const finished = completed.includes(item.id);
        const available = finished || index === 0 || completed.includes(chapter.lessons[index - 1].id);
        const current = currentIndex === index;
        const point = stops[index] ?? stops[0];
        const state = finished ? 'done' : current ? 'current' : available ? 'open' : 'locked';
        const label = tr(finished ? 'Completed, revisit' : current ? 'Your next lesson' : available ? 'Ready for you' : 'Finish the previous lesson first', finished ? 'Đã hoàn thành, ôn lại' : current ? 'Bài học tiếp theo' : available ? 'Có thể học' : 'Học xong bài trước để mở');
        const style = { '--path-x': point.x, '--path-y': point.y, '--path-mobile-x': point.mx, '--path-mobile-y': point.my } as CSSProperties;
        return <li key={item.id} className={`chapter-path-stop is-${state}`} style={style}>
          <button type="button" onClick={() => onLesson(item, available)} aria-current={current ? 'step' : undefined} aria-disabled={!available} aria-label={`${item.title}, ${label}`}>
            <span className="chapter-stop-mark" aria-hidden="true">{finished ? <Check size={28} strokeWidth={2.7} /> : <strong>{String(index + 1).padStart(2, '0')}</strong>}{current && <i><Play size={10} fill="currentColor" /></i>}{!available && <i><LockKeyhole size={11} /></i>}</span>
            <span className="chapter-stop-copy"><strong>{item.title}</strong><small>{tr(finished ? 'Nicely done!' : current ? 'You’re here' : available ? 'Ready for you' : 'Up ahead', finished ? 'Xong rồi nè!' : current ? 'Mình đang ở đây' : available ? 'Sẵn sàng rồi' : 'Sắp tới nhé')}</small></span>
          </button>
          {current && <div className="chapter-path-buddy" aria-hidden="true"><BuddyAvatar mood="welcome" size={88} motion={false} /></div>}
        </li>;
      })}</ol>
      {chapterComplete && <div className="chapter-path-buddy buddy-at-finish" aria-hidden="true"><BuddyAvatar mood="celebrate" size={88} motion={false} /></div>}
    </div>
  </section>;
}
