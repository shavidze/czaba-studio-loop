const H=require('./h3.cjs'); const {X,L,sleep}=H; const fs=require('fs');
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'keys-'+w,net);
 const dt=()=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
 const met=()=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-metronome-toggle]').getAttribute('aria-pressed'));
 r.detail0=await dt(); await L.blur(p); await p.keyboard.press('Control+Alt+3'); await sleep(400); r.detailAfter=await dt(); r.st1=await L.status(p);
 const t=p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('120'); await t.press('Enter'); await sleep(400); await L.blur(p);
 r.met0=await met(); await p.keyboard.press('o'); await sleep(400); r.metAfterO=await met(); r.st2=await L.status(p);
 await ctx.close(); }
console.log(JSON.stringify(R)); fs.writeFileSync('../out/keys.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
