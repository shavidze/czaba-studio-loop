const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = __dirname + '/probe-strip-result.json';

async function setup(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  await ctx.addInitScript(() => {
    window.__ev = [];
    window.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd', k: e.key, r: e.repeat, a: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName }), true);
    window.addEventListener('click', (e) => window.__ev.push({ t: 'click', a: e.target?.getAttribute?.('data-testid') || e.target?.tagName }), true);
    new MutationObserver(() => {
      const b = document.querySelector('[data-testid=arrangement-library-preview-toggle]');
      const txt = b ? b.textContent.trim() : null;
      if (txt !== window.__lastLabel) { window.__ev.push({ t: 'label', v: txt, ms: Math.round(performance.now()) }); window.__lastLabel = txt; }
      const pl = document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]');
      const pv = pl ? pl.getAttribute('aria-label') : null;
      if (pv !== window.__lastPlay) { window.__ev.push({ t: 'transport', v: pv, ms: Math.round(performance.now()) }); window.__lastPlay = pv; }
    }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await p.goto('http://127.0.0.1:5173/studio-lab');
  await sleep(1500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
  await o.waitFor({ timeout: 90000 });
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  return { ctx, p, o, errors };
}

const measure = () => {
  const footer = document.querySelector('[data-testid=arrangement-export-footer]');
  let panel = footer.parentElement;
  while (panel && getComputedStyle(panel).overflowY !== 'auto') panel = panel.parentElement;
  const body = footer.parentElement;
  const cs = getComputedStyle(panel);
  const pr = panel.getBoundingClientRect();
  const innerBottom = pr.bottom - parseFloat(cs.borderBottomWidth);
  const fr = footer.getBoundingClientRect();
  const x = Math.round(pr.left + pr.width / 2);
  const probeY = innerBottom - 4;
  const hit = document.elementFromPoint(x, probeY);
  return {
    scrollTop: panel.scrollTop,
    scrollHeight: panel.scrollHeight,
    clientHeight: panel.clientHeight,
    panelTop: pr.top, panelBottom: pr.bottom, innerBottom,
    footerTop: fr.top, footerBottom: fr.bottom,
    gapBelowFooter: +(innerBottom - fr.bottom).toFixed(2),
    bodyClass: body.className,
    bodyPaddingBottom: getComputedStyle(body).paddingBottom,
    footerClass: footer.className,
    hitAtInnerBottomMinus4: hit ? (footer.contains(hit) ? 'footer-descendant' : (hit === body ? 'ModalBody' : hit.tagName + '.' + (hit.getAttribute('data-testid') || ''))) : null,
  };
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = {};
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    const key = `${vp.width}x${vp.height}`;
    const { ctx, p, o, errors } = await setup(browser, vp);
    const R = { errors };
    await o.focus(); await p.keyboard.press('Enter'); await sleep(500);
    R.clips = await p.$$eval('[data-clip-id]', (e) => e.length);
    await p.getByRole('button', { name: 'Export', exact: true }).click();
    await p.waitForSelector('#arrangement-export-title'); await sleep(600);
    R.top = await p.evaluate(measure);
    await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); let pnl = f.parentElement; while (getComputedStyle(pnl).overflowY !== 'auto') pnl = pnl.parentElement; pnl.scrollTop = pnl.scrollHeight; });
    await sleep(300);
    R.maxBefore = await p.evaluate(measure);
    await p.screenshot({ path: __dirname + `/strip-before-max-${key}.png` });
    await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); f.parentElement.classList.add('pb-0'); let pnl = f.parentElement; while (getComputedStyle(pnl).overflowY !== 'auto') pnl = pnl.parentElement; pnl.scrollTop = pnl.scrollHeight; });
    await sleep(300);
    R.maxSimulatedPb0 = await p.evaluate(measure);
    await p.screenshot({ path: __dirname + `/strip-simulated-pb0-max-${key}.png` });
    res[key] = R;
    await ctx.close();
  }
  {
    const { ctx, p, o, errors } = await setup(browser, { width: 1280, height: 720 });
    const R = { errors };
    await o.click(); await sleep(300);
    const tg = p.getByTestId('arrangement-library-preview-toggle');
    await tg.focus(); await sleep(200);
    R.active = await p.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    R.labelBefore = (await tg.textContent()).trim();
    await p.evaluate(() => { window.__ev = []; });
    await p.keyboard.down(' ');
    for (let i = 0; i < 3; i++) { await sleep(50); await p.keyboard.down(' '); }
    await p.keyboard.up(' ');
    await sleep(1200);
    R.labelAfter = (await tg.textContent()).trim();
    R.events = await p.evaluate(() => window.__ev);
    R.clicksOnToggle = R.events.filter((e) => e.t === 'click' && e.a === 'arrangement-library-preview-toggle').length;
    R.transportAfter = await p.evaluate(() => { const b = document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]'); return b ? b.getAttribute('aria-label') : null; });
    await p.screenshot({ path: __dirname + '/space-hold-toggle-1280.png' });
    res.spaceHoldToggle1280 = R;
    await ctx.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
