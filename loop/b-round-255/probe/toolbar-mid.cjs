const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = {};
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [w, h] of [[1366, 768], [1400, 800], [1350, 800], [1340, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 180000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const pos = document.querySelector('[data-testid=arrangement-position]');
      let bar = pos; while (bar && !(bar.className || '').toString().includes('flex-wrap')) bar = bar.parentElement;
      const header = document.querySelector('header');
      const box = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      const kids = [...bar.querySelectorAll('button, input, [data-testid=arrangement-position]')].map((el) => ({ name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 20) || el.getAttribute('data-testid'), ...box(el) }));
      const master = [...header.querySelectorAll('*')].filter((e) => e.getAttribute && (e.getAttribute('aria-label') || '').match(/master/i)).map((e) => ({ name: e.getAttribute('aria-label'), ...box(e) }));
      return { toolbar: box(bar), header: box(header), kids, master, sw: bar.scrollWidth, cw: bar.clientWidth };
    });
    out[`${w}x${h}`] = r;
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/b-round-255/probe/head-mid-${w}x${h}.png` });
    await ctx.close();
  }
  await browser.close();
  require('fs').writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/b-round-255/probe/toolbar-head-mid.json', JSON.stringify(out, null, 1));
  for (const k of Object.keys(out)) { const o = out[k]; console.log(k, 'toolbar', JSON.stringify(o.toolbar), 'header', JSON.stringify(o.header)); console.log(o.kids.map(c => `${c.name}@${c.x},${c.y} w${c.w}`).join(' | ')); console.log('master', JSON.stringify(o.master)); }
})();
