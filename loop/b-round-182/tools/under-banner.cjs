const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, out] = [process.argv[2], process.argv[3]];
(async () => {
  const browser = await chromium.launch(); const res = [];
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
    await page.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000);
    const d = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept');
      let banner = btn; while (banner && getComputedStyle(banner).position !== 'fixed') banner = banner.parentElement;
      const top = banner ? banner.getBoundingClientRect().top : innerHeight;
      banner && (banner.style.display = 'none');
      const hits = [];
      for (const el of document.querySelectorAll('button,input,[role="slider"],[role="listbox"],[role="option"],[aria-label],h2,section,aside')) {
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        if (r.bottom > top + 0.5 && r.top < innerHeight) hits.push({ tag: el.tagName, label: (el.getAttribute('aria-label') || el.textContent.trim()).slice(0, 40), top: Math.round(r.top), bottom: Math.round(r.bottom), x: Math.round(r.x), w: Math.round(r.width), fullyHidden: r.top >= top });
      }
      return { bannerTop: top, docH: document.documentElement.scrollHeight, hits };
    });
    await page.screenshot({ path: `${out}-${w}-underneath.png` });
    res.push({ viewport: `${w}x${h}`, ...d }); await ctx.close();
  }
  await browser.close(); fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
})();
