const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe136', net);
  const r = await p.evaluate(() => {
    const q = (s) => [...document.querySelectorAll(`[data-testid=${s}]`)].map((e) => ({ aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), text: e.textContent.trim().slice(0, 40), box: e.getBoundingClientRect().toJSON() }));
    return { add: q('arrangement-marker-add'), prev: q('arrangement-marker-prev'), next: q('arrangement-marker-next'), flags: q('arrangement-marker'), status: (document.querySelector('[data-testid=arrangement-status]')||{}).textContent, liveRegions: [...document.querySelectorAll('[role=status],[aria-live]')].map((e)=>[e.getAttribute('data-testid'),e.getAttribute('role'),e.textContent.slice(0,80)]), snap: document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap, undo: [...document.querySelectorAll('button')].filter((x) => /Undo|Redo/.test(x.textContent + x.getAttribute('aria-label'))).map((x) => [x.textContent.trim(), x.getAttribute('aria-label'), x.title]) };
  });
  console.log(JSON.stringify(r, null, 1), JSON.stringify(X.netOk(net)));
  await b.close();
})();
