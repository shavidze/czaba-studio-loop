const fs = require('fs');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)')).replace(/const SHA = .*\n/, '');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
var BASE = 'http://127.0.0.1:5173'; const crypto = require('crypto');
eval(helpers.replace('const sleep', 'var sleep').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
(async () => {
  const browser = await chromium.launch(); const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const { ctx, page } = await open(browser, vp, { pulse: false });
    await page.keyboard.press('Shift+Slash'); await sleep(600);
    out[vp.width] = await page.evaluate(() => { const dlg = document.querySelector('[role=dialog]'); const li = dlg.querySelector('[data-shortcut-id="back-to-start"]'); let sc = null; for (let e = li; e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) { sc = { sh: e.scrollHeight, ch: e.clientHeight, sw: e.scrollWidth, cw: e.clientWidth }; break; } } return { row: +li.getBoundingClientRect().height.toFixed(1), text: li.textContent, keys: [...li.querySelectorAll('kbd')].map((k) => k.textContent), sc }; });
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/a-round-256/browser/sheet-${vp.width}.png` });
    await ctx.close();
  }
  await browser.close(); console.log(JSON.stringify(out));
})();
