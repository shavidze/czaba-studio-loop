const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const mode = process.argv[2];
const outDir = path.join(__dirname, 'px');
(async () => {
  const browser = await chromium.launch();
  const meta = {};
  for (const vp of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
    await page.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Add', exact: true }).waitFor({ timeout: 90000 }); await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(2500);
    const clip = page.locator('[data-clip-kind="audio"]').first();
    const cb = await clip.boundingBox();
    await page.mouse.click(cb.x + Math.min(200, cb.width / 2), cb.y + 10);
    const toggle = page.getByTestId('arrangement-detail-toggle');
    if ((await toggle.getAttribute('aria-expanded')) === 'false') { await toggle.click(); }
    await page.mouse.move(5, 5);
    await page.waitForTimeout(800);
    const field = page.getByTestId('arrangement-detail-clip-gain-input');
    const states = [
      ['rest', async () => {}],
      ['gain-minus12', async () => { await field.fill('-12'); await field.press('Enter'); }],
      ['gain-plus24', async () => { await field.fill('24'); await field.press('Enter'); }],
      ['zoom8', async () => { await field.fill('0'); await field.press('Enter'); await page.getByTestId('arrangement-waveform-zoom').selectOption('8'); }],
    ];
    for (const [name, act] of states) {
      await act();
      await page.mouse.move(5, 5);
      await page.waitForTimeout(700);
      for (const [k, sel] of Object.entries({ lane: '[data-testid="arrangement-clip-waveform"]', detail: '[data-testid="arrangement-detail-waveform"]' })) {
        const loc = page.locator(sel).first();
        const key = `${vp.join('x')}-${name}-${k}`;
        if (!(await loc.isVisible())) { meta[key] = 'not visible'; continue; }
        fs.writeFileSync(path.join(outDir, `${mode}-${key}.png`), await loc.screenshot());
        meta[key] = await loc.evaluate((el) => { const svg = el.tagName === 'svg' ? el : el.querySelector('svg'); const r = svg.getBoundingClientRect(); const p = svg.querySelector('path'); return { viewBox: svg.getAttribute('viewBox'), box: [r.x, r.y, r.width, r.height], color: getComputedStyle(p).fill, dHead: p.getAttribute('d').slice(0, 40) }; });
      }
    }
    await page.close();
  }
  fs.writeFileSync(path.join(outDir, `${mode}-meta.json`), JSON.stringify(meta, null, 1));
  console.log(JSON.stringify(meta, null, 1).slice(0, 1500));
  await browser.close();
})();
