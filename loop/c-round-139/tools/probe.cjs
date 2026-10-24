const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, { width: 1440, height: 900 }, 'probe', net);
  const r = await p.evaluate(() => ({
    tracks: [...document.querySelectorAll('[data-track-id]')].map((t) => t.getAttribute('data-track-id')).filter((v,i,a)=>a.indexOf(v)===i),
    sources: [...document.querySelectorAll('[role=option][data-source-id]')].map((o) => o.dataset.sourceId + ' | ' + o.textContent.trim().slice(0, 60)),
    snap: (document.querySelector('[data-testid=arrangement-grid-control]')||{dataset:{}}).dataset.snap, url: location.href, body: document.body.innerText.slice(0,500),
    clips: document.querySelectorAll('[data-clip-id]').length,
    status: (document.querySelector('[data-testid=arrangement-status]')||{}).textContent,
    undo: [...document.querySelectorAll('button')].filter((x) => /Undo|Redo/.test(x.textContent)).map(b=>b.textContent.trim()+'|'+b.getAttribute('title')),
    zoom: (document.querySelector('[data-testid=arrangement-zoom-readout]')||{}).textContent,
    heads: [...document.querySelectorAll('[data-testid=arrangement-track-header] button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,30),
  }));
  console.log(JSON.stringify(r, null, 1));
  await p.screenshot({ path: L.SHOTS + '/probe-1440.png' });
  console.log(JSON.stringify(net[0]));
  await b.close();
})();
