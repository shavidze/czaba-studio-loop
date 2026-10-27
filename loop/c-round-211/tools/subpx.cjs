const L = require('./c211lib.cjs');
(async () => { const b = await L.launch(); for (const base of ['http://127.0.0.1:5191', 'http://127.0.0.1:5190']) { const { ctx, page } = await L.openLab(b, base, 1280, 720);
  await L.selectFirstClip(page); await L.typeClipGain(page, -6); await page.mouse.move(5, 5); await L.sleep(500);
  console.log(base, JSON.stringify(await page.evaluate(() => { const q = (s) => document.querySelector(s); const r = (e) => e && Object.values(e.getBoundingClientRect().toJSON()).slice(0, 4);
    return { field: r(q('[data-testid=arrangement-detail-clip-gain-input]')), block: r(q('[data-testid=arrangement-detail-clip-gain]')), label: r(q('[data-testid=arrangement-detail-clip-gain] label')), fader: r(q('[data-testid=arrangement-detail-clip-gain-fader]')), content: r(q('[data-testid=arrangement-detail-content]')), panel: r(q('[data-testid=arrangement-detail-panel]')), wave: r(q('[data-testid=arrangement-detail-waveform]')),
      blockHTML: q('[data-testid=arrangement-detail-clip-gain]').outerHTML.length, parentClass: q('[data-testid=arrangement-detail-clip-gain]').parentElement.className, sib: [...q('[data-testid=arrangement-detail-clip-gain]').parentElement.children].map((c) => [c.getAttribute('data-testid'), ...Object.values(c.getBoundingClientRect().toJSON()).slice(0, 4)]) }; })));
  await ctx.close(); } await b.close(); })();
