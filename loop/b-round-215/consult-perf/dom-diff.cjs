const { createRequire } = require('node:module');
const fs = require('node:fs');
const req = createRequire('/tmp/b216-probe/package.json');
const { chromium } = req('@playwright/test');
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = { runs: [] };
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5197/studio-lab', { waitUntil: 'load' });
    await page.waitForFunction(() => { const a = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add'); return a && !a.disabled && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect'); }, undefined, { timeout: 90000 });
    await page.waitForTimeout(1000);
    const groups = () => page.evaluate(() => {
      const m = {};
      for (const el of document.querySelectorAll('*')) {
        let a = el, key = null;
        while (a && a !== document.body) {
          const tid = a.getAttribute && (a.getAttribute('data-testid') || (a.hasAttribute('data-clip-id') ? 'CLIP' : null) || (a.hasAttribute('data-track-id') ? 'TRACK' : null));
          if (tid) { key = tid; break; }
          a = a.parentElement;
        }
        key = key ?? 'other';
        m[key] = (m[key] || 0) + 1;
      }
      const svgs = [...document.querySelectorAll('svg')].map((s) => s.querySelectorAll('*').length).filter((n) => n > 50);
      return { total: document.querySelectorAll('*').length, groups: m, bigSvgs: svgs };
    });
    const fader = page.getByRole('slider', { name: 'Clip Gain — fader', exact: true });
    const r = { run, states: [] };
    r.states.push({ clips: 0, ...(await groups()) });
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByTestId('arrangement-clip-waveform').first().waitFor();
    await page.waitForTimeout(1500);
    r.states.push({ clips: 1, selected: await fader.isEnabled(), ...(await groups()) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    r.states.push({ clips: 1, afterEscape: true, selected: await fader.isEnabled(), ...(await groups()) });
    for (let k = 2; k <= 4; k++) {
      const h = page.locator('[data-clip-kind="audio"]').last().getByTitle(/ — drag to move$/);
      const b = await h.boundingBox();
      await page.mouse.click(Math.max(b.x, 0) + 40, b.y + b.height / 2);
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await page.keyboard.press('Control+d');
      await page.locator('[data-clip-kind="audio"]').nth(k - 1).waitFor();
      await page.waitForTimeout(800);
      r.states.push({ clips: k, selected: await fader.isEnabled(), ...(await groups()) });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      r.states.push({ clips: k, afterEscape: true, selected: await fader.isEnabled(), ...(await groups()) });
    }
    out.runs.push(r);
    await context.close();
  }
  fs.writeFileSync(__dirname + '/dom-diff.json', JSON.stringify(out, null, 1));
  await browser.close();
})();
