const { _electron } = require(process.argv[2] + "/node_modules/@playwright/test");
(async () => {
  const app = await _electron.launch({ args: [process.argv[2] + "/out/main/index.js", "--no-sandbox"] });
  const page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 1400, height: 900 }).catch(() => {});
  await page.screenshot({ path: process.argv[3] + "/smoke-main.png" });
  const buttons = await page.locator("button").allInnerTexts();
  console.log("title:", await page.title());
  console.log("buttons:", JSON.stringify(buttons));
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
