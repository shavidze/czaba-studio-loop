import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-17';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), 'c-r17-'));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a-target.wav', 'b-untagged.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const TARGET = join(dir, 'a-target.wav');
const result = { workDir: work };

const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  return { common: { artist: m.common.artist, artists: m.common.artists, genre: m.common.genre, title: m.common.title }, native };
}
const strings = (s) => readFileSync(s).toString('latin1').match(/(ISTR|IART|IGNR|ICAT)[\s\S]{4}[^\0]*/g);

const launch = async () => {
  const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.waitForTimeout(800);
  return { app, page };
};

let app; let page;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const rowInfo = async (n) => {
  const r = row(n);
  const cells = await r.locator(':scope > *').allTextContents();
  return { tagged: (await r.getByText('Tagged', { exact: true }).count()) > 0, cells };
};
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const openFolder = async () => {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell(NAMES[0]).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
};
const pageErrors = [];

try {
  result.before = { ffprobe: ffprobe(TARGET), mm: await mmRead(TARGET) };
  ({ app, page } = await launch());
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await openFolder();
  result.step1 = { target: await rowInfo('a-target.wav'), other: await rowInfo('b-untagged.wav') };
  await shot('r17-5-1-untagged');
  console.log('step1', JSON.stringify(result.step1));

  await nameCell('a-target.wav').click(); await page.waitForTimeout(800);
  const art = fieldIn('Artists');
  await art.click(); await art.fill('R17 Artist A'); await art.press('Enter');
  await art.fill('R17 Artist B'); await art.press('Enter');
  const gen = fieldIn('Genres');
  await gen.click(); await gen.fill('R17Genre'); await gen.press('Enter');
  await fieldIn('Category (UCS)').fill('R17Cat');
  result.chips = { artists: await block('Artists').locator('span.inline-flex').allTextContents(), genres: await block('Genres').locator('span.inline-flex').allTextContents() };
  await shot('r17-5-2-before-save');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const toast = page.getByText(/Tags saved|Failed|Error|failed/).first();
  await toast.waitFor({ timeout: 10000 });
  result.toast = await toast.textContent();
  await page.waitForTimeout(1200);
  result.step3 = { target: await rowInfo('a-target.wav'), other: await rowInfo('b-untagged.wav') };
  await shot('r17-5-3-after-save');
  console.log('step3', result.toast, JSON.stringify(result.step3));

  result.after = { ffprobe: ffprobe(TARGET), mm: await mmRead(TARGET), rawChunks: strings(TARGET) };
  console.log('readers', JSON.stringify(result.after));
  await app.close(); app = null;

  ({ app, page } = await launch());
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await openFolder();
  result.step5 = { target: await rowInfo('a-target.wav'), other: await rowInfo('b-untagged.wav') };
  await nameCell('a-target.wav').click(); await page.waitForTimeout(800);
  result.step5chips = { artists: await block('Artists').locator('span.inline-flex').allTextContents(), genres: await block('Genres').locator('span.inline-flex').allTextContents(), category: await fieldIn('Category (UCS)').inputValue() };
  await shot('r17-5-5-relaunch');
  console.log('step5', JSON.stringify(result.step5), JSON.stringify(result.step5chips));
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  if (page) await shot('r17-5-error').catch(() => {});
} finally {
  result.pageErrors = pageErrors;
  writeFileSync(join(OUT, 'r17-5-result.json'), JSON.stringify(result, null, 2));
  if (app) await app.close();
}
