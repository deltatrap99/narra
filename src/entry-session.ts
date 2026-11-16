/** Preview access only, never an identity or an authorization boundary. */
export const ENTRY_SESSION_KEY = 'narra-preview-entry-v1';
export type EntrySession = { method: 'preview_code'; createdAt: number };
const PREVIEW_CODES = new Set(['TUANBO99', 'NARRA123']);
export function acceptsPreviewCode(value: string): boolean {
  return PREVIEW_CODES.has(value.trim().toUpperCase());
}
export function isAppleMobileDevice(userAgent: string, platform: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent) || platform === 'MacIntel' && maxTouchPoints > 1;
}
export function readEntrySession(): EntrySession | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(ENTRY_SESSION_KEY) || 'null');
    if (!value || typeof value !== 'object') return null;
    const session = value as Partial<EntrySession>;
    return session.method === 'preview_code' && typeof session.createdAt === 'number' && Number.isFinite(session.createdAt) && session.createdAt <= Date.now() && Date.now() - session.createdAt < 86400000
      ? session as EntrySession : null;
  } catch { return null; }
}
export function createEntrySession(): EntrySession {
  const session: EntrySession = { method: 'preview_code', createdAt: Date.now() };
  try { sessionStorage.setItem(ENTRY_SESSION_KEY, JSON.stringify(session)); } catch { /* The current in-memory visit still works. */ }
  return session;
}
export function clearEntrySession(): void {
  try { sessionStorage.removeItem(ENTRY_SESSION_KEY); } catch { /* Nothing persisted. */ }
}
export function facebookSupportUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'm.me'].includes(url.hostname) && url.pathname !== '/' ? url.href : null;
  } catch { return null; }
}
