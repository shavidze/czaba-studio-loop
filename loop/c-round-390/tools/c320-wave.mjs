// C320 (copied from c319-wave.mjs) R-WAVEFORM supplement: fresh context (empty cache), poll clip waveform immediately after Add, zoom with '=' / '-', compare d at same zoom; open detail.
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const [BASE, TAG] = process.argv.slice(2); const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-390/out/b2';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) { const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); const errors = []; r.errors = errors;
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  const wf = () => page.evaluate(() => { const hsh = (s) => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return `${s.length}:${x}`; };
    const p = (sel) => [...document.querySelectorAll(sel)].map((e) => { const q = e.tagName === 'path' ? e : e.querySelector('path'); return q ? hsh(q.getAttribute('d') ?? '') : 'nopath'; });
    const c = document.querySelector('[data-clip-id]'); const z = document.querySelector('[role="slider"][aria-label*="oom" i]');
    return { clip: p('[data-testid="arrangement-clip-waveform"]'), detail: p('[data-testid="arrangement-detail-waveform"]'), clipW: c ? Math.round(c.getBoundingClientRect().width) : null, zoom: z?.getAttribute('aria-valuenow') ?? z?.getAttribute('aria-valuetext') ?? null }; });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 }); await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 }); await page.waitForTimeout(800);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter');
  const t0 = Date.now(); const samples = [];
  while (Date.now() - t0 < 6000) { const s = await wf(); samples.push({ t: Date.now() - t0, clip: s.clip }); if (s.clip.length && s.clip[0] !== 'nopath' && !s.clip[0].startsWith('0:') && samples.length > 3) break; await page.waitForTimeout(50); }
  r.lateLoad = { first: samples[0], firstDrawn: samples.find((s) => s.clip.length && s.clip[0] !== 'nopath' && !s.clip[0].startsWith('0:')) ?? null, n: samples.length };
  await page.waitForTimeout(1000); r.z0 = await wf();
  r.zoom = [];
  for (const k of ['Equal', 'Equal', 'Minus', 'Minus', 'Equal', 'Equal', 'Minus', 'Minus']) { await page.keyboard.press(k); await page.waitForTimeout(700); r.zoom.push({ k, ...(await wf()) }); }
  const clip = await page.locator('[data-clip-id]').first().boundingBox();
  await page.locator('[data-clip-id]').first().getByTitle(/ — drag to move$/).click().catch(async () => { await page.mouse.click(clip.x + 40, clip.y + 6); });
  await page.waitForTimeout(400);
  const tg = page.locator('[data-testid="arrangement-detail-toggle"]'); if ((await tg.getAttribute('aria-expanded')) === 'false') { await tg.click(); await page.waitForTimeout(600); }
  r.detail = await wf(); await page.screenshot({ path: `${DIR}/shots/${TAG}-wave2-${vp}.png` });
  await ctx.close(); }
writeFileSync(`${DIR}/wave-${TAG}.json`, JSON.stringify(res, null, 1)); await browser.close();
