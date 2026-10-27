const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1280, 720], [1440, 900], [375, 812]]) {
  const page = await b.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
  let idx = 0;
  const res = [];
  for (let i = 0; i < 120 && idx < 2; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(100); if (await page.evaluate(() => document.activeElement?.matches('a[href^="/products/"]'))) {
    idx++;
    await page.waitForTimeout(500);
    for (const v of [{ d: '', r: '', o: '' }, { d: 'block', r: '16px', o: '' }, { d: 'block', r: '16px', o: '-2px' }]) {
      await page.evaluate((v) => { const a = document.activeElement; a.style.display = v.d; a.style.borderRadius = v.r; a.style.setProperty('--focus-offset', v.o || null); if (!v.o) a.style.removeProperty('--focus-offset'); }, v);
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => { const d = document.activeElement.getBoundingClientRect(); return { x: d.x, y: d.y, w: d.width, h: d.height }; });
      const clip = { x: Math.max(0, r.x - 5), y: Math.max(0, r.y - 5), width: r.w + 10, height: Math.min(r.h + 10, h - Math.max(0, r.y - 5)) };
      const buf = await page.screenshot({ clip, path: `${__dirname}/r96-${w}-${idx}-${v.d || 'inline'}${v.o}.png` });
      const dec = await b.newPage();
      const n = await dec.evaluate(async (src) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let t=0,bt=0,l=0,rr=0; for (let y=0;y<c.height;y++) for (let xx=0;xx<c.width;xx++){const i=(y*c.width+xx)*4; const R=d[i],G=d[i+1],B=d[i+2]; if(!(R>120&&G>90&&B<140&&R-B>40)) continue; if(y<9)t++; else if(y>=c.height-9)bt++; else if(xx<9)l++; else if(xx>=c.width-9)rr++;} return {top:t,bottom:bt,left:l,right:rr}; }, 'data:image/png;base64,' + buf.toString('base64'));
      await dec.close();
      res.push({ card: idx, variant: v, rect: r, brass: n });
    }
    await page.evaluate(() => { const a = document.activeElement; a.style.display = ''; a.style.borderRadius = ''; a.style.removeProperty('--focus-offset'); });
  } }
  out[`${w}x${h}`] = res;
  await page.close();
  }
  console.log(JSON.stringify(out));
  require('fs').writeFileSync(__dirname + '/r96-variants.json', JSON.stringify(out, null, 1));
  await b.close();
})();
