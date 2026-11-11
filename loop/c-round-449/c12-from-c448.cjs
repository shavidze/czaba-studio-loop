const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2], tag = process.argv[3]; const out = {};
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 for (const vp of [{width:1440,height:900},{width:1280,height:720}]){
  const ctx=await b.newContext({viewport:vp}); const p=await ctx.newPage();
  await p.addInitScript(()=>{try{localStorage.setItem('cookie-consent','declined')}catch{}});
  await p.goto(base+'/studio-lab',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
  await p.locator('[data-testid="arrangement-library-option-title"]').first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  const pos=()=>p.locator('[data-testid="arrangement-position"]').innerText();
  const st=()=>p.locator('[data-testid="arrangement-playback-state"]').innerText();
  const r={clips:await p.locator('[data-clip-id]').count(),state0:await st(),pos0:await pos()};
  await p.keyboard.press('Space'); await p.waitForTimeout(1500);
  r.playState=await st(); r.posPlay=await pos();
  await p.keyboard.press('Space'); await p.waitForTimeout(400);
  r.stopState=await st(); const a=await pos(); await p.waitForTimeout(600); r.stopHeld=(a===await pos());
  await p.screenshot({path:`shots/${tag}-studio-${vp.width}.png`});
  out['studio'+vp.width]=r; await ctx.close();
  // protected route
  const c2=await b.newContext({viewport:vp}); const q=await c2.newPage(); const media=[]; 
  q.on('request',rq=>{if(/\.(wav|mp3|m4a|ogg|mp4)(\?|$)/i.test(rq.url())||rq.resourceType()==='media')media.push(rq.url())});
  await q.goto(base+'/studio/middle-east',{waitUntil:'networkidle'}).catch(()=>{}); await q.waitForTimeout(2500);
  out['protected'+vp.width]={url:q.url(),audioSrc:await q.locator('audio[src]').count(),media:media.length,bodyLen:(await q.evaluate(()=>(document.body?document.body.innerText:'NO-BODY'))).length,text:(await q.evaluate(()=>(document.body?document.body.innerText:'NO-BODY'))).slice(0,120)};
  if(vp.width===1440) await q.screenshot({path:`shots/${tag}-protected.png`});
  await c2.close();
 }
 console.log(JSON.stringify(out,null,1)); await b.close();})();
