const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const OUT = __dirname;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const res = {};
  // loader at ~450ms
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'commit' });
  await page.waitForSelector('[data-testid="entrance-loader"]', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(450);
  res.loader = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="entrance-loader"]');
    if (!root) return 'absent';
    const span = [...root.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA');
    const cs = span && getComputedStyle(span);
    const line = root.querySelector('div.h-\\[1px\\]');
    const ls = line && getComputedStyle(line);
    const teal = [...root.querySelectorAll('*')].filter((e) => /19, 217, 204|20, 184, 166/.test(getComputedStyle(e).backgroundImage + getComputedStyle(e).filter)).length;
    return { color: cs?.color, fill: cs?.webkitTextFillColor, bg: cs?.backgroundImage, filter: cs?.filter, lineBg: ls?.backgroundColor, lineW: ls?.width, tealEls: teal };
  });
  await page.waitForTimeout(3500);
  await page.evaluate(() => localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())));
  const mock = page.locator('text=4 stems loaded').first();
  await mock.scrollIntoViewIfNeeded().catch(() => null);
  await page.waitForTimeout(800);
  res.mockup = await page.evaluate(() => {
    const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
    const root = [...document.querySelectorAll('span')].find((s) => s.textContent.includes('stems loaded'))?.closest('div.rounded-xl');
    if (!root) return 'absent';
    const play = root.querySelector('div.rounded-full.bg-brand');
    const pcs = getComputedStyle(play);
    const exp = [...root.querySelectorAll('div')].find((d) => d.textContent.trim() === 'Export Mix');
    const ecs = getComputedStyle(exp);
    const barBg = parse(getComputedStyle(exp.parentElement.parentElement).backgroundColor);
    const expBg = over(parse(ecs.backgroundColor), barBg);
    const svgs = [...root.querySelectorAll('svg[viewBox="0 0 100 50"]')];
    const wave = svgs.map((s) => { const c = parse(getComputedStyle(s).color); const area = parse(getComputedStyle(s.parentElement).backgroundColor); return { color: getComputedStyle(s).color, vsArea: ratio(c, area), strokeAttr: s.querySelector('path').getAttribute('stroke') }; });
    const fill = root.querySelector('div.bg-brand.h-full');
    const thumb = fill.nextElementSibling;
    const track = parse(getComputedStyle(fill.parentElement).backgroundColor);
    const fillC = parse(getComputedStyle(fill).backgroundColor);
    const thumbC = parse(getComputedStyle(thumb).backgroundColor);
    const tealSvg = [...root.querySelectorAll('svg, path')].filter((e) => /19, 217, 204|20, 184, 166|13d9cc/i.test(getComputedStyle(e).stroke + getComputedStyle(e).filter)).length;
    return {
      playBg: pcs.backgroundColor, playColor: pcs.color, playRatio: ratio(parse(pcs.color), parse(pcs.backgroundColor)),
      exportColor: ecs.color, exportBg: ecs.backgroundColor, exportComposite: expBg, exportRatio: ratio(parse(ecs.color), expBg),
      wave, fillVsTrack: ratio(fillC, track), thumbVsFill: ratio(thumbC, fillC), thumbVsTrack: ratio(thumbC, track), tealSvg,
    };
  });
  await page.locator('text=4 stems loaded').first().screenshot({ path: `${OUT}/mockup-bottom.png` }).catch(() => null);
  const box = await page.evaluate(() => { const r = [...document.querySelectorAll('span')].find((s) => s.textContent.includes('stems loaded'))?.closest('div.rounded-xl'); return r ? (r.scrollIntoView(), true) : false; });
  if (box) await page.screenshot({ path: `${OUT}/mockup-1440.png` });
  fs.writeFileSync(`${OUT}/contrast.json`, JSON.stringify(res, null, 2));
  fs.writeFileSync(`${OUT}/../a-browse.json`, JSON.stringify({ round: 447, script: 'a-round-447/contrast.cjs', url: 'http://127.0.0.1:5173/', at: new Date().toISOString() }));
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
