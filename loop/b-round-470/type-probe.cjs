// B round 470 -> 471: STORE-2c-1 type probe. Usage: node type-probe.cjs <out.json> <shotDir> name=url [name=url ...]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const [out, shotDir, ...targets] = process.argv.slice(2);
const PATHS = (process.env.PATHS ?? '/,/store,/products/middle-east,/free-downloads,/gift-cards,/about,/faq,/studio/middle-east').split(',');
const VIEWPORTS = [
  [1440, 900],
  [1280, 720],
  [375, 812],
];
fs.mkdirSync(shotDir, { recursive: true });

async function platformFonts(cdp, page, selector) {
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
        const page = await context.newPage();
        const fontResponses = [];
        page.on('response', (r) => {
          if (/\.woff2(\?|$)/.test(r.url())) fontResponses.push(`${path.basename(r.url().split('?')[0])}:${r.status()}`);
        });
        await page.goto(base + p, { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(2500);
        const cdp = await context.newCDPSession(page);
        await cdp.send('DOM.enable');
        await cdp.send('CSS.enable');
        const m = await page.evaluate(() => {
          const cs = (el) => (el ? getComputedStyle(el) : null);
          const pick = (el) =>
            el
              ? {
                  text: (el.textContent ?? '').trim().slice(0, 60),
                  family: cs(el).fontFamily,
                  weight: cs(el).fontWeight,
                  size: cs(el).fontSize,
                  height: Math.round(el.getBoundingClientRect().height * 10) / 10,
                  width: Math.round(el.getBoundingClientRect().width * 10) / 10,
                }
              : null;
          const headings = [...document.querySelectorAll('main h1, main h2, main h3, h1')]
            .filter((el) => el.getBoundingClientRect().height > 0)
            .slice(0, 12)
            .map(pick);
          const mono = [...document.querySelectorAll('.font-mono')].filter((el) => el.getBoundingClientRect().height > 0);
          return {
            bodyFamily: cs(document.body).fontFamily,
            headings,
            monoCount: mono.length,
            mono: mono.slice(0, 3).map(pick),
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            scrollHeight: document.documentElement.scrollHeight,
            check700: document.fonts.check('700 16px "Instrument Sans"'),
            loadedFaces: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family}:${f.weight}`),
          };
        });
        m.h1Platform = await platformFonts(cdp, page, 'h1').catch(() => null);
        m.bodyTextPlatform = await platformFonts(cdp, page, 'main p').catch(() => null);
        m.monoPlatform = await platformFonts(cdp, page, '.font-mono').catch(() => null);
        m.fontResponses = [...new Set(fontResponses)].sort();
        const key = `${w}x${h}${p}`;
        result[name][key] = m;
        const shot = path.join(shotDir, `${name}-${w}-${p.replace(/\//g, '_') || 'root'}.png`);
        await page.screenshot({ path: shot }).catch(() => {});
        await context.close();
      }
    }
  }
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  await browser.close();
})();
