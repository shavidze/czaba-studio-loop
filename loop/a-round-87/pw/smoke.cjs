const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-87/pw/';
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let PPS = 40, RL = 512;
const blur = (p) => p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
const st = (p) => p.evaluate(() => ({ snap: document.querySelector('[data-testid=arrangement-grid-control]')?.dataset.snap }));
async function geo(p) { const g = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent })); RL = g.rl; PPS = +/([\d.]+)/.exec(g.z)[1]; }
const tx = (t) => Math.round(RL + t * PPS);
const laneBox = (p, t) => p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const b = l.querySelector('[data-grid-seconds]') || l; const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, t);
async function setSnapOff(p) { await blur(p); if ((await st(p)).snap === 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); } await blur(p); }
async function libDrop(p, src, lane, t) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox(); const lb = await laneBox(p, lane);
  const ox = Math.round(ob.x + ob.width / 2), oy = Math.round(ob.y + ob.height / 2);
  await p.mouse.move(ox, oy); await p.mouse.down(); await p.mouse.move(ox + 12, oy, { steps: 3 });
  await p.mouse.move(tx(t), Math.round(lb.y + lb.h / 2), { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
async function decline(p) { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); }); await sleep(200); }
async function fiveMinuteProject(p) {
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(4000);
  await decline(p); await geo(p); await setSnapOff(p);
  await libDrop(p, 'demo-middle-east', 'music', 0.35); await libDrop(p, 'demo-stem-pulse', 'stems', 2); await libDrop(p, 'demo-soft-impact', 'sfx', 4); await blur(p);
  const el = await p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { lane: e.closest('[data-track-id]').getAttribute('data-track-id'), x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const music = el.find((c) => c.lane === 'music');
  await p.mouse.click(Math.round(music.x + Math.min(music.w / 2, 20)), Math.round(music.y + music.h - 8)); await sleep(150);
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Control+d'); await sleep(600); }
  await blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(400);
  return p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-project]').closest('label').innerText);
}
async function instrument(p) {
  await p.evaluate(() => {
    window.__g = []; let l = performance.now(); window.__r = true;
    const t0 = performance.now(); window.__big = [];
    const t = () => { const n = performance.now(); window.__g.push(n - l); if (n - l > 80) window.__big.push({ at: Math.round(l - t0), gap: Math.round(n - l) }); l = n; if (window.__r) requestAnimationFrame(t); }; requestAnimationFrame(t);
    window.__prog = [];
    const dlg = document.querySelector('#arrangement-export-title').closest('[role=dialog]');
    const snap = () => { const bar = dlg.querySelector('[data-testid=arrangement-export-progress]'); const lab = dlg.querySelector('[data-testid=arrangement-export-progress-label]');
      const st = [...dlg.querySelectorAll('[role=status],[role=alert]')].map((e) => e.textContent).join(' | ');
      const rec = { t: Math.round(performance.now() - t0), label: lab ? lab.textContent : null, hasValue: bar ? bar.hasAttribute('value') : null, value: bar && bar.hasAttribute('value') ? bar.getAttribute('value') : null, status: st, focusIsProgress: document.activeElement === bar };
      const last = window.__prog.at(-1); if (!last || last.label !== rec.label || last.value !== rec.value || last.hasValue !== rec.hasValue || last.status !== rec.status) window.__prog.push(rec); };
    window.__mo = new MutationObserver(snap); window.__mo.observe(dlg, { attributes: true, childList: true, characterData: true, subtree: true }); snap();
  });
}
async function collect(p) { return p.evaluate(() => { window.__r = false; window.__mo.disconnect(); const g = window.__g.slice(); const mono = {}; const prev = {}; for (const r of window.__prog) { if (!r.label || r.value === null) continue; const k = r.label.replace(/ · \d+%$/, ''); const v = +r.value; mono[k] ||= { records: 0, decreases: [] }; mono[k].records += 1; if (k in prev && v < prev[k]) mono[k].decreases.push([prev[k], v]); prev[k] = v; }
    return { mono, big: window.__big, maxGap: Math.round(Math.max(...g)), top5: g.slice().sort((a, b) => b - a).slice(0, 5).map(Math.round), prog: window.__prog }; }); }
function summarize(prog) {
  const labels = []; for (const r of prog) { const k = r.label && r.label.replace(/ · \d+%$/, ''); if (k && labels.at(-1) !== k) labels.push(k); }
  const per = {}; for (const r of prog) { if (!r.label) continue; const k = r.label.replace(/ · \d+%$/, ''); (per[k] ||= new Set()).add(r.value === null ? 'NOVALUE' : r.value); }
  const pctOk = prog.every((r) => !r.label || !/\d+%$/.test(r.label) || +/(\d+)%$/.exec(r.label)[1] === Math.floor(+r.value * 100));
  const statuses = []; for (const r of prog) if (r.status && statuses.at(-1) !== r.status) statuses.push(r.status);
  return { phaseOrder: labels, distinctValues: Object.fromEntries(Object.entries(per).map(([k, v]) => [k, [...v].length])), pctMatchesValue: pctOk, statusSequence: statuses, progressFocused: prog.some((r) => r.focusIsProgress), finalLabel: prog.at(-1)?.label ?? null };
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const warm = await browser.newContext(); const wp = await warm.newPage(); await wp.goto(URL, { waitUntil: 'networkidle' }); await sleep(2000); await warm.close();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const r = { errors: [], workers: [], unpkg: [], forbidden: [], auth: 0 };
  let phase = 'load';
  page.on('worker', (w) => r.workers.push({ url: w.url(), during: phase, t: Date.now() }));
  page.on('request', (q) => { const u = q.url(); if (/unpkg\.com/.test(u)) r.unpkg.push({ url: u, during: phase }); if (/export-wav\.worker/.test(u)) r.workers.push({ request: u, during: phase }); if (/\/api\/studio-token|r2\.|\/api\/download/.test(u)) r.forbidden.push(u); if (q.headers().authorization) r.auth += 1; });
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed/.test(t)) r.errors.push(`[${m.type()}] ${t.slice(0, 200)}`); });
  page.on('pageerror', (e) => r.errors.push('pageerror ' + String(e).slice(0, 200)));
  r.label = await fiveMinuteProject(page);
  await page.screenshot({ path: OUT + 'a-r87-dialog-1440.png' });
  // WAV
  await instrument(page); phase = 'wav';
  let t0 = Date.now();
  const [dw] = await Promise.all([page.waitForEvent('download', { timeout: 240000 }), page.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click()]);
  r.wavMs = Date.now() - t0; await sleep(800);
  const wv = await collect(page); r.wav = { mono: wv.mono, big: wv.big, maxGap: wv.maxGap, top5: wv.top5, ...summarize(wv.prog), file: dw.suggestedFilename() };
  const wp2 = await dw.path(); const wsize = fs.statSync(wp2).size; r.wav.bytes = wsize; r.wav.frames = (wsize - 44) / 6;
  const wb = fs.readFileSync(wp2); r.wav.header = { riff: wb.toString('latin1', 0, 4), ch: wb.readUInt16LE(22), sr: wb.readUInt32LE(24), bits: wb.readUInt16LE(34) };
  r.wav.sha256 = require('crypto').createHash('sha256').update(wb).digest('hex'); await dw.delete();
  r.wav.progRaw = wv.prog.slice(0, 80);
  // MP3 (first encoder load in this page)
  await page.getByTestId('arrangement-export-format-mp3').check(); await sleep(200);
  await instrument(page); phase = 'mp3';
  t0 = Date.now();
  const [dm] = await Promise.all([page.waitForEvent('download', { timeout: 300000 }), page.getByRole('button', { name: 'MP3-ის ექსპორტი' }).click()]);
  r.mp3Ms = Date.now() - t0; await sleep(800);
  const mv = await collect(page); r.mp3 = { mono: mv.mono, big: mv.big, maxGap: mv.maxGap, top5: mv.top5, ...summarize(mv.prog), file: dm.suggestedFilename() };
  const mp = await dm.path(); r.mp3.bytes = fs.statSync(mp).size;
  r.mp3.decoded = await page.evaluate(async (b64) => { const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); const ctx = new OfflineAudioContext(2, 48000, 48000); const ab = await ctx.decodeAudioData(bytes.buffer); return { duration: ab.duration, channels: ab.numberOfChannels, sampleRate: ab.sampleRate }; }, fs.readFileSync(mp).toString('base64'));
  await dm.delete();
  r.mp3.progRaw = mv.prog.slice(0, 80);
  phase = 'mp3-reuse'; t0 = Date.now();
  const [dm2] = await Promise.all([page.waitForEvent('download', { timeout: 300000 }), page.getByRole('button', { name: 'MP3-ის ექსპორტი' }).click()]);
  r.mp3ReuseMs = Date.now() - t0; r.mp3ReuseFile = dm2.suggestedFilename(); r.mp3ReuseBytes = fs.statSync(await dm2.path()).size; await dm2.delete(); await sleep(500);
  r.wasmRequests = r.unpkg.filter((u) => /\.wasm/.test(u.url)).length;
  r.finalStatus = await page.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert]')].map((e) => e.textContent).join(' | '));
  await context.storageState({ path: STATE });
  fs.writeFileSync(OUT + (process.argv[2] || 'smoke-output.json'), JSON.stringify(r, null, 2));
  const brief = { ...r, wav: { ...r.wav, progRaw: undefined }, mp3: { ...r.mp3, progRaw: undefined } };
  console.log(JSON.stringify(brief, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
