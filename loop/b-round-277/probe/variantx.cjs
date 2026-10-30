const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [n, u] of [['head', 'http://127.0.0.1:5173/studio-lab'], ['sketch', 'http://127.0.0.1:5174/studio-lab']]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(u); await p.getByText('Demo collection ready').first().waitFor({ timeout: 300000 }); await p.waitForTimeout(1200);
    const st = () => p.getByTestId('arrangement-status').textContent();
    const tempo = p.getByTestId('arrangement-tempo-input'); const m = p.getByTestId('arrangement-metronome-toggle');
    const r = { before: await st() };
    await tempo.click(); await tempo.fill('120');
    const mb = await m.boundingBox(); await p.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await p.waitForTimeout(800);
    r.after = await st(); r.pressed = await m.getAttribute('aria-pressed'); r.tempo = await tempo.inputValue();
    // invalid draft case
    await p.reload(); await p.getByText('Demo collection ready').first().waitFor({ timeout: 300000 }); await p.waitForTimeout(1200);
    await tempo.click(); await tempo.fill('abc');
    const mb2 = await m.boundingBox(); await p.mouse.click(mb2.x + mb2.width / 2, mb2.y + mb2.height / 2); await p.waitForTimeout(800);
    r.invalid = { status: await st(), pressed: await m.getAttribute('aria-pressed'), disabledAttr: await m.evaluate((x) => [x.disabled, x.getAttribute('aria-disabled')]), tempo: await tempo.inputValue(), active: await p.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName) };
    out[n] = r; await p.close();
  }
  await b.close(); require('fs').writeFileSync(__dirname + '/variantx.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
})();
