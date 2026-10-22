const L=require('./lib.cjs');const fs=require('fs');
(async()=>{const {createRequire}=require('module');const req=createRequire('/home/runner/czaba-project/store/package.json');const{chromium}=req('playwright');
 const b=await chromium.launch();const c=await b.newContext();const u='http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem1.wav';const o={};
 const r1=await c.request.get(u);o.anon={status:r1.status(),body:(await r1.text()).slice(0,160)};
 const r2=await c.request.get(u,{headers:{Authorization:'Bearer fake.fake.fake'}});o.fakeBearer={status:r2.status(),body:(await r2.text()).slice(0,160)};
 console.log(JSON.stringify(o));fs.writeFileSync(L.OUT+'/token-api.json',JSON.stringify(o,null,1));await b.close();})();
