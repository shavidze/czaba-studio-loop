const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs');
async function cap(b,base,vp,tag){const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(()=>{try{localStorage.setItem('cookie-consent','declined');localStorage.setItem('leadMagnetDismissed','1')}catch{}});
 const p=await ctx.newPage();await p.goto(base+'/',{waitUntil:'networkidle'}).catch(()=>{});await p.waitForTimeout(6000);
 const buf=await p.screenshot({fullPage:true,timeout:120000});fs.writeFileSync(`shots/${tag}.png`,buf);
 let sc=null;const m=p.locator('text=Export Mix').first();
 if(await m.count()){await m.scrollIntoViewIfNeeded();await p.waitForTimeout(700);
  const box=await m.evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,color:getComputedStyle(e).color}});
  const shot=await p.screenshot({timeout:60000});fs.writeFileSync(`shots/${tag}-showcase.png`,shot);sc={box,shot:shot.toString('base64')};}
 await ctx.close();return{buf,sc};}
(async()=>{const b=await chromium.launch();const out={};const pg=await b.newPage();
 const diff=(A,B)=>pg.evaluate(async([A,B])=>{const L=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});const a=await L(A),b=await L(B);
  if(a.width!==b.width||a.height!==b.height)return{size:[a.width,a.height,b.width,b.height]};
  const g=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data};
  const d1=g(a),d2=g(b);let minY=1e9,maxY=-1,n=0;for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++){const o=(y*a.width+x)*4;if(Math.abs(d1[o]-d2[o])+Math.abs(d1[o+1]-d2[o+1])+Math.abs(d1[o+2]-d2[o+2])>60){n++;if(y<minY)minY=y;if(y>maxY)maxY=y}}
  return{h:a.height,px:n,minY,maxY}},[A.toString('base64'),B.toString('base64')]);
 for(const vp of [{width:1440,height:900},{width:1280,height:720}]){const k=vp.width;
  const h1=await cap(b,'http://127.0.0.1:5178',vp,`head1-${k}`);const h2=await cap(b,'http://127.0.0.1:5178',vp,`head2-${k}`);
  out['hh'+k]=await diff(h1.buf,h2.buf);
  out['showcase'+k]=h1.sc?{box:h1.sc.box}:null;
  console.log(k,JSON.stringify(out['hh'+k]),JSON.stringify(out['showcase'+k]));
  const t1=await cap(b,'http://127.0.0.1:5173',vp,`tree1-${k}`);
  out['ht'+k]=await diff(h1.buf,t1.buf);console.log(k,'ht',JSON.stringify(out['ht'+k]));
 }
 fs.writeFileSync('c10.json',JSON.stringify(out,null,1));await b.close();})();
