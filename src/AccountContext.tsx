import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ACTIVE_ACCOUNT_KEY, ACCOUNTS_KEY, MAX_DEVICE_ACCOUNTS, accountStorageKey, readAccounts, readActiveAccount, type DeviceAccount } from './account-storage';
import { clearEntrySession } from './entry-session';

function useAccountState() {
  const [accounts, setAccounts] = useState(readAccounts);
  const [activeAccount, setActiveAccount] = useState(() => readActiveAccount(accounts));
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === ACCOUNTS_KEY) setAccounts(readAccounts()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function selectAccount(account: DeviceAccount) {
    clearEntrySession();
    try { sessionStorage.setItem(ACTIVE_ACCOUNT_KEY, account.id); } catch { /* This visit can continue in memory. */ }
    setActiveAccount(account);
  }
  function addAccount(name: string): 'ok' | 'limit' | 'storage' {
    if (accounts.length >= MAX_DEVICE_ACCOUNTS) return 'limit';
    const account = { id: crypto.randomUUID(), name: name.trim().slice(0, 35) };
    if (!account.name) return 'storage';
    const next = [...accounts, account];
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next)); }
    catch { return 'storage'; }
    setAccounts(next);
    selectAccount(account);
    return 'ok';
  }
  return { accounts, activeAccount, selectAccount, addAccount, storageKey: (key: string) => accountStorageKey(key, activeAccount.id) };
}
const AccountContext = createContext<ReturnType<typeof useAccountState> | null>(null);
export function AccountProvider({ children }: { children: ReactNode }) {
  const value = useAccountState();
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
export function useAccounts() {
  const value = useContext(AccountContext);
  if (!value) throw new Error('AccountProvider is missing');
  return value;
}
