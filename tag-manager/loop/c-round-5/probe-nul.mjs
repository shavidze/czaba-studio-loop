import { createRequire } from 'node:module';
const req = createRequire('/home/runner/czaba-project/czaba-tag-manager/package.json');
const { _electron } = req('playwright');
const app = await _electron.launch({ args: ['--no-sandbox', '/home/runner/czaba-project/czaba-tag-manager/out/main/index.js'], env: { ...process.env, XDG_CONFIG_HOME: '/tmp/c-r5-nul/xdg' } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await app.evaluate(({ dialog }) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: ['/tmp/c-r5-nul/wavs'] }); });
await page.waitForTimeout(800);
await page.getByText('Open Folder', { exact: true }).click();
await page.getByText('nul-comment.wav', { exact: true }).waitFor();
await page.waitForTimeout(1500);
for (const n of ['nul-comment.wav', 'nul-title.wav']) {
  const row = page.getByText(n, { exact: true }).first().locator('xpath=../..');
  console.log(n, 'tagged=', await row.getByText('Tagged', { exact: true }).count());
}
await page.getByText('nul-comment.wav', { exact: true }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-5/r5-x-nul-comment.png' });
await app.close();
