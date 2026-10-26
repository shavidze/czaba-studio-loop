// Home A/B: scrolled full page with the Gift Card img vs the same page with that img hidden (visibility:hidden). Diff bbox must lie inside the card; hero masked.
const L=require('./lib.cjs');const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');
const VPS={1440:{width:1440,height:900},1280:{width:1280,height:720},375:{width:375,height:812}};
(async()=>{const b=await L.chromium.launch({headless:true,args:['--disable-lcd-text']});const out={};
for(const W of ['1440','1280','375']){const ctx=await b.newContext({viewport:VPS[W],deviceScaleFactor:2,reducedMotion:'reduce'});const p=await ctx.newPage();
 await p.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(2000);
 await p.evaluate(async()=>{const s=ms=>new Promise(r=>setTimeout(r,ms));for(let y=0;y<document.documentElement.scrollHeight;y+=300){scrollTo(0,y);await s(200);}await s(1500);});
 await p.waitForFunction(()=>{const i=[...document.images].find(x=>x.alt==='Gift Card');return i.complete&&i.naturalWidth>0;},null,{timeout:20000});
 await p.evaluate(()=>{scrollTo(0,0);const st=document.createElement('style');st.textContent='*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}';document.head.appendChild(st);document.querySelectorAll('video').forEach(v=>v.pause());});await p.mouse.move(1,1);await L.sleep(1500);
 const geo=await p.evaluate(()=>{const c=[...document.images].find(x=>x.alt==='Gift Card').closest('.group').getBoundingClientRect();const h=document.querySelector('section').getBoundingClientRect();return{card:{x:c.x,y:c.y+scrollY,w:c.width,h:c.height},hero:{y:h.y+scrollY,h:h.height}};});
 const fa=path.join(R,'shots/store-after',`${W}-home-ab-with.png`),fb=path.join(R,'shots/store-after',`${W}-home-ab-hidden.png`);
 await p.screenshot({path:fa,fullPage:true});const fc=fa.replace('-with','-control');await L.sleep(300);await p.screenshot({path:fc,fullPage:true});
 await p.evaluate(()=>{[...document.images].find(x=>x.alt==='Gift Card').style.visibility='hidden';});await L.sleep(300);
 await p.screenshot({path:fb,fullPage:true});await ctx.close();
 const A=decode(fs.readFileSync(fa)),B=decode(fs.readFileSync(fb)),C=decode(fs.readFileSync(fa.replace('-with','-control')));let ctl=0;let n=0,outside=0,inHero=0;const bb=[1e9,1e9,-1,-1],ob=[1e9,1e9,-1,-1];const c=geo.card;
 for(let y=0;y<Math.min(A.h,B.h);y++)for(let x=0;x<A.w;x++){const a=A.px(x,y),q=B.px(x,y);{const k=C.px(x,y);if(a[0]!==k[0]||a[1]!==k[1]||a[2]!==k[2])ctl++;}if(a[0]!==q[0]||a[1]!==q[1]||a[2]!==q[2]){n++;const X=x/2,Y=y/2;if(Y>=geo.hero.y&&Y<geo.hero.y+geo.hero.h){inHero++;continue;}const inC=X>=c.x-1&&X<=c.x+c.w+1&&Y>=c.y-1&&Y<=c.y+c.h+1;if(inC){bb[0]=Math.min(bb[0],X);bb[1]=Math.min(bb[1],Y);bb[2]=Math.max(bb[2],X);bb[3]=Math.max(bb[3],Y);}else{outside++;ob[0]=Math.min(ob[0],X);ob[1]=Math.min(ob[1],Y);ob[2]=Math.max(ob[2],X);ob[3]=Math.max(ob[3],Y);}}}
 out[W]={controlChanged:ctl,size:[A.w,A.h,B.w,B.h],changed:n,inHero,outsideCardAndHero:outside,outsideBbox:outside?ob:null,inCardBboxCss:bb,cardCss:c};}
await b.close();fs.writeFileSync(path.join(R,'out','home-ab-frozen.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out));})();
