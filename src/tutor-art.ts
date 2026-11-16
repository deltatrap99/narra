export type TutorMode = 'idle' | 'speaking' | 'listening';
export type TutorPose = 'listening' | 'speaking' | 'laughing';

export function tutorPose(mode: TutorMode, beat: number, welcoming = false): TutorPose {
  if (mode === 'listening') return 'listening';
  if (mode === 'speaking') return beat % 8 === 6 ? 'laughing' : beat % 3 === 1 ? 'listening' : 'speaking';
  return welcoming ? 'laughing' : 'listening';
}
