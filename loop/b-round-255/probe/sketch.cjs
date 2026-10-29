const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const D = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-255/probe/';
(async () => {
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 180000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => {
      const pos = document.querySelector('[data-testid=arrangement-position]');
      let bar = pos; while (!bar.className.toString().includes('flex-wrap')) bar = bar.parentElement;
      const before = bar.getBoundingClientRect().height;
      const kids = [...bar.children];
      const right = kids[kids.length - 1];
      const [play, back, clock, sep1, undo, redo, sep2, split, del, sep3, loop] = kids;
      const follow = right.children[0];
      const mk = (cls) => { const d = document.createElement('div'); d.className = cls; return d; };
      const L = mk('flex items-center gap-1.5 justify-self-start');
      const C = mk('flex items-center gap-1.5 justify-self-center');
      const R = mk('flex items-center gap-1.5 justify-self-end');
      const stop = play.cloneNode(true); stop.setAttribute('aria-label', 'Stop');
      L.append(undo, redo, sep2, split, del);
      C.append(follow, clock, play, stop, back, loop);
      R.append(...[...right.children]);
      bar.replaceChildren(L, C, R);
      bar.style.display = 'grid'; bar.style.gridTemplateColumns = '1fr auto 1fr'; bar.style.columnGap = '12px';
      const b = (el) => { const x = el.getBoundingClientRect(); return { x: Math.round(x.x), r: Math.round(x.right), w: Math.round(x.width), h: Math.round(x.height) }; };
      const cb = b(C); const tb = b(bar);
      return { heightBefore: Math.round(before), heightAfter: tb.h, L: b(L), C: cb, R: b(R), Lsw: L.scrollWidth, Rsw: R.scrollWidth,
        centreOffset: Math.round((cb.x + cb.w / 2) - (tb.x + tb.w / 2)),
        overlap: b(L).r > cb.x || cb.r > b(R).x, play: b(play), stop: b(stop) };
    });
    out[`${w}x${h}`] = r;
    await page.screenshot({ path: `${D}sketch-${w}x${h}.png`, clip: { x: 0, y: 0, width: w, height: 140 } });
    await ctx.close();
  }
  await browser.close();
  require('fs').writeFileSync(D + 'sketch.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
