import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, outPath] = [process.argv[2], process.argv[3]];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
const ae = (page) => page.evaluate(() => { const e = document.activeElement; if (!e) return null; const cs = getComputedStyle(e); return { tag: e.tagName, label: (e.getAttribute('aria-label') || e.getAttribute('data-testid') || e.textContent || '').trim().slice(0, 40), outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow !== 'none' }; });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const tr = page.getByTestId('arrangement-transport');
  const btn = (re) => tr.getByRole('button', { name: re }).first();
  const read = async (loc) => ({ label: await loc.getAttribute('aria-label'), title: await loc.getAttribute('title'), dis: await loc.getAttribute('aria-disabled'), pressed: await loc.getAttribute('aria-pressed'), text: ((await loc.textContent()) || '').trim() });
  const step = async (k, fn) => { try { r[k] = await fn(); } catch (e) { r[k] = { error: String(e).slice(0, 250) }; } };
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 240000 });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
    await page.waitForTimeout(800);
    await step('smoke', async () => {
      const o = {}; await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(700); o.clips = await page.locator('[data-clip-id]').count();
      await page.keyboard.press('Space'); await page.waitForTimeout(1500); o.posPlaying = (await page.getByTestId('arrangement-position').first().textContent())?.trim(); o.state = (await page.getByTestId('arrangement-playback-state').textContent())?.trim(); await page.keyboard.press('Space'); await page.waitForTimeout(300); o.stateStop = (await page.getByTestId('arrangement-playback-state').textContent())?.trim();
      const clip = page.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); const trs = await page.locator('[data-track-id]').evaluateAll(es => es.map(e => e.getAttribute('data-track-id')));
      const idx = trs.indexOf('music'); const nb = await page.locator('[data-track-id]').nth(idx + 1).boundingBox(); o.track0 = await clip.evaluate(e => e.closest('[data-track-id]')?.getAttribute('data-track-id'));
      await page.mouse.move(cb.x + cb.width / 2, cb.y + 6); await page.mouse.down(); await page.mouse.move(cb.x + cb.width / 2, nb.y + nb.height / 2, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(500);
      o.trackMoved = await page.locator('[data-clip-id]').first().evaluate(e => e.closest('[data-track-id]')?.getAttribute('data-track-id')); o.undoTitleAfterMove = await btn(/^Undo/).getAttribute('title');
      await page.keyboard.press('Control+z'); await page.waitForTimeout(400); o.trackUndone = await page.locator('[data-clip-id]').first().evaluate(e => e.closest('[data-track-id]')?.getAttribute('data-track-id'));
      const mm = page.locator('button[aria-label="Master Mute"]').first(); o.mm0 = await mm.getAttribute('aria-pressed'); o.undoBeforeMute = await read(btn(/^Undo/));
      await mm.click(); await page.waitForTimeout(250); o.mm1 = await mm.getAttribute('aria-pressed'); o.undoAfter1 = await read(btn(/^Undo/));
      await mm.click(); await page.waitForTimeout(250); o.mm2 = await mm.getAttribute('aria-pressed'); o.undoAfter2 = await read(btn(/^Undo/));
      o.leaf4bEqual = JSON.stringify(o.undoAfter1) === JSON.stringify(o.undoAfter2);
      await page.keyboard.press('Control+z'); await page.waitForTimeout(300); o.mmAfterUndo = await mm.getAttribute('aria-pressed'); await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
      const prev = page.getByTestId('arrangement-library-preview'); const pp = prev.getByTestId('arrangement-library-preview-toggle'); o.prevPlayCount = await pp.count();
      if (o.prevPlayCount) { await pp.click(); await page.waitForTimeout(800); o.prevPlaying = await pp.evaluate(e => ({ label: e.getAttribute('aria-label'), pressed: e.getAttribute('aria-pressed'), text: e.textContent.trim() })); await pp.click(); await page.waitForTimeout(300); o.prevStopped = await pp.evaluate(e => ({ label: e.getAttribute('aria-label'), pressed: e.getAttribute('aria-pressed'), text: e.textContent.trim() })); }
      return o; });
  } catch (e) { r.error = String(e).slice(0, 300); }
  await ctx.close();
  // G378-AUTH
  const c2 = await browser.newContext({ viewport: { width: w, height: h } }); const p2 = await c2.newPage();
  await step('auth', async () => {
    const o = {}; await p2.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 240000 }); await p2.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
    o.labWorkspace = await p2.getByTestId('arrangement-transport').count(); o.labAuthUser = await p2.evaluate(() => localStorage.getItem('auth_user'));
    await p2.goto(`${base}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 240000 }); await p2.waitForTimeout(1500);
    o.signIn = await p2.getByText(/Sign in required/i).count(); o.audio = await p2.locator('audio[src]').count(); o.workspace = await p2.getByTestId('arrangement-transport').count(); o.authUser = await p2.evaluate(() => localStorage.getItem('auth_user'));
    const resp = await p2.request.get(`${base}/api/studio-token?product=middle-east&file=stem.wav`); o.tokenStatus = resp.status(); const body = await resp.text(); o.tokenBody = body.slice(0, 120); o.tokenInBody = /token"\s*:\s*"[A-Za-z0-9._-]{20,}/i.test(body);
    await p2.screenshot({ path: outPath.replace(/\.json$/, `-auth-${w}.png`) }); return o; });
  await c2.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
