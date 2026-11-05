// Round-185 product playback sequence (warm /, product, 5 s, click Play preview, 3 s, full-page shot) vs c-round-186 185seq; classify changed px by the player track boxes.
const L=require('./lib.cjs');const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');
const VPS={1440:{width:1440,height:900},1280:{width:1280,height:720},375:{width:375,height:812}};
(async()=>{const b=await L.chromium.launch({headless:true,args:['--disable-lcd-text','--autoplay-policy=no-user-gesture-required']});const out={};
for(const W of ['1440','1280','375']){const ctx=await b.newContext({viewport:VPS[W],deviceScaleFactor:2});const p=await ctx.newPage();
 await p.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(3000);
 await p.goto(L.BASE+'/products/middle-east',{waitUntil:'load'});await L.sleep(5000);
 await p.getByRole('button',{name:'Play preview'}).first().click();await L.sleep(3000);
 const f=path.join(R,'shots/store-after',`${W}-product-middle-east-185seq.png`);await p.screenshot({path:f,fullPage:true});
 const boxes=await p.evaluate(()=>{const g=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y+scrollY,w:r.width,h:r.height};};return{prog:g('input[aria-label="Preview position"]'),vol:g('input[aria-label="Preview volume"]'),bar:g('.audio-player'),times:[...document.querySelectorAll('.audio-player .tabular-nums')].map(e=>e.textContent)};});await ctx.close();
 const A=decode(fs.readFileSync(f)),B=decode(fs.readFileSync(path.join(R,'../c-round-186/shots/store-after',`${W}-product-middle-east-185seq.png`)));
 if(A.w!==B.w||A.h!==B.h){out[W]={size:[A.w,A.h,B.w,B.h],boxes};continue;}
 const inB=(x,y,b,pad)=>b&&x>=b.x-pad&&x<=b.x+b.w+pad&&y>=b.y-pad&&y<=b.y+b.h+pad;
 let n=0;const cat={prog:0,vol:0,barOther:0,outside:0};const bb={};const add=(k,X,Y)=>{const q=bb[k]||(bb[k]=[1e9,1e9,-1,-1]);q[0]=Math.min(q[0],X);q[1]=Math.min(q[1],Y);q[2]=Math.max(q[2],X);q[3]=Math.max(q[3],Y);};
 for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const a=A.px(x,y),c=B.px(x,y);if(a[0]!==c[0]||a[1]!==c[1]||a[2]!==c[2]){n++;const X=x/2,Y=y/2;const k=inB(X,Y,boxes.prog,8)?'prog':inB(X,Y,boxes.vol,8)?'vol':inB(X,Y,boxes.bar,0)?'barOther':'outside';cat[k]++;add(k,X,Y);add('all',X,Y);}}
 out[W]={changed:n,cat,bboxCss:bb,boxes};}
await b.close();fs.writeFileSync(path.join(R,'out','prod187seq.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));})();
