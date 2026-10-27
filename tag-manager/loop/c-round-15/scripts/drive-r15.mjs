// usage: node drive-r15.mjs <scenario> <repoRootForOut> <label>
// scenarios: batch-inject | single-inject | batch | single | batch-chmod
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const [scenario, appRoot, label] = process.argv.slice(2);
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-15';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const batch = scenario.startsWith('batch');
const inject = scenario.endsWith('-inject');
const value = process.env.VALUE || (batch ? 'R15Batch' : 'R15Single');
const work = mkdtempSync(join(tmpdir(), `c-r15-${label}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const names = batch ? ['a.wav', 'b.wav'] : ['a.wav'];
for (const n of names) copyFileSync(process.env.SEED_DIR ? join(process.env.SEED_DIR, n) : REPO + '/tests/fixtures/sample.wav', join(dir, n));
const r = { scenario, appRoot, label, work, value, steps: [] };

const INJECT_CHANNEL = batch ? 'meta:read-batch' : 'meta:read';

async function launch() {
  const app = await _electron.launch({ args: ['--no-sandbox', join(appRoot, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    window.__toasts = [];
    let last = '';
    const rec = () => {
      const el = document.querySelector('div.fixed.bottom-20 span.text-sm');
      const t = el ? el.textContent : '';
      const cls = el ? el.parentElement.className : '';
      if (t && t !== last) window.__toasts.push({ t, error: cls.includes('text-destructive'), success: cls.includes('text-positive') });
      last = t;
    };
    new MutationObserver(rec).observe(document.body, { subtree: true, childList: true, characterData: true });
  });
  await page.getByText('Open Folder', { exact: true }).first().click();
  for (const n of names) await page.getByText(n, { exact: true }).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  return { app, page };
}

const catInput = (page) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: /^Category \(UCS\)$/ }) }).locator('input').first();
async function rowState(page) {
  const out = {};
  for (const n of names) {
    const row = page.getByText(n, { exact: true }).first().locator('xpath=../..');
    out[n] = { tagged: (await row.getByText('Tagged', { exact: true }).count()) > 0, text: (await row.innerText()).replace(/\s+/g, ' ') };
  }
  return out;
}
async function select(page) {
  await page.getByText(names[0], { exact: true }).first().click();
  if (batch) await page.getByText(names[1], { exact: true }).first().click({ modifiers: ['Control'] });
  await page.waitForTimeout(600);
}
const saveBtn = (page) => page.getByRole('button', { name: batch ? `Save to ${names.length} files` : 'Save Tags' }).first();

let app, page;
try {
  ({ app, page } = await launch());
  r.rowsBefore = await rowState(page);
  if (inject) {
    const snippet = `({ ipcMain }, ch) => { ipcMain.removeHandler(ch); ipcMain.handle(ch, () => { throw new Error('R15 injected'); }); }`;
    r.injection = { channel: INJECT_CHANNEL, snippet };
    await app.evaluate(({ ipcMain }, ch) => { ipcMain.removeHandler(ch); ipcMain.handle(ch, () => { throw new Error('R15 injected'); }); }, INJECT_CHANNEL);
  }
  await select(page);
  if (scenario === 'batch-chmod') { chmodSync(join(dir, 'b.wav'), 0o000); r.chmod = 'b.wav 000'; }
  const input = catInput(page);
  await input.click(); await input.fill(value); await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `r15-${label}-1-before-save.png`) });
  r.saveEnabledBefore = await saveBtn(page).isEnabled();
  await saveBtn(page).click();
  await page.waitForFunction(() => window.__toasts.length > 0, null, { timeout: 10000 });
  await page.waitForTimeout(1200);
  r.toasts = await page.evaluate(() => window.__toasts);
  await page.screenshot({ path: join(OUT, `r15-${label}-2-after-save.png`) });
  r.rowsAfter = await rowState(page);
  r.inputAfter = await catInput(page).inputValue();
  r.saveEnabledAfter = await saveBtn(page).isEnabled().catch((e) => `ERR ${e}`);
  r.saveBtnText = await page.locator('button', { hasText: /Save|Saving/ }).last().innerText().catch(() => null);
  await app.close();
  if (scenario === 'batch-chmod') chmodSync(join(dir, 'b.wav'), 0o644);

  r.files = {};
  for (const n of names) {
    const f = join(dir, n);
    const ff = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', f]).toString()).format?.tags ?? {};
    const m = await mm.parseFile(f);
    const icatMM = (m.native.exif ?? []).filter((x) => x.id === 'ICAT').map((x) => x.value);
    r.files[n] = { ffprobe: ff, ICAT_ffprobe: ff.ICAT ?? null, ICAT_mm: icatMM };
  }

  if (inject) {
    ({ app, page } = await launch());
    r.relaunchRows = await rowState(page);
    r.relaunchForm = {};
    for (const n of names) {
      await page.getByText(n, { exact: true }).first().click();
      await page.waitForTimeout(600);
      r.relaunchForm[n] = await catInput(page).inputValue();
    }
    await page.screenshot({ path: join(OUT, `r15-${label}-3-relaunch.png`) });
    r.relaunchToasts = await page.evaluate(() => window.__toasts);
    await app.close();
  }
} catch (e) {
  r.error = String(e);
  try { await page.screenshot({ path: join(OUT, `r15-${label}-error.png`) }); } catch {}
  try { await app.close(); } catch {}
}
writeFileSync(join(OUT, `r15-${label}-result.json`), JSON.stringify(r, null, 2));
console.log(JSON.stringify(r, null, 2));
