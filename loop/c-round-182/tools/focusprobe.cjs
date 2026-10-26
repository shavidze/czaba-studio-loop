// Probe: what draws the outer ring around a Tab-focused library row (current :5173 vs HEAD :5174). node focusprobe.cjs <base> <W> <tag>
const X = require('../../c-round-180/tools/lib122.cjs'); const { L, sleep } = X; const path = require('path'); const fs = require('fs');
const [base, Wv, tag] = process.argv.slice(2); process.env.C_BASE = base;
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const net = [];
  const ctx = await b.newContext({ viewport: X.VPS[+Wv], deviceScaleFactor: 2 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[role=option][data-source-id]', { timeout: 90000 }); await sleep(4000);
  await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (bt) bt.click(); });
  await p.locator('[data-testid="arrangement-library-search"]').focus(); let n = 0;
  for (; n < 15; n++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => !!document.activeElement.closest('[role=listbox]'))) break; }
  await p.mouse.move(2, 2); await sleep(400);
  const info = await p.evaluate(() => {
    const a = document.activeElement; const cs = getComputedStyle(a); const r = a.getBoundingClientRect();
    const anc = []; let e = a; while (e && e !== document.body) { const c = getComputedStyle(e); if (c.outlineStyle !== 'none' || /inset|0px 0px 0px [1-9]/.test(c.boxShadow) && e !== a) anc.push({ tag: e.tagName, role: e.getAttribute('role'), testid: e.dataset.testid, outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} off ${c.outlineOffset}`, shadow: c.boxShadow.slice(0, 160) }); e = e.parentElement; }
    return { id: a.dataset.sourceId, box: [r.x, r.y, r.width, r.height], fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`, shadow: cs.boxShadow, anc };
  });
  const dir = path.join(__dirname, '..', 'shots', 'focusprobe'); fs.mkdirSync(dir, { recursive: true });
  await p.screenshot({ path: path.join(dir, `${tag}.png`), clip: { x: 136, y: info.box[1] - 20, width: 160, height: info.box[3] + 40 } });
  // turn off outline on the active element and re-shoot
  await p.evaluate(() => { document.activeElement.style.outline = 'none'; });
  await sleep(200); await p.screenshot({ path: path.join(dir, `${tag}-outline-none.png`), clip: { x: 136, y: info.box[1] - 20, width: 160, height: info.box[3] + 40 } });
  console.log(JSON.stringify({ tag, tabs: n + 1, info, errs }, null, 1));
  await b.close();
})();
