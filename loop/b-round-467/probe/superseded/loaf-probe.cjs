const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    window.__loaf = []; window.__dlgAt = null; const t0 = performance.now(); window.__t0 = t0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ t: Math.round(e.startTime - t0), d: Math.round(e.duration), block: Math.round(e.blockingDuration), render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0), style: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: e.scripts.map((s) => ({ d: Math.round(s.duration), inv: s.invoker, src: (s.sourceURL || '').split('/').pop(), fn: s.sourceFunctionName })) }); }).observe({ type: 'long-animation-frame', buffered: false });
    new MutationObserver(() => { if (!window.__dlgAt && document.querySelector('[role=dialog]')) window.__dlgAt = Math.round(performance.now() - t0); }).observe(document.body, { childList: true, subtree: true });
  });
  await page.mouse.move(720, 450);
  for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(60); }
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => ({ dlgAt: window.__dlgAt, dlg: [...document.querySelectorAll('[role=dialog]')].map((d) => (d.getAttribute('aria-label') || d.getAttribute('aria-labelledby') && document.getElementById(d.getAttribute('aria-labelledby'))?.textContent || d.textContent).slice(0, 80)), bodyStyle: document.body.getAttribute('style'), htmlStyle: document.documentElement.getAttribute('style'), htmlClass: document.documentElement.className, loaf: window.__loaf }));
  fs.writeFileSync(`${__dirname}/loaf-${process.env.TAG}.json`, JSON.stringify(r, null, 1));
  console.log(JSON.stringify({ dlgAt: r.dlgAt, dlg: r.dlg, bodyStyle: r.bodyStyle, htmlStyle: r.htmlStyle, htmlClass: r.htmlClass, n: r.loaf.length }));
  for (const l of r.loaf) console.log(l.t, l.d, 'block', l.block, 'style', l.style, JSON.stringify(l.scripts.slice(0, 3)));
  await browser.close();
})();
