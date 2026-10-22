const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const mode of ['noGesture', 'afterClickAwait']) {
    const ctx = await browser.newContext({ acceptDownloads: true });
    const page = await ctx.newPage();
    const names = [];
    page.on('download', d => names.push(d.suggestedFilename()));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const run = () => page.evaluate(async () => {
      await new Promise(r => setTimeout(r, 1500));
      for (const [n, t] of [['a.wav', 'audio/wav'], ['a.mp3', 'audio/mpeg']]) {
        const url = URL.createObjectURL(new Blob([new Uint8Array(64)], { type: t }));
        const a = document.createElement('a'); a.href = url; a.download = n; document.body.appendChild(a); a.click(); a.remove();
        await new Promise(r => setTimeout(r, 1000));
      }
    });
    if (mode === 'afterClickAwait') {
      await page.evaluate(() => { const b = document.createElement('button'); b.id = 'probe-btn'; b.textContent = 'x'; b.style.cssText = 'position:fixed;top:0;left:0;z-index:99999'; document.body.appendChild(b); });
      const p = run(); await page.mouse.click(5, 5); await p;
    } else { await run(); }
    await page.waitForTimeout(3000);
    out[mode] = names;
    await ctx.close();
  }
  console.log(JSON.stringify(out));
  await browser.close();
})();
