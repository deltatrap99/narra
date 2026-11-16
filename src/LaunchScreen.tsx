import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useCopy } from './state';
import LaunchMascot from './LaunchMascot';
import './launch-screen.css';

export const LAUNCH_DURATION_MS = 6800;
const REVEAL_DURATION_MS = 380;

/** One shared timeline keeps both friends, the slogan and dismissal in sync. */
export default function LaunchScreen({ onDone, variant = 'option1' }: { onDone: () => void; variant?: 'option1' | 'option5' }) {
  const tr = useCopy();
  const descriptionId = useId();
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const callback = useRef(onDone);
  callback.current = onDone;
  const completed = useRef(false);
  const skipButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    callback.current();
    window.requestAnimationFrame(() => {
      const previous = previousFocus.current;
      const target = previous?.isConnected && previous !== document.body && !previous.closest('[inert]')
        ? previous
        : document.querySelector<HTMLElement>('[data-launch-focus], .lesson-focus-cta, #main button');
      if (target && !target.closest('[inert]')) target.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let deadline = performance.now() + (motion.matches ? 400 : LAUNCH_DURATION_MS);
    let leaveTimer: number;
    let doneTimer: number;
    const focusFrame = window.requestAnimationFrame(() => skipButton.current?.focus({ preventScroll: true }));
    function schedule() {
      window.clearTimeout(leaveTimer); window.clearTimeout(doneTimer);
      const remaining = Math.max(0, deadline - performance.now());
      leaveTimer = window.setTimeout(() => setLeaving(true), Math.max(0, remaining - (motion.matches ? 100 : REVEAL_DURATION_MS)));
      doneTimer = window.setTimeout(finish, remaining);
    }
    function motionChanged() {
      setReducedMotion(motion.matches);
      if (motion.matches) deadline = Math.min(deadline, performance.now() + 400);
      schedule();
    }
    setReducedMotion(motion.matches);
    motion.addEventListener('change', motionChanged);
    schedule();
    return () => {
      window.clearTimeout(leaveTimer); window.clearTimeout(doneTimer);
      window.cancelAnimationFrame(focusFrame);
      motion.removeEventListener('change', motionChanged);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [finish]);

  const logo = variant === 'option5' ? '/brand/option5/logo-dark.svg' : '/brand/logo-dark.webp';
  return <section className={`narra-launch ${leaving ? 'is-leaving' : ''}`} data-variant={variant} data-motion={reducedMotion ? 'reduced' : 'full'} role="dialog" aria-modal="true" aria-label={tr('Welcome to Narra', 'Chào mừng đến với Narra')} aria-describedby={descriptionId} onKeyDown={event => {
    if (event.key === 'Tab') { event.preventDefault(); skipButton.current?.focus({ preventScroll: true }); }
    else if (event.key === 'Escape') { event.preventDefault(); finish(); }
  }}>
    <button ref={skipButton} className="narra-launch-skip" type="button" onClick={finish}>{tr('Skip intro', 'Bỏ qua giới thiệu')}<span aria-hidden="true">↗</span></button>
    <p id={descriptionId} className="narra-launch-description">{tr('Narry tiptoes and looks both ways. A friend in an orange scarf takes Narry’s hand and they run off together.', 'Narry nhón chân rụt rè, nhìn trái rồi nhìn phải. Một người bạn đeo khăn cam chạy đến, nắm tay Narry và cả hai cùng chạy đi.')}</p>
    <div className="narra-launch-composition">
      <div className="launch-story" aria-hidden="true">
        <span className="launch-story-floor" />
        <div className="launch-story-pair">
          <div className="launch-story-actor launch-story-buddy"><span className="launch-story-shadow" /><div className="launch-story-bounce"><LaunchMascot variant={variant} /></div><span className="launch-story-startle">!</span></div>
          <div className="launch-story-actor launch-story-friend"><span className="launch-story-shadow" /><div className="launch-story-bounce"><LaunchMascot variant={variant} friend /></div></div>
          <svg className="launch-story-connection" viewBox="0 0 40 40"><path d="m5 10 5 7M20 3v9m15-2-5 7" /></svg>
          <span className="launch-story-speed launch-story-speed-one" /><span className="launch-story-speed launch-story-speed-two" />
        </div>
      </div>
      <div className="narra-launch-signature">
        <h1 className="narra-launch-wordmark"><img src={logo} alt="Narra" width="524" height="121" fetchPriority="high" decoding="sync" draggable={false} /></h1>
        <p className="narra-launch-tagline" lang="en" translate="no">Your voice, your story</p>
      </div>
    </div>
  </section>;
}
