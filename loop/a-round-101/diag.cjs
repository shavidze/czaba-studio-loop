const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  const errs=[]; p.on('pageerror', e=>errs.push(String(e).slice(0,300))); p.on('console', m=>{ if(m.type()==='error') errs.push('c:'+m.text().slice(0,200)); });
  await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForTimeout(15000);
  console.log(await p.evaluate(()=>({opts:[...document.querySelectorAll('[role=option]')].map(o=>o.getAttribute('data-source-id')).slice(0,10), title:document.title, body:document.body.innerText.slice(0,400)})));
  console.log(errs.slice(0,10)); await p.screenshot({path:__dirname+'/diag.png'}); await b.close();
})();
