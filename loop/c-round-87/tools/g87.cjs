const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';
const FORB=/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/;
(async()=>{const out={vp};
 const s=await L.open(vp);const p=s.page;
 // C73-4a header link entry
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});await L.sleep(5000);
 const links=await p.evaluate(()=>[...document.querySelectorAll('header a[href*="studio-lab"], a[href*="studio-lab"]')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim().slice(0,40),inHeader:!!a.closest('header'),vis:!!(a.offsetWidth||a.offsetHeight)})));
 out.links=links;
 const hl=p.locator('header a[href*="studio-lab"]').filter({visible:true}).first();
 if(await hl.count()){await hl.click();await p.waitForURL(/studio-lab/,{timeout:30000}).catch(()=>{});await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000}).catch(()=>{});await L.sleep(1500);
  out.headerEntry={url:p.url(),workspace:await p.locator('[data-testid=arrangement-grid-control]').count(),badge:await p.evaluate(()=>/დემო კოლექცია/.test(document.body.innerText))};
  await p.screenshot({path:`${L.OUT}/shots/header-entry-${vp}.png`});} else out.headerEntry='no visible header link';
 // anonymous token API
 out.tokenAnon=await p.evaluate(async()=>{const r=await fetch('/api/studio-token',{method:'GET'});return{status:r.status,body:(await r.text()).slice(0,120)}}).catch(e=>String(e));
 out.tokenAnonPost=await p.evaluate(async()=>{const r=await fetch('/api/studio-token',{method:'POST'});return{status:r.status,body:(await r.text()).slice(0,120)}}).catch(e=>String(e));
 // studio/middle-east anon
 await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded'});await L.sleep(6000);
 const t=await p.evaluate(()=>document.body.innerText);
 out.protected={url:p.url(),signIn:/sign in required/i.test(t),signInAny:/sign in/i.test(t),workspace:await p.locator('[data-testid=arrangement-grid-control]').count(),excerpt:t.slice(0,160)};
 await p.screenshot({path:`${L.OUT}/shots/studio-middle-east-anon-${vp}.png`});
 // direct lab
 await p.goto(L.URL,{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await L.sleep(1500);
 out.labDirect={badge:await p.evaluate(()=>/დემო კოლექცია/.test(document.body.innerText))};
 out.ls=await p.evaluate(()=>Object.keys(localStorage));
 await p.screenshot({path:`${L.OUT}/shots/lab-anon-${vp}.png`});
 const pageReqs=s.reqs.filter(r=>FORB.test(r.url)&&!/\/api\/studio-token/.test(r.url));
 out.net={forbiddenNonProbe:pageReqs.map(r=>r.url),tokenRequests:s.reqs.filter(r=>/\/api\/studio-token/.test(r.url)).length,auth:s.reqs.filter(r=>r.auth).length,total:s.reqs.length};
 await s.context.close();
 // fake bearer in a separate fresh context (via request API, not the page)
 const c2=await s.browser.newContext();const r2=await c2.request.get('http://127.0.0.1:5173/api/studio-token',{headers:{Authorization:'Bearer fake.fake.fake'}}).catch(e=>null);
 out.fakeBearer=r2?{status:r2.status(),body:(await r2.text()).slice(0,160)}:'error';
 const r3=await c2.request.post('http://127.0.0.1:5173/api/studio-token',{headers:{Authorization:'Bearer fake.fake.fake'}}).catch(e=>null);
 out.fakeBearerPost=r3?{status:r3.status(),body:(await r3.text()).slice(0,160)}:'error';
 console.log(JSON.stringify(out,null,1));fs.writeFileSync(`${L.OUT}/g87-${vp}.json`,JSON.stringify(out,null,1));
 await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
