import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff } from 'lucide-react';
import { PersonalAvatar } from './PlayerExtras';
import { useCopy } from './state';

export default function CallCamera() {
  const tr=useCopy(); const video=useRef<HTMLVideoElement>(null); const stream=useRef<MediaStream|null>(null);
  const generation=useRef(0);const alive=useRef(true);const [enabled,setEnabled]=useState(false);const [pending,setPending]=useState(false);const [error,setError]=useState('');
  function stop() {generation.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(video.current)video.current.srcObject=null;setEnabled(false);setPending(false);}
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;generation.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;};},[]);
  async function toggle(){if(enabled||pending){stop();return;}const own=++generation.current;setPending(true);setError('');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:480},height:{ideal:640}},audio:false});if(!alive.current||own!==generation.current){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;setEnabled(true);setPending(false);requestAnimationFrame(()=>{if(video.current&&own===generation.current){video.current.srcObject=media;void video.current.play().catch(()=>{});}});}catch{if(alive.current&&own===generation.current){setPending(false);setError(tr("You can keep speaking while the camera is unavailable.","Chưa mở được camera, bạn vẫn luyện nói bình thường nhé."));}}}
  return <div className="learner-pip"><div className="learner-pip-media">{enabled?<video ref={video} autoPlay playsInline muted aria-label={tr('Your camera preview','Hình ảnh camera của bạn')}/>:<PersonalAvatar/>}</div><span className="learner-pip-label">{tr('You','Bạn')}</span><span className="learner-pip-caption">{enabled?tr('Camera on','Camera đang bật'):pending?tr('Opening…','Đang mở…'):tr('Camera off','Camera đang tắt')}</span><button className="learner-pip-camera" type="button" onClick={toggle} aria-label={enabled?tr('Turn camera off','Tắt camera'):pending?tr('Cancel opening camera','Hủy mở camera'):tr('Turn your camera on','Bật camera của bạn')} title={enabled?tr('Camera off','Tắt camera'):tr('Camera on','Bật camera')}>{enabled?<Video size={16}/>:<VideoOff size={16}/>}</button>{error&&<span className="learner-pip-error" role="status">{error}</span>}</div>;
}
