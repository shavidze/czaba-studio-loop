import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base=process.env.BASE; const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const p=await ctx.newPage(); await p.goto(base+'/studio-lab',{waitUntil:'load',timeout:120000});
await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first().waitFor({timeout:90000}); await p.waitForTimeout(3000);
await p.getByRole('button',{name:'Keyboard shortcuts (?)'}).waitFor({timeout:90000}).catch(()=>{});
const f=p.getByRole('button',{name:'Keyboard shortcuts (?)'});
const res={};
for (const mode of ['press-Space','press-space-char','down-up-Space']) {
  await f.focus();
  if(mode==='press-Space') await p.keyboard.press('Space'); else if(mode==='press-space-char') await p.keyboard.press(' '); else {await p.keyboard.down('Space');await p.keyboard.up('Space');}
  await p.waitForTimeout(500);
  res[mode]=await p.evaluate(()=>({sheet:!!document.querySelector('button[aria-label="Close (Esc)"]'),focus:document.activeElement?.getAttribute('aria-label')}));
  if(res[mode].sheet){await p.keyboard.press('Escape');await p.waitForTimeout(400);}
}
console.log(process.env.TAG,JSON.stringify(res)); await b.close();
