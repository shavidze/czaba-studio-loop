const { chromium, sleep, openStudio, arm, st, save, SHOTS } = require('./lib.cjs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const net = [];
  const res = { utc: new Date().toISOString(), rows: {} };
  const vp = { width: 1440, height: 900 };
  const PLAY = 'button[aria-label=Play]';
  const run = async (name, fn) => {
    const { ctx, page } = await openStudio(browser, vp, `${name}-1440x900`, net);
    const steps = [];
    const s = async (l) => { const x = await st(page, l); steps.push(x); return x; };
    await arm(page);
    await s('armed');
    try { await fn(page, s); } catch (e) { steps.push({ label: 'ERROR', error: String(e).slice(0, 300) }); }
    await page.screenshot({ path: path.join(SHOTS, `${name}-1440x900.png`) });
    res.rows[name] = steps;
    console.log(name, JSON.stringify(steps.map((x) => [x.label, x.active, x.collapsed, x.videoExpanded, x.videoFloating, x.clips, x.error])));
    await ctx.close();
  };

  await run('video-neutral-close', async (page, s) => {
    await page.locator('[data-testid=arrangement-library-collapse]').click(); await sleep(600);
    await page.locator(PLAY).focus(); await s('collapsed, focus Play');
    await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
    await s('after mouse ⤢');
    await page.locator(PLAY).focus(); await s('focus Play again');
    await page.locator('[data-testid=arrangement-video-close]').click(); await sleep(900);
    await s('after mouse ✕');
  });
  await run('video-neutral-esc-from-expand', async (page, s) => {
    await page.locator('[data-testid=arrangement-library-collapse]').click(); await sleep(600);
    await page.locator(PLAY).focus(); await s('collapsed, focus Play');
    await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
    await s('after mouse ⤢');
    await page.keyboard.press('Escape'); await sleep(900);
    await s('after Escape (focus left by mouse ⤢)');
  });
  await run('video-neutral-esc-from-play', async (page, s) => {
    await page.locator('[data-testid=arrangement-library-collapse]').click(); await sleep(600);
    await page.locator(PLAY).focus(); await s('collapsed, focus Play');
    await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
    await s('after mouse ⤢');
    await page.locator(PLAY).focus(); await s('focus Play again');
    await page.keyboard.press('Escape'); await sleep(900);
    await s('after Escape (focus Play)');
  });
  await run('fv-710', async (page, s) => {
    await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
    await s('expanded lib, after mouse ⤢ (float)');
    await page.locator('[data-testid=arrangement-library-collapse]').focus(); await s('focus ◀');
    await page.keyboard.press('Enter'); await sleep(900);
    await s('after Enter on ◀');
    await page.keyboard.press('Enter'); await sleep(900);
    await s('after Enter 2');
  });
  // S5: library opened by video, focus inside library, Escape
  for (const where of ['collapse-button', 'option']) {
    await run(`s5-${where}`, async (page, s) => {
      await page.locator('[data-testid=arrangement-library-collapse]').click(); await sleep(600);
      await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
      await s('collapsed lib → mouse ⤢ (lib opened for video)');
      if (where === 'collapse-button') await page.locator('[data-testid=arrangement-library-collapse]').focus();
      else await page.locator('[role=option][aria-selected=true]').focus();
      await s(`focus ${where}`);
      await page.keyboard.press('Escape'); await sleep(900);
      await s('after Escape');
      await page.keyboard.press('Enter'); await sleep(900);
      await s('after Enter');
    });
  }
  await browser.close();
  res.net = net;
  save('lf-video.json', res);
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors, n.hydration.length, n.forbidden.length, n.authHeaders.length])));
})();
