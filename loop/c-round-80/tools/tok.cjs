const L=require('./lib.cjs');const fs=require('fs');
(async()=>{const s=await L.open('1440x900');const out={};
 const u='http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem1.wav';
 const c=await s.browser.newContext();
 const a=await c.request.get(u);out.anon={status:a.status(),body:(await a.text()).slice(0,120)};
 const b=await c.request.get(u,{headers:{Authorization:'Bearer fake.fake.fake'}});out.fakeBearer={status:b.status(),body:(await b.text()).slice(0,160)};
 await s.page.goto(L.URL,{waitUntil:'domcontentloaded'});out.inPage=await s.page.evaluate(async u=>{const r=await fetch(u);return{status:r.status,body:(await r.text()).slice(0,100)}},u);
 console.log(JSON.stringify(out,null,1));fs.writeFileSync(L.OUT+'/token-api.json',JSON.stringify(out,null,1));await s.browser.close();})();
