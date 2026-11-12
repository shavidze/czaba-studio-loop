const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const O='/home/runner/czaba-project/tmp/studio-real-loop/c-round-472';
(async()=>{const b=await chromium.launch();const out={};
for(const [n,base] of Object.entries({head:'http://127.0.0.1:3101',tree:'http://127.0.0.1:3102'})){out[n]={};
 for(const [w,h] of [[1440,900],[1280,720]]){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
  await p.goto(base+'/',{waitUntil:'networkidle'}).catch(()=>{});await p.waitForTimeout(2000);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=400){await p.evaluate(v=>window.scrollTo(0,v),y);await p.waitForTimeout(250);}
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{const t=document.body.innerText;const boxes=[...document.querySelectorAll('h1,h2,h3,h4,span,a,button,p,div')].filter(e=>e.children.length===0&&e.textContent.trim()&&e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible').map(e=>e.textContent.trim().slice(0,30));
   return {hits:['2,500+','Netflix Original Score','Limited','FREE','Offer','Happy Customers','Free Samples'].map(s=>[s,t.includes(s)]),clipped:boxes,dialog:document.querySelectorAll('[role=dialog]').length}});
  await p.evaluate(()=>window.scrollTo(0,0));
  // leadmagnet: wait for auto open
  await p.waitForTimeout(8000);
  const dlg=await p.evaluate(()=>{const d=document.querySelector('[role=dialog]');return d?{text:d.innerText.slice(0,60).replace(/\n/g,' | '),fam:getComputedStyle(d).fontFamily.slice(0,20),focusIn:d.contains(document.activeElement)}:null});
  if(dlg){await p.keyboard.press('Tab');out[n][w+'focusAfterTab']=await p.evaluate(()=>{const a=document.activeElement;const cs=getComputedStyle(a);return {tag:a.tagName,outline:cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor,shadow:cs.boxShadow.slice(0,60)}});}
  await p.screenshot({path:`${O}/shots/${n}-leadmagnet-${w}.png`});
  out[n][w]={...r,dlg};await c.close();}}
require('fs').writeFileSync(O+'/keep.json',JSON.stringify(out,null,1));await b.close();})();
