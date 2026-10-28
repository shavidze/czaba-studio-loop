// C round 217: diagnostic re-run of the 1440 guard step with per-step timing.
const path=require('node:path');const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE='http://127.0.0.1:5173';
(async()=>{const b=await chromium.launch();const out=[];
for(let i=0;i<2;i++){const ctx=await b.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();const t0=Date.now();const log=(s,x)=>out.push({i,s,ms:Date.now()-t0,...x});
 const pe=[];page.on('pageerror',e=>pe.push(String(e)));
 for(const u of ['/studio-lab','/studio/middle-east']){
  try{const resp=await page.goto(BASE+u,{waitUntil:'load',timeout:60000});log('goto '+u,{status:resp&&resp.status()});
   await page.waitForTimeout(3000);
   const st=await page.evaluate(()=>({rs:document.readyState,body:!!document.body,path:location.pathname,signIn:document.body?document.body.innerText.includes('Sign in required'):null,badge:document.body?document.body.innerText.includes('Demo collection — no sign-in required'):null,audioSrc:document.querySelectorAll('audio[src]').length,ws:!!document.querySelector('[data-testid=arrangement-ruler]'),auth:localStorage.getItem('auth_user')}));log('state '+u,st);
   await page.screenshot({path:path.join(process.argv[2],`g-diag-${i}-${u.replace(/\W/g,'_')}.png`)});
  }catch(e){log('error '+u,{e:String(e).slice(0,200)});}}
 const api=`${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
 const n=await ctx.request.get(api,{failOnStatusCode:false});const f=await ctx.request.get(api,{headers:{Authorization:'Bearer fake.c217.token'},failOnStatusCode:false});
 log('token',{noHdr:n.status(),noHdrBody:(await n.text()).slice(0,120),fake:f.status(),fakeBody:(await f.text()).slice(0,120),pe});
 await ctx.close();}
await b.close();console.log(JSON.stringify(out,null,1));require('fs').writeFileSync(path.join(process.argv[2],'..','g217-guard-1440-diag.json'),JSON.stringify(out,null,2));})();
