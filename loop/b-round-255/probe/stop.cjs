const fs = require('fs');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)')).replace(/const SHA = .*\n/, '');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
let BASE;
eval(helpers.replace('const sleep', 'var sleep').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
const D = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-255/probe/';
const out = {};
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [tag, base] of [['sketch', 'http://127.0.0.1:5181']]) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
      const k = `${tag}-${vp.width}`; const r = {}; out[k] = r;
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      const s = () => page.evaluate(() => ({ pos: document.querySelector('[data-testid=arrangement-position]').textContent, marker: document.querySelector('[data-testid=arrangement-insert-marker]')?.getAttribute('data-insert-marker') ?? null, play: [...document.querySelectorAll('button')].filter((b) => /^(Play|Pause|Stop)$/.test(b.getAttribute('aria-label') || '')).map((b) => b.getAttribute('aria-label')) }));
      const tb = await page.evaluate(() => { const p = document.querySelector('[data-testid=arrangement-position]'); let bar = p; while (bar && bar.parentElement && bar.getBoundingClientRect().width < innerWidth - 2) bar = bar.parentElement; return Math.round(bar.getBoundingClientRect().height); });
      r.toolbarH = tb;
      // sheet
      await page.keyboard.press('Shift+Slash'); await sleep(600);
      r.sheet = await page.evaluate(() => { const dlg = document.querySelector('[role=dialog]'); if (!dlg) return null; const rows = Object.fromEntries([...dlg.querySelectorAll('[data-shortcut-id]')].map((li) => [li.getAttribute('data-shortcut-id'), +li.getBoundingClientRect().height.toFixed(1)])); let sc = null; for (let e = dlg.querySelector('[data-shortcut-id]'); e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) { sc = { sh: e.scrollHeight, ch: e.clientHeight, sw: e.scrollWidth, cw: e.clientWidth }; break; } } return { rows, sc }; });
      await page.screenshot({ path: `${D}stop-sheet-${k}.png` });
      await page.keyboard.press('Escape'); await sleep(400);
      // tab order in toolbar
      await page.locator('[data-testid=arrangement-position]').click(); await blur(page);
      await page.evaluate(() => { const u = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim().startsWith('Undo')); u.removeAttribute('disabled'); u.focus(); });
      const seq = [];
      for (let i = 0; i < 16; i += 1) { seq.push(await page.evaluate(() => { const a = document.activeElement; return a.getAttribute('aria-label') || a.getAttribute('data-testid') || (a.textContent || '').trim().slice(0, 14); })); await page.keyboard.press('Tab'); await sleep(60); }
      r.tabFromUndo = seq;
      await page.reload(); await page.waitForFunction(() => document.querySelector('[data-testid=arrangement-status]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(600); await addPulse(page);
      r.s0 = await s();
      if (tag === 'sketch') {
        const play = page.getByRole('button', { name: 'Play', exact: true }); const stop = page.getByRole('button', { name: 'Stop', exact: true });
        await play.click(); await sleep(900); r.afterPlay = await s();
        await play.click(); await sleep(500); r.afterPlayAgain = await s();
        await stop.click(); await sleep(400); r.afterStop = await s(); await sleep(500); r.afterStopLater = await s();
        await stop.click(); await sleep(300); r.afterStopStopped = await s();
        await stop.dblclick(); await sleep(400); r.afterDbl = await s();
        await play.click(); await sleep(900); await stop.dblclick(); await sleep(400); r.afterDblWhilePlaying = await s(); await sleep(500); r.afterDblWhilePlayingLater = await s();
        r.stopTitle = await stop.getAttribute('title'); r.playTitle = await play.getAttribute('title');
      }
      await page.screenshot({ path: `${D}stop-full-${k}.png` });
      r.errors = errors; await ctx.close();
      console.log(k, JSON.stringify(r).slice(0, 1500));
    }
  }
  await browser.close();
  fs.writeFileSync(D + 'stop-probe-sketch.json', JSON.stringify(out, null, 1));
})();
