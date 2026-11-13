// SYS-2 stage 5 browser probe. Usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node held-enter-s5.mjs [rows] [vps]
// Each cell: fresh context, recipe, focus the target, one fresh Enter keydown (state A), three Enter keydowns with repeat
// (Playwright keyboard.down on a held key sends repeat=true), Enter keyup, state B. PASS on a fixed tree = firstActed and B equals A.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const ALL = 'MADD,MEDIT,MFLAG,LMENU';
const only = (!process.argv[2] || process.argv[2] === 'ALL' ? ALL : process.argv[2]).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const state = (p) => p.evaluate(() => ({
  markers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((e) => `${e.dataset.markerTime}:${e.getAttribute('aria-current')}`).join(','),
  editor: !!document.querySelector('[data-testid="arrangement-marker-name-input"]'),
  libraryMenu: !!document.querySelector('[role="menu"]'),
  status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
  undo: document.querySelector('button[aria-label^="Undo"]')?.getAttribute('title') ?? null,
  insert: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('style') ?? null,
  clock: document.querySelector('[data-testid="arrangement-transport-centre"]')?.textContent?.match(/\d+:\d+[.:]\d+/)?.[0] ?? null,
}));
const focused = (p) => p.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, testid: a?.getAttribute('data-testid'), label: a?.getAttribute('aria-label'), text: a?.textContent?.trim().slice(0, 30), focusVisible: a?.matches(':focus-visible') ?? false, outline: a ? getComputedStyle(a).outlineStyle : null }; });
const ready = async (p) => {
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first().waitFor({ timeout: 60000 });
  await p.waitForFunction(() => !/Loading/.test(document.querySelector('[role=listbox]')?.textContent ?? ''), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(2500);
};
const addMarker = async (p) => { await p.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {}); await p.keyboard.press('m'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(400); };
const recipes = {
  MADD: async (p) => ({ target: p.getByTestId('arrangement-marker-add') }),
  MEDIT: async (p) => { await p.getByTestId('arrangement-marker-add').click(); await p.waitForTimeout(400); return { target: p.getByTestId('arrangement-marker-name-input') }; },
  MFLAG: async (p) => {
    const ruler = p.getByTestId('arrangement-ruler'); const b = await ruler.boundingBox();
    await p.mouse.click(b.x + 400, b.y + b.height - 3); await p.waitForTimeout(300);
    await p.keyboard.press('m'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
    await p.mouse.click(b.x + 80, b.y + b.height - 3); await p.waitForTimeout(400);
    return { target: p.getByTestId('arrangement-marker').first() }; },
  LMENU: async (p) => {
    const opts = p.getByRole('listbox', { name: 'Sounds' }).getByRole('option'); const n = await opts.count();
    for (let i = 0; i < n; i++) { const o = opts.nth(i); await o.focus(); await p.keyboard.press('Shift+F10'); await p.waitForTimeout(250); if (await p.locator('[role="menu"]').count()) return { target: p.locator('[role="menu"] [role="menuitem"]').first(), keepFocus: true }; }
    throw new Error('no mapped library option opens a menu');
  },
};
fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of vps) for (const row of only) {
  const r = { row, vp: `${w}x${h}` }; const errors = [];
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    let popups = 0; ctx.on('page', () => { popups++; });
    await ctx.route(/\/products\//, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>store</p>' }));
    const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await ready(p);
    const { target, keepFocus } = await recipes[row](p);
    await target.waitFor({ timeout: 15000 });
    if (!keepFocus) { await target.focus(); }
    await p.waitForTimeout(150);
    r.before = await state(p); r.before.popups = popups;
    await p.keyboard.down('Enter'); await p.waitForTimeout(400); r.A = await state(p); r.A.popups = popups;
    r.focusedAfterFirst = await focused(p);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await p.waitForTimeout(200); }
    await p.keyboard.up('Enter'); await p.waitForTimeout(600); r.B = await state(p); r.B.popups = popups;
    r.focusedAfterHeld = await focused(p);
    r.firstActed = JSON.stringify(r.A) !== JSON.stringify(r.before);
    r.heldChanged = Object.keys(r.A).filter((k) => JSON.stringify(r.A[k]) !== JSON.stringify(r.B[k]));
    await p.screenshot({ path: `${OUT}/${row}-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 300); }
  r.pageErrors = errors; await browser.close();
  fs.writeFileSync(`${OUT}/${row}-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(row, `${w}x${h}`, r.error ?? `firstActed=${r.firstActed} heldChanged=[${r.heldChanged}] before=${JSON.stringify(r.before)} A=${JSON.stringify(r.A)} B=${JSON.stringify(r.B)} focus=${r.focusedAfterHeld.testid ?? r.focusedAfterHeld.label ?? r.focusedAfterHeld.tag} errs=${errors.length}`);
}
