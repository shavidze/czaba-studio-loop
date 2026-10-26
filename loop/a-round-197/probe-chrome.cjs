const L = require('./lib197.cjs');
(async () => {
  const { browser, page } = await L.openStudio(1440);
  const h = () => page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').firstElementChild.firstElementChild.offsetHeight);
  const out = { start: await h() };
  const bpm = page.locator('input[aria-label*="BPM" i], input[aria-label*="tempo" i]').first();
  out.bpmFound = await bpm.count();
  if (out.bpmFound) { await bpm.fill('90'); await bpm.press('Enter'); await L.sleep(600); out.afterBpm = await h(); }
  await page.click('[data-testid=arrangement-marker-add]'); await L.sleep(400); out.afterMarker = await h();
  const t = page.locator('[data-testid=arrangement-detail-toggle]'); await t.click(); await L.sleep(900); out.afterDetail = await h();
  console.log(JSON.stringify(out));
  await browser.close();
})();
