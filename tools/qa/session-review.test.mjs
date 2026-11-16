import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code = ts.transpileModule(fs.readFileSync(new URL('../../src/session-review.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { exampleEdits, correctedExample, restoreSessions, demoTranscript } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));

test('corrections preserve all unmatched original text and use exact non-overlapping spans', () => {
  const original = 'Today I want order coffee. I am agree it is more better! I want order tea too.';
  const edits = exampleEdits(original);
  assert.equal(edits.length, 4);
  for (let i = 0; i < edits.length; i++) {
    assert.equal(original.slice(edits[i].start, edits[i].end), edits[i].before);
    if (i) assert.ok(edits[i].start >= edits[i - 1].end);
  }
  assert.equal(correctedExample(original), 'Today I want to order coffee. I agree it is better! I want to order tea too.');
  assert.equal(exampleEdits(original).length, 4, 'regex state must not leak across renders');
  assert.equal(correctedExample('I want to order coffee.'), 'I want to order coffee.');
  assert.deepEqual(exampleEdits('I am agreeable and want orderly notes.'), []);
});

test('arbitrary text and unsupported turns remain verbatim without invented feedback', () => {
  const original = '<script>alert(1)</script> Xin chào Narry. Coffee?\nI feel fine.';
  assert.deepEqual(exampleEdits(original), []);
  assert.equal(correctedExample(original), original);
  assert.equal(demoTranscript.filter(message => message.role === 'user').length, 2);
});

test('saved reports retain both speakers in order without storing demo scores', () => {
  const session = { id: 'session-1', title: 'Daily life', tutor: 'Henry', completedAt: '2026-11-16T01:00:00Z', minutes: 3, messages: [{ id: 'a', role: 'tutor', text: 'Hi!', translation: 'Chào bạn!' }, { id: 'b', role: 'user', text: 'Hello Narry!', voiceSeconds: 2 }] };
  assert.deepEqual(restoreSessions(JSON.parse(JSON.stringify([session]))), [session]);
  const normalized = restoreSessions([{ ...session, score: 72, cefr: 'B1', messages: session.messages.map(message => ({ ...message, score: 80 })) }])[0];
  assert.deepEqual(normalized, session, 'display-only scores must not enter stored session data');
  assert.deepEqual(restoreSessions([null, {}, { ...session, minutes: -1 }, { ...session, messages: [{ role: 'assistant', text: 'wrong' }] }, { ...session, messages: [{ id: 'x', role: 'user', text: 3 }] }, session]), [session]);
  assert.equal(restoreSessions(Array.from({ length: 25 }, () => session)).length, 20);
  assert.deepEqual(restoreSessions('invalid'), []);
});
