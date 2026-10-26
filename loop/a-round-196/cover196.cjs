const T='/home/runner/czaba-project/tmp/studio-real-loop/c-round-195/tools/';
const X=require(T+'lib122.cjs');const {L,sleep}=X;const path=require('path');const fs=require('fs');
const OUT=path.join(__dirname,'live','covered');fs.mkdirSync(OUT,{recursive:true});const net=[];
(async()=>{const b=await L.chromium.launch({headless:true,args:['--disable-lcd-text']});
try{const o=await L.openStudio(b,X.VPS[1440],'a196-cover',net,{deviceScaleFactor:2});const p=o.page;
await p.click('[data-testid=arrangement-marker-add]');await sleep(400);await p.keyboard.press('Enter');await sleep(400);
const tr=await p.evaluate(()=>[...document.querySelectorAll('[data-track-id]')].map(e=>e.getAttribute('data-track-id')).filter(id=>document.querySelector(`[data-track-id="${id}"] [data-testid=arrangement-track-pan]`)));
await p.click(L.nameSel(tr[0]));await p.click(L.nameSel(tr[1]),{modifiers:['Shift']});await p.keyboard.press('Control+g');await sleep(600);
if(process.argv[2]==='edit'){await p.dblclick('[data-testid=arrangement-group-name]');await sleep(400);if(!(await p.$('[data-testid=arrangement-group-name-input]'))){await p.focus('[data-testid=arrangement-group-name]');await p.keyboard.press('F2');await sleep(400);}console.log('editor',!!(await p.$('[data-testid=arrangement-group-name-input]')));}

for(const id of (process.argv[2]==='edit'?['arrangement-group-name-input']:[]).concat(['arrangement-group-mute','arrangement-group-solo','arrangement-group-volume','arrangement-group-name','arrangement-marker','arrangement-detail-toggle','arrangement-video-expand','arrangement-track-mute'])){
 const el=p.locator(`[data-testid=${id}]`).first(); if(!(await el.count())){console.log('missing',id);continue;}
 await el.focus();await p.keyboard.press('Shift');await p.evaluate(()=>{document.documentElement.dataset.focusSource='keyboard';});await sleep(150);
 const bb=await el.boundingBox();await p.screenshot({path:path.join(OUT,id+'.png'),clip:{x:bb.x-10,y:bb.y-10,width:bb.width+20,height:bb.height+20}});console.log('shot',id);}
}catch(e){console.log('ERR',String(e).slice(0,400));}
await b.close();console.log(JSON.stringify(X.netOk(net)));})();
