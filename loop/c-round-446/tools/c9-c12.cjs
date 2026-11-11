const L = require('../../c-round-205/tools/lib.cjs');
const fs=require('fs');
(async()=>{
 const b=await L.launch(); const out={};
 for (const [name,base] of [['tree','http://127.0.0.1:5173'],['head','http://127.0.0.1:5178']]){
  const {ctx,page}=await L.newPage(b,1440);
  await page.goto(base+'/',{waitUntil:'networkidle'}); await L.declineCookies(page);
  await L.scrollTo55(page); const r=await L.waitPopup(page,14000);
  await page.screenshot({path:`../shots/c9-${name}-offer.png`});
  const offerText=await page.evaluate(()=>document.body.innerText.includes('FREE DOWNLOAD'));
  const btn=await page.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>/FREE DOWNLOAD/i.test(b.textContent));if(x){x.click();return true}return false});
  await L.sleep(800); await page.screenshot({path:`../shots/c9-${name}-email.png`});
  const emailStep=await page.evaluate(()=>/CONTINUE|email/i.test(document.body.innerText));
  const closed=await page.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>/close/i.test(b.getAttribute('aria-label')||''));if(x){x.click();return true}return false});
  await L.sleep(800);
  const st=await L.state(page);
  out[name]={popup:r.visible,offerText,btn,emailStep,closed,after:await L.popupVisible(page),scrollY:st.scrollY,body:st.body,lm:st.lm};
  await ctx.close();
 }
 // C12 studio-lab
 out.studio=[];
 for (const W of [1440,1280]){
  const {ctx,page,log}=await L.newPage(b,W);
  await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await L.declineCookies(page);
  await L.sleep(1500);
  const txt=async()=>page.evaluate(()=>document.body.innerText);
  const play=page.getByRole('button',{name:/^play/i}).first();
  const had=await play.count();
  if(had) await play.click().catch(()=>{});
  await L.sleep(1500);
  const t1=await txt(); const playing=/Playing/i.test(t1);
  await page.screenshot({path:`../shots/c12-studio-${W}-playing.png`});
  const stop=page.getByRole('button',{name:/^stop|pause/i}).first();
  if(await stop.count()) await stop.click().catch(()=>{});
  await L.sleep(800); const t2=await txt();
  out.studio.push({W,playBtn:had,playing,stopped:/Stopped/i.test(t2),errors:log.errors,noise:log.noise});
  await ctx.close();
 }
 {const {ctx,page}=await L.newPage(b,1440);
  const auds=[];page.on('request',r=>{if(/\.(mp3|wav|m4a)|audio/i.test(r.url()))auds.push(r.url())});
  await page.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'load'}).catch(()=>{}); await page.waitForSelector('body',{timeout:15000}).catch(()=>{}); await L.sleep(4000);
  out.auth={url:page.url(),signIn:/Sign in required/i.test(await page.evaluate(()=>document.body?document.body.innerText:'')),audioSrc:await page.evaluate(()=>document.querySelectorAll('audio[src]').length),audioReqs:auds.length};
  await page.screenshot({path:'../shots/c12-auth.png'}); await ctx.close();}
 await b.close(); fs.writeFileSync('../c9-c12.json',JSON.stringify(out,null,1)); console.log(JSON.stringify(out));
})();
