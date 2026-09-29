// Builds dark.svg and light.svg, the banner of the profile README, in the hand-drawn style of shinex.dev:
// paper, ink line, one yellow accent, flat colour only.
// Pure SVG animated with SMIL. GitHub shows it as an image, so no scripts, no fonts, no external files.
// Usage: node build.mjs
import { writeFileSync } from 'node:fs';

// ---------- content ----------
const GREETING = "Hi! I'm";
const NAME = 'Shinex';
const WHAT = ['full-stack web development', 'AI automation', 'deployment and infrastructure'];
const SKILLS = [
  ['React', 'TypeScript', 'Tailwind CSS', 'Python', 'FastAPI', 'Flask'],
  ['PostgreSQL', 'Docker', 'nginx', 'GitHub Actions', 'Linux', 'LLM APIs'],
];
const LINKS = [['globe', 'shinex.dev'], ['telegram', '@shinex']];
const PLACE = 'Moscow';

// ---------- colours: in the dark theme paper and ink swap, the yellow and the character stay as they are ----------
const YELLOW = '#FFC83D', PAPER = '#FFFDF8', INK = '#17171B';
const THEMES = {
  light: { paper: PAPER, ink: INK, muted: '#5F5F68', mark: '#B87C00' },
  dark: { paper: INK, ink: PAPER, muted: '#A8A8B3', mark: YELLOW },
};

// ---------- helpers ----------
const n = v => String(+(+v).toFixed(2));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nbsp = s => esc(s).replace(/ /g, ' ');
const MONO = `font-family="'JetBrains Mono',ui-monospace,'Cascadia Mono','SF Mono',Menlo,Consolas,'Liberation Mono',monospace"`;

// Phosphor icons (MIT), regular weight, 256 x 256
const ICON = {
  telegram: 'M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19Zm-61.14,36L78.15,126.35l-49.6-9.73ZM88,200V152.52l24.79,21.74Zm87.53,8L92.85,135.5l119-85.29Z',
  globe: 'M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z',
  pin: 'M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z',
};
const icon = (name, x, y, size, fill) => `<path fill="${fill}" transform="translate(${n(x)} ${n(y)}) scale(${n(size / 256 * 1000) / 1000})" d="${ICON[name]}"/>`;

// ---------- layout ----------
const W = 1180, H = 610;
const CARD = { x: 5, y: 5, w: 1160, h: 590, r: 26, drop: 10 };   // the drop is the flat offset shadow
const SUN = { cx: 236, cy: 420, r: 262 };
const DUDE = { x: 14, y: 75, s: 1 };                              // the character is drawn in a 420 x 520 box
const COL = 548;                                                  // left edge of the text column
const LETTER = { h: 88, w: 26, gap: 44 };                         // name: cap height, stroke, advance between letters

// the name is lettered by hand as single strokes with round ends; [width, strokes in the order a pen would draw them]
const LETTERS = {
  S: [60, ['M58 17C54 6 44 0 30 0C13 0 2 9 2 23C2 38 15 42 30 44C46 46 58 51 58 65C58 79 47 88 30 88C16 88 6 82 2 71']],
  H: [58, ['M0 0V88', 'M58 0V88', 'M0 44H58']],
  I: [0, ['M0 0V88']],
  N: [60, ['M0 88V0L60 88V0']],
  E: [48, ['M48 0H0V88H48', 'M0 44H42']],
  X: [60, ['M0 0L60 88', 'M60 0L0 88']],
};

// ---------- timeline, seconds ----------
const at = { hi: 0.3, name: 1.05, dude: 1.2, what: 2.6, tags: 2.9, links: 3.8 };

// The markup describes the finished banner. Every intro animation starts at 0 and holds the hidden state
// until its moment, so a viewer that does not animate shows the finished banner instead of an empty card.
const part = (a, total) => +(a / total).toFixed(4);
const fadeIn = (begin, dur = 0.4) => `<animate attributeName="opacity" values="0;0;1" keyTimes="0;${part(begin, begin + dur)};1" dur="${n(begin + dur)}s" fill="freeze"/>`;
const flip = (begin, from, to) => `<animate attributeName="opacity" calcMode="discrete" values="${from};${to}" keyTimes="0;${part(begin, begin + 1)}" dur="${n(begin + 1)}s" fill="freeze"/>`;
// Things land with a small overshoot, as on the site. SMIL splines cannot leave the 0..1 range,
// so the overshoot is a key frame of its own.
const over = (begin, dur) => `keyTimes="0;${part(begin, begin + dur)};${part(begin + dur * 0.6, begin + dur)};1" calcMode="spline" keySplines="0 0 1 1;.2 .7 .4 1;.4 0 .6 1" dur="${n(begin + dur)}s" fill="freeze"`;
const land = (begin, dy, dur = 0.7) => `<animateTransform attributeName="transform" type="translate" values="0 ${dy};0 ${dy};0 ${n(-dy * 0.07)};0 0" ${over(begin, dur)}/>`;
const pop = (begin, dur = 0.45) => `<animateTransform attributeName="transform" type="scale" values="0.6;0.6;1.08;1" ${over(begin, dur)}/>`;

function build(t) {
  const defs = [], out = [];
  const inner = `x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}"`;
  defs.push(`<clipPath id="card"><rect ${inner}/></clipPath>`);
  // line boil: the noise changes a few times a second, so the strokes wobble like frame-by-frame drawing
  const boil = (id, region, amount) => `<filter id="${id}" ${region}><feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="1" seed="1" result="n"><animate attributeName="seed" values="1;7;13;4" dur="0.6s" calcMode="discrete" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="${amount}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  defs.push(boil('boil', 'x="-5%" y="-5%" width="110%" height="110%"', 3.5));
  // the heavy letters get less of it: on a thick stroke the same wobble reads as a torn edge
  defs.push(boil('boilName', 'x="-5%" y="-30%" width="110%" height="160%"', 2));

  // ----- character on the sun -----
  const wave = `<animateTransform attributeName="transform" type="rotate" values="-4 337 384;9 337 384;-4 337 384" keyTimes="0;0.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="1.6s" repeatCount="indefinite"/>`;
  const eye = cx => `<g transform="translate(${cx} 270)"><circle r="6" fill="${INK}" stroke="none"><animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 0.1;1 1;1 1" keyTimes="0;0.46;0.48;0.5;1" dur="5s" repeatCount="indefinite"/></circle></g>`;
  const dude = `<g transform="translate(${DUDE.x} ${DUDE.y}) scale(${DUDE.s})" filter="url(#boil)" fill="${PAPER}" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
  <path fill="none" stroke-width="42" d="M284 408C304 408 323 401 337 384"/>
  <g>${wave}<path fill="none" stroke-width="42" d="M337 384C352 367 362 341 366 304"/></g>
  <path d="M92 530C90 470 96 418 128 396C150 382 180 376 210 376C256 376 270 393 293 391L302 389L312 420L298 423.5C298 455 303 490 303 530"/>
  <path fill="none" stroke-width="6" d="M134 456c-4 22-6 48-6 74"/>
  <path fill="none" stroke-width="6" d="M176 378c4 24 18 36 34 36s30-12 34-36"/>
  <path stroke="none" d="M190 330v48c6 10 34 10 40 0v-48z"/>
  <path fill="none" d="M190 346v30M230 346v30"/>
  <circle cx="210" cy="250" r="92"/>
  <path fill="${INK}" d="M210 172c-18 16-52 30-76 52-12 12-18 28-22 46-26-42-20-100 20-132 28-22 62-20 78-2 16-18 50-20 78 2 40 32 46 90 20 132-4-18-10-34-22-46-24-22-58-36-76-52z"/>
  <path fill="none" stroke="${PAPER}" stroke-width="6" d="M196 146c-30 12-56 36-68 70M224 146c30 12 56 36 68 70"/>
  <circle cx="172" cy="268" r="31"/><circle cx="248" cy="268" r="31"/>
  <path fill="none" d="M203 264q7-8 14 0M141 262l-22-8M279 262l22-8"/>
  ${eye(174)}${eye(246)}
  <path fill="none" stroke-width="6" d="M194 314q16 14 32 0"/>
  <path fill="none" stroke="${PAPER}" stroke-width="24" d="M284 408C304 408 323 401 337 384"/>
  <g>${wave}<path d="M350 302C342 290 339 273 343 255C347 238 360 229 376 231C392 232 403 243 403 262C403 280 394 296 382 306"/><path fill="none" stroke="${PAPER}" stroke-width="24" d="M337 384C352 367 362 341 366 304"/></g>
</g>`;
  const spark = (x, y, size, dur, delay) => `<g transform="translate(${x} ${y}) scale(${size})"><path fill="${YELLOW}" d="M0-22c3 14 8 19 22 22-14 3-19 8-22 22-3-14-8-19-22-22 14-3 19-8 22-22z"><animateTransform attributeName="transform" type="scale" values="1;0.55;1" keyTimes="0;0.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></path></g>`;

  const scene = `<g>${fadeIn(at.dude, 0.3)}${land(at.dude, 170, 0.9)}
<circle cx="${SUN.cx}" cy="${SUN.cy}" r="${SUN.r}" fill="${YELLOW}"/>
${dude}
</g>
<g>${fadeIn(at.dude + 0.6, 0.4)}${spark(500, 118, 1, 2.4, 0)}${spark(64, 96, 0.62, 2.4, -1.2)}</g>`;

  // ----- greeting: types itself, then hands the caret over to the line below -----
  const typed = [];
  {
    const size = 28, pitch = size * 0.6 + size * 0.08, len = GREETING.length, per = 0.095, y = 118, total = at.hi + len * per + 0.5;
    const widths = Array.from({ length: len + 1 }, (_, i) => i * pitch);
    const timing = `calcMode="discrete" keyTimes="${widths.map((_, i) => i ? part(at.hi + i * per, total) : 0).join(';')}" dur="${n(total)}s" fill="freeze"`;
    defs.push(`<clipPath id="hi"><rect x="${COL}" y="${y - 30}" width="${n(len * pitch)}" height="40"><animate attributeName="width" values="${widths.map(n).join(';')}" ${timing}/></rect></clipPath>`);
    typed.push(`<text x="${COL}" y="${y}" ${MONO} font-size="${size}" fill="${t.ink}" textLength="${n(len * pitch - size * 0.08)}" clip-path="url(#hi)">${nbsp(GREETING)}</text>
<rect x="${COL}" y="${y - 25}" width="3" height="31" fill="${t.ink}" opacity="0"><animate attributeName="x" values="${widths.map(w => n(COL + w + 2)).join(';')}" ${timing}/><animate attributeName="opacity" calcMode="discrete" values="1;0;1;0" keyTimes="0;${part(at.hi + len * per + 0.35, at.what)};${part(at.hi + len * per + 0.7, at.what)};${part(at.what - 0.2, at.what)}" dur="${n(at.what)}s" fill="freeze"/></rect>`);
  }

  // ----- name: drawn stroke by stroke -----
  const strokes = [];
  {
    let x = 0, clock = at.name;
    for (const ch of NAME.toUpperCase()) {
      const [w, paths] = LETTERS[ch];
      for (const d of paths) {
        const long = d.length > 20 || /L/.test(d), dur = long ? 0.3 : 0.14;
        strokes.push(`<path d="${d}" transform="translate(${x} 0)" pathLength="1" stroke-dasharray="1">${flip(clock, 0, 1)}<animate attributeName="stroke-dashoffset" values="1;1;0" keyTimes="0;${part(clock, clock + dur)};1" calcMode="spline" keySplines="0 0 1 1;.4 0 .2 1" dur="${n(clock + dur)}s" fill="freeze"/></path>`);
        clock += dur * 0.62;
      }
      x += w + LETTER.gap;
    }
  }
  const name = `<g transform="translate(${COL + LETTER.w / 2} 146)" filter="url(#boilName)" fill="none" stroke="${t.ink}" stroke-width="${LETTER.w}" stroke-linecap="round" stroke-linejoin="round">
${strokes.join('\n')}
</g>`;

  // ----- what I do: every phrase types, waits, and is erased; a marker stroke grows under it -----
  const SIZE = 21, PITCH = SIZE * 0.6, WX = COL + 24, WY = 306, TYPE = 0.06, HOLD = 2.2, ERASE = 0.03, GAP = 0.45;
  const total = WHAT.reduce((s, p) => s + p.length * (TYPE + ERASE) + HOLD + GAP, 0);
  let clock = 0;
  const steps = [], blink = [[0, 1]];
  const phrases = WHAT.map((phrase, k) => {
    const len = phrase.length, ev = k ? [[0, 0]] : [];
    for (let i = k ? 1 : 0; i <= len; i++) ev.push([clock + i * TYPE, i]);
    const held = clock + len * TYPE;
    for (let b = 0.5; b < HOLD - 0.2; b += 0.5) blink.push([held + b, Math.round(b / 0.5) % 2 ? 0 : 1]);
    blink.push([held + HOLD, 1]);
    for (let i = 1; i <= len; i++) ev.push([held + HOLD + i * ERASE, len - i]);
    steps.push(...ev.slice(k ? 1 : 0));
    clock = held + HOLD + len * ERASE + GAP;
    defs.push(`<clipPath id="what${k}"><rect x="${WX}" y="${WY - 22}" width="${k ? 0 : n(len * PITCH)}" height="32">${k ? '' : `<animate attributeName="width" values="0;0" dur="${at.what}s"/>`}<animate attributeName="width" calcMode="discrete" values="${ev.map(e => n(e[1] * PITCH)).join(';')}" keyTimes="${ev.map(e => part(e[0], total)).join(';')}" begin="${at.what}s" dur="${n(total)}s" repeatCount="indefinite"/></rect></clipPath>`);
    return `<text x="${WX}" y="${WY}" ${MONO} font-size="${SIZE}" fill="${t.ink}" textLength="${n(len * PITCH)}" clip-path="url(#what${k})">${nbsp(phrase)}</text>`;
  });
  // SMIL drops an animation whose key times do not grow, and it does so silently
  for (const list of [steps, blink]) list.forEach((e, i) => { if (i && e[0] <= list[i - 1][0] || e[0] > total) throw new Error('timeline of the typed line is out of order at ' + e[0]); });
  const keys = a => a.map(e => part(e[0], total)).join(';');
  const loop = `begin="${at.what}s" dur="${n(total)}s" repeatCount="indefinite"`;
  const first = WHAT[0].length * PITCH;
  const what = `<g>${fadeIn(at.what - 0.3, 0.3)}
<path d="M${COL} ${WY - 17}l7 7-7 7" fill="none" stroke="${t.mark}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="${WX - 3}" y="${WY + 6}" width="${n(first + 6)}" height="7" rx="3.5" fill="${YELLOW}"><animate attributeName="width" values="0;0" dur="${at.what}s"/><animate attributeName="width" calcMode="discrete" values="${steps.map(e => n(e[1] ? e[1] * PITCH + 6 : 0)).join(';')}" keyTimes="${keys(steps)}" ${loop}/></rect>
${phrases.join('')}
<rect x="${n(WX + first + 3)}" y="${WY - 19}" width="3" height="25" fill="${t.ink}"><animate attributeName="x" values="${WX + 3};${WX + 3}" dur="${at.what}s"/><animate attributeName="x" calcMode="discrete" values="${steps.map(e => n(WX + e[1] * PITCH + 3)).join(';')}" keyTimes="${keys(steps)}" ${loop}/><animate attributeName="opacity" calcMode="discrete" values="${blink.map(e => e[1]).join(';')}" keyTimes="${keys(blink)}" ${loop}/></rect>
</g>`;

  // ----- skills: outlined pills, as the tags on the site -----
  const tags = [];
  let p = 0;
  SKILLS.forEach((row, r) => {
    let x = COL;
    for (const s of row) {
      const w = Math.round(s.length * 7.8 + 30), cx = x + w / 2, cy = 362 + r * 40, id = 'tag' + p, begin = at.tags + p * 0.06;
      tags.push(`<g transform="translate(${n(cx)} ${cy})"><g id="${id}">${fadeIn(begin, 0.2)}${pop(begin)}
  <rect x="${n(-w / 2)}" y="-15" width="${w}" height="30" rx="15" fill="${t.paper}" stroke="${t.ink}" stroke-width="2"><animate attributeName="fill" to="${YELLOW}" begin="${id}.mouseover" dur="0.15s" fill="freeze"/><animate attributeName="fill" to="${t.paper}" begin="${id}.mouseout" dur="0.2s" fill="freeze"/></rect>
  <text y="4.6" ${MONO} font-size="13" fill="${t.ink}" text-anchor="middle">${esc(s)}<animate attributeName="fill" to="${INK}" begin="${id}.mouseover" dur="0.15s" fill="freeze"/><animate attributeName="fill" to="${t.ink}" begin="${id}.mouseout" dur="0.2s" fill="freeze"/></text>
</g></g>`);
      x += w + 8; p++;
    }
  });

  // ----- links: the first one is the solid button of the site, then an outlined one, then the city -----
  const links = [];
  let lx = COL;
  LINKS.forEach(([ic, text], i) => {
    const w = Math.round(text.length * 9 + 74), solid = i === 0;
    // on paper the solid button is ink with yellow type, as on the site; on ink it is the yellow itself
    const light = t.ink === INK;
    const back = solid ? (light ? INK : YELLOW) : t.paper, front = solid ? (light ? YELLOW : INK) : t.ink;
    links.push(`<g>${fadeIn(at.links + i * 0.12, 0.3)}${land(at.links + i * 0.12, 14, 0.5)}
  <rect x="${lx + 1.5}" y="466.5" width="${w}" height="45" rx="22.5" fill="${back}" stroke="${solid ? back : t.ink}" stroke-width="2.5"/>
  ${icon(ic, lx + 22, 479, 20, front)}<text x="${lx + 52}" y="494.5" ${MONO} font-size="15" font-weight="700" fill="${front}">${esc(text)}</text>
</g>`);
    lx += w + 14;
  });
  links.push(`<g>${fadeIn(at.links + 0.3, 0.3)}${icon('pin', lx + 12, 479.5, 19, t.muted)}<text x="${lx + 38}" y="494.5" ${MONO} font-size="15" fill="${t.muted}">${esc(PLACE)}</text></g>`);

  out.push(`<rect x="${CARD.x + CARD.drop}" y="${CARD.y + CARD.drop}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="${YELLOW}"/>`);
  out.push(`<rect ${inner} fill="${t.paper}"/>`);
  out.push(`<g clip-path="url(#card)">\n${scene}\n${typed.join('\n')}\n${name}\n${what}\n${tags.join('\n')}\n${links.join('\n')}\n</g>`);
  out.push(`<rect ${inner} fill="none" stroke="${t.ink}" stroke-width="3"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${esc(GREETING)} ${esc(NAME)}</title>
<desc id="desc">A hand-drawn character with curtain hair and round glasses waves from a yellow circle. I do ${esc(WHAT.join(', '))}. Skills: ${esc(SKILLS.flat().join(', '))}. ${esc(PLACE)}.</desc>
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
