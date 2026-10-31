const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = {};
  const browser = await chromium.launch();
  for (const [w,h] of [[390,844],[768,1024],[899,900],[900,900],[1280,720],[1440,900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('request', r => { const u = r.url(); if (/\.mp3|\.mp4|\.wav/.test(u)) reqs.push(u); });
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const t = document.querySelector('[data-testid="arrangement-exit"]');
      const btns = [...document.querySelectorAll('button')].filter(b => { const r=b.getBoundingClientRect(); return r.width>0 && r.top < 120; }).map(b => { const r=b.getBoundingClientRect(); return [b.textContent.trim().slice(0,20), Math.round(r.left), Math.round(r.right), Math.round(r.top)]; });
      let overlaps = 0;
      for (let i=0;i<btns.length;i++) for (let j=i+1;j<btns.length;j++) { const a=btns[i], b=btns[j]; if (Math.abs(a[3]-b[3])<10 && a[1]<b[2] && b[1]<a[2]) overlaps++; }
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, exit: !!t, h1: document.querySelector('h1')?.textContent, toolbarButtons: btns.length, overlaps, audioEls: document.querySelectorAll('audio').length };
    });
    out[`${w}x${h}`] = { ...m, mediaRequests: reqs };
    await page.screenshot({ path: `probe/head-${w}x${h}.png` });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
