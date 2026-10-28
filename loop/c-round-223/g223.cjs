// C round 223: copy of c-round-222/g222.cjs (G223-3 unstubbed auth guard + LAB-SMOKE-223 WAV + S2 lane probe), both viewports.
// usage: node g216.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/playwright'));

const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
const R = { started: new Date().toISOString(), g: {}, smoke: {} };

function analyseWav(buf) {
  const s = (o, n) => buf.toString('ascii', o, o + n);
  const h = {
    riff: s(0, 4), wave: s(8, 4), fmt: s(12, 4), fmtSize: buf.readUInt32LE(16), format: buf.readUInt16LE(20),
    channels: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), byteRate: buf.readUInt32LE(28), blockAlign: buf.readUInt16LE(32),
    bits: buf.readUInt16LE(34), dataTag: s(36, 4), dataSize: buf.readUInt32LE(40), riffSize: buf.readUInt32LE(4), fileSize: buf.length,
  };
  const frames = h.dataSize / h.blockAlign;
  let clipped = 0; let peak = 0; let sumSq = 0; let nonZero = 0; let n = 0;
  const segSec = 10; const segFrames = segSec * h.rate; const segRms = [];
  let segSum = 0; let segN = 0;
  for (let f = 0; f < frames; f += 1) {
    for (let c = 0; c < h.channels; c += 1) {
      const o = 44 + f * h.blockAlign + c * 3;
      let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16);
      if (v & 0x800000) v -= 0x1000000;
      const x = v / 8388608;
      const a = Math.abs(x);
      if (a > peak) peak = a;
      if (v !== 0) nonZero += 1;
      if (v >= 8388600 || v <= -8388600) clipped += 1;
      sumSq += x * x; n += 1; segSum += x * x; segN += 1;
    }
    if ((f + 1) % segFrames === 0) { segRms.push(+Math.sqrt(segSum / segN).toFixed(4)); segSum = 0; segN = 0; }
  }
  if (segN) segRms.push(+Math.sqrt(segSum / segN).toFixed(4));
  return { header: h, frames, seconds: frames / h.rate, peak: +peak.toFixed(4), rmsDbfs: +(10 * Math.log10(sumSq / n)).toFixed(2), nonZeroFraction: +(nonZero / n).toFixed(4), fullScaleSamples: clipped, segRms10s: segRms };
}

async function clickCenter(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) throw new Error('no box');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
  await page.mouse.down();
  await page.mouse.up();
}

async function smoke(browser, vp) {
  const key = `${vp.width}x${vp.height}`;
  const r = { pageErrors: [], consoleErrors: [] };
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => r.pageErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') r.consoleErrors.push(m.text().slice(0, 200)); });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  const add = page.getByRole('button', { name: 'Add', exact: true });
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add');
    return b && !b.disabled;
  }, undefined, { timeout: 90000 });
  r.demoBadge = await page.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required'));
  r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  await clickCenter(page, add);
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 20000 });
  r.clips = await page.locator('[data-clip-kind="audio"]').count();
  r.lane = await page.evaluate(() => {
    const clip = document.querySelector('[data-clip-kind="audio"]');
    const own = clip && clip.closest('[data-track-id]');
    const probe = (lane) => {
      const box = lane.getBoundingClientRect();
      const y = box.top + box.height / 2;
      const right = Math.min(box.right, window.innerWidth) - 4;
      for (let x = Math.max(box.left, 0) + 4; x <= right; x += 8) {
        const hit = document.elementFromPoint(x, y);
        if (hit !== null && hit.closest('[data-track-id]') === lane && hit.closest('[data-clip-id]') === null && hit.closest('button, input, [role="slider"]') === null && x > window.innerWidth * 0.5) return { x, y };
      }
      return null;
    };
    const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.parentElement.closest('[data-track-id]'));
    const clipBox = clip && clip.getBoundingClientRect();
    return {
      clipLane: own ? own.getAttribute('data-track-id') : null,
      clipBox: clipBox && { left: Math.round(clipBox.left), right: Math.round(clipBox.right), w: Math.round(clipBox.width) },
      innerWidth: window.innerWidth,
      lanes: lanes.map((l) => ({ id: l.getAttribute('data-track-id'), emptyRightHalf: probe(l) })),
    };
  });
  await page.screenshot({ path: path.join(outDir, `smoke-${key}-added.png`) });
  const exportBtn = page.getByRole('button', { name: 'Export', exact: true });
  r.exportButtons = await exportBtn.count();
  r.exportVisible = r.exportButtons > 0 ? await exportBtn.first().isVisible() : false;
  if (!r.exportVisible) {
    r.note = 'Export not directly visible; listing toolbar buttons';
    r.buttons = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 80));
    await ctx.close();
    return r;
  }
  const eb = await exportBtn.first().boundingBox();
  r.exportBox = eb && { x: Math.round(eb.x), y: Math.round(eb.y), w: Math.round(eb.width), h: Math.round(eb.height), inViewport: eb.x >= 0 && eb.x + eb.width <= vp.width && eb.y + eb.height <= vp.height };
  await clickCenter(page, exportBtn.first());
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  r.wavChecked = await page.getByTestId('arrangement-export-format-wav').isChecked();
  const primary = dlg.getByRole('button', { name: 'Export WAV', exact: true });
  await page.screenshot({ path: path.join(outDir, `smoke-${key}-dialog.png`) });
  const dlP = page.waitForEvent('download', { timeout: 60000 });
  await clickCenter(page, primary);
  const dl = await dlP;
  await dlg.getByText(/^WAV created:/).waitFor({ timeout: 30000 });
  r.created = await dlg.getByText(/^WAV created:/).textContent();
  await page.screenshot({ path: path.join(outDir, `smoke-${key}-created.png`) });
  r.filename = dl.suggestedFilename();
  const file = path.join(outDir, `smoke-${key}.wav`);
  await dl.saveAs(file);
  const a = analyseWav(fs.readFileSync(file));
  fs.unlinkSync(file);
  r.wav = a;
  const m = /(\d+):(\d+\.\d+)/.exec(r.created || '');
  r.createdSeconds = m ? Number(m[1]) * 60 + Number(m[2]) : null;
  r.frameDiff = r.createdSeconds === null ? null : a.frames - Math.round(r.createdSeconds * 48000);
  await clickCenter(page, dlg.getByRole('button', { name: 'Done', exact: true }));
  r.dialogClosed = (await page.getByRole('dialog').count()) === 0;
  await ctx.close();
  return r;
}

async function guard(browser, vp) {
  const key = `${vp.width}x${vp.height}`;
  const r = {};
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  r.console = []; page.on('console', (m) => r.console.push(m.type() + ': ' + m.text().slice(0, 240)));
  const labResp = await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); r.labStatus = labResp && labResp.status();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.waitForFunction(() => document.body !== null && document.readyState === 'complete', undefined, { timeout: 30000 });
  r.lab = await page.evaluate(() => ({ path: location.pathname, demoBadge: document.body.innerText.includes('Demo collection — no sign-in required'), authUser: localStorage.getItem('auth_user'), workspace: !!document.querySelector('[data-testid=arrangement-ruler]') }));
  await page.screenshot({ path: path.join(outDir, `g-${key}-lab.png`) });
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.waitForFunction(() => document.body !== null && document.readyState === 'complete', undefined, { timeout: 30000 });
  r.guard = await page.evaluate(() => ({ path: location.pathname, signIn: document.body.innerText.includes('Sign in required'), audioSrc: document.querySelectorAll('audio[src]').length, audioAny: document.querySelectorAll('audio').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') }));
  await page.screenshot({ path: path.join(outDir, `g-${key}-guard.png`) });
  const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
  const noHdr = await ctx.request.get(api, { failOnStatusCode: false });
  r.tokenNoHeader = { status: noHdr.status(), body: (await noHdr.text()).slice(0, 200) };
  const fake = await ctx.request.get(api, { headers: { Authorization: 'Bearer fake.c223.token' }, failOnStatusCode: false });
  r.tokenFakeBearer = { status: fake.status(), body: (await fake.text()).slice(0, 200) };
  r.tokenIssued = /token|url/i.test(r.tokenNoHeader.body + r.tokenFakeBearer.body) && (noHdr.status() === 200 || fake.status() === 200);
  r.pageErrors = errs; r.consoleDevHits = r.console.filter((l) => /optimizeDeps|ffmpeg/i.test(l));
  await ctx.close();
  return r;
}

(async () => {
  const browser = await chromium.launch();
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    try { R.g[key] = await guard(browser, vp); } catch (e) { R.g[key] = { error: String(e) }; }
    try { R.smoke[key] = await smoke(browser, vp); } catch (e) { R.smoke[key] = { error: String(e) }; }
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'g223.json'), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, null, 2));
})();
