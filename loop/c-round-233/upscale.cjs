const fs=require('node:fs');const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const files=process.argv.slice(2);
let html='<body style="margin:0;background:#333">';for(const f of files){html+=`<div style="color:#fff;font:12px sans-serif">${f}</div><img style="image-rendering:pixelated;width:${12*34}px" src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}">`;}
await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:'out2/ring-crops-x12.png',fullPage:true});await b.close();})();
