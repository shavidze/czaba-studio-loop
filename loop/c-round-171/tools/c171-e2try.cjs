// C round 171 — E2 timing experiment: how long does Cancel stay visible during a real WAV render? node c171-e2try.cjs <W> <nclips>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const N = +(process.argv[3] || 1);
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c171e2try-${W}-${N}`, net);
  const LANES = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId).filter((v, i, a) => a.indexOf(v) === i)); console.log('lanes', LANES); const adds = []; for (const ln of ['music', 'stems', 'sfx']) { adds.push(await L.addAt(p, 'demo-middle-east', ln, 1)); const cs = (await L.clipsDom(p)).filter((c) => c.lane === ln); await L.selectClip(p, cs[0].id); await L.blur(p); for (let i = 0; i < N; i++) { await p.keyboard.press('Control+d'); await sleep(400); } } await p.keyboard.press('Escape');
  const clips = await L.clipsDom(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(500);
  await p.evaluate(() => { window.__tl = []; const t0 = performance.now(); const snap = () => { const c = !!document.querySelector('[data-testid=arrangement-export-cancel]'); const l = window.__tl.at(-1); if (!l || l.c !== c) window.__tl.push({ t: Math.round(performance.now() - t0), c }); }; new MutationObserver(snap).observe(document.body, { childList: true, subtree: true }); snap(); });
  const eb = await p.locator('[data-testid=arrangement-export-footer] button', { hasText: /^Export WAV$/ }).boundingBox();
  await p.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2);
  const t0 = Date.now(); while (Date.now() - t0 < 120000 && log.downloads.length === 0) await sleep(200);
  await sleep(1000);
  console.log(JSON.stringify({ fonts: log.fontsReady.ok, adds: adds.map((a) => a.status), clips: clips.map((c) => [c.lane, c.start, c.wdur]), tl: await p.evaluate(() => window.__tl), dl: log.downloads.map((d) => [d.name, d.size]), ms: Date.now() - t0 }));
  await ctx.close(); await b.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
