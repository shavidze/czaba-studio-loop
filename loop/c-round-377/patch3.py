p='rows377.mjs'; s=open(p).read()
marker="    await page.screenshot({ path: outPath.replace(/\\.json$/, `-${w}.png`) });"
assert marker in s
new="""    await step('f_zoom', async () => {
      const o = {}; await page.mouse.click(5, 5);
      const lane = page.locator('[data-track-id="music"]').first(); const lb = await lane.boundingBox(); const cb = await page.locator('[data-clip-id]').first().boundingBox();
      const x0 = Math.min(cb.x + cb.width + 40, w - 220); const y0 = lb.y + lb.height * 0.5; await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 + 120, y0, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
      o.range = await page.getByTestId('arrangement-lane-range').count(); const zs = btn(/^Zoom to selection/); o.zsBefore = await read(zs); o.readout0 = await page.getByTestId('arrangement-zoom-readout').textContent();
      await zs.click(); await page.waitForTimeout(500); o.readout1 = await page.getByTestId('arrangement-zoom-readout').textContent(); o.zsAfter = await read(zs); o.backAfter1 = await read(page.getByTestId('arrangement-zoom-back'));
      const zb = page.getByTestId('arrangement-zoom-back'); let n = 0; const seq = [];
      while ((await zb.getAttribute('aria-disabled')) !== 'true' && n < 6) { await zb.click(); await page.waitForTimeout(300); n++; seq.push(await page.getByTestId('arrangement-zoom-readout').textContent()); }
      o.backClicks = n; o.backSeq = seq; o.backFinal = await read(zb); o.active = await ae(page); const fit = page.getByTestId('arrangement-fit'); o.fitFocused = await fit.evaluate(e => e === document.activeElement); o.fitRing = await fit.evaluate(e => { const c = getComputedStyle(e); return { outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor, offset: c.outlineOffset, fv: e.matches(':focus-visible') }; }); return o; });
"""
s=s.replace(marker,new+marker); open(p,'w').write(s)
