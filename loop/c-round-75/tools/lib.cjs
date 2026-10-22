const path=require('path'),fs=require('fs');
const {createRequire}=require('module');
const req=createRequire('/home/runner/czaba-project/store/package.json');
const {chromium}=req('playwright');
const OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-75';
const URL='http://127.0.0.1:5173/studio-lab';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function open(vp){const[w,h]=vp.split('x').map(Number);
 const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const context=await browser.newContext({viewport:{width:w,height:h},acceptDownloads:true});
 const page=await context.newPage();const con=[],reqs=[];
 page.on('console',m=>con.push(`[${m.type()}] ${m.text()}`));page.on('pageerror',e=>con.push('[pageerror] '+e.message));
 page.on('request',r=>reqs.push({url:r.url(),auth:r.headers().authorization||null}));
 await context.addInitScript(()=>{window.__src=[];const P=AudioContext.prototype;const o=P.createBufferSource;P.createBufferSource=function(){window.__src.push(performance.now());return o.apply(this,arguments)};});
 return {browser,context,page,con,reqs};}
async function fresh(page){await page.goto(URL,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await sleep(4000);}
module.exports={open,fresh,sleep,OUT,URL};
async function dropME(page){
 const item=page.locator('[data-testid=arrangement-library-option-title]',{hasText:'Middle East'}).first();
 const ib=await item.boundingBox();
 const lane=await page.evaluate(()=>{const l=[...document.querySelectorAll('[data-track-id]')].filter(e=>e.querySelector('[data-grid-seconds]')||true);return l.map(e=>({id:e.getAttribute('data-track-id'),r:e.getBoundingClientRect().toJSON(),t:e.textContent.slice(0,20)}))});
 return {ib,lane};
}
module.exports.dropME=dropME;
async function setupME(page,x=508){
 const x0=await dropME(page);const ib=x0.ib;
 await page.mouse.move(ib.x+30,ib.y+10);await page.mouse.down();
 await page.mouse.move(700,400,{steps:8});await page.mouse.move(x,405,{steps:8});await sleep(200);await page.mouse.up();await sleep(800);
 return page.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>e.getAttribute('data-clip-start')));
}
module.exports.setupME=setupME;
