// SYS-2 stage 1 browser probe. Usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node held-enter.mjs [rows] [1440x900,1280x720]
// Each row: fresh context, a recipe, then focus the button, one Enter keydown (fresh), read state A, three more Enter keydowns
// (Playwright sends them with repeat=true), Enter keyup, read state B. PASS on the sketch = B equals A for every field.
import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const only = (process.argv[2] ?? 'FOLLOW,LOOP,SPLIT,ZOOMRANGE,BACK,FLAG').split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const sel = (p, rx) => p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: rx }).first().click();
const state = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const undo = [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.textContent.trim()));
  const loop = [...document.querySelectorAll('[data-testid="arrangement-transport-centre"] button')].find((b) => /Loop/.test(b.textContent));
  return { follow: q('[data-testid="arrangement-follow"]')?.getAttribute('data-follow-mode'), loop: loop?.getAttribute('aria-pressed'),
    zoom: q('[data-testid="arrangement-zoom-readout"]')?.textContent, zoomBack: q('[data-testid="arrangement-zoom-back"]')?.getAttribute('title'),
    undo: undo?.getAttribute('title'), clips: document.querySelectorAll('[data-clip-id]').length,
    marker: q('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker'), starts: window.__starts.length };
});
const addClip = async (p) => { await sel(p, /Full mix/); await p.keyboard.press('Enter'); await p.waitForTimeout(1200); };
const selectClip = async (p) => { const bb = await p.locator('[data-clip-id]').first().boundingBox();
  await p.mouse.click(bb.x + bb.width * 0.4, bb.y + bb.height * 0.7); await p.waitForTimeout(400); };
const range = async (p) => { const bb = await p.locator('[data-clip-id]').first().boundingBox();
  await p.mouse.move(bb.x + bb.width * 0.3, bb.y + bb.height * 0.7); await p.mouse.down();
  await p.mouse.move(bb.x + bb.width * 0.45, bb.y + bb.height * 0.7, { steps: 6 }); await p.mouse.move(bb.x + bb.width * 0.6, bb.y + bb.height * 0.7, { steps: 6 });
  await p.mouse.up(); await p.waitForTimeout(300); };
const play = async (p) => { await p.getByRole('button', { name: 'Play' }).click(); await p.waitForTimeout(1200); };
const marker = async (p) => { await p.getByTestId('arrangement-marker-add').click(); await p.waitForTimeout(300);
  await p.keyboard.type('Verse'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); };
const recipes = {
  FOLLOW: async (p) => ({ target: p.getByTestId('arrangement-follow') }),
  LOOP: async (p) => { await addClip(p); await range(p); return { target: p.getByTestId('arrangement-transport-centre').getByRole('button', { name: /Loop/ }) }; },
  SPLIT: async (p) => { await addClip(p); await selectClip(p); return { target: p.getByRole('button', { name: /Split/ }) }; },
  ZOOMRANGE: async (p) => { await addClip(p); await range(p); return { target: p.getByTestId('arrangement-zoom-range') }; },
  BACK: async (p) => { await addClip(p); await play(p); return { target: p.getByRole('button', { name: /Back to start/i }) }; },
  FLAG: async (p) => { await addClip(p); await marker(p); await play(p); return { target: p.locator('[data-marker-id]').first() }; },
};
fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of vps) for (const row of only) {
  let r = { row, vp: `${w}x${h}` }; const o = await open(base, w, h); const p = o.page; const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  try {
    const { target } = await recipes[row](p);
    r.before = await state(p); await target.focus(); r.focused = await p.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.trim().slice(0, 40));
    await p.keyboard.down('Enter'); await p.waitForTimeout(250); r.A = await state(p);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await p.waitForTimeout(120); }
    await p.keyboard.up('Enter'); await p.waitForTimeout(500); r.B = await state(p);
    r.firstActed = JSON.stringify(r.A) !== JSON.stringify(r.before);
    r.heldChanged = Object.keys(r.A).filter((k) => k !== 'starts' || row === 'BACK' || row === 'FLAG').filter((k) => JSON.stringify(r.A[k]) !== JSON.stringify(r.B[k]));
    await p.screenshot({ path: `${OUT}/${row}-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 300); }
  r.pageErrors = errors; await o.browser.close();
  fs.writeFileSync(`${OUT}/${row}-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(row, `${w}x${h}`, r.error ?? `firstActed=${r.firstActed} heldChanged=[${r.heldChanged}]`);
}
