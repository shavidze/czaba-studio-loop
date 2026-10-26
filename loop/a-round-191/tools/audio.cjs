// AUDIO proof: real playback, output AnalyserNode peak (tapInit from c-round-190/tools/lib122.cjs, copied verbatim)
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const { tapInit } = require('../rv/tools/lib122.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function libDrop(p, src, lane, xFrac) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down();
  await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(lb.x + 2, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(tapInit); const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 90000 }); await sleep(3000);
  await libDrop(p, 'demo-middle-east', 'music', 0);
  const res = { tool: 'Playwright Chromium + AnalyserNode tap on every AudioDestinationNode connection (tapInit, c-round-190/tools/lib122.cjs)', windows: [] };
  const val = (sel) => p.locator(sel).first().evaluate((el) => ({ value: el.value, text: el.getAttribute('aria-valuetext') }));
  const windowPeak = async (label, ms = 1500) => { await p.evaluate(() => window.__tapStart()); await sleep(ms); const S = await p.evaluate(() => window.__tapStop()); const pk = Math.max(...S.map((s) => s.peak)); res.windows.push({ label, peak: +pk.toFixed(5), dbfs: +(20 * Math.log10(pk || 1e-9)).toFixed(2), n: S.length, master: await val('input[aria-label="Master Volume"]'), music: await val('[data-track-id=music] input[aria-label^="Volume — "]') }); console.log(JSON.stringify(res.windows[res.windows.length - 1])); };
  await p.mouse.click(5, 895); await p.keyboard.press('Space'); await sleep(1500);
  await windowPeak('master 0 dB, music 0 dB');
  const m = p.locator('input[aria-label="Master Volume"]'); const mb = await m.boundingBox();
  await p.mouse.move(mb.x + mb.width * 0.85, mb.y + mb.height / 2); await p.mouse.down(); await p.mouse.move(mb.x - 200, mb.y + mb.height / 2, { steps: 20 }); await p.mouse.up(); await sleep(400);
  await windowPeak('after Master drag down');
  await m.dblclick(); await sleep(400);
  await windowPeak('after Master double-click reset');
  await p.mouse.move(mb.x + mb.width * 0.85, mb.y + mb.height / 2); await p.mouse.down(); await p.mouse.move(mb.x + mb.width * 0.85 - 25, mb.y + mb.height / 2, { steps: 10 }); await p.mouse.up(); await sleep(400);
  await windowPeak('after Master partial drag down (25 px)');
  await p.mouse.move(mb.x + mb.width * 0.5, mb.y + mb.height / 2); await p.mouse.down(); await p.mouse.move(mb.x + mb.width * 0.5 + 25, mb.y + mb.height / 2, { steps: 10 }); await p.mouse.up(); await sleep(400);
  await windowPeak('after Master drag back up (25 px)');
  const v = p.locator('[data-track-id=music] input[aria-label^="Volume — "]'); const vb = await v.boundingBox();
  await p.mouse.move(vb.x + vb.width * 0.9, vb.y + vb.height / 2); await p.mouse.down(); await p.mouse.move(vb.x - 400, vb.y + vb.height / 2, { steps: 25 }); await p.mouse.up(); await sleep(400);
  await windowPeak('after music Volume drag to far left');
  await v.dblclick(); await sleep(400);
  await windowPeak('after music Volume double-click reset');
  await p.keyboard.press('Space');
  res.errors = errors; fs.writeFileSync(path.join(__dirname, '..', 'audio.json'), JSON.stringify(res, null, 1)); console.log('errors', errors.length);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
