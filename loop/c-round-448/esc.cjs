const { chromium } = require(require.resolve('@playwright/test',{paths:['/home/runner/czaba-project/store']}));
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.setContent('<body style="background:#fff">'+fs.readFileSync('email-esc.html','utf8')+'</body>');
const r=await p.evaluate(()=>({img:document.querySelectorAll('img').length,text:document.body.innerText}));
console.log(JSON.stringify(r));await p.screenshot({path:'esc-shot.png'});await b.close();})();
