import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Facebook, KeyRound, Mail, RotateCcw, Sparkles } from 'lucide-react';
import { brandAsset, isOption5 } from './brand-variant';
import { acceptsPreviewCode, createEntrySession, facebookSupportUrl, isAppleMobileDevice, type EntrySession } from './entry-session';
import { useCopy, useNarra } from './state';
import LanguageSwitch from './LanguageSwitch';
import './auth-screen.css';
import { useAccounts } from './AccountContext';
import AccountsDialog from './AccountsDialog';

type Page = 'login' | 'email' | 'code' | 'signup' | 'apple' | 'help';
function AppleMark() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.1 12.5c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.8.7 1 1.5 2 2.6 2 1 0 1.5-.7 2.9-.7s1.8.7 3 .7 1.9-1 2.6-2c.8-1.1 1.2-2.2 1.2-2.3-.1 0-2-.8-2-2.9ZM14.9 6.3c.6-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.2 1.8-1.1 2.9 1 .1 2.1-.5 2.8-1.3Z" /></svg>;
}

export default function AuthScreen({ onEnter }: { onEnter: (session: EntrySession) => void }) {
  const tr = useCopy();
  const { profile } = useNarra();
  const { activeAccount, accounts } = useAccounts();
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [page, setPage] = useState<Page>('login');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [motion, setMotion] = useState(1);
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const entering = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const appleMobile = isAppleMobileDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
  const supportUrl = facebookSupportUrl(import.meta.env.VITE_FACEBOOK_SUPPORT_URL);
  const captions = [tr('You showed up, I lost my chill!', 'Bạn vừa tới, tớ mất bình tĩnh!'), tr('My last brain cell says heyyy!', 'Não còn một nếp, vẫn hóng bạn kể!'), tr('Big stories, tiny chaos buddy!', 'Bạn tới, Buddy tới công chuyện!')];
  const pageTitle = tr('Come say hello! | Narra', 'Vào kể chuyện nào! | Narra');
  useEffect(() => { document.title = pageTitle; }, [pageTitle]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (page === 'code' || page === 'email' || page === 'signup') input.current?.focus(); else heading.current?.focus({ preventScroll: true }); });
    return () => cancelAnimationFrame(frame);
  }, [page]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function go(next: Page) { setError(''); setNotice(''); setPage(next); }
  function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entering.current) return;
    if (!acceptsPreviewCode(code)) { setError(tr('Buddy did a double take, that code does not match, try again?', 'Buddy nhìn hai lần rồi, mã này chưa khớp, mình thử lại nhé!')); input.current?.focus(); return; }
    entering.current = true; setError(''); setBusy(true); setWelcome(true); setMotion(value => value + 1);
    timer.current = setTimeout(() => { onEnter(createEntrySession(activeAccount.id)); document.title = 'Narra - Your voice, your story!'; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 850);
  }
  function emailPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(tr('Email is not connected yet, so nothing was sent and no account was created, use your access code to try Narra for now!', 'Email chưa được kết nối nên chưa gửi thư hay tạo tài khoản, mình dùng mã để thử Narra trước nhé!'));
  }
  const title = welcome ? tr('You’re in, let’s gooo!', 'Đúng hội rồi, lên thôiii!') : page === 'signup' ? tr('Join the story club!', 'Nhập hội kể chuyện nào!') : page === 'code' ? tr('Got the secret handshake?', 'Có mật mã hội mình chưa?') : page === 'email' ? tr('Hello, inbox buddy!', 'Chào bạn qua hộp thư nhé!') : page === 'help' ? tr('Buddy to the rescue!', 'Buddy gỡ rối đây!') : page === 'apple' ? tr('A little Apple hello!', 'Chào bạn nhà Táo!') : tr('Come tell your story!', 'Vào kể chuyện nào!');

  return <main className="auth-page">
    <section className="auth-hello" aria-label={tr('Buddy is excited to see you', 'Buddy hào hứng chào bạn')}>
      <img className="auth-logo" src={brandAsset('logo-light.webp')} alt="Narra" width="180" height="50" />
      <div className="auth-hello-copy"><span className="auth-eyebrow">{tr('YOUR DAILY DOSE OF BUDDY', 'BUDDY HÓNG BẠN NÃY GIỜ')}</span><p>{tr('Heeey,', 'Heeeey,')}<br /><strong>{tr('you made it!', 'bạn tới rồi!')}</strong><span className="auth-title-spark" aria-hidden="true">✳</span></p></div>
      <div className="auth-mascot-stage">
        <span className="auth-orbit" aria-hidden="true" /><span className="auth-confetti auth-confetti-one" aria-hidden="true">✦</span><span className="auth-confetti auth-confetti-two" aria-hidden="true">✳</span><span className="auth-confetti auth-confetti-three" aria-hidden="true">!!</span>
        <div className="auth-mascot-runner" key={motion} data-crawl={isOption5}><img className="auth-mascot" src={brandAsset(isOption5 ? 'excited.webp' : 'mood-celebrate.webp')} alt={tr(isOption5 ? 'An armless caterpillar Buddy wriggling with excitement' : 'Blue Buddy hopping with excitement', isOption5 ? 'Sâu Buddy không tay, uốn mình nhảy tưng tưng vì vui' : 'Buddy xanh nhảy tưng tưng vì gặp bạn')} width="768" height="768" fetchPriority="high" draggable={false} /></div>
        <div className="auth-speech" key={`caption-${motion}`}>{welcome ? tr('That’s our buddy, let’s gooo!', 'Đúng người rồi, triển thôiii!') : captions[(motion - 1) % captions.length]}</div>
        <button className="auth-replay" type="button" onClick={() => setMotion(value => value + 1)} aria-label={tr('Buddy, do that again!', 'Buddy, quẩy lại nào!')}><RotateCcw size={15} /><span>{tr('Again, Buddy!', 'Quẩy lại!')}</span></button>
      </div>
      <p className="auth-slogan" lang="en">Your voice, your story</p>
    </section>
    <section className="auth-entry" aria-labelledby="auth-title">
      <div className="auth-entry-top"><span className="auth-mini-brand">Narra</span><LanguageSwitch /></div>
      <div className="auth-form-panel">
        {page !== 'login' && <button className="auth-back" type="button" onClick={() => go('login')} disabled={busy}><ArrowLeft size={18} />{tr('Back', 'Quay lại')}</button>}
        <span className="auth-panel-icon" aria-hidden="true">{welcome ? <Check size={24} /> : page === 'code' ? <KeyRound size={24} /> : <Sparkles size={24} />}</span>
        <h1 id="auth-title" ref={heading} tabIndex={-1}>{title}</h1>
        {accounts.length > 1 && <p className="auth-account-label">{tr('Learning profile', 'Hồ sơ học')}: <strong>{profile.name}</strong></p>}
        {page === 'login' && <><p className="auth-subtitle">{tr('A little English, a lot to tell!', 'Một chút tiếng Anh, cả rổ chuyện hay!')}</p><div className="auth-options">
          {appleMobile && <button className="auth-option auth-apple" type="button" onClick={() => go('apple')}><AppleMark /><span>{tr('Sign in with Apple', 'Đăng nhập bằng Apple ID')}</span></button>}
          <button className="auth-option" type="button" onClick={() => go('email')}><Mail size={22} /><span>{tr('Sign in with Email', 'Đăng nhập bằng Email')}</span><ArrowRight size={18} /></button>
          <button className="auth-option auth-option-code" type="button" onClick={() => go('code')}><KeyRound size={22} /><span>{tr('Sign in with a code', 'Đăng nhập bằng mã code')}</span><ArrowRight size={18} /></button>
        </div><p className="auth-signup">{tr('New to the club?', 'Chưa có tài khoản?')} <button type="button" onClick={() => go('signup')}>{tr('Sign up now', 'Đăng ký ngay')}</button></p></>}
        {page === 'code' && <form onSubmit={enter} className="auth-form"><p className="auth-subtitle">{tr('Pop in your access code, Buddy is holding your spot!', 'Nhập mã bạn được nhận, Buddy giữ chỗ rồi nè!')}</p><label htmlFor="entry-code">{tr('Your access code', 'Mã vào hội của bạn')}</label><input ref={input} id="entry-code" name="code" value={code} onChange={event => { setCode(event.target.value); setError(''); }} maxLength={32} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder={tr('Enter your code', 'Nhập mã của bạn')} aria-invalid={!!error} aria-describedby={error ? 'entry-code-error' : undefined} disabled={busy} required />{error && <p id="entry-code-error" className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>{busy ? <Check size={20} /> : <ArrowRight size={20} />}{busy ? tr('Buddy is letting you in!', 'Buddy mở cửa đây!') : tr('Let me innn!', 'Cho mình vào hội!')}</button><p className="auth-small">{tr('This code opens the preview on this device, it does not create a cloud account.', 'Mã mở bản trải nghiệm trên thiết bị này, chưa tạo tài khoản đám mây nhé.')}</p></form>}
        {(page === 'email' || page === 'signup') && <form className="auth-form" onSubmit={emailPreview}><p className="auth-subtitle">{tr('Email accounts are getting ready, your access code works in the meantime!', 'Tài khoản Email đang được chuẩn bị, mình dùng mã để vào trước nhé!')}</p>{page === 'signup' && <><label htmlFor="entry-name">{tr('What should Buddy call you?', 'Buddy gọi bạn là gì nhỉ?')}</label><input id="entry-name" name="name" maxLength={35} autoComplete="given-name" placeholder={tr('Your lovely name', 'Tên dễ thương của bạn')} /></>}<label htmlFor="entry-email">Email</label><input ref={input} id="entry-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /><button className="auth-submit" type="submit"><Mail size={20} />{page === 'signup' ? tr('Sign up', 'Đăng ký') : tr('Continue with Email', 'Tiếp tục bằng Email')}</button>{notice && <p className="auth-notice" role="status">{notice}</p>}<button className="auth-text-link" type="button" onClick={() => go('code')}>{tr('Use my access code instead', 'Mình có mã, vào trước nhé')}<ArrowRight size={16} /></button><p className="auth-small">{tr('No email or personal details are sent or stored by this preview form.', 'Form xem trước chưa gửi hay lưu Email và thông tin cá nhân của bạn.')}</p></form>}
        {page === 'apple' && <div className="auth-form"><p className="auth-subtitle">{tr('Apple ID sign-in is waiting for its secure connection, use your code to meet Buddy for now!', 'Apple ID đang chờ kết nối xác thực, mình dùng mã để gặp Buddy trước nhé!')}</p><button className="auth-submit" type="button" onClick={() => go('code')}><KeyRound size={20} />{tr('Use my access code', 'Vào bằng mã của mình')}</button></div>}
        {page === 'help' && <div className="auth-form"><p className="auth-subtitle">{tr('Check your code for extra spaces or mixed-up letters, then give it another go!', 'Mình kiểm tra lại mã được nhận, tránh thiếu ký tự hoặc nhầm chữ rồi thử lại nhé!')}</p>{supportUrl ? <a className="auth-submit" href={supportUrl} target="_blank" rel="noopener noreferrer"><Facebook size={21} />{tr('Message Narra on Facebook', 'Nhắn Narra qua Facebook')}</a> : <p className="auth-notice">{tr('The official Facebook support link has not been connected in this preview yet.', 'Kênh Facebook hỗ trợ chính thức chưa được kết nối trong bản trải nghiệm này.')}</p>}<button className="auth-option" type="button" onClick={() => go('code')}><KeyRound size={20} /><span>{tr('Try my code again', 'Mình thử lại mã nhé')}</span><ArrowRight size={18} /></button></div>}
      </div>
      <footer className="auth-footer">{accounts.length > 1 && <button className="auth-text-link" type="button" disabled={busy} onClick={() => setAccountsOpen(true)}>{tr('Switch learning account', 'Đổi tài khoản học')}</button>}<button className="auth-help" type="button" onClick={() => go('help')}><Facebook size={18} />{tr('Need a hand?', 'Cần hỗ trợ?')}</button><span>{tr('A preview, with progress saved on this device', 'Bản trải nghiệm, tiến độ lưu trên thiết bị')}</span></footer>
    </section>
    {accountsOpen && <AccountsDialog onClose={() => setAccountsOpen(false)} />}
  </main>;
}
