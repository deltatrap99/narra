import type { IncomingMessage, ServerResponse } from 'node:http';
import { createChallengeService, ChallengeError } from '../lib/challenge-service.js';
import { challengeStore } from '../lib/challenge-store.js';

type Request = IncomingMessage & { body?: unknown };
const buckets = new Map<string, { count: number; expires: number }>();
function rateLimit(req: Request) {
  const key = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
  const bucketKey = `${req.method === 'GET' ? 'read' : 'write'}:${key}`; const now = Date.now();
  const existing = buckets.get(bucketKey);
  if (existing && existing.expires > now) { existing.count++; if (existing.count > (req.method === 'GET' ? 100 : 25)) throw new ChallengeError(429, 'rate_limited', 'Give this room a moment, then try again.'); }
  else buckets.set(bucketKey, { count: 1, expires: now + 60000 });
  if (buckets.size > 2000) for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
}
async function bodyOf(req: Request) {
  if (!String(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) throw new ChallengeError(415, 'invalid_body', 'Send a JSON challenge request.');
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > 4096) throw new ChallengeError(413, 'too_large', 'This challenge request is too large.');
    try { return typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { throw new ChallengeError(400, 'invalid_body', 'Send a valid challenge request.'); }
  }
  let size = 0; const chunks: Buffer[] = [];
  for await (const value of req) { const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value); size += chunk.length; if (size > 4096) throw new ChallengeError(413, 'too_large', 'This challenge request is too large.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ChallengeError(400, 'invalid_body', 'Send a valid challenge request.'); }
}
export default async function handler(req: Request, res: ServerResponse) {
  res.setHeader('Cache-Control', 'private, no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method !== 'GET' && req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); throw new ChallengeError(405, 'invalid_method', 'Use GET or POST for this room.'); }
    if (req.headers['sec-fetch-site'] === 'cross-site') throw new ChallengeError(403, 'cross_site', 'Open this challenge from its Narra invitation link.');
    const origin = req.headers.origin; const host = req.headers['x-forwarded-host'] ?? req.headers.host;
    if (origin && new URL(origin).host !== host) throw new ChallengeError(403, 'cross_site', 'Open this challenge from its Narra invitation link.');
    rateLimit(req);
    const service = createChallengeService(challengeStore, process.env.CHALLENGE_SIGNING_SECRET ?? '');
    const auth = req.headers.authorization; const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const result = req.method === 'GET' ? await service.get(new URL(req.url ?? '', 'https://narra.invalid').searchParams.get('roomId')) : await service.post(await bodyOf(req), token);
    res.statusCode = 200; res.end(JSON.stringify(result));
  } catch (error) {
    const known = error instanceof ChallengeError;
    res.statusCode = known ? error.status : 503;
    if (res.statusCode === 429) res.setHeader('Retry-After', '60');
    if (!known) console.error('Challenge storage request failed', error instanceof Error ? error.name : 'Unknown error');
    res.end(JSON.stringify({ error: { code: known ? error.code : 'unavailable', message: known ? error.message : 'The shared room could not connect right now. Please try again.' } }));
  }
}
