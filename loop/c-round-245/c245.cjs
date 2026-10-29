// C round 245: G245-AUTH + STUDIO-SMOKE-245 (independent; patterns from c-round-244/c244.cjs)
// usage: node c245.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c245.json');
const R = { started: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';

const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};

const wavInfo = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    if (!Number.isFinite(x)) nan += 1;
    s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a;
  }
  return { bytes: buf.length, rate, bits, ch, frames, seconds: frames / rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 120000 });
  await sleep(600);
  return { ctx, page, errors };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(800);
  await blur(page);
}
const fullActive = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'BODY' }; const cs = getComputedStyle(a); return { el: a.getAttribute('data-testid') || a.tagName, markerId: a.getAttribute('data-marker-id'), label: (a.getAttribute('aria-label') || '').slice(0, 90), focusVisible: a.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor }; });
const markerFull = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => ({ id: m.getAttribute('data-marker-id'), time: m.getAttribute('data-marker-time'), label: m.getAttribute('aria-label') })));
async function emptyLanePoints(page) {
  return page.evaluate(() => { const pts = []; for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); for (const fx of [0.9, 0.75, 0.6, 0.45, 0.3]) { const x = r.left + r.width * fx; const y = r.top + r.height / 2; if (x <= 0 || x >= innerWidth - 20 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) { pts.push({ x, y, track: body.closest('[data-track-id]').getAttribute('data-track-id') }); break; } } } return pts; });
}

const ROWS = {
  async auth(browser, vp, key_) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    const r = {};
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 120000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labBadge = await page.getByText('Demo collection — no sign-in required').count();
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ path: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]') }));
    r.guardAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.screenshot({ path: path.join(outDir, `auth-guard-${key_}.png`) });
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false });
    r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 200) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } });
    r.tokenFakeBearer = { status: b.status(), body: (await b.text()).slice(0, 200) };
    r.tokenIssued = /token|signature|url/i.test(r.tokenNoHeader.body + r.tokenFakeBearer.body) && (r.tokenNoHeader.status === 200 || r.tokenFakeBearer.status === 200);
    await ctx.close(); return r;
  },
  async smoke(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = {};
    r.status = await page.getByTestId('arrangement-status').textContent();
    r.clips = await page.locator('[data-clip-id]').count();
    const pos = () => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
    r.pos0 = await pos();
    await page.keyboard.press('Space'); await sleep(900); r.posPlaying = await pos();
    r.rms = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.keyboard.press('Space'); await sleep(400); r.posPaused = await pos(); await sleep(500); r.posPaused2 = await pos();
    r.rmsAfterPause = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 90000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `export-${key_}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.shaExpected = r.wav.sha256 === SHA;
    r.errors = errors; await ctx.close();
    return r;
  },
  async markerEscape(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    const r = {};
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press('KeyM'); await sleep(500);
    r.editorOpen = await page.getByTestId('arrangement-marker-name-input').count();
    r.markersBefore = await markerFull(page);
    const pts = await emptyLanePoints(page); r.point = pts[0];
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
    await page.keyboard.press('Escape'); await sleep(450);
    r.menuAfter = await page.getByTestId('arrangement-grid-menu').count();
    r.markersAfter = await markerFull(page);
    r.final = await fullActive(page);
    r.newMarkerIds = r.markersAfter.map((m) => m.id).filter((id) => !r.markersBefore.some((b) => b.id === id));
    r.pass = r.final.el === 'arrangement-marker' && r.final.focusVisible === true && r.newMarkerIds.includes(r.final.markerId);
    await page.screenshot({ path: path.join(outDir, `marker-escape-${key_}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      try { R.rows[`${name}@${k}`] = await fn(browser, vp, k); } catch (e) { R.rows[`${name}@${k}`] = { error: String(e).slice(0, 600) }; }
      save();
      console.log(name, k, JSON.stringify(R.rows[`${name}@${k}`]).slice(0, 700));
    }
  }
  R.finished = new Date().toISOString(); save();
  await browser.close();
})();
