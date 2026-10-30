// Repeat round-185's product-page sequence (warm /, load, 5 s, click Play preview, 3 s, full-page shot) and diff against store-before.
const L=require('./lib.cjs');const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');
const VPS={1440:{width:1440,height:900},1280:{width:1280,height:720},375:{width:375,height:812}};
(async()=>{const b=await L.chromium.launch({headless:true,args:['--disable-lcd-text','--autoplay-policy=no-user-gesture-required']});const out={};
for(const W of ['1440','1280','375']){const ctx=await b.newContext({viewport:VPS[W],deviceScaleFactor:2});const p=await ctx.newPage();
 await p.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(3000);
 await p.goto(L.BASE+'/products/middle-east',{waitUntil:'load'});await L.sleep(5000);
 await p.getByRole('button',{name:'Play preview'}).first().click();await L.sleep(3000);
 const f=path.join(R,'shots/store-after',`${W}-product-middle-east-185seq.png`);await p.screenshot({path:f,fullPage:true});await ctx.close();
 const A=decode(fs.readFileSync(f)),B=decode(fs.readFileSync(path.join(R,'../c-round-185/shots/store-before',`${W}-product-middle-east.png`)));
 if(A.w!==B.w||A.h!==B.h){out[W]={size:[A.w,A.h,B.w,B.h]};continue;}
 let n=0;const cells={};for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const a=A.px(x,y),c=B.px(x,y);if(a[0]!==c[0]||a[1]!==c[1]||a[2]!==c[2]){n++;const k=`${Math.floor(x/40)*20},${Math.floor(y/40)*20}`;cells[k]=(cells[k]||0)+1;}}
 out[W]={changed:n,cells20css:Object.entries(cells).sort((a,b)=>b[1]-a[1]).slice(0,25)};}
await b.close();fs.writeFileSync(path.join(R,'out','prod185seq.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out));})();
