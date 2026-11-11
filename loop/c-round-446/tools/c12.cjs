const L = require('../../c-round-205/tools/lib.cjs');
(async()=>{
 const b=await L.launch(); const out=[];
 for (const W of [1440,1280]){
  const {ctx,page,log}=await L.newPage(b,W);
  await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await L.declineCookies(page); await L.sleep(1500);
  await page.getByText('Full mix',{exact:false}).first().click(); await L.sleep(300);
  await page.getByRole('button',{name:/Add/}).first().click(); await L.sleep(1200);
  const status=async()=>page.evaluate(()=>{const t=document.body.innerText;const m=t.match(/(Playing|Stopped|Paused)[^\n]*/i);return {m:m&&m[0],clock:(t.match(/\d:\d\d\.\d{3}/)||[])[0]}});
  const s0=await status();
  await page.getByRole('button',{name:/^play/i}).first().click(); await L.sleep(2000);
  const s1=await status(); const clock1=await page.evaluate(()=>document.body.innerText.match(/\d\d:\d\d\.\d{3}/)?.[0]);
  await page.screenshot({path:`../shots/c12-studio-${W}-playing.png`});
  await page.getByRole('button',{name:/^stop/i}).first().click(); await L.sleep(800);
  const s2=await status();
  out.push({W,s0,s1,clock1,s2,errors:log.errors}); await ctx.close();
 }
 await b.close(); console.log(JSON.stringify(out));
})();
