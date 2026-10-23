// CANCEL-CLASS settled read (opacity transition finishes ~250 ms), both viewports, fresh context each
const X = require('./lib97.cjs'); const { sleep } = X;
(async () => {
  const b = await X.launch(); const OUT = {};
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    const tag = `${vp.width}x${vp.height}`; const { ctx, page: p, S } = await X.newCtx(b, vp, `class-${tag}`);
    await X.setup(p, 3); await X.selectFormat(p, 'wav');
    const read = () => p.evaluate(() => {
      const c = document.querySelector('[data-testid=arrangement-export-cancel]');
      const cl = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')].find((x) => x.textContent.trim() === 'დახურვა');
      const tr = getComputedStyle(cl).transitionProperty + ' ' + getComputedStyle(cl).transitionDuration;
      return { label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
        cancel: c && { disabledAttr: c.hasAttribute('disabled'), disabledTokens: c.className.split(/\s+/).filter((t) => t.startsWith('disabled:')), opacity: getComputedStyle(c).opacity },
        close: { disabledAttr: cl.hasAttribute('disabled'), hasToken: cl.className.split(/\s+/).includes('disabled:opacity-40'), opacity: getComputedStyle(cl).opacity, transition: tr } };
    });
    const n0 = S.downloads.length;
    const eb = await X.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
    await sleep(600);
    const R = { during: await read() };
    await (await p.$('[data-testid=arrangement-export-footer]')).screenshot({ path: `${X.SHOTS}/cancel-class-footer-${tag}.png` });
    const cb = await p.locator('[data-testid=arrangement-export-cancel]').boundingBox();
    R.labelAtCancel = await X.label(p);
    await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(800);
    R.after = await read(); R.status = (await X.probe(p)).status;
    await (await p.$('[data-testid=arrangement-export-footer]')).screenshot({ path: `${X.SHOTS}/cancel-class-footer-after-${tag}.png` });
    await sleep(10000); R.dl10 = S.downloads.slice(n0).map((d) => d.name);
    R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders;
    OUT[tag] = R; await ctx.close();
  }
  X.save('cancel-class.json', OUT); console.log(JSON.stringify(OUT, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
