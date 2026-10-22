const X = require('../../c-round-86/tools/lib86.cjs'); const { L, sleep, blur } = X;
(async () => {
  const s = await L.open('1440x900'); const p = s.page; await L.fresh(p); await sleep(300);
  const S = await X.setup(p); await blur(p);
  const out = { clips: S.clips.map((c) => [c.lane, c.start, c.dur]) };
  const music = S.clips.find((c) => c.lane === 'music');
  const el = await p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  out.el = el;
  // select all clips: click first, shift-click others
  for (let k = 0; k < 1; k++) { const c = el[k]; await p.mouse.click(Math.round(c.x + Math.min(c.w / 2, 20)), Math.round(c.y + c.h - 8), { modifiers: k ? ['Shift'] : [] }); await sleep(150); }
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Control+d'); await sleep(600); }
  await blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(400);
  out.label = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-project]').closest('label').innerText);
  await p.evaluate(() => { window.__g = []; let l = performance.now(); window.__r = true; const t = () => { const n = performance.now(); window.__g.push(n - l); l = n; if (window.__r) requestAnimationFrame(t); }; requestAnimationFrame(t); });
  const dl = p.waitForEvent('download', { timeout: 120000 }); const t0 = Date.now();
  await p.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click(); const d = await dl; out.wavMs = Date.now() - t0; await sleep(500);
  out.gaps = await p.evaluate(() => { window.__r = false; return window.__g.slice().sort((a, b) => b - a).slice(0, 6).map(Math.round); });
  const fs = require('fs'); out.frames = (fs.statSync(await d.path()).size - 44) / 6; await d.delete();
  out.msg = await p.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert]')].map((e) => e.textContent).join(' | '));
  console.log(JSON.stringify(out)); await s.browser?.close?.(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
