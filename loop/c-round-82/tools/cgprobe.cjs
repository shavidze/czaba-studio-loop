const X=require('./lib82.cjs');const{L,sleep,st,blur}=X;
(async()=>{const s=await L.open('1280x720');const p=s.page;await X.freshSetup(p,{video:false});await X.selectClip(p,'stems');
const inp=p.locator('[data-testid=arrangement-detail-clip-gain-input]');
console.log(await inp.evaluate(e=>{const r=e.getBoundingClientRect();let a=e,hid=[];while(a){const cs=getComputedStyle(a);if(cs.display==='none'||cs.visibility==='hidden'||cs.overflow==='hidden')hid.push(a.tagName+'.'+(a.getAttribute('data-testid')||'')+':'+cs.display+'/'+cs.visibility+'/'+cs.overflow+'/'+a.getBoundingClientRect().height.toFixed(0));a=a.parentElement}return{r:r.toJSON(),dis:e.disabled,title:e.title,hid:hid.slice(0,8),vh:innerHeight}}));
console.log('visible',await inp.isVisible(),'enabled',await inp.isEnabled());
await p.screenshot({path:`${L.OUT}/shots/cg-probe-1280x720.png`});
await inp.scrollIntoViewIfNeeded().catch(e=>console.log('scroll err',String(e).slice(0,100)));console.log(await inp.evaluate(e=>e.getBoundingClientRect().toJSON()));
await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
