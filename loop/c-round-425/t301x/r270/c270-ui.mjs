// C round 270: DP-BROWSER, DP-ENTER (+Set, focus, status 1 s), DP-EDIT, DP-INSIDE, DP-ALLTRACKS,
// SPLIT-COPY, SPLIT-BOX, SCREEN-BUDGET, G270-AUTH.
// usage: node c270-ui.mjs <base> <outDir> <headBase>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT, HEAD] = process.argv.slice(2);
const out = { base: BASE, head: HEAD, started: new Date().toISOString() };
const save = () => writeFileSync(path.join(OUT, 'ui.json'), JSON.stringify(out, null, 1));
const browser = await chromium.launch();

async function open(base, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = { page: [], console: [] };
  page.on('pageerror', (e) => errs.page.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|Failed to load resource/i.test(m.text())) errs.console.push(m.text().slice(0, 200)); });
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(1000);
  const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox();
  const y = lb.y + lb.height * 0.7;
  await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const clip = await page.locator('[data-clip-id]').first().boundingBox();
  return { ctx, page, errs, lb, y, clip };
}
const rd = (page) => page.evaluate(() => {
  const q = (id) => document.querySelector(`[data-testid="${id}"]`);
  const v = (id) => q(id)?.value ?? null;
  return {
    range: (q('arrangement-range')?.textContent ?? '').trim(),
    laneOverlays: [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((e) => [e.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null, e.getAttribute('data-range-start'), e.getAttribute('data-range-end'), e.getAttribute('style')]),
    detailStart: v('arrangement-detail-start'), detailEnd: v('arrangement-detail-end'),
    status: (q('arrangement-status')?.textContent ?? '').trim(),
    active: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => [c.getAttribute('data-clip-start'), c.getAttribute('aria-selected') ?? c.getAttribute('data-selected')]),
    splitTitle: [...document.querySelectorAll('button')].map((b) => b.getAttribute('title') ?? '').find((t) => t.startsWith('Split')) ?? null,
    disabledCount: document.querySelectorAll('[data-testid^="arrangement-detail"][disabled]').length,
  };
});
const dragAt = async (page, yy, x0, x1) => { await page.mouse.move(x0, yy); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, yy, { steps: 4 }); await page.mouse.move(x1, yy, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300); };
const expand = async (page) => { const hidden = await page.locator('[data-testid="arrangement-detail-start"]').isHidden(); if (hidden) { await page.locator('[data-testid="arrangement-detail-toggle"]').click(); await page.waitForTimeout(400); } return hidden; };
async function screenLines(page) {
  return page.evaluate(() => {
    const ex = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const lines = new Set(); const texts = [];
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim(); if (!t) continue;
      const el = n.parentElement; if (!el || (ex && ex.contains(el))) continue;
      if (el.closest('[role=dialog],[role=tooltip],script,style,noscript,[aria-hidden=true],.sr-only')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const rc of r.getClientRects()) { if (rc.width < 1 || rc.height < 1 || rc.bottom < 0 || rc.top > innerHeight || rc.right < 0 || rc.left > innerWidth) continue; lines.add(`${Math.round(rc.top)}:${Math.round(rc.left / 4)}`); }
      texts.push(t.slice(0, 50));
    }
    const rows = new Set([...lines].map((k) => k.split(':')[0]));
    return { lineBoxes: lines.size, rows: rows.size, texts: texts.length };
  });
}
const statusBox = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const b = s.getBoundingClientRect(); const p = s.parentElement.getBoundingClientRect();
  const cs = getComputedStyle(s);
  return { text: s.textContent.trim(), w: b.width, h: b.height, scrollW: s.scrollWidth, clientW: s.clientWidth, parentW: p.width, right: b.right, parentRight: p.right, overflow: cs.overflow, textOverflow: cs.textOverflow, whiteSpace: cs.whiteSpace, truncated: s.scrollWidth > s.clientWidth + 1, lineHeight: cs.lineHeight };
});

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (out[vp] = {});
  // DP-BROWSER + DP-ENTER + STATUS-CLOBBER: past start and past end
  for (const [name, dx0, dx1] of [['pastStart', 100, -150], ['pastEnd', 100, null]]) {
    const { ctx, page, errs, y, clip } = await open(BASE, w, h);
    const x1 = dx1 === null ? clip.x + clip.width + 150 : clip.x + dx1;
    await dragAt(page, y, clip.x + dx0, x1);
    const hidden = await expand(page);
    const s = (r[name] = { panelWasHidden: hidden });
    s.afterDrag = await rd(page);
    await page.screenshot({ path: path.join(OUT, `${name}-afterDrag-${vp}.png`) });
    if (name === 'pastStart') { s.screenBudget = await screenLines(page); }
    await page.locator('[data-testid="arrangement-detail-start"]').focus();
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    s.afterEnter = await rd(page);
    await page.waitForTimeout(1000);
    s.afterEnter1s = await rd(page);
    await page.locator('[data-testid="arrangement-detail-end"]').focus();
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    s.afterEnterTo = await rd(page);
    await page.locator('[data-testid="arrangement-detail-apply"]').click(); await page.waitForTimeout(300);
    s.afterSet = await rd(page);
    await page.waitForTimeout(1000);
    s.afterSet1s = await rd(page);
    await page.screenshot({ path: path.join(OUT, `${name}-afterSet-${vp}.png`) });
    if (name === 'pastStart') {
      // DP-EDIT: From = 11, Enter; then From = 9, Enter
      const from = page.locator('[data-testid="arrangement-detail-start"]');
      await from.fill('11'); await from.press('Enter'); await page.waitForTimeout(300);
      s.edit11 = await rd(page);
      await from.fill('9'); await from.press('Enter'); await page.waitForTimeout(300);
      s.edit9 = await rd(page);
      await page.screenshot({ path: path.join(OUT, `pastStart-edit9-${vp}.png`) });
      // retyped equal value
    }
    s.errors = errs; await ctx.close(); save();
  }
  // retyped equivalent on past-start: '6.250'
  {
    const { ctx, page, errs, y, clip } = await open(BASE, w, h);
    await dragAt(page, y, clip.x + 100, clip.x - 150); await expand(page);
    const s = (r.retyped = {}); s.before = await rd(page);
    const from = page.locator('[data-testid="arrangement-detail-start"]');
    await from.fill(Number(s.before.detailStart).toFixed(3)); await from.press('Enter'); await page.waitForTimeout(300);
    s.after = await rd(page); s.errors = errs; await ctx.close(); save();
  }
  // DP-INSIDE and DP-ALLTRACKS
  {
    const { ctx, page, errs, y, clip } = await open(BASE, w, h);
    await dragAt(page, y, clip.x + 60, clip.x + 160); await expand(page);
    const s = (r.inside = {}); s.afterDrag = await rd(page);
    await page.locator('[data-testid="arrangement-detail-start"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    s.afterEnter = await rd(page);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Control+Shift+KeyL'); await page.waitForTimeout(400); await expand(page);
    s.allTracks = await rd(page);
    await page.locator('[data-testid="arrangement-detail-start"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    s.allTracksEnter = await rd(page);
    await page.waitForTimeout(1000); s.allTracksEnter1s = await rd(page);
    await page.screenshot({ path: path.join(OUT, `alltracks-afterEnter-${vp}.png`) });
    s.errors = errs; await ctx.close(); save();
  }
  // SPLIT-COPY + SPLIT-BOX (current and HEAD)
  for (const [tag, base] of [['current', BASE], ['head', HEAD]]) {
    const s = ((r.split ??= {})[tag] = {});
    let { ctx, page, errs, lb, y, clip } = await open(base, w, h);
    await dragAt(page, y, clip.x + 100, clip.x - 150); s.A_range = await rd(page);
    await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); s.A_split = await rd(page); s.A_box = await statusBox(page);
    await ctx.close();
    ({ ctx, page, errs, lb, y, clip } = await open(base, w, h));
    await dragAt(page, y, clip.x + 100, clip.x + 400); await page.keyboard.press('Delete'); await page.waitForTimeout(300); s.G_gap = await rd(page);
    await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
    const last = await page.locator('[data-clip-id]').last().boundingBox();
    await dragAt(page, y, clip.x + 50, last.x + last.width + 100); s.G_range = await rd(page);
    await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); s.G_split = await rd(page); s.G_box = await statusBox(page);
    await page.screenshot({ path: path.join(OUT, `split-G-${tag}-${vp}.png`) });
    s.errors = errs; await ctx.close(); save();
  }
  // SCREEN-BUDGET at HEAD: past-start selection with the panel open
  {
    const { ctx, page, y, clip } = await open(HEAD, w, h);
    await dragAt(page, y, clip.x + 100, clip.x - 150); await expand(page);
    r.pastStart.screenBudgetHead = await screenLines(page);
    r.pastStart.headFields = await rd(page);
    await page.screenshot({ path: path.join(OUT, `pastStart-head-${vp}.png`) });
    await ctx.close(); save();
  }
}
// G270-AUTH
{
  const a = (out.auth = {});
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  a.lab = { url: page.url(), lanes: await page.locator('[data-track-id]').count(), authUser: await page.evaluate(() => localStorage.getItem('auth_user')), cookies: (await ctx.cookies()).map((c) => c.name) };
  await page.screenshot({ path: path.join(OUT, 'auth-lab-1440x900.png') });
  const p2 = await ctx.newPage(); const reqs = [];
  p2.on('request', (q) => { if (/\.(wav|mp3)(\?|$)|studio-token/.test(q.url())) reqs.push(q.url()); });
  await p2.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load', timeout: 120000 }).catch((e) => { a.productGotoError = String(e).slice(0, 200); });
  await p2.waitForTimeout(3000);
  a.product = { url: p2.url(), signInRequired: await p2.getByText('Sign in required', { exact: false }).count(), audioSrc: await p2.locator('audio[src]').count(), audioRequests: reqs, authUser: await p2.evaluate(() => localStorage.getItem('auth_user')) };
  await p2.screenshot({ path: path.join(OUT, 'auth-product-1440x900.png') });
  await ctx.close();
  const api = await browser.newContext();
  const u = `${BASE}/api/studio-token?product=middle-east&file=stem-1.wav`;
  const x = await api.request.get(u, { failOnStatusCode: false });
  const yy = await api.request.get(u, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
  const xt = await x.text(); const yt = await yy.text();
  a.api = { noHeader: { status: x.status(), body: xt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(xt) }, fakeBearer: { status: yy.status(), body: yt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(yt) } };
  await api.close();
}
out.finished = new Date().toISOString();
save();
await browser.close();
console.log('done');
