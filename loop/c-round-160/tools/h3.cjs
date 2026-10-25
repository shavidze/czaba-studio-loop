const X = require('./lib122.cjs'); const { L, sleep } = X;
const cl=async(p)=>(await L.clipsDom(p)).map(c=>({lane:c.lane,start:+c.start.toFixed(3),dur:c.wdur,sel:c.sel,id:c.id}));
const brief=(cs)=>cs.map(c=>`${c.lane}@${c.start}+${c.dur}${c.sel?'*':''}`).sort().join(' ');
const byLane=async(p,lane,i=0)=>(await L.clipsDom(p)).filter(c=>c.lane===lane).sort((a,b)=>a.start-b.start)[i];
async function hdr(p,id){const h=await p.locator(`[data-clip-id="${id}"] > div`).first().boundingBox(); return {x:h.x+Math.min(40,h.width/2),y:h.y+h.height/2};}
async function dragHeader(p,id,dt,{dyLane=null,mods=[],escape=false,steps=10}={}){const a=await hdr(p,id); const g=await L.geo(p); let y=a.y; if(dyLane){const lb=await p.locator(`[data-track-id=${dyLane}]`).first().boundingBox(); y=lb.y+lb.height*0.4;}
 await p.mouse.move(a.x,a.y); await p.mouse.down(); for(const m of mods) await p.keyboard.down(m); await p.mouse.move(a.x+dt*g.pps/2,(a.y+y)/2,{steps}); await p.mouse.move(a.x+dt*g.pps,y,{steps}); await sleep(150);
 if(escape){await p.keyboard.press('Escape'); await sleep(150);} await p.mouse.up(); for(const m of mods) await p.keyboard.up(m); await sleep(400); return L.status(p);}
async function dragEdge(p,id,side,dt){const b=await X.clipBox(p,id); const g=await L.geo(p); const x=side==='L'?b.x+3:b.x+b.width-3; const y=b.y+b.height*0.6; await p.mouse.move(x,y); await p.mouse.down(); await p.mouse.move(x+dt*g.pps/2,y,{steps:6}); await p.mouse.move(x+dt*g.pps,y,{steps:6}); await sleep(120); await p.mouse.up(); await sleep(400); return L.status(p);}
async function bodyClick(p,id,t){const y=await X.bodyY(p,id); const x=await X.tx(p,t); await p.mouse.click(x,y); await sleep(350);}
async function laneBgPoint(p,lane,t){const lb=await p.locator(`[data-track-id=${lane}]`).first().boundingBox(); return {x:await X.tx(p,t),y:lb.y+lb.height*0.5};}
const range=(p)=>p.evaluate(()=>{const s=document.querySelector('[data-testid=arrangement-detail-start]'),e=document.querySelector('[data-testid=arrangement-detail-end]'); const rs=[...document.querySelectorAll('[data-testid=arrangement-lane-range]')].map(r=>r.closest('[data-track-id]').dataset.trackId); return {start:s&&s.value,end:e&&e.value,lanes:rs};});
module.exports={X,L,sleep,cl,brief,byLane,hdr,dragHeader,dragEdge,bodyClick,laneBgPoint,range};
