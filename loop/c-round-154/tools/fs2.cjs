// C round 152 — FUNC-SMOKE part 2: Export dialog + marker menu open/close with Escape, then a real project WAV export (duration, samples). node fs2.cjs <1440|1280>
const L = require('./lib.cjs'); const W = require('./wav.cjs');
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const VP = +process.argv[2] || 1440; const net = []; const res = { vp: VP, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `fs2-${VP}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 500)}`); } save(); };
(async () => {
  const b = await L.launch();
  try {
    const { page: p } = await L.openStudio(b, { width: VP, height: VP === 1280 ? 720 : 900 }, `fs2-${VP}`, net);
    await p.mouse.move(2, 2);
    await sec('snapOff', () => L.setSnapOff(p));
    await sec('add', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)]);
    await sec('marker', async () => { await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await L.sleep(400); const naming = await p.evaluate(() => document.activeElement && document.activeElement.tagName); await p.keyboard.press('Enter'); await L.sleep(400); return { naming, status: await L.status(p), n: await p.locator('[data-testid=arrangement-marker]').count() }; });
    await sec('markerMenu', async () => {
      const m = p.locator('[data-testid=arrangement-marker]').first(); const bb = await m.boundingBox();
      await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await L.sleep(500);
      const open = await p.locator('[data-testid=arrangement-marker-menu]').count();
      const items = await p.locator('[data-testid=arrangement-marker-menu] [role=menuitem]').allInnerTexts();
      await p.screenshot({ path: path.join(L.SHOTS, `fs2-marker-menu-${VP}.png`) });
      await p.keyboard.press('Escape'); await L.sleep(400);
      return { open, items, closedAfterEscape: (await p.locator('[data-testid=arrangement-marker-menu]').count()) === 0, markersAfter: await p.locator('[data-testid=arrangement-marker]').count() };
    });
    await sec('exportDialogEscape', async () => {
      await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await L.sleep(400);
      const title = await p.locator('#arrangement-export-title').innerText();
      await p.screenshot({ path: path.join(L.SHOTS, `fs2-export-${VP}.png`) });
      await p.keyboard.press('Escape'); await L.sleep(500);
      return { title, closedAfterEscape: (await p.locator('#arrangement-export-title').count()) === 0 };
    });
    await sec('projectEnd', () => p.evaluate(() => (document.querySelector('[data-testid=arrangement-project-end]') || {}).textContent));
    await sec('exportWav', async () => {
      await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await L.sleep(300);
      await p.click('[data-testid=arrangement-export-format-wav]').catch(() => {});
      await p.click('[data-testid=arrangement-export-scope-project]').catch(() => {});
      const btn = p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /Export WAV/ });
      const label = await btn.first().innerText();
      const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 240000 }), btn.first().click()]);
      const dst = path.join(L.OUT, `fs2-export-${VP}.wav`); await dl.saveAs(dst);
      await L.sleep(500); await p.keyboard.press('Escape').catch(() => {});
      const buf = fs.readFileSync(dst); const w = W.parse(buf); const s = W.stats(w);
      const sr = w.fmt.sr, ch = w.fmt.ch, fsMax = w.fmt.tag === 3 ? 1 : Math.pow(2, w.fmt.bits - 1);
      const win = (t0, t1) => { let pk = 0, ss = 0, c = 0; for (let f = Math.floor(t0 * sr); f < Math.min(w.frames, Math.floor(t1 * sr)); f++) for (let k = 0; k < ch; k++) { const v = Math.abs(w.read(f * ch + k)) / fsMax; if (v > pk) pk = v; ss += v * v; c++; } return { peak: +pk.toFixed(4), rmsDb: c ? +(10 * Math.log10(ss / c + 1e-20)).toFixed(1) : null }; };
      let firstAudible = null; for (let f = 0; f < w.frames; f++) { let a = 0; for (let k = 0; k < ch; k++) a = Math.max(a, Math.abs(w.read(f * ch + k)) / fsMax); if (a > 0.001) { firstAudible = +(f / sr).toFixed(4); break; } }
      return { label, suggested: dl.suggestedFilename(), bytes: buf.length, sha16: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16), riff: w.riff, fmt: w.fmt, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: s.nan, fullScale: s.full, peak: +s.peak.toFixed(4), rms: +s.rms.toFixed(5), firstAudible, win0_1: win(0, 1), win4_45: win(4, 4.5), tail: win(Math.max(0, w.seconds - 0.5), w.seconds) };
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  const X = require('./lib122.cjs'); res.net = X.netOk(net);
  save(); await b.close();
  console.log(JSON.stringify(res, null, 1).slice(0, 4000));
})();
