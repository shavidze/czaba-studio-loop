// C round 221: MP3/WAV export smoke (copy of c-round-220/c220-export.cjs) (copied from c-round-218/c218-mp3.cjs, wav mode added). Real-mouse Playwright Chromium, fresh context, no credentials.
// usage: node c218-mp3.cjs <base> <mode: warm|real|cancel|both|range> <W> <H> <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const [BASE, MODE, W, H, OUT] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5]), process.argv[6]];
const KEY = `${MODE}-${W}x${H}-${new URL(BASE).port}`;
const OLD_NOTE = 'LAME (ffmpeg.wasm) — the encoder loads from a CDN on the first MP3 export (~31 MB)';
const NEW_NOTE = 'LAME (mediabunny) — 320 kbps CBR; the encoder loads with the first MP3 export';
const CANCEL_MSG = 'Export cancelled — no file was created. The MP3 encoder will load again on the next MP3 export.';
const KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const SR = [44100, 48000, 32000, 0];
const MODES = ['stereo', 'joint-stereo', 'dual-channel', 'mono'];

function parseMp3(buf) {
  const r = { bytes: buf.length, id3v2: 0, meta: null, audioFrames: 0, firstAudioHeader: null, hist: { version: {}, layer: {}, kbps: {}, sr: {}, mode: {}, padding: {}, crc: {} }, end: null, endReason: null, trailer: null };
  let p = 0;
  if (buf.toString('latin1', 0, 3) === 'ID3') { p = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]); r.id3v2 = p; }
  let first = true;
  const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
  while (true) {
    if (p === buf.length) { r.endReason = 'EOF'; break; }
    if (p + 4 > buf.length) { r.endReason = `partial(${buf.length - p} B)`; break; }
    if (buf.toString('latin1', p, p + 3) === 'TAG' && buf.length - p === 128) { r.trailer = 'ID3v1'; r.endReason = 'ID3v1'; break; }
    const h = buf.readUInt32BE(p);
    if ((h >>> 21) !== 0x7ff) { r.endReason = `nosync@${p}`; break; }
    const ver = (h >>> 19) & 3; const lay = (h >>> 17) & 3; const prot = (h >>> 16) & 1;
    const kb = KBPS[(h >>> 12) & 15]; const sr = SR[(h >>> 10) & 3]; const pad = (h >>> 9) & 1; const mode = (h >>> 6) & 3;
    if (ver !== 3 || lay !== 1 || !kb || !sr) { r.endReason = `badheader@${p}:${h.toString(16)}`; break; }
    const len = Math.floor((144000 * kb) / sr) + pad;
    const side = mode === 3 ? 17 : 32;
    const tag = buf.toString('latin1', p + 4 + side + (prot ? 0 : 2), p + 8 + side + (prot ? 0 : 2));
    const tagAlt = buf.toString('latin1', p + 4 + side, p + 8 + side);
    if (first && ['Xing', 'Info'].some((t) => t === tag || t === tagAlt)) {
      r.meta = { tag: tag === 'Xing' || tag === 'Info' ? tag : tagAlt, header: buf.slice(p, p + 4).toString('hex'), kbps: kb, sr, mode: MODES[mode], bytes: len, lameTag: buf.toString('latin1', p + 4 + side + 120, p + 4 + side + 129).replace(/[^\x20-\x7e]/g, '.') };
    } else {
      r.audioFrames += 1;
      if (!r.firstAudioHeader) r.firstAudioHeader = buf.slice(p, p + 4).toString('hex');
      inc(r.hist.version, 'MPEG-1'); inc(r.hist.layer, 'III'); inc(r.hist.kbps, kb); inc(r.hist.sr, sr); inc(r.hist.mode, MODES[mode]); inc(r.hist.padding, pad); inc(r.hist.crc, prot ? 'none' : 'crc');
    }
    first = false;
    p += len;
  }
  r.end = p;
  r.frameSeconds = +((r.audioFrames * 1152) / 48000).toFixed(4);
  const k = Object.keys(r.hist.kbps); const s = Object.keys(r.hist.sr);
  r.allAudio320 = k.length === 1 && k[0] === '320';
  r.all48k = s.length === 1 && s[0] === '48000';
  r.twoChannel = !r.hist.mode.mono;
  r.walkClean = r.endReason === 'EOF' || r.endReason === 'ID3v1';
  return r;
}

function parseWav(buf) {
  const h = { riff: buf.toString('latin1', 0, 4), fmt: buf.readUInt16LE(20), ch: buf.readUInt16LE(22), sr: buf.readUInt32LE(24), bits: buf.readUInt16LE(34), dataTag: buf.toString('latin1', 36, 40), dataSize: buf.readUInt32LE(40) };
  const frames = h.dataSize / (h.ch * 3);
  let ss = 0; let n = 0; let nz = 0;
  for (let i = 44; i + 2 < 44 + h.dataSize; i += 3) { let v = buf[i] | (buf[i + 1] << 8) | (buf[i + 2] << 16); if (v & 0x800000) v -= 0x1000000; const x = v / 8388608; ss += x * x; n += 1; if (v) nz += 1; }
  return { header: h, frames, seconds: frames / h.sr, rmsDbfs: +(10 * Math.log10(ss / n)).toFixed(2), nonZeroFraction: +(nz / n).toFixed(4) };
}

async function decodeInPage(page, buf) {
  return page.evaluate(async (b64) => {
    const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) u[i] = bin.charCodeAt(i);
    const ac = new OfflineAudioContext(2, 48000, 48000);
    const ab = await ac.decodeAudioData(u.buffer);
    let s = 0; let n = 0; let nz = 0; let peak = 0;
    for (let c = 0; c < ab.numberOfChannels; c += 1) { const d = ab.getChannelData(c); for (let i = 0; i < d.length; i += 1) { s += d[i] * d[i]; n += 1; if (d[i] !== 0) nz += 1; if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]); } }
    let lrDiff = 0; if (ab.numberOfChannels === 2) { const l = ab.getChannelData(0); const r = ab.getChannelData(1); for (let i = 0; i < l.length; i += 1) lrDiff += Math.abs(l[i] - r[i]); lrDiff /= l.length; }
    return { duration: ab.duration, channels: ab.numberOfChannels, sampleRate: ab.sampleRate, rmsDbfs: +(10 * Math.log10(s / n)).toFixed(2), nonZeroFraction: +(nz / n).toFixed(4), peak: +peak.toFixed(4), meanAbsLminusR: +lrDiff.toFixed(5) };
  }, buf.toString('base64'));
}

async function clickCenter(page, loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error('no box');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
  await page.mouse.down();
  await page.mouse.up();
}

const INIT = () => {
  window.__c218 = { log: [], longtasks: [] };
  const t = () => performance.now();
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__c218.longtasks.push({ start: +e.startTime.toFixed(1), dur: +e.duration.toFixed(1) }); }).observe({ type: 'longtask', buffered: true }); } catch {}
  const seen = new Map();
  const scan = () => {
    const els = [...document.querySelectorAll('[role=status],[data-testid=arrangement-export-progress-label]')];
    els.forEach((el, i) => { const k = `${el.getAttribute('data-testid') || 'status'}#${i}`; const v = (el.textContent || '').trim(); if (seen.get(k) !== v) { seen.set(k, v); window.__c218.log.push({ t: +t().toFixed(1), k, v: v.slice(0, 200), bad: /CDN|31 MB|ffmpeg|unpkg/i.test(document.body.innerText) }); } });
  };
  const start = () => { new MutationObserver(scan).observe(document.body, { subtree: true, childList: true, characterData: true }); scan(); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
};

async function main() {
  const R = { key: KEY, base: BASE, mode: MODE, started: new Date().toISOString(), pageErrors: [], consoleErrors: [], navigations: [], resp504: [], workerEvents: [], downloads: [] };
  const browser = await chromium.launch();
  R.chromium = browser.version();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const T0 = Date.now();
  const rel = () => Date.now() - T0;
  let clickAt = null; let doneAt = null;
  const requests = [];
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 160)); });
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) R.navigations.push({ t: rel(), url: f.url(), afterExportClick: clickAt !== null }); });
  page.on('response', (s) => { if (s.status() === 504) R.resp504.push({ t: rel(), url: s.url() }); });
  page.on('request', (q) => requests.push({ t: rel(), url: q.url(), type: q.resourceType() }));
  page.on('worker', (w) => { R.workerEvents.push({ t: rel(), ev: 'open', url: w.url().slice(0, 80) }); w.on('close', () => R.workerEvents.push({ t: rel(), ev: 'close', url: w.url().slice(0, 80) })); });
  page.on('download', (d) => R.downloads.push({ t: rel(), d }));

  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 120000 });
  R.loadScripts = requests.filter((q) => q.type === 'script').map((q) => q.url.replace(BASE, ''));
  R.loadHasEncoderChunk = R.loadScripts.some((u) => /mp3-encoder|mediabunny/i.test(u));
  R.demoBadge = await page.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required'));
  R.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  const nAdd = MODE === 'cancel3' ? 3 : 1;
  for (let i = 0; i < nAdd; i += 1) {
    await clickCenter(page, page.getByRole('button', { name: 'Add', exact: true }));
    await page.waitForFunction((n) => document.querySelectorAll('[data-clip-kind="audio"]').length >= n, i + 1, { timeout: 20000 });
    await page.waitForTimeout(300);
  }
  R.clips = await page.locator('[data-clip-kind="audio"]').evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), w: Math.round(b.width), y: Math.round(b.y), h: Math.round(b.height) }; }));

  if (MODE === 'range') {
    const body = page.locator('[data-clip-kind="audio"]').first().locator('.cursor-text').first();
    const b = await body.boundingBox();
    const y = b.y + b.height / 2;
    const x1 = b.x + 40; const x2 = b.x + 40 + Math.min(120, b.width / 6);
    await page.mouse.move(x1, y, { steps: 3 }); await page.mouse.down();
    await page.mouse.move((x1 + x2) / 2, y, { steps: 6 }); await page.mouse.move(x2, y, { steps: 6 }); await page.mouse.up();
    await page.waitForTimeout(400);
    R.rangeDrag = { x1, x2, y };
    await page.screenshot({ path: path.join(OUT, `${KEY}-range-made.png`) });
  }

  await clickCenter(page, page.getByRole('button', { name: 'Export', exact: true }).first());
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  const fmt = MODE === 'both' ? 'both' : MODE === 'wav' ? 'wav' : 'mp3';
  await clickCenter(page, page.getByTestId(`arrangement-export-format-${fmt}`));
  if (MODE === 'range') {
    await clickCenter(page, page.getByTestId('arrangement-export-scope-range'));
    R.rangeChecked = await page.getByTestId('arrangement-export-scope-range').isChecked();
    R.rangeLabel = await page.getByTestId('arrangement-export-scope-range').locator('xpath=..').innerText();
    const m = /\((\d+\.\d+) s\)/.exec(R.rangeLabel) || /(\d+\.\d+) s/.exec(R.rangeLabel);
    R.rangeL = m ? Number(m[1]) : null;
  }
  await page.waitForTimeout(300);
  R.dialogNote = await page.evaluate((note) => {
    const el = [...document.querySelectorAll('[role=dialog] *')].find((e) => e.children.length === 0 && e.textContent.trim() === note);
    if (!el) return { found: false, notes: [...document.querySelectorAll('[role=dialog] *')].filter((e) => e.children.length === 0 && /LAME/.test(e.textContent)).map((e) => e.textContent) };
    const measure = () => {
      const rg = document.createRange(); rg.selectNodeContents(el);
      const tops = [...new Set([...rg.getClientRects()].map((r) => Math.round(r.top)))];
      const b = el.getBoundingClientRect(); const p = el.parentElement;
      return { lines: tops.length, height: +b.height.toFixed(2), width: +b.width.toFixed(2), overflowX: el.scrollWidth > el.clientWidth + 0.5, overflowY: el.scrollHeight > el.clientHeight + 0.5, parentOverflow: p.scrollHeight > p.clientHeight + 0.5 || p.scrollWidth > p.clientWidth + 0.5, inViewport: b.right <= innerWidth && b.bottom <= innerHeight };
    };
    const now = measure();
    const old = el.textContent;
    el.textContent = 'LAME (ffmpeg.wasm) — the encoder loads from a CDN on the first MP3 export (~31 MB)';
    const was = measure();
    el.textContent = old;
    return { found: true, tag: el.tagName, text: el.textContent, restored: el.textContent === old, newText: now, oldText: was };
  }, NEW_NOTE);
  R.idleBodyBad = await page.evaluate(() => (document.body.innerText.match(/CDN|31 MB|ffmpeg|unpkg/gi) || []));
  await page.screenshot({ path: path.join(OUT, `${KEY}-dialog.png`) });

  const btnName = fmt === 'both' ? 'Export WAV + MP3' : fmt === 'wav' ? 'Export WAV' : 'Export MP3';
  const sampleWorkers = [];
  const poller = setInterval(() => { sampleWorkers.push({ t: rel(), urls: page.workers().map((w) => w.url().slice(0, 60)) }); }, 100);
  R.workersBefore = page.workers().map((w) => w.url().slice(0, 80));
  const perfClick = await page.evaluate(() => performance.now());
  clickAt = rel();
  await clickCenter(page, dlg.getByRole('button', { name: btnName, exact: true }));

  if (MODE === 'cancel' || MODE === 'cancel3') {
    try {
      await page.waitForFunction(() => /Creating MP3 · \d+%/.test(document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent || ''), undefined, { timeout: 60000, polling: 'raf' });
      R.labelAtCancel = await page.getByTestId('arrangement-export-progress-label').textContent();
      await clickCenter(page, page.getByTestId('arrangement-export-cancel'));
      R.cancelClickedAt = rel();
    } catch (e) { R.cancelMissed = String(e).slice(0, 200); }
    const prog1 = await page.evaluate(() => { const p = document.querySelector('[data-testid=arrangement-export-progress]'); return p ? { value: p.getAttribute('aria-valuenow') || p.getAttribute('value'), html: p.outerHTML.slice(0, 200) } : null; });
    await page.waitForTimeout(2000);
    R.blobWorkers2sAfterCancel = page.workers().filter((w) => w.url().startsWith('blob:')).length;
    R.workers2sAfterCancel = page.workers().map((w) => w.url().slice(0, 80));
    const prog2 = await page.evaluate(() => { const p = document.querySelector('[data-testid=arrangement-export-progress]'); return p ? { value: p.getAttribute('aria-valuenow') || p.getAttribute('value'), html: p.outerHTML.slice(0, 200) } : null; });
    R.progressAfterCancel = { at0: prog1, at2s: prog2 };
    await page.waitForTimeout(3000);
    R.dialogText = (await dlg.innerText()).slice(0, 1500);
    R.cancelMsgShown = R.dialogText.includes(CANCEL_MSG);
    R.failTextShown = /failed|error/i.test(R.dialogText);
    R.downloadsAfterCancel = R.downloads.length;
    await page.screenshot({ path: path.join(OUT, `${KEY}-cancelled.png`) });
    clearInterval(poller);
    R.blobWorkerSeenBeforeCancel = sampleWorkers.some((s) => s.t <= (R.cancelClickedAt || 1e12) && s.urls.some((u) => u.startsWith('blob:')));
    R.workerSamplesCancel = sampleWorkers.filter((s, i, a) => i === 0 || JSON.stringify(s.urls) !== JSON.stringify(a[i - 1].urls));
    sampleWorkers.length = 0;
    // second export to completion
    const p2 = setInterval(() => { sampleWorkers.push({ t: rel(), urls: page.workers().map((w) => w.url().slice(0, 60)) }); }, 100);
    const before2 = R.downloads.length;
    await clickCenter(page, dlg.getByRole('button', { name: 'Export MP3', exact: true }));
    await dlg.getByText(/^MP3 created:/).waitFor({ timeout: 120000 });
    clearInterval(p2);
    R.second = { created: await dlg.getByText(/^MP3 created:/).textContent() };
    await page.waitForTimeout(1500);
    const d = R.downloads.slice(before2);
    R.second.files = d.map((x) => x.d.suggestedFilename());
    if (d[0]) { const f = path.join(OUT, `${KEY}-second.mp3`); await d[0].d.saveAs(f); const buf = fs.readFileSync(f); R.second.mp3 = parseMp3(buf); R.second.decoded = await decodeInPage(page, buf); fs.unlinkSync(f); }
    await page.waitForTimeout(2000);
    R.second.blobWorkers2sAfter = page.workers().filter((w) => w.url().startsWith('blob:')).length;
    R.second.blobWorkerSeen = sampleWorkers.some((s) => s.urls.some((u) => u.startsWith('blob:')));
    R.second.workersAfter = page.workers().map((w) => w.url().slice(0, 80));
    await page.screenshot({ path: path.join(OUT, `${KEY}-second-created.png`) });
  } else {
    const doneRe = fmt === 'both' ? /^WAV and MP3 created:/ : fmt === 'wav' ? /^WAV created:/ : /^MP3 created:/;
    await dlg.getByText(doneRe).waitFor({ timeout: 180000 });
    doneAt = rel();
    R.created = await dlg.getByText(doneRe).textContent();
    await page.waitForTimeout(2500);
    clearInterval(poller);
    R.exportMs = doneAt - clickAt;
    R.blobWorkerSeen = sampleWorkers.some((s) => s.urls.some((u) => u.startsWith('blob:')));
    R.workerSamples = sampleWorkers.filter((s, i, a) => i === 0 || JSON.stringify(s.urls) !== JSON.stringify(a[i - 1].urls));
    R.blobWorkers2sAfter = page.workers().filter((w) => w.url().startsWith('blob:')).length;
    R.workersAfter = page.workers().map((w) => w.url().slice(0, 80));
    await page.screenshot({ path: path.join(OUT, `${KEY}-created.png`) });
    R.files = [];
    for (const x of R.downloads) {
      const name = x.d.suggestedFilename();
      const f = path.join(OUT, `${KEY}-${name}`);
      await x.d.saveAs(f);
      const buf = fs.readFileSync(f);
      const e = { name, t: x.t, bytes: buf.length };
      if (name.endsWith('.mp3')) { e.mp3 = parseMp3(buf); e.decoded = await decodeInPage(page, buf); }
      if (name.endsWith('.wav')) e.wav = parseWav(buf);
      R.files.push(e);
      fs.unlinkSync(f);
    }
    const m = /(\d+):(\d+\.\d+)/.exec(R.created || '');
    R.createdSeconds = m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }
  const origin = new URL(BASE).origin;
  const win = requests.filter((q) => q.t >= clickAt && (doneAt === null || q.t <= doneAt + 2500));
  R.requestsExport = win.map((q) => `${q.type} ${q.url.replace(origin, '').slice(0, 120)}`);
  R.offOrigin = win.filter((q) => !q.url.startsWith(origin) && !q.url.startsWith('blob:') && !q.url.startsWith('data:')).map((q) => q.url);
  R.unpkgOrFfmpeg = win.filter((q) => /unpkg|ffmpeg/i.test(q.url)).map((q) => q.url);
  const st = await page.evaluate(() => window.__c218);
  R.statusLog = st.log.filter((e) => e.t >= perfClick - 5).map((e) => ({ t: +(e.t - perfClick).toFixed(0), k: e.k, v: e.v, bad: e.bad }));
  R.longTasksAfterClick = st.longtasks.filter((e) => e.start >= perfClick).map((e) => ({ start: +(e.start - perfClick).toFixed(0), dur: e.dur }));
  R.badTextDuringExport = R.statusLog.filter((e) => e.bad).length;
  R.navAfterClick = R.navigations.filter((n) => n.afterExportClick).length;
  delete R.downloads;
  await ctx.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/c-browse.json' });
  await browser.close();
  fs.writeFileSync(path.join(OUT, `${KEY}.json`), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, (k, v) => (k === 'requestsExport' || k === 'workerSamples' || k === 'loadScripts' ? undefined : v), 1).slice(0, 9000));
}
main().catch((e) => { console.error('FATAL', e); process.exit(1); });
