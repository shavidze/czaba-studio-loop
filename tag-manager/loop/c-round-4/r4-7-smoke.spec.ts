import { _electron as electron, expect, test } from "@playwright/test";
import { copyFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = "/home/runner/czaba-project/czaba-tag-manager";
const evidence = "/home/runner/czaba-project/tmp/tag-manager-loop/c-round-4";

test("R4-7 real-app smoke", async () => {
  const work = mkdtempSync(join(tmpdir(), "c-r4-smoke-"));
  const folder = join(work, "wavs");
  const config = join(work, "xdg");
  mkdirSync(folder);
  mkdirSync(config);
  copyFileSync(join(repo, "tests/fixtures/sample.wav"), join(folder, "sample.wav"));
  const app = await electron.launch({
    args: ["--no-sandbox", join(repo, "out/main/index.js")],
    env: { ...process.env, XDG_CONFIG_HOME: config },
  });
  await app.evaluate(({ dialog }, dir) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [dir] });
  }, folder);
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.getByText("Open Folder").first().click();
  const row = page.getByText("sample.wav").first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.click();
  await expect(page.getByText("Category (UCS)").first()).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: join(evidence, "r4-7-smoke.png") });
  await page.getByText("Category (UCS)").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(evidence, "r4-7-smoke-category.png") });
  await app.close();
});
