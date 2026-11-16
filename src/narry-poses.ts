export const NARRY_MOODS = ['welcome', 'focus', 'curious', 'encourage', 'celebrate', 'proud', 'thinking', 'listening', 'oops'] as const;
export type NarryMood = typeof NARRY_MOODS[number];

/** Row-major cells in both identity-preserving 3 × 3 emotion atlases. */
export function narryFrame(mood: NarryMood) {
  const index = NARRY_MOODS.indexOf(mood);
  return { x: `${-(index % 3) * 100 / 3}%`, y: `${-Math.floor(index / 3) * 100 / 3}%` };
}
export const legacyNarryMood: Record<NarryMood, string> = {
  welcome: 'welcome', focus: 'focus', curious: 'curious', encourage: 'encourage', celebrate: 'celebrate', proud: 'proud',
  thinking: 'curious', listening: 'focus', oops: 'encourage',
};
