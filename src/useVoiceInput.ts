import { useEffect, useRef, useState } from 'react';
import { cancelSpeech, onBeforeSpeech } from './speech';

type SpeechAlternative = { transcript: string; confidence: number };
type SpeechResult = { isFinal: boolean; length: number; [index: number]: SpeechAlternative };
type RecognitionEvent = { resultIndex: number; results: { length: number; [index: number]: SpeechResult } };
type Recognition = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: RecognitionEvent) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; onstart: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
type RecognitionConstructor = new () => Recognition;
export type VoiceTurn = { text: string; seconds: number; words: number };

export function useVoiceInput(onTurn: (turn: VoiceTurn) => void) {
  const [listening, setListening] = useState(false); const [pending, setPending] = useState(false); const [interim, setInterim] = useState(''); const [error, setError] = useState('');
  const recognition = useRef<Recognition | null>(null); const callback = useRef(onTurn); callback.current = onTurn;
  const started = useRef(0); const active = useRef(false); const mounted = useRef(true); const turn = useRef(''); const stopTimer = useRef<number | null>(null);
  const Constructor = (window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;
  const supported = !!Constructor;
  useEffect(() => { mounted.current = true; const unsubscribe = onBeforeSpeech(() => { if (recognition.current || active.current) cancel(); }); return () => { unsubscribe(); mounted.current = false; active.current = false; if (stopTimer.current) clearTimeout(stopTimer.current); const rec = recognition.current; recognition.current = null; if (rec) { rec.onresult = null; rec.onerror = null; rec.onend = null; rec.onstart = null; rec.abort(); } }; }, []);
  function cancel() { active.current = false; turn.current = ''; const rec = recognition.current; recognition.current = null; if (rec) { rec.onstart = null; rec.onresult = null; rec.onerror = null; rec.onend = null; rec.abort(); } setListening(false); setPending(false); setInterim(''); if (stopTimer.current) clearTimeout(stopTimer.current); }
  function stop() { if (active.current) { recognition.current?.stop(); setPending(true); } }
  function start() {
    if (!Constructor) { setError('Speech recognition is unavailable in this browser. Try Chrome or Edge, or use the keyboard option.'); return; }
    if (active.current) { stop(); return; }
    cancelSpeech(); setError(''); setInterim(''); setPending(true); turn.current = ''; active.current = true;
    const previous = recognition.current; if (previous) { previous.onstart = null; previous.onresult = null; previous.onerror = null; previous.onend = null; previous.abort(); }
    const rec = new Constructor(); recognition.current = rec; rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = true;
    rec.onstart = () => { if (!mounted.current || recognition.current !== rec || !active.current) { rec.abort(); return; } started.current = performance.now(); setPending(false); setListening(true); stopTimer.current = window.setTimeout(() => { if (recognition.current === rec && active.current) { setPending(true); rec.stop(); } }, 45000); };
    rec.onresult = event => { if (!mounted.current || recognition.current !== rec || !active.current) return; let final = ''; let partial = ''; for (let i = 0; i < event.results.length; i++) { const text = event.results[i][0]?.transcript ?? ''; if (event.results[i].isFinal) final += `${text} `; else partial += text; } turn.current = final.trim(); setInterim((final + partial).trim()); };
    rec.onerror = event => { if (!mounted.current || recognition.current !== rec || event.error === 'aborted') return; turn.current = ''; active.current = false; setListening(false); setPending(false); if (stopTimer.current) clearTimeout(stopTimer.current); setError(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'Microphone access is blocked. Allow microphone access for Narra in your browser, then try again.' : event.error === 'no-speech' ? 'No speech was heard. Tap the mic and try a short sentence.' : event.error === 'network' ? 'The browser speech service could not connect. Try again when your connection is ready.' : 'We couldn’t hear that turn. Please tap the mic and try again.'); };
    rec.onend = () => { if (!mounted.current || recognition.current !== rec) return; recognition.current = null; if (stopTimer.current) clearTimeout(stopTimer.current); const text = turn.current; const wasActive = active.current; const seconds = Math.max(1, Math.round((performance.now() - started.current) / 1000)); turn.current = ''; active.current = false; setListening(false); setPending(false); setInterim(''); if (text) callback.current({ text, seconds, words: text.split(/\s+/).length }); else if (wasActive) setError('No speech was heard. Tap the mic and try a short sentence.'); };
    try { rec.start(); } catch { active.current = false; setPending(false); setError('Microphone input could not start. Please try again.'); }
  }
  return { supported, listening, pending, interim, error, start, stop, cancel };
}
