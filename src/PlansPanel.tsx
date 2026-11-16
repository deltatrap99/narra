import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Heart, ShieldCheck, Sparkles, Users } from 'lucide-react';
import BuddyAvatar from './BuddyAvatar';
import { usePlayer, type PlanCycle } from './game';
import { useCopy } from './state';
import './plans.css';
import FamilyMembers from './FamilyMembers';

const MONTHLY_PRICE = 99_000;
const YEARLY_DISCOUNT = 20;
const ANNUAL_PRICE = Math.round(MONTHLY_PRICE * 12 * (100 - YEARLY_DISCOUNT) / 100);
const FAMILY_MEMBERS = 4;
const FAMILY_MONTHLY_PRICE = 249_000;
const FAMILY_ANNUAL_PRICE = Math.round(FAMILY_MONTHLY_PRICE * 12 * (100 - YEARLY_DISCOUNT) / 100);

/** Plan exploration and saved interest only; this never activates a subscription. */
export default function PlansPanel({ onClose }: { onClose: () => void }) {
  const tr = useCopy();
  const { player, setPlayer } = usePlayer();
  const [cycle, setCycle] = useState<PlanCycle>(() => player.planInterestCycle ?? 'monthly');
  const [notice, setNotice] = useState('');
  const [familyOpen, setFamilyOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const saved = player.planInterest === 'plus' && player.planInterestCycle === cycle;
  const familySaved = player.planInterest === 'family' && player.planInterestCycle === cycle;
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
  function saveInterest(plan: 'plus' | 'family') {
    setPlayer(current => ({ ...current, planInterest: plan, planInterestCycle: cycle }));
    const name = plan === 'family' ? 'Family' : 'Plus';
    setNotice(tr(`Narry has saved your interest in ${cycle === 'annual' ? 'yearly' : 'monthly'} ${name} on this device!`, `Narry ghi lại lựa chọn ${name} theo ${cycle === 'annual' ? 'năm' : 'tháng'} trên thiết bị này rồi nhé!`));
  }

  const plusFeatures = [tr('More room for live AI conversations', 'Thêm thời lượng trò chuyện cùng AI'), tr('Deeper feedback and practice from your mistakes', 'Góp ý sâu hơn, ôn lại từ những lỗi nhỏ'), tr('Topics you choose, for the things you care about', 'Nhiều chủ đề hơn, có cả điều bạn tự chọn'), tr('A learning path that grows with you', 'Lộ trình theo mục tiêu và tiến độ của bạn')];
  const freeFeatures = [tr('Guided lessons and sample conversations', 'Bài học hướng dẫn và hội thoại mẫu'), tr('Save discoveries and review your words', 'Lưu từ hay và ôn từ vựng'), tr('Narry, streaks and progress on this device', 'Narry, chuỗi ngày học và tiến độ trên máy')];
  const familyFeatures = [
    tr('Plus benefits for up to four people, including you', 'Quyền lợi Plus cho tối đa 4 người, gồm cả bạn'),
    tr('Separate AI allowances, learning paths, words and streaks for each person', 'Hạn mức AI, lộ trình, từ vựng và streak riêng cho từng người'),
    tr('One person pays and manages members through invitation links', 'Một người thanh toán, mời và quản lý thành viên qua liên kết'),
    tr('Shared challenges, little cheers and badges for your learning circle', 'Thử thách học chung, cổ vũ nhau và huy hiệu cả nhóm'),
  ];
  const comparison = [
    [tr('Learning accounts', 'Tài khoản học'), tr('One learner', '1 người'), tr('One learner', '1 người'), tr('Up to four, including the plan owner', 'Tối đa 4 người, gồm chủ gói')],
    [tr('Speaking with AI', 'Luyện nói với AI'), tr('A limited introduction', 'Trải nghiệm giới hạn'), tr('A larger monthly allowance', 'Thêm thời lượng mỗi tháng'), tr('The same Plus allowance, separately for each member', 'Hạn mức như Plus, cấp riêng từng người')],
    [tr('After each conversation', 'Sau mỗi buổi nói'), tr('Key takeaways', 'Những góp ý chính'), tr('Detailed notes and targeted review', 'Góp ý sâu và bài ôn theo lỗi'), tr('The same Plus feedback for every member', 'Góp ý như Plus cho từng thành viên')],
    [tr('Conversation topics', 'Chủ đề hội thoại'), tr('Selected topics', 'Một nhóm chủ đề'), tr('Full library and your own topics', 'Thư viện đầy đủ và chủ đề tự chọn'), tr('Full library and personal topics for each person', 'Thư viện đầy đủ và chủ đề riêng từng người')],
    [tr('Learning path', 'Lộ trình học'), tr('A guided starting point', 'Lộ trình gợi ý sẵn'), tr('Adapts to your goals and progress', 'Theo mục tiêu và tiến độ riêng'), tr('A personal path and progress for each member', 'Lộ trình và tiến độ riêng từng người')],
    [tr('Narry, streaks and saved words', 'Narry, chuỗi ngày học và từ đã lưu'), tr('Here for you', 'Luôn có cùng bạn'), tr('Here for you', 'Luôn có cùng bạn'), tr('A personal collection for each member', 'Bộ sưu tập riêng từng thành viên')],
    [tr('Learning together', 'Cùng nhau học'), tr('Individual practice', 'Luyện tập cá nhân'), tr('Individual practice', 'Luyện tập cá nhân'), tr('Shared challenges, cheers and group badges', 'Thử thách chung, cổ vũ và huy hiệu nhóm')],
    [tr('Plan management', 'Quản lý gói'), tr('Your own profile', 'Hồ sơ của bạn'), tr('One person, one plan', 'Gói cho riêng bạn'), tr('One payment, with member invitations and management', 'Một khoản thanh toán, mời và quản lý thành viên')],
  ];
  const faqs = [
    [tr('Monthly or yearly, what changes?', 'Theo tháng và theo năm khác nhau thế nào?'), tr(`Each plan keeps the same benefits across both billing periods, with yearly billing saving ${YEARLY_DISCOUNT}% compared with 12 monthly payments: ${money(ANNUAL_PRICE)} for Plus or ${money(FAMILY_ANNUAL_PRICE)} for the whole Family plan, paid once for the year.`, `Mỗi gói giữ nguyên quyền lợi ở cả hai kỳ, còn gói năm tiết kiệm ${YEARLY_DISCOUNT}% so với trả từng tháng trong 12 tháng: ${money(ANNUAL_PRICE)} cho Plus hoặc ${money(FAMILY_ANNUAL_PRICE)} cho cả gói Family, thanh toán một lần cho cả năm nhé.`)],
    [tr('Who can join my Family?', 'Mình có thể rủ ai vào Family?'), tr(`Your Family can have up to ${FAMILY_MEMBERS} people including you, whether family or close friends, with one person paying and inviting the others to their own accounts when the feature launches.`, `Family có tối đa ${FAMILY_MEMBERS} người gồm cả bạn, có thể là người thân hoặc bạn thân, với một người thanh toán và mời các thành viên dùng tài khoản riêng khi tính năng ra mắt nhé.`)],
    [tr('Will we share our progress and AI time?', 'Cả nhà có dùng chung tiến độ và thời lượng AI không?'), tr('Each member is planned to have their own goals, history, words, streaks, private conversations and AI allowance equivalent to Plus, with group challenges and cheers alongside personal learning.', 'Mỗi người dự kiến có mục tiêu, lịch sử, từ vựng, streak, hội thoại riêng tư và hạn mức AI tương đương Plus, bên cạnh thử thách chung và những lời cổ vũ của cả nhóm nhé.')],
    [tr('How much AI practice will I get?', 'Mình sẽ được luyện AI bao lâu?'), tr('Narry is still working out the allowance, which will be stated clearly and renewed monthly for Plus and for each Family member on either billing period; this preview does not deduct practice minutes.', 'Narry đang chuẩn bị hạn mức luyện tập và sẽ ghi rõ số phút cấp lại mỗi tháng cho Plus và từng thành viên Family ở cả hai kỳ; bản xem trước hiện không trừ phút luyện tập nhé.')],
    [tr('Do these buttons start a paid plan?', 'Bấm chọn Plus hoặc Family có mất phí không?'), tr("This only saves your interest on this device, with no charge, subscription activation or automatic email, so you stay on Narra Free.", "Nút này chỉ lưu mong muốn trên thiết bị của bạn, chưa thu phí, kích hoạt gói hay gửi email tự động nên bạn vẫn đang dùng Narra Free nhé.")],
  ];

  return <dialog ref={dialogRef} className="plans-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape') { event.preventDefault(); onClose(); } }}>
    <header className="plans-topbar"><button type="button" className="plans-back" onClick={onClose} aria-label={tr('Back to where I was', 'Quay lại chỗ mình vừa xem')}><ArrowLeft size={21} /></button><h1 id={titleId}>{tr('Your Narra plans', 'Các gói học Narra')}</h1><span className="plans-current"><ShieldCheck size={14} />Narra Free</span></header>
    <div className="plans-content">
      <section className="plans-intro"><div><span className="plans-eyebrow"><Sparkles size={14} />{tr('A LITTLE MORE, TOGETHER', 'THÊM MỘT CHÚT, CÙNG NHAU')}</span><h2>{tr('Your next little adventure.', 'Mình học thêm cùng nhau nhé?')}</h2><p>{tr("A little space for your English today, A few new possibilities with Plus tomorrow!", "Hôm nay mình cứ học theo nhịp của bạn, còn Plus thì Narry đang chuẩn bị thêm vài điều hay nè!")}</p></div><BuddyAvatar mood={saved || familySaved ? 'celebrate' : 'curious'} size={116} motion={false} /></section>
      <fieldset className="plans-cycle"><legend>{tr('How would you like to join us?', 'Bạn muốn đồng hành bao lâu?')}</legend><div><button type="button" aria-pressed={cycle === 'monthly'} onClick={() => chooseCycle('monthly')}>{tr('Monthly', 'Theo tháng')}</button><button type="button" aria-pressed={cycle === 'annual'} onClick={() => chooseCycle('annual')}>{tr('Yearly', 'Theo năm')}<span className="plans-cycle-saving">-{YEARLY_DISCOUNT}%</span></button></div><p>{tr('Your plan keeps its benefits, pick the rhythm that feels right!', 'Giữ nguyên quyền lợi trong gói, mình chọn nhịp phù hợp nhé!')}</p></fieldset>
      <div className="plans-grid">
        <article className="plans-card plans-card-plus">
          <div className="plans-card-heading"><span className="plans-card-icon"><Sparkles size={23} /></span><div><span className="plans-badge">{tr('Narry is getting it ready', 'Narry đang chuẩn bị')}</span><h3>Narra Plus</h3></div></div>
          <p className="plans-card-description">{tr('Narry gets to know your English a little better.', 'Narry hiểu bạn hơn, cùng luyện đúng điều bạn cần.')}</p>
          <div className="plans-price" aria-live="polite" aria-atomic="true">
            <strong>{money(cycle === 'annual' ? ANNUAL_PRICE : MONTHLY_PRICE)}<small>{cycle === 'annual' ? tr('/year', '/năm') : tr('/month', '/tháng')}</small></strong>
            {cycle === 'annual' ? <>
              <span>{tr(`Equivalent to ${money(ANNUAL_PRICE / 12)}/month, paid in one yearly payment.`, `Tương đương ${money(ANNUAL_PRICE / 12)}/tháng, thanh toán một lần cho cả năm.`)}</span>
              <span className="plans-price-saving">{tr(`Save ${YEARLY_DISCOUNT}% (${money(MONTHLY_PRICE * 12 - ANNUAL_PRICE)}/year) compared with 12 monthly payments`, `Tiết kiệm ${YEARLY_DISCOUNT}% (${money(MONTHLY_PRICE * 12 - ANNUAL_PRICE)}/năm) so với trả từng tháng trong 12 tháng`)}</span>
            </> : <span>{tr('Billed monthly when subscriptions open', 'Thanh toán mỗi tháng khi mở đăng ký')}</span>}
          </div>
          <p className="plans-feature-label">{tr('What we’re planning for Plus', 'Những điều đang được chuẩn bị cho Plus')}</p><ul>{plusFeatures.map(feature => <li key={feature}><Check size={17} /><span>{feature}</span></li>)}</ul>
          <button type="button" className="plans-interest" aria-pressed={saved} onClick={() => saveInterest('plus')}>{saved ? <><CheckCircle2 size={19} />{tr('Narry’s got it!', 'Narry ghi lại rồi nhé!')}</> : <>{tr('I’d love to try!', 'Mình muốn thử!')}<ArrowRight size={18} /></>}</button>
          <p className="plans-action-note">{tr("Just a little preview, with no payment today.", "Mình xem trước thôi nhé, chưa thu phí đâu.")}</p>
        </article>
        <article className="plans-card plans-card-family">
          <div className="plans-card-heading"><span className="plans-card-icon"><Users size={23} /></span><div><span className="plans-badge">{tr('For your learning circle, coming soon', 'Cho nhà mình, sắp ra mắt')}</span><h3>Narra Family</h3></div></div>
          <p className="plans-family-seats"><Users size={14} />{tr(`Up to ${FAMILY_MEMBERS} people, including you`, `Tối đa ${FAMILY_MEMBERS} người, gồm cả bạn`)}</p>
          <p className="plans-card-description">{tr('Bring your favourite people, and let’s grow together!', 'Rủ người thương, cùng lớn lên mỗi ngày!')}</p>
          <div className="plans-price" aria-live="polite" aria-atomic="true">
            <strong>{money(cycle === 'annual' ? FAMILY_ANNUAL_PRICE : FAMILY_MONTHLY_PRICE)}<small>{cycle === 'annual' ? tr('/year', '/năm') : tr('/month', '/tháng')}</small></strong>
            {cycle === 'annual' ? <>
              <span>{tr(`For the whole group, equivalent to ${money(FAMILY_ANNUAL_PRICE / 12)}/month, paid once for the year.`, `Giá cho cả nhóm, tương đương ${money(FAMILY_ANNUAL_PRICE / 12)}/tháng, thanh toán một lần cho cả năm.`)}</span>
              <span className="plans-price-saving">{tr(`Save ${YEARLY_DISCOUNT}% (${money(FAMILY_MONTHLY_PRICE * 12 - FAMILY_ANNUAL_PRICE)}/year) compared with 12 monthly payments`, `Tiết kiệm ${YEARLY_DISCOUNT}% (${money(FAMILY_MONTHLY_PRICE * 12 - FAMILY_ANNUAL_PRICE)}/năm) so với trả từng tháng trong 12 tháng`)}</span>
            </> : <span>{tr('For the whole group, billed monthly when subscriptions open', 'Giá cho cả nhóm, thanh toán mỗi tháng khi mở đăng ký')}</span>}
            <span className="plans-per-person">{tr(`With all ${FAMILY_MEMBERS} members, that’s ${money((cycle === 'annual' ? FAMILY_ANNUAL_PRICE / 12 : FAMILY_MONTHLY_PRICE) / FAMILY_MEMBERS)}/person/month`, `Khi đủ ${FAMILY_MEMBERS} người, tương đương ${money((cycle === 'annual' ? FAMILY_ANNUAL_PRICE / 12 : FAMILY_MONTHLY_PRICE) / FAMILY_MEMBERS)}/người/tháng`)}</span>
          </div>
          <p className="plans-feature-label">{tr('What we’re planning for Family', 'Những điều đang được chuẩn bị cho Family')}</p><ul>{familyFeatures.map(feature => <li key={feature}><Check size={17} /><span>{feature}</span></li>)}</ul>
          <button type="button" className="plans-interest" aria-pressed={familySaved} onClick={() => saveInterest('family')}>{familySaved ? <><CheckCircle2 size={19} />{tr('Narry’s got it!', 'Narry ghi lại rồi nhé!')}</> : <>{tr('Let’s learn together!', 'Rủ nhà mình cùng học')}<ArrowRight size={18} /></>}</button>
          <p className="plans-action-note">{tr('A little preview for your group, with no payment today.', 'Mình xem trước cho cả nhóm nhé, chưa thu phí đâu.')}</p>
          <button type="button" className="plans-family-members" onClick={() => setFamilyOpen(true)}><Users size={18} />{tr('View Family members', 'Xem thành viên gia đình')}<ArrowRight size={17} /></button>
        </article>
        <article className="plans-card plans-card-free"><div className="plans-card-heading"><span className="plans-card-icon"><Heart size={23} /></span><div><span className="plans-badge">{tr('Your current plan', 'Gói bạn đang dùng')}</span><h3>Narra Free</h3></div></div><p className="plans-card-description">{tr("One little conversation, a lovely place to begin!", 'Từng cuộc trò chuyện nhỏ, một khởi đầu thật vui.')}</p><div className="plans-price"><strong>{tr('Free', 'Miễn phí')}</strong><span>{tr('Your experience today', 'Trải nghiệm hiện tại của bạn')}</span></div><p className="plans-feature-label">{tr('Already here for you', 'Đã có để mình cùng khám phá')}</p><ul>{freeFeatures.map(feature => <li key={feature}><Check size={17} /><span>{feature}</span></li>)}</ul><div className="plans-free-status"><ShieldCheck size={18} />{tr('You’re right at home here', 'Bạn vẫn đang học cùng Free')}</div></article>
      </div>
      {notice && <p className="plans-notice" role="status"><CheckCircle2 size={19} /><span>{notice}</span></p>}
      {player.planInterest !== 'free' && <button type="button" className="plans-clear" onClick={() => { setPlayer(current => ({ ...current, planInterest: 'free', planInterestCycle: null })); setNotice(tr("No worries, Narry has cleared your saved interest.", 'Dễ thôi, Narry đã bỏ lựa chọn đã lưu cho bạn rồi nhé.')); }}>{tr('Let me think a little more', 'Để mình nghĩ thêm nhé')}</button>}
      <details className="plans-comparison"><summary>{tr('Compare the little details', 'Mình so sánh kỹ hơn nhé?')}</summary><div className="plans-section-heading"><p>{tr('Here’s what we’re planning for Free, Plus and Family, with live AI, final usage limits and shared accounts still in preparation while your current learning experience stays the same.', 'Đây là khung quyền lợi dự kiến của Free, Plus và Family, còn AI trực tiếp, hạn mức và tính năng dùng chung vẫn đang được chuẩn bị nên trải nghiệm học hiện tại của bạn vẫn như cũ nhé.')}</p></div><p className="plans-table-hint">{tr('Swipe across to see all three plans', 'Vuốt ngang để xem cả ba gói nhé')}</p><div className="plans-table-wrap" tabIndex={0} role="region" aria-label={tr('Compare Free, Plus and Family', 'So sánh Free, Plus và Family')}><table><caption className="sr-only">{tr('Planned Free, Plus and Family benefits', 'So sánh quyền lợi dự kiến của Free, Plus và Family')}</caption><thead><tr><th scope="col">{tr('Learning together', 'Cùng bạn học')}</th><th scope="col">Free</th><th scope="col">Plus</th><th scope="col">Family</th></tr></thead><tbody>{comparison.map(([label, free, plus, family]) => <tr key={label}><th scope="row">{label}</th><td>{free}</td><td>{plus}</td><td>{family}</td></tr>)}</tbody></table></div></details>
      <section className="plans-faq" aria-labelledby="plans-faq-title"><h2 id="plans-faq-title">{tr('A few things you might wonder', 'Bạn đang thắc mắc chút gì không?')}</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <p className="plans-footnote"><ShieldCheck size={16} /><span>{tr("Your choice stays on this device without creating a subscription or payment, and your current plan remains Narra Free.", "Lựa chọn chỉ được lưu trên thiết bị này, chưa tạo đăng ký hay thanh toán và gói hiện tại của bạn vẫn là Narra Free nhé.")}</span></p>
    </div>
    {familyOpen && <FamilyMembers onClose={() => setFamilyOpen(false)} />}
  </dialog>;
}
