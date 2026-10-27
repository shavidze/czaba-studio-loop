const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(100); if (await page.evaluate(() => document.activeElement?.matches('a[href^="/products/"]'))) break; }
  await page.waitForTimeout(500);
  const count = async (tag) => {
    const r = await page.evaluate(() => { const d = document.activeElement.querySelector('div').getBoundingClientRect(); return { x: d.x, y: d.y, w: d.width, h: d.height }; });
    const buf = await page.screenshot({ clip: { x: r.x - 5, y: r.y - 5, width: r.w + 10, height: r.h + 10 }, path: __dirname + `/r96-${tag}.png` });
    const dec = await b.newPage();
    const n = await dec.evaluate(async (src) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let t=0,bt=0,l=0,rr=0; for (let y=0;y<c.height;y++) for (let xx=0;xx<c.width;xx++){const i=(y*c.width+xx)*4; const R=d[i],G=d[i+1],B=d[i+2]; if(!(R>120&&G>90&&B<140&&R-B>40)) continue; if(y<5)t++; else if(y>=c.height-5)bt++; else if(xx<5)l++; else if(xx>=c.width-5)rr++;} return {top:t,bottom:bt,left:l,right:rr}; }, 'data:image/png;base64,' + buf.toString('base64'));
    await dec.close();
    const st = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); const p = a.parentElement; return { display: cs.display, outline: cs.outline, rects: [...a.getClientRects()].map(q => [q.x, q.y, q.width, q.height]), parentOverflow: getComputedStyle(p).overflow, ancestorsOverflow: (() => { const o = []; let n = a.parentElement; while (n) { const ov = getComputedStyle(n).overflow; if (ov !== 'visible') o.push(n.tagName + '.' + (n.className || '').toString().slice(0, 40) + ':' + ov); n = n.parentElement; } return o; })() }; });
    return { tag, brass: n, ...st };
  };
  const out = [];
  out.push(await count('inline-ref'));
  await page.evaluate(() => { const a = document.activeElement; a.style.display = 'block'; a.style.borderRadius = '16px'; });
  await page.waitForTimeout(200);
  out.push(await count('block-rounded'));
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
