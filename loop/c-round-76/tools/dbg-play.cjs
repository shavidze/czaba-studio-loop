process.argv[3]='none';
const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
const rl=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
await p.click('[data-testid=arrangement-snap-toggle]');
await p.mouse.click(rl.left+6.3*40,rl.top+14);await sleep(200);await p.keyboard.press('m');await sleep(200);await p.keyboard.press('Enter');await sleep(300);await p.evaluate(()=>document.activeElement.blur());
const pos=()=>p.textContent('[data-testid=arrangement-position]');
const f=p.locator('[data-testid=arrangement-marker]').first();
for(let k=0;k<3;k++){const b=await f.boundingBox();await p.mouse.dblclick(b.x+3,b.y+b.height/2);const a=[];for(let i=0;i<6;i++){await sleep(250);a.push(await pos());}
 const act=await p.evaluate(()=>{const a=document.activeElement;return a&&(a.getAttribute('data-testid')||a.tagName)});
 await p.keyboard.press('Space');await sleep(300);const after=await pos();await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await sleep(1500);console.log(k,JSON.stringify(a),act,'afterSpace',after);}
await s.browser.close();})();
