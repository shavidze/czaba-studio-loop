import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const D=process.argv[2];const b=await chromium.launch();const out={};
const scan=()=>{const res=[];for(const e of document.querySelectorAll('*')){const s=getComputedStyle(e).boxShadow;if(!s||s==='none')continue;
 for(const l of s.split(/,(?![^(]*\))/)){const m=/(rgba?\([^)]*\)|color\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]+)/i.exec(l);const nums=l.replace(m?m[0]:'','').replace('inset','').trim().split(/\s+/).map(parseFloat);
  if(nums[0]===0&&nums[1]===0&&nums[2]>0)res.push({tag:e.tagName,cls:String(e.className).slice(0,60),text:(e.textContent||'').trim().slice(0,20),shadow:l.trim()})}}return res};
const lm=()=>{try{localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:99,lastShown:Date.now(),dismissed:true,submitted:true}))}catch{}};
for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await b.newContext({viewport:{width:w,height:h}});await c.addInitScript(lm);const p=await c.newPage();const r={};
 for(const [tag,path] of [['store','/store'],['product','/products/middle-east']]){
  await p.goto('http://127.0.0.1:5173'+path,{waitUntil:'load'});await p.waitForTimeout(3500);
  const cands=await p.evaluate(()=>[...document.querySelectorAll('button,a')].filter(e=>{const cs=getComputedStyle(e);const bg=cs.backgroundColor;return /201, 164, 106|217, 184, 127/.test(bg)||/bg-buy|bg-brand/.test(String(e.className))||/rgb\(14, 13, 12\)/.test(cs.color)&&bg!=='rgba(0, 0, 0, 0)'}).map(e=>({t:(e.textContent||'').trim().slice(0,30),cls:String(e.className).slice(0,70),rest:getComputedStyle(e).boxShadow,bg:getComputedStyle(e).backgroundColor,vis:!!(e.offsetWidth&&e.offsetHeight)})));
  const hovers=[];
  const n=await p.locator('button,a').count();
  for(const t of cands.filter(x=>x.vis).slice(0,6)){const loc=p.locator('button,a').filter({hasText:t.t}).first();await loc.scrollIntoViewIfNeeded().catch(()=>{});await loc.hover().catch(()=>{});await p.waitForTimeout(500);hovers.push({t:t.t,rest:t.rest,bg:t.bg,hover:await loc.evaluate(e=>getComputedStyle(e).boxShadow+' | '+getComputedStyle(e).backgroundColor).catch(()=>null)})}
  await p.mouse.move(2,2);
  const hdrs=await p.evaluate(()=>[...document.querySelectorAll('header,[class*=sticky],[class*=fixed]')].map(e=>({tag:e.tagName,cls:String(e.className).slice(0,60),shadow:getComputedStyle(e).boxShadow})));
  r[tag]={cands:cands.length,hovers,hdrs,zeroOffsetScan:await p.evaluate(scan)};
  await p.screenshot({path:`${D}/shots/${tag}-${w}.png`});}
 out[`${w}x${h}`]=r;await c.close()}
console.log(JSON.stringify(out,null,1));await b.close();
