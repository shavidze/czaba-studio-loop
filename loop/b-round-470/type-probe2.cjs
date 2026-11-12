// B round 470 -> 471: STORE-2c-1 wide probe. Usage: node type-probe2.cjs <out.json> name=url [name=url ...]
// Per page x viewport: every visible text element (h1-h4, a, button, span, p, li, label, dt, dd) with its line count,
// CLS (buffered layout-shift, no input) until 2.5 s after load, a long product title, and a glyph probe on /.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('node:fs');

const [out, ...targets] = process.argv.slice(2);
const PATHS = (process.env.PATHS ?? '/,/store,/products/middle-east,/free-downloads,/gift-cards,/about,/faq,/studio/middle-east').split(',');
const VIEWPORTS = [
  [1440, 900],
  [1280, 720],
  [375, 812],
];
const LONG_TITLE = 'Midnight Orchestral Tension Underscore for Feature Film Trailers and Documentary Scenes';
const GLYPHS = 'ქართული — · → € ¼ ↑';

async function platformFonts(cdp, selector) {
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  if (!nodeId) return null;
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  return fonts.map((f) => `${f.familyName}:${f.glyphCount}`);
}

(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const target of targets) {
    const [name, base] = target.split('=');
    result[name] = {};
    for (const [w, h] of VIEWPORTS) {
      for (const p of PATHS) {
        const context = await browser.newContext({ viewport: { width: w, height: h } });
        await context.addInitScript(() => {
          window.__cls = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
          }).observe({ type: 'layout-shift', buffered: true });
        });
        const page = await context.newPage();
        await page.goto(base + p, { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(2500);
        const m = await page.evaluate(() => {
          const lines = (el) => {
            const r = document.createRange();
            r.selectNodeContents(el);
            const tops = new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
            return tops.size;
          };
          const els = [...document.querySelectorAll('h1,h2,h3,h4,a,button,span,p,li,label,dt,dd')].filter((el) => {
            const b = el.getBoundingClientRect();
            const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== '');
            return own && b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
          });
          return {
            cls: Math.round(window.__cls * 10000) / 10000,
            scrollHeight: document.documentElement.scrollHeight,
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            els: els.map((el) => ({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 50),
              lines: lines(el),
              clipped: el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible',
              family: getComputedStyle(el).fontFamily.split(',')[0],
            })),
          };
        });
        if (p.startsWith('/products/')) {
          m.longTitle = await page.evaluate((t) => {
            const h1 = document.querySelector('h1');
            if (!h1) return null;
            h1.textContent = t;
            const r = document.createRange();
            r.selectNodeContents(h1);
            return {
              lines: new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size,
              overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              h1Overflow: h1.scrollWidth - h1.clientWidth,
            };
          }, LONG_TITLE);
        }
        if (p === '/') {
          await page.evaluate((g) => {
            const el = document.createElement('p');
            el.id = 'b-glyph-probe';
            el.textContent = g;
            document.body.prepend(el);
          }, GLYPHS);
          const cdp = await context.newCDPSession(page);
          await cdp.send('DOM.enable');
          await cdp.send('CSS.enable');
          m.glyphPlatform = await platformFonts(cdp, '#b-glyph-probe').catch((e) => String(e));
        }
        result[name][`${w}x${h}${p}`] = m;
        await context.close();
      }
    }
  }
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  await browser.close();
})();
