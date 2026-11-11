const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 for (const vp of [{width:1440,height:900},{width:1280,height:720}]){
 const ctx=await b.newContext({viewport:vp}); const p=await ctx.newPage();
 await p.addInitScript(()=>{try{localStorage.setItem('cookie-consent','declined')}catch{}});
 await p.goto(process.argv[2]+'/studio-lab',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
 const clipsBefore=await p.locator('[data-clip-id],[data-testid^="arrangement-clip"]').count();
 const items=p.locator('[role="treeitem"],[data-testid^="library-item"],[role="option"]');
 console.log(vp.width,'items',await items.count());
 const dump=await p.evaluate(()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter((v,i,a)=>a.indexOf(v)===i).slice(0,60));
 console.log(dump.join(','));
 await ctx.close();}
 await b.close();})();
