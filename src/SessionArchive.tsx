import { useState } from 'react';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { useCopy, useNarra } from './state';
import { Modal } from './ui';
import ConversationReview from './ConversationReview';

export default function SessionArchive({ onClose }: { onClose: () => void }) {
  const { sessions, profile } = useNarra(); const tr = useCopy();
  const [selected, setSelected] = useState<string | null>(null);
  const session = sessions.find(item => item.id === selected);
  return <Modal wide title={session?.title ?? tr('Saved conversations', 'Hội thoại đã lưu')} onClose={onClose}>
    {session ? <div className="saved-session-view"><ConversationReview messages={session.messages} tutor={session.tutor} minutes={session.minutes} saved onContinue={() => setSelected(null)}/></div> : <><p className="dialog-description">{tr('Your latest 20 sessions are kept on this device, for this account. Demo scores do not affect your progress.', '20 buổi gần nhất được giữ trên thiết bị này, theo từng tài khoản. Điểm demo không ảnh hưởng tiến độ của bạn.')}</p><div className="session-archive-list">{sessions.length ? sessions.map(item => <button type="button" key={item.id} onClick={() => setSelected(item.id)}><MessageCircle size={20}/><span><strong>{item.title}</strong><small>{new Date(item.completedAt).toLocaleDateString(profile.uiLanguage === 'Tiếng Việt' ? 'vi-VN' : 'en-GB')} · {item.minutes} {tr('min', 'phút')} · {item.messages.filter(message => message.role === 'user').length} {tr(item.messages.filter(message => message.role === 'user').length === 1 ? 'reply' : 'replies', 'lượt trả lời')}</small></span><ChevronRight size={18}/></button>) : <p className="dialog-description">{tr('Finish a conversation with Narry and save it here. Your first story is waiting!', 'Kết thúc hội thoại cùng Narry rồi chọn Lưu & hoàn thành nhé. Tớ chờ câu chuyện đầu tiên của bạn nè!')}</p>}</div></>}
  </Modal>;
}
