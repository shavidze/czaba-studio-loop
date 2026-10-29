const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [tag, base] of [['new', 'http://127.0.0.1:5173'], ['head', 'http://127.0.0.1:5180']]) for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
    await p.goto(base + '/studio-lab'); await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(500);
    await p.keyboard.press('Shift+Slash'); await sleep(500);
    out[`${tag}-${vp.width}`] = await p.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]'); let sc = dlg.querySelector('[data-shortcut-id]'); while (sc && !(getComputedStyle(sc).overflowY.match(/auto|scroll/) && sc.scrollHeight > sc.clientHeight)) sc = sc.parentElement;
      const secs = [...dlg.querySelectorAll('section')].map((s) => { const r = s.getBoundingClientRect(); const ul = s.querySelector('ul').getBoundingClientRect(); return { t: s.querySelector('h3').textContent, x: Math.round(r.x), y: Math.round(r.y), h: Math.round(r.height), ulH: Math.round(ul.height) }; });
      const sh0 = sc.scrollHeight;
      dlg.querySelectorAll('[data-shortcut-id] > span:first-child').forEach((s) => { s.style.whiteSpace = 'nowrap'; });
      const shNoWrap = sc.scrollHeight;
      return { sh: sh0, ch: sc.clientHeight, shNoWrap, secs };
    });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1)); require('fs').writeFileSync(__dirname + '/browser/sheet-diag.json', JSON.stringify(out, null, 1)); await b.close();
})();
