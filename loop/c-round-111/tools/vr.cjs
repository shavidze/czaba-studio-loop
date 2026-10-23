const { chromium, sleep, openStudio, arm, st, save, SHOTS } = require('./lib.cjs');
const path = require('path');

const PLAY = 'button[aria-label=Play]';
const COLLAPSE = '[data-testid=arrangement-library-collapse]';
const EXPAND = '[data-testid=arrangement-library-expand]';
const VEXP = '[data-testid=arrangement-video-expand]';
const VCLOSE = '[data-testid=arrangement-video-close]';

const startSampler = (page) =>
  page.evaluate(() => {
    const lib = document.querySelector('[data-testid=arrangement-library]');
    const samples = [];
    window.__samples = samples;
    const t0 = performance.now();
    const tick = () => {
      const r = lib.getBoundingClientRect();
      samples.push({ t: Math.round(performance.now() - t0), w: Math.round(r.width * 10) / 10, sl: lib.scrollLeft, st: lib.scrollTop });
      if (performance.now() - t0 < 900) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
const readSamples = async (page) => {
  await sleep(1100);
  const s = await page.evaluate(() => window.__samples);
  const ws = s.map((x) => x.w);
  return { n: s.length, first: ws[0], max: Math.max(...ws), last: ws[ws.length - 1], maxScrollLeft: Math.max(...s.map((x) => x.sl)), maxScrollTop: Math.max(...s.map((x) => x.st)), samples: s };
};

const openedForVideo = async (page) => {
  await page.locator(COLLAPSE).click(); await sleep(700);
  await page.locator(VEXP).click(); await sleep(1000);
};

const only = process.argv[2] ? process.argv[2].split(',') : null;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const net = [];
  const res = { utc: new Date().toISOString(), rows: {} };
  const run = async (name, vp, fn, doArm = true) => {
    if (only && !only.some((o) => name.startsWith(o))) return;
    const tag = `${vp.width}x${vp.height}`;
    const { ctx, page } = await openStudio(browser, vp, `${name}-${tag}`, net);
    const steps = [];
    const extra = {};
    const s = async (l) => { const x = await st(page, l); steps.push(x); return x; };
    if (doArm) { await arm(page); await s('armed'); } else await s('start');
    try { await fn(page, s, extra); } catch (e) { steps.push({ label: 'ERROR', error: String(e).slice(0, 300) }); }
    await page.screenshot({ path: path.join(SHOTS, `${name}-${tag}.png`) });
    res.rows[`${name}-${tag}`] = { steps, ...extra };
    console.log(name, tag, JSON.stringify(steps.map((x) => [x.label, x.active, x.collapsed, x.videoExpanded, x.videoFloating, x.clips, x.query, x.error])));
    save('vr.json', { ...res, net });
    await ctx.close();
  };
  const V1280 = { width: 1280, height: 720 };
  const V1440 = { width: 1440, height: 900 };

  for (const vp of [V1280, V1440]) {
    await run('vr-hazard', vp, async (page, s) => {
      await openedForVideo(page); await s('opened for video');
      await page.evaluate(() => document.activeElement && document.activeElement.blur()); await s('blurred');
      await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape');
      await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter');
    });
    await run('vr-esc-button', vp, async (page, s) => {
      await openedForVideo(page); await s('opened for video');
      await page.locator(COLLAPSE).focus(); await s('focus ◀');
      await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape');
      await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter 1');
      await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter 2');
    });
    await run('vr-esc-option', vp, async (page, s) => {
      await openedForVideo(page); await s('opened for video');
      await page.locator('[role=option][aria-selected=true]').focus(); await s('focus selected option');
      await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape');
      await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter');
    });
  }
  await run('vr-scroll', V1280, async (page, s, extra) => {
    await openedForVideo(page); await s('opened for video');
    await page.locator(COLLAPSE).focus(); await s('focus ◀');
    await startSampler(page);
    await page.keyboard.press('Escape');
    extra.sampler = await readSamples(page);
    await s('after Escape');
  });
  await run('vr-outside-a', V1440, async (page, s) => {
    await page.locator(COLLAPSE).click(); await sleep(700);
    await page.locator(PLAY).focus(); await s('collapsed, focus Play');
    await page.locator(VEXP).click(); await sleep(1000); await s('after mouse ⤢');
    await page.locator(PLAY).focus(); await s('focus Play again');
    await page.locator(VCLOSE).click(); await sleep(1000); await s('after mouse ✕');
  });
  await run('vr-outside-b', V1440, async (page, s) => {
    await page.locator(COLLAPSE).click(); await sleep(700);
    await page.locator(PLAY).focus(); await s('collapsed, focus Play');
    await page.locator(VEXP).click(); await sleep(1000); await s('after mouse ⤢');
    await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape (focus left on ⤢)');
  });
  await run('vr-outside-c', V1440, async (page, s) => {
    await page.locator(COLLAPSE).click(); await sleep(700);
    await page.locator(PLAY).focus(); await s('collapsed, focus Play');
    await page.locator(VEXP).click(); await sleep(1000); await s('after mouse ⤢');
    await page.locator(PLAY).focus(); await s('focus Play again');
    await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape (focus Play)');
  });
  await run('vr-outside-d', V1440, async (page, s) => {
    await openedForVideo(page); await s('opened for video');
    await page.locator(VCLOSE).focus(); await s('focus ✕ (keyboard focus)');
    await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape');
    await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter (info)');
  });
  await run('vr-outside-d-tab', V1440, async (page, s) => {
    await openedForVideo(page); await s('opened for video');
    let found = false;
    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press('Tab'); await sleep(60);
      const t = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      if (t === 'arrangement-video-close') { found = true; break; }
    }
    await s(found ? 'tabbed to ✕' : 'Tab did not reach ✕ in 60 presses');
    if (found) { await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape'); }
  });
  await run('vr-search', V1440, async (page, s) => {
    await openedForVideo(page); await s('opened for video');
    await page.locator('[data-testid=arrangement-library-search]').fill('mid'); await sleep(400); await s('typed mid');
    await page.keyboard.press('Escape'); await sleep(800); await s('after Escape 1');
    await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape 2');
  });
  await run('vr-not-for-video', V1440, async (page, s) => {
    await page.locator(VEXP).click(); await sleep(1000); await s('expanded lib, mouse ⤢');
    await page.locator('[role=option][aria-selected=true]').focus(); await s('focus selected option');
    await page.keyboard.press('Escape'); await sleep(1000); await s('after Escape');
  });
  await run('fv-710', V1440, async (page, s) => {
    await page.locator(VEXP).click(); await sleep(1000); await s('expanded lib, after mouse ⤢ (float)');
    await page.locator(COLLAPSE).focus(); await s('focus ◀');
    await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter on ◀');
    await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter 2');
  });
  for (const kind of ['collapse', 'expand', 'clear']) {
    await run(`lf-${kind}`, V1280, async (page, s) => {
      if (kind === 'collapse') await page.locator(COLLAPSE).focus();
      if (kind === 'expand') { await page.locator(COLLAPSE).click(); await sleep(600); await page.locator(EXPAND).focus(); }
      if (kind === 'clear') {
        await page.locator('[data-testid=arrangement-library-search]').fill('mid'); await sleep(300);
        await page.locator('[data-testid=arrangement-library-search-clear]').focus();
      }
      await s('focused');
      await page.keyboard.press('Enter'); await sleep(700); await s('after Enter 1');
      await page.keyboard.press('Enter'); await sleep(1000); await s('after Enter 2');
    });
  }
  await run('r12-l2', V1280, async (page, s) => {
    await page.locator('[role=option][data-source-id="demo-middle-east"]').focus(); await sleep(150); await s('focus option');
    await page.keyboard.press('Enter'); await sleep(1200); await s('after Enter on option');
  }, false);
  await browser.close();
  res.net = net;
  save('vr.json', res);
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors, n.hydration.length, n.forbidden.length, n.authHeaders.length, n.noise, n.error])));
})();
