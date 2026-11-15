export type ChallengeDuration = 30 | 60;
export type ChallengePrompt = {
  id: string; title: string; titleVi: string; prompt: string; promptVi: string;
  starter: string; task: string; taskVi: string;
};
export const challengePrompts: ChallengePrompt[] = [
  { id: 'small-joy', title: 'A little thing, a good day', titleVi: 'Một niềm vui nho nhỏ', prompt: 'Tell your friend about one small thing that made your day better. What happened, and why did it matter to you?', promptVi: 'Kể cho bạn nghe một điều nhỏ khiến ngày của bạn dễ chịu hơn. Chuyện gì đã xảy ra, và vì sao điều đó có ý nghĩa với bạn?', starter: 'One little thing that made me smile was…', task: 'Describe the moment and explain why you liked it.', taskVi: 'Kể lại khoảnh khắc đó và vì sao bạn thích nó.' },
  { id: 'weekend', title: 'Your ideal weekend', titleVi: 'Cuối tuần trong mơ', prompt: 'You have a free weekend. Where would you go, who would you go with, and what would you do?', promptVi: 'Bạn có một cuối tuần rảnh rỗi. Bạn muốn đi đâu, đi cùng ai và làm gì?', starter: 'If I had a free weekend, I would…', task: 'Share a plan, a companion, and one reason for your choice.', taskVi: 'Nói về kế hoạch, người đồng hành và một lý do bạn chọn như vậy.' },
  { id: 'recommend', title: 'You should try this', titleVi: 'Bạn thử cái này nhé', prompt: 'Recommend a food, a place, a book, or a film to your friend. What makes it worth trying?', promptVi: 'Gợi ý cho bạn một món ăn, địa điểm, cuốn sách hoặc bộ phim. Điều gì khiến nó đáng để thử?', starter: 'Something I think you would enjoy is…', task: 'Give a recommendation and support it with a detail.', taskVi: 'Đưa ra một gợi ý và kể thêm một chi tiết để thuyết phục bạn.' },
  { id: 'habit', title: 'One habit, a little change', titleVi: 'Một thói quen, một thay đổi nhỏ', prompt: 'Talk about one habit you would like to build. Why would it help, and how could you start?', promptVi: 'Nói về một thói quen bạn muốn xây dựng. Nó sẽ giúp ích gì, và bạn có thể bắt đầu như thế nào?', starter: 'A habit I would like to build is…', task: 'Describe a habit, a benefit, and your first small step.', taskVi: 'Nói về thói quen, lợi ích và bước nhỏ đầu tiên của bạn.' },
];
export function challengeTarget(duration: ChallengeDuration) { return duration === 30 ? 20 : 40; }
export type ChallengeStart = { startedAt: number; deadlineAt: number };
export type ChallengeResult = { wordCount: number; elapsedMs: number; wpm: number; targetWords: number; taskCompleted: boolean; finishedAt: number };
export type ChallengeParticipant = { id: string; name: string; joinedAt: number; start?: ChallengeStart; result?: ChallengeResult };
export type ChallengeRoomView = { id: string; createdAt: number; expiresAt: number; duration: ChallengeDuration; prompt: ChallengePrompt; participants: ChallengeParticipant[]; serverNow: number };
export type ChallengeSession = { roomId: string; participantId: string; token: string };
export type ChallengeApiResponse = { room: ChallengeRoomView; session?: ChallengeSession };
/** Counts recognized words, never the quality or accuracy of pronunciation. */
export function countChallengeWords(text: string) { return (text.match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu) ?? []).length; }
