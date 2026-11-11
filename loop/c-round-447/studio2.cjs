const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const out={};
 for (const vp of [{width:1440,height:900},{width:1280,height:720}]){
 const ctx=await b.newContext({viewport:vp}); const p=await ctx.newPage();
 await p.addInitScript(()=>{try{localStorage.setItem('cookie-consent','declined')}catch{}});
 await p.goto(process.argv[2]+'/studio-lab',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
 const opt=p.locator('[data-testid="arrangement-library-option-title"]').first();
 await opt.click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
 const pos=()=>p.locator('[data-testid="arrangement-position"]').innerText();
 const st=()=>p.locator('[data-testid="arrangement-playback-state"]').innerText();
 const r={before:await pos(),state0:await st(),clips:await p.locator('[data-testid="arrangement-clip"]').count()};
 await p.locator('[data-testid="arrangement-timeline-scroller"]').click({position:{x:5,y:5}}).catch(()=>{});
 await p.keyboard.press('Space'); await p.waitForTimeout(1500);
 r.playState=await st(); r.posPlay=await pos();
 await p.keyboard.press('Space'); await p.waitForTimeout(400);
 r.stopState=await st(); const a=await pos(); await p.waitForTimeout(600); r.stopHeld=(a===await pos());
 await p.screenshot({path:`shots/studio-${vp.width}.png`});
 out[vp.width]=r; await ctx.close();}
 console.log(JSON.stringify(out,null,1)); await b.close();})();
