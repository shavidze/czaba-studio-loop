// C round 103: WD-STALL, WD-CANCEL, WD-ERRTEXT, WD-MP3, WD-SLOW, EXPORT-REG, CANCEL-REG (+PX-NET, REG-HYD per session)
// Usage: node run103.cjs <scenario>
// Real Chromium, fresh incognito context per scenario, no credentials. Only the WAV worker's answer is stubbed (stall/error);
// the app's timer, terminate, reject, state and UI paths run for real.
const L = require('./lib103.cjs');
const { sleep } = L;
const fs = require('fs');
const scenario = process.argv[2];
const VPS = { 1280: { width: 1280, height: 720 }, 1440: { width: 1440, height: 900 } };
const STALL_ALERT = 'ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა შეჩერდა — worker 30 წამი არ პასუხობს.';
const ERR_ALERT = 'ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა ვერ მოხერხდა (worker). C-stub boom';

const CFG = {
  'stall1280': { vp: 1280, mode: 'stall', fmt: 'wav' },
  'stall1440': { vp: 1440, mode: 'stall', fmt: 'wav' },
  'cancel1280': { vp: 1280, mode: 'stall', fmt: 'wav' },
  'err1280': { vp: 1280, mode: 'error', fmt: 'wav' },
  'mp3stall1280': { vp: 1280, mode: 'stall', fmt: 'mp3' },
  'slow1280': { vp: 1280, mode: 'record', fmt: 'wav', cpu: 6 },
  'wav1280': { vp: 1280, mode: 'record', fmt: 'wav' },
  'wav1440': { vp: 1440, mode: 'record', fmt: 'wav' },
  'mp31280': { vp: 1280, mode: 'record', fmt: 'mp3' },
  'cancelreg1280': { vp: 1280, mode: 'record', fmt: 'wav' },
}[scenario];
if (!CFG) { console.error('unknown scenario'); process.exit(2); }

function wrapper(mode) {
  const Orig = window.Worker;
  window.__wd = { ctor: [], post: [], msgs: [], term: 0, alertAt: null, alertText: null, statusTl: [] };
  window.Worker = class extends Orig {
    constructor(url, opts) {
      const isWav = String(url).includes('export-wav.worker');
      if (isWav && mode !== 'record') {
        const body = mode === 'stall' ? 'self.onmessage = () => {};' : "self.onmessage = () => self.postMessage({ type: 'error', message: 'C-stub boom' });";
        super(URL.createObjectURL(new Blob([body], { type: 'text/javascript' })), { type: 'module' });
      } else super(url, opts);
      this.__wav = isWav;
      if (isWav) {
        window.__wd.ctor.push(performance.now());
        this.addEventListener('message', (e) => window.__wd.msgs.push({ t: performance.now(), type: e.data && e.data.type, f: e.data && e.data.fraction }));
      }
    }
    postMessage(...a) { if (this.__wav) window.__wd.post.push(performance.now()); return super.postMessage(...a); }
    terminate() { if (this.__wav) window.__wd.term++; return super.terminate(); }
  };
  const watch = () => {
    const f = document.querySelector('[data-testid=arrangement-export-footer]');
    if (!f) return;
    const al = f.closest('[role=dialog]')?.querySelector('[role=alert]');
    const s = f.querySelector('[role=status]');
    const rec = { t: performance.now(), alert: al ? al.textContent : null, status: s ? s.textContent : null, label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null };
    const last = window.__wd.statusTl.at(-1);
    if (!last || last.alert !== rec.alert || last.status !== rec.status || last.label !== rec.label) window.__wd.statusTl.push(rec);
    if (al && window.__wd.alertAt === null) { window.__wd.alertAt = rec.t; window.__wd.alertText = rec.alert; }
  };
  new MutationObserver(watch).observe(document, { childList: true, subtree: true, characterData: true });
}

async function ready(p) {
  await p.goto(L.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  await sleep(1500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
  await o.waitFor({ timeout: 90000 }); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const c0 = await p.$$eval('[data-clip-id]', (e) => e.length);
  await o.focus(); await p.keyboard.press('Enter'); await sleep(900);
  const c1 = await p.$$eval('[data-clip-id]', (e) => e.length);
  await L.blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title'); await sleep(500);
  await L.installClickProbe(p);
  return { before: c0, after: c1 };
}
const wd = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__wd)));
const gaps = (w) => { const ts = [w.post[0] ?? w.ctor[0], ...w.msgs.map((m) => m.t)]; let max = 0, at = null; for (let i = 1; i < ts.length; i++) { const g = ts[i] - ts[i - 1]; if (g > max) { max = g; at = i; } } return { maxGapMs: Math.round(max), atIndex: at, n: w.msgs.length }; };

(async () => {
  const b = await L.launch();
  const { ctx, page: p, S } = await L.newCtx(b, VPS[CFG.vp], `r103-${scenario}`);
  await ctx.addInitScript(wrapper, CFG.mode);
  const R = { scenario, cfg: CFG, started: new Date().toISOString() };
  const save = () => { R.session = { errors: S.errors, noise: S.noise, downloads: S.downloads, unpkg: S.unpkg, forbidden: S.forbidden, authHeaders: S.authHeaders, workers: S.workers, thirdParty: [...new Set(S.thirdParty)] }; L.save(`run103-${scenario}.json`, R); };
  R.clips = await ready(p);
  if (CFG.fmt === 'mp3') await L.selectFormat(p, 'mp3');
  if (CFG.cpu) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CFG.cpu }); R.cpuRate = CFG.cpu; }
  const shot = (n) => p.screenshot({ path: `${L.SHOTS}/r103-${scenario}-${n}.png` });

  if (scenario.startsWith('stall') || scenario === 'err1280' || scenario === 'mp3stall1280') {
    const un0 = S.unpkg.length; const eb = await L.exportBtnBox(p); R.exportText = eb.text;
    const clickWall = Date.now(); await p.mouse.click(eb.x, eb.y);
    const wait = CFG.mode === 'stall' ? 40000 : 6000;
    const t0 = Date.now(); R.pre = [];
    while (Date.now() - t0 < wait) {
      const w = await wd(p); const pr = await L.probe(p);
      if (w.ctor.length && R.pre.length < 200 && (!R.pre.length || R.pre.at(-1).label !== pr.label || R.pre.at(-1).alert !== pr.alert)) R.pre.push({ sinceCtor: Math.round((await p.evaluate(() => performance.now())) - w.ctor[0]), label: pr.label, status: pr.status, alert: pr.alert, cancel: pr.cancel, bar: pr.hasProgress });
      if (CFG.mode === 'stall' && w.ctor.length && !R.at25) { const now = await p.evaluate(() => performance.now()); if (now - w.ctor[0] > 25000) { R.at25 = { sinceCtor: Math.round(now - w.ctor[0]), ...pr, term: w.term }; await shot('at25s'); } }
      if (w.alertAt && Date.now() - t0 > (CFG.mode === 'stall' ? 36000 : 3000)) break;
      await sleep(200);
    }
    const w = await wd(p);
    R.wd = { ctorCount: w.ctor.length, postCount: w.post.length, msgs: w.msgs, term: w.term, alertText: w.alertText };
    R.alertDelayFromCtorMs = w.alertAt && w.ctor[0] ? +(w.alertAt - w.ctor[0]).toFixed(1) : null;
    R.alertDelayFromPostMs = w.alertAt && w.post[0] ? +(w.alertAt - w.post[0]).toFixed(1) : null;
    R.statusTl = w.statusTl.map((x) => ({ ...x, t: Math.round(x.t - (w.ctor[0] || 0)) }));
    R.final = await L.probe(p);
    R.expectedAlert = CFG.mode === 'stall' ? STALL_ALERT : ERR_ALERT;
    R.alertExact = R.final.alert === R.expectedAlert;
    R.unpkgDuring = S.unpkg.slice(un0).map((x) => ({ f: x.f, msAfterClick: x.t - clickWall }));
    R.labelsSeen = [...new Set(R.statusTl.map((x) => x.label))];
    R.loadLabelSeen = R.labelsSeen.includes('MP3 encoder-ის ჩატვირთვა…');
    await shot('final');
    // watch 6 s more for terminate/alert changes
    await sleep(6000); const w2 = await wd(p); R.after6s = { term: w2.term, alert: (await L.probe(p)).alert };
  } else if (scenario === 'cancel1280') {
    const eb = await L.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
    let w; const t0 = Date.now(); while (Date.now() - t0 < 30000) { w = await wd(p); if (w.ctor.length) break; await sleep(50); }
    while (true) { const now = await p.evaluate(() => performance.now()); if (now - w.ctor[0] >= 5000) break; await sleep(50); }
    R.beforeCancel = await L.probe(p);
    const cb = await p.evaluate(() => { const c = document.querySelector('[data-testid=arrangement-export-cancel]'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    R.cancelBox = cb;
    const cancelPerf = await p.evaluate(() => performance.now());
    await p.mouse.click(cb.x, cb.y); await sleep(500);
    R.afterCancel = await L.probe(p); R.termAfterCancel = (await wd(p)).term;
    R.cancelSinceCtorMs = Math.round(cancelPerf - w.ctor[0]);
    R.samples = [];
    const c0 = Date.now(); while (Date.now() - c0 < 35000) { const pr = await L.probe(p); const ww = await wd(p); R.samples.push({ s: Math.round((Date.now() - c0) / 1000), alert: pr.alert, status: pr.status, term: ww.term }); await sleep(1000); }
    const wf = await wd(p);
    R.termAt35s = wf.term; R.alertEver = wf.alertAt !== null; R.alertTextEver = wf.alertText; R.statusTl = wf.statusTl.map((x) => ({ ...x, t: Math.round(x.t - (w.ctor[0] || 0)) }));
    R.final = await L.probe(p); R.clickProbe = await p.evaluate(() => window.__c90.clicks);
    R.alertCountsInSamples = R.samples.filter((x) => x.alert).length;
    await shot('final');
  } else if (scenario === 'cancelreg1280') {
    R.wavCancel = await L.exportAndCancel(p, 'render', { maxPct: 90 });
    await shot('wav-cancel');
    await L.selectFormat(p, 'mp3');
    R.mp3Cancel = await L.exportAndCancel(p, 'mp3', { maxPct: 90 });
    await shot('mp3-cancel');
    R.wd = await wd(p); R.wd.statusTl = undefined;
  } else {
    const eb = await L.exportBtnBox(p); R.exportText = eb.text;
    R.exp = await L.exportFull(p, { timeout: 600000 });
    const w = await wd(p);
    R.wd = { ctorCount: w.ctor.length, postCount: w.post.length, msgCount: w.msgs.length, term: w.term, types: [...new Set(w.msgs.map((m) => m.type))] };
    R.ctorToPostMs = w.post[0] ? Math.round(w.post[0] - w.ctor[0]) : null;
    R.postToFirstProgressMs = w.msgs[0] ? Math.round(w.msgs[0].t - (w.post[0] ?? w.ctor[0])) : null;
    R.ctorToFirstProgressMs = w.msgs[0] ? Math.round(w.msgs[0].t - w.ctor[0]) : null;
    R.wavPhaseMs = w.msgs.length ? Math.round(w.msgs.at(-1).t - w.ctor[0]) : null;
    R.gaps = gaps(w);
    R.phases = [...new Set(w.statusTl.map((x) => L.phaseOf(x.label)).filter(Boolean))];
    R.labels = w.statusTl.map((x) => x.label).filter(Boolean);
    R.labelsHead = R.labels.slice(0, 3); R.labelsTail = R.labels.slice(-3); R.labels = undefined;
    R.files = R.exp.files.map((f) => {
      const o = { name: f.name, size: f.size };
      if (/\.wav$/.test(f.name)) o.wav = L.wavInfo(f.file);
      return o;
    });
    const mp3 = R.exp.files.find((f) => /\.mp3$/.test(f.name));
    if (mp3) R.mp3Decode = await L.mp3Decode(p, mp3.file);
    for (const f of R.exp.files) { try { if (f.size > 2e6) fs.unlinkSync(f.file); } catch {} }
    await shot('final');
  }
  save(); console.log(JSON.stringify(R, (k, v) => (k === 'statusTl' || k === 'msgs' || k === 'samples' || k === 'pre') && Array.isArray(v) ? `[${v.length}]` : v, 1).slice(0, 6000));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
