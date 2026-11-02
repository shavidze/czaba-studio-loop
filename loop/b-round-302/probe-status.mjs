import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const HINT = ' Drag a clip by its name bar to move it.';
const out = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {};
  for (const which of ['first', 'fullmix', 'longest']) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://127.0.0.1:5173/studio-lab');
    const status = page.getByTestId('arrangement-status');
    await status.filter({ hasText: 'Demo collection ready' }).waitFor({ timeout: 60000 });
    if (which !== 'first') {
      const id = which === 'fullmix' ? 'demo-synth-mix' : 'demo-hero-music';
      for (let i = 0; i < 6; i++) {
        const closed = page.locator('[data-testid="arrangement-library-folder"][aria-expanded="false"]');
        if ((await closed.count()) === 0) break;
        await closed.first().click();
      }
      await page.locator(`[role="option"][data-source-id="${id}"]`).click();
    }
    const box = async () => page.evaluate(() => {
      const o = document.querySelector('[data-testid="arrangement-status"]');
      const f = o.closest('footer');
      const lh = parseFloat(getComputedStyle(o).lineHeight);
      const tl = document.querySelector('[data-testid="arrangement-timeline"]') ?? document.querySelector('main');
      const rg = document.createRange(); rg.selectNodeContents(o.querySelector('span')); const rects = [...rg.getClientRects()]; const textW = Math.max(...rects.map((x) => x.width)); return { textW, outW: o.clientWidth, rectCount: rects.length, text: o.textContent, outputH: o.getBoundingClientRect().height, lineH: lh, lines: Math.round(o.getBoundingClientRect().height / lh), footerH: f.getBoundingClientRect().height, footerTop: f.getBoundingClientRect().top, docScrollH: document.documentElement.scrollHeight, innerH: innerHeight };
    });
    const ready = await box();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const added = await box();
    await page.evaluate((hint) => {
      const s = document.querySelector('[data-testid="arrangement-status"] span');
      const t = s.textContent; const m = t.match(/ at \d\d:\d\d\.\d\d\d(?: \(nearest free spot\))?\./); const i = m ? m.index + m[0].length : t.length;
      s.textContent = t.slice(0, i) + hint + t.slice(i);
    }, HINT);
    await page.waitForTimeout(200);
    const injected = await box();
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/b-round-302/probe-${which}-${w}.png` });
    r[which] = { ready, added, injected };
    await page.close();
  }
  out[`${w}x${h}`] = r;
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
