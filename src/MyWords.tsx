import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Play, Square, Volume2, X } from 'lucide-react';
import { speak, useNarra } from './state';
import { Empty } from './ui';
import './subpages.css';

type PracticeCounts = Record<string, number>;
export default function MyWords({ onClose }: { onClose: () => void }) {
  const { words, setStats, logActivity, notify } = useNarra();
  const [index, setIndex] = useState(0); const [sentence, setSentence] = useState(false); const [recording, setRecording] = useState(false); const [pending, setPending] = useState(false); const [audio, setAudio] = useState(''); const [error, setError] = useState(''); const [sample, setSample] = useState(false);
  const [counts, setCounts] = useState<PracticeCounts>(() => { try { const value = JSON.parse(localStorage.getItem('narra-word-speaking-v1') ?? '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v >= 0)) as PracticeCounts : {}; } catch { return {}; } });
  const recorder = useRef<MediaRecorder | null>(null); const stream = useRef<MediaStream | null>(null); const audioRef = useRef<HTMLAudioElement>(null); const url = useRef(''); const generation = useRef(0); const busy = useRef(false); const timer = useRef<number | null>(null); const back = useRef<HTMLButtonElement>(null);
  const word = words[index % Math.max(1, words.length)]; const phrase = word ? sentence && word.example ? word.example : word.word : '';
  useEffect(() => { back.current?.focus({ preventScroll: true }); return () => { generation.current++; if (timer.current !== null) clearTimeout(timer.current); if (recorder.current) { recorder.current.onstop = null; recorder.current.ondataavailable = null; recorder.current.onerror = null; if (recorder.current.state !== 'inactive') recorder.current.stop(); } stream.current?.getTracks().forEach(t => t.stop()); audioRef.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); window.speechSynthesis?.cancel(); }; }, []);
  useEffect(() => { try { localStorage.setItem('narra-word-speaking-v1', JSON.stringify(counts)); } catch { /* Practice remains available without storage. */ } }, [counts]);
  function clearAudio() { audioRef.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); url.current = ''; setAudio(''); setSample(false); setError(''); window.speechSynthesis?.cancel(); }
  function stopRecording() {
    const active = recorder.current;
    if (!active || active.state !== 'recording') return;
    busy.current = true;
    setPending(true);
    if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
    active.stop();
  }
  async function record() {
    if (busy.current || !word) return;
    if (recording) { stopRecording(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError('This browser cannot record audio. You can still listen to the phrase and practise aloud.'); return; }
    const request = generation.current; busy.current = true; setPending(true); clearAudio();
    let acquired: MediaStream | null = null;
    try {
      acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = acquired;
      if (generation.current !== request) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      const rec = new MediaRecorder(media); const chunks: BlobPart[] = []; const wordId = word.id; const label = word.word;
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        media.getTracks().forEach(track => track.stop());
        if (generation.current !== request || recorder.current !== rec) return;
        if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
        recorder.current = null; stream.current = null;
        setRecording(false); setPending(false); busy.current = false;
        const blob = new Blob(chunks, { type: rec.mimeType });
        if (blob.size) {
          const next = URL.createObjectURL(blob); url.current = next; setAudio(next);
          setCounts(counts => ({ ...counts, [wordId]: (counts[wordId] ?? 0) + 1 }));
          setStats(stats => ({ ...stats, speakingTries: stats.speakingTries + 1 }));
          logActivity(`Say my words · ${label}`, 1);
        } else setError('No audio was captured. Try another recording.');
      };
      rec.onerror = () => {
        rec.onstop = null; rec.ondataavailable = null;
        if (rec.state !== 'inactive') rec.stop();
        media.getTracks().forEach(track => track.stop());
        if (generation.current !== request || recorder.current !== rec) return;
        if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
        recorder.current = null; stream.current = null; busy.current = false;
        setRecording(false); setPending(false);
        setError('Recording stopped unexpectedly. Please try again.');
      };
      recorder.current = rec; rec.start(); setRecording(true); busy.current = false;
      timer.current = window.setTimeout(stopRecording, 30000);
    } catch {
      acquired?.getTracks().forEach(track => track.stop());
      if (generation.current === request) {
        const active = recorder.current;
        if (active) { active.onstop = null; active.ondataavailable = null; active.onerror = null; if (active.state !== 'inactive') active.stop(); }
        recorder.current = null; stream.current = null;
        if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
        setError('Allow microphone access in your browser to record. You can also listen and practise aloud.');
        setRecording(false); busy.current = false;
      }
    } finally { if (generation.current === request) setPending(false); }
  }
  return <section className="app-subpage speaking-subpage" aria-label="My Words pronunciation"><header className="subpage-header"><button ref={back} className="device-button" aria-label="Back to words" onClick={onClose}><ArrowLeft size={22} /></button><h1>My Words</h1><span className="subpage-header-spacer" /></header><div className="subpage-content speaking-content"><div className="speaking-intro"><h2>Say my words</h2><p>Listen, practise, and hear yourself grow. Every try is added to your progress.</p></div>{!word ? <Empty title="A little vocabulary first">Add a word to start your speaking practice.</Empty> : <><div className="segmented"><button className={`segment ${!sentence ? 'active' : ''}`} disabled={recording || pending} onClick={() => { clearAudio(); setSentence(false); }}>The word</button><button className={`segment ${sentence ? 'active' : ''}`} disabled={recording || pending || !word.example} onClick={() => { clearAudio(); setSentence(true); }}>Example sentence</button></div><div className="say-card"><p className="eyebrow">Say this · My words</p><h3>{phrase}</h3><p className="say-definition">{word.definition}</p><div className="say-actions"><button className="pill-button" disabled={recording || pending} onClick={() => { audioRef.current?.pause(); if (!speak(phrase)) notify('Audio playback is unavailable in this browser'); }}><Volume2 size={16} />Listen</button><button className="pill-button" disabled={recording || pending} onClick={() => { clearAudio(); setIndex(i => (i + 1) % words.length); }}><ArrowRight size={16} />Next</button></div></div><div className="word-record-area"><button className={`word-record-button ${recording ? 'recording' : ''}`} disabled={pending} onClick={record} aria-label={recording ? 'Stop word recording' : pending ? 'Waiting for microphone' : 'Record this word'}>{recording ? <Square size={29} fill="currentColor" /> : <Mic size={36} />}</button><p>{pending ? recording ? 'Saving your recording…' : 'Waiting for microphone access…' : recording ? 'Recording… tap again to stop' : sentence ? 'Tap, read the example aloud, tap again (max 30 s)' : 'Tap, say the word, tap again'}</p>{error && <p className="inline-error" role="alert">{error}</p>}{audio && <div className="word-audio"><audio ref={element => { if (element) audioRef.current = element; }} src={audio} controls onPlay={() => window.speechSynthesis?.cancel()} /><p>Your recording stays on this device. Listen and compare with the example.</p></div>}</div><div className="word-practice-summary"><p className="eyebrow">Your practice with “{word.word}”</p><div><span><strong>{counts[word.id] ?? 0}</strong>Tries</span><span><strong>—</strong>Best</span><span><strong>—</strong>Last</span></div><p>{counts[word.id] ? 'Every little try is a step forward.' : 'Record yourself to start tracking this word.'}</p></div><button className="sample-feedback-button" onClick={() => setSample(s => !s)}>{sample ? 'Hide example feedback' : 'Preview example feedback'}<ArrowRight size={15} /></button>{sample && <section className="speech-feedback card"><div className="speech-feedback-head"><strong>76</strong><span>/100 · about C1</span><span className="sample-badge">Sample</span></div><div className="speech-score-grid"><span><strong>59</strong>Pronunciation</span><span><strong>91</strong>Fluency</span><span><strong>78</strong>Reading</span></div><p>Read 89% · accurate 67% · 213 words/min</p><div className="speech-word-chips">{'Thank you for the helpful feedback'.split(' ').map((w, i) => <span className={['orange', 'pink', 'orange', 'green', 'pink', 'green'][i]} key={`${w}-${i}`}>{w}</span>)}</div><p>You said: “Thank you for the half phone feedback.”</p><ul><li>“you” sounded like /ɪ/ instead of /juː/. Focus on /j/.</li><li>“helpful” sounded like “half”. Focus on /ɛ/.</li><li>You read quite fast. Slow down so each word has room.</li></ul><p className="preview-note">Example feedback recreated from the reference video. Live speech scoring is not connected; this sample is not an assessment of your recording.</p></section>}<p className="speaking-privacy">Your voice, your pace. Recordings are local; speech scoring needs a connected service.</p></>}</div></section>;
}
