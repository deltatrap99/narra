/** Device profiles only. These identifiers are not authenticated user identities. */
export type DeviceAccount = { id: string; name: string };
export const PRIMARY_ACCOUNT = 'primary';
export const ACCOUNTS_KEY = 'narra-device-accounts-v1';
export const ACTIVE_ACCOUNT_KEY = 'narra-active-account-v1';
export const MAX_DEVICE_ACCOUNTS = 6;
const validId = (id: unknown): id is string => typeof id === 'string' && (id === PRIMARY_ACCOUNT || /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id));

export function accountStorageKey(key: string, accountId: string) {
  // Keep the existing learner's keys intact, with no destructive migration.
  return accountId === PRIMARY_ACCOUNT ? key : `${key}:account:${accountId}`;
}
export function readAccounts(): DeviceAccount[] {
  const primary = { id: PRIMARY_ACCOUNT, name: 'Tuan Quoc' };
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? 'null');
    const accounts: DeviceAccount[] = [primary];
    if (Array.isArray(raw)) for (const item of raw) {
      if (item && validId(item.id) && typeof item.name === 'string' && item.name.trim() && !accounts.some(account => account.id === item.id)) accounts.push({ id: item.id, name: item.name.trim().slice(0, 35) });
      if (accounts.length === MAX_DEVICE_ACCOUNTS) break;
    }
    return accounts;
  } catch { return [primary]; }
}
export function readActiveAccount(accounts: DeviceAccount[]) {
  try { return accounts.find(account => account.id === sessionStorage.getItem(ACTIVE_ACCOUNT_KEY)) ?? accounts[0]; }
  catch { return accounts[0]; }
}
export function deviceAccountName(account: DeviceAccount) {
  try {
    const profile = JSON.parse(localStorage.getItem(accountStorageKey('narra-profile-v1', account.id)) ?? 'null');
    return typeof profile?.name === 'string' && profile.name.trim() ? profile.name.trim().slice(0, 35) : account.name;
  } catch { return account.name; }
}
