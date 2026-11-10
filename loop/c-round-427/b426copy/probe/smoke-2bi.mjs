// SYS-2 stage 2b-i per-press smoke. Usage: BASE=... OUT=<abs dir> node smoke-2bi.mjs [1440x900,1280x720]. Pass on the sketch = equal to B's HEAD output.
import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const vps = (process.argv[2] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of vps) {
  const o = await open(base, w, h); const p = o.page; const errors = []; const r = { vp: `${w}x${h}` };
  p.on('pageerror', (e) => errors.push(String(e)));
  const attr = (loc, a) => loc.getAttribute(a);
  try {
    const snap = p.getByTestId('arrangement-snap-toggle'); r.snap = [await attr(snap, 'aria-pressed')];
    await snap.click(); r.snap.push(await attr(snap, 'aria-pressed')); await snap.click(); r.snap.push(await attr(snap, 'aria-pressed'));
    const env = p.getByTestId('arrangement-envelope-toggle'); r.env = [await attr(env, 'aria-pressed')];
    await env.click(); r.env.push(await attr(env, 'aria-pressed')); await env.click(); r.env.push(await attr(env, 'aria-pressed'));
    const fold = p.getByTestId('arrangement-library-tree').locator('button[aria-expanded]').first(); r.libFold = [await attr(fold, 'aria-expanded')];
    await fold.click(); r.libFold.push(await attr(fold, 'aria-expanded')); await fold.click(); r.libFold.push(await attr(fold, 'aria-expanded'));
    const folder = p.getByTestId('arrangement-library-folder').first(); await folder.click(); r.folderCurrent = await attr(folder, 'aria-current');
    const dt = p.getByTestId('arrangement-detail-toggle'); r.detail = [await attr(dt, 'aria-expanded')];
    await dt.click(); r.detail.push(await attr(dt, 'aria-expanded')); await dt.focus(); await p.keyboard.press(' '); await p.waitForTimeout(200); r.detail.push(await attr(dt, 'aria-expanded'));
    await p.getByTestId('arrangement-video-expand').click(); await p.waitForTimeout(300);
    r.videoFloat = [await p.getByTestId('arrangement-video-close').count()];
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); r.videoFloat.push(await p.getByTestId('arrangement-video-close').count());
    await p.getByTestId('arrangement-video-expand').click(); await p.waitForTimeout(300); await p.getByTestId('arrangement-video-close').click(); await p.waitForTimeout(300);
    r.videoFloat.push(await p.getByTestId('arrangement-video-close').count());
  } catch (e) { r.error = String(e).slice(0, 300); }
  r.pageErrors = errors; await o.browser.close();
  fs.writeFileSync(`${OUT}/smoke-${w}x${h}.json`, JSON.stringify(r, null, 1)); console.log(JSON.stringify(r));
}
