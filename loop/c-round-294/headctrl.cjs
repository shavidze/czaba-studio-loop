const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const cmp=async(p,a,c)=>p.evaluate(async([a,c])=>{const load=(s)=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});const px=(img)=>{const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const x=cv.getContext('2d');x.drawImage(img,0,0);return x.getImageData(0,0,img.width,img.height).data};const [ia,ib]=await Promise.all([load(a),load(c)]);if(ia.width!==ib.width||ia.height!==ib.height)return -1;const da=px(ia),db=px(ib);let d=0,mx=0;for(let i=0;i<da.length;i+=4){const q=Math.max(Math.abs(da[i]-db[i]),Math.abs(da[i+1]-db[i+1]),Math.abs(da[i+2]-db[i+2]));if(q){d++;mx=Math.max(mx,q)}}return {d,maxDelta:mx}},[a.toString('base64'),c.toString('base64')]);
async function shot(b,base,w,h,file){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();const hyd=[];p.on('console',m=>{if(/hydrat|did not match/i.test(m.text()))hyd.push(m.text().slice(0,200))});await p.goto(base+'/studio-lab',{waitUntil:'networkidle'});await p.getByText('Demo collection ready',{exact:false}).first().waitFor({timeout:30000});await sleep(1500);await p.mouse.move(0,h-1);const buf=await p.screenshot({path:file});await c.close();return {buf,hyd};}
(async()=>{const b=await chromium.launch();const cp=await b.newPage();const out={};
{const c=await b.newContext();const p=await c.newPage();await p.goto('http://127.0.0.1:3294/studio-lab');await sleep(6000);await c.close();}
for(const [w,h] of [[1280,720],[1440,900]]){const s=`${w}x${h}`;
const head=await shot(b,'http://127.0.0.1:3294',w,h,`c-round-294/shots/headctrl-3294-${s}.png`);
const cur=await shot(b,'http://127.0.0.1:5173',w,h,`c-round-294/shots/desk-attempt3-${s}.png`);
const base=fs.readFileSync(`b-round-291/probe/desk-5173-${s}.png`);
out[s]={current_vs_head_sameMachine:await cmp(cp,cur.buf,head.buf),head_vs_baseline:await cmp(cp,head.buf,base),current_vs_baseline:await cmp(cp,cur.buf,base),hydrationHead:head.hyd,hydrationCur:cur.hyd};}
fs.writeFileSync('c-round-294/desk-headctrl.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));await b.close();})();
