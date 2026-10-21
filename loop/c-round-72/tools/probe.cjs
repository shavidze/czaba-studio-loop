const L=require('./lib.cjs');
(async()=>{const s=await L.open('1440x900');await L.fresh(s.page);
 const info=await s.page.evaluate(()=>({tids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))],lib:[...document.querySelectorAll('[draggable=true]')].map(e=>e.textContent.trim().slice(0,40)).slice(0,20),badge:/demo/i.test(document.body.innerText)}));
 console.log(JSON.stringify(info,null,1));await s.page.screenshot({path:L.OUT+'/shots/probe.png'});await s.browser.close();})();
