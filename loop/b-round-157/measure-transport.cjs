const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'measure');
fs.mkdirSync(OUT, { recursive: true });

async function run(width, height) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-position"]', { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const pos = document.querySelector('[data-testid="arrangement-position"]');
    const bar = pos.closest('div.flex.flex-wrap');
    const glyphRe = /[▶❚↤↶↷✂⌫↻⇔↩‖]/u;
    const buttons = [...bar.querySelectorAll('button')].map((b) => {
      const r = b.getBoundingClientRect();
      const glyphs = [];
      const walker = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const t = n.textContent;
        for (let i = 0; i < t.length; i += 1) {
          if (glyphRe.test(t[i])) {
            const range = document.createRange();
            range.setStart(n, i);
            range.setEnd(n, i + 1);
            const gr = range.getBoundingClientRect();
            let spaceW = null;
            if (t[i + 1] === ' ') {
              const sr = document.createRange();
              sr.setStart(n, i + 1);
              sr.setEnd(n, i + 2);
              spaceW = sr.getBoundingClientRect().width;
            }
            glyphs.push({ ch: t[i], w: gr.width, h: gr.height, x: gr.x - r.x, spaceW });
          }
        }
      }
      const cs = getComputedStyle(b);
      return {
        text: b.textContent,
        aria: b.getAttribute('aria-label'),
        testid: b.dataset.testid ?? null,
        x: r.x, y: r.y, w: r.width, h: r.height,
        gap: cs.columnGap, pl: cs.paddingLeft, pr: cs.paddingRight,
        fontSize: cs.fontSize, family: cs.fontFamily,
        glyphs,
      };
    });
    const br = bar.getBoundingClientRect();
    return { bar: { x: br.x, y: br.y, w: br.width, h: br.height }, buttons };
  });
  const client = await context.newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const doc = await client.send('DOM.getDocument', { depth: -1 });
  const ids = await client.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'button',
  });
  const fonts = [];
  for (const nodeId of ids.nodeIds.slice(0, 60)) {
    const html = await client.send('DOM.getOuterHTML', { nodeId });
    if (!/[▶❚↤↶↷✂⌫↻⇔↩]/u.test(html.outerHTML)) continue;
    const f = await client.send('CSS.getPlatformFontsForNode', { nodeId });
    fonts.push({ html: html.outerHTML.replace(/class="[^"]*"/g, '').slice(0, 120), fonts: f.fonts });
  }
  await page.screenshot({ path: path.join(OUT, `transport-${width}.png`), clip: { x: 0, y: data.bar.y, width, height: data.bar.h } });
  fs.writeFileSync(path.join(OUT, `transport-${width}.json`), JSON.stringify({ width, height, errors, data, fonts }, null, 1));
  await browser.close();
  return { width, errors: errors.length, n: data.buttons.length };
}

(async () => {
  console.log(await run(1440, 900));
  console.log(await run(1280, 720));
})();
