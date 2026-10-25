const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid=arrangement-timeline-scroller]'); await p.evaluate(() => document.fonts.ready);
    out[w] = await p.evaluate(() => {
      const root = document.querySelector('[data-studio-theme]'); const sizes = {}; const big = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { const t = walker.currentNode.textContent.trim(); if (!t) continue; const e = walker.currentNode.parentElement; const cs = getComputedStyle(e); if (!e.getClientRects().length) continue; const fs = cs.fontSize; sizes[fs] = (sizes[fs] || 0) + 1; if (parseFloat(fs) >= 16) big.push({ t: t.slice(0, 40), fs, fw: cs.fontWeight, tag: e.tagName, tid: e.closest('[data-testid]')?.getAttribute('data-testid') }); }
      return { sizes, big };
    });
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
