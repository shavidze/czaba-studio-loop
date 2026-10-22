const H=require('./h.cjs');const{L,sleep,clickName,clickGroup}=H;
(async()=>{const out={};for(const vp of ['1440x900','1280x720']){const s=await L.open(vp);const p=s.page;await L.fresh(p);await H.decline(p);
 const f=()=>p.evaluate(()=>{const a=document.activeElement;return a&&(a.getAttribute('data-testid')||a.getAttribute('aria-label')||a.tagName)});
 await clickName(p,'music');await clickName(p,'stems',['Shift']);const f0=await f();await p.keyboard.press('Control+g');await sleep(400);const f1=await f();
 await p.keyboard.press('F2');await sleep(300);const inp=await p.locator('[data-testid=arrangement-group-name-input]').count();
 await clickGroup(p,'ჯგუფი 1');await p.keyboard.press('Control+Shift+g');await sleep(400);const f2=await f();
 out[vp]={beforeCtrlG:f0,afterCtrlG:f1,f2OpensEditorAfterCtrlG:inp,afterUngroup:f2};await s.browser.close();}
console.log(JSON.stringify(out,null,1));require('fs').writeFileSync(L.OUT+'/focus-after-group.json',JSON.stringify(out,null,1));})();
