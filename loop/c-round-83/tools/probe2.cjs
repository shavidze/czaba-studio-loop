const X=require('./lib83.cjs');const{L,sleep,st,blur,envInfo,setMode}=X;
(async()=>{const s=await L.open('1280x720');const p=s.page;await L.fresh(p);const S=await X.freshSetup(p,{video:false});await X.loadVideo(p);await X.lMute(p,'video').click();await sleep(200);await blur(p);
 const info=async n=>{const c=await envInfo(p,'stems');const sc=await p.evaluate(()=>({y:scrollY,els:[...document.querySelectorAll('*')].filter(e=>e.scrollTop>0).map(e=>[e.tagName,e.className.slice(0,30),e.scrollTop])}));console.log(n,JSON.stringify(c.box),JSON.stringify(sc),JSON.stringify(await st(p)).slice(0,300));return c;};
 let c=await info('start');const by=X.bodyY(c,0.75);
 await p.mouse.move(X.tx(6),by);await p.mouse.down();await p.mouse.move(X.tx(7),by,{steps:4});await p.mouse.move(X.tx(8),by,{steps:4});await p.mouse.up();await sleep(400);await info('range');
 await p.keyboard.press('Escape');await sleep(300);await info('esc');
 console.log(await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.getAttribute('data-testid')||e.className.slice(0,80))},[X.tx(10),by]));
 await p.mouse.click(X.tx(10),by);await sleep(400);await info('seek');
 await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
