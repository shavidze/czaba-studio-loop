import { createRequire } from 'node:module';import fs from 'node:fs';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const D=process.argv[2];const B='http://127.0.0.1:5173';const br=await chromium.launch();const res={auth:{},smoke:{}};
for(const [w,h] of [[1440,900],[1280,720]]){
 const k=`${w}x${h}`;
 // ROW 2 auth
 {const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,160))});
  const r={};
  for(const u of ['/studio-lab','/studio/middle-east','/account/downloads']){
   await p.goto(B+u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(3500);
   await p.goto(B+u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(4500);
   const t=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ');
   const links=await p.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>/download|stem|\.mp3|\.wav|r2|token/i.test(h)));
   r[u]={url:p.url(),hasSignIn:/sign in|log in|login/i.test(t),hasDemo:/no sign-in required/i.test(t),text:t.slice(0,300),dlLinks:links,hasTimeline:!!(await p.$('[data-testid="arrangement-timeline-scroller"]'))};
   await p.screenshot({path:`${D}/auth-${u.replace(/\//g,'_')}-${k}.png`});}
  r.authUser=await p.evaluate(()=>localStorage.getItem('auth_user'));
  const tr=await p.request.get(B+'/api/studio-token?product=middle-east&file=stem.mp3');
  const body=(await tr.text()).slice(0,300);r.token={status:tr.status(),body,hasUrl:/https?:\/\/|"url"/i.test(body)};
  r.errs=errs.slice(0,12);res.auth[k]=r;await c.close();}
 // ROW 3 smoke
 {const c=await br.newContext({viewport:{width:w,height:h},acceptDownloads:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
  await p.goto(B+'/studio-lab',{waitUntil:'domcontentloaded'});
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
  await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{res.smoke[k+'-readyTimeout']=true});
  await p.waitForTimeout(1200);
  const clips=()=>p.evaluate(()=>new Set([...document.querySelectorAll('[data-clip-id]')].map(e=>e.getAttribute('data-clip-id'))).size);
  const st=()=>p.evaluate(()=>{const e=document.querySelector('[data-testid="arrangement-playback-state"]');return e&&e.textContent.trim()});
  const clk=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/^\d+:\d{2}\.\d+$/.test(x.textContent.trim()));return e&&e.textContent.trim()});
  const r={};r.clips0=await clips();r.state0=await st();
  await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');
  await p.waitForSelector('[data-clip-id]',{timeout:20000}).catch(()=>{});
  r.clips1=await clips();r.clk0=await clk();
  await p.keyboard.press('Space');await p.waitForTimeout(1500);r.stateP=await st();r.clk1=await clk();
  await p.keyboard.press('Space');await p.waitForTimeout(500);r.stateS=await st();r.clk2=await clk();
  await p.screenshot({path:`${D}/smoke-${k}.png`});
  await p.getByRole('button',{name:/^Export/}).first().click();await p.getByRole('dialog').waitFor();
  await p.screenshot({path:`${D}/export-dialog-${k}.png`});
  r.dialogText=(await p.getByRole('dialog').innerText()).replace(/\s+/g,' ').slice(0,500);
  const wav=p.getByRole('dialog').getByText(/WAV/).first();await wav.click().catch(e=>r.wavClickErr=String(e).slice(0,100));
  await p.waitForFunction(()=>{const b=[...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1);return b&&!b.disabled},null,{timeout:60000}).catch(()=>r.btnWait='timeout');
  const btn=p.getByRole('dialog').locator('div.justify-end > button').last();r.btnText=await btn.textContent();
  const dl=p.waitForEvent('download',{timeout:120000});await btn.click();const d=await dl;
  const f=`${D}/export-${k}.wav`;await d.saveAs(f);r.file=d.suggestedFilename();r.bytes=fs.statSync(f).size;
  r.errs=errs.slice(0,8);res.smoke[k]=r;await c.close();}
}
fs.writeFileSync(D+'/rows23.json',JSON.stringify(res,null,1));await br.close();console.log('done');
