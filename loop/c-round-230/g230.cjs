// C round 230: G230-3 auth guard + STUDIO-SMOKE-230 (fade-in drag, Ctrl+Z, CALM-2a state, WAV fade check). usage: node g230.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const R = { started: new Date().toISOString(), g: {}, smoke: {} };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(outDir, 'g230.json'), JSON.stringify(R, null, 2));

function wavRms(buf, fromSec, toSec) {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const f0 = Math.floor(fromSec * rate); const f1 = Math.min(frames, Math.floor(toSec * rate));
  let s = 0; let n = 0;
  for (let f = f0; f < f1; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * 3; let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; const x = v / 8388608; s += x * x; n += 1;
  }
  return { rate, bits, ch, frames, seconds: frames / rate, rmsDb: n ? +(10 * Math.log10(s / n || 1e-20)).toFixed(2) : null };
}

async function guard(browser, vp) {
  const key = `${vp.width}x${vp.height}`;
  const r = {};
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  const labResp = await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); r.labStatus = labResp && labResp.status();
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add');
    return b && !b.disabled;
  }, undefined, { timeout: 90000 });
  r.lab = await page.evaluate(() => ({ path: location.pathname, demoBadge: document.body.innerText.includes('Demo collection — no sign-in required'), authUser: localStorage.getItem('auth_user'), workspace: !!document.querySelector('[data-testid=arrangement-ruler]') }));
  await page.screenshot({ path: path.join(outDir, `g-${key}-lab.png`) });
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' });
  await sleep(3000);
  r.guard = await page.evaluate(() => ({ path: location.pathname, signIn: document.body.innerText.includes('Sign in required'), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]'), authUser: localStorage.getItem('auth_user') }));
  await page.screenshot({ path: path.join(outDir, `g-${key}-guard.png`) });
  const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
  const noHdr = await ctx.request.get(api, { failOnStatusCode: false });
  r.tokenNoHeader = { status: noHdr.status(), body: (await noHdr.text()).slice(0, 200) };
  const fake = await ctx.request.get(api, { headers: { Authorization: 'Bearer fake.c230.token' }, failOnStatusCode: false });
  r.tokenFakeBearer = { status: fake.status(), body: (await fake.text()).slice(0, 200) };
  r.tokenIssued = noHdr.status() === 200 || fake.status() === 200 || /"(token|url)"/i.test(r.tokenNoHeader.body + r.tokenFakeBearer.body);
  r.pageErrors = errs;
  await ctx.close();
  return r;
}

const undoInfo = (page) => page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-keyshortcuts') === 'Control+Z Meta+Z');
  return b ? { title: b.getAttribute('title'), disabled: b.disabled } : null;
});
const clipFade = (page) => page.evaluate(() => {
  const c = document.querySelector('[data-clip-kind="audio"]');
  return c ? { fadeIn: c.getAttribute('data-fade-in'), fadeOut: c.getAttribute('data-fade-out') } : null;
});

async function exportWav(page, key, tag) {
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog'); await dlg.waitFor();
  const dlP = page.waitForEvent('download', { timeout: 90000 });
  await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
  const dl = await dlP;
  await dlg.getByText(/^WAV created:/).waitFor({ timeout: 60000 });
  const created = await dlg.getByText(/^WAV created:/).textContent();
  const file = path.join(outDir, `smoke-${key}-${tag}.wav`);
  await dl.saveAs(file);
  const buf = fs.readFileSync(file);
  const res = { created, bytes: buf.length, first0_05: wavRms(buf, 0, 0.05), s0_05_0_10: wavRms(buf, 0.05, 0.1), s1_2: wavRms(buf, 1, 2), whole: wavRms(buf, 0, 1e9) };
  fs.unlinkSync(file);
  await dlg.getByRole('button', { name: 'Done', exact: true }).click();
  await sleep(400);
  return res;
}

async function smoke(browser, vp) {
  const key = `${vp.width}x${vp.height}`;
  const r = { pageErrors: [] };
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => r.pageErrors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add');
    return b && !b.disabled;
  }, undefined, { timeout: 90000 });
  await sleep(800);
  r.calm2a = await page.evaluate(() => {
    const t = (id) => document.querySelector(`[data-testid="${id}"]`);
    const loop = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L');
    return { loopStripText: t('arrangement-loop-strip')?.textContent ?? null, barsRulerText: t('arrangement-bars-ruler')?.textContent ?? null, loopTitle: loop?.getAttribute('title') ?? null, loopDisabled: loop?.disabled ?? null };
  });
  r.undoBefore = await undoInfo(page);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 20000 });
  await sleep(800);
  r.undoAfterAdd = await undoInfo(page);
  r.fadeBefore = await clipFade(page);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const cb = await clip.boundingBox();
  r.clipBox = cb;
  // select clip (click on its body center) so handles are opaque, then hover
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height * 0.7, { steps: 4 });
  await page.mouse.down(); await page.mouse.up();
  await sleep(400);
  const h = page.getByTestId('arrangement-clip-fade-in-handle').first();
  await h.waitFor({ timeout: 5000 });
  const hb = await h.boundingBox();
  r.handleBox = hb;
  r.handleOpacity = await h.evaluate((el) => getComputedStyle(el).opacity);
  r.handleCursor = await h.evaluate((el) => getComputedStyle(el).cursor);
  await page.screenshot({ path: path.join(outDir, `smoke-${key}-before-drag.png`) });
  const x0 = hb.x + hb.width / 2; const y0 = hb.y + hb.height / 2;
  await page.mouse.move(x0, y0, { steps: 3 });
  await page.mouse.down();
  await page.mouse.move(x0 + 60, y0, { steps: 12 });
  await sleep(100);
  r.fadeDuring = await clipFade(page);
  await page.mouse.move(x0 + 120, y0, { steps: 12 });
  await page.mouse.up();
  await sleep(600);
  r.fadeAfterDrag = await clipFade(page);
  r.undoAfterDrag = await undoInfo(page);
  await page.screenshot({ path: path.join(outDir, `smoke-${key}-after-drag.png`) });
  r.wavFaded = await exportWav(page, key, 'faded');
  // focus workspace (not a text field) and press Ctrl+Z once
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.keyboard.press('Control+z');
  await sleep(600);
  r.fadeAfterUndo = await clipFade(page);
  r.undoAfterUndo = await undoInfo(page);
  r.clipsAfterUndo = await page.locator('[data-clip-kind="audio"]').count();
  await page.screenshot({ path: path.join(outDir, `smoke-${key}-after-undo.png`) });
  r.wavUndone = await exportWav(page, key, 'undone');
  r.calm2aAfter = await page.evaluate(() => ({ loopStripText: document.querySelector('[data-testid="arrangement-loop-strip"]')?.textContent ?? null, barsRulerText: document.querySelector('[data-testid="arrangement-bars-ruler"]')?.textContent ?? null }));
  await ctx.close();
  return r;
}

(async () => {
  const browser = await chromium.launch();
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    try { R.g[key] = await guard(browser, vp); } catch (e) { R.g[key] = { error: String(e) }; }
    save();
    try { R.smoke[key] = await smoke(browser, vp); } catch (e) { R.smoke[key] = { error: String(e).slice(0, 600) }; }
    save();
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
  console.log(JSON.stringify(R, null, 2));
})();
