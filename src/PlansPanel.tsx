import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import BuddyAvatar from './BuddyAvatar';
import { usePlayer, type PlanCycle } from './game';
import { useCopy } from './state';
import './plans.css';

const MONTHLY_PRICE = 99_000;
const YEARLY_DISCOUNT = 20;
const ANNUAL_PRICE = Math.round(MONTHLY_PRICE * 12 * (100 - YEARLY_DISCOUNT) / 100);

/** Plan exploration and saved interest only; this never activates a subscription. */
export default function PlansPanel({ onClose }: { onClose: () => void }) {
  const tr = useCopy();
  const { player, setPlayer } = usePlayer();
  const [cycle, setCycle] = useState<PlanCycle>(() => player.planInterestCycle ?? 'monthly');
  const [notice, setNotice] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const saved = player.planInterest === 'plus' && player.planInterestCycle === cycle;
  const money = (amount: number) => new Intl.NumberFormat(tr('en-US', 'vi-VN')).format(amount) + tr(' VND', 'đ');

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => { if (previous?.isConnected && !previous.closest('[inert]')) previous.focus({ preventScroll: true }); });
    };
  }, []);

  function chooseCycle(next: PlanCycle) { setCycle(next); setNotice(''); }
  function saveInterest() {
    setPlayer(current => ({ ...current, planInterest: 'plus', planInterestCycle: cycle }));
    setNotice(tr(`Buddy has saved your interest in ${cycle === 'annual' ? 'yearly' : 'monthly'} Plus on this device!`, `Buddy ghi lại lựa chọn Plus theo ${cycle === 'annual' ? 'năm' : 'tháng'} trên thiết bị này rồi nhé!`));
  }

  const plusFeatures = [tr('More room for live AI conversations', 'Thêm thời lượng trò chuyện cùng AI'), tr('Deeper feedback and practice from your mistakes', 'Góp ý sâu hơn, ôn lại từ những lỗi nhỏ'), tr('Topics you choose, for the things you care about', 'Nhiều chủ đề hơn, có cả điều bạn tự chọn'), tr('A learning path that grows with you', 'Lộ trình theo mục tiêu và tiến độ của bạn')];
  const freeFeatures = [tr('Guided lessons and sample conversations', 'Bài học hướng dẫn và hội thoại mẫu'), tr('Save discoveries and review your words', 'Lưu từ hay và ôn từ vựng'), tr('Buddy, streaks and progress on this device', 'Buddy, chuỗi ngày học và tiến độ trên máy')];
  const comparison = [
    [tr('Speaking with AI', 'Luyện nói với AI'), tr('A limited introduction', 'Trải nghiệm giới hạn'), tr('A larger monthly allowance', 'Thêm thời lượng mỗi tháng')],
    [tr('After each conversation', 'Sau mỗi buổi nói'), tr('Key takeaways', 'Những góp ý chính'), tr('Detailed notes and targeted review', 'Góp ý sâu và bài ôn theo lỗi')],
    [tr('Conversation topics', 'Chủ đề hội thoại'), tr('Selected topics', 'Một nhóm chủ đề'), tr('Full library and your own topics', 'Thư viện đầy đủ và chủ đề tự chọn')],
    [tr('Learning path', 'Lộ trình học'), tr('A guided starting point', 'Lộ trình gợi ý sẵn'), tr('Adapts to your goals and progress', 'Theo mục tiêu và tiến độ riêng')],
    [tr('Buddy, streaks and saved words', 'Buddy, chuỗi ngày học và từ đã lưu'), tr('Here for you', 'Luôn có cùng bạn'), tr('Here for you', 'Luôn có cùng bạn')],
  ];
  const faqs = [
    [tr('Monthly or yearly, what changes?', 'Theo tháng và theo năm khác nhau thế nào?'), tr(`Both share the same Plus benefits, with monthly billing at ${money(MONTHLY_PRICE)} or one yearly payment of ${money(ANNUAL_PRICE)}, saving ${YEARLY_DISCOUNT}% compared with 12 monthly payments.`, `Hai kỳ có cùng quyền lợi Plus, với giá ${money(MONTHLY_PRICE)}/tháng hoặc thanh toán một lần ${money(ANNUAL_PRICE)}/năm, tiết kiệm ${YEARLY_DISCOUNT}% so với trả từng tháng trong 12 tháng nhé.`)],
    [tr('How much AI practice will I get?', 'Mình sẽ được luyện AI bao lâu?'), tr('Buddy is still working out the allowance, which will be clearly stated and renewed monthly for both billing periods when Plus launches; this preview does not deduct practice minutes.', 'Buddy đang chuẩn bị hạn mức luyện tập và sẽ ghi rõ số phút cấp lại mỗi tháng cho cả hai kỳ khi Plus ra mắt; bản xem trước hiện không trừ phút luyện tập nhé.')],
    [tr('Does “I’d love to try!” start a paid plan?', 'Bấm “Mình muốn thử!” có mất phí không?'), tr("This only saves your interest on this device, with no charge, subscription activation or automatic email, so you stay on Narra Free.", "Nút này chỉ lưu mong muốn trên thiết bị của bạn, chưa thu phí, kích hoạt gói hay gửi email tự động nên bạn vẫn đang dùng Narra Free nhé.")],
  ];

  return <dialog ref={dialogRef} className="plans-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape') { event.preventDefault(); onClose(); } }}>
    <header className="plans-topbar"><button type="button" className="plans-back" onClick={onClose} aria-label={tr('Back to where I was', 'Quay lại chỗ mình vừa xem')}><ArrowLeft size={21} /></button><h1 id={titleId}>{tr('Your Narra plans', 'Các gói học Narra')}</h1><span className="plans-current"><ShieldCheck size={14} />Narra Free</span></header>
    <div className="plans-content">
      <section className="plans-intro"><div><span className="plans-eyebrow"><Sparkles size={14} />{tr('A LITTLE MORE, TOGETHER', 'THÊM MỘT CHÚT, CÙNG NHAU')}</span><h2>{tr('Your next little adventure.', 'Mình học thêm cùng nhau nhé?')}</h2><p>{tr("A little space for your English today, A few new possibilities with Plus tomorrow!", "Hôm nay mình cứ học theo nhịp của bạn, còn Plus thì Buddy đang chuẩn bị thêm vài điều hay nè!")}</p></div><BuddyAvatar mood={saved ? 'celebrate' : 'curious'} size={116} motion={false} /></section>
      <fieldset className="plans-cycle"><legend>{tr('How would you like to join us?', 'Bạn muốn đồng hành bao lâu?')}</legend><div><button type="button" aria-pressed={cycle === 'monthly'} onClick={() => chooseCycle('monthly')}>{tr('Monthly', 'Theo tháng')}</button><button type="button" aria-pressed={cycle === 'annual'} onClick={() => chooseCycle('annual')}>{tr('Yearly', 'Theo năm')}<span className="plans-cycle-saving">-{YEARLY_DISCOUNT}%</span></button></div><p>{tr("Same Plus benefits, pick the rhythm that feels right!", "Cùng quyền lợi Plus, mình chọn nhịp phù hợp với bạn nhé!")}</p></fieldset>
      <div className="plans-grid">
        <article className="plans-card plans-card-plus">
          <div className="plans-card-heading"><span className="plans-card-icon"><Sparkles size={23} /></span><div><span className="plans-badge">{tr('Buddy is getting it ready', 'Buddy đang chuẩn bị')}</span><h3>Narra Plus</h3></div></div>
          <p className="plans-card-description">{tr('Buddy gets to know your English a little better.', 'Buddy hiểu bạn hơn, cùng luyện đúng điều bạn cần.')}</p>
          <div className="plans-price" aria-live="polite" aria-atomic="true">
            <strong>{money(cycle === 'annual' ? ANNUAL_PRICE : MONTHLY_PRICE)}<small>{cycle === 'annual' ? tr('/year', '/năm') : tr('/month', '/tháng')}</small></strong>
            {cycle === 'annual' ? <>
              <span>{tr(`Equivalent to ${money(ANNUAL_PRICE / 12)}/month, paid in one yearly payment.`, `Tương đương ${money(ANNUAL_PRICE / 12)}/tháng, thanh toán một lần cho cả năm.`)}</span>
              <span className="plans-price-saving">{tr(`Save ${YEARLY_DISCOUNT}% (${money(MONTHLY_PRICE * 12 - ANNUAL_PRICE)}/year) compared with 12 monthly payments`, `Tiết kiệm ${YEARLY_DISCOUNT}% (${money(MONTHLY_PRICE * 12 - ANNUAL_PRICE)}/năm) so với trả từng tháng trong 12 tháng`)}</span>
            </> : <span>{tr('Billed monthly when subscriptions open', 'Thanh toán mỗi tháng khi mở đăng ký')}</span>}
          </div>
          <p className="plans-feature-label">{tr('What we’re planning for Plus', 'Những điều đang được chuẩn bị cho Plus')}</p><ul>{plusFeatures.map(feature => <li key={feature}><Check size={17} /><span>{feature}</span></li>)}</ul>
          <button type="button" className="plans-interest" aria-pressed={saved} onClick={saveInterest}>{saved ? <><CheckCircle2 size={19} />{tr('Buddy’s got it!', 'Buddy ghi lại rồi nhé!')}</> : <>{tr('I’d love to try!', 'Mình muốn thử!')}<ArrowRight size={18} /></>}</button>
          <p className="plans-action-note">{tr("Just a little preview, with no payment today.", "Mình xem trước thôi nhé, chưa thu phí đâu.")}</p>
        </article>
        <article className="plans-card plans-card-free"><div className="plans-card-heading"><span className="plans-card-icon"><Heart size={23} /></span><div><span className="plans-badge">{tr('Your current plan', 'Gói bạn đang dùng')}</span><h3>Narra Free</h3></div></div><p className="plans-card-description">{tr("One little conversation, a lovely place to begin!", 'Từng cuộc trò chuyện nhỏ, một khởi đầu thật vui.')}</p><div className="plans-price"><strong>{tr('Free', 'Miễn phí')}</strong><span>{tr('Your experience today', 'Trải nghiệm hiện tại của bạn')}</span></div><p className="plans-feature-label">{tr('Already here for you', 'Đã có để mình cùng khám phá')}</p><ul>{freeFeatures.map(feature => <li key={feature}><Check size={17} /><span>{feature}</span></li>)}</ul><div className="plans-free-status"><ShieldCheck size={18} />{tr('You’re right at home here', 'Bạn vẫn đang học cùng Free')}</div></article>
      </div>
      {notice && <p className="plans-notice" role="status"><CheckCircle2 size={19} /><span>{notice}</span></p>}
      {player.planInterest !== 'free' && <button type="button" className="plans-clear" onClick={() => { setPlayer(current => ({ ...current, planInterest: 'free', planInterestCycle: null })); setNotice(tr("No worries, Buddy has cleared your saved interest.", 'Dễ thôi, Buddy đã bỏ lựa chọn đã lưu cho bạn rồi nhé.')); }}>{tr('Let me think a little more', 'Để mình nghĩ thêm nhé')}</button>}
      <section className="plans-comparison" aria-labelledby="plans-comparison-title"><div className="plans-section-heading"><h2 id="plans-comparison-title">{tr('What will feel different?', 'Free và Plus sẽ khác gì nhỉ?')}</h2><p>{tr('Here’s what we’re planning for Free and Plus, with live AI and final usage limits still in preparation while your current learning experience stays the same.', 'Đây là khung quyền lợi dự kiến khi Plus ra mắt, còn AI trực tiếp và hạn mức vẫn đang được chuẩn bị nên trải nghiệm học hiện tại của bạn vẫn như cũ nhé.')}</p></div><div className="plans-table-wrap"><table><caption className="sr-only">{tr('Planned Free and Plus benefits', 'So sánh quyền lợi dự kiến của Free và Plus')}</caption><thead><tr><th scope="col">{tr('Learning together', 'Cùng bạn học')}</th><th scope="col">Free</th><th scope="col">Plus</th></tr></thead><tbody>{comparison.map(([label, free, plus]) => <tr key={label}><th scope="row">{label}</th><td>{free}</td><td>{plus}</td></tr>)}</tbody></table></div></section>
      <section className="plans-faq" aria-labelledby="plans-faq-title"><h2 id="plans-faq-title">{tr('A few things you might wonder', 'Bạn đang thắc mắc chút gì không?')}</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <p className="plans-footnote"><ShieldCheck size={16} /><span>{tr("Your choice stays on this device without creating a subscription or payment, and your current plan remains Narra Free.", "Lựa chọn chỉ được lưu trên thiết bị này, chưa tạo đăng ký hay thanh toán và gói hiện tại của bạn vẫn là Narra Free nhé.")}</span></p>
    </div>
  </dialog>;
}
