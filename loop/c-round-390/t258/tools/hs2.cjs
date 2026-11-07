// C round 258: RR-HIDDEN-SNAP retest with distinct click times and >= 1.2 s between clicks (INFO-B248-RULER-DBLCLICK)
const L = require('./lib258.cjs'); const { sleep, fs, path } = L;
const ST = (page) => page.evaluate(() => ({ m: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'), ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')), paused: [...document.querySelectorAll('[data-snap-paused]')].map((e) => e.getAttribute('data-snap-paused')), lines: document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-grid-lines'), div: document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-grid-division'), snap: document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-snap'), zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent }));
async function openMenu(page) { const pt = await page.evaluate(() => { for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); const x = r.left + r.width * 0.6, y = r.top + r.height / 2; if (document.elementFromPoint(x, y) === body) return { x, y }; } return null; }); await page.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400); return page.getByTestId('arrangement-grid-menu'); }
async function rclick(page, t) { const rb = await page.locator('[data-testid="arrangement-ruler"]').boundingBox(); const sl = await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft); const pps = parseFloat(await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent)); await page.mouse.click(rb.x + t * pps, rb.y + rb.height / 2); await sleep(1300); return { pps, sl, ...(await ST(page)) }; }
(async () => { const b = await L.chromium.launch(); const out = {};
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
  const { ctx, page, errors } = await L.open(b, vp, { pulse: false }); await L.blur(page);
  await page.keyboard.press('KeyG'); await sleep(300);
  const m = await openMenu(page); await m.getByRole('menuitemradio', { name: '0.1 s', exact: true }).click(); await sleep(400);
  r.at40 = await ST(page);
  r.c1 = await rclick(page, 3.437);
  r.c2 = await rclick(page, 5.263);
  await page.keyboard.press('Equal'); await sleep(400); await page.keyboard.press('Equal'); await sleep(600);
  r.at62 = await ST(page);
  r.c3 = await rclick(page, 3.437);
  r.c4 = await rclick(page, 6.263);
  await page.keyboard.press('Equal'); await sleep(600);
  r.at78 = await ST(page);
  r.c5 = await rclick(page, 4.437);
  r.errors = errors; await page.screenshot({ path: path.join(__dirname, '..', 'out', 'grid258', `hs2-${k}.png`) }); await ctx.close();
  const snapped = (v) => Math.abs(Number(v) * 10 - Math.round(Number(v) * 10)) < 1e-6;
  r.checks = { hiddenAt40: r.at40.paused.includes('true') && r.at40.snap === 'on', freeAt40: !snapped(r.c1.m) && !snapped(r.c2.m), visibleAt62: !r.at62.paused.includes('true'), snapsAt62: snapped(r.c3.m) && snapped(r.c4.m), snapsAt78: snapped(r.c5.m), errors: errors.length === 0 };
  r.pass = Object.values(r.checks).every(Boolean); console.log(k, r.pass, JSON.stringify(r.checks), [r.c1.m, r.c2.m, r.at62.zoom, r.at62.lines, r.c3.m, r.c4.m, r.at78.zoom, r.c5.m].join(' | ')); }
fs.writeFileSync(path.join(__dirname, '..', 'out', 'grid258', 'hs2.json'), JSON.stringify(out, null, 1)); await b.close(); })();
