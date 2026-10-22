const X=require('./lib82.cjs');const{L,sleep,st}=X;
const vp=process.argv[2]||'1440x900';
(async()=>{
 // warm-up context
 {const s=await L.open(vp);await s.page.goto(L.URL,{waitUntil:'domcontentloaded'});await s.page.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:120000});await sleep(4000);console.log('warmup console',s.con.filter(l=>/error|hydrat/i.test(l)).slice(0,5));await s.browser.close();}
 const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p,{video:false});
 console.log(JSON.stringify({geo:S.geo,clips:S.clips}));
 const c=await X.hover(p,'stems');console.log('hover stems',JSON.stringify(c));
 const lb=await X.laneBox(p,'stems');console.log('lane',lb);
 await p.screenshot({path:`${L.OUT}/shots/probe-${vp}.png`});
 await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
