import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ArrowLeft, Bell, Check, CheckCircle2, Copy, Glasses, Headphones, Heart, Palette, Share2, ShieldCheck, Sparkles, Users, X, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { usePlayer, type Appearance } from './game';
import { useCopy, useNarra } from './state';
import { Modal } from './ui';
import './player-extras.css';

const skinColors = ['#f6d8bd', '#edb69b', '#d89b6c', '#b9784f', '#8b563b', '#5c392a'];
const hairColors = ['#25313b', '#67412e', '#a45d34', '#e0b75e', '#d7d5cf', '#24334c'];
const shirtColors = ['#99ef32', '#6dd9ff', '#ff7c20', '#ef77aa', '#252b2a', '#f8f8f2'];

export function PersonalAvatar({ className = '', appearance }: { className?: string; appearance?: Appearance }) {
  const { player } = usePlayer(); const tr = useCopy(); const look = appearance ?? player.appearance;
  const key = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return <svg className={'personal-avatar '+className} viewBox="0 0 240 260" role="img" aria-label={tr('Your Narra avatar', 'Avatar Narra của bạn')}>
    <defs><clipPath id={key+'-crop'}><rect x="10" y="12" width="220" height="238" rx="76" /></clipPath></defs>
    <g clipPath={'url(#'+key+'-crop)'}>
      <rect x="10" y="12" width="220" height="238" rx="76" fill="#dff5fa" />
      <circle cx="195" cy="42" r="65" fill="#c4edee" />
      {look.hairStyle === 'curly' && <path d="M54 117C26 61 52 22 112 23c66-4 104 36 79 105l-12 36H66Z" fill={look.hair} />}
      <path d="M27 266v-35c0-37 31-65 93-65s93 28 93 65v35Z" fill={look.shirt} />
      <path d="M29 230c7-33 25-46 43-50l-10 86H27Zm182 0c-7-33-25-46-43-50l10 86h35Z" fill="#000" opacity=".055" />
      <rect x="101" y="146" width="38" height="43" rx="17" fill={look.skin} />
      <path d="M101 154h38v11c-10 10-26 10-38 0Z" fill="#000" opacity=".09" />
      <path d="M94 179q26 29 52 0" fill="none" stroke="#000" strokeWidth="6" opacity=".07" />
      <ellipse cx="57" cy="116" rx="13" ry="18" fill={look.skin} /><ellipse cx="183" cy="116" rx="13" ry="18" fill={look.skin} />
      <ellipse cx="120" cy="107" rx="63" ry="70" fill={look.skin} />
      <ellipse cx="72" cy="136" rx="12" ry="7" fill="#e98586" opacity=".35" /><ellipse cx="168" cy="136" rx="12" ry="7" fill="#e98586" opacity=".35" />
      {look.hairStyle === 'swoop' ? <><path d="M56 108C41 75 51 43 80 33c17-18 57-24 83-4 23 3 33 23 27 43-1 13-5 24-10 36l-7-35c-13 3-28-3-35-13-14 22-43 22-72 21l-5 27Z" fill={look.hair} /><path d="M74 56c17-20 44-22 59-16" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".1" /></> : look.hairStyle === 'short' ? <><path d="M55 105V75c0-33 24-52 65-52s65 19 65 52v30l-13-30-13 4-10-8-14 8-15-8-15 8-14-8-13 9-10-5-11 30Z" fill={look.hair} /><path d="M71 56c18-12 31-15 48-14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".09" /></> : <><path d="M53 103c0-39 19-65 67-65s68 26 68 65l-15-28c-24 11-67 13-103 0Z" fill={look.hair} />{[[60,70,19],[75,47,20],[99,35,21],[125,35,22],[151,41,20],[175,61,20],[182,85,16]].map(([cx,cy,r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill={look.hair} />)}<path d="M78 43q13-13 25-6" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".1" /></>}
      <path d="M77 91q12-8 24-3m38 0q12-5 24 3" fill="none" stroke={look.hair} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="94" cy="113" rx="14" ry="18" fill="#fff" /><ellipse cx="146" cy="113" rx="14" ry="18" fill="#fff" />
      <ellipse cx="97" cy="116" rx="7" ry="10" fill="#272a2b" /><ellipse cx="143" cy="116" rx="7" ry="10" fill="#272a2b" />
      <circle cx="99" cy="111" r="2.7" fill="#fff" /><circle cx="145" cy="111" r="2.7" fill="#fff" />
      <path d="M119 119q-5 12 3 13" fill="none" stroke="#56341f" strokeWidth="2.5" strokeLinecap="round" opacity=".28" />
      <path d="M104 146q16 19 32 0" fill="#55352f" stroke="#55352f" strokeWidth="3" strokeLinejoin="round" /><path d="M107 147h26q-13 8-26 0" fill="#fff" />
      {look.accessory === 'glasses' && <g fill="none" stroke="#283038" strokeWidth="4"><rect x="72" y="97" width="44" height="34" rx="12" fill="#ffffff0a" /><rect x="124" y="97" width="44" height="34" rx="12" fill="#ffffff0a" /><path d="M116 109q4-3 8 0m-52-3-12-5m108 5 12-5" /></g>}
      {look.accessory === 'headphones' && <g><path d="M48 113V88c0-45 32-66 72-66s72 21 72 66v25" fill="none" stroke="#283440" strokeWidth="10" strokeLinecap="round" /><rect x="39" y="100" width="21" height="42" rx="10" fill="#68d6f5" stroke="#283440" strokeWidth="4" /><rect x="180" y="100" width="21" height="42" rx="10" fill="#68d6f5" stroke="#283440" strokeWidth="4" /></g>}
      <circle cx="120" cy="218" r="12" fill="#ffffffa6" /><path d="M115 222v-9m0 4c0-6 10-6 10 0v5" fill="none" stroke="#25352a" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>;
}

function useExtraPage(back: RefObject<HTMLButtonElement | null>, onClose: () => void) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null; back.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } };
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('keydown', escape); document.body.style.overflow = overflow; requestAnimationFrame(() => { if (previous?.isConnected && previous !== document.body && !previous.closest('[inert]')) previous.focus({ preventScroll: true }); }); };
  }, []);
}

function ColorChoices({ title, colors, value, onChange }: { title: string; colors: string[]; value: string; onChange: (color: string) => void }) {
  const tr = useCopy();
  return <fieldset className="player-studio-field"><legend>{title}</legend><div className="player-color-choices">{colors.map((color,index) => <button type="button" className={value.toLowerCase() === color.toLowerCase() ? 'selected' : ''} key={color} style={{ '--swatch': color } as CSSProperties} aria-label={title+' '+(index+1)} aria-pressed={value.toLowerCase() === color.toLowerCase()} onClick={() => onChange(color)}>{value.toLowerCase() === color.toLowerCase() && <span><Check size={14} strokeWidth={3} /></span>}<span className="sr-only">{tr('Color', 'Màu')} {index+1}</span></button>)}</div></fieldset>;
}

export function AvatarStudio({ onClose }: { onClose: () => void }) {
  const { player, setPlayer, level } = usePlayer(); const { notify } = useNarra(); const tr = useCopy();
  const [draft, setDraft] = useState<Appearance>(() => ({ ...player.appearance })); const back = useRef<HTMLButtonElement>(null);
  useExtraPage(back,onClose);
  const styles: { value: Appearance['hairStyle']; name: string }[] = [{ value: 'swoop', name: tr('The swoop', 'Tóc vuốt') }, { value: 'curly', name: tr('Soft curls', 'Tóc xoăn') }, { value: 'short', name: tr('Short & easy', 'Tóc ngắn') }];
  function choose<K extends keyof Appearance>(key: K, value: Appearance[K]) { setDraft(current => ({ ...current, [key]: value })); }
  return <section className="player-extra-page avatar-studio-page" aria-label={tr('Avatar studio', 'Thiết kế avatar')}>
    <header className="player-extra-header"><button ref={back} onClick={onClose} aria-label={tr('Cancel avatar editing', 'Hủy chỉnh sửa avatar')}><ArrowLeft size={23} /></button><h1>{tr('Your look, your story', 'Diện mạo của riêng bạn')}</h1><span className="player-level-pill">{tr('Level', 'Cấp')} {level}</span></header>
    <div className="player-studio-layout"><div className="player-studio-preview"><span className="player-studio-kicker"><Palette size={15} />{tr('NARRA AVATAR STUDIO', 'XƯỞNG AVATAR NARRA')}</span><div className="player-preview-art"><span className="player-preview-spark spark-one">✦</span><PersonalAvatar appearance={draft} /><span className="player-preview-spark spark-two">✧</span></div><h2>{tr('A little more you.', 'Một chút cá tính của bạn.')}</h2><p>{tr('Make a face you’ll be happy to see every day.', 'Tạo một gương mặt khiến bạn vui mỗi lần quay lại học.')}</p><span className="player-studio-free"><CheckCircle2 size={15} />{tr('Every style is yours to try', 'Thoải mái thử mọi phong cách')}</span></div>
      <div className="player-studio-options"><fieldset className="player-studio-field"><legend>{tr('Hair style', 'Kiểu tóc')}</legend><div className="player-hair-choices">{styles.map(style => <button key={style.value} aria-pressed={draft.hairStyle === style.value} className={draft.hairStyle === style.value ? 'selected' : ''} onClick={() => choose('hairStyle',style.value)}><PersonalAvatar appearance={{ ...draft, hairStyle: style.value, accessory: 'none' }} /><span>{style.name}</span>{draft.hairStyle === style.value && <CheckCircle2 size={17} />}</button>)}</div></fieldset>
        <ColorChoices title={tr('Hair color', 'Màu tóc')} colors={hairColors} value={draft.hair} onChange={color => choose('hair',color)} />
        <ColorChoices title={tr('Skin tone', 'Màu da')} colors={skinColors} value={draft.skin} onChange={color => choose('skin',color)} />
        <ColorChoices title={tr('Your favorite shirt', 'Màu áo yêu thích')} colors={shirtColors} value={draft.shirt} onChange={color => choose('shirt',color)} />
        <fieldset className="player-studio-field"><legend>{tr('The finishing touch', 'Điểm nhấn cuối cùng')}</legend><div className="player-accessory-choices">{([{ value: 'none', label: tr('Just me', 'Đơn giản'), Icon: X }, { value: 'glasses', label: tr('Glasses', 'Kính mắt'), Icon: Glasses }, { value: 'headphones', label: tr('Headphones', 'Tai nghe'), Icon: Headphones }] as const).map(({value,label,Icon}) => <button key={value} aria-pressed={draft.accessory === value} className={draft.accessory === value ? 'selected' : ''} onClick={() => choose('accessory',value)}><Icon size={24} /><span>{label}</span></button>)}</div></fieldset>
        <div className="player-studio-actions"><button className="player-extra-primary" onClick={() => { setPlayer(current => ({ ...current, appearance: { ...draft } })); notify(tr('Your new look is saved!', 'Đã lưu diện mạo mới của bạn!')); onClose(); }}>{tr('Save my look', 'Lưu diện mạo')}<Check size={18} /></button><button className="player-extra-quiet" onClick={onClose}>{tr('Cancel', 'Hủy')}</button></div>
      </div>
    </div>
  </section>;
}

export function PlansPanel({ onClose }: { onClose: () => void }) {
  const { player, setPlayer } = usePlayer(); const tr = useCopy(); const back = useRef<HTMLButtonElement>(null); const [notice, setNotice] = useState('');
  useExtraPage(back,onClose);
  const plans = [{ id: 'free', name: 'Narra Free', Icon: Heart, headline: tr('A little every day.', 'Một chút mỗi ngày.'), label: tr('Your current experience', 'Trải nghiệm hiện tại của bạn'), features: [tr('Save and review your words', 'Lưu từ và ôn từ vựng'), tr('Explore guided lesson previews', 'Khám phá các bài học mẫu'), tr('Keep your progress on this device', 'Lưu tiến độ trên thiết bị')] }, { id: 'plus', name: 'Narra Plus', Icon: Zap, headline: tr('More room to grow.', 'Thêm không gian để tiến bộ.'), label: tr('Planned features · coming soon', 'Tính năng dự kiến · sắp ra mắt'), features: [tr('Live voice conversations with a tutor', 'Hội thoại bằng giọng nói với gia sư'), tr('Personalized speaking feedback', 'Nhận xét luyện nói dành riêng cho bạn'), tr('Learning recommendations for your goals', 'Gợi ý học phù hợp với mục tiêu')] }, { id: 'family', name: 'Narra Family', Icon: Users, headline: tr('A story to share.', 'Cùng nhau viết câu chuyện mới.'), label: tr('Planned features · coming soon', 'Tính năng dự kiến · sắp ra mắt'), features: [tr('A shared plan for your learning circle', 'Gói học chung cho những người thân'), tr('A separate profile for every learner', 'Hồ sơ riêng cho từng người học'), tr('Individual learning goals and progress', 'Mục tiêu và tiến độ riêng của mỗi người')] }] as const;
  function interest(plan: 'plus' | 'family') { setPlayer(current => ({ ...current, planInterest: plan })); setNotice(tr('Your interest is saved on this device. Email notifications are not connected yet.', 'Đã lưu lựa chọn trên thiết bị. Tính năng gửi thông báo qua email chưa được kết nối.')); }
  return <section className="player-extra-page player-plans-page" aria-label={tr('Narra plans', 'Các gói Narra')}><header className="player-extra-header"><button ref={back} onClick={onClose} aria-label={tr('Back to Profile', 'Quay lại Hồ sơ')}><ArrowLeft size={23} /></button><h1>{tr('Your next chapter', 'Chặng đường tiếp theo')}</h1><span className="player-coming-pill">{tr('A little preview', 'Xem trước')}</span></header>
    <div className="player-plans-content"><section className="player-plans-hero"><div><span><Sparkles size={16} />{tr('MAKE ROOM FOR YOUR ENGLISH', 'THÊM KHÔNG GIAN CHO TIẾNG ANH')}</span><h2>{tr('Big possibilities.\nYour kind of pace.', 'Nhiều cơ hội mới.\nTheo nhịp của bạn.')}</h2><p>{tr('We’re imagining what comes next. Here’s a first look at the plans we’re building.', 'Narra đang chuẩn bị chặng đường tiếp theo. Cùng xem trước những gói học dự kiến nhé.')}</p></div><div className="player-plan-art" aria-hidden="true"><span className="player-plan-star">✦</span><PersonalAvatar /><span className="player-plan-heart"><Heart size={24} fill="currentColor" /></span></div></section>
      <div className="player-plan-grid">{plans.map(plan => <article className={'player-plan-card plan-'+plan.id} key={plan.id}><span className="player-plan-icon"><plan.Icon size={27} /></span><div className="player-plan-name"><h3>{plan.name}</h3><span>{plan.id === 'free' ? tr('Current', 'Hiện tại') : tr('Coming soon', 'Sắp ra mắt')}</span></div><p className="player-plan-headline">{plan.headline}</p><p className="player-plan-price">{plan.id === 'free' ? tr('Free', 'Miễn phí') : tr('Soon', 'Sắp công bố')}</p><p className="player-plan-feature-label">{plan.label}</p><ul>{plan.features.map(feature => <li key={feature}><Check size={16} /><span>{feature}</span></li>)}</ul>{plan.id === 'free' ? <button className="player-plan-current" disabled><ShieldCheck size={18} />{tr('Your current plan', 'Gói bạn đang dùng')}</button> : <button className="player-extra-primary" onClick={() => interest(plan.id)}>{player.planInterest === plan.id ? <><Check size={18} />{tr('Interest saved', 'Đã lưu lựa chọn')}</> : <><Bell size={17} />{tr('Notify me', 'Báo cho mình nhé')}</>}</button>}</article>)}</div>
      {notice && <p className="player-plan-notice" role="status"><CheckCircle2 size={19} /><span>{notice}</span></p>}
      {player.planInterest !== 'free' && <button className="player-extra-quiet player-clear-interest" onClick={() => { setPlayer(current => ({ ...current, planInterest: 'free' })); setNotice(tr('Your plan interest has been cleared. You’re still on Narra Free.', 'Đã xóa lựa chọn. Bạn vẫn đang dùng Narra Free.')); }}>{tr('Clear my saved interest', 'Xóa lựa chọn đã lưu')}</button>}
      <p className="player-plan-footnote">{tr('Preview only. No payment is taken. Your plan remains Narra Free.', 'Đây là bản xem trước. Không thu phí. Gói hiện tại của bạn vẫn là Narra Free.')}</p>
    </div>
  </section>;
}

export function ShareProfile({ onClose }: { onClose: () => void }) {
  const { player } = usePlayer(); const { profile, notify } = useNarra(); const tr = useCopy();
  const [qr, setQr] = useState(''); const [qrError, setQrError] = useState(false); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const linkInput = useRef<HTMLInputElement>(null); const mounted = useRef(true);
  const link = `${location.origin}/?invite=${encodeURIComponent(player.shareId)}#profile`;
  useEffect(() => { let active = true; mounted.current = true; setQr(''); setQrError(false); QRCode.toDataURL(link, { width: 320, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#080a09', light: '#ffffff' } }).then(data => { if (active) setQr(data); }).catch(() => { if (active) setQrError(true); }); return () => { active = false; mounted.current = false; }; }, [link]);
  async function copy() {
    setBusy(true);
    try { if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(link); if (mounted.current) { setNotice(tr('Link copied. Ready when you are!', 'Đã sao chép liên kết!')); notify(tr('Profile link copied', 'Đã sao chép liên kết hồ sơ')); } }
    catch { if (mounted.current) { setNotice(tr('Copy isn’t available here. Select and copy the link below.', 'Chưa sao chép tự động được. Hãy chọn và sao chép liên kết bên dưới.')); linkInput.current?.focus(); linkInput.current?.select(); } }
    finally { if (mounted.current) setBusy(false); }
  }
  async function share() {
    if (!navigator.share) return; setBusy(true);
    try { await navigator.share({ title: profile.name+' · Narra', text: tr('Your English, your story. Join me on Narra.', 'Tiếng Anh của bạn, câu chuyện của bạn. Cùng mình học với Narra nhé.'), url: link }); if (mounted.current) setNotice(tr('Shared using your device.', 'Đã chia sẻ bằng tính năng của thiết bị.')); }
    catch (error) { if (mounted.current) setNotice(error instanceof DOMException && error.name === 'AbortError' ? tr('Share cancelled. Your link is ready below.', 'Đã hủy chia sẻ. Liên kết vẫn ở bên dưới.') : tr('Sharing isn’t available right now. You can copy the link instead.', 'Chưa chia sẻ được lúc này. Bạn có thể sao chép liên kết.')); }
    finally { if (mounted.current) setBusy(false); }
  }
  return <Modal title={tr('A little hello from you', 'Gửi một lời chào từ bạn')} onClose={onClose}><div className="player-share-card"><div className="player-share-avatar"><PersonalAvatar /><span>✦</span></div><h3>{profile.name}</h3><p className="player-share-handle">@{player.handle.replace(/^@/,'')}</p><div className="player-share-qr">{qr ? <img src={qr} alt={tr('QR code for your Narra profile link', 'Mã QR dẫn đến liên kết hồ sơ Narra')} width={320} height={320} /> : <p role="status">{qrError ? tr('QR code couldn’t load. Your link still works below.', 'Chưa tạo được mã QR. Bạn vẫn có thể dùng liên kết bên dưới.') : tr('Making your QR code…', 'Đang tạo mã QR…')}</p>}</div><p className="player-share-scan">{tr('Scan a little hello.', 'Quét mã, gửi lời chào.')}</p></div><label className="player-share-link"><span>{tr('Your Narra link', 'Liên kết Narra của bạn')}</span><input ref={linkInput} readOnly value={link} onFocus={event => event.currentTarget.select()} /></label><div className="player-share-actions"><button className="player-extra-primary" disabled={busy} onClick={copy}><Copy size={18} />{tr('Copy link', 'Sao chép liên kết')}</button>{typeof navigator.share === 'function' && <button className="player-share-native" disabled={busy} onClick={share}><Share2 size={18} />{tr('Share', 'Chia sẻ')}</button>}</div>{notice && <p className="player-share-notice" role="status">{notice}</p>}<p className="player-share-footnote">{tr('Profile preview · saved on this device. This link opens Narra; your profile data stays on this device.', 'Hồ sơ xem trước · lưu trên thiết bị. Liên kết mở Narra; thông tin hồ sơ vẫn ở trên thiết bị của bạn.')}</p></Modal>;
}
