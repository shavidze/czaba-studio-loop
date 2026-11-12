const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();for(const port of [3468,3469])for(const w of [1440,1280,375]){const p=await b.newPage({viewport:{width:w,height:800}});await p.goto('http://127.0.0.1:'+port+'/',{waitUntil:'load'});await p.waitForTimeout(1500);
console.log(port,w,JSON.stringify(await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight}))));await p.close();}await b.close();})();
