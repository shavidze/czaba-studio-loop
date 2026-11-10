// SYS-2 stage 2b-ii browser probe. Usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node held-enter-2bii.mjs [rows] [vps]
// Each cell: fresh context, a recipe, focus the target, one fresh Enter keydown (state A), three more Enter keydowns
// (repeat=true) on whatever holds focus, Enter keyup, state B. Side-effect counters (renders, downloads, share/clipboard,
// sheet/dialog opens) are part of the state. PASS on a fixed tree = firstActed and B equals A.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const ALL = 'SFOOTER,SCLOSE,XDONE,XMODALX,XEXPORT,GMENU,NSEND';
const only = (!process.argv[2] || process.argv[2] === 'ALL' ? ALL : process.argv[2]).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const counters = () => {
  window.__c = { renders: 0, shares: 0, clips: 0, sheetOpens: 0, dialogOpens: 0 };
  const r = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function () { window.__c.renders++; return r.call(this); };
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  const cb = { writeText: async () => { window.__c.clips++; } };
  Object.defineProperty(navigator, 'clipboard', { value: cb, configurable: true });
  new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n instanceof Element) {
    if (n.matches?.('button[aria-label="Close (Esc)"]') || n.querySelector?.('button[aria-label="Close (Esc)"]')) window.__c.sheetOpens++;
    if (n.querySelector?.('#arrangement-export-title')) window.__c.dialogOpens++;
  } }).observe(document, { childList: true, subtree: true });
};
const state = (p) => p.evaluate(() => ({
  c: { ...window.__c },
  sheet: !!document.querySelector('button[aria-label="Close (Esc)"]'),
  exportDialog: !!document.querySelector('#arrangement-export-title'),
  gridMenu: !!document.querySelector('[data-testid="arrangement-grid-menu"]'),
  gridChecked: [...document.querySelectorAll('[data-testid="arrangement-grid-menu"] [aria-checked]')].map((e) => e.getAttribute('aria-checked')).join(','),
  pressed: [...document.querySelectorAll('button[aria-pressed]')].map((e) => e.getAttribute('aria-pressed')).join(','),
  cookie: !!document.querySelector('[role="dialog"][aria-label*="ookie"], [data-testid="cookie-consent"]') || /Accept/.test(document.body.innerText) && /cookie/i.test(document.body.innerText),
  share: document.querySelector('[data-testid="studio-narrow-screen"] output')?.textContent ?? null,
  status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
  clipsOnLanes: document.querySelectorAll('[data-clip-id]').length,
}));
const focused = (p) => p.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, type: a?.getAttribute('type'), testid: a?.getAttribute('data-testid'), label: a?.getAttribute('aria-label'), text: a?.textContent?.trim().slice(0, 30), focusVisible: a?.matches(':focus-visible') ?? false, outline: a ? getComputedStyle(a).outlineStyle : null }; });
const ready = async (p) => {
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first().waitFor({ timeout: 60000 });
  await p.waitForFunction(() => !/Loading/.test(document.querySelector('[role=listbox]')?.textContent ?? ''), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(2500);
};
const addClip = async (p) => { const o = p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first(); await o.click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500); };
const openSheet = async (p) => { await p.getByRole('button', { name: 'Keyboard shortcuts (?)' }).click(); await p.waitForTimeout(400); };
const openExport = async (p) => { await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForTimeout(600); };
const dlg = (p) => p.locator('[role="dialog"]').filter({ has: p.locator('#arrangement-export-title') });
const recipes = {
  SFOOTER: async (p) => ({ target: p.getByRole('button', { name: 'Keyboard shortcuts (?)' }) }),
  SCLOSE: async (p) => { await openSheet(p); return { target: p.locator('button[aria-label="Close (Esc)"]') }; },
  XDONE: async (p) => { await openExport(p); return { target: dlg(p).getByRole('button', { name: 'Done' }) }; },
  XMODALX: async (p) => { await openExport(p); return { target: dlg(p).locator('button[aria-label="Close"]') }; },
  XEXPORT: async (p) => { await addClip(p); await openExport(p); return { target: dlg(p).locator('[data-testid="arrangement-export-footer"] button').last() }; },
  GMENU: async (p) => { const lane = p.locator('[data-grid-seconds]').nth(1); const b = await lane.boundingBox(); await p.mouse.click(b.x + 200, b.y + b.height / 2, { button: 'right' }); await p.waitForTimeout(400); return { target: p.locator('[data-testid="arrangement-grid-menu"] [role^="menuitem"][tabindex="0"]') }; },
  NSEND: async (p) => ({ target: p.getByRole('button', { name: 'Send link' }) }),
  COOKIE: async (p) => ({ target: p.getByRole('button', { name: 'Accept' }) }),
};
fs.mkdirSync(OUT, { recursive: true });
for (const [w0, h0] of vps) for (const row of only) {
  const [w, h] = row === 'NSEND' ? [800, 700] : [w0, h0];
  const r = { row, vp: `${w}x${h}` }; const errors = [];
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
    if (row !== 'COOKIE') await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    await ctx.addInitScript(counters);
    const p = await ctx.newPage(); let downloads = 0; p.on('download', () => { downloads++; });
    p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    if (row === 'NSEND') { await p.getByRole('button', { name: 'Send link' }).waitFor({ timeout: 60000 }); await p.waitForTimeout(1500); } else if (row === 'COOKIE') { await p.waitForTimeout(4000); } else { await ready(p); }
    const { target } = await recipes[row](p);
    await target.waitFor({ timeout: 15000 });
    r.before = await state(p); r.before.downloads = downloads; await target.focus(); await p.waitForTimeout(150);
    await p.keyboard.down('Enter'); await p.waitForTimeout(row === 'XEXPORT' ? 1500 : 300); r.A = await state(p); r.A.downloads = downloads;
    r.focusedAfterFirst = await focused(p);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await p.waitForTimeout(row === 'XEXPORT' ? 700 : 150); }
    await p.keyboard.up('Enter'); await p.waitForTimeout(row === 'XEXPORT' ? 3000 : 500); r.B = await state(p); r.B.downloads = downloads;
    r.focusedAfterHeld = await focused(p);
    r.firstActed = JSON.stringify(r.A) !== JSON.stringify(r.before);
    r.heldChanged = Object.keys(r.A).filter((k) => JSON.stringify(r.A[k]) !== JSON.stringify(r.B[k]));
    await p.screenshot({ path: `${OUT}/${row}-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 300); }
  r.pageErrors = errors; await browser.close();
  fs.writeFileSync(`${OUT}/${row}-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(row, `${w}x${h}`, r.error ?? `firstActed=${r.firstActed} heldChanged=[${r.heldChanged}] A=${JSON.stringify(r.A.c)} B=${JSON.stringify(r.B.c)} focus=${r.focusedAfterHeld.testid ?? r.focusedAfterHeld.label ?? r.focusedAfterHeld.tag}`);
}
