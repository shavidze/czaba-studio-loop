const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const out = process.argv[2];
const metrics = () => {
  const glyphRe = /[▶◀×▾▸■]/;
  const lib = document.querySelector('[data-testid="arrangement-library"]');
  const res = [];
  const walker = document.createTreeWalker(lib, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent;
    const i = t.search(glyphRe);
    if (i < 0) continue;
    const r = document.createRange();
    r.setStart(n, i);
    r.setEnd(n, i + 1);
    const g = r.getBoundingClientRect();
    let spaceW = null;
    if (t[i + 1] === ' ') {
      const s = document.createRange();
      s.setStart(n, i + 1);
      s.setEnd(n, i + 2);
      spaceW = +s.getBoundingClientRect().width.toFixed(3);
    }
    const el = n.parentElement;
    const cs = getComputedStyle(el);
    const host = el.closest('button,span,p') || el;
    const hb = host.getBoundingClientRect();
    res.push({
      text: t.trim().slice(0, 30),
      glyph: t[i],
      tid: host.getAttribute('data-testid') || host.closest('[data-testid]')?.getAttribute('data-testid'),
      tag: host.tagName.toLowerCase(),
      cls: host.getAttribute('class'),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily.slice(0, 60),
      display: getComputedStyle(host).display,
      glyphBox: [+g.x.toFixed(2), +g.y.toFixed(2), +g.width.toFixed(2), +g.height.toFixed(2)],
      spaceW,
      hostBox: [+hb.x.toFixed(2), +hb.y.toFixed(2), +hb.width.toFixed(2), +hb.height.toFixed(2)],
    });
  }
  return res;
};
(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('[data-testid="arrangement-library-collapse"]');
    await page.waitForTimeout(800);
    const s0 = await page.evaluate(metrics);
    await page.fill('[data-testid="arrangement-library-search"]', 'a');
    await page.waitForTimeout(200);
    const search = await page.evaluate(metrics);
    await page.fill('[data-testid="arrangement-library-search"]', '');
    await page.waitForTimeout(200);
    await page.click('[data-testid="arrangement-library-preview-toggle"]');
    await page.waitForTimeout(600);
    const playing = await page.evaluate(metrics);
    await page.click('[data-testid="arrangement-library-preview-toggle"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="arrangement-library-collapse"]');
    await page.waitForTimeout(600);
    const collapsed = await page.evaluate(() => {
      const b = document.querySelector('[data-testid="arrangement-library-expand"]');
      const cs = getComputedStyle(b);
      const r = document.createRange();
      r.selectNodeContents(b);
      const g = r.getBoundingClientRect();
      const bb = b.getBoundingClientRect();
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight, display: cs.display, glyphBox: [g.x, g.y, g.width, g.height], hostBox: [bb.x, bb.y, bb.width, bb.height] };
    });
    await page.screenshot({ path: out.replace('.json', `-${w}-collapsed.png`), clip: { x: 0, y: 60, width: 120, height: 200 } });
    result[w] = { s0, search, playing, collapsed };
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result[1440], null, 0).slice(0, 6000));
})();
