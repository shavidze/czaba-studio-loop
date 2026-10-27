import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-18';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), 'c-r18-'));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a-zed.wav', 'b-untagged.wav', 'c-abe.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { workDir: work, phases: {} };
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p);
  return { artist: m.common.artist, artists: m.common.artists, genre: m.common.genre, nativeInfo: (m.native['exif'] ?? m.native['RIFF'] ?? []).map((t) => [t.id, t.value]), nativeKeys: Object.keys(m.native) };
}
const launch = async () => {
  const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.waitForTimeout(800);
  return { app, page };
};
let app; let page; let phase = 'launch1';
const pageErrors = [];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const order = async () => (await page.locator('span.truncate.text-foreground').allTextContents()).filter((t) => t.endsWith('.wav'));
const selected = async () => { const s = {}; for (const n of NAMES) s[n] = /bg-brand\/10/.test(await row(n).getAttribute('class')); return s; };
const header = (l) => page.getByRole('button', { name: l, exact: true });
const clickHeader = async (l) => { await header(l).click(); await page.waitForTimeout(400); return order(); };
const openFolder = async () => {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell(NAMES[0]).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
};
const editAndSave = async (n, artist, genre) => {
  await nameCell(n).click(); await page.waitForTimeout(800);
  const art = fieldIn('Artists'); await art.click(); await art.fill(artist); await art.press('Enter');
  const gen = fieldIn('Genres'); await gen.click(); await gen.fill(genre); await gen.press('Enter');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const toast = page.getByText(/Tags saved|Failed|Error|failed/).first();
  await toast.waitFor({ timeout: 10000 });
  const t = await toast.textContent();
  await page.waitForTimeout(3500);
  return t;
};
const track = (p) => p.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
try {
  ({ app, page } = await launch()); track(page);
  phase = 'scan'; await openFolder();
  result.phases.scanOrder = await order();
  phase = 'edit';
  result.phases.toastA = await editAndSave('a-zed.wav', 'R18 Zed', 'R18 Rock');
  result.phases.toastC = await editAndSave('c-abe.wav', 'R18 Abe', 'R18 Ambient');
  await shot('r18-5-1-after-saves');
  phase = 'artist';
  result.phases.artistAsc = await clickHeader('Artist'); await shot('r18-5-2a-artist-asc');
  result.phases.artistDesc = await clickHeader('Artist'); await shot('r18-5-2b-artist-desc');
  phase = 'genre';
  result.phases.genreAsc = await clickHeader('Genre'); await shot('r18-5-3-genre-asc');
  phase = 'range';
  result.phases.artistAscAgain = await clickHeader('Artist');
  const o = result.phases.artistAscAgain;
  await nameCell(o[0]).click(); await page.waitForTimeout(300);
  await nameCell(o[1]).click({ modifiers: ['Shift'] }); await page.waitForTimeout(500);
  result.phases.rangeSelected = await selected();
  result.phases.rangePanelText = (await page.getByText(/files? selected|selected/i).allTextContents()).slice(0, 3);
  await shot('r18-5-4-shift-range');
  phase = 'others';
  result.phases.others = {};
  for (const l of ['Name', 'Size', 'BPM', 'Date']) { result.phases.others[l] = await clickHeader(l); }
  await shot('r18-5-5-other-headers');
  phase = 'readers';
  result.phases.readers = {};
  for (const n of ['a-zed.wav', 'c-abe.wav', 'b-untagged.wav']) { const p = join(dir, n); result.phases.readers[n] = { ffprobe: ffprobe(p), mm: await mmRead(p) }; }
  await app.close(); app = null;
  phase = 'relaunch';
  ({ app, page } = await launch()); track(page);
  await openFolder();
  result.phases.relaunchScan = await order();
  result.phases.relaunchArtistAsc = await clickHeader('Artist'); await shot('r18-5-7-relaunch-artist-asc');
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`; console.error(e);
  if (page) await shot('r18-5-error').catch(() => {});
} finally {
  result.pageErrors = pageErrors;
  writeFileSync(join(OUT, 'r18-5-result.json'), JSON.stringify(result, null, 2));
  if (app) await app.close();
}
