import { Component, Suspense, lazy, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { tutors } from './data';
import { cancelSpeech, speak, useCopy, useNarra } from './state';
import { useSpeechPlayback } from './speech';
import { Avatar } from './ui';
import './tutor-spotlight.css';

const TutorAvatar = lazy(()=>import('./TutorAvatar'));
const greetings: Record<string,string> = {
  Skye: 'Hey, I’m Skye! I’m happy you’re here. Bring one little story from your day, and we’ll turn it into a friendly conversation. Ready to begin?',
  Henry: 'Hello, I’m Henry! Lovely to meet you. Got a story or a curious question? Let’s explore it together and find your next English phrase.',
  Camila: 'Hi, I’m Camila! Take a breath and make yourself comfortable. We can start with one little moment from your day. I’m here to listen.',
  Dwayne: 'Hey, I’m Dwayne! Let’s get you ready for your next conversation. One clear idea, one confident sentence, and one little step forward. Shall we begin?',
};
const support: Record<string,[string,string]> = {
  Skye: ['A little encouragement, and plenty of room to be you.','Skye rủ bạn kể một chuyện nhỏ trong ngày. Cứ thử một câu trước nhé.'],
  Henry: ['Bring your curiosity. Henry is ready for a good story.','Henry muốn nghe câu chuyện hoặc một câu hỏi thú vị của bạn. Mình cứ tò mò một chút nhé.'],
  Camila: ['A calmer conversation, at a pace that feels like yours.','Camila mời bạn thả lỏng rồi kể một khoảnh khắc nhỏ trong ngày. Không cần vội đâu.'],
  Dwayne: ['A clear first sentence. Then we’ll build from there.','Cùng Dwayne bắt đầu bằng một ý rõ ràng, rồi mình thử nói tiếp từng chút một nhé.'],
};

class AvatarPreviewBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void },{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onError();}
  render(){return this.state.failed?this.props.fallback:this.props.children;}
}

export default function TutorPreview({ name, onClose, onTalk }: { name: string; onClose: () => void; onTalk: () => void }) {
  const tutor=tutors.find(item=>item.name===name)??tutors[0]; const tr=useCopy(); const {profile}=useNarra();
  const playback=useSpeechPlayback(); const owner='tutor-demo:'+tutor.name; const text=greetings[tutor.name]??greetings.Skye; const locale=tutor.name==='Henry'?'en-GB':'en-US';
  const [ready,setReady]=useState(false); const [modelError,setModelError]=useState(false); const [attempt,setAttempt]=useState(0); const [notice,setNotice]=useState('');
  const autoPlayed=useRef(false); const back=useRef<HTMLButtonElement>(null); const dialog=useRef<HTMLDialogElement>(null); const titleId=useId();
  const owned=playback.owner===owner; const speaking=owned&&playback.status==='speaking'; const queued=owned&&playback.status==='queued'; const paused=owned&&playback.status==='paused'; const audioError=owned&&playback.status==='error';
  const play=useCallback(()=>{setNotice('');if(!speak(text,locale,owner))setNotice(tr('This browser can’t play the greeting just yet. You can still read it below.','Trình duyệt chưa phát được lời chào. Bạn vẫn có thể đọc câu mẫu bên dưới nhé.'));},[text,locale,owner,tr]);
  const playRef=useRef(play); playRef.current=play;
  const modelReady=useCallback(()=>setReady(true),[]);
  const modelFailed=useCallback(()=>{setModelError(true);cancelSpeech(owner);},[owner]);
  useEffect(()=>{
    const modal=dialog.current; const previous=document.activeElement as HTMLElement|null;
    const bodyOverflow=document.body.style.overflow; const rootOverflow=document.documentElement.style.overflow;
    if(modal&&!modal.open)modal.showModal();
    document.body.style.overflow='hidden'; document.documentElement.style.overflow='hidden';
    back.current?.focus({preventScroll:true});
    return()=>{
      cancelSpeech(owner); modal?.close();
      document.body.style.overflow=bodyOverflow; document.documentElement.style.overflow=rootOverflow;
      requestAnimationFrame(()=>{if(previous?.isConnected&&previous!==document.body&&!previous.closest('[inert]'))previous.focus({preventScroll:true});});
    };
  },[owner]);
  useEffect(()=>{if(!ready||autoPlayed.current)return;const timer=window.setTimeout(()=>{autoPlayed.current=true;playRef.current();},150);return()=>clearTimeout(timer);},[ready,owner]);
  function retryModel(){cancelSpeech(owner);setReady(false);setModelError(false);autoPlayed.current=false;setAttempt(value=>value+1);}
  const fallback=<div className="tutor-preview-fallback"><Avatar name={tutor.name}/><p>{tr('The 3D stage couldn’t open this time. You can still hear the greeting.','Khung 3D chưa mở được lần này. Mình vẫn có thể nghe lời chào nhé.')}</p><button type="button" onClick={retryModel}><RotateCcw size={16}/>{tr('Try the 3D stage again','Thử mở lại khung 3D')}</button></div>;
  return <dialog ref={dialog} className={'tutor-preview-page tutor-preview-'+tutor.id} aria-labelledby={titleId} onCancel={event=>{event.preventDefault();onClose();}}>
    <header className="tutor-preview-header"><button ref={back} type="button" onClick={onClose} aria-label={tr('Back without changing tutor','Quay lại, giữ nguyên gia sư đã chọn')}><ArrowLeft size={22}/></button><h1 id={titleId}>{tr('Meet '+tutor.name,'Làm quen với '+tutor.name)}</h1><span>{tr('A little hello','Một lời chào nhỏ')}</span></header>
    <div className="tutor-preview-layout"><div className="tutor-preview-stage"><div className="tutor-preview-stage-label"><span className={speaking?'is-speaking':''}/>{speaking?tr(tutor.name+' is saying hello',tutor.name+' đang chào bạn nè'):queued?tr('Getting the voice ready…','Đang chuẩn bị giọng nói…'):ready?tr('Ready when you are','Sẵn sàng khi bạn muốn nghe'):modelError?tr('You can still listen','Bạn vẫn có thể nghe lời chào'):tr('Getting '+tutor.name+' ready…','Đang chuẩn bị cho '+tutor.name+'…')}</div><div className="tutor-preview-model">{modelError?fallback:<AvatarPreviewBoundary key={tutor.name+'-'+attempt} fallback={fallback} onError={modelFailed}><Suspense fallback={<div className="tutor-preview-loading" role="status"><LoaderCircle size={28}/><p>{tr('Your companion is on the way…','Người bạn đồng hành đang đến nè…')}</p></div>}><TutorAvatar key={tutor.name+'-'+attempt} tutor={tutor.name} mode={speaking?'speaking':'idle'} speech={owned?playback:undefined} greeting onReady={modelReady} onError={modelFailed}/></Suspense></AvatarPreviewBoundary>}</div><div className="tutor-preview-nameplate"><strong>{tutor.name}</strong><span>{tr(tutor.accent,tutor.id==='henry'?'Tiếng Anh, giọng Anh':'Tiếng Anh, giọng Mỹ')}</span></div></div>
      <div className="tutor-preview-quick-actions"><div className="tutor-preview-action-row"><button type="button" className="tutor-preview-replay" disabled={(!ready&&!modelError)||queued} onClick={speaking||paused?()=>cancelSpeech(owner):play}>{speaking||paused?<><Pause size={18}/>{tr('Stop greeting','Dừng lời chào')}</>:<><Volume2 size={18}/>{tr('Hear greeting','Nghe lời chào')}</>}</button><button type="button" className="tutor-preview-talk primary-button" aria-label={tr('Talk with '+tutor.name,'Trò chuyện cùng '+tutor.name)} onClick={()=>{cancelSpeech(owner);onTalk();}}><span>{tr('Let’s talk','Mình trò chuyện nhé')}</span><ArrowRight size={19}/></button></div><p className="tutor-preview-audio-note">{tr('Browser voice, a short hello. Replay any time.','Lời chào bằng giọng trình duyệt. Bạn nghe lại lúc nào cũng được nhé.')}</p>{(notice||audioError)&&<p className="tutor-preview-notice" role="status">{notice||tr('The voice didn’t start this time. Tap Hear greeting to try again.','Giọng đọc chưa bật lần này. Bạn chạm Nghe lời chào để thử lại nhé.')}</p>}<p className="tutor-preview-choice-note">{profile.tutor===tutor.name?<><Check size={14}/>{tr(tutor.name+' is already your companion.',tutor.name+' đang đồng hành cùng bạn rồi nè.')}</>:tr('Have a listen first. Choose Let’s talk when you’re ready.','Bạn cứ nghe thử nhé. Khi sẵn sàng, mình chọn Trò chuyện để bắt đầu.')}</p></div>
      <div className="tutor-preview-copy"><span className="tutor-preview-eyebrow">{tr('SAY HELLO TO YOUR NEXT CONVERSATION','LÀM QUEN TRƯỚC KHI MÌNH TRÒ CHUYỆN')}</span><h2>{tr('A friendly face.\nA voice you can try.','Một gương mặt thân quen.\nMình nghe thử nhé?')}</h2><p>{tr(support[tutor.name]?.[0]??support.Skye[0],support[tutor.name]?.[1]??support.Skye[1])}</p><div className="tutor-preview-script"><div><Volume2 size={17}/><span>{tr(tutor.name+'’s greeting', 'Lời chào của '+tutor.name)}</span>{speaking&&<span className="tutor-preview-speaking-wave" aria-label={tr('Speaking','Đang nói')}><i/><i/><i/></span>}</div><p lang="en">“{text}”</p></div><p className="tutor-preview-demo-note">{tr('A 3D greeting with browser audio. Conversation practice uses sample replies.','Lời chào 3D với âm thanh trình duyệt. Nội dung luyện trò chuyện sử dụng câu trả lời mẫu.')}</p></div>
    </div>
  </dialog>;
}
