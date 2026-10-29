// C248 §6 probe: clip-edge magnet with a hidden grid vs a visible grid. usage: node edge.cjs <base> <outJson>
const fs=require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const base=process.argv[2], out=process.argv[3]; const R={};
async function open(b,vp){const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));await p.goto(base+'/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await sleep(800);return {ctx,p,errors};}
const clips=(p)=>p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(c=>({id:c.dataset.clipId,start:c.dataset.clipStart,track:c.closest('[data-track-id]')?.dataset.trackId})));
const gc=(p)=>p.evaluate(()=>{const c=document.querySelector('[data-testid=arrangement-grid-control]');return [c.dataset.snap,c.dataset.snapPaused,c.dataset.gridDivision,c.dataset.gridLines,document.querySelector('[data-testid=arrangement-zoom-readout]').textContent]});
async function add(p,id){await p.locator(`[data-source-id="${id}"]`).first().click();await sleep(250);await p.locator('button',{hasText:/^Add/}).first().click();await sleep(900);await p.evaluate(()=>document.activeElement&&document.activeElement.blur());}
async function drag(p,id,dx){const b=await p.locator(`[data-clip-id="${id}"]`).boundingBox();const sx=b.x+Math.min(b.width/2,40),sy=b.y+6;await p.mouse.move(sx,sy);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(sx+dx*i/12,sy);await sleep(30);}await sleep(80);await p.mouse.up();await sleep(600);return Number(await p.locator(`[data-clip-id="${id}"]`).getAttribute('data-clip-start'));}
async function key(p,k){await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await p.keyboard.press(k);await sleep(400);}
(async()=>{const b=await chromium.launch();
for (const vp of [{width:1440,height:900},{width:1280,height:720}]) for (const mode of ['visible','hidden']) {
 const {ctx,p,errors}=await open(b,vp); const r={};
 await add(p,'demo-slow-rise'); await add(p,'demo-soft-impact'); r.clips0=await clips(p);
 const [a,c]=r.clips0; // a slow-rise, c soft-impact
 r.cAway=await drag(p,c.id,200); r.aMoved=await drag(p,a.id,13.3); // snap off at load: free moves
 if (mode==='hidden'){await p.getByTestId('arrangement-grid-division').selectOption('0.1');await sleep(300);await p.evaluate(()=>document.activeElement.blur());}
 await key(p,'g'); r.grid=await gc(p);
 const pps=parseFloat(r.grid[4]); const cStart=Number((await clips(p)).find(x=>x.id===c.id).start);
 const aEnd=r.aMoved+5; const target=aEnd+2/pps; r.target=+target.toFixed(4); r.aEnd=aEnd; r.cStart=cStart;
 r.after=await drag(p,c.id,(target-cStart)*pps);
 r.clips1=await clips(p); r.errors=errors; R[mode+'@'+vp.width]=r; await p.screenshot({path:out.replace('.json',`-${mode}-${vp.width}.png`)}); await ctx.close();
 console.log(mode,vp.width,JSON.stringify({cAway:r.cAway,aMoved:r.aMoved,grid:r.grid,aEnd:r.aEnd,cStart,target:r.target,after:r.after,clips:r.clips0.map(x=>x.track+':'+x.start)}));
}
fs.writeFileSync(out,JSON.stringify(R,null,1));await b.close();})();
