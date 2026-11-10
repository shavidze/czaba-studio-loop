// SYS-3 stage 1 probe. Usage: BASE=http://127.0.0.1:5173 node ime-sites.mjs [rows] [vps] > out.json
// Each cell: fresh context, recipe opens the editor, CDP Input.imeSetComposition('7'), then one real key (Enter or Escape)
// via CDP rawKeyDown/keyUp while the composition is active. Records what the window capture listener saw and the editor state.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const ALL = 'TEMPO-ENTER,TEMPO-ESC,MARKER-ENTER,MARKER-ESC,GROUP-ENTER,GROUP-ESC,RANGE-ENTER,GAIN-ENTER,GAIN-ESC';
const only = (!process.argv[2] || process.argv[2] === 'ALL' ? ALL : process.argv[2]).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const ready = async (p) => {
  await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 180000 });
  await p.waitForTimeout(800);
};
const addClipAndSelect = async (p) => {
  const opt = p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first();
  await opt.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  const clip = p.locator('[data-clip-id]').first(); await clip.waitFor({ timeout: 15000 });
  await p.getByTestId('arrangement-detail-clip-gain-input').waitFor({ timeout: 5000 }).catch(() => {});
  const panel = p.getByTestId('arrangement-detail-panel');
  if ((await panel.getAttribute('data-collapsed')) === 'true') { await p.getByTestId('arrangement-detail-toggle').click(); await p.waitForTimeout(400); }
  return clip;
};
const makeGroup = async (p) => { const names = p.getByRole('button', { name: / — set as the active track/ });
  await names.nth(1).click(); await names.nth(2).click({ modifiers: ['Shift'] }); await p.keyboard.press('Control+g'); await p.waitForTimeout(400);
  await p.getByTestId('arrangement-group-fold').first().waitFor({ timeout: 10000 }); };
const recipes = {
  TEMPO: async (p) => { const t = p.getByTestId('arrangement-tempo-input'); await t.click(); await p.keyboard.press('Control+A'); return t; },
  MARKER: async (p) => { await p.getByTestId('arrangement-marker-add').click(); await p.waitForTimeout(400); return p.getByTestId('arrangement-marker-name-input'); },
  GROUP: async (p) => { await makeGroup(p); const n = p.getByTestId('arrangement-group-name').first(); await n.focus(); await p.keyboard.press('F2'); await p.waitForTimeout(200); await p.keyboard.press('Control+A'); return p.getByTestId('arrangement-group-name-input'); },
  RANGE: async (p) => { await addClipAndSelect(p); const s = p.getByTestId('arrangement-detail-start'); await s.click(); await p.keyboard.press('Control+A'); return s; },
  GAIN: async (p) => { await addClipAndSelect(p); const g = p.getByTestId('arrangement-detail-clip-gain-input'); await g.click(); await p.keyboard.press('Control+A'); return g; },
};
const snap = (p) => p.evaluate(() => {
  const a = document.activeElement;
  const q = (s) => document.querySelector(s);
  return {
    focused: a?.getAttribute('data-testid') ?? a?.tagName,
    focusedValue: a instanceof HTMLInputElement ? a.value : null,
    tempo: q('[data-testid="arrangement-tempo-input"]')?.value ?? null,
    markers: document.querySelectorAll('[data-testid="arrangement-marker"]').length,
    markerEditor: !!q('[data-testid="arrangement-marker-name-input"]'),
    groupEditor: !!q('[data-testid="arrangement-group-name-input"]'),
    groupName: q('[data-testid="arrangement-group-name"]')?.getAttribute('aria-label') ?? null,
    start: q('[data-testid="arrangement-detail-start"]')?.value ?? null,
    gain: q('[data-testid="arrangement-detail-clip-gain-input"]')?.value ?? null,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    undo: document.querySelector('button[aria-label^="Undo"]')?.getAttribute('title') ?? null,
    keys: window.__keys,
  };
});
const browser = await chromium.launch();
const out = {};
for (const [w, h] of vps) {
  for (const row of only) {
    const [site, keyName] = row.split('-');
    const key = keyName === 'ESC' ? 'Escape' : 'Enter';
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
    const cell = {};
    try {
      await p.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
      await ready(p);
      const target = await recipes[site](p);
      await p.evaluate(() => { window.__keys = []; window.addEventListener('keydown', (e) => window.__keys.push(`${e.key}|composing=${e.isComposing}|kc=${e.keyCode}`), true); });
      cell.before = await snap(p);
      const cdp = await ctx.newCDPSession(p);
      const text = site === 'TEMPO' ? '96' : '7';
      await cdp.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length });
      cell.during = await snap(p);
      const vk = key === 'Enter' ? 13 : 27;
      await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      await p.waitForTimeout(400);
      cell.after = await snap(p);
      if (cell.after.focused === cell.before.focused && key === 'Enter') {
        await cdp.send('Input.insertText', { text });
        await p.waitForTimeout(200);
        cell.afterImeCommit = await snap(p);
        await p.keyboard.press('Enter');
        await p.waitForTimeout(400);
        cell.afterPlainEnter = await snap(p);
      }
      void target;
    } catch (e) { cell.error = String(e).slice(0, 300); }
    cell.pageErrors = errs;
    out[`${w}x${h}:${row}`] = cell;
    await ctx.close();
  }
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
