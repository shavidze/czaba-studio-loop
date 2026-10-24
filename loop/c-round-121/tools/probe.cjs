const L = require('./lib.cjs');
(async () => {
  const browser = await L.launch(); const net = [];
  const o = await L.openStudio(browser, { width: 1440, height: 900 }, 'probe', net);
  const p = o.page; const sel = '[data-testid=arrangement-waveform-zoom]';
  const rd = () => p.evaluate(() => ({ v: document.querySelector('[data-testid=arrangement-waveform-zoom]').value, a: document.querySelector('[data-testid=arrangement-grid-control]').dataset.waveformZoom, st: (document.querySelector('[data-testid=arrangement-status]')||{}).textContent, act: document.activeElement && document.activeElement.dataset.testid }));
  const b = await p.locator(sel).boundingBox(); console.log('box', b);
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(300); console.log('after click', await rd());
  await p.keyboard.press('ArrowDown'); await L.sleep(300); console.log('after down', await rd());
  await p.keyboard.press('Enter'); await L.sleep(300); console.log('after enter', await rd());
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(300);
  await p.keyboard.press('ArrowDown'); await L.sleep(200); await p.keyboard.press('Enter'); await L.sleep(300); console.log('2nd', await rd());
  console.log(JSON.stringify(net.map(n=>({e:n.errors,h:n.hydration}))));
  await browser.close();
})();
