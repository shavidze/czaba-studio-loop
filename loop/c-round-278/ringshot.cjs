const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = process.argv[2]; const LABEL = process.argv[3];
(async () => { const b = await chromium.launch(); const out = {};
 for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 4 }); const p = await ctx.newPage();
  await p.goto(BASE + '/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 }); await p.waitForTimeout(1500);
  const m = p.getByTestId('arrangement-metronome-toggle');
  // keyboard focus: focus the tempo input then Tab
  await p.getByTestId('arrangement-tempo-input').focus(); await p.keyboard.press('Tab'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const a = document.activeElement; const b = a.getBoundingClientRect(); const cs = getComputedStyle(a);
    const clips = []; for (let e = a.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.overflow !== 'visible' || c.overflowX !== 'visible' || c.overflowY !== 'visible' || c.clipPath !== 'none' || c.contain !== 'none') { const rr = e.getBoundingClientRect(); clips.push({ tag: e.tagName, tid: e.dataset.testid || '', cls: e.className.slice(0, 80), overflow: c.overflow, top: rr.top, bottom: rr.bottom, left: rr.left, right: rr.right }); } }
    return { active: a.dataset.testid, fv: a.matches(':focus-visible'), box: [b.left, b.top, b.right, b.bottom], outline: cs.outline, offset: cs.outlineOffset, radius: cs.borderRadius, clips: clips.slice(0, 5) }; });
  const bb = await m.boundingBox();
  await p.screenshot({ path: `${__dirname}/${LABEL}-ring-metro-zoom-${vp.width}x${vp.height}.png`, clip: { x: bb.x - 30, y: bb.y - 10, width: bb.width + 60, height: bb.height + 20 } });
  out[vp.width] = r; await ctx.close(); }
 console.log(JSON.stringify(out, null, 1)); await b.close(); })();
