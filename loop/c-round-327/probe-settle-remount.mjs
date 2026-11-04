// C327 reachability probe for A-R327-REVIEW-SAME-TEXT-REMOUNT and reviewer finding 1.
// A real user on a slow network: the public-preview MP3s are still loading; the user adds a synthetic stem
// (already decoded), drags its Fade In handle and holds still; the last MP3 arrives mid-drag (collection settle
// = same-text updater setStatus); the user then moves the pointer vertically only (same fade value) and on.
// usage: node probe-settle-remount.mjs <BASE> <tag> [1440x900,1280x720]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, TAG] = [process.argv[2], process.argv[3]];
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-327';
mkdirSync(`${DIR}/shots`, { recursive: true });
const VPS = (process.argv[4] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const OUT = `${DIR}/probe-settle-${TAG}${process.env.SUFFIX ?? ''}.json`;
const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of VPS) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  const held = [];
  await page.route(/\/(middle-east\.mp3|videos\/hero\/hero-music\.mp3)(\?.*)?$/, (route) => { held.push(route); });
  try {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => !!document.querySelector('[data-source-id="demo-stem-pulse"]'), null, { timeout: 180000 });
    await page.waitForTimeout(4000);
    r.heldRequests = held.length;
    r.statusLoading = await page.locator('[data-testid="arrangement-status"]').textContent();
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await page.waitForTimeout(300);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await page.waitForTimeout(1500);
    const id = await page.locator('[data-clip-kind="audio"]').first().getAttribute('data-clip-id');
    r.clip = id;
    await page.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < 20 && (await page.locator(`[data-clip-id="${id}"]`).boundingBox()).width > 520; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); }
    r.statusBeforeDrag = await page.locator('[data-testid="arrangement-status"]').textContent();
    const hb = await page.locator(`[data-clip-id="${id}"]`).getByTestId('arrangement-clip-fade-in-handle').first().boundingBox();
    const from = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 };
    await page.evaluate(() => {
      const o = document.querySelector('[data-testid="arrangement-status"]'); window.__rec = [];
      const t0 = performance.now();
      new MutationObserver((ms) => { for (const m of ms) { for (const n of m.addedNodes) window.__rec.push(`${Math.round(performance.now() - t0)} +${(n.textContent ?? '').trim()}`); for (const n of m.removedNodes) window.__rec.push(`${Math.round(performance.now() - t0)} -${(n.textContent ?? '').trim()}`); } }).observe(o, { childList: true, subtree: true, characterData: true });
      window.__span = () => o.firstElementChild;
    });
    const take = () => page.evaluate(() => { const x = window.__rec; window.__rec = []; return x; });
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y, { steps: 4 }); await page.waitForTimeout(300);
    r.atHold = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), fadeIn: await page.locator(`[data-clip-id="${id}"]`).getAttribute('data-fade-in'), rec: await take() };
    await page.evaluate(() => { window.__heldSpan = window.__span(); window.__frames = []; const o = document.querySelector('[data-testid="arrangement-status"]'); const t0 = performance.now(); const tick = (ts) => { window.__frames.push(`${Math.round(ts - t0)} ${(o.textContent ?? '').slice(0, 40)}`); if (window.__frames.length < 600) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    // release the held MP3s while the pointer is held still mid-drag
    r.released = held.length; for (const rt of held.splice(0)) await rt.continue();
    await page.waitForFunction(() => !/Loading/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '') , null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(4000);
    r.afterSettle = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), sameNodeAsHold: await page.evaluate(() => window.__span() === window.__heldSpan), rec: await take() };
    r.frames = await page.evaluate(() => { const f = window.__frames; const out = []; for (let i = 0; i < f.length; i++) { const t = f[i].replace(/^\d+ /, ''); if (i === 0 || t !== f[i - 1].replace(/^\d+ /, '')) out.push(f[i]); } return { total: f.length, changes: out }; });
    await page.screenshot({ path: `${DIR}/shots/probe-settle-${TAG}-${vp}-after-settle.png` });
    // same-value move: vertical only
    await page.evaluate(() => { window.__heldSpan2 = window.__span(); });
    await page.mouse.move(from.x + 40, from.y + 6, { steps: 3 }); await page.waitForTimeout(400);
    r.afterSameValueMove = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), fadeIn: await page.locator(`[data-clip-id="${id}"]`).getAttribute('data-fade-in'), sameNode: await page.evaluate(() => window.__span() === window.__heldSpan2), rec: await take() };
    await page.mouse.move(from.x + 60, from.y + 6, { steps: 3 }); await page.waitForTimeout(400);
    r.afterNextMove = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), rec: await take() };
    await page.mouse.up(); await page.waitForTimeout(500);
    r.afterRelease = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), fadeIn: await page.locator(`[data-clip-id="${id}"]`).getAttribute('data-fade-in'), rec: await take() };
    await page.screenshot({ path: `${DIR}/shots/probe-settle-${TAG}-${vp}-released.png` });
  } catch (e) { r.error = String(e).slice(0, 400); }
  save(); await ctx.close();
}
res.endedUtc = new Date().toISOString(); save(); await browser.close();
