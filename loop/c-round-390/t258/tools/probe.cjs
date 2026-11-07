const L = require('./lib.cjs');
(async () => {
  const browser = await L.launch(); const net = [];
  const o = await L.openStudio(browser, { width: 1440, height: 900 }, 'probe', net);
  const p = o.page;
  const d = await p.evaluate(() => ({
    testids: [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid))],
    buttons: [...document.querySelectorAll('button')].map(b => (b.getAttribute('aria-label') || '') + ' | ' + b.textContent.trim().slice(0, 40)).slice(0, 200),
    options: [...document.querySelectorAll('[role=option][data-source-id]')].map(o => o.dataset.sourceId + ' : ' + o.textContent.trim().slice(0, 60)),
    tracks: [...document.querySelectorAll('[data-track-id]')].map(t => t.dataset.trackId + ' ' + Math.round(t.getBoundingClientRect().height)),
    badge: document.body.innerText.includes('დემო კოლექცია'),
    sliders: [...document.querySelectorAll('[role=slider]')].map(s => (s.getAttribute('aria-label')||'') + ' ' + s.getAttribute('aria-valuenow') + ' ' + (s.getAttribute('aria-valuetext')||'')),
  }));
  console.log(JSON.stringify(d, null, 1));
  console.log(JSON.stringify(net.map(n=>({e:n.errors,h:n.hydration,f:n.forbidden}))));
  await p.screenshot({ path: '../shots/probe-1440.png' });
  await browser.close();
})();
