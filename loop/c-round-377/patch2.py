p='rows377.mjs'; s=open(p).read()
a="await page.mouse.move(cb.x + 40, cb.y + cb.height * 0.6); await page.mouse.down(); await page.mouse.move(cb.x + 160, cb.y + cb.height * 0.6, { steps: 6 }); await page.mouse.up();"
assert a in s
b="const lb = await lane.boundingBox(); const x0 = Math.min(cb.x + cb.width + 40, w - 220); const y0 = lb.y + lb.height * 0.5; o.drag = { x0, y0, cb }; await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 + 120, y0, { steps: 6 }); await page.mouse.up();"
s=s.replace(a,b); open(p,'w').write(s)
