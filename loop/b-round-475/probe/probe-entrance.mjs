import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, tag, outDir] = process.argv.slice(2);
const b = await chromium.launch();
const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} });
  const p = await ctx.newPage();
  const r = { cover: [], };
  await p.goto(base + '/', { waitUntil: 'commit' });
  for (let i = 0; i < 40; i++) {
    const s = await p.evaluate(() => {
      const st = document.getElementById('czaba-entrance-cover');
      const be = getComputedStyle(document.body, '::before');
      return { ms: Math.round(performance.now()), media: st?.media ?? null, before: be.content !== 'none' ? be.backgroundColor : null, loader: !!document.querySelector('[data-testid="entrance-loader"]') };
    }).catch(() => null);
    if (s) r.cover.push(s);
    if (s?.loader) break;
    await p.waitForTimeout(25);
  }
  await p.waitForSelector('[data-testid="entrance-loader"]', { timeout: 8000 });
  await p.waitForTimeout(700);
  r.hold = await p.evaluate(() => {
    const o = document.querySelector('[data-testid="entrance-loader"]');
    const word = [...o.querySelectorAll('span')].find((n) => n.textContent === 'CZABA');
    const dust = o.querySelector('div.rounded-full');
    const kids = [...o.children].map((n) => ({ cls: n.getAttribute('class'), bg: getComputedStyle(n).backgroundImage.slice(0, 160), bgc: getComputedStyle(n).backgroundColor }));
    const wb = word.getBoundingClientRect();
    return { overlayBg: getComputedStyle(o).backgroundColor, parentIsBody: o.parentElement === document.body, word: { color: getComputedStyle(word).color, weight: getComputedStyle(word).fontWeight, box: [wb.x, wb.y, wb.width, wb.height].map(Math.round) }, dustBg: dust && getComputedStyle(dust).backgroundColor, kids };
  });
  await p.screenshot({ path: `${outDir}/${tag}-hold-${w}.png` });
  await p.waitForSelector('[data-testid="entrance-loader"]', { state: 'detached', timeout: 8000 });
  await p.waitForTimeout(300);
  r.after = await p.evaluate(() => {
    const logo = document.querySelector('header a[href="/"] span');
    const active = [...document.querySelectorAll('header nav a')].map((a) => ({ t: a.textContent.trim(), c: getComputedStyle(a).color }));
    return { bodyBg: getComputedStyle(document.body).backgroundColor, htmlBg: getComputedStyle(document.documentElement).backgroundColor, logo: logo && { color: getComputedStyle(logo).color, weight: getComputedStyle(logo).fontWeight }, nav: active };
  });
  await p.screenshot({ path: `${outDir}/${tag}-after-${w}.png`, clip: { x: 0, y: 0, width: w, height: 80 } });
  await p.goto(base + '/store', { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(500);
  r.store = await p.evaluate(() => ({ logo: getComputedStyle(document.querySelector('header a[href="/"] span')).color, nav: [...document.querySelectorAll('header nav a')].map((a) => ({ t: a.textContent.trim(), c: getComputedStyle(a).color, bg: getComputedStyle(a).backgroundColor })) }));
  await p.screenshot({ path: `${outDir}/${tag}-store-header-${w}.png`, clip: { x: 0, y: 0, width: w, height: 80 } });
  res[w] = r;
  await ctx.close();
}
await b.close();
writeFileSync(`${outDir}/probe-${tag}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res).slice(0, 400));
