import { brandAsset, isOption5 } from './brand-variant';
import type { StreakMilestone } from './streaks';
import { streakPalette, type StreakCardTone } from './streak-card-design';

export const streakMascotAsset = brandAsset(isOption5 ? 'streak-goofy.png' : 'streak-cheer.png');
export type StreakCardCopy = { name: string; caption: string; days: string; preview: string; tone: StreakCardTone };
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('The celebration artwork could not load')); image.src = source; });
}

/** A minimal branded poster, using the same palette, pose and caption as the visible card. */
export async function createStreakCard(milestone: StreakMilestone, copy: StreakCardCopy): Promise<File> {
  await document.fonts.ready;
  const [logo, mascot] = await Promise.all([loadImage(brandAsset('logo-dark.webp')), loadImage(streakMascotAsset)]);
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Image export is unavailable');
  const ctx = context, palette = streakPalette(copy.tone, isOption5);
  ctx.fillStyle = palette.paper; ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = palette.disc; ctx.beginPath(); ctx.ellipse(540, 805, 400, 322, -.15, 0, Math.PI * 2); ctx.fill();
  function star(x: number, y: number, size: number, angle: number) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.beginPath();
    for (let i = 0; i < 8; i++) { const radius = i % 2 ? size * .28 : size; const a = i * Math.PI / 4; if (i === 0) ctx.moveTo(Math.cos(a) * radius, Math.sin(a) * radius); else ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = palette.accent; star(165, 680, 34, .12); star(914, 940, 22, -.15);
  ctx.fillStyle = palette.highlight; star(900, 550, 43, -.2); star(174, 1010, 21, .3);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(60, 52, 260, 88, 20); ctx.fill();
  ctx.drawImage(logo, 80, 70, 220, 220 * logo.naturalHeight / logo.naturalWidth);
  ctx.fillStyle = palette.ink; ctx.beginPath(); ctx.roundRect(864, 67, 146, 58, 29); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 23px Nunito, sans-serif'; ctx.fillText('STREAK', 937, 104);
  if (copy.preview) { ctx.fillStyle = '#ffffffdc'; ctx.beginPath(); ctx.roundRect(390, 145, 300, 44, 22); ctx.fill(); ctx.fillStyle = palette.ink; ctx.font = '850 20px Nunito, sans-serif'; ctx.fillText(copy.preview, 540, 174); }
  ctx.textAlign = 'center'; ctx.font = `850 ${milestone.days >= 100 ? 246 : 280}px Quicksand, sans-serif`;
  if (copy.tone === 'cheeky') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 15; ctx.lineJoin = 'round'; ctx.strokeText(String(milestone.days), 540, 421); }
  ctx.fillStyle = palette.ink; ctx.fillText(String(milestone.days), 540, 421);
  ctx.font = '900 29px Nunito, sans-serif'; ctx.fillText(copy.days, 540, 474);
  const scale = Math.min(760 / mascot.naturalWidth, 610 / mascot.naturalHeight), width = mascot.naturalWidth * scale, height = mascot.naturalHeight * scale;
  ctx.drawImage(mascot, (1080 - width) / 2, 515 + (610 - height) / 2, width, height);
  let size = 67; do { ctx.font = `850 ${size}px Quicksand, sans-serif`; if (ctx.measureText(copy.caption).width <= 950) break; size--; } while (size > 28);
  ctx.fillStyle = palette.ink; ctx.fillText(copy.caption, 540, 1176);
  const letters = Array.from(copy.name), name = letters.slice(0, 28).join('') + (letters.length > 28 ? '…' : '');
  ctx.textAlign = 'left'; ctx.font = '800 26px Nunito, sans-serif'; ctx.fillText(name, 74, 1280, 440);
  ctx.textAlign = 'right'; ctx.font = '800 25px Quicksand, sans-serif'; ctx.fillText('Your voice, your story!', 1006, 1280, 450);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image export failed')), 'image/png'));
  return new File([blob], `Narra-${milestone.days}-days-${copy.tone}${copy.preview ? '-preview' : ''}.png`, { type: 'image/png' });
}
