const L=require('./lib.cjs');
(async()=>{const s=await L.open(process.argv[2]||'1440x900');const p=s.page;await L.fresh(p);
const o=await p.evaluate(()=>({
 tracks:[...document.querySelectorAll('[data-track-id]')].map(e=>({id:e.getAttribute('data-track-id'),name:[...e.querySelectorAll('button[aria-pressed]')].map(b=>[b.textContent.trim().slice(0,20),b.getAttribute('title'),b.getAttribute('aria-pressed')])})),
 clips:[...document.querySelectorAll('[data-clip-id]')].map(e=>({id:e.getAttribute('data-clip-id'),start:e.getAttribute('data-clip-start'),attrs:[...e.attributes].map(a=>a.name).join(',')})),
 pos:document.querySelector('[data-testid=arrangement-position]')?.textContent,
 end:document.querySelector('[data-testid=arrangement-project-end]')?.textContent,
 ph:document.querySelector('[data-testid=arrangement-playhead]')?.outerHTML.slice(0,300),
 prevnext:[...document.querySelectorAll('[data-testid^=arrangement-marker-]')].map(e=>e.getAttribute('data-testid')).slice(0,20),
 headers:[...document.querySelectorAll('[data-testid*=track-header], [data-testid*=lane-name]')].map(e=>e.getAttribute('data-testid')+':'+e.textContent.trim().slice(0,20)+':'+e.getAttribute('aria-pressed')).slice(0,10),
 sources:[...document.querySelectorAll('[role=option][data-source-id]')].map(e=>e.getAttribute('data-source-id')),
}));console.log(JSON.stringify(o,null,1));await p.screenshot({path:L.OUT+'/shots/probe.png'});console.log(s.con.slice(0,30).join("\n"));console.log(p.url(), await p.title());await s.browser.close();})();
