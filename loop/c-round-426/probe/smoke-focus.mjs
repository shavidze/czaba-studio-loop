// Rows 5 (per-press mouse + Space smoke) and 6 (focus targets) for round 426. Usage: BASE=... OUT=<abs dir> node smoke-focus.mjs [1440x900,1280x720]
import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const vps = (process.argv[2] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
fs.mkdirSync(OUT, { recursive: true });
const names = (p) => p.getByRole('button', { name: / — set as the active track/ });
const hdr = (p, i) => p.locator('[data-testid="arrangement-track-header"]').nth(i);
const pressed = (l) => l.getAttribute('aria-pressed');
const ring = (p) => p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e);
  return { tag: e.tagName, type: e.getAttribute('type'), testid: e.getAttribute('data-testid'), label: e.getAttribute('aria-label'),
    focusVisible: e.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow }; });
for (const [w, h] of vps) {
  const r = { vp: `${w}x${h}` }; const o = await open(base, w, h); const p = o.page; const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  try {
    await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: /Full mix/ }).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
    const mute = hdr(p, 1).getByRole('button', { name: /^Mute — / }); const solo1 = hdr(p, 1).getByRole('button', { name: /^Solo — / }); const solo2 = hdr(p, 2).getByRole('button', { name: /^Solo — / });
    const mm = p.getByRole('button', { name: 'Master Mute', exact: true }); const metro = p.getByTestId('arrangement-metronome-toggle');
    const t = p.getByTestId('arrangement-tempo-input'); await t.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('120'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    r.clicks = {};
    for (const [k, l] of [['trackMute', mute], ['trackSolo', solo1], ['masterMute', mm], ['metronome', metro]]) {
      const a = await pressed(l); await l.click(); await p.waitForTimeout(150); const b = await pressed(l); await l.click(); await p.waitForTimeout(150); const c = await pressed(l);
      r.clicks[k] = [a, b, c];
    }
    await solo1.click(); await p.waitForTimeout(100); await solo2.click({ modifiers: ['Control'] }); await p.waitForTimeout(150);
    r.ctrlSolo = [await pressed(solo1), await pressed(solo2)]; await solo1.click(); await p.waitForTimeout(100); if ((await pressed(solo2)) === 'true') await solo2.click(); await p.waitForTimeout(100);
    await names(p).nth(1).click(); await names(p).nth(2).click({ modifiers: ['Shift'] }); await p.keyboard.press('Control+g'); await p.waitForTimeout(400);
    const gf = p.getByTestId('arrangement-group-fold').first(); const gfa = await gf.getAttribute('aria-expanded'); await gf.click(); await p.waitForTimeout(200); const gfb = await gf.getAttribute('aria-expanded'); await gf.click(); await p.waitForTimeout(200);
    r.groupFold = [gfa, gfb, await gf.getAttribute('aria-expanded')];
    await p.mouse.click(5, h - 5); await p.keyboard.press('Escape');
    const pos = () => p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]') ? performance.now() : 0);
    const clock = () => p.locator('[data-testid="arrangement-transport-centre"]').innerText();
    const t0 = await clock(); await p.locator('body').press('Space'); await p.waitForTimeout(1200); const t1 = await clock(); await p.locator('body').press('Space'); await p.waitForTimeout(150); const t2 = await clock(); await p.waitForTimeout(500); const t3 = await clock();
    r.space = { t0, t1, t2, t3 };
    // Row 6a: Pan reset focus target
    const slider = hdr(p, 2).getByRole('slider', { name: /Pan/ }); await slider.focus(); for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowRight');
    const reset = hdr(p, 2).getByTestId('arrangement-track-pan-reset'); await reset.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    r.panReset = { readout: (await reset.innerText()).trim(), active: await ring(p) };
    // Row 6b/6c: group name editor focus target
    const gn = p.getByTestId('arrangement-group-name').first(); await gn.focus(); await p.keyboard.press('F2'); await p.waitForTimeout(200); await p.keyboard.press('Control+A'); await p.keyboard.type('Bed'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    r.groupEnter = { name: await p.getByTestId('arrangement-group-name').first().getAttribute('aria-label'), active: await ring(p) };
    await p.keyboard.press('F2'); await p.waitForTimeout(200); await p.keyboard.press('Control+A'); await p.keyboard.type('X'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    r.groupEscape = { name: await p.getByTestId('arrangement-group-name').first().getAttribute('aria-label'), active: await ring(p) };
    await p.screenshot({ path: `${OUT}/smoke-focus-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 400); }
  r.pageErrors = errors; await o.browser.close();
  fs.writeFileSync(`${OUT}/smoke-focus-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(JSON.stringify(r).slice(0, 1500));
}
