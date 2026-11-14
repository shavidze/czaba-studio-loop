// layout probe: player root box, Play box, title box vs Close X, per viewport. usage: BASE=.. node ap-layout-507.cjs <out.json>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const BASE = process.env.BASE || 'http://127.0.0.1:5173';
(async () => { const b = await chromium.launch(); const res = [];
  for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(6000); await p.keyboard.press('Escape');
    await p.evaluate(() => { const x = document.querySelector('button[aria-label="Play preview"]'); x.scrollIntoView({ block: 'center' }); x.click(); });
    await p.waitForSelector('button[aria-label="Close player"]'); await p.waitForTimeout(800);
    res.push(await p.evaluate((w) => { const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10); };
      const close = document.querySelector('button[aria-label="Close player"]'); let root = close; while (root.parentElement && getComputedStyle(root).position !== 'fixed') root = root.parentElement;
      const play = document.querySelector('.audio-player-button-play'); const title = document.querySelector('.audio-player-title');
      return { w, root: box(root), play: box(play), playCx: play ? Math.round((play.getBoundingClientRect().x + play.getBoundingClientRect().width / 2) * 10) / 10 : null, title: box(title), close: box(close) }; }, w));
    await ctx.close(); }
  fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close(); })();
