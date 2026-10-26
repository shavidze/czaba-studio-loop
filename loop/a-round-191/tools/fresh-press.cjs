// fresh page, no prior interaction, mouse press on one control: does :focus-visible match?
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const path = require('path');
const [tag = 'before', vp = '1440x900', variant = 'none'] = process.argv.slice(2);
const [W, H] = vp.split('x').map(Number);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEL = { trackVol: '[data-track-id=music] input[aria-label^="Volume — "]', pan: '[data-testid=arrangement-track-pan]', master: 'input[aria-label="Master Volume"]', zoom: '[data-testid=arrangement-zoom]' };
(async () => {
  const b = await chromium.launch({ args: ['--disable-lcd-text'] });
  for (const [name, sel] of Object.entries(SEL)) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 90000 }); await sleep(2500);
    const f = p.locator(sel).first();
    if (variant === 'noring') await f.evaluate((el) => el.classList.remove('focus-visible:ring-2', 'focus-visible:ring-brand'));
    if (variant === 'nooutline') await f.evaluate((el) => el.style.setProperty('outline', 'none', 'important'));
    const bb = await f.boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await sleep(400);
    const s = await f.evaluate((el) => { const c = getComputedStyle(el); return { fv: el.matches(':focus-visible'), siblingBeforeOutline: getComputedStyle(el.nextElementSibling || el, '::before').outline, outline: c.outline, offset: c.outlineOffset, shadow: c.boxShadow, tr: c.transition.slice(0, 120) }; });
    await p.screenshot({ path: path.join(__dirname, '..', 'shots', `fresh-${tag}-${W}-${name}-${variant}.png`), clip: { x: bb.x - 8, y: bb.y - 14, width: bb.width + 16, height: bb.height + 28 } });
    await p.mouse.up();
    console.log(tag, W, name, variant, JSON.stringify(s));
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
