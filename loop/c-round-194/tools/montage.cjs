// node montage.cjs <out.png> <scale> <img...>  — renders crops pixelated with labels via Chromium
const L=require('./lib.cjs');const fs=require('fs');const path=require('path');
const [out,scale,...imgs]=process.argv.slice(2);
(async()=>{const b=await L.chromium.launch();const p=await b.newPage({viewport:{width:1600,height:600}});
const html='<body style="background:#444;margin:4px;font:11px monospace;color:#fff">'+imgs.map(f=>`<div style="display:inline-block;margin:3px;vertical-align:top"><div>${path.basename(f)}</div><img style="image-rendering:pixelated;zoom:${scale}" src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"></div>`).join('')+'</body>';
await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:out,fullPage:true});await b.close();})();
