const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const vp=process.argv[2];const s=await L.open(vp);const p=s.page;await L.fresh(p);
const geo=()=>p.evaluate(()=>{const R=s=>{const e=document.querySelector(s);return e&&e.getBoundingClientRect().toJSON()};const sc=document.querySelector('[data-testid=arrangement-timeline-scroller]');return{ruler:R('[data-testid=arrangement-ruler]'),scroller:R('[data-testid=arrangement-timeline-scroller]'),sc:sc&&{sl:sc.scrollLeft,st:sc.scrollTop,sh:sc.scrollHeight,ch:sc.clientHeight},lanes:[...document.querySelectorAll('[data-track-id]')].map(e=>[e.getAttribute('data-track-id'),Math.round(e.getBoundingClientRect().top),Math.round(e.getBoundingClientRect().bottom)]),markRow:R('[data-testid=arrangement-marker-row]'),lib:R('[data-testid=arrangement-library]'),detail:R('[data-testid=arrangement-detail-panel]'),vw:innerWidth,vh:innerHeight}});
console.log(vp,JSON.stringify(await geo()));
await p.screenshot({path:L.OUT+`/shots/probe3-${vp}.png`});
await s.browser.close();})();
