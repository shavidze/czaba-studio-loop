// C302 browser rows: N-TITLE-H1, N-RETIRED-TEXT, N-HOME, N-CHECKOUT, N-NAV, N-NARROW, N-EXPORT-NAME, N-JOURNEY, RV-EN.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const BASE = 'http://127.0.0.1:5173'; const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/out/b3/name'; const SH = path.join(DIR, 'shots');
const RETIRED = /Personal Mixdown|Studio Lab|· Workspace|Demo workspace/;
const GEO = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
const NOISE = /cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|Failed to fetch|firebase|NetworkError/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function axNames(page) {
  const cdp = await page.context().newCDPSession(page); const { nodes } = await cdp.send('Accessibility.getFullAXTree'); await cdp.detach();
  return nodes.filter((n) => !n.ignored).map((n) => (n.name && n.name.value) || '').filter(Boolean);
}
async function retired(page, state) {
  const text = await page.evaluate(() => document.body.innerText); const names = await axNames(page); const title = await page.title();
  const hits = [];
  for (const [src, arr] of [['innerText', text.split('\n')], ['ax', names], ['title', [title]]]) for (const s of arr) if (RETIRED.test(s)) hits.push(`${src}: ${s.slice(0, 120)}`);
  const geo = [];
  for (const [src, arr] of [['innerText', text.split('\n')], ['ax', names]]) for (const s of arr) if (GEO.test(s)) geo.push(`${src}: ${s.slice(0, 80)}`);
  return { state, title, hits, geo, mixdownTestimonial: /The Mixdown Studio/.test(text), axCount: names.length };
}
async function waitReady(p) { await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await sleep(600); }
function wavInfo(file) {
  const buf = fs.readFileSync(file); const fmt = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), ch: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34), audioFormat: buf.readUInt16LE(20) };
  let o = 12; let dataLen = 0; while (o < buf.length - 8) { const id = buf.toString('ascii', o, o + 4); const len = buf.readUInt32LE(o + 4); if (id === 'data') { dataLen = len; break; } o += 8 + len; }
  const bps = fmt.bits / 8; const frames = dataLen / (fmt.ch * bps); let peak = 0, nz = 0, n = 0, nan = 0, sumsq = 0;
  for (let i = o + 8; i + bps <= o + 8 + dataLen; i += bps) { let v; if (fmt.audioFormat === 3) v = buf.readFloatLE(i); else if (fmt.bits === 16) v = buf.readInt16LE(i) / 32768; else if (fmt.bits === 24) v = buf.readIntLE(i, 3) / 8388608; else v = buf.readInt32LE(i) / 2147483648; if (!Number.isFinite(v)) { nan++; continue; } const a = Math.abs(v); if (a > peak) peak = a; if (a > 0) nz++; sumsq += v * v; n++; }
  return { ...fmt, bytes: buf.length, dataLen, dataLenMatches: o + 8 + dataLen === buf.length || o + 8 + dataLen <= buf.length, frames, durationS: frames / fmt.rate, peak, rmsDb: 20 * Math.log10(Math.sqrt(sumsq / Math.max(1, n)) || 1e-12), nonzeroFrac: nz / Math.max(1, n), nan };
}
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = { at: new Date().toISOString(), vp: {} };
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(`${BASE}/studio-lab`).catch(() => {}); await waitReady(p).catch(() => {}); await c.close(); }
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`; const R = { retired: [] }; out.vp[k] = R;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); p.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text().slice(0, 160)}`); });
    // Journey 1: home showcase
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await sleep(1000);
    const h2 = p.locator('h2').filter({ hasText: 'CZABA Studio' }).first(); await h2.scrollIntoViewIfNeeded(); await sleep(1500);
    R.home = await h2.evaluate((e) => { const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight); const r = e.getBoundingClientRect(); const sec = e.closest('section'); const mock = [...(sec || document).querySelectorAll('span')].filter((s) => s.children.length === 0 && s.textContent.trim() === 'CZABA Studio'); return { text: e.textContent.trim(), glow: e.querySelector('.text-glow')?.textContent, lines: Math.round(r.height / lh), height: r.height, lh, scrollW: e.scrollWidth, clientW: e.clientWidth, mockTitles: mock.length, mockVisible: mock.some((s) => s.getBoundingClientRect().width > 0) }; });
    R.retired.push(await retired(p, 'home-showcase'));
    await p.screenshot({ path: path.join(SH, `j1-home-${k}.png`) });
    // Journey 2: nav Studio
    await p.evaluate(() => scrollTo(0, 0)); await sleep(400);
    const nav = p.locator('header a[href="/studio-lab"]').filter({ visible: true }).first();
    R.nav = { text: (await nav.textContent())?.trim(), href: await nav.getAttribute('href') };
    await p.screenshot({ path: path.join(SH, `j2-nav-${k}.png`) });
    await nav.click(); await p.waitForURL(/studio-lab/, { timeout: 30000 }); await waitReady(p);
    // Journey 3 / N-TITLE-H1
    R.title = await p.title();
    R.h1 = await p.evaluate(() => { const h = document.querySelector('h1'); const cs = getComputedStyle(h); const hr = h.getBoundingClientRect(); const ex = document.querySelector('[data-testid="arrangement-exit"]').getBoundingClientRect(); const badge = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === 'Demo collection — no sign-in required'); const br = badge?.getBoundingClientRect(); const box = (r) => r && { x: r.x, y: r.y, w: r.width, h: r.height, top: r.top, right: r.right, bottom: r.bottom }; const ov = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; const mid = (r) => r && r.top + r.height / 2; return { text: h.textContent, children: h.children.length, lh: parseFloat(cs.lineHeight), h1: box(hr), exit: box(ex), badge: box(br), badgeText: badge?.textContent.trim(), overlaps: [ov(hr, ex), ov(hr, br), ov(ex, br)].filter(Boolean).length, mids: [mid(hr), mid(ex), mid(br)] }; });
    { const cdp = await ctx.newCDPSession(p); const { root } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'h1' }); const ax = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }); R.h1.axName = ax.nodes[0]?.name?.value; R.h1.axRole = ax.nodes[0]?.role?.value; await cdp.detach(); }
    R.retired.push(await retired(p, 'studio-empty'));
    await p.screenshot({ path: path.join(SH, `j3-studio-${k}.png`) });
    // Journey 4: Enter adds a clip
    const opt = p.locator('[role=option][data-source-id="demo-stem-pulse"]'); await opt.focus(); await p.keyboard.press('Enter'); await sleep(1200);
    R.clips = await p.locator('[data-clip-kind="audio"]').count();
    R.retired.push(await retired(p, 'studio-clip-added'));
    await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const clk = () => p.evaluate(() => ({ centre: document.querySelector('[data-testid="arrangement-transport-centre"]')?.innerText.replace(/\s+/g, ' '), state: document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent, ph: document.querySelector('[data-testid="arrangement-playhead"]')?.getBoundingClientRect().x }));
    R.play = { before: await clk() }; await p.keyboard.press('Space'); await sleep(1300); R.play.during = await clk();
    await p.screenshot({ path: path.join(SH, `j4-playing-${k}.png`) });
    await p.getByRole('button', { name: /^Stop/ }).first().click(); await sleep(500); R.play.after = await clk();
    // ? sheet
    await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur()); await p.keyboard.press('Shift+Slash'); await sleep(600);
    R.sheetOpen = await p.getByRole('dialog').count(); R.retired.push(await retired(p, 'shortcut-sheet')); await p.keyboard.press('Escape'); await sleep(400);
    // Export dialog + WAV
    await p.getByRole('button', { name: 'Export', exact: true }).first().click(); const dlg = p.getByRole('dialog'); await dlg.waitFor(); await sleep(400);
    R.retired.push(await retired(p, 'export-dialog')); await p.screenshot({ path: path.join(SH, `j5-export-dialog-${k}.png`) });
    const dlP = p.waitForEvent('download', { timeout: 120000 }); await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click(); const dl = await dlP;
    const f = path.join('/tmp', `c302-${k}.wav`); await dl.saveAs(f); R.export = { suggested: dl.suggestedFilename(), wav: wavInfo(f) }; fs.unlinkSync(f);
    await sleep(800); await p.screenshot({ path: path.join(SH, `j5-export-done-${k}.png`) });
    if (await p.getByRole('dialog').count()) { await p.keyboard.press('Escape'); await sleep(400); }
    // RV-EN on studio
    R.rvEn = (await retired(p, 'rv-en')).geo;
    // Journey 6: back to /
    await p.locator('[data-testid="arrangement-exit"]').click(); await p.waitForURL((u) => new URL(u).pathname === '/', { timeout: 30000 }); await sleep(800);
    R.back = p.url(); await p.screenshot({ path: path.join(SH, `j6-back-${k}.png`) });
    // checkout success
    await p.goto(`${BASE}/checkout/success`, { waitUntil: 'networkidle' }); await sleep(2000);
    R.checkout = await p.evaluate(() => { const lis = [...document.querySelectorAll('li, p, span')].filter((e) => e.children.length === 0 && /confirmation email|downloads are ready|anytime/.test(e.textContent)); return lis.map((e) => ({ t: e.textContent.trim(), overflow: e.scrollWidth > e.clientWidth + 1, w: e.getBoundingClientRect().width })); });
    R.retired.push(await retired(p, 'checkout-success')); await p.screenshot({ path: path.join(SH, `checkout-${k}.png`), fullPage: true });
    // product page (mock)
    await p.goto(`${BASE}/products/middle-east`, { waitUntil: 'networkidle' }); await sleep(1500);
    R.productH1 = (await p.locator('h1').first().textContent().catch(() => null))?.trim(); R.retired.push(await retired(p, 'product-middle-east'));
    R.errors = errs.filter((e) => !NOISE.test(e)); R.noiseCount = errs.length - R.errors.length; await ctx.close();
  }
  // N-HOME reduced motion 1440, N-HOME 390, N-NAV mobile 390, N-NARROW 390
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' }); const h2 = p.locator('h2').filter({ hasText: 'CZABA Studio' }).first(); await h2.scrollIntoViewIfNeeded(); await sleep(800);
    out.homeReduced = await h2.evaluate((e) => { const r = e.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(e).lineHeight); let op = 1; for (let x = e; x; x = x.parentElement) op *= Number(getComputedStyle(x).opacity); return { text: e.textContent.trim(), glow: e.querySelector('.text-glow')?.textContent, lines: Math.round(r.height / lh), overflow: e.scrollWidth > e.clientWidth, opacity: op }; });
    out.homeReduced.errors = errs; await p.screenshot({ path: path.join(SH, 'home-reduced-1440.png') }); await ctx.close(); }
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' }); const h2 = p.locator('h2').filter({ hasText: 'CZABA Studio' }).first(); await h2.scrollIntoViewIfNeeded(); await sleep(1500);
    out.home390 = await h2.evaluate((e) => { const r = e.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(e).lineHeight); const sec = e.closest('section'); return { text: e.textContent.trim(), glow: e.querySelector('.text-glow')?.textContent, lines: Math.round(r.height / lh), overflow: e.scrollWidth > e.clientWidth, mockTitle: [...sec.querySelectorAll('span')].filter((s) => s.children.length === 0 && s.textContent.trim() === 'CZABA Studio').length }; });
    await p.screenshot({ path: path.join(SH, 'home-390.png') });
    await p.evaluate(() => scrollTo(0, 0)); await sleep(300);
    const menuBtn = p.locator('header button[aria-label*="menu" i], header button[aria-expanded]').filter({ visible: true }).first(); await menuBtn.click().catch(() => {}); await sleep(700);
    const ml = p.locator('a[href="/studio-lab"]').filter({ visible: true }); out.nav390 = { count: await ml.count(), texts: await ml.allTextContents() };
    await p.screenshot({ path: path.join(SH, 'nav-mobile-390.png') });
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' }); await sleep(2500);
    out.narrow = await p.evaluate(() => ({ title: document.title, narrow: !!document.querySelector('[data-testid="studio-narrow-screen"]'), workspace: !!document.querySelector('[data-testid="arrangement-transport"]') }));
    out.narrow.retired = await retired(p, 'narrow'); out.narrow.errors = errs; await p.screenshot({ path: path.join(SH, 'narrow-390.png') }); await ctx.close(); }
  fs.writeFileSync(path.join(DIR, 'main.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
