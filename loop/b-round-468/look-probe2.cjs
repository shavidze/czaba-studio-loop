// B round 468->469 look probe v2 (= look-probe.cjs plus each glow centre cx/cy relative to the screenshotted section box).
// For the first two `.homepage > div` sections (ProductSection, StudioShowcase): records every direct
// decorative child of the section (computed position absolute, pointer-events none, border-radius >= half
// its width, width >= 300 px) with its computed filter / background-image, then screenshots the section
// and returns its mean luminance (0..255). A variant with ",hide" sets visibility:hidden on those children
// (the deleted-glow control).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [outPath, shotDir, ...variants] = process.argv.slice(2);
const NAMES = ['product-section', 'studio-showcase'];
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    for (const v of variants) {
      const [name, rest] = v.split('=');
      const [url, hide] = rest.split(',');
      const ctx = await b.newContext({ viewport: vp });
      await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastShown: Date.now(), dismissed: true, submitted: true })));
      const p = await ctx.newPage();
      await p.goto(url + '/', { waitUntil: 'load' });
      await p.waitForTimeout(3000);
      const tops = await p.evaluate(() => [...document.querySelectorAll('.homepage > div')].slice(0, 2).map((d) => Math.round(d.getBoundingClientRect().top + scrollY)));
      for (let k = 0; k < 2; k++) {
        await p.evaluate((y) => window.scrollTo(0, y), tops[k] - 100);
        await p.waitForTimeout(2500);
        const glows = await p.evaluate(([k, hide]) => {
          const wrap = document.querySelectorAll('.homepage > div')[k];
          const sec = wrap.querySelector('section') || wrap;
          const kids = [...sec.children].filter((e) => {
            const s = getComputedStyle(e);
            return s.position === 'absolute' && s.pointerEvents === 'none' && parseFloat(s.borderTopLeftRadius) >= e.offsetWidth / 2 - 1 && e.offsetWidth >= 300;
          });
          if (hide) kids.forEach((e) => { e.style.visibility = 'hidden'; });
          return kids.map((e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(), q = wrap.getBoundingClientRect(); return { cy: Math.round((r.top + r.bottom) / 2 - q.top), cx: Math.round((r.left + r.right) / 2 - q.left), w: e.offsetWidth, filter: s.filter, bgImage: s.backgroundImage.slice(0, 200), bgColor: s.backgroundColor, transform: s.transform, willChange: s.willChange }; });
        }, [k, !!hide]);
        await p.addStyleTag({ content: 'header{visibility:hidden!important}' });
        await p.waitForTimeout(300);
        const shot = `${shotDir}/${NAMES[k]}-${vp.width}-${name}.png`;
        const buf = await (await p.$$('.homepage > div'))[k].screenshot({ path: shot, animations: 'disabled' });
        const lum = await p.evaluate(async (s) => {
          const im = new Image();
          await new Promise((r) => { im.onload = r; im.src = 'data:image/png;base64,' + s; });
          const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0);
          const d = x.getImageData(0, 0, im.width, im.height).data;
          let t = 0; for (let i = 0; i < d.length; i += 4) t += (d[i] + d[i + 1] + d[i + 2]) / 3;
          return +(t / (d.length / 4)).toFixed(3);
        }, buf.toString('base64'));
        out.push({ vp: vp.width, variant: name, section: NAMES[k], glowCount: glows.length, glows, lum, shot });
        console.log(vp.width, name, NAMES[k], 'glows', glows.length, 'lum', lum, JSON.stringify(glows.map((g) => [g.w, g.filter, g.bgImage.slice(0, 30)])));
      }
      await ctx.close();
    }
  }
  await b.close();
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
})();
