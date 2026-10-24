const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx } = await L.openStudio(b, { width: 1440, height: 900 }, 'probe', net);
  const snap = await L.setSnapOff(p);
  const info = await p.evaluate(() => ({
    tracks: [...document.querySelectorAll('[data-track-id]')].filter(e=>e.querySelector('[data-testid=arrangement-track-header]')).map(e => ({ id: e.getAttribute('data-track-id'), h: e.getBoundingClientRect().height, name: (e.querySelector('[data-testid=arrangement-track-header] button[aria-label*="active track"]')||{}).ariaLabel })),
    clips: [...document.querySelectorAll('[data-clip-id]')].map(e => ({ id: e.dataset.clipId, kind: e.dataset.clipKind, lane: e.closest('[data-track-id]').dataset.trackId, start: e.dataset.clipStart, w: e.getBoundingClientRect().width, txt: e.textContent.trim().slice(0,40) })),
    peak: document.querySelector('[data-testid=arrangement-master-peak]')?.outerHTML.slice(0,400),
    meters: [...document.querySelectorAll('[data-testid=arrangement-track-meter]')].map(m => m.outerHTML.slice(0,300)),
    undo: [...document.querySelectorAll('button')].filter(x => /^Undo|^Redo/.test(x.title||x.ariaLabel||'')).map(x => ({t:x.title, a:x.ariaLabel, id:x.dataset.testid})),
    env: document.querySelector('[data-testid=arrangement-envelope-toggle]')?.outerHTML.slice(0,300),
    master: document.querySelector('[data-testid=arrangement-master]')?.innerHTML.replace(/class="[^"]*"/g,'').slice(0,1500),
    status: document.querySelector('[data-testid=arrangement-status]')?.textContent,
    zoom: document.querySelector('[data-testid=arrangement-zoom-readout]')?.textContent,
  }));
  console.log(JSON.stringify({ snap, ...info }, null, 1));
  await p.screenshot({ path: L.SHOTS + '/probe-1440.png' });
  await ctx.close(); await b.close();
})();
