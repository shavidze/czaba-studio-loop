const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, '..', 'out'); const SH = path.join(__dirname, '..', 'shots'); fs.mkdirSync(SH, { recursive: true });
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const init = () => {
  const S = (window.__t = { ins: null, rem: null, pre: [] }); let dummy = null; let n = 0;
  new MutationObserver((ms) => { for (const m of ms) { for (const a of m.addedNodes) if (a.nodeType === 1 && a.matches('[data-testid=entrance-loader]') && S.ins === null) S.ins = performance.now(); for (const r of m.removedNodes) if (r.nodeType === 1 && r.matches('[data-testid=entrance-loader]') && S.rem === null) S.rem = performance.now(); } }).observe(document, { childList: true, subtree: true });
  const read = () => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (!ov || S.ins === null) return; const w = ov.querySelector('span.block')?.parentElement; if (!w) return; let o = 1; for (let c = w; c; c = c.parentElement) { o *= +getComputedStyle(c).opacity; if (c === ov) break; } const r = ov.getBoundingClientRect(); const wr = w.getBoundingClientRect(); S.pre.push([Math.round(performance.now() - S.ins), +o.toFixed(3), Math.round(r.height), Math.round(wr.y + wr.height / 2), ov.parentElement === document.body]); };
  const tick = () => { if (document.body && document.querySelector('[data-testid=entrance-loader]') && (!dummy || !dummy.isConnected)) { dummy = document.createElement('div'); dummy.style.cssText = 'position:fixed;left:-9999px;top:0;height:1px;'; document.body.appendChild(dummy); new ResizeObserver(read).observe(dummy); } n++; if (dummy) dummy.style.width = (n % 2 + 1) + 'px'; if (performance.now() < 12000) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
};
(async () => {
  const b = await L.chromium.launch({ headless: true }); const res = { timing1440: [], shots: [] };
  for (let i = 0; i < (process.env.SKIP_T ? 0 : 3); i++) {
    const ctx = await b.newContext({ viewport: VPS[1440] }); await ctx.addInitScript(init); const p = await ctx.newPage();
    await p.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(3000);
    const t = await p.evaluate(() => window.__t);
    let best = 0, run = 0, prev = null; for (const [ms, o] of t.pre) { if (o >= 0.9) { if (prev !== null && run >= 0) run += ms - prev; prev = ms; best = Math.max(best, run); } else { run = 0; prev = null; } }
    const r = { load: i, durMs: t.ins && t.rem ? Math.round(t.rem - t.ins) : null, insAt: Math.round(t.ins), prepaintSamples: t.pre.length, logoGe09SpanMs: best, overlayHeights: [...new Set(t.pre.map((x) => x[2]))], logoCentreY: [...new Set(t.pre.map((x) => x[3]))].slice(0, 6), parentIsBody: t.pre.every((x) => x[4]) };
    res.timing1440.push(r); console.log(JSON.stringify(r)); await ctx.close();
  }
  for (const W of [375, 1440]) for (const at of [550, 800]) {
    const ctx = await b.newContext({ viewport: VPS[W] }); await ctx.addInitScript(init); const p = await ctx.newPage();
    await p.goto(L.BASE + '/', { waitUntil: 'commit' });
    await p.waitForFunction(() => window.__t && window.__t.ins !== null, null, { timeout: 15000, polling: 'raf' });
    await p.waitForFunction((a) => performance.now() - window.__t.ins >= a, at, { timeout: 15000, polling: 'raf' }); const shotAt = await p.evaluate(() => Math.round(performance.now() - window.__t.ins));
    const f = path.join(SH, `mid-${W}-${at}.png`); await p.screenshot({ path: f });
    const info = await p.evaluate(() => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (!ov) return { ov: false }; const s = [...ov.querySelectorAll('span')].find((x) => x.textContent.trim() === 'CZABA'); const r = s.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { ov: true, ms: Math.round(performance.now() - window.__t.ins), logo: [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)], topInOverlay: ov.contains(top), tagline: !!ov.querySelector('p') && ov.querySelector('p').textContent }; });
    res.shots.push({ W, at, shotAt, f: path.basename(f), ...info }); console.log(W, at, shotAt, JSON.stringify(info)); await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(OUT, process.env.SKIP_T ? 'shots-after.json' : 'timing-after.json'), JSON.stringify(res, null, 2));
})();
