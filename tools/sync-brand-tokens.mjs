import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const markdown = readFileSync(resolve(root, 'docs/brand-guidelines.md'), 'utf8');
const roles = ['Black', 'Lime', 'Orange', 'Cyan', 'Ink', 'Muted', 'Background', 'Surface', 'Border', 'Green ink', 'Lime tint', 'Cyan tint', 'Orange tint'];
const key = (name) => name.toLowerCase().replaceAll(' ', '-');
const colors = Object.fromEntries(roles.map((name) => {
  const escaped = name.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp('\\| '+escaped+' \\| (#[0-9a-fA-F]{6}) \\|'));
  if (!match) throw new Error('Missing brand color in source of truth: '+name);
  return [key(name), match[1].toUpperCase()];
}));
const token = (value, type = 'color') => ({ $value: value, $type: type });
const reference = (name) => token('{primitive.color.'+name+'}');
const semantic = {
  primary: reference('lime'),
  'on-primary': reference('ink'),
  text: reference('ink'),
  muted: reference('muted'),
  background: reference('background'),
  surface: reference('surface'),
  border: reference('border'),
  link: reference('green-ink'),
  focus: reference('green-ink'),
  conversation: reference('cyan-tint'),
  'conversation-accent': reference('cyan'),
  highlight: reference('lime-tint'),
  energy: reference('orange'),
  'energy-surface': reference('orange-tint')
};
const tokens = {
  brand: 'Narra',
  identity: 'Option 1',
  source: 'docs/brand-guidelines.md',
  tagline: 'Your voice. Your story.',
  primitive: {
    color: Object.fromEntries(Object.entries(colors).map(([name, value]) => [name, token(value)])),
    radius: { control: token('12px', 'dimension'), card: token('24px', 'dimension'), sheet: token('28px', 'dimension'), pill: token('999px', 'dimension') },
    spacing: { unit: token('4px', 'dimension') },
    font: { heading: token('Nunito, system-ui, sans-serif', 'fontFamily'), body: token('-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', 'fontFamily') }
  },
  semantic: { color: semantic },
  component: {
    'button-primary': { background: token('{semantic.color.primary}'), foreground: token('{semantic.color.on-primary}'), radius: token('{primitive.radius.pill}', 'dimension') },
    card: { background: token('{semantic.color.surface}'), border: token('{semantic.color.border}'), radius: token('{primitive.radius.card}', 'dimension') },
    'conversation-panel': { background: token('{semantic.color.conversation}'), foreground: token('{semantic.color.text}') }
  }
};
const css = [
  '/* Generated from docs/brand-guidelines.md by tools/sync-brand-tokens.mjs. */',
  ':root {',
  ...Object.entries(colors).map(([name, value]) => '  --brand-'+name+': '+value+';'),
  ...Object.entries(semantic).map(([name, value]) => {
    const match = value.$value.match(/primitive.color.([^}]+)/);
    return '  --color-'+name+': var(--brand-'+match[1]+');';
  }),
  '  --radius-control: 12px;',
  '  --radius-card: 24px;',
  '  --radius-sheet: 28px;',
  '  --radius-pill: 999px;',
  '  --spacing-unit: 4px;',
  '  --font-heading: Nunito, system-ui, sans-serif;',
  '  --font-body: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;',
  '}', ''
].join('\n');
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map((x) => parseInt(x,16)/255).map((x) => x<=0.04045 ? x/12.92 : ((x+0.055)/1.055)**2.4);
  return rgb[0]*0.2126 + rgb[1]*0.7152 + rgb[2]*0.0722;
}
function contrast(a,b) {
  const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (values[0]+0.05)/(values[1]+0.05);
}
const checks=[['primary button', 'ink', 'lime'], ['links on white', 'green-ink', 'surface'], ['body copy', 'ink', 'background'], ['muted on white', 'muted', 'surface']];
for (const [label,foreground,background] of checks) {
  const ratio=contrast(colors[foreground],colors[background]);
  if(ratio<4.5) throw new Error(label+' fails AA contrast: '+ratio);
  console.log(label+': '+ratio.toFixed(2)+':1');
}
mkdirSync(resolve(root,'assets'),{recursive:true});
writeFileSync(resolve(root,'assets/design-tokens.json'), JSON.stringify(tokens,null,2)+'\n');
writeFileSync(resolve(root,'assets/design-tokens.css'),css);
console.log('Synchronized Narra palette, semantic roles, and component tokens.');

