export type TranscriptMessage = { id: string; role: 'tutor' | 'user'; text: string; translation?: string; voiceSeconds?: number };
export type SavedSession = { id: string; title: string; tutor: string; completedAt: string; minutes: number; messages: TranscriptMessage[] };
export type Bilingual = { en: string; vi: string };
export type Edit = { start: number; end: number; before: string; after: string; explanation: Bilingual };

// These small, explicit examples support the UI demo. They are not a language assessment.
const patterns: { pattern: RegExp; replacement: string; explanation: Bilingual }[] = [
  { pattern: /\bwant order\b/gi, replacement: 'want to order', explanation: { en: 'Use “want to” before a verb. For a polite request, try “I’d like to order…”.', vi: 'Sau “want” cần “to” trước động từ. Khi gọi món, thử “I’d like to order…” để lịch sự hơn.' } },
  { pattern: /\bhelp me how to\b/gi, replacement: 'help me learn how to', explanation: { en: '“Help me learn how to” makes the action you want help with explicit.', vi: 'Dùng “help me learn how to” để nói rõ bạn muốn được giúp học cách làm gì.' } },
  { pattern: /\blearn more about another thing\b/gi, replacement: 'learn about other things', explanation: { en: 'Use “other things” when you mean several additional topics.', vi: 'Nếu muốn nói tới nhiều chủ đề khác, dùng “other things”.' } },
  { pattern: /\bI am agree\b/gi, replacement: 'I agree', explanation: { en: '“Agree” is already a verb, so it does not take “am” here.', vi: '“Agree” đã là động từ nên không thêm “am” ở đây.' } },
  { pattern: /\bmore better\b/gi, replacement: 'better', explanation: { en: '“Better” is already comparative; it does not need “more”.', vi: '“Better” đã mang nghĩa so sánh hơn, không cần thêm “more”.' } },
  { pattern: /\bdiscuss about\b/gi, replacement: 'discuss', explanation: { en: '“Discuss” takes the topic directly, without “about”.', vi: 'Sau “discuss” dùng thẳng chủ đề, không cần “about”.' } },
  { pattern: /\bgo to home\b/gi, replacement: 'go home', explanation: { en: 'In “go home”, “home” does not take “to”.', vi: 'Với cụm “go home”, không dùng “to” trước “home”.' } },
  { pattern: /\bchanped\b/gi, replacement: 'changed', explanation: { en: 'The spelling is “changed”. A transcript may also contain a recognition error.', vi: 'Từ đúng là “changed”. Lỗi trong bản chép cũng có thể đến từ nhận dạng giọng nói.' } },
];

export function exampleEdits(text: string): Edit[] {
  const edits: Edit[] = [];
  for (const rule of patterns) {
    for (const match of text.matchAll(new RegExp(rule.pattern))) {
      const start = match.index!; const end = start + match[0].length;
      if (!edits.some(edit => start < edit.end && end > edit.start)) edits.push({ start, end, before: match[0], after: rule.replacement, explanation: rule.explanation });
    }
  }
  return edits.sort((a, b) => a.start - b.start);
}

export function correctedExample(text: string, edits = exampleEdits(text)) {
  let result = ''; let cursor = 0;
  for (const edit of edits) { result += text.slice(cursor, edit.start) + edit.after; cursor = edit.end; }
  return result + text.slice(cursor);
}

export const demoTranscript: TranscriptMessage[] = [
  { id: 'demo-1', role: 'tutor', text: 'What would you like to work on next?', translation: 'Tiếp theo, bạn muốn luyện thêm điều gì?' },
  { id: 'demo-2', role: 'user', text: 'Yes, I think this lesson was very useful for me, but I want to learn more about another thing. I want to talk about my daily routine. I think you should help me how to talk about my daily routines more naturally.' },
  { id: 'demo-3', role: 'tutor', text: 'Of course! Tell me about a typical morning. What do you do first?', translation: 'Tất nhiên rồi! Kể tớ nghe về một buổi sáng thường ngày nhé. Bạn làm gì đầu tiên?' },
  { id: 'demo-4', role: 'user', text: 'I usually get up at seven, have breakfast and go to work. What about you?' },
];

export const naturalExamples = [
  { before: 'I want to talk about my daily routine.', after: 'I’d love to walk you through a typical day.', why: { en: '“Walk someone through” means to explain something step by step. Use it when giving a little detail.', vi: '“Walk someone through” là kể hoặc hướng dẫn từng bước. Hợp khi bạn muốn chia sẻ vài chi tiết về một ngày của mình.' } },
  { before: 'The weather was very good.', after: 'It was a lovely, crisp morning.', why: { en: '“Crisp” describes cool, fresh weather. Use it only when that matches the weather you mean.', vi: '“Crisp” miêu tả tiết trời mát và trong lành. Chỉ dùng khi đúng với thời tiết bạn muốn kể nhé.' } },
  { before: 'I want a coffee.', after: 'Could I have a coffee, please?', why: { en: 'A friendly, polite request for a café. It is a change of tone, not a grammar correction.', vi: 'Lời gọi món nhẹ nhàng, lịch sự ở quán cà phê. Đây là đổi sắc thái, không phải sửa lỗi ngữ pháp.' } },
];
export const vocabularyUpgrades = [
  { word: 'unwind', from: 'relax', definition: 'to relax after a busy or stressful time', example: 'I unwind with a short walk after work.', tip: { en: 'Try “unwind after work” when talking about your evening routine.', vi: 'Ghép “unwind after work” khi kể cách bạn thư giãn buổi tối.' } },
  { word: 'make the most of', from: 'use well', definition: 'to use an opportunity or time as well as possible', example: 'I try to make the most of my mornings.', tip: { en: 'Learn the whole phrase, then swap “my mornings” for “the weekend”.', vi: 'Nhớ cả cụm rồi thay “my mornings” bằng “the weekend” để thử ngữ cảnh mới.' } },
  { word: 'get into the habit of', from: 'start doing regularly', definition: 'to begin doing something regularly', example: 'I’m getting into the habit of speaking English every day.', tip: { en: 'Follow “of” with an -ing form: speaking, reading or walking.', vi: 'Sau “of” dùng động từ -ing: speaking, reading hoặc walking.' } },
];

export function restoreSessions(value: unknown): SavedSession[] {
  if (!Array.isArray(value)) return [];
  return value.filter((session): session is SavedSession => {
    if (!session || typeof session !== 'object') return false;
    if (!['id', 'title', 'tutor', 'completedAt'].every(key => typeof session[key] === 'string') || !Number.isFinite(Date.parse(session.completedAt)) || !Number.isFinite(session.minutes) || session.minutes < 0) return false;
    return Array.isArray(session.messages) && session.messages.some((message: TranscriptMessage) => message?.role === 'user') && session.messages.length > 0 && session.messages.length <= 1000 && session.messages.every((message: TranscriptMessage) => message && typeof message.id === 'string' && ['tutor', 'user'].includes(message.role) && typeof message.text === 'string' && message.text.length <= 5000 && (message.translation === undefined || (typeof message.translation === 'string' && message.translation.length <= 5000)) && (message.voiceSeconds === undefined || (Number.isFinite(message.voiceSeconds) && message.voiceSeconds >= 0)));
  }).slice(0, 20).map(session => ({
    id: session.id, title: session.title, tutor: session.tutor, completedAt: session.completedAt, minutes: session.minutes,
    messages: session.messages.map(message => ({ id: message.id, role: message.role, text: message.text, ...(message.translation === undefined ? {} : { translation: message.translation }), ...(message.voiceSeconds === undefined ? {} : { voiceSeconds: message.voiceSeconds }) })),
  }));
}
