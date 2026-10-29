// C round 242: count brass ring pixels on the Snap toggle after Escape vs after a mouse choice.
const fs=require('node:fs');const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const out=[];
for(const vp of [{width:1440,height:900},{width:1280,height:720}]) for(const action of ['escape','division']){
 const ctx=await b.newContext({viewport:vp});const page=await ctx.newPage();
 await page.goto('http://127.0.0.1:5173/studio-lab');await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:120000});await sleep(600);
 await page.evaluate(()=>document.body.focus());
 for(let i=0;i<120;i++){await page.keyboard.press('Tab');if(await page.evaluate(()=>document.activeElement?.getAttribute('data-testid'))==='arrangement-snap-toggle')break;}
 const pt=await page.evaluate(()=>{for(const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')){const r=body.getBoundingClientRect();for(const fx of [0.9,0.75,0.6,0.45,0.3]){const x=r.left+r.width*fx,y=r.top+r.height/2;if(x<=0||x>=innerWidth-20||y<=0||y>=innerHeight-10)continue;if(document.elementFromPoint(x,y)===body)return{x,y};}}return null;});
 await page.mouse.click(pt.x,pt.y,{button:'right'});await sleep(350);
 if(action==='escape')await page.keyboard.press('Escape');else await page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio',{name:'0.5 s',exact:true}).click();
 await sleep(400);await page.mouse.move(5,vp.height-5);await sleep(200);
 const bb=await page.getByTestId('arrangement-snap-toggle').boundingBox();
 const clip={x:Math.floor(bb.x),y:Math.floor(bb.y),width:Math.ceil(bb.width),height:Math.ceil(bb.height)};
 const png=await page.screenshot({clip});fs.writeFileSync(`out/ring-${action}-${vp.width}.png`,png);
 const stats=await page.evaluate(async(b64)=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let brass=0,n=0;const W=c.width,H=c.height;let edge=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;const r=d[i],gg=d[i+1],bl=d[i+2];n++;const isB=r>130&&r-bl>45&&gg>95&&r>gg;if(isB){brass++;if(x<=3||y<=3||x>=W-4||y>=H-4)edge++;}}return{W,H,brass,edge,n};},png.toString('base64'));
 out.push({vp:vp.width,action,clip,...stats,active:await page.evaluate(()=>document.activeElement?.getAttribute('data-testid'))});await ctx.close();}
await b.close();fs.writeFileSync('out/ring-pixels.json',JSON.stringify(out,null,1));for(const o of out)console.log(JSON.stringify(o));})();
