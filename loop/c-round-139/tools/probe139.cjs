const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, { width: 1440, height: 900 }, 'probe', net);
  const r = await p.evaluate(() => ({
    tracks: [...document.querySelectorAll('[data-testid=arrangement-track-header]')].map((h) => ({ id: h.closest('[data-track-id]')?.dataset.trackId, text: h.textContent.replace(/\s+/g, ' '), labels: [...h.querySelectorAll('[aria-label]')].map((e) => e.tagName + ':' + e.getAttribute('aria-label') + (e.title ? ' |t=' + e.title : '')) })),
    sources: [...document.querySelectorAll('[role=option][data-source-id]')].map((o) => o.dataset.sourceId + ' ' + o.textContent.replace(/\s+/g, ' ').slice(0, 60)),
    clips: [...document.querySelectorAll('[data-clip-id]')].length,
    sel: (document.querySelector('[data-testid=arrangement-selected-clip]') || {}).textContent,
    emptyVideo: [...document.querySelectorAll('[data-testid=arrangement-video-dropzone] p')].map((e) => e.textContent),
    seps: [...document.querySelectorAll('[data-testid=arrangement-track-height]')].map((e) => e.getAttribute('aria-label') + ' ' + e.getAttribute('aria-valuetext')),
    status: document.querySelector('[data-testid=arrangement-status]').textContent,
  }));
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
