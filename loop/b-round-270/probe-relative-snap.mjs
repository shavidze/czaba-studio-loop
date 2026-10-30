import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-270';
const OUT = process.argv[2] ?? `${DIR}/probe-relative-snap-head.json`;
const BASE = process.argv[3] ?? 'http://127.0.0.1:5173';
const TAG = OUT.includes('sketch') ? 'sketch' : 'head';
const browser = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (out[vp] = { steps: [] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1000);
  const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox();
  await page.mouse.click(lb.x + 400, lb.y + lb.height * 0.7); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const state = () => page.evaluate(() => {
    const c = document.querySelector('[data-clip-id]'); const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    const snapBtn = [...document.querySelectorAll('button')].find((b) => /^Snap/.test(b.getAttribute('title') ?? ''));
    return { clipId: c?.getAttribute('data-clip-id'), start: c?.getAttribute('data-clip-start'), width: c?.getBoundingClientRect().width,
      attrs: c ? [...c.attributes].map((a) => a.name).filter((n) => n.startsWith('data-')) : [],
      gridSeconds: g?.dataset.gridSeconds, snap: g?.dataset.snap, snapPaused: g?.dataset.snapPaused, gridLines: g?.dataset.gridLines,
      snapTitle: snapBtn?.getAttribute('title') ?? null,
      undoTitle: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('title') ?? b.getAttribute('aria-label') ?? ''))?.getAttribute('title') ?? null,
      status: document.querySelector('[data-testid="arrangement-status"]')?.textContent };
  });
  const s0 = await state(); r.initial = s0;
  const pxPerSec = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return parseFloat(c.style.left) / Number(c.getAttribute('data-clip-start')); });
  const box = async () => page.locator('[data-clip-id]').first().locator(':scope > *').first().boundingBox();
  const drag = async (dx, mods = []) => { const b = await box(); const x = b.x + Math.min(40, b.width / 2); const y = b.y + b.height / 2;
    for (const m of mods) await page.keyboard.down(m);
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx / 2, y, { steps: 3 }); await page.mouse.move(x + dx, y, { steps: 3 }); await page.mouse.up();
    for (const m of mods) await page.keyboard.up(m); await page.waitForTimeout(300); };
  r.pxPerSec = pxPerSec;
  const step = Number(s0.gridSeconds);
  if (s0.snap !== 'on') { await page.mouse.click(5, 5); await page.keyboard.press('g'); await page.waitForTimeout(300); }
  const s1 = await state(); r.afterSnapOn = s1;
  await drag(Math.round(0.3 * step * pxPerSec), ['Alt']); r.steps.push(['alt +0.3 step', await state()]);
  await drag(5); r.steps.push(['jitter +5 px', await state()]);
  await drag(-5); r.steps.push(['jitter -5 px', await state()]);
  await drag(Math.round(1.2 * step * pxPerSec)); r.steps.push(['+1.2 step', await state()]);
  await drag(Math.round(1.2 * step * pxPerSec)); r.steps.push(['+1.2 step again', await state()]);
  const lanes = await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].filter((e) => e.querySelector('[data-grid-seconds]')).map((e) => { const b = e.querySelector('[data-grid-seconds]').getBoundingClientRect(); return { id: e.getAttribute('data-track-id'), y: b.y + b.height / 2 }; }));
  r.lanes = lanes;
  const trackOf = () => page.evaluate(() => document.querySelector('[data-clip-id]')?.closest('[data-track-id]')?.getAttribute('data-track-id'));
  const fromTrack = await trackOf(); const target = lanes.find((l, i) => i > 0 && lanes[i - 1].id === fromTrack && l.id !== 'video') ?? lanes.find((l) => l.id !== fromTrack && l.id !== 'video');
  { const b = await box(); const x = b.x + Math.min(40, b.width / 2); const y = b.y + b.height / 2; const dx = Math.round(1.2 * step * pxPerSec);
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx / 2, (y + target.y) / 2, { steps: 3 }); await page.mouse.move(x + dx, target.y, { steps: 3 }); await page.waitForTimeout(200);
    const ghosts = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')].map((g) => g.getAttribute('data-ghost-start')));
    await page.mouse.up(); await page.waitForTimeout(300);
    r.steps.push(['cross-lane +1.2 step to ' + target.id, { ...(await state()), ghosts, track: await trackOf() }]); }
  { const c = await page.locator('[data-clip-id]').first().boundingBox(); const x = c.x + 3; const y = c.y + c.height * 0.6; const dx = Math.round(0.75 * step * pxPerSec);
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx / 2, y, { steps: 3 }); await page.mouse.move(x + dx, y, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(300);
    r.steps.push(['trim start +0.75 step', await state()]); }
  await page.screenshot({ path: `${DIR}/shots/relative-${TAG}-${vp}.png` });
  r.step = step; r.errors = errors; await ctx.close();
}
writeFileSync(OUT, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out, null, 1));
