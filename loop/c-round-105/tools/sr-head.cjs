// C round 105 browser rows (head copied from C round 104 sr104.cjs): SR-REPEAT-SPACE, SR-REGION-STABLE, SR-TEXT-REG, SR-REPEAT-FAILED-ROW, SR-DRAG-STREAM, BLOCKED-MOVE
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-105/out';
const SHOTS = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-105/shots';
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HYD = /hydrat|did not match|Text content does not match|server rendered/i;
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
const EMPTY = 'დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.';
const row = process.argv[2];
const VPS = process.argv[3] || '1280x720';
const VP = { width: +VPS.split('x')[0], height: +VPS.split('x')[1] };

async function session(abortHero) {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: VP });
  if (abortHero) await ctx.route('**/videos/hero/hero-music.mp3', (r) => r.abort());
  const page = await ctx.newPage();
  const S = { row, vp: VPS, errors: [], hydration: [], noise: [], forbidden: [], authHeaders: [], requestFailed: [] };
  page.on('console', (m) => {
    const t = m.text();
    if (HYD.test(t)) S.hydration.push(t.slice(0, 300));
    if (m.type() === 'error' || m.type() === 'warning') { if (NOISE.test(t)) S.noise.push(t.slice(0, 200)); else S.errors.push(`[${m.type()}] ${t.slice(0, 300)}`); }
  });
  page.on('pageerror', (e) => S.errors.push('pageerror ' + String(e).slice(0, 300)));
  page.on('requestfailed', (q) => S.requestFailed.push(`${q.url().replace('http://127.0.0.1:5173', '')} ${q.failure()?.errorText}`));
  page.on('request', (q) => {
    const u = q.url();
    if (/studio-token|recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev/.test(u)) S.forbidden.push(u);
    if (q.headers().authorization) S.authHeaders.push(u);
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(300);
  // wait for library to settle: no option shows loading
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const loading = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length);
    if (loading === 0) break; await sleep(250);
  }
  S.settleMs = Date.now() - t0;
  await sleep(500);
  // observer
  await page.evaluate(() => {
    const region = document.querySelector('[data-testid=arrangement-status]');
    const W = { region, records: [], t0: performance.now(), pm: 0, longtasks: [] };
    window.__sr = W;
    const push = (rs) => { for (const r of rs) W.records.push({ type: r.type, t: Math.round((performance.now() - W.t0) * 10) / 10, added: [...r.addedNodes].map((n) => ({ el: n.nodeType === 1, text: n.textContent })), removed: r.removedNodes.length }); };
    W.mo = new MutationObserver(push);
    W.mo.observe(region, { childList: true, subtree: true, characterData: true });
    W.flush = () => push(W.mo.takeRecords());
    // detect region replacement at the parent level
    W.replaced = 0;
    new MutationObserver((rs) => { for (const r of rs) for (const n of r.removedNodes) if (n === region || (n.contains && n.contains(region))) W.replaced++; }).observe(document.body, { childList: true, subtree: true });
    W.pmT = []; W.upT = []; W.badSamples = []; W.samples = 0;
    const sample = (why) => { W.samples++; const cur = document.querySelector('[data-testid=arrangement-status]'); if (cur !== region || region.childElementCount !== 1 || region.getAttribute('aria-live') !== 'polite') W.badSamples.push({ why, t: Math.round(performance.now() - W.t0), same: cur === region, children: region.childElementCount }); };
    window.addEventListener('pointermove', () => { W.pm++; W.pmT.push(Math.round((performance.now() - W.t0) * 10) / 10); sample('pm'); }, true);
    window.addEventListener('pointerup', () => { W.upT.push(Math.round((performance.now() - W.t0) * 10) / 10); }, true);
    new MutationObserver(() => sample('mo')).observe(region, { childList: true, subtree: true, characterData: true });
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) W.longtasks.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] }); } catch (e) { W.ltErr = String(e); }
  });
  const cdp = await ctx.newCDPSession(page);
  return { browser, ctx, page, S, cdp };
}
const read = (p) => p.evaluate(() => {
  window.__sr.flush();
  const cur = document.querySelector('[data-testid=arrangement-status]');
  const r = cur.getBoundingClientRect();
  const cs = getComputedStyle(cur);
  return {
    text: cur.textContent, same: cur === window.__sr.region, tag: cur.tagName, live: cur.getAttribute('aria-live'), connected: window.__sr.region.isConnected,
    children: cur.childElementCount, childTag: cur.firstElementChild?.tagName ?? null, replaced: window.__sr.replaced,
    pos: document.querySelector('[data-testid=arrangement-position]')?.textContent, records: window.__sr.records.length,
    clips: document.querySelectorAll('[data-clip-id]').length,
    rect: { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) }, lineHeight: cs.lineHeight, fontSize: cs.fontSize,
  };
});
const recsFrom = (p, n) => p.evaluate((n) => { window.__sr.flush(); return window.__sr.records.slice(n); }, n);
const axCount = async (cdp, text) => { const { nodes } = await cdp.send('Accessibility.getFullAXTree'); return nodes.filter((n) => n.name?.value === text || n.value?.value === text).length; };
const blur = (p) => p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); return document.activeElement ? document.activeElement.tagName : null; });
const save = (name, o) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(o, null, 1));
const undoLabel = (p) => p.evaluate(() => { const b = document.querySelector('button[title^="Undo"]'); return b ? `${b.title}${b.disabled ? ' (disabled)' : ''}` : null; });

async function addByEnter(p, id) {
  const o = p.locator(`[role=option][data-source-id="${id}"]`);
  await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150);
  await p.keyboard.press('Enter'); await sleep(900);
}

