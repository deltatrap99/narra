import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

async function moduleFrom(path) {
  const code = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const accounts = await moduleFrom('../../src/account-storage.ts');
const entry = await moduleFrom('../../src/entry-session.ts');
const family = await moduleFrom('../../src/family.ts');
const learnerId = '11111111-2222-4333-8444-555555555555';
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
}
function reset() { globalThis.localStorage = storage(); globalThis.sessionStorage = storage(); }

test('existing learner keys and saved data remain intact while additional profiles are isolated', () => {
  reset();
  for (const key of ['narra-profile-v1', 'narra-stats-v1', 'narra-words-v1', 'narra-player-v1', 'narra-word-speaking-v1', 'narra-sessions-v1', 'narra-conversation-v1:Skye:free', 'narra-challenge-pass-v1:room']) {
    assert.equal(accounts.accountStorageKey(key, 'primary'), key);
    localStorage.setItem(key, 'original');
    localStorage.setItem(accounts.accountStorageKey(key, learnerId), 'another learner');
    assert.equal(localStorage.getItem(key), 'original');
    assert.equal(localStorage.getItem(accounts.accountStorageKey(key, learnerId)), 'another learner');
  }
});
test('account catalog rejects malformed, duplicate and oversized records', () => {
  reset();
  localStorage.setItem(accounts.ACCOUNTS_KEY, JSON.stringify([{ id: learnerId, name: '  Linh  ' }, { id: learnerId, name: 'Duplicate' }, { id: '../primary', name: 'Bad' }, null, { id: 'primary', name: 'Overwrite' }]));
  assert.deepEqual(accounts.readAccounts(), [{ id: 'primary', name: 'Tuan Quoc' }, { id: learnerId, name: 'Linh' }]);
  localStorage.setItem(accounts.ACCOUNTS_KEY, '{invalid');
  assert.equal(accounts.readAccounts().length, 1);
});
test('active account is tab scoped and missing accounts fall back to the existing learner', () => {
  reset();
  const list = [{ id: 'primary', name: 'A' }, { id: learnerId, name: 'B' }];
  sessionStorage.setItem(accounts.ACTIVE_ACCOUNT_KEY, learnerId);
  assert.equal(accounts.readActiveAccount(list).id, learnerId);
  sessionStorage.setItem(accounts.ACTIVE_ACCOUNT_KEY, 'unknown');
  assert.equal(accounts.readActiveAccount(list).id, 'primary');
});
test('latest saved name is shown for the correct profile', () => {
  reset();
  localStorage.setItem(accounts.accountStorageKey('narra-profile-v1', learnerId), JSON.stringify({ name: 'New name' }));
  assert.equal(accounts.deviceAccountName({ id: learnerId, name: 'Old name' }), 'New name');
  assert.equal(accounts.deviceAccountName({ id: 'primary', name: 'Original' }), 'Original');
});
test('code sessions cannot be reused for a different profile and logout clears access', () => {
  reset();
  assert.ok(entry.acceptsPreviewCode(' tuanbo99 '));
  assert.ok(entry.acceptsPreviewCode('NARRA123'));
  entry.createEntrySession(learnerId);
  assert.equal(entry.readEntrySession(learnerId).accountId, learnerId);
  assert.equal(entry.readEntrySession('primary'), null);
  entry.clearEntrySession();
  assert.equal(entry.readEntrySession(learnerId), null);
  sessionStorage.setItem(entry.ENTRY_SESSION_KEY, JSON.stringify({ method: 'preview_code', createdAt: Date.now() }));
  assert.ok(entry.readEntrySession('primary'));
  assert.equal(entry.readEntrySession(learnerId), null);
});
test('blocked storage falls back safely without fabricating accounts or sessions', () => {
  reset();
  globalThis.localStorage = { getItem() { throw new Error('Blocked'); } };
  globalThis.sessionStorage = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Blocked'); }, removeItem() { throw new Error('Blocked'); } };
  assert.equal(accounts.readAccounts().length, 1);
  assert.equal(entry.readEntrySession(), null);
  assert.equal(entry.createEntrySession(learnerId).accountId, learnerId);
  assert.doesNotThrow(entry.clearEntrySession);
});
test('Family counts the owner in its four seats and restores only valid saved members', () => {
  const raw = [{ id: 'a', name: '  Linh ' }, { id: 'a', name: 'Duplicate' }, null, { id: 'b', name: 'Nam' }, { id: 'c', name: 'An' }, { id: 'd', name: 'Extra' }];
  assert.deepEqual(family.restoreFamilyMembers(raw), [{ id: 'a', name: 'Linh' }, { id: 'b', name: 'Nam' }, { id: 'c', name: 'An' }]);
  assert.equal(family.familyNameError('Mai', 'Tuan', family.restoreFamilyMembers(raw)), 'full');
  assert.deepEqual(family.restoreFamilyMembers({}), []);
});
test('Family catches blank and duplicate names, including Vietnamese Unicode equivalents', () => {
  assert.equal(family.familyNameError('   ', 'Tuấn', []), 'empty');
  assert.equal(family.familyNameError(' TUẤN ', 'Tuấn', []), 'duplicate');
  assert.equal(family.familyNameError('Tuấn'.normalize('NFD'), 'Tuấn', []), 'duplicate');
  assert.equal(family.familyNameError('Linh', 'Tuấn', [{ id: 'a', name: 'Linh' }]), 'duplicate');
  assert.equal(family.familyNameError('Linh', 'Tuấn', []), null);
});
