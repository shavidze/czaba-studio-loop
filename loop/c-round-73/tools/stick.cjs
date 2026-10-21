const L=require('./lib.cjs');const fs=require('fs');const vp=process.argv[2]||'1280x500';
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);const out={vp};
 const geo=()=>p.evaluate(()=>{const g=n=>{const e=document.querySelector(`[data-testid=${n}]`);return e?Math.round(e.getBoundingClientRect().top*10)/10:null};const sc=document.querySelector('[data-testid=arrangement-timeline-scroller]');return{scrollTop:sc.scrollTop,sh:sc.scrollHeight,ch:sc.clientHeight,ruler:g('arrangement-ruler'),tempo:g('arrangement-tempo-input'),markerRow:g('arrangement-marker-row'),loop:g('arrangement-loop-strip'),scroller:Math.round(sc.getBoundingClientRect().top*10)/10,firstLane:Math.round(document.querySelector('[data-track-id]').getBoundingClientRect().top*10)/10}});
 out.initial=await geo();
 // enlarge lanes by dragging height handles if no overflow
 let i=0;while((await geo()).sh<=(await geo()).ch+40&&i<8){const hs=await p.locator('[data-testid=arrangement-track-height]').all();const h=hs[i%hs.length];const b=await h.boundingBox();if(!b||b.y>p.viewportSize().height-5){i++;continue;}
  await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,Math.min(b.y+200,p.viewportSize().height-2),{steps:10});await p.mouse.up();await L.sleep(200);i++;}
 out.afterGrow=await geo();out.overflow=out.afterGrow.sh-out.afterGrow.ch;
 if(out.overflow>20){const lb=await p.evaluate(()=>{const r=document.querySelector('[data-track-id]:last-of-type [data-grid-seconds]')||document.querySelector('[data-track-id] [data-grid-seconds]');const q=r.getBoundingClientRect();return{x:q.left+300,y:Math.min(q.top+20,window.innerHeight-20)}});
  await p.mouse.move(lb.x,Math.min(lb.y,p.viewportSize().height-30));await p.mouse.wheel(0,300);await L.sleep(400);out.afterWheel=await geo();
  await p.screenshot({path:`${L.OUT}/shots/stick-${vp}.png`});}
 console.log(JSON.stringify(out,null,1));fs.writeFileSync(`${L.OUT}/stick-${vp}.json`,JSON.stringify(out,null,1));await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
