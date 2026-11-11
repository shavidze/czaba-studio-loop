// SYS-3 stage 2b planning probe (B round 444 -> 445). Question: can a HELD Escape (one fresh press + 3 auto-repeat keydowns)
// collapse the expanded floating video after the fresh press already did its own job (closed the sheet / Export, cancelled an editor)?
// Sequence per cell: expand video -> open the site -> CDP rawKeyDown Escape (fresh) -> 3x rawKeyDown Escape autoRepeat:true -> keyUp.
// Records: video expanded before/after the fresh press and after the repeats, focus, and every keydown the window saw.
// Usage: BASE=http://127.0.0.1:5173 node held-escape-video.mjs [ALL|SITE,...] [1440x900,1280x720]
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const ALL = 'SHEET,EXPORT,TEMPO,MARKER,GAIN,LIBSEARCH,BODY';
const only = (!process.argv[2] || process.argv[2] === 'ALL' ? ALL : process.argv[2]).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const ready = async (p) => {
  await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 });
  await p.waitForTimeout(800);
};
const addClipAndSelect = async (p) => {
  const opt = p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first();
  await opt.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  await p.locator('[data-clip-id]').first().waitFor({ timeout: 15000 });
  const panel = p.getByTestId('arrangement-detail-panel');
  if ((await panel.getAttribute('data-collapsed')) === 'true') { await p.getByTestId('arrangement-detail-toggle').click(); await p.waitForTimeout(400); }
};
const recipes = {
  SHEET: async (p) => { await p.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {}); await p.getByRole('button', { name: /Keyboard shortcuts/ }).click(); await p.waitForTimeout(400); },
  EXPORT: async (p) => { await addClipAndSelect(p); await p.getByRole('button', { name: /^Export/ }).first().click(); await p.waitForTimeout(500); },
  TEMPO: async (p) => { const t = p.getByTestId('arrangement-tempo-input'); await t.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('97'); },
  MARKER: async (p) => { await p.getByTestId('arrangement-marker-add').click(); await p.waitForTimeout(400); },
  GAIN: async (p) => { await addClipAndSelect(p); const g = p.getByTestId('arrangement-detail-clip-gain-input'); await g.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('-5'); },
  LIBSEARCH: async (p) => { const s = p.getByRole('searchbox').first(); await s.click(); await p.keyboard.type('dr'); },
  BODY: async (p) => { await p.getByTestId('arrangement-video-expand').focus(); },
};
const snap = (p) => p.evaluate(() => {
  const a = document.activeElement;
  const ex = document.querySelector('[data-testid="arrangement-video-expand"]');
  return {
    focused: a?.getAttribute('data-testid') ?? a?.getAttribute('aria-label') ?? a?.tagName,
    videoExpanded: ex ? ex.getAttribute('aria-label') !== 'Expand video' : null,
    expandLabel: ex?.getAttribute('aria-label') ?? null,
    dialog: !!document.querySelector('[role="dialog"]'),
    markerEditor: !!document.querySelector('[data-testid="arrangement-marker-name-input"]'),
    tempo: document.querySelector('[data-testid="arrangement-tempo-input"]')?.value ?? null,
    gain: document.querySelector('[data-testid="arrangement-detail-clip-gain-input"]')?.value ?? null,
    keys: window.__keys,
  };
});
const browser = await chromium.launch();
const out = {};
for (const [w, h] of vps) {
  for (const site of only) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
    const cell = {};
    try {
      await p.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
      await ready(p);
      await p.getByTestId('arrangement-video-expand').click(); await p.waitForTimeout(500);
      cell.expanded0 = await snap(p);
      await recipes[site](p);
      await p.evaluate(() => { window.__keys = []; window.addEventListener('keydown', (e) => window.__keys.push(`${e.key}|repeat=${e.repeat}|prevented=${e.defaultPrevented}|target=${e.target?.getAttribute?.('data-testid') ?? e.target?.tagName}`)); });
      cell.before = await snap(p);
      const cdp = await ctx.newCDPSession(p);
      const k = { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 };
      await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...k });
      await p.waitForTimeout(300);
      cell.afterFresh = await snap(p);
      for (let i = 0; i < 3; i += 1) { await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...k, autoRepeat: true }); await p.waitForTimeout(60); }
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...k });
      await p.waitForTimeout(400);
      cell.afterRepeats = await snap(p);
      cell.verdict = cell.afterFresh.videoExpanded === true && cell.afterRepeats.videoExpanded === false ? 'REPEAT-COLLAPSED-VIDEO' : 'video-unchanged-by-repeats';
    } catch (e) { cell.error = String(e).slice(0, 300); }
    cell.pageErrors = errs;
    out[`${w}x${h}:${site}`] = cell;
    await ctx.close();
  }
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
