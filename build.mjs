// Builds dark.svg and light.svg, the animated banner of the profile README.
// Pure SVG with SMIL animation, no scripts and no external files, so GitHub can show it as an image.
// Usage: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

// ---------- content ----------
const NAME = 'Shinex';
const ROLES = ['Full-Stack Developer', 'AI Automation Engineer', 'Frontend Engineer', 'Backend Developer', 'DevOps & Deployment'];
const ABOUT = [
  ['pin', 'location', 'Moscow'],
  ['target', 'focus', 'AI automation, full-stack web products'],
  ['globe', 'portfolio', 'shinex.dev'],
  ['telegram', 'telegram', '@shinex'],
];
const SKILLS = [
  ['React', 'TypeScript', 'Tailwind CSS', 'Python', 'FastAPI', 'Flask'],
  ['PostgreSQL', 'Docker', 'nginx', 'GitHub Actions', 'Linux', 'LLM APIs'],
];
const LINKS = [['github', 'shineoneday'], ['telegram', '@shinex'], ['globe', 'shinex.dev']];

// portrait.txt is 62 x 38 characters; the eyes and the two sparks are lifted out and animated on their own
const ART = readFileSync(new URL('portrait.txt', import.meta.url), 'utf8').split(/\r?\n/).slice(0, 38);
const COLS = 62, ROWS = 38;
if (ART.length !== ROWS || ART.some(l => l.length > COLS)) throw new Error(`portrait.txt must be ${ROWS} lines of at most ${COLS} characters`);
const EYES = [[15, 17], [15, 30]];
const SPARKS = [{ row: 1, col: 1, w: 5, h: 3 }, { row: 4, col: 48, w: 3, h: 3 }];

// ---------- themes ----------
const THEMES = {
  dark: {
    bg: ['#030712', '#050A18'], panel: '#0F172A', panelOpacity: 0.64, edge: '#FFFFFF', edgeOpacity: 0.08,
    text: '#F8FAFC', muted: '#94A3B8', accent: ['#7C3AED', '#22D3EE', '#10B981'],
    ascii: ['#67E8F9', '#A5B4FC', '#C084FC'], asciiShift: ['#67E8F9', '#6EE7B7', '#67E8F9'],
    blobs: [['#2563EB', 0.34], ['#7C3AED', 0.30], ['#10B981', 0.18]],
    glow: 0.95, aura: 0.2, grain: '1 1 1', grainOpacity: 0.24, sheen: 0.07, top: 0.06, stripes: ['#000000', 0.3],
    shadow: ['#000000', 0.5], vignette: 0.4, dots: 0.9, pill: '#1E293B', pillOpacity: 0.55, particle: 0.7,
  },
  light: {
    bg: ['#FFFFFF', '#F6F9FF'], panel: '#F8FAFC', panelOpacity: 0.78, edge: '#0F172A', edgeOpacity: 0.08,
    text: '#0F172A', muted: '#475569', accent: ['#2563EB', '#06B6D4', '#10B981'],
    ascii: ['#1D4ED8', '#0284C7', '#0891B2'], asciiShift: ['#1D4ED8', '#4338CA', '#1D4ED8'],
    blobs: [['#2563EB', 0.13], ['#06B6D4', 0.12], ['#10B981', 0.09]],
    glow: 0.22, aura: 0.1, grain: '0.06 0.09 0.16', grainOpacity: 0.2, sheen: 0.5, top: 0.6, stripes: ['#0F172A', 0.06],
    shadow: ['#0F172A', 0.1], vignette: 0, dots: 0.85, pill: '#FFFFFF', pillOpacity: 0.85, particle: 0.55,
  },
};

// ---------- helpers ----------
const n = v => String(+(+v).toFixed(2));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nbsp = s => esc(s).replace(/ /g, '\u00a0');
const MONO = `font-family="ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace"`;
const SANS = `font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif"`;
const box = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1-${r}-${r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r}-${r}z`;
let seed = 11;
const rnd = (a = 0, b = 1) => a + (b - a) * ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// Phosphor icons (MIT), regular weight, 256 x 256
const ICON = {
  github: 'M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z',
  telegram: 'M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19Zm-61.14,36L78.15,126.35l-49.6-9.73ZM88,200V152.52l24.79,21.74Zm87.53,8L92.85,135.5l119-85.29Z',
  globe: 'M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z',
  pin: 'M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z',
  target: 'M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z',
};
const icon = (name, x, y, size, fill) => `<path fill="${fill}" transform="translate(${n(x)} ${n(y)}) scale(${n(size / 256 * 1000) / 1000})" d="${ICON[name]}"/>`;

// ---------- layout ----------
const W = 1180, H = 610;
const L = { x: 28, y: 28, w: 420, h: 554 };          // portrait card
const T = { x: 468, y: 28, w: 684, h: 554 };         // terminal card
const BAR = 42;                                      // header strip of both cards
const AX = L.x + 24, AY = L.y + 50, CW = 6, CH = 12; // portrait grid origin and cell
const TX = T.x + 32;                                 // left edge of the terminal text

// ---------- timeline, seconds ----------
const LINE = 0.075;                                  // one portrait line
const ART0 = 0.4, ART1 = ART0 + ROWS * LINE;
const at = { whoami: 0.3, hi: 0.85, name: 1.0, role: 1.5, cat: 1.8, rows: 2.6, ls: 3.3, pills: 3.95, links: 4.9 };

// The markup describes the finished banner. Every intro animation starts at 0 and holds the hidden state
// until its moment, so a viewer that does not animate shows the finished banner instead of empty cards.
const part = (a, total) => +(a / total).toFixed(4);
const fadeIn = (begin, dur = 0.45, to = 1) => `<animate attributeName="opacity" values="0;0;${to}" keyTimes="0;${part(begin, begin + dur)};1" dur="${n(begin + dur)}s" fill="freeze"/>`;
const flip = (begin, from, to) => `<animate attributeName="opacity" calcMode="discrete" values="${from};${to}" keyTimes="0;${part(begin, begin + 1)}" dur="${n(begin + 1)}s" fill="freeze"/>`;
const slideIn = (begin, dy) => `<animateTransform attributeName="transform" type="translate" values="0 ${dy};0 ${dy};0 0" keyTimes="0;${part(begin, begin + 0.5)};1" calcMode="spline" keySplines="0 0 1 1;.2 .8 .2 1" dur="${n(begin + 0.5)}s" fill="freeze"/>`;

function build(t) {
  const [violet, cyan, green] = t.accent;
  const defs = [], out = [];
  seed = 11;                                         // both themes get the same dust

  // ----- shared paint -----
  defs.push(`<clipPath id="frame"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28"/></clipPath>`);
  for (const [id, c] of [['cardL', L], ['cardR', T]]) defs.push(`<clipPath id="${id}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="20"/></clipPath>`);
  defs.push(`<linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${t.bg[0]}"/><stop offset="1" stop-color="${t.bg[1]}"/></linearGradient>`);
  t.blobs.forEach(([c, o], i) => defs.push(`<radialGradient id="blob${i}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="0.55" stop-color="${c}" stop-opacity="${n(o * 0.35)}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`));
  defs.push(`<linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${violet}"/><stop offset="0.5" stop-color="${cyan}"/><stop offset="1" stop-color="${green}"/></linearGradient>`);
  // the same three colours, sliding sideways for ever: one period is twice the vector because the spread is mirrored
  defs.push(`<linearGradient id="flow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0" spreadMethod="reflect"><stop offset="0" stop-color="${violet}"/><stop offset="0.5" stop-color="${cyan}"/><stop offset="1" stop-color="${green}"/><animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="600 0" dur="9s" repeatCount="indefinite"/></linearGradient>`);
  defs.push(`<linearGradient id="ascii" gradientUnits="userSpaceOnUse" x1="${AX}" y1="${AY}" x2="${AX + COLS * CW}" y2="${AY + ROWS * CH}">
      <stop offset="0" stop-color="${t.ascii[0]}"><animate attributeName="stop-color" values="${t.asciiShift.join(';')}" dur="11s" repeatCount="indefinite"/></stop>
      <stop offset="0.55" stop-color="${t.ascii[1]}"/><stop offset="1" stop-color="${t.ascii[2]}"/>
      <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${AX + COLS * CW / 2} ${AY + ROWS * CH / 2}" to="360 ${AX + COLS * CW / 2} ${AY + ROWS * CH / 2}" dur="16s" repeatCount="indefinite"/>
    </linearGradient>`);
  defs.push(`<filter id="glow" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2.4" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${t.glow} 0" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  defs.push(`<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>`);
  defs.push(`<filter id="shade" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="14"/></filter>`);
  // film grain: one small tile of noise, repeated
  defs.push(`<filter id="noise" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${t.grain.split(' ')[0]} 0 0 0 0 ${t.grain.split(' ')[1]} 0 0 0 0 ${t.grain.split(' ')[2]} 1.5 0 0 0 -0.56"/></filter>`);
  defs.push(`<pattern id="grain" width="240" height="240" patternUnits="userSpaceOnUse"><rect width="240" height="240" filter="url(#noise)"/></pattern>`);
  defs.push(`<linearGradient id="stripes" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="4" spreadMethod="repeat"><stop offset="0" stop-color="${t.stripes[0]}" stop-opacity="0"/><stop offset="0.5" stop-color="${t.stripes[0]}" stop-opacity="0"/><stop offset="0.5" stop-color="${t.stripes[0]}" stop-opacity="${t.stripes[1]}"/><stop offset="1" stop-color="${t.stripes[0]}" stop-opacity="${t.stripes[1]}"/></linearGradient>`);
  defs.push(`<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`);
  defs.push(`<mask id="band" maskUnits="userSpaceOnUse" x="${L.x}" y="${L.y - 120}" width="${L.w}" height="120"><rect x="${L.x}" y="${L.y - 120}" width="${L.w}" height="120" fill="url(#fade)"/></mask>`);
  defs.push(`<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cyan}" stop-opacity="0"/><stop offset="0.8" stop-color="${cyan}" stop-opacity="${n(t.glow * 0.22)}"/><stop offset="1" stop-color="${cyan}" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="${t.sheen}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="${t.top}"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.edge}" stop-opacity="${n(t.edgeOpacity * 2.2)}"/><stop offset="0.4" stop-color="${t.edge}" stop-opacity="${n(t.edgeOpacity * 0.8)}"/><stop offset="1" stop-color="${t.edge}" stop-opacity="${n(t.edgeOpacity * 1.3)}"/></linearGradient>`);
  defs.push(`<radialGradient id="aura"><stop offset="0" stop-color="${cyan}" stop-opacity="${t.aura}"/><stop offset="0.6" stop-color="${violet}" stop-opacity="${n(t.aura * 0.4)}"/><stop offset="1" stop-color="${violet}" stop-opacity="0"/></radialGradient>`);
  defs.push(`<radialGradient id="halo"><stop offset="0" stop-color="${cyan}" stop-opacity="${n(t.aura * 1.5)}"/><stop offset="1" stop-color="${cyan}" stop-opacity="0"/></radialGradient>`);
  // a dotted grid that drifts in the empty corner of the terminal
  defs.push(`<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${t.edge}" fill-opacity="${n(t.edgeOpacity * 2)}"/><animateTransform attributeName="patternTransform" type="translate" from="0 0" to="22 22" dur="7s" repeatCount="indefinite"/></pattern>`);
  defs.push(`<radialGradient id="corner" gradientUnits="userSpaceOnUse" cx="${T.x + T.w}" cy="${T.y + BAR}" r="440"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`);
  defs.push(`<mask id="cornerOnly" maskUnits="userSpaceOnUse" x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}"><rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" fill="url(#corner)"/></mask>`);
  if (t.vignette) defs.push(`<radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="${t.vignette}"/></radialGradient>`);

  // ----- background -----
  const bg = [`<rect width="${W}" height="${H}" fill="url(#bg)"/>`];
  const blobs = [[230, 110, 430, '0 0;46 28;-24 44;0 0', 23], [960, 150, 470, '0 0;-52 34;26 -22;0 0', 29], [620, 640, 430, '0 0;38 -46;-44 -18;0 0', 26]];
  blobs.forEach(([cx, cy, r, path, dur], i) => bg.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#blob${i})"><animateTransform attributeName="transform" type="translate" values="${path}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.33;0.66;1" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/><animate attributeName="opacity" values="0.75;1;0.75" dur="${n(dur / 3)}s" repeatCount="indefinite"/></circle>`));
  // dust: slow specks that rise and fade
  for (let i = 0; i < 26; i++) {
    const x = rnd(20, W - 20), y = rnd(60, H + 40), r = rnd(0.7, 1.7), dur = rnd(11, 24), rise = rnd(90, 210), drift = rnd(-26, 26);
    const c = [cyan, violet, green][i % 3];
    bg.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${c}" opacity="0"><animateTransform attributeName="transform" type="translate" from="0 0" to="${n(drift)} ${n(-rise)}" dur="${n(dur)}s" begin="${n(-rnd(0, dur))}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;${t.particle};${n(t.particle * 0.6)};0" keyTimes="0;0.2;0.7;1" dur="${n(dur)}s" begin="${n(-rnd(0, dur))}s" repeatCount="indefinite"/></circle>`);
  }
  if (t.vignette) bg.push(`<rect width="${W}" height="${H}" fill="url(#vignette)"/>`);
  bg.push(`<rect width="${W}" height="${H}" fill="url(#grain)" opacity="${t.grainOpacity}"/>`);
  out.push(`<g clip-path="url(#frame)">${bg.join('\n')}</g>`);

  // ----- a glass card -----
  const card = (c, id, lap) => {
    const p = box(c.x, c.y, c.w, c.h, 20);
    return `<path d="${box(c.x + 6, c.y + 14, c.w - 12, c.h - 8, 20)}" fill="${t.shadow[0]}" opacity="${t.shadow[1]}" filter="url(#shade)"/>
<path d="${p}" fill="${t.panel}" fill-opacity="${t.panelOpacity}"/>
<g clip-path="url(#${id})">
  <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="url(#top)"/>
  <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${BAR}" fill="${t.edge}" fill-opacity="${n(t.edgeOpacity * 0.35)}"/>
  <rect x="${c.x}" y="${c.y + BAR}" width="${c.w}" height="1" fill="${t.edge}" fill-opacity="${t.edgeOpacity}"/>
  <rect x="${c.x - 260}" y="${c.y - 40}" width="190" height="${c.h + 80}" fill="url(#sheen)" transform="skewX(-18)"><animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;${c.w + 620} 0;${c.w + 620} 0" keyTimes="0;0.2;1" dur="${lap + 3}s" begin="${n(lap / 4)}s" repeatCount="indefinite"/></rect>
</g>
<path d="${p}" fill="none" stroke="url(#edge)"/>
<path d="${p}" fill="none" stroke="url(#accent)" stroke-width="5" stroke-linecap="round" opacity="0.28" pathLength="1000" stroke-dasharray="90 910" filter="url(#soft)"><animate attributeName="stroke-dashoffset" from="0" to="-1000" dur="${lap}s" repeatCount="indefinite"/></path>
<path d="${p}" fill="none" stroke="url(#accent)" stroke-width="1.4" stroke-linecap="round" pathLength="1000" stroke-dasharray="90 910"><animate attributeName="stroke-dashoffset" from="0" to="-1000" dur="${lap}s" repeatCount="indefinite"/></path>`;
  };

  // ----- portrait card -----
  const art = ART.map(l => [...l.padEnd(COLS)]);
  const lift = (r, c) => { const ch = art[r][c]; art[r][c] = ' '; return ch; };
  const eyes = EYES.map(([r, c]) => ({ r, c, ch: lift(r, c) }));
  const sparks = SPARKS.map(s => ({ ...s, rows: Array.from({ length: s.h }, (_, i) => Array.from({ length: s.w }, (_, j) => lift(s.row + i, s.col + j)).join('')) }));
  const cell = (r, c) => [AX + c * CW, AY + r * CH + 9.4];
  const lastCol = Math.max(...art[ROWS - 1].map((ch, i) => ch === ' ' ? -1 : i)) + 1;

  defs.push(`<clipPath id="typed">${art.map((_, i) => {
    const from = ART0 + i * LINE, full = COLS * CW + 4;
    return `<rect x="${AX - 2}" y="${n(AY + i * CH - 0.5)}" width="${full}" height="${CH}"><animate attributeName="width" values="0;0;${full}" keyTimes="0;${part(from, from + LINE)};1" dur="${n(from + LINE)}s" fill="freeze"/></rect>`;
  }).join('')}</clipPath>`);

  const portrait = [];
  portrait.push(`<ellipse cx="${AX + 150}" cy="${AY + 190}" rx="230" ry="250" fill="url(#aura)"><animate attributeName="opacity" values="0.55;1;0.55" dur="5s" repeatCount="indefinite"/></ellipse>`);
  portrait.push(`<g><animateTransform attributeName="transform" type="translate" values="0 3;0 -3;0 3" dur="7s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/>
  <g clip-path="url(#typed)"><g filter="url(#glow)" ${MONO} font-size="10" font-weight="700" fill="url(#ascii)">
${art.map((l, i) => l.some(ch => ch !== ' ') ? `    <text x="${AX}" y="${n(AY + i * CH + 9.4)}" textLength="${COLS * CW}">${nbsp(l.join(''))}</text>` : '').filter(Boolean).join('\n')}
${eyes.map(e => { const [x, y] = cell(e.r, e.c); return `    <text x="${x}" y="${y}">${esc(e.ch)}<animate attributeName="opacity" calcMode="discrete" values="1;0;1" keyTimes="0;0.95;0.98" dur="5.4s" repeatCount="indefinite"/></text><text x="${x}" y="${y}" opacity="0">-<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;0.95;0.98" dur="5.4s" repeatCount="indefinite"/></text>`; }).join('\n')}
${sparks.map((s, k) => `    <g><animate attributeName="opacity" values="1;0.25;1" dur="${k ? 2.3 : 3.1}s" repeatCount="indefinite"/>${s.rows.map((row, i) => `<text x="${AX + s.col * CW}" y="${n(AY + (s.row + i) * CH + 9.4)}" textLength="${s.w * CW}">${nbsp(row)}</text>`).join('')}</g>`).join('\n')}
  </g></g>
  <rect x="${AX + lastCol * CW + 3}" y="${AY + (ROWS - 1) * CH}" width="${CW}" height="11" rx="1" fill="${cyan}">
    ${flip(ART0, 0, 1)}
    <animate attributeName="x" from="${AX}" to="${AX + COLS * CW}" begin="${ART0}s" dur="${LINE}s" repeatCount="${ROWS}"/>
    <animate attributeName="y" calcMode="discrete" values="${art.map((_, i) => n(AY + i * CH)).join(';')}" begin="${ART0}s" dur="${n(ROWS * LINE)}s"/>
    <animate attributeName="opacity" calcMode="discrete" values="1;0" begin="${n(ART1)}s" dur="1.1s" repeatCount="indefinite"/>
  </rect>
</g>`);
  // a band of light with fine scanlines inside it keeps sweeping down the screen
  portrait.push(`<g><animateTransform attributeName="transform" type="translate" from="0 0" to="0 ${L.h + 120}" dur="4.6s" repeatCount="indefinite"/>
  <rect x="${L.x}" y="${L.y - 120}" width="${L.w}" height="120" fill="url(#scan)"/>
  <rect x="${L.x}" y="${L.y - 120}" width="${L.w}" height="120" fill="url(#stripes)" mask="url(#band)"/>
</g>`);

  const foot = L.y + L.h - 26;
  const head = `<circle cx="${L.x + 27}" cy="${L.y + 21}" r="3.5" fill="${green}"><animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite"/></circle>
<circle cx="${L.x + 27}" cy="${L.y + 21}" r="3.5" fill="none" stroke="${green}"><animate attributeName="r" values="3.5;9" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite"/></circle>
<text x="${L.x + 40}" y="${L.y + 25.5}" ${MONO} font-size="12" fill="${t.muted}">portrait.ascii</text>
<text x="${L.x + L.w - 24}" y="${L.y + 25.5}" ${MONO} font-size="12" fill="${t.muted}" text-anchor="end">${COLS} x ${ROWS}</text>
<text x="${AX}" y="${foot}" ${MONO} font-size="11.5" fill="${t.muted}" opacity="0">rendering${flip(ART1, 1, 0)}</text>
<text x="${AX}" y="${foot}" ${MONO} font-size="11.5" fill="${t.muted}">rendered in ${n(ROWS * LINE)}s${flip(ART1, 0, 1)}</text>
<rect x="${AX}" y="${foot + 9}" width="${COLS * CW}" height="3" rx="1.5" fill="${t.edge}" fill-opacity="${t.edgeOpacity}"/>
<rect x="${AX}" y="${foot + 9}" width="${COLS * CW}" height="3" rx="1.5" fill="url(#flow)"><animate attributeName="width" values="0;0;${COLS * CW}" keyTimes="0;${part(ART0, ART1)};1" dur="${n(ART1)}s" fill="freeze"/></rect>`;

  out.push(card(L, 'cardL', 8));
  out.push(`<g clip-path="url(#cardL)">${portrait.join('\n')}</g>`);
  out.push(head);

  // ----- terminal card -----
  const term = [];
  const show = (begin, body, dy = 7) => `<g>${fadeIn(begin)}${slideIn(begin, dy)}${body}</g>`;
  const chevron = (x, y, size = 9) => `<path d="M${x} ${n(y - size)}l${n(size / 2)} ${n(size / 2)}-${n(size / 2)} ${n(size / 2)}" fill="none" stroke="url(#accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  let clips = 0;
  // a command that types itself once, with its own caret
  const command = (y, text, begin, per = 0.05) => {
    const cw = 7.8, x = TX + 17, id = 'cmd' + clips++, len = text.length, total = begin + len * per + 0.5;
    const widths = Array.from({ length: len + 1 }, (_, i) => i * cw);
    const timing = `calcMode="discrete" keyTimes="${widths.map((_, i) => i ? part(begin + i * per, total) : 0).join(';')}" dur="${n(total)}s" fill="freeze"`;
    defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y - 13}" width="${n(len * cw)}" height="18"><animate attributeName="width" values="${widths.map(n).join(';')}" ${timing}/></rect></clipPath>`);
    return `<g>${flip(begin - 0.25, 0, 1)}${chevron(TX, y - 0.5)}
  <text x="${x}" y="${y}" ${MONO} font-size="13" fill="${t.muted}" textLength="${n(len * cw)}" clip-path="url(#${id})">${nbsp(text)}</text>
  <rect x="${x}" y="${y - 11.5}" width="7" height="14" rx="1" fill="${t.muted}" opacity="0"><animate attributeName="x" values="${widths.map(w => n(x + w + 1)).join(';')}" ${timing}/><animate attributeName="opacity" calcMode="discrete" values="1;0" keyTimes="0;${part(begin + len * per + 0.2, total)}" dur="${n(total)}s" fill="freeze"/></rect></g>`;
  };

  term.push(`<rect x="${T.x}" y="${T.y + BAR + 1}" width="${T.w}" height="${T.h - BAR - 1}" fill="url(#dots)" mask="url(#cornerOnly)"/>`);

  // window bar
  term.push([violet, cyan, green].map((c, i) => `<circle cx="${T.x + 26 + i * 18}" cy="${T.y + 21}" r="5" fill="${c}" opacity="${t.dots}"/>`).join(''));
  term.push(`<text x="${T.x + T.w / 2}" y="${T.y + 25.5}" ${MONO} font-size="12" fill="${t.muted}" text-anchor="middle">shinex@github: ~</text>`);

  // whoami
  term.push(command(104, 'whoami', at.whoami, 0.07));
  term.push(show(at.hi, `<text x="${TX}" y="142" ${SANS} font-size="21" font-weight="500" fill="${t.muted}">Hi</text>
  <text x="${TX + 29}" y="142" ${SANS} font-size="20"><animateTransform attributeName="transform" type="rotate" values="0 ${TX + 47} 146;16 ${TX + 47} 146;-8 ${TX + 47} 146;14 ${TX + 47} 146;-4 ${TX + 47} 146;0 ${TX + 47} 146;0 ${TX + 47} 146" keyTimes="0;0.08;0.16;0.24;0.32;0.4;1" dur="3.6s" begin="${n(at.hi + 0.4)}s" repeatCount="indefinite"/>\u{1F44B}</text>`));
  term.push(`<ellipse cx="${TX + 150}" cy="174" rx="250" ry="58" fill="url(#halo)" opacity="0.9">${fadeIn(at.name, 0.8, 0.9)}<animate attributeName="opacity" values="0.9;0.45;0.9" begin="${n(at.name + 0.8)}s" dur="4.2s" repeatCount="indefinite"/></ellipse>`);
  term.push(show(at.name, `<text x="${TX - 1}" y="190" ${SANS} font-size="46" font-weight="700" letter-spacing="-1.2" fill="${t.text}">I'm <tspan fill="url(#flow)">${esc(NAME)}</tspan></text>`, 10));

  // the role line: every phrase types, waits, and is erased; the caret follows and only blinks while waiting
  const RW = 10.2, RX = TX + 19, RY = 226, TYPE = 0.07, HOLD = 1.8, ERASE = 0.035, GAP = 0.4;
  const total = ROLES.reduce((s, r) => s + r.length * (TYPE + ERASE) + HOLD + GAP, 0);
  let clock = 0;
  const caretX = [[0, 0]], caretOn = [[0, 1]];
  const roles = ROLES.map((role, k) => {
    const len = role.length, ev = k ? [[0, 0]] : [];
    for (let i = k ? 1 : 0; i <= len; i++) ev.push([clock + i * TYPE, i]);
    const held = clock + len * TYPE;
    for (let b = 0.5; b < HOLD - 0.2; b += 0.5) caretOn.push([held + b, (b / 0.5) % 2 ? 0 : 1]);
    caretOn.push([held + HOLD, 1]);
    for (let i = 1; i <= len; i++) ev.push([held + HOLD + i * ERASE, len - i]);
    for (const e of ev.slice(k ? 1 : 0)) caretX.push(e);
    clock = held + HOLD + len * ERASE + GAP;
    // at rest the first phrase is written out; until the loop starts it is held empty
    defs.push(`<clipPath id="role${k}"><rect x="${RX}" y="${RY - 17}" width="${k ? 0 : n(len * RW)}" height="24">${k ? '' : `<animate attributeName="width" values="0;0" dur="${at.role}s"/>`}<animate attributeName="width" calcMode="discrete" values="${ev.map(e => n(e[1] * RW)).join(';')}" keyTimes="${ev.map(e => n(e[0] / total * 10000) / 10000).join(';')}" begin="${at.role}s" dur="${n(total)}s" repeatCount="indefinite"/></rect></clipPath>`);
    return `<text x="${RX}" y="${RY}" ${MONO} font-size="17" fill="${t.text}" textLength="${n(len * RW)}" clip-path="url(#role${k})">${nbsp(role)}</text>`;
  });
  const keys = a => a.map(e => n(e[0] / total * 10000) / 10000).join(';');
  // SMIL drops an animation whose key times do not grow, and it does so silently
  for (const list of [caretX.slice(1), caretOn]) list.forEach((e, i) => { if (i && e[0] <= list[i - 1][0] || e[0] > total) throw new Error('role timeline is out of order at ' + e[0]); });
  term.push(show(at.role - 0.3, `${chevron(TX, RY - 1, 10)}${roles.join('')}
  <rect x="${n(RX + ROLES[0].length * RW + 2)}" y="${RY - 15}" width="9" height="18" rx="1.5" fill="${cyan}">
    <animate attributeName="x" values="${RX + 2};${RX + 2}" dur="${at.role}s"/>
    <animate attributeName="x" calcMode="discrete" values="${caretX.slice(1).map(e => n(RX + e[1] * RW + 2)).join(';')}" keyTimes="${keys(caretX.slice(1))}" begin="${at.role}s" dur="${n(total)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" calcMode="discrete" values="${caretOn.map(e => e[1]).join(';')}" keyTimes="${keys(caretOn)}" begin="${at.role}s" dur="${n(total)}s" repeatCount="indefinite"/>
  </rect>`));

  // about
  term.push(command(268, 'cat about.yml', at.cat));
  ABOUT.forEach(([ic, key, value], i) => {
    const y = 294 + i * 25;
    term.push(show(at.rows + i * 0.14, `${icon(ic, TX, y - 12, 15, 'url(#accent)')}<text x="${TX + 24}" y="${y}" ${MONO} font-size="13.5" fill="${t.muted}">${esc(key)}</text><text x="${TX + 124}" y="${y}" ${MONO} font-size="13.5" fill="${t.text}">${esc(value)}</text>`));
  });

  // skills
  term.push(command(408, 'ls skills/', at.ls));
  let p = 0;
  SKILLS.forEach((row, r) => {
    let x = TX;
    for (const s of row) {
      const w = Math.round(s.length * 7.5 + 28), cx = x + w / 2, cy = 438 + r * 36, id = 'pill' + p, begin = at.pills + p * 0.06;
      term.push(`<g transform="translate(${n(cx)} ${cy})"><g id="${id}">
  ${fadeIn(begin, 0.3)}
  <animateTransform attributeName="transform" type="scale" values="0.82;0.82;1.05;1" keyTimes="0;${part(begin, begin + 0.45)};${part(begin + 0.27, begin + 0.45)};1" dur="${n(begin + 0.45)}s" fill="freeze"/>
  <animateTransform attributeName="transform" type="scale" to="1.07" begin="${id}.mouseover" dur="0.16s" fill="freeze"/>
  <animateTransform attributeName="transform" type="scale" to="1" begin="${id}.mouseout" dur="0.2s" fill="freeze"/>
  <ellipse rx="${n(w / 2 + 12)}" ry="24" fill="url(#halo)" opacity="0.35"><animate attributeName="opacity" values="0.3;0.95;0.3" begin="${n(begin + p * 0.22)}s" dur="3.4s" repeatCount="indefinite"/><animate attributeName="opacity" to="1.6" begin="${id}.mouseover" dur="0.16s" fill="freeze"/><animate attributeName="opacity" to="0.35" begin="${id}.mouseout" dur="0.2s" fill="freeze"/></ellipse>
  <rect x="${n(-w / 2)}" y="-14" width="${w}" height="28" rx="14" fill="${t.pill}" fill-opacity="${t.pillOpacity}"/>
  <rect x="${n(-w / 2)}" y="-14" width="${w}" height="28" rx="14" fill="none" stroke="url(#accent)" stroke-opacity="0.75"/>
  <rect x="${n(-w / 2 + 6)}" y="-13" width="${w - 12}" height="10" rx="5" fill="#FFFFFF" fill-opacity="${n(t.sheen * 0.6)}"/>
  <text y="4.4" ${MONO} font-size="12.5" fill="${t.text}" text-anchor="middle">${esc(s)}</text>
</g></g>`);
      x += w + 8; p++;
    }
  });

  // links
  let lx = TX;
  LINKS.forEach(([ic, text], i) => {
    const w = Math.round(text.length * 7.8 + 56);
    term.push(show(at.links + i * 0.15, `<ellipse cx="${lx + 23}" cy="530" rx="22" ry="22" fill="url(#halo)"><animate attributeName="opacity" values="0.4;1;0.4" begin="${n(i * 0.7)}s" dur="3.8s" repeatCount="indefinite"/></ellipse>
  <rect x="${lx}" y="512" width="${w}" height="36" rx="18" fill="${t.pill}" fill-opacity="${n(t.pillOpacity * 0.8)}" stroke="url(#edge)"/>
  ${icon(ic, lx + 14, 521, 18, 'url(#accent)')}<text x="${lx + 40}" y="534.5" ${MONO} font-size="13" fill="${t.text}">${esc(text)}</text>`));
    lx += w + 10;
  });

  out.push(card(T, 'cardR', 10));
  out.push(`<g clip-path="url(#cardR)">${term.join('\n')}</g>`);

  // ----- frame -----
  const frame = box(1, 1, W - 2, H - 2, 28);
  out.push(`<path d="${frame}" fill="none" stroke="url(#edge)"/>
<path d="${frame}" fill="none" stroke="url(#accent)" stroke-width="1.6" stroke-linecap="round" pathLength="1000" stroke-dasharray="70 430" opacity="0.8"><animate attributeName="stroke-dashoffset" from="0" to="-1000" dur="14s" repeatCount="indefinite"/></path>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${esc(NAME)}, full-stack developer</title>
<desc id="desc">An ASCII portrait next to a terminal window. ${esc(ABOUT.map(a => a[1] + ': ' + a[2]).join('. '))}. Skills: ${esc(SKILLS.flat().join(', '))}.</desc>
<defs>
${defs.join('\n')}
</defs>
${out.join('\n')}
</svg>
`;
}

for (const [name, theme] of Object.entries(THEMES)) {
  const svg = build(theme);
  writeFileSync(new URL(name + '.svg', import.meta.url), svg);
  console.log(name + '.svg', (Buffer.byteLength(svg) / 1024).toFixed(1) + ' KB');
}
