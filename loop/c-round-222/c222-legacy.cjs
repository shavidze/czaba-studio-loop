// C round 222: legacy ExportDialog stem selection (HR-LEGACY-STUBBED). Own script; technique from c221-legacy.cjs.
// usage: node c222-legacy.cjs <mode main|persist|warmup> <W> <H> <outDir>
// Stem -> Hz is fixed by the R2 file name (FREQ_BY_FILE), never by request order.
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [MODE, W, H, OUT] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const KEY = `${MODE}-${W}x${H}`;
const BASE = 'http://127.0.0.1:5173';
const KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const SRS = [44100, 48000, 32000, 0];
const FREQ_BY_FILE = {
  'Bass Drum.wav': 230, 'Bass.wav': 290, 'Didgeridoo.wav': 350, 'Dombra Aux Left.wav': 410, 'Dombra Aux Right.wav': 470,
  'Dombra Rithm.wav': 530, 'Duduk.wav': 590, 'East Zurna.wav': 650, 'Electric Guitar.wav': 710, 'Electric Guitar 2.wav': 770,
};
function sine(seconds, freq) {
  const sr = 48000; const n = sr * seconds; const data = n * 4; const b = Buffer.alloc(44 + data);
  b.write('RIFF', 0); b.writeUInt32LE(36 + data, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(data, 40);
  for (let i = 0; i < n; i += 1) { const v = Math.round(2500 * Math.sin((2 * Math.PI * freq * i) / sr)); b.writeInt16LE(v, 44 + i * 4); b.writeInt16LE(v, 46 + i * 4); }
  return b;
}
function parseWav(buf) {
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WAVE') return { error: 'not RIFF/WAVE' };
  let p = 12; const r = {};
  while (p + 8 <= buf.length) {
    const id = buf.toString('latin1', p, p + 4); const sz = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { r.format = buf.readUInt16LE(p + 8); r.channels = buf.readUInt16LE(p + 10); r.sampleRate = buf.readUInt32LE(p + 12); r.bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { r.dataOffset = p + 8; r.dataBytes = sz; break; }
    p += 8 + sz + (sz & 1);
  }
  const bps = r.bits / 8; r.frames = r.dataBytes / (bps * r.channels); r.duration = r.frames / r.sampleRate;
  r.dataEndsAtEOF = r.dataOffset + r.dataBytes === buf.length;
  const L = new Float64Array(r.frames);
  for (let i = 0; i < r.frames; i += 1) {
    const o = r.dataOffset + i * bps * r.channels; let v;
    if (r.format === 3) v = buf.readFloatLE(o); else if (r.bits === 16) v = buf.readInt16LE(o) / 32768; else if (r.bits === 24) v = buf.readIntLE(o, 3) / 8388608; else v = buf.readInt32LE(o) / 2147483648;
    L[i] = v;
  }
  r.left = L; return r;
}
function goertzelDb(x, sr, f, from, len) {
  const w = (2 * Math.PI * f) / sr; const c = 2 * Math.cos(w); let s1 = 0; let s2 = 0;
  for (let i = from; i < from + len; i += 1) { const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * (i - from)) / (len - 1)); const s = x[i] * hann + c * s1 - s2; s2 = s1; s1 = s; }
  const p = s1 * s1 + s2 * s2 - c * s1 * s2; return 10 * Math.log10(Math.max(p, 1e-30) / ((len / 4) ** 2));
}
function spectrum(w) {
  const len = Math.min(w.frames - Math.floor(0.5 * w.sampleRate), 2 * w.sampleRate); const from = Math.floor(0.5 * w.sampleRate);
  const out = {}; for (const [f, hz] of Object.entries(FREQ_BY_FILE)) out[f.replace(/\.wav$/, '')] = { hz, db: +goertzelDb(w.left, w.sampleRate, hz, from, len).toFixed(2) };
  let s = 0; for (let i = 0; i < w.frames; i += 1) s += w.left[i] * w.left[i]; out._rmsDbfsLeft = +(10 * Math.log10(s / w.frames)).toFixed(2);
  return out;
}
function parseMp3(buf) {
  const r = { bytes: buf.length, xing: null, audioFrames: 0, kbps: {}, endReason: null }; let p = 0;
  if (buf.toString('latin1', 0, 3) === 'ID3') p = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  let first = true;
  for (;;) {
    if (p === buf.length) { r.endReason = 'EOF'; break; }
    if (p + 4 > buf.length) { r.endReason = `partial(${buf.length - p})`; break; }
    const h = buf.readUInt32BE(p); if ((h >>> 21) !== 0x7ff) { r.endReason = `nosync@${p}`; break; }
    const prot = (h >>> 16) & 1; const kb = KBPS[(h >>> 12) & 15]; const sr = SRS[(h >>> 10) & 3]; const pad = (h >>> 9) & 1; const mode = (h >>> 6) & 3;
    if (!kb || !sr) { r.endReason = `badheader@${p}`; break; }
    const len = Math.floor((144000 * kb) / sr) + pad; const side = mode === 3 ? 17 : 32;
    const tags = [buf.toString('latin1', p + 4 + side + (prot ? 0 : 2), p + 8 + side + (prot ? 0 : 2)), buf.toString('latin1', p + 4 + side, p + 8 + side)];
    if (first && tags.some((t) => t === 'Xing' || t === 'Info')) r.xing = tags.find((t) => t === 'Xing' || t === 'Info');
    else { r.audioFrames += 1; r.kbps[kb] = (r.kbps[kb] || 0) + 1; }
    first = false; p += len;
  }
  return r;
}
async function clickCenter(page, loc) {
  await loc.scrollIntoViewIfNeeded(); const b = await loc.boundingBox(); if (!b) throw new Error('no box');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await page.mouse.down(); await page.mouse.up();
}
(async () => {
  const R = { key: KEY, mode: MODE, started: new Date().toISOString(), pageErrors: [], stubLog: [], steps: {} };
  const browser = await chromium.launch(); R.chromium = browser.version();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
  await ctx.addInitScript(() => { localStorage.setItem('auth_user', JSON.stringify({ accessToken: 'c222-fake-access', refreshToken: 'c222-fake-refresh', email: 'c222@example.invalid' })); });
  const cors = (req) => ({ 'Access-Control-Allow-Origin': req.headers().origin || '*', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Id', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS' });
  const json = (req, status, body) => ({ status, headers: { ...cors(req), 'content-type': 'application/json' }, body: JSON.stringify(body) });
  await ctx.route(/^https?:\/\/(localhost|127\.0\.0\.1):5199\//, (route) => {
    const req = route.request(); const u = new URL(req.url()); R.stubLog.push(`${req.method()} ${u.pathname}`);
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(req) });
    if (u.pathname === '/api/auth/profile') return route.fulfill(json(req, 200, { success: true, data: { id: 1, email: 'c222@example.invalid', emailVerified: true, createdAt: '2026-01-01T00:00:00Z' } }));
    if (u.pathname === '/api/downloads') return route.fulfill(json(req, 200, { success: true, data: { products: [{ productId: 1, handle: 'middle-east', licenseType: 'Standard', category: 'Track', isAvailable: true }] } }));
    if (u.pathname === '/api/cart') return route.fulfill(json(req, 200, { success: true, data: { id: null, items: [], subtotal: 0, total: 0, itemCount: 0 } }));
    return route.fulfill(json(req, 404, { success: false, message: 'c222 stub' }));
  });
  await ctx.route('**/api/studio-token?**', (route) => { R.stubLog.push('studio-token'); route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'c222-token', expiresIn: 3600000 }) }); });
  R.stemMap = {};
  await ctx.route('https://czaba-r2-proxy.sabashavidze.workers.dev/**', (route) => {
    const p = new URL(route.request().url()).pathname; const file = decodeURIComponent(p.split('/').pop());
    const hz = FREQ_BY_FILE[file]; R.stemMap[file.replace(/\.wav$/, '')] = { r2Path: p, hz };
    if (!hz) { R.stubLog.push(`UNKNOWN stem ${p}`); return route.fulfill({ status: 404, body: '' }); }
    R.stubLog.push(`stem ${p}`); route.fulfill({ status: 200, headers: { 'content-type': 'audio/wav', 'Access-Control-Allow-Origin': '*' }, body: sine(4, hz) });
  });
  const page = await ctx.newPage(); const T0 = Date.now(); const rel = () => Date.now() - T0;
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  const dls = []; page.on('download', (d) => dls.push(d));
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForFunction(() => { const b = document.querySelector('button[title="Export Mix"]'); return b && !b.disabled; }, null, { timeout: 240000 });
  R.readyMs = rel();
  if (MODE === 'warmup') { await ctx.close(); await browser.close(); console.log(JSON.stringify({ key: KEY, readyMs: R.readyMs, pageErrors: R.pageErrors })); return; }
  const dialog = page.getByRole('dialog');
  const state = async () => dialog.evaluate((d) => {
    const boxes = [...d.querySelectorAll('input[type=checkbox]')];
    const btns = [...d.querySelectorAll('button')];
    const exp = btns.find((b) => /Export Audio/.test(b.textContent || ''));
    const als = btns.find((b) => /\.als/.test(b.textContent || ''));
    const toggle = btns.find((b) => /^(Select|Deselect) All$/.test((b.textContent || '').trim()));
    return {
      checked: boxes.filter((b) => b.checked).length, total: boxes.length,
      unchecked: boxes.filter((b) => !b.checked).map((b) => (b.parentElement.querySelector('span') || {}).textContent),
      exportAudio: exp ? { disabled: exp.disabled } : null, alsButton: als ? { text: als.textContent.trim(), disabled: als.disabled } : null,
      toggleLabel: toggle ? toggle.textContent.trim() : null,
    };
  });
  const open = async () => { await clickCenter(page, page.locator('button[title="Export Mix"]')); await dialog.waitFor({ state: 'visible' }); await page.waitForTimeout(400); };
  const closeCancel = async () => { await clickCenter(page, dialog.getByRole('button', { name: 'Cancel', exact: true })); await dialog.waitFor({ state: 'hidden' }); await page.waitForTimeout(300); };
  const boxFor = (name) => dialog.locator('label', { has: page.locator('span', { hasText: new RegExp(`^${name}$`) }) }).locator('input[type=checkbox]');
  const download = async (name) => {
    const n0 = dls.length; const t0 = rel();
    await clickCenter(page, dialog.getByRole('button', { name: /Export Audio/ }));
    const until = Date.now() + 240000; while (dls.length === n0 && Date.now() < until) await page.waitForTimeout(100);
    if (dls.length === n0) throw new Error(`no download for ${name}`);
    const d = dls[dls.length - 1]; const f = path.join(OUT, `${KEY}-${name}-${d.suggestedFilename().replace(/\s+/g, '_')}`); await d.saveAs(f);
    await page.waitForTimeout(500);
    return { file: f, suggested: d.suggestedFilename(), ms: rel() - t0, dialogOpenAfter: await dialog.isVisible() };
  };
  const ensureOpen = async () => { if (!(await dialog.isVisible())) await open(); };

  await open();
  R.steps.initial = await state();
  await page.screenshot({ path: path.join(OUT, `${KEY}-1-dialog-initial.png`) });
  // SELECT-ALL
  await clickCenter(page, dialog.getByRole('button', { name: 'Deselect All', exact: true })); await page.waitForTimeout(250);
  R.steps.afterDeselectAll = await state();
  await page.screenshot({ path: path.join(OUT, `${KEY}-2-deselected.png`) });
  await clickCenter(page, dialog.getByRole('button', { name: 'Select All', exact: true })); await page.waitForTimeout(250);
  R.steps.afterSelectAll = await state();

  if (MODE === 'main') {
    // ABLETON-TAB: switch tab, read the .als button state; no download.
    await clickCenter(page, dialog.getByRole('button', { name: /Ableton/ }).first()); await page.waitForTimeout(300);
    R.steps.abletonTab = await state();
    await page.screenshot({ path: path.join(OUT, `${KEY}-3-ableton-tab.png`) });
    await closeCancel();
    // Fresh comparison: reload not needed; the selection was default then Deselect/Select All. To compare default vs Select-All
    // in the same page we first export with the untouched default from a NEW page load below.
    // Export A: reload the page, open, export WAV without touching the selection.
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 240000 });
    await page.waitForFunction(() => { const b = document.querySelector('button[title="Export Mix"]'); return b && !b.disabled; }, null, { timeout: 240000 });
    await open();
    R.steps.reloadInitial = await state();
    R.steps.formatPressedDefault = await dialog.evaluate((d) => [...d.querySelectorAll('button')].filter((b) => /WAV|MP3/.test(b.textContent || '')).map((b) => `${b.textContent.trim().slice(0, 20)}|${b.className.includes('border-brand') ? 'on' : 'off'}`));
    const a = await download('A-default'); R.steps.exportA = a;
    await ensureOpen();
    R.steps.beforeB = await state();
    await clickCenter(page, dialog.getByRole('button', { name: 'Deselect All', exact: true })); await page.waitForTimeout(250);
    await clickCenter(page, dialog.getByRole('button', { name: 'Select All', exact: true })); await page.waitForTimeout(250);
    R.steps.beforeBAfterToggle = await state();
    const b = await download('B-selectall'); R.steps.exportB = b;
    const ba = fs.readFileSync(a.file); const bb = fs.readFileSync(b.file);
    R.compareAB = { bytesA: ba.length, bytesB: bb.length, byteIdentical: Buffer.compare(ba, bb) === 0 };
    const wa = parseWav(ba); const wb = parseWav(bb);
    let maxDiff = 0; for (let i = 0; i < Math.min(wa.frames, wb.frames); i += 1) maxDiff = Math.max(maxDiff, Math.abs(wa.left[i] - wb.left[i]));
    R.compareAB.pcmMaxAbsDiffLeft = maxDiff;
    const meta = (w) => ({ format: w.format, channels: w.channels, sampleRate: w.sampleRate, bits: w.bits, frames: w.frames, duration: w.duration, dataEndsAtEOF: w.dataEndsAtEOF });
    R.wavA = meta(wa); R.spectrumA = spectrum(wa);
    // SUBSET-AUDIO: uncheck exactly one stem K.
    const K = 'Duduk';
    await ensureOpen();
    await clickCenter(page, boxFor(K)); await page.waitForTimeout(250);
    R.steps.subsetState = await state();
    await page.screenshot({ path: path.join(OUT, `${KEY}-4-subset-${K}.png`) });
    const c = await download(`C-without-${K}`); R.steps.exportC = c;
    const wc = parseWav(fs.readFileSync(c.file)); R.wavC = meta(wc); R.spectrumC = spectrum(wc);
    const inc = Object.entries(R.spectrumC).filter(([k]) => k !== K && !k.startsWith('_')).map(([, v]) => v.db).sort((x, y) => x - y);
    const med = (inc[4] + inc[5]) / 2; R.subset = { excluded: K, excludedDb: R.spectrumC[K].db, includedMedianDb: +med.toFixed(2), gapDb: +(med - R.spectrumC[K].db).toFixed(2), includedMinDb: inc[0] };
    // re-check K, then MP3 High.
    await ensureOpen();
    await clickCenter(page, boxFor(K)); await page.waitForTimeout(250);
    R.steps.beforeMp3 = await state();
    await clickCenter(page, dialog.getByRole('button', { name: /^MP3/ }));
    await clickCenter(page, dialog.getByRole('button', { name: 'High', exact: true }));
    await page.waitForTimeout(250);
    const m = await download('D-mp3-high'); R.steps.exportD = m;
    const mb = fs.readFileSync(m.file); R.mp3 = parseMp3(mb);
    R.mp3Decoded = await page.evaluate(async (b64) => {
      const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) u[i] = bin.charCodeAt(i);
      const ab = await new OfflineAudioContext(2, 48000, 48000).decodeAudioData(u.buffer);
      return { duration: ab.duration, channels: ab.numberOfChannels, sampleRate: ab.sampleRate };
    }, mb.toString('base64'));
    await page.screenshot({ path: path.join(OUT, `${KEY}-5-after.png`) });
  }

  if (MODE === 'control') {
    await closeCancel();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 240000 });
    await page.waitForFunction(() => { const b = document.querySelector('button[title="Export Mix"]'); return b && !b.disabled; }, null, { timeout: 240000 });
    const files = [];
    await open(); R.steps.c0 = await state(); files.push(await download('A1-default'));
    await ensureOpen(); R.steps.c1 = await state(); files.push(await download('A2-default'));
    await ensureOpen();
    await clickCenter(page, dialog.getByRole('button', { name: 'Deselect All', exact: true })); await page.waitForTimeout(250);
    await clickCenter(page, dialog.getByRole('button', { name: 'Select All', exact: true })); await page.waitForTimeout(250);
    R.steps.c2 = await state(); files.push(await download('B1-selectall'));
    await ensureOpen(); files.push(await download('B2-selectall'));
    const bufs = files.map((f) => fs.readFileSync(f.file));
    const cmp = (x, y) => { let n = 0; let m = 0; for (let i = 44; i < Math.min(x.length, y.length); i += 2) { const d = Math.abs(x.readInt16LE(i) - y.readInt16LE(i)); if (d) { n += 1; m = Math.max(m, d); } } return { identical: Buffer.compare(x, y) === 0, diffSamples: n, maxLsb: m, bytes: [x.length, y.length] }; };
    R.control = { A1vsA2: cmp(bufs[0], bufs[1]), B1vsB2: cmp(bufs[2], bufs[3]), A1vsB1: cmp(bufs[0], bufs[2]), A2vsB2: cmp(bufs[1], bufs[3]) };
    console.log(JSON.stringify(R.control));
  }
  if (MODE === 'nonorm') {
    const norm = dialog.locator('xpath=.//label[normalize-space(text())="Normalize Audio"]/../../button');
    await clickCenter(page, norm); await page.waitForTimeout(250);
    R.steps.normClass = await norm.getAttribute('class');
    const f1 = await download('N1-nonorm'); await ensureOpen();
    R.steps.normClassAfterReopen = await norm.getAttribute('class');
    const f2 = await download('N2-nonorm');
    const x = fs.readFileSync(f1.file); const y = fs.readFileSync(f2.file);
    let n = 0; let m = 0; for (let i = 44; i < Math.min(x.length, y.length); i += 2) { const d = Math.abs(x.readInt16LE(i) - y.readInt16LE(i)); if (d) { n += 1; m = Math.max(m, d); } }
    let pk = 0; for (let i = 44; i < x.length; i += 2) pk = Math.max(pk, Math.abs(x.readInt16LE(i)));
    R.nonorm = { identical: Buffer.compare(x, y) === 0, diffSamples: n, maxLsb: m, peak1: pk, bytes: [x.length, y.length] };
    console.log(JSON.stringify(R.nonorm));
  }
  if (MODE === 'persist') {
    const K = 'Didgeridoo'; const MUTE_INDEX = 6; // track 7 = Duduk (order 7), a different stem
    await clickCenter(page, boxFor(K)); await page.waitForTimeout(250);
    R.steps.afterUncheck = await state();
    await closeCancel();
    await open();
    R.steps.reopen1 = await state();
    await page.screenshot({ path: path.join(OUT, `${KEY}-3-reopen-after-cancel.png`) });
    // close with the ✕ (Modal close) if present
    const closeX = dialog.getByRole('button', { name: /close/i });
    R.steps.closeXCount = await closeX.count();
    if (R.steps.closeXCount === 1) { await clickCenter(page, closeX); await dialog.waitFor({ state: 'hidden' }); } else await closeCancel();
    const mutes = page.locator('button[title="Mute"]');
    R.steps.muteButtons = await mutes.count();
    const muteBtn = mutes.nth(MUTE_INDEX);
    R.steps.mutedTrackName = await muteBtn.evaluate((b) => { let n = b; for (let i = 0; i < 8 && n; i += 1) { n = n.parentElement; const t = n && n.querySelector('button[title^="Download "]'); if (t) return t.getAttribute('title'); } return null; });
    await clickCenter(page, muteBtn); await page.waitForTimeout(500);
    R.steps.mutePressedClass = (await muteBtn.getAttribute('class')).includes('bg-red-500');
    await open();
    R.steps.reopen2 = await state();
    R.steps.mutedBadges = await dialog.evaluate((d) => [...d.querySelectorAll('label')].filter((l) => /Muted/.test(l.textContent || '')).map((l) => (l.querySelector('span') || {}).textContent));
    await page.screenshot({ path: path.join(OUT, `${KEY}-4-reopen-after-mute.png`) });
  }
  R.audioSrcCount = await page.locator('audio[src]').count();
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(OUT, `${KEY}.json`), JSON.stringify(R, null, 2));
  console.log(JSON.stringify({ key: KEY, readyMs: R.readyMs, steps: R.steps, compareAB: R.compareAB, wavA: R.wavA, subset: R.subset, mp3: R.mp3, mp3Decoded: R.mp3Decoded, pageErrors: R.pageErrors, stemMap: R.stemMap }, null, 1));
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
