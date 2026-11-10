import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-437';const B='http://127.0.0.1:5173';
const br=await chromium.launch();const out={};
for (const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
 await p.goto(B+'/studio-lab',{waitUntil:'networkidle'});
 const r={};
 r.authUser=await p.evaluate(()=>localStorage.getItem('auth_user'));
 r.title=await p.title();
 r.clockBefore=null;
 const play=p.getByRole('button',{name:/^play/i}).first();
 const clk=async()=>p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/^\d+:\d{2}(\.\d+)?$/.test(x.textContent.trim()));return e?e.textContent.trim():null});
 r.clk0=await clk();
 await p.keyboard.press('Space').catch(()=>{});
 await p.waitForTimeout(1500);r.clk1=await clk();
 await p.keyboard.press('Space');await p.waitForTimeout(500);r.clk2=await clk();await p.waitForTimeout(600);r.clk3=await clk();
 await p.screenshot({path:`${D}/play-${w}.png`});
 const pg=await c.newPage();await pg.goto(B+'/studio/middle-east',{waitUntil:'networkidle'});
 r.gateText=/sign in required/i.test(await pg.locator('body').innerText());
 r.audioSrc=await pg.locator('audio[src]').count();
 r.token=(await pg.request.get(B+'/api/studio-token?product=middle-east&file=stem.mp3')).status();
 out[`${w}x${h}`]=r;await c.close();
}
console.log(JSON.stringify(out,null,1));await br.close();
