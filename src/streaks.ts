export type StreakEffect = 'hello' | 'wiggle' | 'hop' | 'twirl' | 'dance' | 'leap' | 'sparkle' | 'float' | 'crown' | 'orbit' | 'fireworks';
export type StreakMilestone = { days: number; title: string; titleVi: string; cheer: string; cheerVi: string; color: string; effect: StreakEffect; mood: 'encourage' | 'celebrate' | 'proud' };

export const STREAK_MILESTONES: readonly StreakMilestone[] = [
  { days: 1, title: 'A little spark', titleVi: 'Tia sáng đầu tiên', cheer: 'One little hello, a whole new beginning!', cheerVi: 'Một lời chào nhỏ, một khởi đầu thật vui!', color: '#1c8673', effect: 'hello', mood: 'encourage' },
  { days: 3, title: 'Finding our rhythm', titleVi: 'Mình bắt nhịp rồi', cheer: 'Three days together and Buddy is doing a happy wiggle!', cheerVi: 'Ba ngày bên nhau, Buddy vui đến lắc lư rồi nè!', color: '#167d9a', effect: 'wiggle', mood: 'celebrate' },
  { days: 7, title: 'One lovely week', titleVi: 'Một tuần thật vui', cheer: 'A whole week of showing up, let’s jump for joy!', cheerVi: 'Cả tuần mình đều có mặt, cùng nhảy lên ăn mừng nhé!', color: '#a45b12', effect: 'hop', mood: 'celebrate' },
  { days: 14, title: 'A little lift-off', titleVi: 'Cùng nhau cất cánh', cheer: 'Two weeks of little stories, Buddy is spinning with joy!', cheerVi: 'Hai tuần kể chuyện nhỏ, Buddy xoay một vòng vì vui quá!', color: '#946432', effect: 'twirl', mood: 'celebrate' },
  { days: 30, title: 'A month of us', titleVi: 'Một tháng có nhau', cheer: 'Thirty days of your own voice deserve a happy dance!', cheerVi: 'Ba mươi ngày cất tiếng, mình nhảy một điệu thật vui nhé!', color: '#b64c67', effect: 'dance', mood: 'celebrate' },
  { days: 60, title: 'Braver every day', titleVi: 'Mỗi ngày thêm tự tin', cheer: 'Sixty days of little leaps, and look how far you’ve come!', cheerVi: 'Sáu mươi ngày bước tới, nhìn xem mình đã đi xa thế nào!', color: '#ad4d24', effect: 'leap', mood: 'encourage' },
  { days: 90, title: 'Your voice shines', titleVi: 'Giọng nói tỏa sáng', cheer: 'Ninety days of stories, with a little sparkle in every one!', cheerVi: 'Chín mươi ngày kể chuyện, mỗi ngày đều có một chút lấp lánh!', color: '#4368ac', effect: 'sparkle', mood: 'proud' },
  { days: 120, title: 'Room to grow', titleVi: 'Mình đang lớn dần', cheer: 'One hundred and twenty days, your English has room to fly!', cheerVi: 'Một trăm hai mươi ngày, tiếng Anh của bạn đang bay xa hơn!', color: '#287f6b', effect: 'float', mood: 'encourage' },
  { days: 180, title: 'A golden habit', titleVi: 'Thói quen vàng', cheer: 'One hundred and eighty days, a little crown for a lovely habit!', cheerVi: 'Một trăm tám mươi ngày, tặng bạn vương miện cho thói quen thật đẹp!', color: '#9d6a13', effect: 'crown', mood: 'proud' },
  { days: 270, title: 'A world of stories', titleVi: 'Cả thế giới câu chuyện', cheer: 'Two hundred and seventy days, and our little world keeps growing!', cheerVi: 'Hai trăm bảy mươi ngày, thế giới nhỏ của mình cứ lớn thêm!', color: '#7053a9', effect: 'orbit', mood: 'celebrate' },
  { days: 365, title: 'A year in your voice', titleVi: 'Một năm cất tiếng', cheer: 'A whole year of showing up, and Buddy couldn’t be prouder of you!', cheerVi: 'Trọn một năm mình có mặt, Buddy tự hào về bạn lắm đó!', color: '#a85b22', effect: 'fireworks', mood: 'proud' },
];

const DAY_MS = 86_400_000;
function dayNumber(key: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const time = Date.parse(`${key}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === key ? time / DAY_MS : null;
}

/** Date keys come from Narra's UTC+7 study calendar, never the device's time zone. */
export function streakState(dateKeys: Iterable<string>, today: string) {
  const now = dayNumber(today);
  if (now === null) throw new Error('A valid study date is required');
  const dates = [...new Set(dateKeys)].filter(date => { const day = dayNumber(date); return day !== null && day <= now; }).sort();
  const earnedDates: Record<number, string> = {};
  let best = 0;
  let run = 0;
  let previous = Number.NEGATIVE_INFINITY;
  for (const date of dates) {
    const day = dayNumber(date)!;
    run = day === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    for (const milestone of STREAK_MILESTONES) if (run >= milestone.days && !earnedDates[milestone.days]) earnedDates[milestone.days] = date;
    previous = day;
  }
  // Yesterday's run stays alive until the learner has the whole of today to practise.
  const current = previous === now || previous === now - 1 ? run : 0;
  return { current, best, earnedDates, practisedToday: previous === now, next: STREAK_MILESTONES.find(m => m.days > current) ?? null };
}
