import { useSyncExternalStore } from 'react';

export type SpeechLocale = 'en-US' | 'en-GB';
export type SpeechPlayback = Readonly<{
  id: number;
  status: 'idle' | 'queued' | 'speaking' | 'paused' | 'error';
  text: string;
  locale: SpeechLocale;
  owner: string | null;
  charIndex: number;
  charLength: number;
  boundaryAt: number;
  error: string | null;
}>;

const INITIAL: SpeechPlayback = Object.freeze({ id: 0, status: 'idle', text: '', locale: 'en-US', owner: null, charIndex: 0, charLength: 0, boundaryAt: 0, error: null });
let snapshot = INITIAL;
let generation = 0;
type ActiveSpeech = { id: number; owner: string | null; utterance: SpeechSynthesisUtterance; synthesis: SpeechSynthesis; started: boolean };
let active: ActiveSpeech | null = null;
let startTimer: ReturnType<typeof setTimeout> | null = null;
let playbackTimer: ReturnType<typeof setTimeout> | null = null;
let engineTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
const beforePlayListeners = new Set<() => void>();

function publish(next: SpeechPlayback) {
  if (Object.keys(next).every(key => next[key as keyof SpeechPlayback] === snapshot[key as keyof SpeechPlayback])) return;
  snapshot = Object.freeze(next);
  for (const listener of [...listeners]) listener();
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function getSpeechSnapshot() { return snapshot; }
function getServerSnapshot() { return INITIAL; }
export function useSpeechPlayback() { return useSyncExternalStore(subscribe, getSpeechSnapshot, getServerSnapshot); }

/** Called synchronously before audio is queued, so an active microphone can be
 * aborted before it has an opportunity to recognise the tutor's own voice. */
export function onBeforeSpeech(listener: () => void) { beforePlayListeners.add(listener); return () => { beforePlayListeners.delete(listener); }; }

function clearTimers() {
  if (startTimer !== null) clearTimeout(startTimer);
  if (playbackTimer !== null) clearTimeout(playbackTimer);
  if (engineTimer !== null) clearInterval(engineTimer);
  startTimer = null; playbackTimer = null; engineTimer = null;
}
function detach(utterance: SpeechSynthesisUtterance) {
  utterance.onstart = null; utterance.onend = null; utterance.onerror = null;
  utterance.onboundary = null; utterance.onpause = null; utterance.onresume = null;
}
function synthesisAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

/** Owner-scoped cleanup never cancels a newer utterance owned by another view. */
export function cancelSpeech(owner?: string) {
  if (owner !== undefined && (active?.owner ?? snapshot.owner) !== owner) return;
  const previous = active;
  active = null;
  generation++;
  clearTimers();
  if (previous) detach(previous.utterance);
  try {
    if (previous) previous.synthesis.cancel();
    else if (synthesisAvailable()) window.speechSynthesis.cancel();
  } catch { /* State is already idle even when a browser voice engine fails. */ }
  publish({ ...INITIAL, id: generation });
}

/** `true` means accepted into the browser queue; only an actual start event
 * changes playback to speaking. Existing speak(text, locale) callers still work. */
export function speak(text: string, locale: SpeechLocale = 'en-US', owner?: string): boolean {
  if (!text.trim()) return false;
  cancelSpeech();
  if (!synthesisAvailable()) {
    publish({ ...INITIAL, id: generation, status: 'error', error: 'unavailable' });
    return false;
  }
  for (const listener of [...beforePlayListeners]) {
    try { listener(); } catch { /* One subscriber must not prevent other microphones from stopping. */ }
  }
  const synthesis = window.speechSynthesis;
  let utterance: SpeechSynthesisUtterance;
  try { utterance = new window.SpeechSynthesisUtterance(text); }
  catch { publish({ ...INITIAL, id: generation, status: 'error', error: 'unavailable' }); return false; }
  const current: ActiveSpeech = { id: ++generation, owner: owner ?? null, utterance, synthesis, started: false };
  active = current;
  utterance.lang = locale;
  utterance.rate = .96;
  try {
    const voices = synthesis.getVoices().filter(voice => voice.lang.replace('_', '-').toLowerCase() === locale.toLowerCase());
    const tutor = owner?.split(':').at(-1);
    const preferred: Record<string, RegExp> = { Skye: /jenny|samantha|ava|victoria/i, Camila: /aria|zira|allison|susan/i, Henry: /daniel|george|ryan|thomas/i, Dwayne: /guy|david|eric|alex|aaron/i };
    const preference = tutor ? preferred[tutor] : undefined;
    utterance.voice = (preference && voices.find(voice => preference.test(voice.name))) || voices.find(voice => /natural|online|google|samantha|aria|jenny|daniel|libby|ryan|sonia/i.test(voice.name)) || voices[0] || null;
  } catch { /* The locale remains available even before the browser has loaded its voices. */ }
  const isCurrent = () => active === current && generation === current.id;
  function settle(status: 'idle' | 'error', error: string | null = null, stopEngine = false) {
    if (!isCurrent()) return;
    active = null;
    clearTimers();
    detach(utterance);
    if (stopEngine) { try { synthesis.cancel(); } catch { /* Playback state has already settled. */ } }
    publish({ ...snapshot, status, error, charIndex: status === 'idle' ? text.length : snapshot.charIndex, charLength: 0 });
  }
  utterance.onstart = () => {
    if (!isCurrent()) return;
    current.started = true;
    if (startTimer !== null) clearTimeout(startTimer);
    startTimer = null;
    publish({ ...snapshot, status: 'speaking', error: null });
    // Browser engine state is a fallback for a missing end callback, never a
    // guessed speech duration or a message-dependent animation flag.
    let stoppedTicks = 0;
    engineTimer = setInterval(() => {
      if (!isCurrent()) return;
      if (!synthesis.speaking && !synthesis.pending && !synthesis.paused) stoppedTicks++;
      else stoppedTicks = 0;
      if (stoppedTicks >= 3) settle('idle');
    }, 250);
    playbackTimer = setTimeout(() => settle('error', 'playback-timeout', true), Math.min(15 * 60000, Math.max(60000, text.length * 200)));
  };
  utterance.onend = () => settle('idle');
  utterance.onerror = event => {
    if (!isCurrent()) return;
    const canceled = event.error === 'canceled' || event.error === 'interrupted';
    settle(canceled ? 'idle' : 'error', canceled ? null : event.error);
  };
  utterance.onpause = () => { if (isCurrent() && current.started) publish({ ...snapshot, status: 'paused' }); };
  utterance.onresume = () => { if (isCurrent() && current.started) publish({ ...snapshot, status: 'speaking' }); };
  utterance.onboundary = event => {
    if (!isCurrent() || !current.started) return;
    publish({ ...snapshot, charIndex: Math.min(text.length, Math.max(0, event.charIndex)), charLength: Math.max(0, event.charLength || 0), boundaryAt: performance.now() });
  };
  publish({ id: current.id, status: 'queued', text, locale, owner: current.owner, charIndex: 0, charLength: 0, boundaryAt: 0, error: null });
  startTimer = setTimeout(() => { if (isCurrent() && !current.started) settle('error', 'start-timeout', true); }, 5000);
  try {
    // Some browsers retain a paused global engine after cancellation.
    if (synthesis.paused) synthesis.resume();
    synthesis.speak(utterance);
    return true;
  } catch {
    settle('error', 'engine-error', true);
    return false;
  }
}
