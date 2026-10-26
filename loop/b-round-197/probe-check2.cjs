const L = require('./lib-b197.cjs');
(async () => {
  const { browser, page, H } = await L.openStudio(1280);
  await L.richScene(page, H);
  const r = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const el = [...sc.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Your own video');
    const chain = []; let p = el; while (p && p !== sc) { const cs = getComputedStyle(p); if (cs.position !== 'static') chain.push(`${p.tagName}.${cs.position}${p.dataset.testid ? '#' + p.dataset.testid : ''}`); p = p.parentElement; }
    const res = { chain, clientH: sc.clientHeight, scrollH: sc.scrollHeight };
    const run = async (label, fn) => { sc.scrollTop = 999; await wait(80); el.blur(); await fn(); await wait(200); res[label] = sc.scrollTop; sc.style.scrollPaddingTop = ''; el.style.scrollMarginTop = ''; };
    await run('sivStartNoMargin', async () => el.scrollIntoView({ block: 'start' }));
    await run('sivStartMargin84', async () => { el.style.scrollMarginTop = '84px'; el.scrollIntoView({ block: 'start' }); });
    await run('sivNearestMargin84', async () => { el.style.scrollMarginTop = '84px'; el.scrollIntoView({ block: 'nearest' }); });
    await run('focusMargin200', async () => { el.style.scrollMarginTop = '200px'; el.focus(); });
    const clip = sc.querySelector('[data-clip-id]');
    res.clipFocusable = clip ? clip.tabIndex : null;
    return res;
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();
