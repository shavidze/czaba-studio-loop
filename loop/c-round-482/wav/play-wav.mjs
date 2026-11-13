import { createRequire } from 'node:module';import fs from 'node:fs';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const D=process.argv[2];const B='http://127.0.0.1:5173';const br=await chromium.launch();const res={};
for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h},acceptDownloads:true});const p=await c.newPage();
 await p.goto(B+'/studio-lab',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
 await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
 await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');
 await p.waitForSelector('[data-clip-id]');
 const clk=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/^\d+:\d{2}\.\d+$/.test(x.textContent.trim()));return e&&e.textContent.trim()});
 const r={};r.c0=await clk();await p.keyboard.press('Space');await p.waitForTimeout(1500);r.c1=await clk();
 await p.keyboard.press('Space');await p.waitForTimeout(400);r.c2=await clk();await p.waitForTimeout(700);r.c3=await clk();
 await p.getByRole('button',{name:/^Export/}).first().click();await p.getByRole('dialog').waitFor();
 await p.waitForFunction(()=>{const b=[...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1);return b&&!b.disabled},null,{timeout:60000});
 const btn=p.getByRole('dialog').locator('div.justify-end > button').last();
 const dl=p.waitForEvent('download',{timeout:120000});await btn.click();const d=await dl;
 const f=`${D}/tmp-${w}.wav`;await d.saveAs(f);const b=fs.readFileSync(f);
 const fmt=b.readUInt16LE(20),ch=b.readUInt16LE(22),sr=b.readUInt32LE(24),bits=b.readUInt16LE(34);
 let off=12,dataOff=0,dataLen=0;while(off<b.length-8){const id=b.toString('latin1',off,off+4),sz=b.readUInt32LE(off+4);if(id==='data'){dataOff=off+8;dataLen=sz;break}off+=8+sz+(sz&1)}
 const bps=bits/8,n=Math.floor(dataLen/bps);let peak=0,bad=0,nz=0,sumsq=0;
 for(let i=0;i<n;i++){let v;const o=dataOff+i*bps;if(fmt===3&&bits===32)v=b.readFloatLE(o);else if(bits===16)v=b.readInt16LE(o)/32768;else if(bits===24)v=b.readIntLE(o,3)/8388608;else v=NaN;
  if(!Number.isFinite(v)||Math.abs(v)>1.0001)bad++;const a=Math.abs(v);if(a>peak)peak=a;if(a>1e-5)nz++;sumsq+=v*v}
 // check last 2s not truncated, first sample
 r.wav={bytes:b.length,riffSize:b.readUInt32LE(4)+8,fmt,ch,sr,bits,dataLen,frames:dataLen/(bps*ch),durSec:dataLen/(bps*ch*sr),peak,bad,nonzeroFrac:nz/n,rms:Math.sqrt(sumsq/n)};
 fs.rmSync(f);res[`${w}x${h}`]=r;await c.close()}
console.log(JSON.stringify(res,null,1));await br.close();
