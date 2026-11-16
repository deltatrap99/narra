import { brandAsset, isOption5 } from './brand-variant';
import type { StreakMilestone } from './streaks';

export const streakMascotAsset = brandAsset(isOption5 ? 'streak-goofy.png' : 'streak-cheer.png');

export type StreakCardCopy = { name: string; title: string; days: string; streak: string; earned: string; preview: string; encouragement: string };
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('The celebration artwork could not load')); image.src = source; });
}

/** The downloaded card uses the same original brand art as the visible card. */
export async function createStreakCard(milestone: StreakMilestone, copy: StreakCardCopy): Promise<File> {
  await document.fonts.ready;
  const [logo, mascot] = await Promise.all([loadImage(brandAsset('logo-dark.webp')), loadImage(streakMascotAsset)]);
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Image export is unavailable');
  const ctx = context;
  const ink = isOption5 ? '#23103e' : '#173329';
  ctx.fillStyle = isOption5 ? '#f5f0ff' : '#f4faef'; ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = milestone.color + '12'; ctx.beginPath(); ctx.arc(540, 655, 420, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = milestone.color + '40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(540, 655, 390, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 18; i++) { const angle = i * Math.PI * 2 / 18; ctx.fillStyle = [milestone.color, '#91ce43', '#69c9ed'][i % 3]; ctx.beginPath(); ctx.arc(540 + Math.cos(angle) * 415, 655 + Math.sin(angle) * 415, i % 3 === 0 ? 8 : 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.drawImage(logo, 74, 68, 220, 220 * logo.naturalHeight / logo.naturalWidth);
  ctx.textAlign = 'right'; ctx.fillStyle = ink; ctx.font = '800 22px Nunito, sans-serif'; ctx.fillText('NARRA STREAK CLUB', 1006, 109);
  ctx.textAlign = 'center'; ctx.fillStyle = milestone.color; ctx.font = '900 28px Nunito, sans-serif'; ctx.fillText(copy.streak, 540, 222);
  ctx.fillStyle = ink; ctx.font = '800 152px Quicksand, sans-serif'; ctx.fillText(String(milestone.days), 540, 390);
  ctx.font = '800 30px Nunito, sans-serif'; ctx.fillText(copy.days, 540, 440);
  const maxSize = 500; const scale = Math.min(maxSize / mascot.naturalWidth, maxSize / mascot.naturalHeight);
  const width = mascot.naturalWidth * scale, height = mascot.naturalHeight * scale;
  ctx.drawImage(mascot, (1080 - width) / 2, 470 + (500 - height) / 2, width, height);
  function text(value: string, y: number, size: number, weight = 800) { let fontSize = size; do { ctx.font = `${weight} ${fontSize}px Quicksand, sans-serif`; if (ctx.measureText(value).width <= 900) break; fontSize--; } while (fontSize > 18); ctx.fillText(value, 540, y); }
  ctx.fillStyle = ink; text(copy.title, 1025, 44); text(copy.name, 1085, 34); text(copy.earned, 1133, 24, 600);
  ctx.fillStyle = milestone.color; text(copy.encouragement, 1195, 26, 700);
  ctx.fillStyle = ink; ctx.font = '800 29px Quicksand, sans-serif'; ctx.fillText('Your voice, your story!', 540, 1270);
  ctx.font = '700 18px Nunito, sans-serif'; ctx.fillText('Narra · #NarraStreak · #YourVoiceYourStory', 540, 1310);
  if (copy.preview) {
    ctx.save(); ctx.translate(540, 688); ctx.rotate(-Math.PI / 10); ctx.fillStyle = '#ffffffed'; ctx.fillRect(-490, -56, 980, 112); ctx.fillStyle = ink; ctx.font = '900 34px Nunito, sans-serif'; ctx.fillText(copy.preview, 0, 12); ctx.restore();
  }
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image export failed')), 'image/png'));
  return new File([blob], `Narra-${milestone.days}-days${copy.preview ? '-preview' : ''}.png`, { type: 'image/png' });
}
