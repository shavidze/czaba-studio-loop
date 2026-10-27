const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => [...document.querySelectorAll('button')].some((x) => x.textContent.trim() === 'Add' && !x.disabled), undefined, { timeout: 90000 });
  const adds = await p.getByRole('button', { name: 'Add', exact: true }).count();
  console.log('add buttons', adds);
  const lib = await p.$$eval('[data-testid^="arrangement-library"]', (els) => els.slice(0, 30).map((e) => e.getAttribute('data-testid') + ' | ' + e.textContent.slice(0, 60)));
  console.log(lib.join('\n'));
  await p.getByRole('button', { name: 'Add', exact: true }).click();
  await p.waitForTimeout(2000);
  const clips = await p.$$eval('[data-clip-id]', (els) => els.map((e) => ({ id: e.getAttribute('data-clip-id'), kind: e.getAttribute('data-clip-kind'), text: e.textContent.slice(0, 40), wave: !!e.querySelector('[data-testid="arrangement-clip-waveform"]') })));
  console.log(JSON.stringify(clips));
  const lanes = await p.getByRole('button', { name: / — set as the active track$/ }).allTextContents();
  console.log(lanes);
  await b.close();
})();
