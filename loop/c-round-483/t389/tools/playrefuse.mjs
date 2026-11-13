import { open } from '../lib.mjs';
import fs from 'fs';
const base = process.argv[2];
const out = [];
const status = (p) => p.getByTestId('arrangement-status').textContent().catch(() => null);
const peaks = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-track-meter]')].map((m) => m.getAttribute('data-peak')));
for (const [w, h] of [[1440, 900]]) {
  for (const scenario of ['fresh-hero', 'hero-after-previewME']) {
    const { browser, ctx, page, cdp, live } = await open(base, w, h);
    const r = { vp: `${w}x${h}`, scenario, tries: [] };
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.waitForTimeout(3000);
    if (scenario === 'hero-after-previewME') {
      await page.getByRole('button', { name: 'Preview', exact: true }).first().click();
      await page.waitForFunction(() => window.__starts.length > 0, null, { timeout: 60000 }).catch(() => {});
      await page.getByRole('button', { name: 'Stop', exact: true }).first().click();
      await page.waitForTimeout(500);
    }
    r.liveBefore = (await live()).filter((x) => x > 30);
    await page.getByRole('option', { name: /hero/i }).first().click();
    await page.evaluate(() => { window.__starts.length = 0; });
    const addStart = Date.now();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Space');
    r.msToSpace = Date.now() - addStart;
    await page.waitForTimeout(150);
    r.statusAfterSpace = await status(page);
    r.startsAfterSpace = await page.evaluate(() => window.__starts.map((s) => s.sec));
    r.playBtnAfter = await page.getByRole('button', { name: /^(Play|Stop)$/ }).allTextContents().catch(() => null);
    r.liveAtSpace = await page.evaluate(() => window.__detail().filter((x) => x > 30));
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/t389/out/shots/playrefuse-${w}-${scenario}-1.png` });
    await page.waitForFunction(() => window.__detail().some((x) => Math.abs(x - 150.37) < 0.02), null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    r.startsBeforeSecondSpace = await page.evaluate(() => window.__starts.map((s) => s.sec));
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Space');
    const t = Date.now(); let pk = null;
    for (let i = 0; i < 25; i++) { await page.waitForTimeout(50); pk = await peaks(page); if (pk.some((x) => x && !/-inf|−∞|^-?60/.test(x))) { r.meterMs = Date.now() - t; break; } }
    r.meterPeaks = pk; r.startsAfterSecondSpace = await page.evaluate(() => window.__starts.map((s) => s.sec));
    r.statusAfterSecond = await status(page);
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/t389/out/shots/playrefuse-${w}-${scenario}-2.png` });
    out.push(r); await browser.close();
    console.log(JSON.stringify(r));
  }
}
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/t389/out/playrefuse.json', JSON.stringify(out, null, 1));
