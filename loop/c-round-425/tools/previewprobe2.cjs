const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const [w,h]=process.argv[2].split('x').map(Number);const mode=process.argv[3]||'normal';
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const ctx=await b.newContext({viewport:{width:w,height:h}});
await ctx.addInitScript(()=>{localStorage.setItem('czaba_analytics_consent','denied');window.__els=[];window.__plays=0;
 const A=window.Audio;window.Audio=function(...a){const e=new A(...a);window.__els.push(e);return e};window.Audio.prototype=A.prototype;
 const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...a){window.__plays++;return pl.apply(this,a)};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
if(mode==='delay'){await p.route('**/*.mp3',async r=>{await new Promise(s=>setTimeout(s,4000));r.continue();});}
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForFunction(()=>/Demo collection ready/.test(document.body.innerText),null,{timeout:120000});await p.waitForTimeout(800);
const snap=()=>p.evaluate(()=>window.__els.map(e=>({paused:e.paused,t:+e.currentTime.toFixed(2),vol:e.volume,muted:e.muted,rs:e.readyState,src:(e.currentSrc||e.src||'').slice(-30)})));
const res={mode,errs};
await p.getByRole('button',{name:'Preview',exact:true}).first().click();
res.samples=[];for(let i=0;i<6;i++){await p.waitForTimeout(700);res.samples.push({btn:await p.getByRole('button',{name:/^(Preview|Stop)$/}).and(p.locator(':not([aria-label])')).first().textContent().catch(()=>null),els:await snap(),plays:await p.evaluate(()=>window.__plays)});}
await p.locator('body').evaluate(()=>document.activeElement&&document.activeElement.blur());
await p.getByRole('button',{name:'Play',exact:true}).first().click();await p.waitForTimeout(1500);
res.afterPlay={els:await snap(),playing:await p.locator('[data-playing]').first().getAttribute('data-playing'),plays:await p.evaluate(()=>window.__plays)};
await p.keyboard.press('Space');await p.waitForTimeout(500);res.afterStop={els:await snap()};
console.log(JSON.stringify(res));await b.close();})();
