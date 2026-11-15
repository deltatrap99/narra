import { useCallback, useEffect, useRef, useState } from 'react';
import { useCopy } from './state';
import './launch-screen.css';

export const LAUNCH_DURATION_MS = 2100;
const REVEAL_DURATION_MS = 420;

function Star({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1c1.8 10.8 4.2 13.2 15 15-10.8 1.8-13.2 4.2-15 15C14.2 20.2 11.8 17.8 1 16 11.8 14.2 14.2 11.8 16 1Z" /></svg>;
}

/** Always plays on mount. The app owns its once-per-session flag and can replay
 * by mounting a fresh instance; this component never changes stored app state. */
export default function LaunchScreen({ onDone }: { onDone: () => void }) {
  const tr = useCopy();
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const callback = useRef(onDone);
  callback.current = onDone;
  const completed = useRef(false);
  const skipButton = useRef<HTMLButtonElement>(null);
  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    callback.current();
    window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('[data-launch-focus], .lesson-focus-cta, #main button');
      if (target && !target.closest('[inert]')) target.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const started = performance.now();
    let deadline = started + (motionQuery.matches ? 400 : LAUNCH_DURATION_MS);
    let leaveTimer: number;
    let doneTimer: number;
    const focusFrame = window.requestAnimationFrame(() => skipButton.current?.focus({ preventScroll: true }));
    function schedule() {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      const remaining = Math.max(0, deadline - performance.now());
      leaveTimer = window.setTimeout(() => setLeaving(true), Math.max(0, remaining - (motionQuery.matches ? 100 : REVEAL_DURATION_MS)));
      doneTimer = window.setTimeout(finish, remaining);
    }
    function motionChanged() {
      setReducedMotion(motionQuery.matches);
      if (motionQuery.matches) deadline = Math.min(deadline, performance.now() + 400);
      schedule();
    }
    setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener('change', motionChanged);
    schedule();
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      window.cancelAnimationFrame(focusFrame);
      motionQuery.removeEventListener('change', motionChanged);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [finish]);

  return <section className={`narra-launch ${leaving ? 'is-leaving' : ''}`} data-motion={reducedMotion ? 'reduced' : 'full'} role="dialog" aria-modal="true" aria-label={tr('Welcome to Narra', 'Chào mừng đến với Narra')} onKeyDown={event => {
    if (event.key === 'Tab') { event.preventDefault(); skipButton.current?.focus({ preventScroll: true }); }
    else if (event.key === 'Escape') { event.preventDefault(); finish(); }
  }}>
    <button ref={skipButton} className="narra-launch-skip" onClick={finish}>{tr('Skip intro', 'Bỏ qua giới thiệu')}<span aria-hidden="true">↗</span></button>
    <div className="narra-launch-composition">
      <div className="narra-launch-stage" aria-hidden="true">
        <span className="narra-launch-orbit orbit-cyan" /><span className="narra-launch-orbit orbit-lime" />
        <Star className="narra-launch-star star-lime" /><Star className="narra-launch-star star-orange" /><Star className="narra-launch-star star-cyan" />
        <span className="narra-launch-satellite satellite-orange" /><span className="narra-launch-satellite satellite-lime" />
        <span className="narra-launch-ground" />
        <img className="narra-launch-buddy" src="/brand/mascot.webp" alt="" width="768" height="768" fetchPriority="high" decoding="sync" draggable={false} />
      </div>
      <h1 className="narra-launch-wordmark"><img src="/brand/logo-dark.webp" alt="Narra" width="524" height="121" fetchPriority="high" decoding="sync" draggable={false} /></h1>
      <p className="narra-launch-tagline">{tr('Your voice. Your story.', 'Giọng nói của bạn. Câu chuyện của bạn.')}</p>
    </div>
    <span className="narra-launch-corner" aria-hidden="true">{tr('A little, every day.', 'Mỗi ngày, một chút.')}</span>
  </section>;
}
