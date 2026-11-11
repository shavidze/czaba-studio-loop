// C7 probe (B round 443 planning): plain-key focus targets and ring for the Library search and the shortcut sheet.
// ring = focused element's computed outline-style != none and outline-width > 0 (shared studio focus style is an outline), or a non-none box-shadow.
// Usage: BASE=... node focus-targets.mjs [vps] > out.json ; shots go to $SHOTS (dir) when set.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const vps = (process.argv[2] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const ready = async (p) => { await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 }); await p.waitForTimeout(800); };
const read = (p) => p.evaluate(() => {
  const a = document.activeElement; const cs = a ? getComputedStyle(a) : null;
  return { focused: a?.getAttribute('data-testid') ?? a?.getAttribute('aria-label') ?? a?.tagName, role: a?.getAttribute('role') ?? a?.tagName.toLowerCase(),
    value: a instanceof HTMLInputElement ? a.value : null, sheetOpen: !!document.querySelector('[role="dialog"]'),
    focusSource: document.documentElement.dataset.focusSource ?? null,
    ring: !!cs && ((cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'),
    outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` : null };
});
const browser = await chromium.launch(); const out = {};
for (const [w, h] of vps) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage(); const cell = {};
  try {
    await p.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 }); await ready(p);
    const s = p.getByTestId('arrangement-library-search');
    await s.click(); await p.keyboard.type('dr'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    cell.a_escape = await read(p); if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/c7a-${w}.png` });
    await s.click(); await p.waitForTimeout(200); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(400);
    cell.b_arrowdown = await read(p); if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/c7b-${w}.png` });
    await p.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
    await p.keyboard.press('Shift+Slash'); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    cell.c_sheet_escape = await read(p); if (process.env.SHOTS) await p.screenshot({ path: `${process.env.SHOTS}/c7c-${w}.png` });
  } catch (e) { cell.error = String(e).slice(0, 300); }
  out[`${w}x${h}`] = cell; await ctx.close();
}
console.log(JSON.stringify(out, null, 1)); await browser.close();
