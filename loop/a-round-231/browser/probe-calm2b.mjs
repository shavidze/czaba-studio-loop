import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');

const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || '.';
const label = process.argv[4] || 'run';
mkdirSync(out, { recursive: true });
const res = {};
const browser = await chromium.launch();

async function open(ctx) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
  await page.waitForFunction(() => {
    const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim()));
    return add && !add.disabled;
  }, undefined, { timeout: 90000 });
  await page.waitForTimeout(800);
  return { page, errors };
}

const snap = (page) =>
  page.evaluate(() => {
    const t = (id) => document.querySelector(`[data-testid="${id}"]`);
    const vis = (el) => {
      if (!el) return false;
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      }
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
    };
    const hints = [...document.querySelectorAll('[data-testid="arrangement-lane-empty-hint"]')].map((h) => ({
      text: h.textContent,
      lane: h.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null,
      visible: vis(h),
      box: box(h),
    }));
    const reasons = ['arrangement-detail-reason', 'arrangement-detail-clip-gain-reason'].map((id) => ({
      id,
      text: t(id)?.textContent ?? null,
      visible: vis(t(id)),
      cls: t(id)?.className ?? null,
    }));
    const start = t('arrangement-detail-start');
    return {
      clips: document.querySelectorAll('[data-clip-id]').length,
      status: t('arrangement-status')?.textContent ?? null,
      headerLabel: t('arrangement-detail-header-label')?.textContent ?? null,
      hint: t('arrangement-detail-hint')?.textContent ?? null,
      hintVisible: vis(t('arrangement-detail-hint')),
      detailCollapsed: t('arrangement-detail-panel')?.getAttribute('data-collapsed'),
      reasons,
      startDescribedBy: start?.getAttribute('aria-describedby') ?? null,
      startDescText: start?.getAttribute('aria-describedby')
        ? document.getElementById(start.getAttribute('aria-describedby'))?.textContent ?? null
        : null,
      startTitle: start?.title ?? null,
      boxes: Object.fromEntries(
        [
          'arrangement-detail-start',
          'arrangement-detail-end',
          'arrangement-detail-apply',
          'arrangement-detail-clip-gain-input',
          'arrangement-detail-clip-gain-fader',
          'arrangement-detail-clip-gain-reset',
          'arrangement-library-search',
          'arrangement-library-notice',
          'arrangement-library-tree',
        ].map((id) => [id, box(t(id))]),
      ),
      notice: t('arrangement-library-notice')?.textContent ?? null,
      noticeDismiss: !!t('arrangement-library-notice-dismiss'),
      hints,
      active: [...document.querySelectorAll('button[aria-pressed="true"]')]
        .map((b) => b.getAttribute('aria-label'))
        .filter((l) => l && l.includes('set as the active track')),
      focus: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
    };
  });

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`;
  const r = (res[key] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  let { page, errors } = await open(ctx);
  r.S0 = await snap(page);
  await page.screenshot({ path: `${out}/${label}-S0-${key}.png` });
  if (r.S0.detailCollapsed === 'true') {
    await page.getByTestId('arrangement-detail-toggle').click();
    await page.waitForTimeout(500);
  }
  r.S0expanded = await snap(page);
  await page.screenshot({ path: `${out}/${label}-S0x-${key}.png` });
  // Enter on body adds to the active track
  await page.mouse.click(5, 5);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  r.afterEnter = await snap(page);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(600);
  r.afterUndo = await snap(page);
  // activate Stems
  const stems = page.locator('button[aria-pressed]').filter({ hasText: 'Stems' }).first();
  await stems.click();
  await page.waitForTimeout(400);
  r.stemsActive = await snap(page);
  // activate Video
  const video = page.locator('button[aria-pressed]').filter({ hasText: 'Video' }).first();
  if (await video.count()) {
    await video.click();
    await page.waitForTimeout(400);
    r.videoActive = await snap(page);
  }
  // drag first library option onto the SFX lane body
  const option = page.locator('[role="option"][draggable="true"]').first();
  const sfxLane = page.locator('[data-track-id="sfx"]').last();
  try {
    await option.dragTo(sfxLane, { targetPosition: { x: 400, y: 20 } });
    await page.waitForTimeout(1200);
    r.afterDrag = await snap(page);
  } catch (e) {
    r.afterDrag = { error: String(e).slice(0, 300) };
  }
  // dismiss
  await page.mouse.click(5, 5);
  if (await page.getByTestId('arrangement-library-notice-dismiss').count()) {
    await page.getByTestId('arrangement-library-notice-dismiss').click();
    await page.waitForTimeout(300);
    r.afterDismiss = await snap(page);
    r.storage = await page.evaluate(() => ({ ...localStorage }));
    await page.evaluate(() => {
      window.__shifts = [];
    });
    await page.close();
    ({ page, errors } = await open(ctx));
    r.afterReload = await snap(page);
    r.reloadShifts = await page.evaluate(() =>
      performance.getEntriesByType('layout-shift').map((e) => ({ v: e.value, t: Math.round(e.startTime) })),
    );
    await page.screenshot({ path: `${out}/${label}-dismissed-${key}.png` });
  }
  r.errors = errors;
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: w, height: h } });
  const fresh = await open(ctx2);
  r.freshContext = { notice: (await snap(fresh.page)).notice };
  await ctx2.close();
}
await browser.close();
writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1).slice(0, 200));
