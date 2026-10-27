const { chromium } = require(process.argv[2] + '/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[1280, 720], [1440, 900]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => out.navErr = String(e));
    await p.waitForTimeout(1500);
    const res = []; 
    for (let i = 0; i < 120; i++) {
      await p.keyboard.press('Tab'); await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        let op = 1, n = el; while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
        const vis = getComputedStyle(el).visibility;
        return { tag: el.tagName, cls: (el.className && el.className.baseVal === undefined ? el.className : '').slice(0, 60), name: el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 30), effOpacity: op, vis };
      });
      if (r && (r.effOpacity < 0.1 || r.vis !== 'visible')) res.push({ i, ...r });
    }
    out[`${w}x${h}`] = res; await p.close();
  }
  await b.close(); console.log(JSON.stringify(out, null, 1));
})();
