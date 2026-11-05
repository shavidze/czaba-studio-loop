// C301 R301-HIDDEN-GRID-BG: Snap on, fixed 0.1 s grid; at 40 px/s lines hidden (data-snap-paused true) -> background drag is free (edges within 1 px of pointer); at 62.5 px/s lines visible -> same drag snaps to 0.1 s.
const L = require('./lib258.cjs'); const { sleep, fs, path } = L;
const ST = (page) => page.evaluate(() => ({ paused: [...document.querySelectorAll('[data-snap-paused]')].map((e) => e.getAttribute('data-snap-paused')), lines: document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-grid-lines'), div: document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-grid-division'), snap: document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-snap'), zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent, range: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').trim(), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
async function openMenu(page) { const pt = await page.evaluate(() => { for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); const x = r.left + r.width * 0.6, y = r.top + r.height / 2; if (document.elementFromPoint(x, y) === body) return { x, y }; } return null; }); await page.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400); return page.getByTestId('arrangement-grid-menu'); }
const parseRange = (s) => { const m = s.match(/(\d\d):(\d\d)\.(\d\d\d)\s*—\s*(\d\d):(\d\d)\.(\d\d\d)/); return m ? [(+m[1]) * 60 + (+m[2]) + (+m[3]) / 1000, (+m[4]) * 60 + (+m[5]) + (+m[6]) / 1000] : null; };
async function bgDrag(page, t0, t1, tag, k) {
  const rb = await page.locator('[data-testid="arrangement-ruler"]').boundingBox();
  const pps = parseFloat(await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
  const y = await page.evaluate(() => { for (const body of document.querySelectorAll('[data-track-id="music"] [data-grid-lines]')) { const r = body.getBoundingClientRect(); const yy = r.top + r.height / 2; if (document.elementFromPoint(r.left + 50, yy) === body) return yy; } return null; });
  const x0 = rb.x + t0 * pps, x1 = rb.x + t1 * pps;
  const hit = await page.evaluate(([x, yy]) => { const e = document.elementFromPoint(x, yy); return e ? (e.getAttribute('data-testid') || e.tagName) + '|' + (e.hasAttribute('data-grid-lines') ? 'lane-body' : '') : null; }, [x0, y]);
  await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x1, y, { steps: 10 }); await page.mouse.up(); await sleep(500);
  const s = await ST(page); const r = parseRange(s.range);
  await page.screenshot({ path: path.join(__dirname, 'shots', `music-${tag}-${k}.png`) });
  const errPx = r ? [Math.abs(r[0] - t0) * pps, Math.abs(r[1] - t1) * pps] : null;
  const snapped = r ? r.every((v) => Math.abs(v * 10 - Math.round(v * 10)) < 1e-6) : null;
  await page.keyboard.press('Escape'); await page.mouse.click(rb.x + 1.0 * pps, y); await sleep(400);
  return { pps, t0, t1, hit, range: s.range, parsed: r, errPx, snapped, state: s };
}
(async () => { const b = await L.chromium.launch(); const out = {};
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
  const { ctx, page, errors } = await L.open(b, vp, { pulse: false }); await L.blur(page);
  await page.keyboard.press('KeyG'); await sleep(300);
  const m = await openMenu(page); await m.getByRole('menuitemradio', { name: '0.1 s', exact: true }).click(); await sleep(400); await page.keyboard.press('Escape'); await sleep(200);
  r.at40 = await ST(page);
  r.hidden = await bgDrag(page, 3.437, 6.263, 'hidden', k);
  await page.keyboard.press('Equal'); await sleep(400); await page.keyboard.press('Equal'); await sleep(600);
  r.at62 = await ST(page);
  r.visible = await bgDrag(page, 3.437, 6.263, 'visible', k);
  r.errors = errors; await ctx.close();
  r.checks = { snapOn: r.at40.snap === 'on', hiddenAt40: r.at40.paused.includes('true'), freeHidden: !!r.hidden.errPx && r.hidden.errPx.every((e) => e <= 1) && r.hidden.snapped === false, visibleAt62: !r.at62.paused.includes('true'), snapsVisible: r.visible.snapped === true && !!r.visible.errPx && r.visible.errPx.every((e) => e <= 0.1 * r.visible.pps / 2 + 1), noErrors: errors.length === 0 };
  r.pass = Object.values(r.checks).every(Boolean); console.log(k, r.pass, JSON.stringify(r.checks), r.hidden.range, '|', r.visible.range, r.hidden.hit);
}
fs.writeFileSync(path.join(__dirname, 'hgbg-music.json'), JSON.stringify(out, null, 1)); await b.close(); })();
