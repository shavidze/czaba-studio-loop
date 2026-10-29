const base=process.argv[2];const fs=require('node:fs');const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const out=[];
for(const vp of [{width:1440,height:900},{width:1280,height:720}]) for(const action of ['escape','division','width']){
 const ctx=await b.newContext({viewport:vp});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/studio-lab',{waitUntil:'load'});await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:120000});await sleep(600);
 await page.evaluate(()=>{window.__f=[];document.addEventListener('focusin',e=>window.__f.push('in:'+(e.target.getAttribute?.('data-testid')||e.target.tagName+':'+(e.target.textContent||'').trim().slice(0,12))),true);document.addEventListener('focusout',e=>window.__f.push('out:'+(e.target.getAttribute?.('data-testid')||e.target.tagName)),true);document.body.focus();});
 let tabs=-1;for(let i=1;i<=120;i++){await page.keyboard.press('Tab');if(await page.evaluate(()=>document.activeElement?.getAttribute('data-testid'))==='arrangement-snap-toggle'){tabs=i;break;}}
 await page.evaluate(()=>{window.__f=[];});
 const pt=await page.evaluate(()=>{for(const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')){const r=body.getBoundingClientRect();for(const fx of [0.9,0.75,0.6,0.45,0.3]){const x=r.left+r.width*fx,y=r.top+r.height/2;if(x<=0||x>=innerWidth-20||y<=0||y>=innerHeight-10)continue;if(document.elementFromPoint(x,y)===body)return{x,y};}}return null;});
 await page.mouse.move(pt.x,pt.y);await page.mouse.down({button:'right'});await sleep(100);
 const afterDown=await page.evaluate(()=>document.activeElement?.getAttribute('data-testid')||document.activeElement?.tagName);
 await page.mouse.up({button:'right'});await sleep(350);
 const menu=await page.getByTestId('arrangement-grid-menu').count();
 const inMenu=await page.evaluate(()=>document.activeElement?.textContent?.trim());
 if(action==='escape')await page.keyboard.press('Escape');
 if(action==='division')await page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio',{name:'0.5 s',exact:true}).click();
 if(action==='width'){const w=page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio',{name:'Narrow',exact:true});if(await w.count())await w.click();else{out.push({vp:vp.width,action,skipped:'no width item'});await ctx.close();continue;}}
 await sleep(400);
 const final=await page.evaluate(()=>({testid:document.activeElement?.getAttribute('data-testid'),tag:document.activeElement?.tagName}));
 out.push({vp:vp.width,action,tabs,afterRightDown:afterDown,menu,inMenu,final,events:await page.evaluate(()=>window.__f),errors:errors.length});
 await ctx.close();}
await b.close();fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));for(const o of out)console.log(JSON.stringify(o).slice(0,500));})();
