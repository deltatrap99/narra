import { useState, type FormEvent } from 'react';
import { Crown, Heart, Plus, Trash2, UserRound, Users } from 'lucide-react';
import { usePlayer } from './game';
import { useCopy, useNarra } from './state';
import { FAMILY_CAPACITY, familyNameError } from './family';
import { Modal } from './ui';
import BuddyAvatar from './BuddyAvatar';
import './profile-accounts.css';

export default function FamilyMembers({ onClose }: { onClose: () => void }) {
  const tr = useCopy();
  const { profile } = useNarra();
  const { player, setPlayer } = usePlayer();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const members = player.familyMembers;
  const full = members.length + 1 >= FAMILY_CAPACITY;
  function add(event: FormEvent) {
    event.preventDefault();
    const issue = familyNameError(name, profile.name, members);
    if (issue) {
      setError(issue === 'full' ? tr('Your list already has four people.', 'Danh sách đã đủ 4 người rồi nhé.') : issue === 'duplicate' ? tr('This name is already on your list, add a nickname to tell them apart.', 'Tên này đã có trong danh sách, bạn thêm biệt danh để phân biệt nhé.') : tr('Add a name first.', 'Bạn nhập tên thành viên nhé.'));
      return;
    }
    const member = { id: crypto.randomUUID(), name: name.trim() };
    setPlayer(current => current.familyMembers.length < FAMILY_CAPACITY - 1 ? { ...current, familyMembers: [...current.familyMembers, member] } : current);
    setName(''); setError('');
    setNotice(tr(`${member.name} is saved to your preview list, no invitation was sent.`, `Đã lưu ${member.name} vào danh sách xem trước, chưa gửi lời mời nhé.`));
  }
  return <Modal title={tr('My Family members', 'Thành viên gia đình')} onClose={onClose}>
    <div className="family-welcome"><div><span><Heart size={14} />NARRA FAMILY</span><h3>{tr('A little team, a lot of stories.', 'Nhà mình, cả rổ chuyện hay!')}</h3><p>{tr('Save a place for your favourite people.', 'Giữ một chỗ cho những người thương nhé.')}</p></div><BuddyAvatar mood="celebrate" size={96} motion={false} /></div>
    <div className="family-list-heading"><h3>{tr('Our little circle', 'Nhà mình có')} <span>{members.length + 1}/{FAMILY_CAPACITY}</span></h3><span>{tr('Preview', 'Xem trước')}</span></div>
    <ul className="family-member-list">
      <li><span className="family-member-avatar family-owner"><Crown size={21} /></span><span className="family-member-copy"><strong>{profile.name} <small>({tr('you', 'bạn')})</small></strong><span>{tr('Group owner', 'Chủ nhóm')}</span></span><span className="family-member-tag">{tr('On this device', 'Trên máy')}</span></li>
      {members.map(member => <li key={member.id}><span className="family-member-avatar"><UserRound size={21} /></span><span className="family-member-copy"><strong>{member.name}</strong><span>{tr('Saved, not invited yet', 'Đã lưu, chưa gửi lời mời')}</span></span><button type="button" className="family-remove" aria-label={tr(`Remove ${member.name} from the preview list`, `Bỏ ${member.name} khỏi danh sách xem trước`)} onClick={() => { setPlayer(current => ({ ...current, familyMembers: current.familyMembers.filter(item => item.id !== member.id) })); setError(''); setNotice(tr('Removed from your preview list.', 'Đã bỏ khỏi danh sách xem trước.')); }}><Trash2 size={17} /></button></li>)}
      {!full && <li className="family-empty-seat"><span className="family-member-avatar"><Users size={20} /></span><span className="family-member-copy"><strong>{tr(`${FAMILY_CAPACITY - members.length - 1} places for your people`, `Còn ${FAMILY_CAPACITY - members.length - 1} chỗ cho người thương`)}</strong><span>{tr('Up to four people, including you', 'Tối đa 4 người, gồm cả bạn')}</span></span></li>}
    </ul>
    {!full ? <form className="account-add-form" onSubmit={add}><label htmlFor="family-member-name">{tr('Add to the preview list', 'Thêm vào danh sách xem trước')}</label><input id="family-member-name" value={name} onChange={event => { setName(event.target.value); setError(''); }} maxLength={35} placeholder={tr('Name of your family member', 'Tên thành viên trong gia đình')} autoComplete="off" required aria-invalid={!!error} aria-describedby={error ? 'family-name-error' : undefined} />{error && <p id="family-name-error" className="account-form-error" role="alert">{error}</p>}<button type="submit" className="account-primary"><Plus size={18} />{tr('Save to our list', 'Lưu vào danh sách')}</button></form> : <p className="family-full"><Heart size={17} />{tr('Four people, ready for a little adventure!', 'Đủ 4 người, nhà mình đông vui rồi nè!')}</p>}
    {notice && <p className="account-dialog-notice" role="status">{notice}</p>}
    <p className="account-local-note">{tr('This Family list stays in this learning profile on this device. Shared accounts, invitations and subscriptions are not connected yet, and your plan remains Free.', 'Danh sách Family lưu trong hồ sơ học này trên thiết bị. Tài khoản dùng chung, lời mời và thanh toán chưa kết nối, gói hiện tại vẫn là Free nhé.')}</p>
  </Modal>;
}
