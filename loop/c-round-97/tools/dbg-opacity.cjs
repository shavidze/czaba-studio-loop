const X = require('./lib97.cjs'); const { sleep } = X;
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, { width: 1280, height: 720 }, 'dbgop');
  await X.setup(p, 3); await X.selectFormat(p, 'wav');
  const read = () => p.evaluate(() => {
    const bs = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')];
    const rules = []; for (const ss of document.styleSheets) { try { for (const r of ss.cssRules) { const t = r.cssText; if (/disabled\\:opacity-40/.test(t)) rules.push(t.slice(0, 200)); } } catch (e) {} }
    return { label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
      btns: bs.map((x) => ({ t: x.textContent.trim(), dis: x.disabled, matchDisabled: x.matches(':disabled'), op: getComputedStyle(x).opacity, hasTok: x.className.includes('disabled:opacity-40') })), rules };
  });
  const eb = await X.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
  const R = [];
  for (const d of [0, 50, 200, 600]) { await sleep(d); R.push(await read()); }
  console.log(JSON.stringify(R, null, 1));
  const foot = await p.$('[data-testid=arrangement-export-footer]'); await foot.screenshot({ path: `${X.SHOTS}/dbg-footer-rendering.png` });
  await ctx.close(); await b.close();
})();
