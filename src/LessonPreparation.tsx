import { useRef } from 'react';
import { Clock3, Play, Volume2 } from 'lucide-react';
import { chapters, type Lesson } from './data';
import { speak, useCopy, useNarra } from './state';
import { Modal } from './ui';
import BuddyCoach from './BuddyCoach';
import './buddy-learning.css';
import './lesson-uat.css';

type Phrase = { english: string; vietnamese: string };
type Preparation = { context: [string, string]; mission: [string, string]; learner: [string, string]; tutor: [string, string]; phrases: Phrase[]; vocabulary: { word: string; meaning: [string, string] }[] };

function preparationFor(lesson: Lesson): Preparation {
  const title = lesson.title.toLowerCase();
  if (/usual|café|cafe|coffee/.test(title)) return {
    context: ['A friendly café visit', 'Ghé một quán cà phê thân thiện'], mission: ['Order a drink, ask for a recommendation, and find a place to sit.', 'Gọi đồ uống, hỏi gợi ý và tìm một chỗ ngồi.'], learner: ['A customer', 'Khách hàng'], tutor: ['The café barista', 'Nhân viên quán'],
    phrases: [{ english: 'Could I have a latte, please?', vietnamese: 'Cho tôi một ly latte được không?' }, { english: 'What would you recommend?', vietnamese: 'Bạn có thể gợi ý món nào?' }, { english: 'Is there a table by the window?', vietnamese: 'Có bàn nào gần cửa sổ không?' }], vocabulary: [{ word: 'recommend', meaning: ['to suggest a good choice', 'gợi ý một lựa chọn phù hợp'] }, { word: 'takeaway', meaning: ['a drink or meal to take with you', 'đồ uống hoặc thức ăn mang đi'] }],
  };
  if (/morning|routine|habits|your day|weekend/.test(title)) return {
    context: ['A relaxed chat about your day', 'Trò chuyện thoải mái về ngày của bạn'], mission: ['Share a habit you enjoy, explain why it helps, and ask about your tutor’s routine.', 'Kể về một thói quen bạn thích, giải thích lợi ích và hỏi thói quen của gia sư.'], learner: ['Sharing your everyday routine', 'Chia sẻ thói quen hằng ngày'], tutor: ['A curious friend', 'Một người bạn muốn tìm hiểu'],
    phrases: [{ english: 'I usually start my day with a short walk.', vietnamese: 'Tôi thường bắt đầu ngày mới bằng việc đi bộ một chút.' }, { english: 'It helps me feel ready for the day.', vietnamese: 'Điều đó giúp tôi sẵn sàng cho ngày mới.' }, { english: 'What do you like to do in the morning?', vietnamese: 'Bạn thích làm gì vào buổi sáng?' }], vocabulary: [{ word: 'routine', meaning: ['things you regularly do', 'những việc bạn làm đều đặn'] }, { word: 'unwind', meaning: ['to relax after a busy day', 'thư giãn sau một ngày bận rộn'] }],
  };
  if (/about you|impression|meet the team|new team|first day/.test(title)) return {
    context: ['Meeting someone new', 'Làm quen với một người mới'], mission: ['Introduce yourself, share one interest, and ask a question to get to know each other.', 'Giới thiệu bản thân, kể một sở thích và hỏi để làm quen với nhau.'], learner: ['Introducing yourself', 'Người giới thiệu bản thân'], tutor: ['A new friend or teammate', 'Bạn mới hoặc đồng nghiệp mới'],
    phrases: [{ english: 'Hi, I’m really happy to meet you.', vietnamese: 'Chào bạn, tôi rất vui được gặp bạn.' }, { english: 'In my free time, I enjoy reading.', vietnamese: 'Lúc rảnh, tôi thích đọc sách.' }, { english: 'What do you enjoy doing?', vietnamese: 'Bạn thích làm gì?' }], vocabulary: [{ word: 'interests', meaning: ['things you enjoy learning about or doing', 'những điều bạn thích tìm hiểu hoặc thực hiện'] }, { word: 'currently', meaning: ['at the present time', 'hiện tại, vào lúc này'] }],
  };
  if (/go\?|travel|trip|station|taxi|way|journey|lost and found|adventure/.test(title)) return {
    context: ['A conversation on your next trip', 'Trò chuyện trong chuyến đi tiếp theo'], mission: ['Explain where you want to go, ask for help or a recommendation, and confirm the details.', 'Nói nơi bạn muốn đến, hỏi hướng dẫn hoặc gợi ý và xác nhận thông tin.'], learner: ['A traveller', 'Người đi du lịch'], tutor: ['A friendly local', 'Một người địa phương thân thiện'],
    phrases: [{ english: 'Could you help me find the station?', vietnamese: 'Bạn có thể giúp tôi tìm nhà ga không?' }, { english: 'What would you recommend visiting?', vietnamese: 'Bạn gợi ý tôi nên ghé thăm đâu?' }, { english: 'How long does it take to get there?', vietnamese: 'Đến đó mất bao lâu?' }], vocabulary: [{ word: 'itinerary', meaning: ['a plan for a journey', 'lịch trình của một chuyến đi'] }, { word: 'reservation', meaning: ['an arrangement to keep a place for you', 'việc đặt trước để giữ chỗ'] }],
  };
  const chapter = chapters.find(item => item.lessons.some(item => item.id === lesson.id));
  return {
    context: [chapter?.description ?? 'A short everyday conversation', 'Một cuộc trò chuyện ngắn trong đời sống'], mission: [`Talk about “${lesson.title}”. Share your view, give one example, and ask a follow-up question.`, `Trò chuyện về “${lesson.title}”. Chia sẻ ý kiến, nêu một ví dụ và hỏi thêm để tiếp tục câu chuyện.`], learner: ['Sharing your own experience', 'Chia sẻ trải nghiệm của bạn'], tutor: ['Your conversation partner', 'Người cùng trò chuyện'],
    phrases: [{ english: 'In my experience, it helps to plan ahead.', vietnamese: 'Theo kinh nghiệm của tôi, lên kế hoạch trước rất hữu ích.' }, { english: 'Could you tell me a little more?', vietnamese: 'Bạn có thể kể thêm một chút không?' }, { english: 'What do you think about that?', vietnamese: 'Bạn nghĩ sao về điều đó?' }], vocabulary: [{ word: 'perspective', meaning: ['a way of thinking about something', 'cách nhìn nhận về một vấn đề'] }, { word: 'explain', meaning: ['to make an idea clear', 'giải thích để một ý tưởng dễ hiểu hơn'] }],
  };
}

export default function LessonPreparation({ lesson, onClose, onStart }: { lesson: Lesson; onClose: () => void; onStart: () => void }) {
  const tr = useCopy();
  const { profile, notify } = useNarra();
  const prep = preparationFor(lesson);
  const phrasesRef = useRef<HTMLElement>(null);
  function listen(text: string) { if (!speak(text, profile.tutor === 'Henry' ? 'en-GB' : 'en-US')) notify(tr('Speech playback is unavailable in this browser.', 'Trình duyệt này chưa hỗ trợ phát giọng nói.')); }
  return <Modal title={tr('A little warm-up', 'Mình khởi động một chút nhé')} onClose={onClose}>
    <div className="lesson-preparation"><p className="lesson-prep-optional"><Clock3 size={14} />{tr('15-30 seconds · optional', '15-30 giây · không bắt buộc')}</p><h3 className="lesson-prep-title" lang="en">{lesson.title}</h3><p className="lesson-prep-context">{tr(prep.context[0], prep.context[1])}<span> · {profile.level} · {lesson.minutes} {tr('min', 'phút')}</span></p>
      <section className="lesson-prep-mission"><h4>{tr('Here’s what we’ll try', 'Mình thử tình huống này nhé')}</h4><p>{tr(prep.mission[0], prep.mission[1])}</p><div className="lesson-prep-roles"><span><strong>{tr('You', 'Bạn')}:</strong> {tr(prep.learner[0], prep.learner[1])}</span><span><strong>{profile.tutor}:</strong> {tr(prep.tutor[0], prep.tutor[1])}</span></div></section>
      <div className="lesson-prep-buddy"><BuddyCoach compact title={tr('Let’s try a small start', 'Mình mở lời một chút nhé')} message={tr("Try this opening and change the details so it sounds like you.", "Mình thử câu mở đầu này nhé, bạn đổi chi tiết cho đúng với mình là được.")} tip={tr("Start with one clear sentence about something true for you, then ask a question back so we can build from there.", "Mình bắt đầu bằng một câu rõ ràng về điều đúng với bạn, rồi hỏi lại một câu để cùng nối chuyện nhé.")} phrase={prep.phrases[0]?.english} actionLabel={tr('Explore useful phrases', 'Xem thêm mẫu câu')} onAction={() => { phrasesRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); phrasesRef.current?.focus({ preventScroll: true }); }} mood="guide" /></div>
      <section className="lesson-prep-phrases" ref={phrasesRef} tabIndex={-1}><h4>{tr('A few things you could say', 'Mình có thể nói thế này')}</h4>{prep.phrases.map(phrase => <div className="lesson-prep-phrase" key={phrase.english}><span><strong lang="en">{phrase.english}</strong>{profile.uiLanguage === 'Tiếng Việt' && <small>{phrase.vietnamese}</small>}</span><button aria-label={`${tr('Listen to', 'Nghe câu')}: ${phrase.english}`} onClick={() => listen(phrase.english)}><Volume2 size={19} /></button></div>)}</section>
      <section className="lesson-prep-vocabulary"><h4>{tr('A few useful words', 'Vài từ mình có thể dùng')}</h4><div>{prep.vocabulary.map(item => <p key={item.word}><strong lang="en">{item.word}</strong><span>{tr(item.meaning[0], item.meaning[1])}</span></p>)}</div></section>
      <div className="lesson-prep-actions"><button className="primary-button full-width" onClick={onStart}><Play size={18} fill="currentColor" />{tr('Start speaking', 'Bắt đầu luyện nói')}</button><button className="lesson-prep-skip" onClick={onStart}>{tr('Skip the warm-up', 'Bỏ qua khởi động')}</button></div>
    </div>
  </Modal>;
}
