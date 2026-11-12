const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const out=[];
for (const [n,u] of [['head','http://127.0.0.1:3471'],['tree','http://127.0.0.1:3472']]) for (const w of [1440,1280,375]){
 const c=await b.newContext({viewport:{width:w,height:w==375?800:720}});await c.addInitScript(()=>localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:99,lastShown:Date.now(),dismissed:true,submitted:true})));
 const p=await c.newPage();await p.goto(u+'/',{waitUntil:'load'});await p.waitForTimeout(3000);
 out.push({n,w,...await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,bsw:document.body.scrollWidth}))});await c.close();}
console.log(JSON.stringify(out));require('fs').writeFileSync('data/overflow.json',JSON.stringify(out,null,1));await b.close();})();
