// C296 real-browser probe. node c296.mjs <base> <tag>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [BASE = 'http://127.0.0.1:5173', TAG = 'a'] = process.argv.slice(2);
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-296';
fs.mkdirSync(`${DIR}/shots`, { recursive: true });
fs.mkdirSync(`${DIR}/wav`, { recursive: true });
const out = { base: BASE, tag: TAG, at: new Date().toISOString(), vp: {} };
const tapScript = () => {
  const orig = AudioNode.prototype.connect;
  const taps = new WeakMap();
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    try {
      if (dest instanceof AudioDestinationNode && this.context instanceof AudioContext) {
        let an = taps.get(this.context);
        if (!an) { an = this.context.createAnalyser(); an.fftSize = 2048; taps.set(this.context, an); (window.__analysers = window.__analysers || []).push(an); }
        orig.call(this, an);
      }
    } catch {}
    return r;
  };
  window.__sampleRms = () => (window.__analysers || []).map((an) => {
    const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b);
    let s = 0, p = 0; for (const v of b) { s += v * v; p = Math.max(p, Math.abs(v)); }
    return { rms: Math.sqrt(s / b.length), peak: p, state: an.context.state };
  });
};
const status = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.trim() ?? null);
const waitReady = (p) => p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
const active = (p) => p.evaluate(() => {
  const a = document.activeElement; const cs = a ? getComputedStyle(a) : null;
  return { tag: a?.tagName, role: a?.getAttribute('role'), testid: a?.getAttribute('data-testid'), sourceId: a?.getAttribute('data-source-id'), selected: a?.getAttribute('aria-selected'), tabindex: a?.getAttribute('tabindex'), focusVisible: a?.matches(':focus-visible') ?? null, outlineWidth: cs?.outlineWidth, outlineStyle: cs?.outlineStyle, outlineColor: cs?.outlineColor, focusSource: document.documentElement.dataset.focusSource ?? null };
});
const selectedOption = (p) => p.evaluate(() => [...document.querySelectorAll('[role="option"][aria-selected="true"]')].map((o) => o.getAttribute('data-source-id')));
const clipCount = (p) => p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
const pos = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent.trim());
const productInfo = async (p) => { await p.waitForFunction(() => document.body && [...document.querySelectorAll('a')].some((a) => /^by /.test(a.textContent.trim())), undefined, { timeout: 60000 }).catch(() => {}); return productInfoRaw(p); };
const productInfoRaw = (p) => p.evaluate(() => {
  const links = [...document.querySelectorAll('a')].filter((a) => a.textContent.trim() === 'Try it in the Studio');
  const by = [...document.querySelectorAll('a')].find((a) => /^by /.test(a.textContent.trim()));
  const main = document.querySelector('main') || document.body;
  const buttons = [...main.querySelectorAll('button, a[role="button"]')].filter((b) => b.getClientRects().length).map((b) => (b.getAttribute('aria-label') || b.textContent).trim().replace(/\s+/g, ' '));
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; };
  const sidebar = by?.closest('.space-y-6');
  const sideKids = sidebar ? [...sidebar.children].map((c) => ({ tag: c.tagName, box: box(c) })) : [];
  const allLeaf = [...main.querySelectorAll('h1,h2,h3,p,button,a,span,li')].filter((e) => e.getClientRects().length && e.children.length === 0 && e.textContent.trim()).map((e) => ({ t: e.textContent.trim().slice(0, 40), y: Math.round(box(e).y), x: Math.round(box(e).x) }));
  return {
    linkCount: links.length,
    links: links.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), color: getComputedStyle(a).color, box: box(a), testid: a.getAttribute('data-testid'), pBox: box(a.parentElement) })),
    byText: by?.textContent.trim(), byColor: by ? getComputedStyle(by).color : null,
    buttons, sidebarBox: box(sidebar), sideKids, allLeaf,
    bodyLines: document.body.innerText.split('\n').map((l) => l.trim()).filter(Boolean),
  };
});
const linesOutsideTimeline = (p) => p.evaluate(() => {
  const tl = document.querySelector('[data-testid="arrangement-timeline"]') || document.querySelector('[data-testid*="arrangement-lanes"]');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const lines = new Set(); let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement; if (!el || !n.textContent.trim()) continue;
    if (tl && tl.contains(el)) continue;
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    if (el.closest('.sr-only')) continue;
    lines.add(`${Math.round(r.y)}|${n.textContent.trim().slice(0, 60)}`);
  }
  return { hasTimelineSel: !!tl, count: lines.size, lines: [...lines].sort() };
});
const parseWav = (file) => {
  const b = fs.readFileSync(file);
  const fmtIdx = b.indexOf('fmt '); const dataIdx = b.indexOf('data');
  const fmtTag = b.readUInt16LE(fmtIdx + 8), ch = b.readUInt16LE(fmtIdx + 10), sr = b.readUInt32LE(fmtIdx + 12), bits = b.readUInt16LE(fmtIdx + 22);
  const dataLen = b.readUInt32LE(dataIdx + 4); const bps = bits / 8; const frames = Math.floor(Math.min(dataLen, b.length - dataIdx - 8) / (ch * bps));
  const rd = (o) => bits === 16 ? b.readInt16LE(o) / 32768 : bits === 24 ? b.readIntLE(o, 3) / 8388608 : (bits === 32 && fmtTag === 3) ? b.readFloatLE(o) : b.readInt32LE(o) / 2147483648;
  let s2 = 0, n2 = 0, peak = 0, sAll = 0, nz = 0, nonFinite = 0, firstNZ = -1;
  for (let i = 0; i < frames; i++) for (let c = 0; c < ch; c++) {
    const v = rd(dataIdx + 8 + (i * ch + c) * bps);
    if (!Number.isFinite(v)) nonFinite++;
    if (v !== 0) { nz++; if (firstNZ < 0) firstNZ = i; }
    peak = Math.max(peak, Math.abs(v)); sAll += v * v;
    if (i < 2 * sr) { s2 += v * v; n2++; }
  }
  return { bytes: b.length, riff: b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WAVE', riffSizeOk: b.readUInt32LE(4) + 8 === b.length, dataLenOk: dataIdx + 8 + dataLen === b.length, fmtTag, ch, sr, bits, frames, duration: frames / sr, rmsFirst2s: Math.sqrt(s2 / n2), rmsAll: Math.sqrt(sAll / (frames * ch)), peak, nonzeroFrac: nz / (frames * ch), firstNonzeroFrame: firstNZ, nonFinite };
};

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
// warm-up (L38): one untimed load each
{
  const ctx = await browser.newContext(); const p = await ctx.newPage();
  for (const u of ['/products/middle-east', '/products/harbour-lights', '/products/door-slams', '/studio-lab', '/studio-lab?preview=middle-east', '/']) { await p.goto(BASE + u, { waitUntil: 'networkidle', timeout: 180000 }).catch(() => {}); }
  await ctx.close();
}
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = { errors: {}, console: {} }; out.vp[k] = r;
  const mk = async (row) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
    await ctx.addInitScript(tapScript);
    const p = await ctx.newPage();
    r.errors[row] = []; r.console[row] = [];
    p.on('pageerror', (e) => r.errors[row].push(String(e).slice(0, 300)));
    p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') r.console[row].push(`${m.type()}: ${m.text().slice(0, 200)}`); });
    return { ctx, p };
  };
  // B-LINK + screen budget
  {
    const { ctx, p } = await mk('B-LINK');
    r.storage0 = await ctx.storageState();
    await p.goto(`${BASE}/products/middle-east`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    r.me = await productInfo(p);
    await p.screenshot({ path: `${DIR}/shots/${TAG}-product-middle-east-${k}.png` });
    await p.screenshot({ path: `${DIR}/shots/${TAG}-product-middle-east-full-${k}.png`, fullPage: true });
    await p.goto(`${BASE}/products/harbour-lights`, { waitUntil: 'networkidle' });
    r.hl = (await productInfo(p)).linkCount;
    await p.screenshot({ path: `${DIR}/shots/${TAG}-product-harbour-lights-${k}.png` });
    await p.goto(`${BASE}/products/door-slams`, { waitUntil: 'networkidle' });
    const ds = await productInfo(p); r.ds = ds.linkCount; r.dsTitleSeen = ds.bodyLines.slice(0, 40).join(' | ').slice(0, 400);
    await ctx.close();
  }
  // plain /studio-lab
  {
    const { ctx, p } = await mk('PLAIN');
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
    await waitReady(p); await p.waitForTimeout(800);
    r.plain = { status: await status(p), active: await active(p), selected: await selectedOption(p), clips: await clipCount(p), lines: await linesOutsideTimeline(p), url: p.url() };
    await p.screenshot({ path: `${DIR}/shots/${TAG}-studio-lab-plain-${k}.png` });
    await ctx.close();
  }
  if (TAG === 'a') {
    // B-LINK-KEYBOARD
    {
      const { ctx, p } = await mk('B-LINK-KEYBOARD');
      await p.goto(`${BASE}/products/middle-east`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);
      let tabs = 0; let found = false;
      for (; tabs < 80; tabs++) {
        await p.keyboard.press('Tab');
        if (await p.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'product-studio-link')) { found = true; tabs++; break; }
      }
      const kb = { found, tabs };
      if (found) {
        kb.link = await active(p);
        kb.linkOutlineBox = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { offset: cs.outlineOffset, w: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor, boxShadow: cs.boxShadow }; });
        await p.screenshot({ path: `${DIR}/shots/${TAG}-kb-link-focus-${k}.png`, clip: await p.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 20), width: r.width + 60, height: r.height + 40 }; }) });
        await p.keyboard.press('Enter');
        await p.waitForURL('**/studio-lab?preview=middle-east', { timeout: 60000 });
        kb.url = p.url();
        await waitReady(p); await p.waitForTimeout(600);
        kb.landingActive = await active(p);
        await p.screenshot({ path: `${DIR}/shots/${TAG}-kb-landing-${k}.png` });
      }
      r.kb = kb;
      await ctx.close();
    }
    // B-LANDING / B-ADD-PLAY / B-JOURNEY (mouse)
    {
      const { ctx, p } = await mk('B-JOURNEY');
      const j = {}; r.journey = j;
      await p.goto(`${BASE}/products/middle-east`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${DIR}/shots/${TAG}-journey-1-product-${k}.png` });
      const link = p.getByRole('link', { name: 'Try it in the Studio' });
      j.linkCount = await link.count();
      await link.click();
      await p.waitForURL('**/studio-lab?preview=middle-east', { timeout: 60000 });
      j.url = p.url();
      await waitReady(p); await p.waitForTimeout(800);
      j.active = await active(p);
      j.optionInList = await p.evaluate(() => {
        const o = document.activeElement; const list = document.querySelector('[data-testid="arrangement-library-list"]');
        if (!o || !list) return null; const a = o.getBoundingClientRect(), b = list.getBoundingClientRect();
        const vh = innerHeight, vw = innerWidth;
        return { opt: [a.top, a.bottom, a.left, a.right], list: [b.top, b.bottom, b.left, b.right], inside: a.top >= b.top - 0.5 && a.bottom <= b.bottom + 0.5 && a.left >= b.left - 0.5 && a.right <= b.right + 0.5, inViewport: a.top >= 0 && a.bottom <= vh && a.left >= 0 && a.right <= vw };
      });
      j.clips0 = await clipCount(p);
      j.status0 = await status(p);
      j.selected0 = await selectedOption(p);
      await p.screenshot({ path: `${DIR}/shots/${TAG}-journey-2-landing-${k}.png` });
      await p.keyboard.press('Enter');
      await p.waitForTimeout(1500);
      j.clips1 = await clipCount(p);
      j.clipInfo = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.getAttribute('data-clip-id'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id'), label: c.getAttribute('aria-label') })));
      j.status1 = await status(p);
      await p.screenshot({ path: `${DIR}/shots/${TAG}-journey-3-added-${k}.png` });
      await p.keyboard.press('Control+z'); await p.waitForTimeout(600);
      j.clipsUndo = await clipCount(p); j.statusUndo = await status(p);
      await p.keyboard.press('Control+Shift+z'); await p.waitForTimeout(600);
      j.clipsRedo = await clipCount(p); j.statusRedo = await status(p);
      j.activeBeforePlay = await active(p);
      j.rmsBefore = await p.evaluate(() => window.__sampleRms());
      j.pos0 = await pos(p);
      await p.keyboard.press('Space');
      const t0 = Date.now(); const samples = [];
      for (let i = 0; i < 5; i++) { await p.waitForTimeout(250); samples.push(await p.evaluate(() => window.__sampleRms())); }
      await p.waitForTimeout(Math.max(0, 1500 - (Date.now() - t0)));
      j.pos1 = await pos(p); j.tPos1 = Date.now() - t0;
      j.rmsPlaying = samples;
      await p.screenshot({ path: `${DIR}/shots/${TAG}-journey-4-playing-${k}.png` });
      await p.keyboard.press('Space'); await p.waitForTimeout(600);
      j.pos2 = await pos(p);
      j.rmsAfterStop = await p.evaluate(() => window.__sampleRms());
      try {
        await p.getByRole('button', { name: /^Export/ }).first().click();
        await p.waitForTimeout(800);
        await p.screenshot({ path: `${DIR}/shots/${TAG}-journey-5-export-dialog-${k}.png` });
        j.dialogButtons = await p.getByRole('dialog').getByRole('button').allTextContents();
        const wavBtn = p.getByRole('dialog').getByRole('button', { name: /WAV/ }).first();
        const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 180000 }), wavBtn.click()]);
        const file = `${DIR}/wav/journey-${TAG}-${k}.wav`;
        await dl.saveAs(file);
        j.exportName = dl.suggestedFilename();
        j.wav = parseWav(file);
        await p.waitForTimeout(500);
        j.exportStatus = await status(p);
        await p.screenshot({ path: `${DIR}/shots/${TAG}-journey-6-exported-${k}.png` });
        if (await p.getByRole('dialog').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
      } catch (e) { j.exportError = String(e).slice(0, 300); }
      const exit = p.locator('[data-testid="arrangement-exit"]');
      j.exitCount = await exit.count(); j.exitText = j.exitCount ? (await exit.textContent()).trim() : null; j.exitHref = j.exitCount ? await exit.getAttribute('href') : null;
      if (j.exitCount) {
        p.once('dialog', (d) => { j.beforeUnloadDialog = d.type(); d.accept(); });
        await exit.click(); await p.waitForTimeout(2500);
        j.exitUrl = p.url();
      }
      await ctx.close();
    }
    // Cold direct load
    {
      const { ctx, p } = await mk('COLD');
      await p.goto(`${BASE}/studio-lab?preview=middle-east`, { waitUntil: 'networkidle' });
      await waitReady(p); await p.waitForTimeout(800);
      r.cold = { active: await active(p), selected: await selectedOption(p), status: await status(p), clips: await clipCount(p) };
      await p.screenshot({ path: `${DIR}/shots/${TAG}-cold-preview-${k}.png` });
      await ctx.close();
    }
    // B-DEEP-NEGATIVE
    r.neg = {};
    for (const q of ['', '?preview=harbour-lights', '?preview=__proto__', '?preview=']) {
      const row = `NEG${q}`;
      const { ctx, p } = await mk(row);
      await p.goto(`${BASE}/studio-lab${q}`, { waitUntil: 'networkidle' });
      await waitReady(p); await p.waitForTimeout(800);
      r.neg[q || 'plain'] = { active: await active(p), selected: await selectedOption(p), status: await status(p), clips: await clipCount(p) };
      await ctx.close();
    }
  }
  r.auth = {};
}
// B-NARROW (both tags; HEAD for comparison)
{
  const r = { errors: [], console: [] }; out.narrow = r;
  const ctx = await browser.newContext({ viewport: { width: 860, height: 700 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => r.errors.push(String(e).slice(0, 300)));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') r.console.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  await p.goto(`${BASE}/studio-lab?preview=middle-east`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  r.narrowText = await p.evaluate(() => document.body.innerText.includes('The Studio works on a computer'));
  r.narrowActive = await active(p);
  r.focusedOptions = await p.evaluate(() => document.activeElement?.getAttribute('role') === 'option');
  await p.screenshot({ path: `${DIR}/shots/${TAG}-narrow-860.png` });
  await p.setViewportSize({ width: 1280, height: 720 });
  await p.waitForTimeout(2500);
  r.wideActive = await active(p);
  r.wideStatus = await status(p);
  await p.screenshot({ path: `${DIR}/shots/${TAG}-narrow-widened-1280.png` });
  await ctx.close();
}
fs.writeFileSync(`${DIR}/probe-${TAG}.json`, JSON.stringify(out, null, 1));
// G296-AUTH
if (false) {
  const a = {}; out.auth = a;
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    a.cookies0 = (await ctx.cookies()).length;
    const p = await ctx.newPage();
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
    await waitReady(p);
    a.lab = await p.evaluate(() => ({
      authUser: localStorage.getItem('auth_user'), keys: Object.keys(localStorage),
      badge: [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /demo/i.test(e.textContent) && e.getClientRects().length).map((e) => e.textContent.trim()).slice(0, 4),
      workspace: !!document.querySelector('[data-testid="arrangement-library-list"]'), signIn: document.body.innerText.includes('Sign in required'),
    }));
    await p.screenshot({ path: `${DIR}/shots/auth-lab-1440.png` });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(4000);
    a.legacy = await p.evaluate(() => ({ url: location.href, signIn: document.body.innerText.includes('Sign in required'), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
    await p.screenshot({ path: `${DIR}/shots/auth-legacy-1440.png` });
    a.token = await p.evaluate(async () => {
      const x = await fetch('/api/studio-token?product=middle-east&file=stem-01.wav'); const t = await x.text();
      return { status: x.status, hasToken: /token"\s*:\s*"[A-Za-z0-9._-]{10,}/.test(t), body: t.slice(0, 200) };
    });
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${DIR}/probe-${TAG}.json`, JSON.stringify(out, null, 1));
console.log('ok', TAG);
