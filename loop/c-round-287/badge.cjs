// C287: badge text per home card article. usage: node badge.cjs <base>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(()=>localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().split('T')[0],dismissed:true,submitted:true})));
await p.goto(process.argv[2]+'/',{waitUntil:'load'});await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('article')].filter(a=>a.querySelector('a[href^="/products/"]')).map(a=>({h:a.querySelector('a[href^="/products/"]').getAttribute('href').slice(10),badges:[...a.querySelectorAll('*')].filter(e=>e.children.length===0&&/^(Pack|Complimentary|New|Premium)$/.test(e.textContent.trim())).map(e=>e.textContent.trim()),text:a.innerText.replace(/\s+/g,' ').slice(0,120)})))));await b.close();})();
