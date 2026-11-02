const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const OUT = __dirname;
const audioHook = () => {
  window.__c300 = { starts: 0, media: [] };
  const proto = window.AudioScheduledSourceNode && window.AudioScheduledSourceNode.prototype;
  if (proto) { const s = proto.start; proto.start = function (...a) { window.__c300.starts += 1; return s.apply(this, a); }; }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { window.__c300.media.push({ src: this.currentSrc || this.src, t: performance.now() }); return play.apply(this, a); };
  const OrigAudio = window.Audio;
  window.__c300.audios = [];
  window.Audio = function (...a) { const el = new OrigAudio(...a); window.__c300.audios.push(el); return el; };
  window.Audio.prototype = OrigAudio.prototype;
};
const mediaState = (page) => page.evaluate(() => {
  const els = [...document.querySelectorAll('audio,video'), ...(window.__c300.audios || [])];
  return els.map((e) => ({ src: (e.currentSrc || e.src || '').slice(-60), paused: e.paused, t: Number(e.currentTime.toFixed(3)) }));
});
const clock = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-transport-centre"]')?.textContent?.match(/\d\d:\d\d\.\d{3}/)?.[0] ?? null);
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const tag = `${w}x${h}`; const R = {};
    // token API with valid params
    {
      const ctx = await browser.newContext(); const page = await ctx.newPage();
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
      R.token = await page.evaluate(async () => {
        const q = '/api/studio-token?product=middle-east&file=mix.wav';
        const a = await fetch(q); const at = await a.text();
        const b = await fetch(q, { headers: { Authorization: 'Bearer forged' } }); const bt = await b.text();
        const c = await fetch('/api/studio-token'); const ct = await c.text();
        return { noAuth: { s: a.status, body: at.slice(0, 120) }, forged: { s: b.status, body: bt.slice(0, 120) }, noParams: { s: c.status, body: ct.slice(0, 120) } };
      });
      await ctx.close();
    }
    // Space positive control + Space-on-menu negative with clips present
    {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(audioHook);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 45000 });
      const o = page.locator('[role="option"][data-source-id="demo-middle-east"]');
      await o.dblclick(); await page.waitForTimeout(800);
      R.clips = await page.locator('[data-clip-id]').count();
      // negative: menu open, Space
      await o.focus(); await page.keyboard.press('Shift+F10'); await page.waitForTimeout(250);
      const s0 = await page.evaluate(() => window.__c300.starts); const c0 = await clock(page);
      const pP = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
      await page.keyboard.press(' '); const np = await pP; if (np) await np.close();
      await page.bringToFront(); await page.waitForTimeout(1100);
      R.menuSpace = { newTab: !!np, startsDelta: (await page.evaluate(() => window.__c300.starts)) - s0, clock: [c0, await clock(page)], state: await page.locator('[data-testid="arrangement-playback-state"]').textContent() };
      // positive control: Space with focus on the timeline (no menu)
      const tl = await page.locator('[data-testid="arrangement-timeline-scroller"]').boundingBox();
      await page.locator('[data-testid="arrangement-playback-state"]').click().catch(() => {});
      await page.evaluate(() => document.activeElement?.blur());
      const s1 = await page.evaluate(() => window.__c300.starts); const c1 = await clock(page);
      await page.keyboard.press(' '); await page.waitForTimeout(1100);
      R.controlSpace = { startsDelta: (await page.evaluate(() => window.__c300.starts)) - s1, clock: [c1, await clock(page)], state: await page.locator('[data-testid="arrangement-playback-state"]').textContent() };
      await page.keyboard.press(' '); await page.waitForTimeout(300);
      await ctx.close();
    }
    // real preview media switch on right-click
    {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(audioHook);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 45000 });
      await page.locator('[role="option"][data-source-id="demo-hero-music"]').click(); await page.waitForTimeout(300);
      await page.locator('[data-testid="arrangement-library-preview-toggle"]').click(); await page.waitForTimeout(1500);
      R.previewBefore = { media: await mediaState(page), plays: await page.evaluate(() => window.__c300.media), starts: await page.evaluate(() => window.__c300.starts) };
      const b = await page.locator('[role="option"][data-source-id="demo-middle-east"]').boundingBox();
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2, { button: 'right' });
      await page.waitForTimeout(1500);
      R.previewAfterRight = { menus: await page.getByRole('menu').count(), media: await mediaState(page), plays: await page.evaluate(() => window.__c300.media), starts: await page.evaluate(() => window.__c300.starts) };
      await page.waitForTimeout(1000);
      R.previewAfterRight2 = { media: await mediaState(page) };
      await page.keyboard.press('Escape'); await page.waitForTimeout(800);
      R.previewAfterEsc = { media: await mediaState(page), previewing: await page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="arrangement-library-option-previewing"]')).map((n) => n.closest('[data-source-id]')?.getAttribute('data-source-id'))) };
      await ctx.close();
    }
    out[tag] = R;
  }
  fs.writeFileSync(path.join(OUT, 'followup.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
