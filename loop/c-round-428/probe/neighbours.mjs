import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const OUT = process.env.OUT; const base='http://127.0.0.1:5173';
const counters = () => { window.__c={renders:0,sheetOpens:0,dialogOpens:0};
  const r=OfflineAudioContext.prototype.startRendering; OfflineAudioContext.prototype.startRendering=function(){window.__c.renders++;return r.call(this);};
  new MutationObserver((ms)=>{for(const m of ms)for(const n of m.addedNodes)if(n instanceof Element){
    if(n.matches?.('button[aria-label="Close (Esc)"]')||n.querySelector?.('button[aria-label="Close (Esc)"]'))window.__c.sheetOpens++;
    if(n.querySelector?.('#arrangement-export-title'))window.__c.dialogOpens++;}}).observe(document,{childList:true,subtree:true});};
const res={};const errors=[];
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
await ctx.addInitScript(counters);
const p=await ctx.newPage(); let downloads=0; p.on('download',()=>downloads++); p.on('pageerror',e=>errors.push(String(e)));
await p.goto(base+'/studio-lab',{waitUntil:'load',timeout:120000});
await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first().waitFor({timeout:60000});
await p.waitForTimeout(3500);
const st=()=>p.evaluate(()=>({c:{...window.__c},sheet:!!document.querySelector('button[aria-label="Close (Esc)"]'),dlg:!!document.querySelector('#arrangement-export-title'),clips:document.querySelectorAll('[data-clip-id]').length,focus:document.activeElement?.getAttribute('aria-label')??document.activeElement?.textContent?.trim().slice(0,30)??document.activeElement?.tagName}));
const footer=p.getByRole('button',{name:'Keyboard shortcuts (?)'});
// 1
await p.locator('body').click({position:{x:5,y:5}}); await footer.focus(); await p.keyboard.press('Escape');
await p.keyboard.press('?'); await p.waitForTimeout(400); const a1=await st();
await p.keyboard.press('Escape'); await p.waitForTimeout(400); const b1=await st();
res.r1={opened:a1,closed:b1,ok:a1.sheet&&!b1.sheet&&a1.c.sheetOpens===1&&/Keyboard shortcuts/.test(b1.focus??'')};
// 2
await footer.click(); await p.waitForTimeout(400); const a2=await st();
await p.locator('button[aria-label="Close (Esc)"]').click(); await p.waitForTimeout(400); const b2=await st();
res.r2={opened:a2,closed:b2,ok:a2.sheet&&!b2.sheet&&b2.c.sheetOpens===2};
// 3
await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
await p.getByRole('button',{name:'Export',exact:true}).click(); await p.waitForTimeout(600);
const dlg=p.locator('[role="dialog"]').filter({has:p.locator('#arrangement-export-title')});
await dlg.locator('[data-testid="arrangement-export-footer"] button').last().click(); await p.waitForTimeout(5000);
const a3=await st(); a3.downloads=downloads;
await dlg.getByRole('button',{name:'Done'}).click(); await p.waitForTimeout(500); const b3=await st();
res.r3={afterExport:a3,afterDone:b3,ok:a3.c.renders===1&&downloads===1&&!b3.dlg};
// 4
const before=(await st()).c.sheetOpens; await footer.focus(); await p.keyboard.press('Space'); await p.waitForTimeout(400); const a4=await st();
res.r4={before,after:a4,ok:a4.sheet&&a4.c.sheetOpens===before+1};
res.pageErrors=errors; fs.writeFileSync(OUT+'/neighbours.json',JSON.stringify(res,null,1)); console.log(JSON.stringify({r1:res.r1.ok,r2:res.r2.ok,r3:res.r3.ok,r4:res.r4.ok,errors}));
await b.close();
