const { createRequire } = require('module');
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('playwright');
const OUT = process.argv[2];
async function txt(p){for(let i=0;i<10;i++){try{return await p.evaluate(() => document.body.innerText);}catch(e){await p.waitForTimeout(1000);}}return '';}
(async () => {
  const b = await chromium.launch({ headless: true });
  const res = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    for (const path of ['/studio/1', '/account/downloads']) {
      await p.goto('http://127.0.0.1:5173' + path, { waitUntil: 'networkidle' }).catch(() => {});
      await p.waitForTimeout(1500);
      const t = await txt(p);
      const links = await p.evaluate(() => [...document.querySelectorAll('a[href*="download"],a[download]')].map((a) => a.getAttribute('href')));
      res[`${W}${path}`] = { signIn: /sign in required/i.test(t), url: p.url(), links, snippet: t.replace(/\s+/g, ' ').slice(0, 160) };
    }
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(3000);
    const t = await txt(p);
    res[`${W}/studio-lab`] = { demo: /demo|collection|arrangement/i.test(t), clips: await p.locator('[data-testid*="clip"]').count(), signIn: /sign in required/i.test(t), errs, snippet: t.replace(/\s+/g, ' ').slice(0, 200) };
    await p.screenshot({ path: `${OUT}/studio-lab-${W}.png` });
    await ctx.close();
  }
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
