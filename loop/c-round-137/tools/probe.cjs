const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe', net);
  const r = await p.evaluate(() => {
    const bar = document.querySelector('[data-testid=arrangement-fit]').parentElement;
    const anc = []; let e = document.querySelector('[data-testid=arrangement-fit]'); while (e && anc.length < 6) { anc.push(`${e.tagName}.${(e.className||'').toString().slice(0,60)}|${e.dataset.testid||''}|sw${e.scrollWidth}/cw${e.clientWidth}`); e = e.parentElement; }
    const btns = [...document.querySelectorAll('button,input')].filter(x=>x.closest('[data-testid]')).slice(0,0);
    const testids = [...document.querySelectorAll('[data-testid]')].map(x=>x.dataset.testid).filter((v,i,a)=>a.indexOf(v)===i);
    return { anc, testids, clips: [...document.querySelectorAll('[data-clip-id]')].length, status: document.querySelector('[data-testid=arrangement-status]').textContent };
  });
  console.log(JSON.stringify(r, null, 1));
  await p.screenshot({ path: L.SHOTS + '/probe-1440.png' });
  console.log(JSON.stringify(X.netOk(net)));
  await b.close();
})();
