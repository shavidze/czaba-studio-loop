const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-469/shots';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:600}});
for (const [sec,vp,y,h] of [['studio-showcase',1440,300,150],['studio-showcase',1440,1020,120],['product-section',1440,0,300],['product-section',1280,0,300]]){
 for (const v of ['head','tree']){
  await p.setContent(`<body style="margin:0;background:#000"><div style="width:${vp}px;height:${h*2}px;overflow:hidden"><img src="data:image/png;base64,${require('fs').readFileSync(D+'/look/'+sec+'-'+vp+'-'+v+'.png').toString('base64')}" style="width:${vp*2}px;margin-top:-${y*2}px;filter:brightness(10)"></div></body>`);
  await p.waitForTimeout(400);
  await p.screenshot({path:`${D}/amp10-${sec}-${vp}-y${y}-${v}.png`,clip:{x:0,y:0,width:vp,height:Math.min(h*2,600)}});
 }}
await b.close();})();
