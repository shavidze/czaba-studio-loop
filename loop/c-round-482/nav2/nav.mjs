import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const BASE='http://127.0.0.1:5173';
const OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-482/nav2';
const out={runs:[]};
const b=await chromium.launch();
const seed=()=>{const d=new Date().toISOString().split('T')[0];localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:d,dismissed:true,submitted:true}));};
const st=(p)=>p.evaluate(()=>{const e=document.activeElement;return{path:location.pathname,y:Math.round(scrollY),marker:window.__probeMarker??null,active:e?e.tagName+' '+(e.getAttribute('href')||''):null,bodyTabindex:document.body.getAttribute('tabindex'),bodyFV:document.body.matches(':focus-visible')};});
const tab=async(p)=>{await p.keyboard.press('Tab');await p.waitForTimeout(400);return p.evaluate(()=>{const e=document.activeElement;return e.tagName+' '+(e.getAttribute('href')||'')});};
async function open(vp,from,seeded=true){const ctx=await b.newContext({viewport:vp});if(seeded)await ctx.addInitScript(seed);const p=await ctx.newPage();await p.goto(BASE+from,{waitUntil:'networkidle',timeout:90000});await p.waitForTimeout(3500);await p.evaluate(()=>{window.__probeMarker='alive'});return{ctx,p};}
async function bottom(p){for(let i=0;i<45;i++){await p.mouse.wheel(0,600);await p.waitForTimeout(40);}await p.waitForTimeout(1800);}
for(const vp of [{width:1440,height:900},{width:1280,height:720}]){
 const tag=vp.width;
 // C5/C7
 for(const [from,name,ev] of [['/faq','Support','mouse'],['/','Support','mouse'],['/faq','FAQ','mouse']]){
  const {ctx,p}=await open(vp,from);await bottom(p);
  console.error("run",tag,from,name);const link=p.locator("footer a",{hasText:name}).filter({hasText:new RegExp("^\\s*"+name+"\\s*$")}).first();
  const box=await link.boundingBox();
  const before=await st(p);
  await p.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await p.waitForTimeout(400);const t400=await st(p);await p.waitForTimeout(2600);const t3=await st(p);
  const first=await tab(p);
  await p.mouse.move(vp.width/2,vp.height/2);await p.mouse.wheel(0,200);await p.waitForTimeout(1800);const wheel=await st(p);
  out.runs.push({row:'C5/C6c/C7',vp:tag,from,name,before,t400,t3,firstTab:first,afterWheel:wheel.y});
  await p.screenshot({path:`${OUT}/c5-${tag}-${from.replace('/','root')}-${name}.png`});
  await ctx.close();}
 // C6 keyboard
 for(const [from,scope,txt] of [['/faq','footer','Support'],['/faq','main','Contact Us']]){
  const {ctx,p}=await open(vp,from);
  await p.locator(`${scope} a`,{hasText:txt}).first().focus();await p.keyboard.press('Enter');await p.waitForTimeout(2500);
  const s=await st(p);const first=await tab(p);
  out.runs.push({row:'C6',vp:tag,from,txt,after:s,firstTab:first});await ctx.close();}
 // C9
 for(const mode of ['ctrl-click','ctrl-enter','middle-click']){
  const {ctx,p}=await open(vp,'/faq');await bottom(p);
  const link=p.locator('footer a',{hasText:/^FAQ$/}).first();const box=await link.boundingBox();const pages=[];ctx.on('page',np=>pages.push(np));
  const before=await st(p);
  if(mode==='ctrl-click'){await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.keyboard.down('Control');await p.mouse.down();await p.mouse.up();await p.keyboard.up('Control');}
  if(mode==='middle-click')await p.mouse.click(box.x+box.width/2,box.y+box.height/2,{button:'middle'});
  if(mode==='ctrl-enter'){await link.focus();await p.keyboard.press('Control+Enter');}
  await p.waitForTimeout(2500);
  out.runs.push({row:'C9',vp:tag,mode,before,after:await st(p),newPages:pages.map(x=>x.url())});await ctx.close();}
}
// C8
const vp={width:1440,height:900};
const targets=['Store','Gift Cards','Hire Us','Support','FAQ','License','Privacy Policy','Terms of Service','Cookie Policy'];
for(const t of targets){const {ctx,p}=await open(vp,'/faq');const l=p.locator('footer a',{hasText:new RegExp('^'+t+'$')}).first();const href=await l.getAttribute('href');await l.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(600);await l.click();await p.waitForTimeout(2000);const s=await st(p);out.runs.push({row:'C8-footer',t,href,path:s.path,marker:s.marker,h1:await p.locator('h1').first().innerText().catch(()=>null),title:await p.title()});await ctx.close();}
for(const [from,sel,exp] of [['/privacy','main a[href="/cookies"]','/cookies'],['/terms','main a[href="/license"]','/license'],['/faq','main a[href="/hire-us"]','/hire-us']]){const {ctx,p}=await open(vp,from);const l=p.locator(sel).first();await l.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(600);await l.click();await p.waitForTimeout(2000);const s=await st(p);out.runs.push({row:'C8-page',from,exp,path:s.path,marker:s.marker,h1:await p.locator('h1').first().innerText().catch(()=>null)});if(exp==='/license')await p.screenshot({path:`${OUT}/c8-license-404.png`});await ctx.close();}
{const {ctx,p}=await open(vp,'/');const l=p.locator('a',{hasText:/view all/i}).first();const n=await p.locator('a',{hasText:/view all/i}).count();if(n){const href=await l.getAttribute('href');await l.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(800);await l.click();await p.waitForTimeout(2000);const s=await st(p);out.runs.push({row:'C8-viewall',href,path:s.path,marker:s.marker});}else out.runs.push({row:'C8-viewall',n:0});await ctx.close();}
// C10
for(const v of [{width:1440,height:900},{width:1280,height:720}]){const ctx=await b.newContext({viewport:v});await ctx.addInitScript(seed);const p=await ctx.newPage();await p.goto(BASE+'/',{waitUntil:'networkidle'});await p.waitForTimeout(3500);await p.evaluate(()=>{window.__probeMarker='alive'});
 const lk=p.locator('a[href="/privacy"]').filter({hasText:/privacy/i});const vis=await lk.count();
 const banner=await p.getByRole('button',{name:/accept/i}).count();
 if(vis){await p.screenshot({path:`${OUT}/c10-before-${v.width}.png`});const first=lk.first();await first.click();await p.waitForTimeout(2000);}
 const s=await st(p);out.runs.push({row:'C10',vp:v.width,links:vis,acceptBtns:banner,after:s,acceptAfter:await p.getByRole('button',{name:/accept/i}).count(),declineAfter:await p.getByRole('button',{name:/decline/i}).count(),ls:await p.evaluate(()=>Object.keys(localStorage).filter(k=>/consent|cookie/i.test(k)).map(k=>k+'='+localStorage[k]))});
 await p.screenshot({path:`${OUT}/c10-after-${v.width}.png`});await ctx.close();}
console.log(JSON.stringify(out,null,1));await b.close();
