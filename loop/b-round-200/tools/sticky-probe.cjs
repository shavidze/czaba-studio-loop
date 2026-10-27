const { chromium } = require(process.argv[2] + '/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1280, 720], [1440, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/store', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    const rows = [];
    for (let i = 0; i < 60; i++) {
      await p.keyboard.press('Tab');
      await p.waitForTimeout(120);
      const r = await p.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        const hdr = document.querySelector('header'); const hb = hdr ? hdr.getBoundingClientRect().bottom : 0;
        const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return { tag: el.tagName, text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), top: Math.round(rc.top), bottom: Math.round(rc.bottom), hb: Math.round(hb), outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow !== 'none', inHeader: !!el.closest('header') };
      });
      if (r) rows.push(r);
    }
    out[`${w}x${h}`] = { dbl: rows.filter(r => r.shadow && r.outline.startsWith('solid')).map(r=>r.tag+':'+r.text),  obscured: rows.filter(r => !r.inHeader && r.top < r.hb), doubleRing: rows.filter(r => r.shadow && r.outline.startsWith('solid')).length, n: rows.length, sample: rows.slice(0, 12) };
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
