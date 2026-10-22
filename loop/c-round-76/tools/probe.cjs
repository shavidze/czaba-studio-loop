const L=require('./lib.cjs');
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
const info=await p.evaluate(()=>({
 tracks:[...document.querySelectorAll('[data-track-id]')].map(e=>({id:e.getAttribute('data-track-id'),tag:e.tagName,r:e.getBoundingClientRect().toJSON(),btns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('title')||b.textContent.trim()).slice(0,8)})),
 opts:[...document.querySelectorAll('[role=option][data-source-id]')].map(o=>[o.getAttribute('data-source-id'),o.getAttribute('draggable'),o.textContent.trim().slice(0,40)]),
 clips:[...document.querySelectorAll('[data-clip-id]')].map(e=>[...e.attributes].map(a=>a.name+'='+a.value.slice(0,40)).join(' ')),
 grid:[...((document.querySelector('[data-testid=arrangement-grid-control]')||{}).attributes||[])].map(a=>a.name+'='+a.value).join(' '),
 div:[...document.querySelectorAll('[data-testid=arrangement-grid-division] option')].map(o=>o.value+':'+o.textContent),
 zoom:(document.querySelector('[data-testid=arrangement-zoom-readout]')||{}).textContent,
 testids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].join(' ')
}));
console.log(JSON.stringify(info,null,1));await p.screenshot({path:L.OUT+'/shots/probe.png'});await s.browser.close();})();
