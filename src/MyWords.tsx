import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Square, Volume2 } from 'lucide-react';
import { speak, useCopy, useNarra } from './state';
import { Empty } from './ui';
import './subpages.css';
import { useAccounts } from './AccountContext';

type PracticeCounts = Record<string, number>;
export default function MyWords({ onClose }: { onClose: () => void }) {
  const { storageKey } = useAccounts();
  const countsKey = storageKey('narra-word-speaking-v1');
  const { words, setStats, logActivity, notify } = useNarra(); const tr = useCopy();
  const [index, setIndex] = useState(0); const [sentence, setSentence] = useState(false); const [recording, setRecording] = useState(false); const [pending, setPending] = useState(false); const [audio, setAudio] = useState(''); const [error, setError] = useState('');
  const [counts, setCounts] = useState<PracticeCounts>(() => { try { const value = JSON.parse(localStorage.getItem(countsKey) ?? '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v >= 0)) as PracticeCounts : {}; } catch { return {}; } });
  const recorder = useRef<MediaRecorder | null>(null); const stream = useRef<MediaStream | null>(null); const audioRef = useRef<HTMLAudioElement>(null); const url = useRef(''); const generation = useRef(0); const busy = useRef(false); const timer = useRef<number | null>(null); const back = useRef<HTMLButtonElement>(null);
  const word = words[index % Math.max(1, words.length)]; const phrase = word ? sentence && word.example ? word.example : word.word : '';
  useEffect(() => { back.current?.focus({ preventScroll: true }); return () => { generation.current++; if (timer.current !== null) clearTimeout(timer.current); if (recorder.current) { recorder.current.onstop = null; recorder.current.ondataavailable = null; recorder.current.onerror = null; if (recorder.current.state !== 'inactive') recorder.current.stop(); } stream.current?.getTracks().forEach(t => t.stop()); audioRef.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); window.speechSynthesis?.cancel(); }; }, []);
  useEffect(() => { try { localStorage.setItem(countsKey, JSON.stringify(counts)); } catch { /* Practice remains available without storage. */ } }, [counts, countsKey]);
  function clearAudio() { audioRef.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); url.current = ''; setAudio(''); setError(''); window.speechSynthesis?.cancel(); }
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
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError(tr("While this browser cannot record audio, you can still listen to the phrase and practise aloud.", "Trình duyệt chưa hỗ trợ ghi âm, bạn vẫn có thể nghe mẫu và đọc thành tiếng nhé.")); return; }
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
        } else setError(tr("Let’s try another recording, as no audio was captured this time.", "Chưa nghe được bạn rồi, mình thử ghi âm lại nhé?"));
      };
      rec.onerror = () => {
        rec.onstop = null; rec.ondataavailable = null;
        if (rec.state !== 'inactive') rec.stop();
        media.getTracks().forEach(track => track.stop());
        if (generation.current !== request || recorder.current !== rec) return;
        if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
        recorder.current = null; stream.current = null; busy.current = false;
        setRecording(false); setPending(false);
        setError(tr("The recording stopped unexpectedly, so please give it another try.", "Bản ghi vừa bị ngắt, bạn thử lại một lần nữa nhé."));
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
        setError(tr("Allow microphone access in your browser to record, or listen and practise aloud.", "Bạn cho phép trình duyệt dùng mic để ghi âm, hoặc nghe mẫu và đọc thành tiếng nhé."));
        setRecording(false); busy.current = false;
      }
    } finally { if (generation.current === request) setPending(false); }
  }
  return <section className="app-subpage speaking-subpage" aria-label={tr('Say My Words', 'Luyện nói từ đã lưu')}>
    <header className="subpage-header"><button ref={back} className="device-button" aria-label={tr('Back to Dictionary', 'Quay lại Từ vựng')} onClick={onClose}><ArrowLeft size={22} /></button><h1>{tr('Say My Words', 'Luyện nói từ đã lưu')}</h1><span className="subpage-header-spacer" /></header>
    <div className="subpage-content speaking-content"><div className="speaking-intro"><h2>{tr('Let’s make these words feel familiar.', 'Mình tập nói những từ này nhé.')}</h2><p>{tr("Pick a word, hear the example, then have a go and listen back, with no rush to get it perfect.", "Chọn một từ, nghe mẫu rồi thử nói và nghe lại cùng mình nhé, chưa cần hoàn hảo đâu.")}</p></div>
      {!word ? <Empty title={tr('A little vocabulary first', 'Hãy lưu một từ trước nhé')}>{tr('Add a word in Dictionary to start your speaking practice.', 'Thêm từ trong Từ vựng để bắt đầu luyện nói.')}</Empty> : <>
        <div className="segmented" aria-label={tr('Choose what to read', 'Chọn nội dung đọc')}><button className={'segment '+(!sentence ? 'active' : '')} disabled={recording || pending} onClick={() => { clearAudio(); setSentence(false); }}>{tr('The word', 'Từ vựng')}</button><button className={'segment '+(sentence ? 'active' : '')} disabled={recording || pending || !word.example} onClick={() => { clearAudio(); setSentence(true); }}>{tr('Example sentence', 'Câu ví dụ')}</button></div>
        <div className="say-card"><p className="eyebrow">{tr('Say this · Saved words', 'Đọc thành tiếng · Từ đã lưu')}</p><h3>{phrase}</h3><p className="say-definition">{word.definition}</p><div className="say-actions"><button className="pill-button" disabled={recording || pending} onClick={() => { audioRef.current?.pause(); if (!speak(phrase)) notify(tr('Audio playback is unavailable in this browser', 'Trình duyệt chưa hỗ trợ đọc mẫu')); }}><Volume2 size={16} />{tr('Listen', 'Nghe mẫu')}</button><button className="pill-button" disabled={recording || pending} onClick={() => { clearAudio(); setIndex(index => (index + 1) % words.length); }}><ArrowRight size={16} />{tr('Next word', 'Từ tiếp theo')}</button></div></div>
        <div className="word-record-area"><button className={'word-record-button '+(recording ? 'recording' : '')} disabled={pending} onClick={record} aria-label={pending ? tr('Waiting for microphone', 'Đang chờ mic') : recording ? tr('Stop word recording', 'Dừng ghi âm') : tr('Record this word', 'Ghi âm từ này')}>{recording ? <Square size={29} fill="currentColor" /> : <Mic size={36} />}</button><p role="status">{pending ? recording ? tr('Saving your recording…', 'Đang lưu bản ghi…') : tr('Waiting for microphone access…', 'Đang chờ quyền truy cập mic…') : recording ? tr('Recording… tap again to stop', 'Đang ghi âm… bấm lần nữa để dừng') : sentence ? tr('Tap, read the example aloud, then tap again to stop (max 30 s).', 'Bấm mic, đọc câu ví dụ rồi bấm lần nữa để dừng (tối đa 30 giây).') : tr('Tap the mic, say the word, then tap again to stop.', 'Bấm mic, đọc từ rồi bấm lần nữa để dừng.')}</p>{error && <p className="inline-error" role="alert">{error}</p>}{audio && <div className="word-audio"><audio ref={element => { if (element) audioRef.current = element; }} src={audio} controls onPlay={() => window.speechSynthesis?.cancel()} /><p>{tr('Listen to your recording and compare with the example.', "Mình cùng nghe lại xem có âm nào bạn muốn thử thêm một lần không nhé?")}</p></div>}</div>
        <div className="word-practice-summary"><p className="eyebrow">{tr('Your practice with “'+word.word+'”', 'Bạn đã luyện từ “'+word.word+'”')}</p><div className="word-practice-actual"><strong>{counts[word.id] ?? 0}</strong><span>{tr('recorded attempts', 'lượt ghi âm đã hoàn thành')}</span></div><p>{counts[word.id] ? tr('Your completed recordings are counted in your progress.', "Lượt luyện này đã được lưu rồi, mỗi lần bạn cất tiếng đều là một bước tiến đó.") : tr('Record yourself to start tracking this word.', "Sẵn sàng thì bấm mic để mình bắt đầu với một từ thôi nhé.")}</p></div>
        <p className="speaking-privacy">{tr('Your number of tries is saved on this device. Audio is available while this practice screen is open. No pronunciation score is estimated from your recording.', 'Số lượt luyện được lưu trên thiết bị. Bạn có thể nghe bản ghi khi màn luyện tập còn mở. Ứng dụng không tự ước lượng điểm phát âm từ bản ghi.')}</p>
      </>}
    </div>
  </section>;
}
