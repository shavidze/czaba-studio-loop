const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const base = process.argv[2] || 'http://127.0.0.1:5175';
const out = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const res = { base, runs: [] };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const path of ['/studio-lab', '/']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      const blocked = [];
      await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => { blocked.push(r.request().url()); r.abort(); });
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(path === '/' ? 4000 : 6000);
      const data = await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept');
        let banner = btn; while (banner && !(getComputedStyle(banner).position === 'fixed')) banner = banner.parentElement;
        const r = banner ? banner.getBoundingClientRect() : null;
        const covered = [];
        if (r) {
          const seen = new Set();
          for (let x = 4; x < innerWidth; x += 24) for (let y = Math.ceil(r.top) + 1; y < r.bottom; y += 8) {
            banner.style.visibility = 'hidden';
            const el = document.elementFromPoint(x, y);
            banner.style.visibility = '';
            const tagged = el && el.closest('[aria-label],[role],button,input');
            const key = tagged ? (tagged.tagName + ':' + (tagged.getAttribute('aria-label') || tagged.getAttribute('role') || tagged.textContent.trim().slice(0, 30))) : null;
            if (key && !seen.has(key)) { seen.add(key); covered.push(key); }
          }
        }
        return { path: location.pathname, banner: r && { x: r.x, y: r.y, w: r.width, h: r.height }, consent: localStorage.getItem('czaba_analytics_consent'), coveredSample: covered.slice(0, 40), workspace: !!document.querySelector('[data-studio-theme]') };
      });
      await page.screenshot({ path: `${out}-${w}${path === '/' ? '-home' : '-lab'}.png` });
      res.runs.push({ viewport: `${w}x${h}`, ...data, blockedRequests: blocked.length, pageerror: errs });
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})();
