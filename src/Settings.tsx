import { brandAsset } from './brand-variant';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Bell, BookOpen, ChevronRight, ChevronsUpDown, CircleHelp, Heart, Info, LockKeyhole, LogOut, MonitorSmartphone, Play, ShieldCheck, UserRound } from 'lucide-react';
import { useCopy, useNarra, type Profile } from './state';
import { Modal } from './ui';

type Props = { onClose: () => void; onTutors: () => void };
type Dialog = 'account' | 'privacy' | 'help' | 'about' | null;
type Copy = (english: string, vietnamese: string) => string;
function Group({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) { return <section className="settings-group"><h2>{icon}{title}</h2><div className="card narra-settings-card">{children}</div></section>; }
function Toggle({ label, checked, onChange, detail }: { label: string; checked: boolean; onChange: () => void; detail?: string }) { return <div className="narra-setting-row"><span>{label}{detail && <small className="settings-row-detail">{detail}</small>}</span><button role="switch" className={'switch '+(checked ? 'on' : '')} aria-label={label} aria-checked={checked} onClick={onChange} /></div>; }
function SelectSetting({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="narra-setting-row"><span>{label}</span><span className="narra-setting-select"><select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronsUpDown size={16} /></span></label>;
}
function InformationDialog({ kind, tr, close }: { kind: Exclude<Dialog, null>; tr: Copy; close: () => void }) {
  const titles = { account: tr('Your account', 'Tài khoản của bạn'), privacy: tr('Your data and privacy', 'Dữ liệu và quyền riêng tư'), help: tr('A place for every next step', 'Bạn muốn bắt đầu từ đâu nè?'), about: tr('About Narra', 'Về Narra') };
  return <Modal title={titles[kind]} onClose={close}>
    {kind === 'account' ? <><div className="dialog-illustration tone-blue"><MonitorSmartphone size={42} /></div><p className="dialog-description">{tr('You are using the Narra interface preview as a guest. Your preferences, words and progress are stored in this browser.', 'Bạn đang dùng bản xem thử Narra với tư cách khách. Tùy chọn, từ vựng và tiến độ được lưu trong trình duyệt này.')}</p><p className="muted">{tr('Account sign-in and cloud sync are not connected. No account, subscription or payment has been created.', 'Đăng nhập và đồng bộ đám mây chưa được kết nối. Chưa có tài khoản, gói đăng ký hay thanh toán nào được tạo.')}</p></>
    : kind === 'privacy' ? <><div className="dialog-illustration tone-green"><ShieldCheck size={42} /></div><p className="dialog-description">{tr('Learning preferences, saved words and practice activity stay in this browser. Clearing browser data removes this local progress.', 'Tùy chọn học, từ đã lưu và hoạt động luyện tập được giữ trong trình duyệt này. Xóa dữ liệu trình duyệt sẽ xóa tiến độ trên thiết bị.')}</p><p className="muted">{tr('Microphone access is requested only when you choose to record. Audio playback belongs to the current practice session.', 'Quyền micro chỉ được yêu cầu khi bạn chọn ghi âm. Bản ghi để nghe lại thuộc phiên luyện tập hiện tại.')}</p></>
    : kind === 'help' ? <div className="settings-help-list"><p><strong>{tr('Lesson', 'Bài học')}</strong>{tr('Follow your study plan and continue the next lesson.', 'Chưa biết học gì hôm nay? Cùng mình tiếp tục bài đang học nhé.')}</p><p><strong>{tr('Practice', 'Luyện nói')}</strong>{tr('Choose Roleplay, Discussion, Debate or Interview to practise conversations.', "Bạn chọn một tình huống đời thường, chia sẻ ý kiến hay tập phỏng vấn cùng mình nhé.")}</p><p><strong>{tr('Dictionary', 'Từ điển')}</strong>{tr('Find saved words, review, use flashcards and explore focused practice.', "Ghé lại những từ bạn đã lưu để thử thẻ từ, bài nghe và phần luyện nói cùng mình nhé.")}</p><p><strong>{tr('Profile', 'Hồ sơ')}</strong>{tr('See your progress, study plan, tutor and settings.', 'Nhìn lại những bước tiến của bạn, chọn người đồng hành và chỉnh nhịp học cho vừa sức nhé.')}</p></div>
    : <><img className="settings-about-logo" src={brandAsset('logo-dark.webp')} alt="Narra" /><p className="dialog-description">Your voice, your story!</p><p className="muted">{tr('A friendly space to find your voice in English. This interface preview uses local learning data; live AI services are not connected.', 'Một không gian thân thiện để tìm thấy tiếng nói của bạn bằng tiếng Anh. Bản xem thử giao diện dùng dữ liệu trên thiết bị; các dịch vụ AI trực tiếp chưa được kết nối.')}</p></>}
    <button className="primary-button full-width" onClick={close}>{tr('Got it', 'Đã hiểu')}</button>
  </Modal>;
}
export default function Settings({ onClose, onTutors }: Props) {
  const { profile, setProfile } = useNarra(); const tr = useCopy();
  const back = useRef<HTMLButtonElement>(null); const [dialog, setDialog] = useState<Dialog>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; back.current?.focus({ preventScroll: true }); return () => { document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  function update<K extends keyof Profile>(key: K, value: Profile[K]) { setProfile(current => ({ ...current, [key]: value })); }
  const goals = [{ value: 'Study abroad', label: tr('Study abroad', 'Du học') }, { value: 'Career growth', label: tr('Career growth', 'Phát triển sự nghiệp') }, { value: 'Travel', label: tr('Travel', 'Du lịch') }, { value: 'Everyday confidence', label: tr('Everyday confidence', 'Tự tin mỗi ngày') }, { value: 'Make friends', label: tr('Make friends', 'Kết bạn') }];
  const languages = [['Vietnamese', 'Tiếng Việt'], ['English', 'Tiếng Anh'], ['Thai', 'Tiếng Thái'], ['Spanish', 'Tiếng Tây Ban Nha'], ['French', 'Tiếng Pháp'], ['Japanese', 'Tiếng Nhật'], ['Korean', 'Tiếng Hàn'], ['Chinese', 'Tiếng Trung']];
  return <section className="settings-page" aria-label={tr('Settings', 'Cài đặt')}>
    <header className="settings-page-header"><button ref={back} className="device-button" onClick={onClose} aria-label={tr('Back to profile', 'Quay lại hồ sơ')}><ArrowLeft size={21} /></button><h1>{tr('Settings', 'Cài đặt')}</h1><span><ShieldCheck size={14} />{tr('Local', 'Trên máy')}</span></header>
    <div className="settings-page-content"><p className="settings-intro">{tr("Let’s make Narra feel a little more you, with your choices saved in this browser.", "Mình chỉnh Narra cho hợp với bạn nhé, những lựa chọn này được lưu trên trình duyệt của bạn.")}</p>
      <Group title={tr('Learning', 'Học tập')} icon={<BookOpen size={18} />}>
        <SelectSetting label={tr('Level', 'Trình độ')} value={profile.level} options={['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(value => ({ value, label: value }))} onChange={value => update('level', value)} />
        <SelectSetting label={tr('Goal', 'Mục đích học')} value={profile.goal} options={goals} onChange={value => update('goal', value)} />
        <SelectSetting label={tr('Native language', 'Ngôn ngữ mẹ đẻ')} value={profile.language} options={languages.map(([value, vi]) => ({ value, label: tr(value, vi) }))} onChange={value => update('language', value)} />
        <SelectSetting label={tr('Daily goal', 'Mục tiêu hằng ngày')} value={String(profile.dailyGoal)} options={[5, 10, 15, 20, 30].map(value => ({ value: String(value), label: value+' '+tr('min', 'phút') }))} onChange={value => update('dailyGoal', Number(value))} />
        <button className="narra-setting-row" onClick={onTutors}><span>{tr('AI tutor', 'Gia sư AI')}</span><span className="settings-row-value">{profile.tutor}<ChevronRight size={17} /></span></button>
        <Toggle label={tr('Feedback & corrections', 'Góp ý và sửa lỗi')} checked={profile.feedback} onChange={() => update('feedback', !profile.feedback)} />
        <Toggle label={tr('Tutor voice', 'Giọng nói gia sư')} detail={tr('Automatically read tutor replies aloud', 'Tự động đọc câu trả lời của gia sư')} checked={profile.sound} onChange={() => update('sound', !profile.sound)} />
      </Group>
      <Group title={tr('Reminders & Notifications', 'Nhắc học & Thông báo')} icon={<Bell size={18} />}>
        <Toggle label={tr('Daily reminder preference', 'Tùy chọn nhắc học mỗi ngày')} checked={profile.reminders} onChange={() => update('reminders', !profile.reminders)} />
        <label className={'narra-setting-row '+(!profile.reminders ? 'settings-row-disabled' : '')}><span>{tr('Reminder time', 'Giờ nhắc học')}</span><input type="time" aria-label={tr('Reminder time', 'Giờ nhắc học')} value={profile.reminderTime} disabled={!profile.reminders} onChange={event => { if (event.target.value) update('reminderTime', event.target.value); }} /></label>
        <Toggle label={tr('Study notification preference', 'Tùy chọn thông báo học tập')} checked={profile.notifications} onChange={() => update('notifications', !profile.notifications)} />
        <p className="settings-group-note"><Info size={15} />{tr("These are preferences only, with scheduled reminders and push notifications not yet connected in this preview.", "Đây là tùy chọn cá nhân, bản xem thử chưa gửi nhắc học theo lịch hay thông báo đẩy nhé.")}</p>
      </Group>
      <Group title={tr('Account', 'Tài khoản')} icon={<UserRound size={18} />}>
        <div className="narra-setting-row settings-account-state"><span><strong>{tr('Preview access with a code', 'Đang trải nghiệm bằng mã')}</strong><small>{tr('Cloud sync is not connected', 'Chưa kết nối đồng bộ đám mây')}</small></span><LockKeyhole size={18} /></div>
        <label className="narra-setting-row"><span>{tr('Your name', 'Tên của bạn')}</span><input type="text" aria-label={tr('Your name', 'Tên của bạn')} value={profile.name} maxLength={35} onChange={event => update('name', event.target.value)} onBlur={() => update('name', profile.name.trim() || 'Tuan Quoc')} /></label>
        <SelectSetting label={tr('App language', 'Ngôn ngữ ứng dụng')} value={profile.uiLanguage} options={[{ value: 'English', label: 'English' }, { value: 'Tiếng Việt', label: 'Tiếng Việt' }]} onChange={value => update('uiLanguage', value as Profile['uiLanguage'])} />
        <SelectSetting label={tr('Appearance', 'Giao diện')} value={profile.theme} options={[{value:'light',label:tr('Light', 'Sáng')},{value:'dark',label:tr('Dark', 'Tối')},{value:'system',label:tr('System', 'Theo hệ thống')}]} onChange={value => update('theme', value as Profile['theme'])} />
        <button className="narra-setting-row" onClick={() => setDialog('account')}><span>{tr('Account information', 'Thông tin tài khoản')}</span><ChevronRight size={17} /></button>
        <button className="narra-setting-row" onClick={() => setDialog('privacy')}><span>{tr('Data & privacy', 'Dữ liệu & quyền riêng tư')}</span><ChevronRight size={17} /></button>
        <button className="narra-setting-row" onClick={() => window.dispatchEvent(new Event('narra:sign-out'))}><span>{tr('Sign out, keep my progress on this device', 'Đăng xuất, giữ tiến độ trên máy')}</span><LogOut size={17} /></button>
      </Group>
      <Group title={tr('More', 'Thông tin thêm')} icon={<CircleHelp size={18} />}><button className="narra-setting-row" onClick={() => setDialog('help')}><span>{tr('Help & getting started', 'Trợ giúp & bắt đầu học')}</span><ChevronRight size={17} /></button><button className="narra-setting-row" onClick={() => window.dispatchEvent(new Event('narra:replay-intro'))}><span>{tr('Meet Narra Buddy again', 'Xem lại lời chào của Narra Buddy')}</span><Play size={17}/></button><button className="narra-setting-row" onClick={() => setDialog('about')}><span>{tr('About Narra', 'Về Narra')}</span><Heart size={17} /></button></Group>
      <div className="settings-page-footer"><ShieldCheck size={15} />{tr('Your preferences stay on this device.', 'Tùy chọn của bạn được lưu trên thiết bị này.')}</div>
    </div>{dialog && <InformationDialog kind={dialog} tr={tr} close={() => setDialog(null)} />}
  </section>;
}

