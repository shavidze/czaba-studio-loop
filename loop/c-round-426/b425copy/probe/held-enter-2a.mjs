// SYS-2 stage 2a browser probe. Usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node held-enter-2a.mjs [rows] [1440x900,1280x720]
// Each cell: fresh context, a recipe, focus the target, one fresh Enter keydown (state A), three more Enter keydowns
// (Playwright sends them with repeat=true) on whatever holds focus, Enter keyup, state B. PASS on the sketch = firstActed and B equals A.
import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const ALL = 'LMUTE,LSOLO,LFOLD,LNAME,LVIDEO,PANRESET,GFOLD,GMUTE,GSOLO,GNAME,GEDIT,MMUTE,MPEAK,METRO';
const only = (process.argv[2] ?? ALL).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const state = (p) => p.evaluate(() => {
  const all = (s, a) => [...document.querySelectorAll(s)].map((e) => e.getAttribute(a)).join(',');
  const undo = [...document.querySelectorAll('button')].find((b) => /^Undo/.test((b.getAttribute('title') ?? b.textContent).trim()));
  return {
    pressed: all('button[aria-pressed]', 'aria-pressed'), folded: all('[data-track-folded]', 'data-track-folded'),
    trackSel: all('[data-track-id]', 'data-track-selected'), groupSel: all('[data-group-id]', 'data-group-selected'),
    groupCollapsed: all('[data-group-id]', 'data-group-collapsed'), groupNames: all('[data-testid="arrangement-group-name"]', 'aria-label'),
    nameInput: !!document.querySelector('[data-testid="arrangement-group-name-input"]'), undo: undo?.getAttribute('title') ?? null,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
    pan: [...document.querySelectorAll('[data-testid="arrangement-track-pan-reset"]')].map((b) => b.textContent.trim()).join(','),
    chooser: window.__chooser ?? 0,
  };
});
const hdr = (p, name) => p.locator('[data-testid="arrangement-track-header"]').filter({ has: p.getByRole('button', { name: new RegExp('^' + name + ' — set as the active track') }) });
const firstAudio = async (p) => (await p.locator('[data-testid="arrangement-track-header"]').nth(1).getByRole('button', { name: / — set as the active track/ }).getAttribute('aria-label')).split(' — ')[0];
const nonActiveAudio = async (p) => (await p.locator('[data-testid="arrangement-track-header"]').nth(2).getByRole('button', { name: / — set as the active track/ }).getAttribute('aria-label')).split(' — ')[0];
const makeGroup = async (p) => { const names = p.getByRole('button', { name: / — set as the active track/ });
  await names.nth(1).click(); await names.nth(2).click({ modifiers: ['Shift'] }); await p.keyboard.press('Control+g'); await p.waitForTimeout(400);
  await p.getByTestId('arrangement-group-fold').first().waitFor({ timeout: 10000 }); };
const recipes = {
  LMUTE: async (p) => ({ target: hdr(p, await firstAudio(p)).getByRole('button', { name: /^Mute — / }) }),
  LSOLO: async (p) => ({ target: hdr(p, await firstAudio(p)).getByRole('button', { name: /^Solo — / }) }),
  LFOLD: async (p) => ({ target: p.getByTestId('arrangement-track-fold').nth(1) }),
  LNAME: async (p) => ({ target: hdr(p, await nonActiveAudio(p)).getByRole('button', { name: / — set as the active track/ }) }),
  LVIDEO: async (p) => ({ target: p.getByRole('button', { name: /Your own video/ }).first() }),
  PANRESET: async (p) => { const n = await firstAudio(p); const s = hdr(p, n).getByRole('slider', { name: /Pan/ });
    await s.focus(); for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
    return { target: p.getByRole('button', { name: new RegExp('^Reset Pan to centre — ' + n) }) }; },
  GFOLD: async (p) => { await makeGroup(p); return { target: p.getByTestId('arrangement-group-fold').first() }; },
  GMUTE: async (p) => { await makeGroup(p); return { target: p.getByTestId('arrangement-group-mute').first() }; },
  GSOLO: async (p) => { await makeGroup(p); return { target: p.getByTestId('arrangement-group-solo').first() }; },
  GNAME: async (p) => { await makeGroup(p); await p.getByRole('button', { name: / — set as the active track/ }).nth(0).click(); await p.waitForTimeout(200);
    return { target: p.getByTestId('arrangement-group-name').first() }; },
  GEDIT: async (p) => { await makeGroup(p); const n = p.getByTestId('arrangement-group-name').first(); await n.focus(); await p.keyboard.press('F2'); await p.waitForTimeout(200);
    await p.keyboard.press('Control+A'); await p.keyboard.type('Bed'); return { target: p.getByTestId('arrangement-group-name-input') }; },
  MMUTE: async (p) => ({ target: p.getByRole('button', { name: 'Master Mute' }) }),
  MPEAK: async (p) => ({ target: p.getByTestId('arrangement-master-peak') }),
  METRO: async (p) => { const t = p.getByTestId('arrangement-tempo-input'); await t.focus(); await p.keyboard.press('Control+A'); await p.keyboard.type('120'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    return { target: p.getByTestId('arrangement-metronome-toggle') }; },
};
fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of vps) for (const row of only) {
  const r = { row, vp: `${w}x${h}` }; const o = await open(base, w, h); const p = o.page; const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('filechooser', async (fc) => { await p.evaluate(() => { window.__chooser = (window.__chooser ?? 0) + 1; }); });
  try {
    const { target, ctrl } = await recipes[row](p);
    r.before = await state(p); await target.focus();
    r.focusedBefore = await p.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.textContent?.trim().slice(0, 40));
    if (ctrl) await p.keyboard.down('Control');
    await p.keyboard.down('Enter'); await p.waitForTimeout(300); r.A = await state(p);
    r.focusedAfterFirst = await p.evaluate(() => ({ tag: document.activeElement?.tagName, type: document.activeElement?.getAttribute('type'), testid: document.activeElement?.getAttribute('data-testid'), label: document.activeElement?.getAttribute('aria-label') }));
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await p.waitForTimeout(150); }
    await p.keyboard.up('Enter'); if (ctrl) await p.keyboard.up('Control'); await p.waitForTimeout(500); r.B = await state(p);
    r.firstActed = JSON.stringify(r.A) !== JSON.stringify(r.before);
    r.heldChanged = Object.keys(r.A).filter((k) => JSON.stringify(r.A[k]) !== JSON.stringify(r.B[k]));
    await p.screenshot({ path: `${OUT}/${row}-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 300); }
  r.pageErrors = errors; await o.browser.close();
  fs.writeFileSync(`${OUT}/${row}-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(row, `${w}x${h}`, r.error ?? `firstActed=${r.firstActed} heldChanged=[${r.heldChanged}]`);
}
