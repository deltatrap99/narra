import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

// Compile the production service in memory: no credentials or live store needed.
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const sharedUrl = moduleUrl(compile(await readFile(new URL('../../src/challenge-data.ts', import.meta.url), 'utf8')));
const serviceSource = compile(await readFile(new URL('../../lib/challenge-service.ts', import.meta.url), 'utf8')).replace('../src/challenge-data.js', sharedUrl);
const { createChallengeService } = await import(moduleUrl(serviceSource));
const { countChallengeWords } = await import(sharedUrl);
function fixture() {
  const records = new Map(); let timestamp = 1_800_000_000_000;
  const store = { async read(path) { return records.has(path) ? structuredClone(records.get(path)) : null; }, async create(path, value) { if (records.has(path)) return false; records.set(path, structuredClone(value)); return true; } };
  const service = createChallengeService(store, 'test-only-signing-secret-over-thirty-two-characters', () => timestamp);
  return { service, records, advance: milliseconds => { timestamp += milliseconds; } };
}
const create = service => service.post({ action: 'create', name: 'An', promptId: 'weekend', duration: 30 });
const join = (service, roomId, nonce = randomUUID()) => service.post({ action: 'join', roomId, name: 'Bình', nonce });
const rejectsCode = (promise, status, code) => assert.rejects(promise, error => error.status === status && error.code === code);

test('only actual participants appear; invite views omit participant tokens', async () => {
  const { service, records } = fixture(); const response = await create(service);
  assert.equal(response.room.participants.length, 1); assert.equal(response.room.participants[0].name, 'An');
  assert.match(response.room.id, /^[0-9a-f-]{36}$/); assert.ok(response.session.token.includes('.'));
  const view = await service.get(response.room.id); assert.equal(view.session, undefined);
  assert.ok(!JSON.stringify(view).includes(response.session.token));
  assert.ok(!JSON.stringify([...records.values()]).includes('token'));
});
test('simultaneous joins claim exactly one second-player slot', async () => {
  const { service } = fixture(); const { room } = await create(service);
  const joined = await Promise.allSettled([join(service, room.id), join(service, room.id), join(service, room.id)]);
  assert.equal(joined.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(joined.filter(result => result.status === 'rejected' && result.reason.code === 'room_full').length, 2);
  assert.equal((await service.get(room.id)).room.participants.length, 2);
});
test('retrying a lost join response with the private nonce restores the same pass', async () => {
  const { service } = fixture(); const { room } = await create(service); const nonce = randomUUID();
  const a = await join(service, room.id, nonce); const b = await join(service, room.id, nonce);
  assert.deepEqual(a.session, b.session); assert.equal(b.room.participants.length, 2);
});
test('signed passes cannot be forged, used across rooms, or omitted', async () => {
  const { service } = fixture(); const a = await create(service); const b = await create(service);
  await join(service, a.room.id); await join(service, b.room.id);
  await rejectsCode(service.post({ action: 'start', roomId: a.room.id }), 401, 'unauthorized');
  await rejectsCode(service.post({ action: 'start', roomId: a.room.id }, a.session.token + 'x'), 401, 'unauthorized');
  await rejectsCode(service.post({ action: 'start', roomId: b.room.id }, a.session.token), 401, 'unauthorized');
});
test('starts require a friend, preserve the first timer, and reject finishes during countdown', async () => {
  const { service, advance } = fixture(); const a = await create(service);
  await rejectsCode(service.post({ action: 'start', roomId: a.room.id }, a.session.token), 409, 'waiting');
  await join(service, a.room.id); const start = await service.post({ action: 'start', roomId: a.room.id }, a.session.token);
  advance(1000); const retried = await service.post({ action: 'start', roomId: a.room.id }, a.session.token);
  assert.deepEqual(start.room.participants[0].start, retried.room.participants[0].start);
  await rejectsCode(service.post({ action: 'finish', roomId: a.room.id, wordCount: 20, elapsedMs: 1000 }, a.session.token), 409, 'not_started');
});
test('independent immutable results retain real word/time metrics without storing speech text', async () => {
  const { service, records, advance } = fixture(); const a = await create(service); const b = await join(service, a.room.id);
  await service.post({ action: 'start', roomId: a.room.id }, a.session.token);
  await service.post({ action: 'start', roomId: a.room.id }, b.session.token); advance(13000);
  const saved = await service.post({ action: 'finish', roomId: a.room.id, wordCount: 22, elapsedMs: 10000, transcript: 'must never be stored' }, a.session.token);
  assert.deepEqual(saved.room.participants[0].result, { wordCount: 22, elapsedMs: 10000, wpm: 132, targetWords: 20, taskCompleted: true, finishedAt: saved.room.serverNow });
  assert.equal(saved.room.participants[1].result, undefined);
  const retried = await service.post({ action: 'finish', roomId: a.room.id, wordCount: 999, elapsedMs: 1000 }, a.session.token);
  assert.equal(retried.room.participants[0].result.wordCount, 22);
  const both = await service.post({ action: 'finish', roomId: a.room.id, wordCount: 10, elapsedMs: 10000 }, b.session.token);
  assert.equal(both.room.participants[0].result.wordCount, 22); assert.equal(both.room.participants[1].result.taskCompleted, false);
  const stored = JSON.stringify([...records.values()]); assert.ok(!stored.includes('transcript')); assert.ok(!stored.includes('must never')); assert.ok(!stored.includes('audio')); assert.ok(!stored.includes('pronunciation'));
});
test('invalid counts, options, names and expired turns are rejected', async () => {
  const { service, advance } = fixture();
  await rejectsCode(service.post({ action: 'create', name: 'An', promptId: '../private', duration: 30 }), 400, 'invalid_options');
  await rejectsCode(service.post({ action: 'create', name: '<script>', promptId: 'weekend', duration: 30 }), 400, 'invalid_name');
  await rejectsCode(service.get('../../anything'), 400, 'invalid_id');
  const a = await create(service); await join(service, a.room.id); await service.post({ action: 'start', roomId: a.room.id }, a.session.token); advance(5000);
  await rejectsCode(service.post({ action: 'finish', roomId: a.room.id, wordCount: 1.5, elapsedMs: 2000 }, a.session.token), 400, 'invalid_result');
  await rejectsCode(service.post({ action: 'finish', roomId: a.room.id, wordCount: 50, elapsedMs: 90000 }, a.session.token), 400, 'invalid_result');
  advance(90000); await rejectsCode(service.post({ action: 'finish', roomId: a.room.id, wordCount: 10, elapsedMs: 30000 }, a.session.token), 410, 'turn_expired');
  advance(24 * 60 * 60 * 1000); await rejectsCode(service.get(a.room.id), 410, 'expired');
});
test('recognition word counts handle punctuation, contractions and Vietnamese names', () => {
  assert.equal(countChallengeWords("I'm ready — one little story."), 5);
  assert.equal(countChallengeWords('An và Bình, 30 seconds!'), 5);
  assert.equal(countChallengeWords('...     '), 0);
});
