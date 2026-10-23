const { chromium, sleep, openStudio, arm, st, save, SHOTS } = require('./lib.cjs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const net = [];
  const res = { utc: new Date().toISOString(), rows: {} };
  const vps = [{ width: 1280, height: 720 }, { width: 1440, height: 900 }];
  for (const vp of vps) {
    const tag = `${vp.width}x${vp.height}`;
    for (const kind of ['control', 'collapse', 'expand', 'clear']) {
      const { ctx, page } = await openStudio(browser, vp, `${kind}-${tag}`, net);
      const steps = [];
      const s = async (l) => steps.push(await st(page, l));
      await arm(page);
      await s('armed');
      if (kind === 'control') {
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await s('blurred');
        await page.keyboard.press('Enter');
        await sleep(800);
        await s('after Enter on BODY');
      } else {
        if (kind === 'collapse') await page.locator('[data-testid=arrangement-library-collapse]').focus();
        if (kind === 'expand') {
          await page.locator('[data-testid=arrangement-library-collapse]').click();
          await sleep(500);
          await page.locator('[data-testid=arrangement-library-expand]').focus();
        }
        if (kind === 'clear') {
          await page.locator('[data-testid=arrangement-library-search]').fill('mid');
          await sleep(300);
          await page.locator('[data-testid=arrangement-library-search-clear]').focus();
        }
        await s('focused');
        await page.keyboard.press('Enter');
        await sleep(600);
        await s('after Enter 1');
        await page.keyboard.press('Enter');
        await sleep(900);
        await s('after Enter 2');
      }
      await page.screenshot({ path: path.join(SHOTS, `lf-${kind}-${tag}.png`) });
      res.rows[`${kind}-${tag}`] = steps;
      console.log(kind, tag, JSON.stringify(steps.map((x) => [x.label, x.active, x.collapsed, x.clips, x.query, x.clearPresent])));
      await ctx.close();
    }
  }
  // LF-MOUSE 1280
  {
    const vp = vps[0];
    const { ctx, page } = await openStudio(browser, vp, 'mouse-1280x720', net);
    const steps = [];
    const s = async (l) => steps.push(await st(page, l));
    await arm(page);
    await s('armed');
    await page.locator('[data-testid=arrangement-library-collapse]').click();
    await sleep(600);
    await s('after mouse ◀');
    await page.keyboard.press('Enter');
    await sleep(800);
    await s('after Enter');
    await page.locator('[data-testid=arrangement-library-collapse]').click();
    await sleep(600);
    await page.locator('[data-testid=arrangement-library-expand]').click();
    await sleep(600);
    await s('after mouse ◀ then mouse ▶');
    await page.keyboard.press('Enter');
    await sleep(800);
    await s('after Enter');
    // restore expanded state if Enter collapsed
    if ((await page.locator('[data-testid=arrangement-library]').getAttribute('data-collapsed')) === 'true') {
      await page.locator('[data-testid=arrangement-library-expand]').click();
      await sleep(600);
    }
    await page.locator('[data-testid=arrangement-library-search]').fill('mid');
    await sleep(300);
    await page.locator('[data-testid=arrangement-library-search-clear]').click();
    await sleep(400);
    await s('after mouse ×');
    await page.keyboard.press('Enter');
    await sleep(800);
    await s('after Enter');
    await page.screenshot({ path: path.join(SHOTS, 'lf-mouse-1280x720.png') });
    res.rows['mouse-1280x720'] = steps;
    console.log('mouse', JSON.stringify(steps.map((x) => [x.label, x.active, x.collapsed, x.clips, x.query])));
    await ctx.close();
  }
  await browser.close();
  res.net = net;
  save('lf-basic.json', res);
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors.length, n.hydration.length, n.forbidden.length, n.authHeaders.length, n.noise])));
})();
