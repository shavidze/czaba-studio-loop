import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const out = { date: new Date().toISOString(), runs: [] };
const b = await chromium.launch();
async function run(vp, from, mode) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => { const d = new Date().toISOString().split('T')[0]; localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true })); });
  const p = await ctx.newPage();
  await p.goto(BASE + from, { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(3500);
  await p.evaluate(() => { window.__probeMarker = 'alive'; });
  for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 600); await p.waitForTimeout(40); }
  await p.waitForTimeout(1800);
  const before = await p.evaluate(() => ({ y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight }));
  let target;
  if (mode === 'header-link') target = p.locator('header a[href="/store"]').first();
  else target = p.locator('footer a', { hasText: 'Support' }).first();
  const box = await target.boundingBox();
  const inView = !!box && box.y >= 0 && box.y + box.height <= vp.height;
  if (mode !== "header-link" && inView) await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); else await target.evaluate((e) => e.click());
  before.clickInView = inView; before.clickBoxY = box ? Math.round(box.y) : null;
  await p.waitForTimeout(400);
  const t400 = await p.evaluate(() => ({ path: location.pathname, y: Math.round(scrollY) }));
  await p.waitForTimeout(2600);
  const after = await p.evaluate(() => ({ path: location.pathname, y: Math.round(scrollY), marker: window.__probeMarker ?? null, active: document.activeElement ? (document.activeElement.tagName + ' ' + (document.activeElement.textContent || '').trim().slice(0, 30)) : null, leadDialog: !!document.querySelector('[role="dialog"]') }));
  await p.mouse.move(vp.width / 2, vp.height / 2);
  await p.mouse.wheel(0, 200); await p.waitForTimeout(1800);
  after.yAfterOneWheel200 = await p.evaluate(() => Math.round(scrollY));
  await p.keyboard.press('Tab'); await p.waitForTimeout(300);
  after.mouseTab = await p.evaluate(() => { const e = document.activeElement; return e ? e.tagName + ' ' + (e.getAttribute('href') || '') + ' ' + (e.textContent || '').trim().slice(0, 24) : null; });
  out.runs.push({ vp: vp.width + 'x' + vp.height, from, mode, before, t400, after });
  await ctx.close();
}
async function kb(vp, from, linkText = 'Support', scope = 'footer') {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => { const d = new Date().toISOString().split('T')[0]; localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true })); });
  const p = await ctx.newPage();
  await p.goto(BASE + from, { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(3500);
  await p.evaluate(() => { window.__probeMarker = 'alive'; });
  await p.locator(scope + ' a', { hasText: linkText }).first().focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({ path: location.pathname, y: Math.round(scrollY), marker: window.__probeMarker ?? null, active: document.activeElement ? document.activeElement.tagName : null }));
  await p.keyboard.press('Tab'); await p.waitForTimeout(300);
  r.firstTabAfter = await p.evaluate(() => { const e = document.activeElement; return e ? e.tagName + ' ' + (e.getAttribute('href') || '') + ' ' + (e.textContent || '').trim().slice(0, 24) : null; });
  out.runs.push({ vp: vp.width + 'x' + vp.height, from, mode: 'keyboard-enter ' + scope + ' ' + linkText, after: r });
  await ctx.close();
}
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  await run(vp, '/faq', 'header-link');
  await run(vp, '/faq', 'footer-anchor');
  await run(vp, '/', 'footer-anchor');
  await kb(vp, '/faq');
  await kb(vp, '/faq', 'Contact Us', 'main');
}
console.log(JSON.stringify(out, null, 1));
await b.close();
