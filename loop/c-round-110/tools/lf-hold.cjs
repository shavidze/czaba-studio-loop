const { chromium, sleep, openStudio, arm, st, save, SHOTS } = require('./lib.cjs');
const path = require('path');

const instrument = (page) =>
  page.evaluate(() => {
    const w = window;
    w.__c = { keys: [], clicks: [], changes: [] };
    const tid = (t) => (t && t.getAttribute ? t.getAttribute('data-testid') || t.getAttribute('aria-label') || t.tagName : String(t));
    window.addEventListener('keydown', (e) => { if (e.key === 'Enter') w.__c.keys.push({ phase: 'capture', repeat: e.repeat, target: tid(e.target) }); }, true);
    window.addEventListener('keydown', (e) => { if (e.key === 'Enter') w.__c.keys.push({ phase: 'bubble', repeat: e.repeat, prevented: e.defaultPrevented, target: tid(e.target) }); });
    document.addEventListener('click', (e) => w.__c.clicks.push(tid(e.target)), true);
    const lib = document.querySelector('[data-testid=arrangement-library]');
    new MutationObserver((ms) => { for (const m of ms) w.__c.changes.push({ attr: m.attributeName, value: m.target.getAttribute(m.attributeName) }); }).observe(lib, { attributes: true, attributeFilter: ['data-collapsed'] });
    const tree = document.querySelector('[data-testid=arrangement-library-tree]');
    if (tree) new MutationObserver((ms) => { for (const m of ms) w.__c.changes.push({ attr: m.attributeName, value: m.target.getAttribute(m.attributeName) }); }).observe(tree, { attributes: true, subtree: true, attributeFilter: ['aria-expanded'] });
  });
const read = (page) => page.evaluate(() => window.__c);
const reset = (page) => page.evaluate(() => { window.__c.keys = []; window.__c.clicks = []; window.__c.changes = []; });

async function cdpHold(client, repeats) {
  const base = { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' };
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, autoRepeat: false });
  for (let i = 0; i < repeats; i += 1) {
    await sleep(50);
    await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, autoRepeat: true });
  }
  await sleep(50);
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await sleep(700);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const net = [];
  const res = { utc: new Date().toISOString() };
  const vp = { width: 1280, height: 720 };
  const { ctx, page } = await openStudio(browser, vp, 'hold-1280x720', net);
  const client = await ctx.newCDPSession(page);
  await arm(page);
  await instrument(page);

  // 1. Playwright native hold (does it emit repeats?)
  await page.locator('[data-testid=arrangement-library-collapse]').focus();
  await reset(page);
  await page.keyboard.down('Enter');
  await sleep(600);
  await page.keyboard.up('Enter');
  await sleep(700);
  res.playwrightHold = { ...(await read(page)), state: await st(page, 'after playwright hold on ◀') };
  // restore expanded via mouse
  if ((await page.locator('[data-testid=arrangement-library]').getAttribute('data-collapsed')) === 'true') {
    await page.locator('[data-testid=arrangement-library-expand]').click();
    await sleep(600);
  }

  // 2. Control: CDP hold on a plain tree toggle button (no guard) -> repeats should click repeatedly
  const toggle = page.locator('[data-testid=arrangement-library-tree] button[aria-expanded]').first();
  await toggle.focus();
  await reset(page);
  await cdpHold(client, 10);
  res.controlTreeToggle = { ...(await read(page)), state: await st(page, 'after CDP hold on tree toggle') };
  // reset aria-expanded to true if needed
  if ((await toggle.getAttribute('aria-expanded')) === 'false') { await toggle.click(); await sleep(300); }
  await arm(page);

  // 3. CDP hold on ◀
  await page.locator('[data-testid=arrangement-library-collapse]').focus();
  const before1 = await st(page, 'before CDP hold ◀');
  await reset(page);
  await cdpHold(client, 10);
  res.holdCollapse = { before: before1, ...(await read(page)), state: await st(page, 'after CDP hold ◀') };
  await page.screenshot({ path: path.join(SHOTS, 'lf-hold-collapse-1280x720.png') });

  // 4. CDP hold on ▶ (focus should already be on ▶)
  await page.locator('[data-testid=arrangement-library-expand]').focus();
  const before2 = await st(page, 'before CDP hold ▶');
  await reset(page);
  await cdpHold(client, 10);
  res.holdExpand = { before: before2, ...(await read(page)), state: await st(page, 'after CDP hold ▶') };

  // 5. CDP hold on × (query 'mid')
  await page.locator('[data-testid=arrangement-library-search]').fill('mid');
  await sleep(300);
  await page.locator('[data-testid=arrangement-library-search-clear]').focus();
  const before3 = await st(page, 'before CDP hold ×');
  await reset(page);
  await cdpHold(client, 10);
  res.holdClear = { before: before3, ...(await read(page)), state: await st(page, 'after CDP hold ×') };
  await page.screenshot({ path: path.join(SHOTS, 'lf-hold-end-1280x720.png') });

  await ctx.close();
  await browser.close();
  res.net = net;
  save('lf-hold.json', res);
  const sum = (r) => ({
    repeatKeydowns: r.keys.filter((k) => k.phase === 'capture' && k.repeat).length,
    nonRepeat: r.keys.filter((k) => k.phase === 'capture' && !k.repeat).length,
    repeatPrevented: r.keys.filter((k) => k.phase === 'bubble' && k.repeat && k.prevented).length,
    clicks: r.clicks,
    changes: r.changes,
    end: [r.state.active, r.state.collapsed, r.state.clips, r.state.query],
  });
  for (const k of ['playwrightHold', 'controlTreeToggle', 'holdCollapse', 'holdExpand', 'holdClear']) console.log(k, JSON.stringify(sum(res[k])));
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors, n.hydration.length, n.forbidden.length, n.authHeaders.length])));
})();
