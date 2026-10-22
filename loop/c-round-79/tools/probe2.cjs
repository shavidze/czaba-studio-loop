const L=require('./lib.cjs');
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
const o=await p.evaluate(()=>{const l=document.querySelector('[data-track-id=stems]');return [...l.querySelectorAll('button,input,[role=slider],[data-testid]')].filter(e=>!e.closest('[data-clip-id]')).map(e=>[e.tagName,e.getAttribute('data-testid'),e.getAttribute('title'),e.getAttribute('aria-label'),e.getAttribute('type'),e.getAttribute('aria-pressed'),e.getAttribute('aria-valuenow')||e.value].join(' | '))});
console.log(o.join('\n'));await s.browser.close();})();
