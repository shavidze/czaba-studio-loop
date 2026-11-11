// SYS-3 stage 2a probe (B round 443 planning). Real Chromium, CDP Input.imeSetComposition + rawKeyDown while composing.
// Sites: library search (Escape, ArrowDown, held Escape), shortcut-sheet search (Escape, held Escape), focus-source (composing Enter, Unidentified).
// Synthetic sequence: proves the handler contract only; real OS IME delivery stays TLM-SYS3-IME-PLATFORMS.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const ALL = 'LIB-ESC,LIB-DOWN,LIB-ESCHELD,SHEET-ESC,SHEET-ESCHELD,FS-ENTER,FS-UNIDENTIFIED,LIB-PLAINESC,SHEET-PLAINESC';
const only = (!process.argv[2] || process.argv[2] === 'ALL' ? ALL : process.argv[2]).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const ready = async (p) => {
  await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 });
  await p.waitForTimeout(800);
};
const snap = (p) => p.evaluate(() => {
  const a = document.activeElement;
  const lib = document.querySelector('[data-testid="arrangement-library-search"]');
  const dlg = document.querySelector('[role="dialog"]');
  const sheetSearch = dlg?.querySelector('input[type="search"]') ?? null;
  return {
    focused: a?.getAttribute('data-testid') ?? a?.getAttribute('aria-label') ?? a?.tagName,
    libQuery: lib?.value ?? null,
    sheetOpen: !!dlg,
    sheetQuery: sheetSearch?.value ?? null,
    focusSource: document.documentElement.dataset.focusSource ?? null,
    keys: window.__keys ?? [],
  };
});
const browser = await chromium.launch();
const out = {};
for (const [w, h] of vps) {
  for (const row of only) {
    const [site, kind] = row.split('-');
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
    const cell = {};
    try {
      await p.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
      await ready(p);
      const cdp = await ctx.newCDPSession(p);
      if (site === 'LIB' || site === 'FS') {
        const s = p.getByTestId('arrangement-library-search');
        await s.click();
        if (site === 'LIB' && kind !== 'DOWN') { await p.keyboard.type('dr'); await p.waitForTimeout(300); }
      } else {
        await p.keyboard.press('Shift+Slash'); await p.waitForTimeout(500);
        const s = p.locator('[role="dialog"] input[type="search"]'); await s.click(); await p.keyboard.type('pl'); await p.waitForTimeout(300);
      }
      await p.evaluate(() => { window.__keys = []; window.addEventListener('keydown', (e) => window.__keys.push(`${e.key}|composing=${e.isComposing}|kc=${e.keyCode}|repeat=${e.repeat}`), true); });
      cell.before = await snap(p);
      const send = (key, vk, extra = {}) => cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, ...extra });
      if (kind === 'UNIDENTIFIED') {
        await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Unidentified', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });
      } else if (kind === 'PLAINESC') {
        await p.keyboard.press('Escape');
      } else {
        await cdp.send('Input.imeSetComposition', { text: process.env.COMPOSE ?? 'so', selectionStart: 2, selectionEnd: 2 });
        cell.during = await snap(p);
        const key = kind === 'DOWN' ? 'ArrowDown' : kind === 'ENTER' ? 'Enter' : 'Escape';
        const vk = key === 'ArrowDown' ? 40 : key === 'Enter' ? 13 : 27;
        await send(key, vk);
        if (kind === 'ESCHELD') {
          await cdp.send('Input.insertText', { text: process.env.COMPOSE ?? 'so' });
          for (let i = 0; i < 3; i += 1) { await send(key, vk, { autoRepeat: true }); await p.waitForTimeout(40); }
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
        }
      }
      await p.waitForTimeout(400);
      cell.after = await snap(p);
    } catch (e) { cell.error = String(e).slice(0, 300); }
    cell.pageErrors = errs;
    out[`${w}x${h}:${row}`] = cell;
    await ctx.close();
  }
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
