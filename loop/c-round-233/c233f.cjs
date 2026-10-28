// C round 233: focus rescue rows. usage: node c233f.cjs <outDir>
const path=require('node:path');const fs=require('node:fs');
const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE='http://127.0.0.1:5173';const outDir=path.resolve(process.argv[2]);fs.mkdirSync(outDir,{recursive:true});
const VIDEO=process.env.VIDEO?path.resolve(process.env.VIDEO):path.resolve(__dirname,'media','c233-synthetic-long-name-for-caption-test-clip.webm');
const R={started:new Date().toISOString()};const save=()=>fs.writeFileSync(path.join(outDir,'c233f.json'),JSON.stringify(R,null,1));
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));let analyzer;
const STATUS='Overview hidden. Ctrl+Alt+O shows it again.';
async function open(ctx){const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${BASE}/studio-lab`,{waitUntil:'load'});
 await page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Add');return b&&!b.disabled;},undefined,{timeout:120000});
 await sleep(900);
 await page.evaluate(()=>{window.__ko=[];window.addEventListener('keydown',e=>{if(e.code==='KeyO')window.__ko.push({dp:e.defaultPrevented,rep:e.repeat});});});
 return {page,errors};}
const act=(page)=>page.evaluate(()=>{const a=document.activeElement;if(!a)return null;return a.getAttribute('data-testid')||(a.getAttribute('aria-label')?'aria:'+a.getAttribute('aria-label'):a.tagName);});
const st=(page)=>page.evaluate(()=>{const t=id=>document.querySelector(`[data-testid="${id}"]`);const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return [+r.x.toFixed(1),+r.y.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)];};
 const sc=t('arrangement-timeline-scroller');
 return {ov:!!t('arrangement-overview'),ovBox:box(t('arrangement-overview')),slot:box(t('arrangement-overview-hidden-slot')),status:t('arrangement-status')?.textContent??null,key:localStorage.getItem('czaba-studio-overview-hidden'),
 scroll:sc?[sc.scrollLeft,sc.scrollTop]:null,winY:window.scrollY,ko:window.__ko.slice(-1)[0]??null,
 placeholder:!!t('arrangement-video-placeholder'),floating:!!document.querySelector('[data-testid="arrangement-video-floating"]'),clips:document.querySelectorAll('[data-clip-id]').length};});
const dockList=(page)=>page.evaluate(()=>{const ov=document.querySelector('[data-testid="arrangement-overview"]');const dock=document.querySelector('[data-testid="arrangement-video-dock"]');if(!ov||!dock)return null;
 return [...dock.querySelectorAll('button')].filter(b=>ov.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING).map(b=>(b.getAttribute('data-testid')||b.getAttribute('aria-label')||'?')+(b.disabled?':disabled':'')+(b.tabIndex<0?':neg':''));});
const ring=(page)=>page.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e);const r=e.getBoundingClientRect();
 const chrome=[...document.querySelectorAll('[data-testid="arrangement-video-dock"]')].map(x=>x.getBoundingClientRect());
 return {fv:e.matches(':focus-visible'),outline:`${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,offset:s.outlineOffset,box:[r.x,r.y,r.width,r.height].map(v=>+v.toFixed(1)),inViewport:r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth,
 topEl:(()=>{const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h?(h===e||e.contains(h)):false;})()};});
async function bandBrass(page,tid,tag){const b=await page.getByTestId(tid).boundingBox();const pad=5;const clip={x:b.x-pad,y:b.y-pad,width:b.width+2*pad,height:b.height+2*pad};
 const buf=await page.screenshot({clip});fs.writeFileSync(path.join(outDir,`${tag}.png`),buf);
 const data='data:image/png;base64,'+buf.toString('base64');
 return analyzer.evaluate(async([src,pad])=>{const img=new Image();img.src=src;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height).data;
 let band=0,inner=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;const brass=d[i]>120&&d[i]-d[i+2]>50;if(!brass)continue;const inside=x>=pad&&x<c.width-pad&&y>=pad&&y<c.height-pad;if(inside)inner++;else band++;}
 return {band,inner,w:c.width,h:c.height};},[data,pad]);}
const blur=async(page)=>{await page.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());await page.mouse.click(3,3);await sleep(150);};
const focusOv=async(page)=>{await page.getByTestId('arrangement-library-separator').focus();await page.keyboard.press('Tab');await sleep(150);return act(page);};
const chord=async(page,m='Control')=>{await page.keyboard.press(`${m}+Alt+KeyO`);await sleep(350);};
async function step(r,name,fn){try{r[name]=await fn();}catch(e){r[name]={error:String(e).slice(0,600)};}save();}

async function hideRow(page,key,tag,expectTid){ // focused overview -> hide
 const o={};o.dockAfterOverview=await dockList(page);o.focusedBefore=await focusOv(page);o.before=await st(page);
 await chord(page);o.after=await st(page);o.active=await act(page);o.ring=await ring(page);
 o.ok=o.active===expectTid;
 if(o.active&&o.active===expectTid){o.pixFocused=await bandBrass(page,expectTid,`${tag}-focused-${key}`);}
 await page.screenshot({path:path.join(outDir,`${tag}-full-${key}.png`)});
 return o;}

async function run(browser,vp){const key=`${vp.width}x${vp.height}`;const r=(R[key]={});
 const ctx=await browser.newContext({viewport:vp});const {page,errors}=await open(ctx);r.authUser=await page.evaluate(()=>localStorage.getItem('auth_user'));
 // DOCKED S0
 await step(r,'docked',async()=>{const o=await hideRow(page,key,'docked','arrangement-video-expand');
  await page.keyboard.press('Tab');await sleep(150);o.nextTab=await act(page);
  // blurred reference pixels of expand
  await blur(page);o.pixBlurred=await bandBrass(page,'arrangement-video-expand',`docked-blurred-${key}`);
  // show from expand: focus stays
  await page.getByTestId('arrangement-video-expand').focus();await sleep(100);o.activeBeforeShow=await act(page);
  await chord(page);o.shown=await st(page);o.activeAfterShow=await act(page);await sleep(600);o.activeAfterShowLater=await act(page);
  // fresh hide then Shift+Tab
  await focusOv(page);await chord(page);o.active2=await act(page);await page.keyboard.press('Shift+Tab');await sleep(150);o.shiftTab=await act(page);
  await blur(page);await chord(page);
  // Meta variant
  await focusOv(page);await chord(page,'Meta');o.meta={st:await st(page),active:await act(page),ring:await ring(page)};
  await page.keyboard.press('Tab');await sleep(150);o.meta.nextTab=await act(page);
  await blur(page);await chord(page,'Meta');o.meta.shownAgain=(await st(page)).ov;
  return o;});
 // OTHER
 await step(r,'other',async()=>{const o={};
  await blur(page);o.bodyBefore=await act(page);await chord(page);o.bodyHide={a:await act(page),ov:(await st(page)).ov};await chord(page);o.bodyShow={a:await act(page),ov:(await st(page)).ov};
  const play=page.getByRole('button',{name:'Play',exact:true}).first();await play.focus();await sleep(100);o.playBefore=await act(page);
  await chord(page);o.playHide={a:await act(page),ov:(await st(page)).ov};await chord(page);o.playShow={a:await act(page),ov:(await st(page)).ov};
  await page.getByTestId('arrangement-library-separator').focus();await sleep(100);o.sepBefore=await act(page);
  await chord(page);o.sepHide={a:await act(page),ov:(await st(page)).ov};await chord(page);o.sepShow={a:await act(page),ov:(await st(page)).ov};
  // search field: nothing
  await page.getByTestId('arrangement-library-search').click();await sleep(100);await chord(page);o.search={...(await st(page)),a:await act(page)};
  await blur(page);return o;});
 // NEIGHBOURS: slot bbox, space/arrows on overview, held key
 await step(r,'toggle',async()=>{const o={};await blur(page);const s0=await st(page);o.ovBox=s0.ovBox;await chord(page);const s1=await st(page);o.slot=s1.slot;o.hiddenStatus=s1.status;
  o.slotDiff=s0.ovBox&&s1.slot?s0.ovBox.map((v,i)=>+(s1.slot[i]-v).toFixed(1)):null;await chord(page);o.reshown=(await st(page)).ov;
  // held key
  await blur(page);let flips=0;let prev=(await st(page)).ov;await page.keyboard.down('Control');await page.keyboard.down('Alt');
  for(let i=0;i<10;i++){await page.keyboard.down('KeyO');await sleep(40);const n=(await st(page)).ov;if(n!==prev)flips++;prev=n;}
  await page.keyboard.up('KeyO');await page.keyboard.up('Alt');await page.keyboard.up('Control');await sleep(300);o.held={flips,final:(await st(page)).ov};
  if(!o.held.final){await blur(page);await chord(page);}
  // focused overview arrows + Space
  await focusOv(page);const now=()=>page.evaluate(()=>document.querySelector('[data-testid="arrangement-overview"]')?.getAttribute('aria-valuenow'));
  o.n0=await now();await page.keyboard.press('ArrowRight');await sleep(250);o.n1=await now();await page.keyboard.press('ArrowLeft');await sleep(250);o.n2=await now();
  await page.keyboard.press('Space');await sleep(900);o.playing=await page.evaluate(()=>!!document.querySelector('button[aria-label="Pause"]')||[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Pause'));
  o.posPlaying=await page.evaluate(()=>document.querySelector('[data-testid="arrangement-position"]')?.textContent);
  await page.keyboard.press('Space');await sleep(400);await blur(page);return o;});
 // FLOAT S0
 await step(r,'float',async()=>{await blur(page);await page.getByTestId('arrangement-video-expand').click();await sleep(600);
  const o=await hideRow(page,key,'float','arrangement-video-placeholder-return');
  await page.keyboard.press('Tab');await sleep(150);o.nextTab=await act(page);
  await page.getByTestId('arrangement-video-placeholder-return').focus();await sleep(100);
  await page.keyboard.press('Escape');await sleep(700);o.afterEscape={...(await st(page)),active:await act(page)};
  await blur(page);if(!(await st(page)).ov)await chord(page);o.restored=(await st(page)).ov;return o;});
 // S1 (a clip) docked
 await step(r,'s1',async()=>{await blur(page);await page.getByRole('button',{name:'Add',exact:true}).click();await page.locator('[data-clip-kind="audio"]').first().waitFor({timeout:20000});await sleep(800);
  const o=await hideRow(page,key,'s1-docked','arrangement-video-expand');await page.keyboard.press('Tab');await sleep(150);o.nextTab=await act(page);
  await blur(page);await chord(page);o.restored=(await st(page)).ov;
  await focusOv(page);const pos=()=>page.evaluate(()=>document.querySelector('[data-testid="arrangement-position"]')?.textContent);
  o.space={p0:await pos()};await page.keyboard.press('Space');await sleep(1200);o.space.p1=await pos();o.space.activeWhilePlaying=await act(page);
  o.space.pauseBtn=await page.getByRole('button',{name:'Pause',exact:true}).count();
  await page.keyboard.press('Space');await sleep(500);o.space.p2=await pos();await sleep(500);o.space.p3=await pos();
  await blur(page);return o;});
 // video loaded
 await step(r,'video',async()=>{await blur(page);const fc=[];page.on('filechooser',c=>fc.push(c));await sleep(500);
  await page.getByRole('button',{name:'Your own video'}).first().click();for(let i=0;i<30&&!fc.length;i++)await sleep(100);
  if(!fc.length)return {error:'no filechooser'};await fc[0].setFiles(VIDEO);await sleep(3000);
  const o={};o.caption=await page.evaluate(()=>document.querySelector('[data-testid="arrangement-video-caption"]')?.textContent);
  o.docked=await hideRow(page,key,'video-docked','arrangement-video-expand');await page.keyboard.press('Tab');await sleep(150);o.docked.nextTab=await act(page);
  await blur(page);await chord(page);
  await page.getByTestId('arrangement-video-expand').click();await sleep(700);
  o.float=await hideRow(page,key,'video-float','arrangement-video-placeholder-return');
  await page.keyboard.press('Escape');await sleep(700);o.float.afterEscape={...(await st(page)),active:await act(page)};
  await blur(page);if(!(await st(page)).ov)await chord(page);return o;});
 r.pageErrors=errors;await ctx.close();
 // reload persistence
 await step(r,'persist',async()=>{const c2=await browser.newContext({viewport:vp});const p=await open(c2);await focusOv(p.page);await chord(p.page);const a=await act(p.page);
  await p.page.reload({waitUntil:'load'});await p.page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Add');return b&&!b.disabled;},undefined,{timeout:120000});await sleep(1200);
  const s=await p.page.evaluate(()=>({ov:!!document.querySelector('[data-testid="arrangement-overview"]'),slot:!!document.querySelector('[data-testid="arrangement-overview-hidden-slot"]'),key:localStorage.getItem('czaba-studio-overview-hidden')}));
  await c2.close();return {activeAfterHide:a,afterReload:s,errors:p.errors};});
}
(async()=>{const browser=await chromium.launch();R.chromium=browser.version();analyzer=await (await browser.newContext()).newPage();
 for(const vp of [{width:1440,height:900},{width:1280,height:720}]){try{await run(browser,vp);}catch(e){R[`${vp.width}x${vp.height}`].fatal=String(e).slice(0,800);}save();}
 await browser.close();R.finished=new Date().toISOString();save();console.log('done');})();
