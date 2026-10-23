const X = require('./lib93.cjs'); const { sleep, blur } = X;
const READY = 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).';
const fmtT = (t) => { const ms = Math.round(t * 1000); const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), r = ms % 1000; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(r).padStart(3, '0')}`; };
const lenR = (a, b) => `მონაკვეთი ${fmtT(a)} — ${fmtT(b)} (${(b - a).toFixed(3)} წმ)`;
const wavMsg = (l) => `WAV შეიქმნა: ${l}, 24-bit · 48 kHz · stereo.`; const mp3Msg = (l) => `MP3 შეიქმნა: ${l}, 48 kHz · stereo.`; const bothMsg = (l) => `WAV და MP3 შეიქმნა: ${l}, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.`;
const status = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null);
async function waitStatus(p, pred, ms = 90000) { const t0 = Date.now(); let s; while (Date.now() - t0 < ms) { s = await status(p); if (pred(s)) return s; await sleep(100); } return s; }
let PPS = 40, RL = 512;
async function geo(p) { const g = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent })); RL = g.rl; PPS = +/([\d.]+)/.exec(g.z)[1]; return g; }
const tx = (t) => Math.round(RL + t * PPS);
const clipBox = (p, lane) => p.evaluate((lane) => { const e = document.querySelector(`[data-track-id="${lane}"] [data-clip-id]`); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, lane);
async function rangeDrag(p, lane, t0, t1) { await geo(p); const c = await clipBox(p, lane); const y = Math.round(c.y + c.h * 0.65); const x0 = tx(t0), x1 = tx(t1);
  await p.mouse.move(x0, y, { steps: 2 }); await sleep(80); await p.mouse.down(); await p.mouse.move(Math.round((x0 + x1) / 2), y, { steps: 6 }); await p.mouse.move(x1, y, { steps: 6 }); await sleep(150); await p.mouse.up(); await sleep(400);
  return p.evaluate(() => document.querySelector('[data-testid=arrangement-range]')?.textContent ?? null); }
const dlg = (p) => p.evaluate(() => { const q = (s) => document.querySelector(`[data-testid=${s}]`); const r = (e) => e && { checked: e.checked, disabled: e.disabled, label: e.closest('label').textContent.replace(/\s+/g, ' ').trim() }; return { project: r(q('arrangement-export-scope-project')), range: r(q('arrangement-export-scope-range')) }; });
async function closeDlg(p) { await p.keyboard.press('Escape'); await sleep(500); }
module.exports = { ...X, READY, fmtT, lenR, wavMsg, mp3Msg, bothMsg, status, waitStatus, geo, rangeDrag, dlg, closeDlg };
