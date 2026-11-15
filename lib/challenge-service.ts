import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { challengePrompts, challengeTarget, type ChallengeApiResponse, type ChallengeDuration, type ChallengeParticipant, type ChallengeResult, type ChallengeRoomView, type ChallengeSession, type ChallengeStart } from '../src/challenge-data.js';

export interface ChallengeStore {
  read<T>(pathname: string): Promise<T | null>;
  create(pathname: string, value: unknown): Promise<boolean>;
}
type Manifest = { version: 1; id: string; promptId: string; duration: ChallengeDuration; hostId: string; createdAt: number; expiresAt: number };
type Member = Pick<ChallengeParticipant, 'id' | 'name' | 'joinedAt'>;
export class ChallengeError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const root = (id: string) => `narra-challenges/v1/${id}`;
const fail = (status: number, code: string, message: string): never => { throw new ChallengeError(status, code, message); };
function uuid(value: unknown) { return typeof value === 'string' && UUID.test(value) ? value.toLowerCase() : fail(400, 'invalid_id', 'This challenge link is not valid.'); }
function displayName(value: unknown) {
  if (typeof value !== 'string') return fail(400, 'invalid_name', 'Please enter a name.');
  const name = value.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (name.length < 1 || name.length > 40 || /[\p{Cc}\p{Cf}<>]/u.test(name)) return fail(400, 'invalid_name', 'Use a name of 1 to 40 characters.');
  return name;
}
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) return fail(400, 'invalid_body', 'Send a valid challenge request.'); return value as Record<string, unknown>; }

/** Immutable room and per-person records keep concurrent players from overwriting each other. */
export function createChallengeService(store: ChallengeStore, secret: string, now = Date.now) {
  if (secret.length < 32) throw new ChallengeError(503, 'unavailable', 'Shared challenges are not configured yet.');
  const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');
  function session(room: Manifest, participantId: string): ChallengeSession {
    const payload = Buffer.from(JSON.stringify({ r: room.id, p: participantId, e: room.expiresAt })).toString('base64url');
    return { roomId: room.id, participantId, token: `${payload}.${sign(payload)}` };
  }
  async function manifest(id: string) {
    const room = await store.read<Manifest>(`${root(id)}/room.json`);
    if (!room) return fail(404, 'not_found', 'We could not find this challenge. Check the invitation link.');
    if (room.expiresAt <= now()) return fail(410, 'expired', 'This challenge has expired. Create a new invitation to try again.');
    return room;
  }
  async function view(room: Manifest): Promise<ChallengeRoomView> {
    const [host, guest] = await Promise.all([store.read<Member>(`${root(room.id)}/host.json`), store.read<Member>(`${root(room.id)}/guest.json`)]);
    if (!host) return fail(503, 'unavailable', 'This room is still getting ready. Please try again.');
    const participants = await Promise.all([host, guest].filter((p): p is Member => !!p).map(async member => {
      const [start, result] = await Promise.all([store.read<ChallengeStart>(`${root(room.id)}/starts/${member.id}.json`), store.read<ChallengeResult>(`${root(room.id)}/results/${member.id}.json`)]);
      return { ...member, ...(start ? { start } : {}), ...(result ? { result } : {}) };
    }));
    return { id: room.id, createdAt: room.createdAt, expiresAt: room.expiresAt, duration: room.duration, prompt: challengePrompts.find(p => p.id === room.promptId)!, participants, serverNow: now() };
  }
  async function authorize(room: Manifest, token: string | undefined) {
    if (!token || token.length > 1024) return fail(401, 'unauthorized', 'Reopen this room on the browser where you joined.');
    const parts = token.split('.');
    if (parts.length !== 2) return fail(401, 'unauthorized', 'Your participant pass is not valid.');
    const expected = Buffer.from(sign(parts[0])); const received = Buffer.from(parts[1]);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return fail(401, 'unauthorized', 'Your participant pass is not valid.');
    let claims: Record<string, unknown>;
    try { claims = object(JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))); } catch { return fail(401, 'unauthorized', 'Your participant pass is not valid.'); }
    if (claims.r !== room.id || claims.e !== room.expiresAt || typeof claims.p !== 'string' || !UUID.test(claims.p) || room.expiresAt <= now()) return fail(401, 'unauthorized', 'Your participant pass has expired.');
    const member = await store.read<Member>(`${root(room.id)}/${claims.p === room.hostId ? 'host' : 'guest'}.json`);
    if (!member || member.id !== claims.p) return fail(401, 'unauthorized', 'This participant is not in the room.');
    return member;
  }
  return {
    async get(roomId: unknown): Promise<ChallengeApiResponse> { return { room: await view(await manifest(uuid(roomId))) }; },
    async post(input: unknown, token?: string): Promise<ChallengeApiResponse> {
      const body = object(input);
      if (body.action === 'create') {
        const name = displayName(body.name); const prompt = challengePrompts.find(p => p.id === body.promptId);
        if (!prompt || (body.duration !== 30 && body.duration !== 60)) return fail(400, 'invalid_options', 'Choose a topic and a 30- or 60-second turn.');
        const id = randomUUID(); const hostId = randomUUID(); const timestamp = now();
        const room: Manifest = { version: 1, id, promptId: prompt.id, duration: body.duration, hostId, createdAt: timestamp, expiresAt: timestamp + 24 * 60 * 60 * 1000 };
        await store.create(`${root(id)}/host.json`, { id: hostId, name, joinedAt: timestamp } satisfies Member);
        await store.create(`${root(id)}/room.json`, room);
        return { room: await view(room), session: session(room, hostId) };
      }
      const room = await manifest(uuid(body.roomId));
      if (body.action === 'join') {
        const name = displayName(body.name); const nonce = uuid(body.nonce);
        // A private, random client nonce makes retrying a lost join response idempotent.
        const bytes = createHmac('sha256', secret).update(`${room.id}:${nonce}`).digest();
        bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
        const hex = bytes.subarray(0, 16).toString('hex'); const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
        await store.create(`${root(room.id)}/guest.json`, { id, name, joinedAt: now() } satisfies Member);
        const member = await store.read<Member>(`${root(room.id)}/guest.json`);
        if (!member || member.id !== id) return fail(409, 'room_full', 'Two people have already joined this room. Ask for a new invitation.');
        return { room: await view(room), session: session(room, member.id) };
      }
      if (body.action !== 'start' && body.action !== 'finish') return fail(400, 'invalid_action', 'Choose a valid challenge action.');
      const member = await authorize(room, token); const pathname = `${root(room.id)}/starts/${member.id}.json`;
      if (body.action === 'start') {
        const guest = await store.read<Member>(`${root(room.id)}/guest.json`);
        if (!guest) return fail(409, 'waiting', 'Your friend needs to join before either turn can start.');
        if (await store.read(`${root(room.id)}/results/${member.id}.json`)) return { room: await view(room) };
        const timestamp = now() + 3000;
        await store.create(pathname, { startedAt: timestamp, deadlineAt: timestamp + room.duration * 1000 } satisfies ChallengeStart);
        return { room: await view(room) };
      }
      const existing = await store.read<ChallengeResult>(`${root(room.id)}/results/${member.id}.json`);
      if (existing) return { room: await view(room) };
      const start = await store.read<ChallengeStart>(pathname); const timestamp = now();
      if (!start || timestamp < start.startedAt) return fail(409, 'not_started', 'Start your timed turn first.');
      if (timestamp > start.deadlineAt + 60000) return fail(410, 'turn_expired', 'This turn ended without a saved result. Create a new room to try again.');
      if (typeof body.wordCount !== 'number' || !Number.isInteger(body.wordCount) || body.wordCount < 0 || body.wordCount > 1000 || typeof body.elapsedMs !== 'number' || !Number.isFinite(body.elapsedMs) || body.elapsedMs < 1000 || body.elapsedMs > room.duration * 1000) return fail(400, 'invalid_result', 'The recognized-word count or turn duration is not valid.');
      const elapsedMs = Math.max(1000, Math.round(Math.min(body.elapsedMs, timestamp - start.startedAt, room.duration * 1000)));
      const targetWords = challengeTarget(room.duration);
      const result: ChallengeResult = { wordCount: body.wordCount, elapsedMs, wpm: Math.round(body.wordCount * 60000 / elapsedMs), targetWords, taskCompleted: body.wordCount >= targetWords, finishedAt: timestamp };
      await store.create(`${root(room.id)}/results/${member.id}.json`, result);
      return { room: await view(room) };
    },
  };
}
