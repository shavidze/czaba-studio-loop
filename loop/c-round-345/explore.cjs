const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});const p=await ctx.newPage();
await p.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await p.waitForFunction(()=>/Demo collection ready/.test(document.body.innerText),null,{timeout:120000});
console.log(await p.evaluate(()=>[...document.querySelectorAll('button,[role=option],[role=treeitem]')].map(e=>(e.getAttribute('data-testid')||'')+'|'+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40)).slice(0,60).join('\n')));
await b.close();})();
