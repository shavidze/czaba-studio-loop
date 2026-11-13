const X = require('./lib122.cjs'); const { L, sleep } = X; const fs=require('fs');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, log } = await L.openStudio(b, { width: 1440, height: 900 }, 'probe', net);
  const info = await p.evaluate(() => ({
    ua: navigator.userAgent,
    tracks: [...document.querySelectorAll('[data-track-id]')].map(e => e.dataset.trackId),
    buttons: [...document.querySelectorAll('button')].map(b => [b.textContent.trim().slice(0,30), b.getAttribute('aria-label'), b.dataset.testid, b.getAttribute('title')?.slice(0,60)]),
    opts: [...document.querySelectorAll('[role=option][data-source-id]')].map(o => o.dataset.sourceId + '|' + o.textContent.trim().slice(0,60)),
    badge: document.body.innerText.match(/demo[^\n]{0,80}/ig),
    testids: [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid))],
  }));
  await L.setSnapOff(p);
  info.add = await L.addAt(p, 'demo-synth-mix', 'music', 0);
  const cs = await L.clipsDom(p); info.cs = cs;
  await L.selectClip(p, cs[0].id); info.detail = await L.detailInfo(p); info.status = await L.status(p);
  await L.blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await sleep(800);
  info.dlg = await X.dstate(p);
  info.dlgButtons = await p.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].map(b => b.textContent.trim()));
  fs.writeFileSync('../out/probe199.json', JSON.stringify({ info, log }, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
