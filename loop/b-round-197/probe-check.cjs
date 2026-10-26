const L = require('./lib-b197.cjs');
const CSS = `[data-testid=arrangement-timeline-scroller] > div > :not(:first-child), [data-testid=arrangement-timeline-scroller] > div > :not(:first-child) * { scroll-margin-top: var(--b197-chrome, 0px); }`;
(async () => {
  const { browser, page, H } = await L.openStudio(1280);
  await L.richScene(page, H);
  await page.addStyleTag({ content: CSS });
  await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); sc.style.setProperty('--b197-chrome', `${sc.firstElementChild.firstElementChild.offsetHeight}px`); });
  const r = await page.evaluate(async () => {
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const el = [...sc.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Your own video');
    sc.scrollTop = sc.scrollHeight; await new Promise((r) => setTimeout(r, 100));
    const res = { sm: getComputedStyle(el).scrollMarginTop, scTop: sc.getBoundingClientRect().top, elTop: el.getBoundingClientRect().top, st0: sc.scrollTop };
    el.focus(); await new Promise((r) => setTimeout(r, 200)); res.afterFocus = sc.scrollTop;
    el.blur(); sc.scrollTop = 999;
    el.focus({ focusVisible: true }); await new Promise((r) => setTimeout(r, 200)); res.afterFocusFV = sc.scrollTop;
    sc.scrollTop = 999; await new Promise((r) => setTimeout(r, 100));
    el.scrollIntoView({ block: 'nearest' }); await new Promise((r) => setTimeout(r, 200)); res.afterSIVnearest = sc.scrollTop; res.elTopAfter = el.getBoundingClientRect().top;
    sc.scrollTop = 999;
    sc.style.scrollPaddingTop = '84px'; el.blur(); el.focus(); await new Promise((r) => setTimeout(r, 200)); res.paddingFocus = sc.scrollTop;
    return res;
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();
