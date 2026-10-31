const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const src = require('fs').readFileSync(__dirname + '/c292.cjs', 'utf8');
const INIT = eval('(' + src.slice(src.indexOf('const INIT = ') + 13, src.indexOf('const rms =')).trim().replace(/;$/, '') + ')');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(INIT);
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/studio-lab'); await p.getByText('Demo collection ready').first().waitFor({ timeout: 25000 }); await p.waitForTimeout(800);
  await p.getByRole('option', { name: /Bass/ }).first().click(); await p.waitForTimeout(500);
  await p.getByRole('button', { name: /^Preview/ }).first().click(); await p.waitForTimeout(800);
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(800);
  const au = p.locator('[data-testid="studio-narrow-screen"] audio').filter({ visible: true }).first(); const box = await au.boundingBox();
  await p.mouse.click(box.x + 20, box.y + box.height / 2); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ tapRms: Math.max(0, ...window.__rms()), nativePaused: [...document.querySelectorAll('audio')].find((a) => a.getClientRects().length).paused, nativeTime: [...document.querySelectorAll('audio')].find((a) => a.getClientRects().length).currentTime }));
  await p.screenshot({ path: __dirname + '/shots/libpreview-390-native-play-mix.png' });
  console.log(JSON.stringify(r)); require('fs').writeFileSync(__dirname + '/mix-probe.json', JSON.stringify(r)); await b.close();
})();
