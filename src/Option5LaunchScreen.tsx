import { useCallback, useEffect, useRef, useState } from 'react';
import { useCopy } from './state';
import { brandAsset } from './brand-variant';
import './option5-launch.css';

export const OPTION5_LAUNCH_DURATION_MS = 3500;
const REVEAL_DURATION_MS = 380;
const SPRITES = '/brand/option5';

function Sparkle({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2c1.5 9.8 4.2 12.5 14 14-9.8 1.5-12.5 4.2-14 14C14.5 20.2 11.8 17.5 2 16 11.8 14.5 14.5 11.8 16 2Z" /></svg>;
}

/** Mount to play or replay. The parent owns variant selection and session flags. */
export default function Option5LaunchScreen({ onDone }: { onDone: () => void }) {
  const tr = useCopy();
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const callback = useRef(onDone); callback.current = onDone;
  const completed = useRef(false);
  const skip = useRef<HTMLButtonElement>(null);
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
    let deadline = performance.now() + (motion.matches ? 400 : OPTION5_LAUNCH_DURATION_MS);
    let leaveTimer: number;
    let doneTimer: number;
    const focusFrame = window.requestAnimationFrame(() => skip.current?.focus({ preventScroll: true }));
    function schedule() {
      window.clearTimeout(leaveTimer); window.clearTimeout(doneTimer);
      const remaining = Math.max(0, deadline - performance.now());
      leaveTimer = window.setTimeout(() => setLeaving(true), Math.max(0, remaining - (motion.matches ? 100 : REVEAL_DURATION_MS)));
      doneTimer = window.setTimeout(finish, remaining);
    }
    function changed() {
      setReducedMotion(motion.matches);
      if (motion.matches) deadline = Math.min(deadline, performance.now() + 400);
      schedule();
    }
    setReducedMotion(motion.matches);
    motion.addEventListener('change', changed); schedule();
    return () => {
      window.clearTimeout(leaveTimer); window.clearTimeout(doneTimer);
      window.cancelAnimationFrame(focusFrame); motion.removeEventListener('change', changed);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [finish]);

  return <section className={`option5-launch ${leaving ? 'is-leaving' : ''}`} data-motion={reducedMotion ? 'reduced' : 'full'} role="dialog" aria-modal="true" aria-label={tr('Welcome to Narra', 'Chào mừng đến với Narra')} onKeyDown={event => {
    if (event.key === 'Tab') { event.preventDefault(); skip.current?.focus({ preventScroll: true }); }
    else if (event.key === 'Escape') { event.preventDefault(); finish(); }
  }}>
    <button ref={skip} className="option5-launch-skip" type="button" onClick={finish}>{tr('Skip intro', 'Bỏ qua giới thiệu')}<span aria-hidden="true">↗</span></button>
    <div className="option5-launch-composition">
      <div className="option5-launch-stage" aria-hidden="true">
        <svg className="option5-launch-trail" viewBox="0 0 640 110" preserveAspectRatio="none"><path d="M38 76C145 103 232 44 340 76S510 104 602 76" /></svg>
        <span className="option5-launch-hello-ring" />
        <Sparkle className="option5-launch-sparkle option5-sparkle-blue" />
        <Sparkle className="option5-launch-sparkle option5-sparkle-purple" />
        <span className="option5-launch-dot" />
        <div className="option5-launch-traveller">
          <span className="option5-launch-shadow" />
          <div className="option5-launch-crawl-pose"><div className="option5-launch-crawl-rock"><img src={`${SPRITES}/crawl.webp`} alt="" width="1024" height="1024" fetchPriority="high" decoding="sync" draggable={false} onError={event => { event.currentTarget.style.visibility = 'hidden'; }} /></div></div>
          <div className="option5-launch-front-pose">
            <img src={`${SPRITES}/excited.webp`} alt="" width="1024" height="1024" fetchPriority="high" decoding="sync" draggable={false} onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
            <img className="option5-launch-wink" src={`${SPRITES}/wink.webp`} alt="" width="1024" height="1024" fetchPriority="high" decoding="sync" draggable={false} onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
          </div>
        </div>
      </div>
      <h1 className="option5-launch-wordmark"><img src={brandAsset('logo-dark.webp')} alt="Narra" width="524" height="121" fetchPriority="high" decoding="sync" draggable={false} /></h1>
      <p className="option5-launch-slogan" lang="en">Your voice, your story</p>
    </div>
    <span className="option5-launch-corner">{tr('One little hello. Then we begin.', 'Chào nhau một chút, rồi mình bắt đầu nhé.')}</span>
  </section>;
}
