import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [base,vp]=[process.argv[2],process.argv[3]];const [w,h]=vp.split('x').map(Number);
const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:w,height:h}});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const p=await ctx.newPage();await p.goto(base+'/studio-lab',{waitUntil:'load'});
await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:120000});
await p.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
const clip=p.locator('[data-clip-kind="video"]').first();await clip.waitFor();await p.waitForTimeout(1500);await p.evaluate(()=>document.activeElement?.blur?.());
for(let i=0;i<16;i++){const b=await clip.getByTitle(/ — drag to move$/).boundingBox();if((b?.width??0)>=480)break;await p.keyboard.press('=');await p.waitForTimeout(400);}
const t=await clip.getByTitle('Trim — left edge',{exact:true}).boundingBox();const f=await clip.getByTestId('arrangement-video-fade-in-handle').boundingBox();
const at=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?.getAttribute('title')||e?.getAttribute('data-testid')||e?.tagName},[t.x+t.width/2,t.y+t.height/2]);
console.log(JSON.stringify({vp,trim:t,fade:f,hit:at}));await br.close();
