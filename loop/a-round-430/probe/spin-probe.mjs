// SABA-B-12 stage 1 probe. Usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node spin-probe.mjs
// Per viewport: fresh context, add the first library sound, open Clip details, then per number field
// (clip gain, From, To): computed appearance, box, a gutter crop at rest and hovered, and the hover-vs-rest
// decoded pixel diff of the right 18 px crop (channel delta > 40 counted; spin visible = >= 6 changed px). A spin button shows as a gutter difference on hover in Chromium.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const vps = (process.argv[2] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const FIELDS = ['arrangement-detail-clip-gain-input', 'arrangement-detail-start', 'arrangement-detail-end'];
let diffPage = null;
const diff = async (a, b) => diffPage.evaluate(async ([x, y]) => {
  const load = (u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; });
  const [A, B] = await Promise.all([load(x), load(y)]);
  const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
  const da = px(A), db = px(B); let n = 0, max = 0;
  for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i]-db[i]), Math.abs(da[i+1]-db[i+1]), Math.abs(da[i+2]-db[i+2])); if (d > 40) n++; if (d > max) max = d; }
  return { changedPx: n, maxDelta: max, total: da.length / 4 };
}, ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')]);
const SPIN_PX = 6;
fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of vps) {
  const r = { vp: `${w}x${h}`, fields: {} }; const errors = [];
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    diffPage = await ctx.newPage(); await diffPage.setContent('<p>diff</p>');
    const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const opt = p.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first();
    await opt.waitFor({ timeout: 60000 }); await p.waitForTimeout(2500);
    await opt.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
    const toggle = p.getByTestId('arrangement-detail-toggle');
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') { await toggle.click(); await p.waitForTimeout(500); }
    await p.screenshot({ path: `${OUT}/panel-${w}.png` });
    for (const id of FIELDS) {
      const el = p.getByTestId(id); await el.waitFor({ timeout: 10000 });
      const info = await el.evaluate((e) => { const s = getComputedStyle(e); return { type: e.getAttribute('type'), disabled: e.disabled, value: e.value, appearance: s.appearance, webkitAppearance: s.webkitAppearance, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }; });
      const b = await el.boundingBox(); const clip = { x: b.x + b.width - 18, y: b.y, width: 18, height: b.height };
      await p.mouse.move(5, h - 5); await p.waitForTimeout(250);
      const rest = await p.screenshot({ clip }); 
      await p.mouse.move(b.x + b.width - 8, b.y + b.height / 2); await p.waitForTimeout(400);
      const hover = await p.screenshot({ clip });
      await p.screenshot({ path: `${OUT}/${id}-hover-${w}.png`, clip: { x: b.x - 4, y: b.y - 4, width: b.width + 8, height: b.height + 8 } });
      fs.writeFileSync(`${OUT}/${id}-gutter-rest-${w}.png`, rest); fs.writeFileSync(`${OUT}/${id}-gutter-hover-${w}.png`, hover);
      const d = await diff(rest, hover);
      const inner = { x: b.x + b.width - 17, y: b.y + 3, width: 14, height: b.height - 6 };
      let focus = null;
      if (!info.disabled) {
        await p.mouse.move(5, h - 5); await p.waitForTimeout(200);
        const innerRest = await p.screenshot({ clip: inner });
        await p.mouse.click(b.x + 4, b.y + b.height / 2); await p.mouse.move(5, h - 5); await p.waitForTimeout(400);
        const innerFocus = await p.screenshot({ clip: inner });
        await p.screenshot({ path: `${OUT}/${id}-focus-${w}.png`, clip: { x: b.x - 4, y: b.y - 4, width: b.width + 8, height: b.height + 8 } });
        focus = { focused: await el.evaluate((e) => document.activeElement === e), innerFocusVsRest: await diff(innerRest, innerFocus) };
        await p.keyboard.press('Escape'); await p.waitForTimeout(150);
      }
      let step = null;
      if (!info.disabled) { await el.focus(); const v0 = await el.inputValue(); await p.keyboard.press('ArrowUp'); const v1 = await el.inputValue(); await p.keyboard.press('Escape'); step = { before: v0, afterArrowUp: v1 }; }
      let commit = null;
      if (!info.disabled) {
        const typed = id === 'arrangement-detail-clip-gain-input' ? '2' : id === 'arrangement-detail-start' ? '1' : '3';
        await el.fill(typed); await el.press('Enter'); await p.waitForTimeout(500);
        commit = await p.evaluate((fid) => ({
          value: document.querySelector(`[data-testid="${fid}"]`)?.value ?? null,
          start: document.querySelector('[data-testid="arrangement-detail-start"]')?.value ?? null,
          end: document.querySelector('[data-testid="arrangement-detail-end"]')?.value ?? null,
          pending: !!document.querySelector('[data-testid="arrangement-detail-clip-gain-pending"]'),
          status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
        }), id);
        await p.keyboard.press('Control+z'); await p.waitForTimeout(300);
      }
      r.fields[id] = { ...info, gutterHoverVsRest: d, spinVisibleOnHover: d.changedPx >= SPIN_PX, step, focus, commit };
    }
  } catch (e) { r.error = String(e).slice(0, 400); }
  r.pageErrors = errors; await browser.close();
  fs.writeFileSync(`${OUT}/spin-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(r.vp, r.error ?? Object.entries(r.fields).map(([k, v]) => `${k.replace('arrangement-detail-','')}: app=${v.appearance} spin=${v.spinVisibleOnHover} px=${v.gutterHoverVsRest.changedPx}/max${v.gutterHoverVsRest.maxDelta} dis=${v.disabled} box=${v.w}x${v.h} step=${JSON.stringify(v.step)}`).join(' | '), 'errs', errors.length);
}
