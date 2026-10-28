// C round 221: LEGACY-UI-STUBBED-221. Own script (technique per task §3 / HR-LEGACY-STUBBED). Real mouse, fresh context per run.
// usage: node c221-legacy.cjs <quality Low|Medium|High> <W> <H> <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [Q, W, H, OUT] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const KEY = `${Q}-${W}x${H}`;
const BASE = 'http://127.0.0.1:5173';
const KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const SR = [44100, 48000, 32000, 0];
const MODES = ['stereo', 'joint-stereo', 'dual-channel', 'mono'];
function sine(seconds, freq) {
  const sr = 48000; const n = sr * seconds; const data = n * 4; const b = Buffer.alloc(44 + data);
  b.write('RIFF', 0); b.writeUInt32LE(36 + data, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(data, 40);
  for (let i = 0; i < n; i += 1) { const v = Math.round(5000 * Math.sin((2 * Math.PI * freq * i) / sr)); b.writeInt16LE(v, 44 + i * 4); b.writeInt16LE(v, 46 + i * 4); }
  return b;
}
function parseMp3(buf) {
  const r = { bytes: buf.length, id3v2: 0, xing: null, audioFrames: 0, hist: { kbps: {}, sr: {}, mode: {}, verLayer: {} }, endReason: null };
  let p = 0;
  if (buf.toString('latin1', 0, 3) === 'ID3') { p = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]); r.id3v2 = p; }
  let first = true; const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
  for (;;) {
    if (p === buf.length) { r.endReason = 'EOF'; break; }
    if (p + 4 > buf.length) { r.endReason = `partial(${buf.length - p})`; break; }
    if (buf.toString('latin1', p, p + 3) === 'TAG' && buf.length - p === 128) { r.endReason = 'ID3v1'; break; }
    const h = buf.readUInt32BE(p);
    if ((h >>> 21) !== 0x7ff) { r.endReason = `nosync@${p}`; break; }
    const ver = (h >>> 19) & 3; const lay = (h >>> 17) & 3; const prot = (h >>> 16) & 1; const kb = KBPS[(h >>> 12) & 15]; const sr = SR[(h >>> 10) & 3]; const pad = (h >>> 9) & 1; const mode = (h >>> 6) & 3;
    if (!kb || !sr) { r.endReason = `badheader@${p}`; break; }
    const len = Math.floor((144000 * kb) / sr) + pad; const side = mode === 3 ? 17 : 32;
    const tags = [buf.toString('latin1', p + 4 + side + (prot ? 0 : 2), p + 8 + side + (prot ? 0 : 2)), buf.toString('latin1', p + 4 + side, p + 8 + side)];
    if (first && tags.some((t) => t === 'Xing' || t === 'Info')) r.xing = { tag: tags.find((t) => t === 'Xing' || t === 'Info'), kbps: kb, sr, mode: MODES[mode] };
    else { r.audioFrames += 1; inc(r.hist.kbps, kb); inc(r.hist.sr, sr); inc(r.hist.mode, MODES[mode]); inc(r.hist.verLayer, `${ver === 3 ? 'MPEG-1' : 'other'}/${lay === 1 ? 'III' : 'other'}`); }
    first = false; p += len;
  }
  return r;
}
async function clickCenter(page, loc) {
  await loc.scrollIntoViewIfNeeded(); const b = await loc.boundingBox(); if (!b) throw new Error('no box');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await page.mouse.down(); await page.mouse.up();
}
(async () => {
  const R = { key: KEY, started: new Date().toISOString(), pageErrors: [], stubLog: [], requests: [] };
  const browser = await chromium.launch(); R.chromium = browser.version();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
  await ctx.addInitScript(() => { localStorage.setItem('auth_user', JSON.stringify({ accessToken: 'c221-fake-access', refreshToken: 'c221-fake-refresh', email: 'c221@example.invalid' })); });
  const cors = (req) => ({ 'Access-Control-Allow-Origin': req.headers().origin || '*', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Id', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS' });
  const json = (req, status, body) => ({ status, headers: { ...cors(req), 'content-type': 'application/json' }, body: JSON.stringify(body) });
  await ctx.route(/^https?:\/\/(localhost|127\.0\.0\.1):5199\//, (route) => {
    const req = route.request(); const u = new URL(req.url()); R.stubLog.push(`${req.method()} ${u.pathname}`);
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(req) });
    if (u.pathname === '/api/auth/profile') return route.fulfill(json(req, 200, { success: true, data: { id: 1, email: 'c221@example.invalid', emailVerified: true, createdAt: '2026-01-01T00:00:00Z' } }));
    if (u.pathname === '/api/downloads') return route.fulfill(json(req, 200, { success: true, data: { products: [{ productId: 1, handle: 'middle-east', licenseType: 'Standard', category: 'Track', isAvailable: true }] } }));
    if (u.pathname === '/api/cart') return route.fulfill(json(req, 200, { success: true, data: { id: null, items: [], subtotal: 0, total: 0, itemCount: 0 } }));
    return route.fulfill(json(req, 404, { success: false, message: 'c221 stub' }));
  });
  await ctx.route('**/api/studio-token?**', (route) => { R.stubLog.push('studio-token'); route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'c221-token', expiresIn: 3600000 }) }); });
  const freqs = new Map(); let nextF = 220;
  await ctx.route('https://czaba-r2-proxy.sabashavidze.workers.dev/**', (route) => {
    const p = new URL(route.request().url()).pathname; if (!freqs.has(p)) { freqs.set(p, nextF); nextF += 55; }
    R.stubLog.push(`stem ${p}`); route.fulfill({ status: 200, headers: { 'content-type': 'audio/wav', 'Access-Control-Allow-Origin': '*' }, body: sine(4, freqs.get(p)) });
  });
  const page = await ctx.newPage(); const T0 = Date.now(); const rel = () => Date.now() - T0;
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  page.on('request', (q) => R.requests.push({ t: rel(), url: q.url(), type: q.resourceType() }));
  const dls = []; page.on('download', (d) => dls.push({ t: rel(), d }));
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForFunction(() => { const b = document.querySelector('button[title="Export Mix"]'); return b && !b.disabled; }, null, { timeout: 180000 });
  R.readyMs = rel();
  R.stemFreqs = Object.fromEntries(freqs);
  await clickCenter(page, page.locator('button[title="Export Mix"]'));
  await clickCenter(page, page.getByRole('button', { name: /^MP3/ }));
  await clickCenter(page, page.getByRole('button', { name: Q, exact: true }));
  await page.waitForTimeout(300);
  R.checkedInitial = await page.locator('input[type=checkbox]:checked').count();
  R.boxes = await page.locator('input[type=checkbox]').count();
  R.exportDisabledInitial = await page.getByRole('button', { name: /Export Audio/ }).isDisabled();
  await page.screenshot({ path: path.join(OUT, `${KEY}-dialog-initial.png`) });
  await clickCenter(page, page.getByRole('button', { name: 'Select All' }));
  await page.waitForTimeout(300);
  R.checkedAfterSelectAll = await page.locator('input[type=checkbox]:checked').count();
  R.qualityPressed = await page.getByRole('button', { name: Q, exact: true }).evaluate((e) => ({ ariaPressed: e.getAttribute('aria-pressed'), cls: e.className.slice(0, 160) }));
  await page.screenshot({ path: path.join(OUT, `${KEY}-dialog-selected.png`) });
  const clickAt = rel();
  await clickCenter(page, page.getByRole('button', { name: /Export Audio/ }));
  const until = Date.now() + 180000; while (!dls.length && Date.now() < until) await page.waitForTimeout(100);
  if (!dls.length) throw new Error('no download');
  const dlAt = dls[0].t; R.exportMs = dlAt - clickAt;
  R.fileName = dls[0].d.suggestedFilename();
  const f = path.join(OUT, `${KEY}.mp3`); await dls[0].d.saveAs(f); const buf = fs.readFileSync(f);
  R.mp3 = parseMp3(buf);
  R.decoded = await page.evaluate(async (b64) => {
    const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) u[i] = bin.charCodeAt(i);
    const ab = await new OfflineAudioContext(2, 48000, 48000).decodeAudioData(u.buffer);
    let s = 0; let n = 0; for (let c = 0; c < ab.numberOfChannels; c += 1) { const d = ab.getChannelData(c); for (let i = 0; i < d.length; i += 1) { s += d[i] * d[i]; n += 1; } }
    return { duration: ab.duration, channels: ab.numberOfChannels, sampleRate: ab.sampleRate, rmsDbfs: +(10 * Math.log10(s / n)).toFixed(2) };
  }, buf.toString('base64'));
  await page.screenshot({ path: path.join(OUT, `${KEY}-after.png`) });
  const allowed = (u) => u.startsWith(BASE) || u.startsWith('blob:') || u.startsWith('data:') || /^https?:\/\/(localhost|127\.0\.0\.1):5199\//.test(u) || u.startsWith('https://czaba-r2-proxy.sabashavidze.workers.dev/');
  const win = R.requests.filter((q) => q.t >= clickAt && q.t <= dlAt);
  R.exportWindow = win.map((q) => `${q.type} ${q.url.replace(BASE, '').slice(0, 120)}`);
  R.exportOffOrigin = win.filter((q) => !allowed(q.url)).map((q) => q.url);
  R.exportUnpkg = win.filter((q) => /unpkg/i.test(q.url)).map((q) => q.url);
  R.loadOffOrigin = [...new Set(R.requests.filter((q) => !allowed(q.url)).map((q) => new URL(q.url).origin))];
  R.audioSrcCount = await page.locator('audio[src]').count();
  delete R.requests;
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(OUT, `${KEY}.json`), JSON.stringify(R, null, 2));
  const S = { key: KEY, file: R.fileName, checkedInitial: R.checkedInitial, boxes: R.boxes, exportDisabledInitial: R.exportDisabledInitial, after: R.checkedAfterSelectAll, frames: R.mp3.audioFrames, xing: R.mp3.xing && R.mp3.xing.tag, hist: R.mp3.hist, end: R.mp3.endReason, decoded: R.decoded, pageErrors: R.pageErrors, exportOffOrigin: R.exportOffOrigin, unpkg: R.exportUnpkg, window: R.exportWindow, loadOffOrigin: R.loadOffOrigin, exportMs: R.exportMs };
  console.log(JSON.stringify(S, null, 1));
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
