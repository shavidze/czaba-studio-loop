// C288: where does "Price unavailable" appear after selecting Premium on bad-premium-track. usage: node occ.cjs <base>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(()=>localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().split('T')[0],dismissed:true,submitted:true})));
await p.goto(process.argv[2]+'/products/bad-premium-track',{waitUntil:'load'});await p.getByText('Total Price',{exact:true}).first().waitFor();await p.waitForTimeout(1200);
await p.locator('button[aria-pressed]').filter({hasText:'Premium'}).first().click();await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.includes('Price unavailable')).map(e=>{const r=e.getBoundingClientRect();let a=e,path=[];for(let i=0;i<5&&a;i++){path.push(a.tagName+(a.getAttribute('aria-pressed')?'[pressed]':'')+(a.id?'#'+a.id:''));a=a.parentElement;}return {text:e.textContent.trim().slice(0,80),vis:r.width>0&&r.height>0,box:[r.x|0,r.y|0,r.width|0,r.height|0],path:path.join('<')}}))));
await b.close();})();
