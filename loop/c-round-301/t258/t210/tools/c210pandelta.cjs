// C round 210 — PAN-DELTA attempt: try to reach "stolen claim -> native Pan change" by real input.
// Attempt A: hold the left mouse on Pan, move over a clip header, press the right button (chorded), press ArrowRight.
// Attempt B: hold the left mouse on Pan, CDP touchStart on a clip header (different pointerId), press ArrowRight.
// usage: node c210pandelta.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c210lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];

async function snap(page, pv, tA) {
  return { pan: await L.display(pv), undo: await L.undoTitle(page), status: await L.statusText(page),
    gesture: await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('aria-label')),
    panWrites: await page.evaluate((tA) => window.__c.gw.filter((w) => w.t >= tA).length, tA),
    downs: await page.evaluate((tA) => window.__c.downs.filter((t) => t >= tA).length, tA) };
}

(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    const cdp = await ctx.newCDPSession(page);
    const pv = L.sl(page, 'Pan — Music');
    await L.space(page, 'Pause');
    const header = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); const h = c && c.firstElementChild; if (!h) return null; const r = h.getBoundingClientRect(); return { x: Math.min(r.x + 60, innerWidth - 20), y: r.y + r.height / 2, w: r.width, h: r.height, el: document.elementFromPoint(Math.min(r.x + 60, innerWidth - 20), r.y + r.height / 2) === h || h.contains(document.elementFromPoint(Math.min(r.x + 60, innerWidth - 20), r.y + r.height / 2)) }; });
    R.header = header;
    for (const attempt of ['A-chord-right', 'B-touch']) {
      const o = {};
      const b = await pv.boundingBox();
      const y = b.y + b.height / 2;
      const tA = await L.now(page);
      o.before = await snap(page, pv, tA);
      await page.mouse.move(b.x + b.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2 + 15, y, { steps: 5 });
      o.afterMove = await snap(page, pv, tA);
      if (attempt === 'A-chord-right') {
        await page.mouse.move(header.x, header.y, { steps: 3 });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: header.x, y: header.y, button: 'right', buttons: 3, clickCount: 1 });
        await L.sleep(150);
        o.afterSecond = await snap(page, pv, tA);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: header.x, y: header.y, button: 'right', buttons: 1, clickCount: 1 });
      } else {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: header.x, y: header.y, id: 7 }] });
        await L.sleep(150);
        o.afterSecond = await snap(page, pv, tA);
      }
      await pv.focus().catch(() => {});
      await page.keyboard.press('ArrowRight');
      await L.sleep(200);
      o.afterArrow = await snap(page, pv, tA);
      if (attempt === 'B-touch') await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.keyboard.press('Escape').catch(() => {});
      await page.mouse.up();
      await L.quiet(page);
      o.afterUp = await snap(page, pv, tA);
      R[attempt] = o;
      await L.blurActive(page);
    }
    R.errors = errors;
    await ctx.close();
  } catch (e) {
    R.fatal = String(e && e.stack || e).slice(0, 1500);
  }
  await browser.close();
  L.save(`pandelta-${tag}.json`, R);
  console.log('done', tag, R.fatal || '');
})();
