import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const out={};
for (const [w,h] of [[1440,900],[1280,720]]) {
const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:180000});
const r={authUser:await p.evaluate(()=>localStorage.getItem('auth_user'))};
const opt=p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first();await opt.focus();await p.keyboard.press('Enter');await p.waitForTimeout(800);
const play=p.getByRole('button',{name:/^play/i}).first();
r.playLabel=await play.getAttribute('aria-label');
await play.click();await p.waitForTimeout(1500);
r.statePlaying=await p.getByTestId('arrangement-playback-state').innerText();r.clock=await p.evaluate(()=>[...document.querySelectorAll('[data-testid*=clock],[data-testid*=time]')].map(e=>e.textContent).slice(0,3));
r.stopBtn=await p.getByRole('button',{name:/^stop/i}).count();
if(r.stopBtn) await p.getByRole('button',{name:/^stop/i}).first().click(); else await p.keyboard.press('Space');
await p.waitForTimeout(800);
r.stateStopped=await p.getByTestId('arrangement-playback-state').innerText();
await p.screenshot({path:`/home/runner/czaba-project/tmp/studio-real-loop/c-round-444/smoke-${w}.png`});
{
await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
r.studio={url:p.url(),signIn:await p.getByText(/sign in required/i).count(),audioSrc:await p.locator('audio[src]').count()};
const t=await p.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem.mp3');r.token=t.status();}
out[w]=r;await c.close();}
await br.close();console.log(JSON.stringify(out,null,1));
