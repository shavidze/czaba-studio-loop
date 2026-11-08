const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const SH='/home/runner/czaba-project/tmp/studio-real-loop/c-round-404/shots';
const INIT=()=>{window.__aud={ctxs:[],starts:0,stops:0,gains:[]};
const AC=window.AudioContext;const oc=AC.prototype.createBufferSource;
AC.prototype.createBufferSource=function(){const s=oc.call(this);const st=s.start.bind(s);s.start=(...a)=>{window.__aud.starts++;return st(...a)};const sp=s.stop.bind(s);s.stop=(...a)=>{window.__aud.stops++;return sp(...a)};return s};
const og=AC.prototype.createGain;AC.prototype.createGain=function(){const g=og.call(this);window.__aud.gains.push(g);return g};
const W=window.AudioContext;window.AudioContext=function(...a){const c=new W(...a);window.__aud.ctxs.push(c);return c};window.AudioContext.prototype=W.prototype;};
const BASE=process.env.BASE||'http://127.0.0.1:5173';const OUTN=process.env.OUTN||'leaf';const out={};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [w,h] of [[1440,900],[1280,720]]){const tag=`${w}x${h}`;const R={steps:{}};out[tag]=R;
const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(INIT);const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
const shot=async n=>p.screenshot({path:`${SH}/leaf-${n}-${tag}.png`});
const rd=()=>p.evaluate(()=>{const t=id=>document.querySelector(`[data-testid="${id}"]`)?.textContent?.trim();
return {state:t('arrangement-playback-state'),pos:t('arrangement-position'),status:t('arrangement-status'),clips:[...document.querySelectorAll('[data-clip-kind="audio"]')].map(c=>({s:c.getAttribute('data-clip-start'),w:Math.round(c.getBoundingClientRect().width)})),
 aud:{starts:window.__aud.starts,stops:window.__aud.stops,ctx:window.__aud.ctxs.map(c=>[c.state,+c.currentTime.toFixed(3)])},
 undo:[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.textContent.trim()))?.textContent.trim(),
 lanes:Object.fromEntries([...document.querySelectorAll('[data-track-id]')].map(c=>[c.getAttribute('data-track-id'),c.getAttribute('data-clip-count')])),
 brace:document.querySelector('[data-testid="arrangement-loop-brace"]')?.getAttribute('data-loop-enabled')??null,
 markers:document.querySelectorAll('[data-testid="arrangement-marker"]').length,
 masterMute:document.querySelector('button[aria-label="Master Mute"]')?.getAttribute('aria-pressed'),
 masterRead:t('arrangement-master-readout'), masterSlider:document.querySelector('[aria-label="Master Volume"]')?.getAttribute('aria-valuetext')??document.querySelector('[aria-label="Master Volume"]')?.value}});
const step=async(n,f)=>{try{await f();R.steps[n]=await rd();}catch(e){R.steps[n]={error:String(e).slice(0,300)};}await shot(n.replace(/\W+/g,'_'));};
await p.goto(BASE+'/studio-lab',{waitUntil:'load'});
await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),null,{timeout:120000});await p.waitForTimeout(1200);
await step('00-add-fullmix',async()=>{await p.locator('[role=option][data-source-id="demo-synth-mix"]').click();await p.keyboard.press('Enter');await p.waitForTimeout(1500);});
await step('01-library-add-button',async()=>{await p.locator('[role=option][data-source-id="demo-soft-impact"]').click();await p.getByRole('button',{name:/^Add$/}).click();await p.waitForTimeout(1200);});
await step('02-undo-lib-add',async()=>{await p.keyboard.press('Control+z');await p.waitForTimeout(500);});
// move the full mix clip
const clip=p.locator('[data-clip-kind="audio"]').first();
const bar=clip.locator('div.cursor-grab').first();const bb=await bar.boundingBox();
await step('03-move-drag',async()=>{await p.mouse.move(bb.x+40,bb.y+bb.height/2);await p.mouse.down();for(let i=1;i<=20;i++)await p.mouse.move(bb.x+40+i*5,bb.y+bb.height/2);await p.mouse.up();await p.waitForTimeout(600);});
await step('04-undo-move',async()=>{await p.keyboard.press('Control+z');await p.waitForTimeout(500);});
await step('05-redo-move',async()=>{await p.keyboard.press('Control+Shift+z');await p.waitForTimeout(500);});
await step('05b-undo-button',async()=>{await p.getByRole('button',{name:/^Undo/}).click();await p.waitForTimeout(400);});
await step('05c-redo-button',async()=>{await p.getByRole('button',{name:/^Redo/}).click();await p.waitForTimeout(400);});
// transport
await step('06-home',async()=>{await p.getByRole('button',{name:'Back to start'}).click();await p.waitForTimeout(300);});
await step('07-play',async()=>{await p.getByRole('button',{name:'Play',exact:true}).click();await p.waitForTimeout(1800);});
await step('07b-play-later',async()=>{await p.waitForTimeout(1000);});
await step('08-stop',async()=>{await p.getByRole('button',{name:'Stop',exact:true}).click();await p.waitForTimeout(600);});
await step('08b-after-stop',async()=>{await p.waitForTimeout(800);});
// range selection inside clip
const cb=await p.locator('[data-clip-kind="audio"]').first().boundingBox();
const y=cb.y+cb.height*0.7;
await step('09-range-inside',async()=>{await p.mouse.move(cb.x+cb.width*0.25,y);await p.mouse.down();for(let i=1;i<=20;i++)await p.mouse.move(cb.x+cb.width*(0.25+0.4*i/20),y);await p.mouse.up();await p.waitForTimeout(500);});
await step('10-loop-on',async()=>{await p.getByRole('button',{name:/^Loop/}).first().click();await p.waitForTimeout(500);});
await step('11-loop-off',async()=>{await p.getByRole('button',{name:/^Loop/}).first().click();await p.waitForTimeout(500);});
await step('12-split-ctrlE',async()=>{await p.keyboard.press('Control+e');await p.waitForTimeout(700);});
await step('13-undo-split',async()=>{await p.keyboard.press('Control+z');await p.waitForTimeout(600);});
// one-edge selection
const cb2=await p.locator('[data-clip-kind="audio"]').first().boundingBox();
const y2=cb2.y+cb2.height*0.7;
await step('14-range-cross-right-edge',async()=>{await p.mouse.move(cb2.x+cb2.width*0.7,y2);await p.mouse.down();for(let i=1;i<=24;i++)await p.mouse.move(cb2.x+cb2.width*(0.7+0.5*i/24),y2);await p.mouse.up();await p.waitForTimeout(500);});
await step('15-split-one-edge',async()=>{await p.keyboard.press('Control+e');await p.waitForTimeout(700);});
await step('16-undo-split2',async()=>{await p.keyboard.press('Control+z');await p.waitForTimeout(600);});
// master
await step('17-master-mute-on',async()=>{await p.getByRole('button',{name:'Master Mute',exact:true}).click();await p.waitForTimeout(400);});
await step('18-master-mute-off',async()=>{await p.getByRole('button',{name:'Master Mute',exact:true}).click();await p.waitForTimeout(400);});
const ms=p.locator('[aria-label="Master Volume"]').first();
await step('19-master-focus',async()=>{await ms.focus();});
await step('20-master-arrowup-hold',async()=>{await p.keyboard.down('ArrowUp');await p.waitForTimeout(150);});
await step('21-master-arrowup-release',async()=>{await p.keyboard.up('ArrowUp');await p.waitForTimeout(400);});
await step('22-master-undo',async()=>{await p.keyboard.press('Control+z');await p.waitForTimeout(500);});
// markers
await step('23-seek-1',async()=>{await p.getByRole('button',{name:'Back to start'}).click();await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);});
await step('24-marker-add',async()=>{await p.getByRole('button',{name:/^Add marker/}).click();await p.waitForTimeout(500);});
await step('25-marker-enter',async()=>{await p.keyboard.press('Enter');await p.waitForTimeout(500);});
await step('26-home',async()=>{await p.getByRole('button',{name:'Back to start'}).click();await p.waitForTimeout(400);});
await step('27-marker-next',async()=>{await p.getByRole('button',{name:/^Next marker/}).click();await p.waitForTimeout(500);});
// library preview
await step('28-lib-select',async()=>{await p.locator('[role=option][data-source-id="demo-slow-rise"]').click();await p.waitForTimeout(300);});
await step('29-lib-preview',async()=>{await p.locator('[data-testid="arrangement-library"]').getByRole('button',{name:'Preview',exact:true}).click();await p.waitForTimeout(800);const n=await p.locator('[data-testid="arrangement-library-option-previewing"]').count();R.previewMarkers=n;R.previewAud=await p.evaluate(()=>({starts:window.__aud.starts,stops:window.__aud.stops}));});
await step('30-lib-preview-stop',async()=>{await p.locator('[data-testid="arrangement-library"]').getByRole('button',{name:'Stop',exact:true}).click();await p.waitForTimeout(600);R.previewMarkersAfter=await p.locator('[data-testid="arrangement-library-option-previewing"]').count();R.previewAudAfter=await p.evaluate(()=>({starts:window.__aud.starts,stops:window.__aud.stops}));});
await step('31-lib-enter-add',async()=>{await p.locator('[role=option][data-source-id="demo-soft-impact"]').click();await p.keyboard.press('Enter');await p.waitForTimeout(1200);});
R.errors=errs;await ctx.close();
fs.writeFileSync(`../out/${OUTN}.json`,JSON.stringify(out,null,1));}
await b.close();console.log('done');})();
