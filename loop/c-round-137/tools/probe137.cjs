const L = require('./lib.cjs');
(async () => {
  const B = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(B, { width: 1440, height: 900 }, 'probe', net);
  const d = await p.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map(e=>e.textContent),
    tracks: [...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId),
    sources: [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => e.dataset.sourceId + '|' + e.textContent.trim().slice(0, 40)),
    clips: [...document.querySelectorAll('[data-clip-id]')].length,
    status: (document.querySelector('[data-testid=arrangement-status]')||{}).textContent, statusTids: [...document.querySelectorAll('[role=status],output')].map(e=>e.dataset.testid+'|'+e.textContent.slice(0,80)),
    env: (() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Env'); return b && { title: b.title, pressed: b.getAttribute('aria-pressed'), tid: b.dataset.testid }; })(),
    wz: (() => { const s = document.querySelector('[data-testid=arrangement-waveform-zoom]'); return s && { aria: s.getAttribute('aria-label'), title: s.title, opts: [...s.options].map((o) => o.value + ':' + o.text) }; })(),
    tids: [...new Set([...document.querySelectorAll('[data-testid]')].map((e) => e.dataset.testid))].filter((t) => /video|library|undo|history|group|envelope/.test(t)),
    undo: [...document.querySelectorAll('button')].filter((b) => /Undo|Redo/.test(b.textContent + b.title)).map((b) => b.textContent.trim() + '|' + b.title + '|' + b.getAttribute('aria-label')),
  }));
  console.log(JSON.stringify(d, null, 1)); console.log(JSON.stringify(net.map(n=>[n.errors,n.hydration,n.forbidden])));
  await B.close();
})();
