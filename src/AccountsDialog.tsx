import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Plus, UserRound } from 'lucide-react';
import { useAccounts } from './AccountContext';
import { deviceAccountName, MAX_DEVICE_ACCOUNTS } from './account-storage';
import { useCopy, useNarra } from './state';
import { Modal } from './ui';
import './profile-accounts.css';

export default function AccountsDialog({ onClose }: { onClose: () => void }) {
  const tr = useCopy();
  const { profile } = useNarra();
  const { accounts, activeAccount, selectAccount, addAccount } = useAccounts();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  function add(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError(tr('Give this learner a name first.', 'Bạn nhập tên cho người học mới nhé.')); return; }
    const result = addAccount(name);
    if (result === 'ok') onClose();
    else setError(result === 'limit' ? tr(`This device can keep up to ${MAX_DEVICE_ACCOUNTS} profiles.`, `Thiết bị này lưu tối đa ${MAX_DEVICE_ACCOUNTS} hồ sơ nhé.`) : tr('Your browser could not save this profile. Allow local storage and try again.', 'Trình duyệt chưa lưu được hồ sơ, bạn cho phép lưu dữ liệu trên máy rồi thử lại nhé.'));
  }
  return <Modal title={tr('Your learning accounts', 'Tài khoản trên thiết bị')} onClose={onClose}>
    <p className="account-dialog-intro">{tr('Everyone gets their own words, progress and Buddy adventures.', 'Mỗi người một kho từ, một tiến độ, một hành trình cùng Buddy.')}</p>
    <ul className="device-account-list">{accounts.map(account => {
      const current = account.id === activeAccount.id;
      const label = current ? profile.name : deviceAccountName(account);
      return <li key={account.id}><button type="button" disabled={current} onClick={() => { selectAccount(account); onClose(); }}><span className="account-round-icon"><UserRound size={21} /></span><span><strong>{label}</strong><small>{current ? tr('Current profile', 'Hồ sơ đang dùng') : tr('Sign in to this profile', 'Đăng nhập hồ sơ này')}</small></span>{current ? <Check size={19} /> : <ArrowRight size={19} />}</button></li>;
    })}</ul>
    <form className="account-add-form" onSubmit={add}>
      <label htmlFor="new-account-name">{tr('Add an account', 'Thêm tài khoản')}</label>
      <input id="new-account-name" value={name} onChange={event => { setName(event.target.value); setError(''); }} placeholder={tr('Name of the new learner', 'Tên người học mới')} maxLength={35} autoComplete="off" required aria-describedby={error ? 'account-add-error' : undefined} aria-invalid={!!error} />
      {error && <p id="account-add-error" className="account-form-error" role="alert">{error}</p>}
      <button type="submit" className="account-primary"><Plus size={19} />{tr('Add and sign in', 'Thêm và đăng nhập')}</button>
    </form>
    <p className="account-local-note">{tr('These are profiles on this device, with no cloud account or sync. Use your access code after adding or switching profiles.', 'Đây là hồ sơ trên thiết bị, chưa có tài khoản hay đồng bộ đám mây. Bạn dùng mã để vào sau khi thêm hoặc đổi hồ sơ nhé.')}</p>
  </Modal>;
}
