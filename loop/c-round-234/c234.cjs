// C round 234: SABA-B-11a stage 1 browser verification. usage: node c234.cjs <outDir> [rowFilter]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c234.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEED = (title) => ` Tempo 120 BPM from “${title}” — bars ruler on. Grid only: audio is not stretched.`;
const SNAPON = ' Snap on — grid 1/4 (G)';

const INIT = () => {
  window.__starts = [];
  const orig = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (when, offset, duration) {
    try { window.__starts.push({ when, offset, duration, ctxTime: this.context.currentTime, rate: this.context.sampleRate, bufDur: this.buffer ? this.buffer.duration : null, offline: this.context instanceof OfflineAudioContext }); } catch (e) {}
    return orig.apply(this, arguments);
  };
};

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Add/.test(x.textContent.trim())); return b && !b.disabled; }, undefined, { timeout: 120000 });
  await sleep(800);
  return { ctx, page, errors };
}
const state = (page) => page.evaluate(() => {
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const r = s && s.getBoundingClientRect();
  return {
    snap: g && g.getAttribute('data-snap'), division: g && g.getAttribute('data-grid-division'), gridSeconds: g && g.getAttribute('data-grid-seconds'),
    tempo: (document.querySelector('[data-testid="arrangement-tempo-input"]') || {}).value ?? null,
    barsMarks: document.querySelectorAll('[data-testid="arrangement-bars-mark"]').length,
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.getAttribute('data-clip-id'), start: c.getAttribute('data-clip-start'), kind: c.getAttribute('data-clip-kind') })),
    status: s && s.textContent, statusHeight: r && r.height, statusScroll: s && s.scrollWidth, statusClient: s && s.clientWidth, statusWS: s && getComputedStyle(s).whiteSpace,
    has120: document.body.innerText.includes('120 BPM'), has120any: /\b120\b/.test(document.body.innerText),
  };
});
async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(700);
}
async function addEnter(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().focus();
  await page.keyboard.press('Enter');
  await sleep(700);
}
const title = (page, id) => page.evaluate((i) => { const el = document.querySelector(`[data-source-id="${i}"]`); return el ? (el.getAttribute('data-source-title') || el.getAttribute('aria-label') || el.textContent) : null; }, id);
async function setTempo(page, v) {
  const t = page.locator('[data-testid="arrangement-tempo-input"]');
  await t.click(); await t.fill(v); await page.keyboard.press('Enter'); await sleep(400);
}
const blurKey = async (page, k) => { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press(k); await sleep(300); };

function wavInfo(buf) {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  let s = 0; let n = 0; let peak = 0; let clipped = 0; let firstNz = -1;
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a; if (a >= 0.999) clipped += 1; if (firstNz < 0 && a > 1e-4) firstNz = f;
  }
  return { rate, bits, ch, frames, seconds: frames / rate, rmsDb: n ? +(10 * Math.log10(s / n || 1e-20)).toFixed(2) : null, peak: +peak.toFixed(4), clipped, firstNonZeroSec: firstNz >= 0 ? firstNz / rate : null, sha256: crypto.createHash('sha256').update(buf).digest('hex'), pcmSha256: crypto.createHash('sha256').update(buf.subarray(dataOff, dataOff + dataSize)).digest('hex') };
}
async function exportWav(page, tag) {
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog'); await dlg.waitFor();
  const dlP = page.waitForEvent('download', { timeout: 90000 });
  await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
  const dl = await dlP;
  await dlg.getByText(/^WAV created:/).waitFor({ timeout: 60000 });
  const created = await dlg.getByText(/^WAV created:/).textContent();
  const file = path.join(outDir, `export-${tag}.wav`);
  await dl.saveAs(file);
  const info = wavInfo(fs.readFileSync(file));
  fs.unlinkSync(file);
  await dlg.getByRole('button', { name: 'Done', exact: true }).click();
  await sleep(400);
  return { created, ...info };
}
async function dragClip(page, dxSec, alt) {
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const b = await clip.boundingBox();
  const pps = b.width / 16;
  const x = b.x + b.width / 2; const y = b.y + 6;
  await page.mouse.move(x, y); await page.mouse.down();
  if (alt) await page.keyboard.down('Alt');
  for (let i = 1; i <= 10; i += 1) await page.mouse.move(x + (dxSec * pps * i) / 10, y);
  await page.mouse.up(); if (alt) await page.keyboard.up('Alt');
  await sleep(400);
  return { pps, start: await clip.getAttribute('data-clip-start') };
}
const inventory = (page) => page.evaluate(() => {
  const rows = [];
  const vis = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
    if (!own || el.closest('.sr-only') || !vis(el)) continue;
    const inTimeline = !!el.closest('[data-testid="arrangement-timeline-scroller"]');
    const region = (el.closest('[data-testid]') || {}).getAttribute ? el.closest('[data-testid]').getAttribute('data-testid') : el.tagName;
    rows.push({ region, text: own.slice(0, 140), inTimeline, top: Math.round(el.getBoundingClientRect().top) });
  }
  return rows;
});

const ROWS = {
  async seedStem(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    const r = { before: await state(page) };
    r.inventoryEmpty = await inventory(page);
    await page.screenshot({ path: path.join(outDir, `empty-${key}.png`) });
    await addBtn(page, 'demo-stem-pulse');
    r.after = await state(page);
    r.inventoryAfter = await inventory(page);
    await page.screenshot({ path: path.join(outDir, `seeded-stem-${key}.png`) });
    const t = 'ღამის პულსი · პულსი';
    r.statusExpectedSuffix = SEED(t) + SNAPON;
    r.statusOk = !!r.after.status && r.after.status.endsWith(r.statusExpectedSuffix) && /added to the Music track at 00:00\.000\.$/.test(r.after.status.slice(0, -r.statusExpectedSuffix.length));
    r.placement = r.after.status && r.after.status.slice(0, -r.statusExpectedSuffix.length);
    // LAB-SMOKE: play / pause in a seeded project
    const startsBefore = await page.evaluate(() => window.__starts.length);
    const clockSel = '[data-testid="arrangement-transport-clock"], [data-testid="arrangement-clock"]';
    const playBtn = page.getByRole('button', { name: /^Play/ }).first();
    r.playLabel = await playBtn.getAttribute('aria-label').catch(() => null);
    await blurKey(page, 'Space');
    await sleep(1500);
    r.playing = await page.evaluate(() => ({ starts: window.__starts.filter((s) => !s.offline), pressed: [...document.querySelectorAll('button')].filter((b) => /^(Pause|Stop)/.test((b.getAttribute('aria-label') || b.textContent || '').trim())).map((b) => b.getAttribute('aria-label') || b.textContent.trim()), playhead: (document.querySelector('[data-testid="arrangement-playhead"]') || {}).style ? document.querySelector('[data-testid="arrangement-playhead"]').getAttribute('style') : null }));
    r.playing.newStarts = r.playing.starts.length - startsBefore;
    await blurKey(page, 'Space');
    await sleep(600);
    r.afterPause = await page.evaluate(() => ({ pauseButtons: [...document.querySelectorAll('button')].filter((b) => /^Pause/.test((b.getAttribute('aria-label') || b.textContent || '').trim())).length, playhead: document.querySelector('[data-testid="arrangement-playhead"]') ? document.querySelector('[data-testid="arrangement-playhead"]').getAttribute('style') : null }));
    r.stateAfterPlay = await state(page);
    r.errors = errors;
    await ctx.close();
    delete r.playing.starts_full;
    return r;
  },
  async seedEnter(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addEnter(page, 'demo-synth-mix');
    const r = { after: await state(page) };
    const t = 'ღამის პულსი · სრული მიქსი';
    r.statusExpectedSuffix = SEED(t) + SNAPON;
    r.statusOk = !!r.after.status && r.after.status.endsWith(r.statusExpectedSuffix) && /added to the Music track at 00:00\.000\.$/.test(r.after.status.slice(0, -r.statusExpectedSuffix.length));
    r.fit = { height: r.after.statusHeight, fits: r.after.statusScroll <= r.after.statusClient };
    await page.screenshot({ path: path.join(outDir, `seeded-enter-${key}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async noBpm(browser, vp, key) {
    const out = {};
    for (const [name, ids] of [['softImpact', ['demo-soft-impact']], ['middleEast', ['demo-middle-east']], ['slowRiseHero', ['demo-slow-rise', 'demo-hero-music']]]) {
      const { ctx, page, errors } = await open(browser, vp);
      for (const id of ids) await addBtn(page, id);
      await sleep(800);
      out[name] = { after: await state(page), errors };
      await page.screenshot({ path: path.join(outDir, `nobpm-${name}-${key}.png`) });
      await ctx.close();
    }
    return out;
  },
  async mixed(browser, vp) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-soft-impact');
    const r = { afterSfx: await state(page) };
    await addBtn(page, 'demo-stem-bass');
    r.afterBass = await state(page);
    r.errors = errors; await ctx.close(); return r;
  },
  async userWins(browser, vp) {
    const out = {};
    { const { ctx, page, errors } = await open(browser, vp); await setTempo(page, '90'); out.a_typed = await state(page); await addBtn(page, 'demo-stem-pulse'); out.a = { after: await state(page), errors }; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await setTempo(page, '90'); await setTempo(page, ''); out.b_cleared = await state(page); await addBtn(page, 'demo-stem-pulse'); out.b = { after: await state(page), errors }; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); const t = page.locator('[data-testid="arrangement-tempo-input"]'); await t.click(); await page.keyboard.press('Enter'); await sleep(300); await page.keyboard.press('Tab'); await sleep(200); out.c_touched = await state(page); await addBtn(page, 'demo-stem-pulse'); out.c = { after: await state(page), errors }; await ctx.close(); }
    return out;
  },
  async hand(browser, vp) {
    const out = {};
    { const { ctx, page, errors } = await open(browser, vp); await page.selectOption('[data-testid="arrangement-grid-division"]', '0.5'); await sleep(300); out.a_pre = await state(page); await addBtn(page, 'demo-stem-pulse'); out.a = { after: await state(page), errors }; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await blurKey(page, 'g'); const mid = await state(page); await blurKey(page, 'g'); out.b_mid = mid; out.b_pre = await state(page); await addBtn(page, 'demo-stem-pulse'); out.b = { after: await state(page), errors }; await ctx.close(); }
    return out;
  },
  async oneshot(browser, vp) {
    const out = {};
    { const { ctx, page, errors } = await open(browser, vp); await addBtn(page, 'demo-stem-pulse'); out.a_seeded = await state(page); await setTempo(page, '100'); out.a_100 = await state(page); await addBtn(page, 'demo-stem-lead'); out.a = { after: await state(page), errors }; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await addBtn(page, 'demo-stem-pulse'); out.b_seeded = await state(page); await page.keyboard.press('Control+z'); await sleep(600); out.b = { after: await state(page), errors }; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await addBtn(page, 'demo-stem-pulse'); await page.locator('[data-clip-kind="audio"]').first().click({ position: { x: 20, y: 6 } }); await sleep(200); await page.keyboard.press('Delete'); await sleep(500); out.c_deleted = await state(page); await addBtn(page, 'demo-soft-impact'); out.c = { after: await state(page), errors }; await ctx.close(); }
    return out;
  },
  async snap(browser, vp) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { seeded: await state(page) };
    r.drag07 = await dragClip(page, 0.7, false);
    r.altDrag03 = await dragClip(page, 0.3, true);
    // small drag: F1 jump probe (0.2 s from 0.8)
    r.drag02 = await dragClip(page, 0.2, false);
    // grid select after seed: musical options listed, seconds still works
    r.options = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-grid-division"] option')].map((o) => o.value));
    await page.selectOption('[data-testid="arrangement-grid-division"]', '1');
    await sleep(300);
    r.afterSeconds = await state(page);
    r.metronome = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /metronome/i.test((x.getAttribute('aria-label') || '') + (x.getAttribute('title') || ''))); return b ? { disabled: b.disabled, label: b.getAttribute('aria-label'), title: b.getAttribute('title') } : null; });
    r.errors = errors; await ctx.close(); return r;
  },
  async exportRow(browser, vp) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { seeded: await state(page) };
    r.wavSeeded = await exportWav(page, 'seeded');
    await setTempo(page, '');
    r.cleared = await state(page);
    r.wavCleared = await exportWav(page, 'cleared');
    r.identical = r.wavSeeded.sha256 === r.wavCleared.sha256;
    r.offlineStarts = await page.evaluate(() => window.__starts.filter((s) => s.offline));
    r.errors = errors; await ctx.close(); return r;
  },
  async budget(browser, vp, key) {
    const out = {};
    for (const id of ['demo-soft-impact', 'demo-stem-pulse']) {
      const { ctx, page } = await open(browser, vp);
      await addBtn(page, id);
      await page.mouse.click(5, 5); await sleep(300);
      out[id] = (await inventory(page)).filter((x) => !x.inTimeline);
      await page.screenshot({ path: path.join(outDir, `budget-${id}-${key}.png`) });
      await ctx.close();
    }
    const a = out['demo-soft-impact'].map((x) => `${x.region}|${x.text}`); const b = out['demo-stem-pulse'].map((x) => `${x.region}|${x.text}`);
    out.onlyInSeeded = b.filter((x) => !a.includes(x)); out.onlyInNoBpm = a.filter((x) => !b.includes(x));
    out.counts = { noBpm: a.length, seeded: b.length };
    delete out['demo-soft-impact']; delete out['demo-stem-pulse'];
    return out;
  },
  async auth(browser, vp, key) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    const r = {};
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ path: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') }));
    await page.screenshot({ path: path.join(outDir, `auth-guard-${key}.png`) });
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false });
    const b = await ctx.request.get(api, { headers: { Authorization: 'Bearer fake.c234' }, failOnStatusCode: false });
    r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    await ctx.close(); return r;
  },
};

(async () => {
  const browser = await chromium.launch();
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${key}`] = await fn(browser, vp, key); } catch (e) { R.rows[`${name}@${key}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${key}`].ms = Date.now() - t0;
      save();
      console.log(name, key, 'done', Date.now() - t0);
    }
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
})();
