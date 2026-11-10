const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const BASE = 'http://127.0.0.1:5173';
const hook = () => {
  window.__a = { starts: [], stops: 0 };
  const P = AudioBufferSourceNode.prototype; const s = P.start, t = P.stop;
  P.start = function (...a) { window.__a.starts.push({ dur: this.buffer ? Number(this.buffer.duration.toFixed(2)) : null, at: Math.round(performance.now()) }); this.addEventListener('ended', () => { window.__a.stops += 1; }); return s.apply(this, a); };
};
const st = (p) => p.evaluate(() => ({ starts: window.__a.starts.slice(), ended: window.__a.stops }));
const clock = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-transport-centre"]')?.textContent?.match(/\d\d:\d\d\.\d{3}/)?.[0]);
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const R = {}; const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(hook); const p = await ctx.newPage();
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
    await p.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 45000 });
    const o = (id) => p.locator(`[role="option"][data-source-id="${id}"]`);
    // preview parity with real graph
    await o('demo-hero-music').click(); await p.waitForTimeout(300);
    await p.locator('[data-testid="arrangement-library-preview-toggle"]').click(); await p.waitForTimeout(1500);
    R.afterPreview = await st(p);
    const bb = await o('demo-middle-east').boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await p.waitForTimeout(1500);
    R.afterRight = { ...(await st(p)), menus: await p.getByRole('menu').count() };
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    R.afterEsc = await st(p);
    await p.locator('[data-testid="arrangement-library-preview-toggle"]').click(); await p.waitForTimeout(500);
    // Space on open menu with a clip on the timeline
    await o('demo-middle-east').dblclick(); await p.waitForTimeout(800);
    R.clips = await p.locator('[data-clip-id]').count();
    const n0 = (await st(p)).starts.length;
    await o('demo-middle-east').focus(); await p.keyboard.press('Shift+F10'); await p.waitForTimeout(250);
    const pP = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null); const c0 = await clock(p);
    await p.keyboard.press(' '); const np = await pP; if (np) await np.close(); await p.bringToFront(); await p.waitForTimeout(1100);
    R.menuSpace = { newTab: !!np, newStarts: (await st(p)).starts.length - n0, clock: [c0, await clock(p)] };
    await p.evaluate(() => document.activeElement?.blur());
    const n1 = (await st(p)).starts.length; const c1 = await clock(p);
    await p.keyboard.press(' '); await p.waitForTimeout(1100);
    R.controlSpace = { newStarts: (await st(p)).starts.slice(n1), clock: [c1, await clock(p)] };
    out[`${w}x${h}`] = R; await ctx.close();
  }
  fs.writeFileSync(__dirname + '/audio.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
  await b.close();
})();
