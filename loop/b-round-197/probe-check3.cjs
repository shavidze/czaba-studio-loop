const L = require('./lib-b197.cjs');
(async () => {
  const { browser, page, H } = await L.openStudio(1280);
  await L.richScene(page, H);
  const r = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const btn = [...sc.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Your own video');
    const header = btn.closest('[data-testid=arrangement-track-header]');
    const lane = header.parentElement;
    const res = {};
    const t = async (label, el, mt) => { sc.scrollTop = 999; await wait(80); el.style.scrollMarginTop = mt; el.scrollIntoView({ block: 'nearest' }); await wait(200); res[label] = sc.scrollTop; el.style.scrollMarginTop = ''; };
    await t('laneNearest84', lane, '84px');
    await t('headerNearest84', header, '84px');
    await t('btnNearest84', btn, '84px');
    header.style.position = 'relative';
    await t('btnNearest84_headerNotSticky', btn, '84px');
    btn.blur(); sc.scrollTop = 999; await wait(80); btn.style.scrollMarginTop = '84px'; btn.focus(); await wait(200); res.btnFocus84_headerNotSticky = sc.scrollTop;
    header.style.position = '';
    return res;
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();
