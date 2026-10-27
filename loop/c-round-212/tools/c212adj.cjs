// C round 212 — §4 adjacent: first render after library Add (outline present at once), video clip lane waveform (owned synthetic media),
// clip move redraw, 1280 detail expand shows the detail path at once, no element carries the new `.antialiased` utility, track fader 1 component/move.
// usage: node c212adj.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c212lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
const geomH = (d) => { if (!d) return null; const h0 = (s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(16); };
  const r = [...d.matchAll(/M\d+ (\d+\.\d{3})h1V(\d+\.\d{3})h-1Z/g)]; if (r.length) return 'rects:' + h0(r.map((m) => m[1] + '/' + m[2]).join(','));
  const e = [...d.matchAll(/V(\d+\.\d{3})H\d+/g)]; const n = e.length / 2; return (/^M0 1(V\d+\.\d{3}H\d+)+Z$/.test(d) ? 'outline:' : 'other:') + h0(e.slice(0, n).map((m, i) => m[1] + '/' + e[e.length - 1 - i][1]).join(',')); };
const lanes = async (page) => (await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind]')].map((c) => { const s = c.querySelector('[data-testid=arrangement-clip-waveform]'); const p = s && s.querySelector(':scope > path'); return { kind: c.getAttribute('data-clip-kind'), t: c.textContent.slice(0, 14), vb: s && s.getAttribute('viewBox'), d: p ? p.getAttribute('d') : null }; }))).map((x) => ({ ...x, d: geomH(x.d) }));
(async () => {
  const br = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const ctx = await br.newContext({ viewport: { width: vw, height: vh } });
    await ctx.addInitScript(() => { try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 90000 });
    await L.sleep(2500);
    R.detailToggleExpandedAtLoad = await page.getByTestId('arrangement-detail-toggle').getAttribute('aria-expanded');
    // first render after Add: poll per animation frame until the lane path exists
    await page.evaluate(() => { window.__first = null; const t0 = performance.now(); const tick = () => { const p = document.querySelector('[data-clip-kind="audio"] [data-testid=arrangement-clip-waveform] > path'); if (p) { window.__first = { ms: Math.round(performance.now() - t0), d: p.getAttribute('d').slice(0, 30), len: p.getAttribute('d').length }; return; } if (performance.now() - t0 < 10000) requestAnimationFrame(tick); }; window.__startFirst = () => requestAnimationFrame(tick); });
    await page.evaluate(() => window.__startFirst());
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await L.sleep(2500);
    R.firstLanePath = await page.evaluate(() => window.__first);
    R.afterAdd = await lanes(page);
    // select clip; at 1280 expand the detail panel and read the detail path in the next frames
    await L.selectFirstClip(page);
    const tg = page.getByTestId('arrangement-detail-toggle');
    if ((await tg.getAttribute('aria-expanded')) === 'false') {
      await page.evaluate(() => { window.__dt = []; const t0 = performance.now(); let n = 0; const tick = () => { const p = document.querySelector('[data-testid=arrangement-detail-waveform] svg[viewBox$=" 2"] > path'); window.__dt.push({ ms: Math.round(performance.now() - t0), has: !!p }); if (++n < 30) requestAnimationFrame(tick); }; document.querySelector('[data-testid=arrangement-detail-toggle]').addEventListener('click', () => requestAnimationFrame(tick), { once: true }); });
      await tg.click(); await L.sleep(1000);
      const dt = await page.evaluate(() => window.__dt);
      R.detailExpand = { firstFrameWithPath: (dt.find((x) => x.has) || {}).ms ?? null, frames: dt.length };
    }
    R.detailPath = await page.evaluate(() => { const p = document.querySelector('[data-testid=arrangement-detail-waveform] svg[viewBox$=" 2"] > path'); return p ? p.getAttribute('d').slice(0, 20) : null; });
    R.antialiasedElements = await page.evaluate(() => document.querySelectorAll('.antialiased').length);
    R.bodyFontSmoothing = await page.evaluate(() => getComputedStyle(document.body).webkitFontSmoothing || null);
    // clip move by keyboard nudge? use drag of clip header 40 px
    const clip = page.locator('[data-clip-kind="audio"]').first();
    const startBefore = await clip.getAttribute('data-clip-start');
    const hb = await page.locator('[data-clip-kind="audio"] > div').first().boundingBox();
    await page.mouse.move(hb.x + 30, hb.y + hb.height / 2); await page.mouse.down();
    await page.mouse.move(hb.x + 90, hb.y + hb.height / 2, { steps: 10 });
    R.moveMid = (await lanes(page)).filter((x) => x.kind === 'audio');
    await page.mouse.up(); await L.sleep(500);
    R.move = { startBefore, startAfter: await clip.getAttribute('data-clip-start'), undo: (await L.undoTitle(page)).title };
    R.moveAfter = (await lanes(page)).filter((x) => x.kind === 'audio');
    // video clip with an audio stream (owned synthetic media)
    await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles('/home/runner/czaba-project/tmp/studio-real-loop/media/clip-3s-h264-aac.mov');
    await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
    await L.sleep(3000);
    R.video = (await lanes(page)).filter((x) => x.kind === 'video');
    // track fader: 1 component per move (commit counter from lib init is not installed here -> use a fresh lib context)
    R.errors = errors;
    await page.screenshot({ path: `${L.SHOTS}/adj-${tag}-${vw}.png` });
    await ctx.close();
    const o = await L.openLab(br, base, vw, vh);
    const tf = L.sl(o.page, /^Volume — Stems/);
    if (await tf.count()) {
      const d = await L.drag(o.page, tf.first(), 'track', {});
      R.trackFader = { winMax: d.winMax, winPerMove: d.winPerMove, releaseCommits: d.releaseCommits, statusDuring: d.statusDuring.length };
    } else R.trackFader = 'no slider';
    await o.ctx.close();
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await br.close();
  L.save(`adj-${tag}-${vw}.json`, R);
  console.log(tag, vw, R.fatal || '', JSON.stringify({ first: R.firstLanePath, detailExpand: R.detailExpand, detailPath: R.detailPath, aa: R.antialiasedElements, fs: R.bodyFontSmoothing, afterAdd: R.afterAdd, move: R.move, moveMid: R.moveMid, video: R.video, track: R.trackFader, errors: R.errors }));
})();
