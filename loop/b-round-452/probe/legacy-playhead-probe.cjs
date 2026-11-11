// usage: node legacy-playhead-probe.cjs <base> <out.json> <W> <H> <shotDir>
// STORE-2b-3b row LEGACY-STUBBED (HR-LEGACY-STUBBED; client path only, never ownership): the frozen legacy
// /studio/middle-east with the round-222 page.route stubs. Reads the GlobalPlayhead line's computed box-shadow
// and the legacy ExportDialog primary button (ui/Button primary) at rest and hover.
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [BASE, OUTFILE, W, H, SHOTS = 'shots-legacy'] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5]), process.argv[6]];
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
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const R = { base: BASE, vp: W, pageErrors: [], stubLog: [] };
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { localStorage.setItem('auth_user', JSON.stringify({ accessToken: 'b453-fake-access', refreshToken: 'b453-fake-refresh', email: 'b453@example.invalid' })); });
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
  
  await ctx.route('https://czaba-r2-proxy.sabashavidze.workers.dev/**', (route) => {
    const p = new URL(route.request().url()).pathname; const file = decodeURIComponent(p.split('/').pop());
    const hz = FREQ_BY_FILE[file]; 
    if (!hz) { R.stubLog.push(`UNKNOWN stem ${p}`); return route.fulfill({ status: 404, body: '' }); }
    R.stubLog.push(`stem ${p}`); route.fulfill({ status: 200, headers: { 'content-type': 'audio/wav', 'Access-Control-Allow-Origin': '*' }, body: sine(4, hz) });
  });
  const page = await ctx.newPage(); const T0 = Date.now();
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  try {
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded', timeout: 240000 });
    await page.waitForFunction(() => { const b = document.querySelector('button[title="Export Mix"]'); return b && !b.disabled; }, null, { timeout: 240000 });
    R.readyMs = Date.now() - T0;
    await page.waitForTimeout(800);
    R.playheads = await page.evaluate(() => [...document.querySelectorAll('[class*="shadow-glow"], [class*="bg-amber-400"]')].map((el) => ({
      cls: el.className.toString().slice(0, 160), boxShadow: getComputedStyle(el).boxShadow, bg: getComputedStyle(el).backgroundColor,
      box: (() => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); })(),
    })));
    await page.screenshot({ path: `${SHOTS}/legacy-${W}.png` });
    await page.locator('button[title="Export Mix"]').click();
    const dialog = page.getByRole('dialog'); await dialog.waitFor({ state: 'visible', timeout: 15000 }); await page.waitForTimeout(500);
    const exp = dialog.getByRole('button', { name: /Export Audio/ }).first();
    R.exportRest = await exp.evaluate((e) => ({ boxShadow: getComputedStyle(e).boxShadow, bg: getComputedStyle(e).backgroundColor, disabled: e.disabled }));
    await exp.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); const b = await exp.boundingBox(); R.exportBox = b; await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(500);
    R.exportHover = await exp.evaluate((e) => ({ boxShadow: getComputedStyle(e).boxShadow, bg: getComputedStyle(e).backgroundColor }));
    await exp.screenshot({ path: `${SHOTS}/legacy-export-hover-${W}.png` });
  } catch (e) { R.error = String(e).split('\n')[0]; }
  R.audioSrc = await page.evaluate(() => document.querySelectorAll('audio[src]').length).catch(() => null);
  await browser.close(); fs.writeFileSync(OUTFILE, JSON.stringify(R, null, 1));
  console.log(JSON.stringify({ vp: W, readyMs: R.readyMs, error: R.error, playheads: R.playheads, exportRest: R.exportRest, exportHover: R.exportHover, pageErrors: R.pageErrors.length }));
})();
