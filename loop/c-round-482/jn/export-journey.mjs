import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';import fs from 'node:fs';
const D=process.argv[2];const br=await chromium.launch();const res={};
for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h},acceptDownloads:true});const p=await c.newPage();
 await p.goto('http://127.0.0.1:5173/products/middle-east',{waitUntil:'networkidle'});
 await p.getByRole('link',{name:/Try it in the Studio/i}).first().click();await p.waitForURL(/studio-lab/);
 await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:60000});
 await p.waitForTimeout(800);await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
 await p.getByRole('button',{name:/^Export/}).first().click();await p.getByRole('dialog').waitFor();
 await p.waitForFunction(()=>{const b=[...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1);return b&&!b.disabled},null,{timeout:60000});
 await p.screenshot({path:`${D}/export-dialog-${w}.png`});
 const dl=p.waitForEvent('download',{timeout:120000});await p.getByRole('dialog').locator('div.justify-end > button').last().click();const d=await dl;
 const f=`${D}/tmp-${w}.wav`;await d.saveAs(f);const b=fs.readFileSync(f);
 const ch=b.readUInt16LE(22),sr=b.readUInt32LE(24),bits=b.readUInt16LE(34);let off=12,dO=0,dL=0;while(off<b.length-8){const id=b.toString('latin1',off,off+4),sz=b.readUInt32LE(off+4);if(id==='data'){dO=off+8;dL=sz;break}off+=8+sz+(sz&1)}
 const n=dL/3;let ss=0,pk=0,nan=0;for(let i=0;i<n;i++){const v=b.readIntLE(dO+i*3,3)/8388608;ss+=v*v;pk=Math.max(pk,Math.abs(v))}
 res[`${w}`]={name:d.suggestedFilename(),bytes:b.length,ch,sr,bits,dur:dL/(3*ch*sr),rms:Math.sqrt(ss/n),peak:pk};fs.rmSync(f);await c.close()}
console.log(JSON.stringify(res,null,1));await br.close();
