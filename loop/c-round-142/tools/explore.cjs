const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx } = await L.openStudio(b, { width: 1440, height: 900 }, 'c142-explore', net);
  const r = await p.evaluate(() => {
    const lib = document.querySelector('[data-testid=arrangement-library]');
    return {
      opts: [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => ({ id: e.dataset.sourceId, ds: { ...e.dataset }, text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) })),
      tracks: [...new Set([...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId))],
      libTestids: lib ? [...new Set([...lib.querySelectorAll('[data-testid]')].map((e) => e.dataset.testid))] : null,
      treeItems: [...document.querySelectorAll('[role=treeitem], [aria-expanded]')].map((e) => ({ tag: e.tagName, tid: e.dataset.testid, al: e.getAttribute('aria-label'), ex: e.getAttribute('aria-expanded'), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) })).slice(0, 40),
      search: [...document.querySelectorAll('input')].map((i) => ({ tid: i.dataset.testid, type: i.type, al: i.getAttribute('aria-label'), ph: i.placeholder })),
    };
  });
  console.log(JSON.stringify(r, null, 1));
  console.log(JSON.stringify(net));
  await ctx.close(); await b.close();
})();
