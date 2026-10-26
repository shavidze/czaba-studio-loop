// C round 185 — STORE-HOME/LIST/PRODUCT/CART + PX-NET/REG-HYD. node c185-store.cjs <1440|1280|375> <attempt>
const L=require('./lib.cjs');const fs=require('fs');const path=require('path');
const VPS={1440:{width:1440,height:900},1280:{width:1280,height:720},375:{width:375,height:812}};
const W=process.argv[2],ATT=process.argv[3]||'1';const ROOT=path.join(__dirname,'..');const SH=path.join(ROOT,'shots','store-before');fs.mkdirSync(SH,{recursive:true});
const TITLES=['Middle East','Harbour Lights','Copper Horizon','Night Train','Quiet Valley','Door Slams','Archived Rain','Pulse Loop Kit'];
const ACTIVE=TITLES.filter(t=>t!=='Archived Rain');
const ALLOWED_HOSTS=new Set(['127.0.0.1:5173','localhost:5173','127.0.0.1:5199','localhost:5199','[::1]:5199']);
const init=()=>{window.__media=[];const P=HTMLMediaElement.prototype;const op=P.play;P.play=function(){if(!window.__media.includes(this))window.__media.push(this);return op.apply(this,arguments);};
 window.__perf={lcp:0,cls:0};try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__perf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__perf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});}catch(e){}};
const has=(txt,t)=>txt.toLowerCase().includes(t.toLowerCase());
(async()=>{
 const b=await L.chromium.launch({headless:true,args:['--disable-lcd-text','--autoplay-policy=no-user-gesture-required']});
 const res={W,ATT,utc:new Date().toISOString(),pages:{},perf:[]};
 const ctx=await b.newContext({viewport:VPS[W],deviceScaleFactor:2});await ctx.addInitScript(init);
 const page=await ctx.newPage();
 const ev={console:[],pageerror:[],hosts:{},foreign:[],auth:[],preflight:[],api:[]};
 page.on('console',m=>ev.console.push({page:cur,type:m.type(),text:m.text().slice(0,400)}));
 page.on('pageerror',e=>ev.pageerror.push({page:cur,text:String(e).slice(0,300)}));
 page.on('request',q=>{const u=q.url();if(/^(data|blob):/.test(u))return;let h;try{h=new URL(u).host}catch{h=u}ev.hosts[h]=(ev.hosts[h]||0)+1;if(!ALLOWED_HOSTS.has(h))ev.foreign.push({page:cur,u:u.slice(0,200)});if(q.headers().authorization)ev.auth.push(u);});
 page.on('response',r=>{const u=r.url();if(/:5199\//.test(u))ev.api.push({page:cur,m:r.request().method(),u:u.slice(0,160),s:r.status(),acao:r.headers()['access-control-allow-origin']||null,setCookie:!!r.headers()['set-cookie']});});
 page.on('requestfailed',q=>{if(/:5199\//.test(q.url()))ev.api.push({page:cur,m:q.method(),u:q.url().slice(0,160),failed:(q.failure()||{}).errorText});});
 const cdp=await ctx.newCDPSession(page);await cdp.send('Network.enable');
 const pre={};cdp.on('Network.requestWillBeSent',e=>{if(e.type==='Preflight'||e.request.method==='OPTIONS'){pre[e.requestId]={page:cur,u:e.request.url,m:e.request.method,type:e.type};}});
 cdp.on('Network.responseReceived',e=>{if(pre[e.requestId]){pre[e.requestId].s=e.response.status;pre[e.requestId].acao=e.response.headers['Access-Control-Allow-Origin']||e.response.headers['access-control-allow-origin']||null;}});
 cdp.on('Network.loadingFailed',e=>{if(pre[e.requestId])pre[e.requestId].failed=e.errorText+' '+(e.corsErrorStatus?JSON.stringify(e.corsErrorStatus):'');});
 let cur='warm';
 const visit=async(name,url,opt={})=>{cur=name;const r={url};const resp=await page.goto(L.BASE+url,{waitUntil:'load',timeout:90000});r.status=resp.status();const html=await resp.text();
  r.ssr=Object.fromEntries(TITLES.map(t=>[t,has(html,t)]));r.ssr503=/503|Unable to load|temporarily unavailable/i.test(html.replace(/<script[\s\S]*?<\/script>/g,'')) ;r.ssrHomeErr=/Error loading homepage products/i.test(html);
  await L.sleep(opt.wait||4000);const tc=await page.evaluate(()=>document.body.textContent);r.dom=Object.fromEntries(TITLES.map(t=>[t,has(tc,t)]));r.domActive=ACTIVE.filter(t=>has(tc,t)).length;
  r.h1=await page.evaluate(()=>[...document.querySelectorAll('h1')].map(h=>h.textContent.trim()).slice(0,3));
  r.cookies=(await ctx.cookies()).length;r.authUser=await page.evaluate(()=>localStorage.getItem('auth_user'));
  if(opt.extra)Object.assign(r,await opt.extra());
  const f=path.join(SH,`${W}-${name}.png`);await page.screenshot({path:f,fullPage:true});r.shot=path.relative(ROOT,f);res.pages[name]=r;};
 // warm load (dev server optimise); recorded but not evidence
 cur='warm';await page.goto(L.BASE+'/',{waitUntil:'load',timeout:90000});await L.sleep(3000);
 await visit('home','/');
 await visit('store','/store');
 await visit('store-search','/store?search=harbour');
 await visit('store-sfx','/store?category=SFX');
 const play=async()=>{const before=await page.evaluate(()=>window.__media.length);const btn=page.getByRole('button',{name:'Play preview'}).first();const vis=await btn.count();if(!vis)return{play:'no Play preview button'};await btn.click();const t0=Date.now();await L.sleep(3000);
  const m=await page.evaluate(()=>window.__media.map(a=>({tag:a.tagName,src:a.currentSrc||a.src,ct:a.currentTime,paused:a.paused,inDom:document.contains(a),rs:a.readyState,muted:a.muted,vol:a.volume})));return{play:{clickMsToSample:Date.now()-t0,mediaBefore:before,media:m,domAudios:await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>a.currentSrc||a.src))}};};
 await visit('product-middle-east','/products/middle-east',{wait:5000,extra:async()=>({variants:await page.evaluate(()=>[...document.querySelectorAll('button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).filter(t=>/^(PREMIUM)?\s*(Standard|Premium)/i.test(t))),...(await play())})});
 await visit('product-harbour-lights','/products/harbour-lights',{wait:5000,extra:async()=>({variants:await page.evaluate(()=>[...document.querySelectorAll('button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).filter(t=>/^(PREMIUM)?\s*(Standard|Premium)/i.test(t))),...(await play())})});
 await visit('product-missing','/products/does-not-exist',{extra:async()=>({text:(await page.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,200)})});
 await visit('product-archived','/products/archived-rain',{extra:async()=>({text:(await page.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,200)})});
 await visit('cart','/cart',{extra:async()=>({text:(await page.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,400)})});
 await page.close();
 // LCP/CLS baseline: 3 fresh loads of /
 for(let i=0;i<3;i++){const pg=await ctx.newPage();cur='perf'+i;await pg.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(4000);await pg.mouse.move(1,1);res.perf.push(await pg.evaluate(()=>window.__perf));await pg.close();}
 const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[1];};res.perfMedian={lcp:med(res.perf.map(p=>p.lcp)),cls:med(res.perf.map(p=>p.cls))};
 res.preflight=Object.values(pre);res.ev=ev;await b.close();
 fs.mkdirSync(path.join(ROOT,'out'),{recursive:true});fs.writeFileSync(path.join(ROOT,'out',`store-${W}-${ATT}.json`),JSON.stringify(res,null,1));
 const sum={W,pages:Object.fromEntries(Object.entries(res.pages).map(([k,v])=>[k,{s:v.status,ssrActive:ACTIVE.filter(t=>v.ssr[t]).length,ssrArchived:v.ssr['Archived Rain'],dom:Object.keys(v.dom).filter(t=>v.dom[t]),h1:v.h1,cookies:v.cookies,auth:v.authUser,variants:v.variants,play:v.play,text:v.text}])),perf:res.perfMedian,hosts:ev.hosts,foreign:ev.foreign.length,auth:ev.auth.length,pageerror:ev.pageerror,errors:ev.console.filter(c=>c.type==='error'||c.type==='warning'||/hydrat/i.test(c.text)).map(c=>c.page+': '+c.type+' '+c.text.slice(0,180)),preflight:res.preflight,api:ev.api.filter(a=>/cart/.test(a.u))};
 console.log(JSON.stringify(sum,null,1));})();
