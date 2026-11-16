export type StreakCardTone = 'cute' | 'cheeky';

const captions: Record<number, { cute: [string, string]; cheeky: [string, string] }> = {
  1: { cute: ['A little hello!', 'Mở lời rồi nè!'], cheeky: ['Okay, we’re doing this!', 'Mới mở bát đã cuốn!'] },
  3: { cute: ['Finding our rhythm!', 'Mình bắt nhịp rồi!'], cheeky: ['Unexpectedly consistent!', 'Chăm bất ngờ luôn!'] },
  7: { cute: ['One lovely week!', 'Một tuần có nhau!'], cheeky: ['Who’s this consistent?!', 'Ủa, chăm dữ vậy!'] },
  14: { cute: ['Two weeks, still smiling!', 'Hai tuần, vẫn mê!'], cheeky: ['Oops, made it a habit!', 'Lỡ chăm mất rồi!'] },
  30: { cute: ['A month of little stories!', 'Một tháng dính nhau!'], cheeky: ['This is getting serious!', 'Chăm cỡ này ai chịu!'] },
  60: { cute: ['A little closer, every day!', 'Mỗi ngày thêm thân!'], cheeky: ['Still here, still showing up!', 'Trời ơi, vẫn còn chăm!'] },
  90: { cute: ['So many little hellos!', 'Mình có hẹn mỗi ngày!'], cheeky: ['Consistency looks good on me!', 'Chăm cũng có số má!'] },
  120: { cute: ['Our story keeps growing!', 'Câu chuyện cứ lớn thêm!'], cheeky: ['Booked for my daily English!', 'Bận có hẹn với tiếng Anh!'] },
  180: { cute: ['A golden little habit!', 'Thói quen xinh của mình!'], cheeky: ['Low-key a streak legend!', 'Ngầu ngang, chăm dọc!'] },
  270: { cute: ['A world of little stories!', 'Cả thế giới có nhau!'], cheeky: ['Consistency is my brand now!', 'Chăm thành thương hiệu!'] },
  365: { cute: ['One whole year of us!', 'Một năm, có tớ đây!'], cheeky: ['A whole year, casually iconic!', 'Chăm nguyên năm, hết cứu!'] },
};

export function streakCaption(days: number, tone: StreakCardTone): [string, string] { return captions[days]?.[tone] ?? captions[1][tone]; }

export function streakPalette(tone: StreakCardTone, option5: boolean) {
  if (tone === 'cheeky') return option5
    ? { paper: '#ffe671', ink: '#2a1244', accent: '#5a24c9', disc: '#fff1a8', highlight: '#b29aff' }
    : { paper: '#d6fa7b', ink: '#15352a', accent: '#216859', disc: '#e9ffb2', highlight: '#67d5f9' };
  return option5
    ? { paper: '#f4efff', ink: '#241044', accent: '#5a24c9', disc: '#e5d5ff', highlight: '#ffd861' }
    : { paper: '#f3f9ef', ink: '#183329', accent: '#52771d', disc: '#e0f3bf', highlight: '#6dd9ff' };
}
