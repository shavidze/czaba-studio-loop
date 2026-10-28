const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'legacy-ui-probe-1280');
fs.mkdirSync(OUT, { recursive: true });
function wav(seconds, freq) {
  const sr = 48000, ch = 2, n = sr * seconds, data = n * ch * 2;
  const b = Buffer.alloc(44 + data);
  b.write('RIFF', 0); b.writeUInt32LE(36 + data, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(ch, 22); b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * ch * 2, 28); b.writeUInt16LE(ch * 2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(data, 40);
  for (let i = 0; i < n; i++) { const v = Math.round(6000 * Math.sin(2 * Math.PI * freq * i / sr)); b.writeInt16LE(v, 44 + i * 4); b.writeInt16LE(v, 46 + i * 4); }
  return b;
}
const BR = { 1: [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320] };
function walk(buf) {
  let i = 0; if (buf.slice(0, 3).toString() === 'ID3') { const s = ((buf[6] & 127) << 21) | ((buf[7] & 127) << 14) | ((buf[8] & 127) << 7) | (buf[9] & 127); i = 10 + s; }
  const kb = {}; let frames = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) break;
    const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3, bri = buf[i + 2] >> 4, sri = (buf[i + 2] >> 2) & 3, pad = (buf[i + 2] >> 1) & 1;
    if (ver !== 3 || layer !== 1) break;
    const kbps = BR[1][bri - 1]; const sr = [44100, 48000, 32000][sri];
    const len = Math.floor(144000 * kbps / sr) + pad; kb[kbps] = (kb[kbps] || 0) + 1; frames++; i += len;
  }
  return { frames, kb, end: i, size: buf.length };
}
(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const q of ['High']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
    await ctx.addInitScript(() => { localStorage.setItem('auth_user', JSON.stringify({ accessToken: 'probe-access', refreshToken: 'probe-refresh', email: 'probe@example.com' })); });
    const cors = (req) => ({ 'Access-Control-Allow-Origin': req.headers()['origin'] || '*', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Id', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS' });
    const log = [];
    await ctx.route(/^http:\/\/(localhost|127\.0\.0\.1):5199\//, async (route) => {
      const req = route.request(); const u = new URL(req.url()); log.push(`${req.method()} ${u.pathname}`);
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(req) });
      if (u.pathname === '/api/auth/profile') return route.fulfill({ status: 200, headers: { ...cors(req), 'content-type': 'application/json' }, body: JSON.stringify({ success: true, data: { id: 1, email: 'probe@example.com', emailVerified: true, createdAt: '2026-01-01T00:00:00Z' } }) });
      if (u.pathname === '/api/downloads') return route.fulfill({ status: 200, headers: { ...cors(req), 'content-type': 'application/json' }, body: JSON.stringify({ success: true, data: { products: [{ productId: 1, handle: 'middle-east', licenseType: 'Standard', category: 'Track', isAvailable: true, standardUpgradeCredit: 0 }] } }) });
      if (u.pathname === '/api/cart') return route.fulfill({ status: 200, headers: { ...cors(req), 'content-type': 'application/json' }, body: JSON.stringify({ success: true, data: { id: null, items: [], subtotal: 0, total: 0, itemCount: 0 } }) });
      return route.fulfill({ status: 404, headers: { ...cors(req), 'content-type': 'application/json' }, body: JSON.stringify({ success: false, message: 'probe' }) });
    });
    await ctx.route('**/api/studio-token?**', (route) => { log.push('studio-token'); route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'probe-token', expiresIn: 3600000 }) }); });
    let f = 200;
    await ctx.route('https://czaba-r2-proxy.sabashavidze.workers.dev/**', (route) => { log.push('stem ' + new URL(route.request().url()).pathname); f += 37; route.fulfill({ status: 200, headers: { 'content-type': 'audio/wav', 'Access-Control-Allow-Origin': '*' }, body: wav(4, f) }); });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    const t0 = Date.now();
    await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'domcontentloaded', timeout: 180000 });
    const exportBtn = page.locator('button[title="Export Mix"]');
    try { await exportBtn.waitFor({ state: 'visible', timeout: 120000 }); await page.waitForFunction(() => { const b = document.querySelector('button[title="Export Mix"]'); return b && !b.disabled; }, null, { timeout: 120000 }); }
    catch (e) { await page.screenshot({ path: path.join(OUT, `fail-${q}.png`) }); result[q] = { error: 'export button not ready: ' + e.message.split('\n')[0], log: log.slice(0, 40), errors, body: (await page.textContent('body')).slice(0, 400) }; await ctx.close(); continue; }
    await exportBtn.click();
    await page.getByRole('button', { name: /^MP3/ }).click();
    await page.getByRole('button', { name: q, exact: true }).click();
    const checkedBefore = await page.locator('input[type=checkbox]:checked').count();
    const totalBoxes = await page.locator('input[type=checkbox]').count();
    await page.getByRole('button', { name: 'Select All' }).click();
    await page.waitForTimeout(300);
    const qClass = await page.getByRole('button', { name: q, exact: true }).getAttribute('class');
    await page.screenshot({ path: path.join(OUT, `dialog-${q}.png`) });
    result[q + '-dialog'] = { checkedBefore, totalBoxes, checkedAfter: await page.locator('input[type=checkbox]:checked').count(), qualitySelected: /border-brand text-brand/.test(qClass || '') };
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), page.getByRole('button', { name: /Export Audio/ }).click()]);
    const file = path.join(OUT, `${q}-${dl.suggestedFilename()}`); await dl.saveAs(file);
    const w = walk(fs.readFileSync(file));
    result[q] = { file: path.basename(file), name: dl.suggestedFilename(), walk: w, errors, ms: Date.now() - t0, stemRequests: log.filter((l) => l.startsWith('stem')).length, offOriginNonStem: log.filter((l) => !l.startsWith('stem') && l !== 'studio-token').slice(0, 10) };
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
