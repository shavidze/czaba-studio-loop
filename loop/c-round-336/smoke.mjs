import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h},acceptDownloads:true}); const p=await ctx.newPage(); const r={};
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'});
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
  await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{r.readyTimeout=true});
  await p.waitForTimeout(800);
  await p.getByRole('button',{name:'All'}).first().click().catch(()=>{});
  await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Bass/}).first().click();
  await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  const lane=()=>p.evaluate(()=>document.querySelector('[data-clip-id]')?.closest('[data-track-id]')?.getAttribute('data-track-id'));
  r.laneAfterAdd=await lane();
  const play=p.getByRole('button',{name:/^Play/}).first();
  r.playing0=await p.locator('[data-playing]').first().getAttribute('data-playing');
  await play.click(); await p.waitForTimeout(1500);
  r.playing1=await p.locator('[data-playing]').first().getAttribute('data-playing');
  r.pos=(await p.getByTestId('arrangement-position').textContent()).trim();
  await p.getByRole('button',{name:/^Stop|^Pause/}).first().click(); await p.waitForTimeout(500);
  r.playing2=await p.locator('[data-playing]').first().getAttribute('data-playing');
  // drag by name bar one lane down
  const lanes=await p.evaluate(()=>[...document.querySelectorAll('[data-track-id]')].map(e=>{const q=e.getBoundingClientRect();return [e.getAttribute('data-track-id'),q.top,q.bottom]}).filter(x=>x[2]-x[1]>20));
  const order=['music','stems','sfx']; // audio lanes
  let start=r.laneAfterAdd, idx=order.indexOf(start); let target=idx<order.length-1?order[idx+1]:order[idx-1]; r.start=start; r.target=target;
  const tl=lanes.find(x=>x[0]===target);
  const bar=p.locator('[data-clip-id] [title$="drag to move"]').first(); const bb=await bar.boundingBox();
  await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await p.mouse.down();
  const ty=(tl[1]+tl[2])/2+ (bb.height/2 - 0);
  for(let i=1;i<=12;i++){await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2+(ty-(bb.y+bb.height/2))*i/12);await p.waitForTimeout(30)}
  await p.mouse.up(); await p.waitForTimeout(500);
  r.laneAfterMove=await lane();
  r.undoTitle=await p.locator('button[title^="Undo"]').first().getAttribute('title');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(500);
  r.laneAfterUndo=await lane();
  r.redoTitle=await p.locator('button[title^="Redo"]').first().getAttribute('title').catch(()=>null);
  await p.screenshot({path:`c-round-336/screens/smoke-${w}x${h}.png`});
  await p.getByRole('button',{name:/^Export/}).first().click(); await p.waitForTimeout(500);
  const [dl]=await Promise.all([p.waitForEvent('download',{timeout:120000}),p.getByRole('dialog').getByRole('button',{name:/Export WAV/}).click()]);
  const f=`c-round-336/export-${w}.wav`; await dl.saveAs(f); r.file=dl.suggestedFilename();
  const buf=readFileSync(f); r.bytes=buf.length; r.riff=buf.toString('ascii',0,4)+buf.toString('ascii',8,12);
  let o=12,fmt=null,data=null;
  while(o+8<=buf.length){const id=buf.toString('ascii',o,o+4),sz=buf.readUInt32LE(o+4); if(id==='fmt ')fmt={fmtTag:buf.readUInt16LE(o+8),ch:buf.readUInt16LE(o+10),sr:buf.readUInt32LE(o+12),bits:buf.readUInt16LE(o+22)}; if(id==='data'){data=[o+8,sz];break} o+=8+sz+(sz&1)}
  r.fmt=fmt; if(data&&fmt){const bps=fmt.bits/8;const n=Math.min(data[1],buf.length-data[0])/(bps*fmt.ch);r.frames=n;r.seconds=n/fmt.sr;
    let peak=0,nz=0,nan=0; const step=bps*fmt.ch;
    for(let i=0;i<n;i++){let v; const q=data[0]+i*step; if(fmt.bits===24){v=buf.readIntLE(q,3)/8388608}else if(fmt.bits===16){v=buf.readInt16LE(q)/32768}else if(fmt.bits===32&&fmt.fmtTag===3){v=buf.readFloatLE(q)}else v=buf.readInt32LE(q)/2147483648; if(!Number.isFinite(v))nan++; const a=Math.abs(v); if(a>peak)peak=a; if(a>1e-5)nz++}
    r.peak=peak;r.nonzeroFrames=nz;r.nonFinite=nan; r.dataBytesHeader=data[1]; r.headerOk = data[1]===buf.length-data[0]; }
  r.pageErrors=errs; res[w]=r; await ctx.close();
}
writeFileSync('c-round-336/smoke.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1)); await b.close();
