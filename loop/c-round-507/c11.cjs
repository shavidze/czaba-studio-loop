const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const res = {};
  const errs = [];
  for (const [w,h] of [[1440,900],[1280,720]]) {
    const ctx = await b.newContext({ viewport:{width:w,height:h} });
    const p = await ctx.newPage();
    p.on('pageerror', e=>errs.push(String(e)));
    for (const path of ['/studio/1','/account/downloads']) {
      await p.goto('http://127.0.0.1:5173'+path,{waitUntil:'domcontentloaded'});
      await p.waitForLoadState('load').catch(()=>{}); await p.waitForTimeout(4000);
      const txt = await p.evaluate(()=>document.body?document.body.innerText:'');
      const dl = await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>/download|\.wav|\.zip|r2/i.test(a.href+a.textContent)).map(a=>a.href).slice(0,5));
      res[`${path}@${w}`] = { url:p.url(), signIn:/sign in required/i.test(txt), dl };
    }
    await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
    await p.waitForTimeout(6000);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    const st = await p.evaluate(()=>({title:document.title, h1:(document.body?document.body.innerText:'').slice(0,300), clips:document.querySelectorAll('[data-clip-id],[role="option"]').length}));
    res[`studio-lab@${w}`]=st;
    await p.screenshot({path:`${out}/studio-lab-${w}.png`});
    await ctx.close();
  }
  res.errs = errs.slice(0,10);
  require('fs').writeFileSync(`${out}/c11.json`, JSON.stringify(res,null,1));
  await b.close();
})();
