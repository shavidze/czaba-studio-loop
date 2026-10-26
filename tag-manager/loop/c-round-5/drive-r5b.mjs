import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = process.env.REPO || '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-5';
const PREFIX = process.env.PREFIX || 'r5';
const req = createRequire(join('/home/runner/czaba-project/czaba-tag-manager', 'package.json'));
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

function infoDump(p) {
  const buf = readFileSync(p);
  let off = 12;
  const res = [];
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'LIST' && buf.toString('ascii', off + 8, off + 12) === 'INFO') {
      let s = off + 12;
      while (s + 8 <= off + 8 + size) {
        const sid = buf.toString('ascii', s, s + 4);
        const ssz = buf.readUInt32LE(s + 4);
        res.push({ id: sid, size: ssz, utf8: buf.subarray(s + 8, s + 8 + ssz).toString('utf8').replace(/\0+$/, '') });
        s += 8 + ssz + (ssz % 2);
      }
    }
    off += 8 + size + (size % 2);
  }
  return res;
}
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  return { common: { title: m.common.title, artist: m.common.artist, artists: m.common.artists, comment: m.common.comment }, native };
}
async function independent(p) { return { ffprobe: ffprobe(p), musicMetadata: await mmRead(p), riffInfo: infoDump(p) }; }

const result = { steps: [] };
const log = (s, extra) => { result.steps.push(extra ? { s, ...extra } : { s }); console.log(s, extra ? JSON.stringify(extra) : ''); };
const work = mkdtempSync(join(tmpdir(), 'c-r5-'));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const sample = join('/home/runner/czaba-project/czaba-tag-manager', 'tests/fixtures/sample.wav');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', sample, '-metadata', 'comment=მძიმე კარი', '-c', 'copy', join(dir, 'comment-only.wav')]);
for (const n of ['contract.wav', 'blank.wav', 'title-only.wav', 'two-artists.wav', 'untouched.wav']) copyFileSync(sample, join(dir, n));
result.workDir = work;
result.before = { 'comment-only.wav': await independent(join(dir, 'comment-only.wav')), 'untouched.wav': await independent(join(dir, 'untouched.wav')) };

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);
const fieldIn = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) }).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const rowTagged = async (n) => (await row(n).getByText('Tagged', { exact: true }).count()) > 0;
const rowText = async (n) => (await row(n).innerText()).replace(/\s+/g, ' | ');
const allRows = async () => { const o = {}; for (const n of ['comment-only.wav', 'contract.wav', 'blank.wav', 'title-only.wav', 'two-artists.wav', 'untouched.wav']) o[n] = { tagged: await rowTagged(n), text: await rowText(n) }; return o; };
const rescan = async () => { await page.getByText('Rescan', { exact: true }).click(); await page.waitForTimeout(1500); await nameCell('contract.wav').waitFor(); await page.waitForTimeout(800); };
async function save() {
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.getByText('Tags saved').first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(2800);
}
const shot = (name) => page.screenshot({ path: join(OUT, `${PREFIX}-${name}.png`) });

try {
  await page.getByText('Open Folder', { exact: true }).click();
  await nameCell('contract.wav').waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  result.open = await allRows();
  log('open', result.open);
  await shot('0-open');
  if (process.env.ONLY_OPEN) throw new Error('ONLY_OPEN');

  await nameCell('comment-only.wav').click();
  await page.waitForTimeout(700);
  result.commentOnlyPanel = { panelOpen: await fieldIn('Comment').isVisible(), comment: await fieldIn('Comment').inputValue(), title: await fieldIn('Title').inputValue() };
  log('comment-only panel', result.commentOnlyPanel);
  await shot('4-comment-only-tagged');

  await nameCell('contract.wav').click();
  await page.waitForTimeout(700);
  await fieldIn('Category (UCS)').fill('DOORWood');
  await save();
  result.contractAfterSave = await independent(join(dir, 'contract.wav'));

  await nameCell('blank.wav').click();
  await page.waitForTimeout(700);
  await fieldIn('Category (UCS)').fill('x');
  await save();
  result.blankAfterFirst = await independent(join(dir, 'blank.wav'));
  await rescan();
  result.afterFirstBlankSave = await allRows();
  log('after blank first save + rescan', result.afterFirstBlankSave);
  await nameCell('blank.wav').click();
  await page.waitForTimeout(700);
  await shot('5-x-tagged');
  result.blankPanelBeforeClear = await fieldIn('Category (UCS)').inputValue();
  await fieldIn('Category (UCS)').fill('');
  await page.waitForTimeout(300);
  result.saveEnabledAfterClear = await page.getByRole('button', { name: /Save Tags/ }).isEnabled();
  await save();
  result.blankAfterSecond = await independent(join(dir, 'blank.wav'));

  await nameCell('title-only.wav').click();
  await page.waitForTimeout(700);
  await fieldIn('Title').fill('X');
  await save();
  result.titleAfterSave = await independent(join(dir, 'title-only.wav'));

  await nameCell('two-artists.wav').click();
  await page.waitForTimeout(700);
  await fieldIn('Artists').click();
  await page.keyboard.type('A');
  await page.keyboard.press('Enter');
  await page.keyboard.type('B');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await save();
  result.twoArtistsAfterSave = await independent(join(dir, 'two-artists.wav'));

  await rescan();
  result.final = await allRows();
  log('final after rescan', result.final);
  await nameCell('contract.wav').click();
  await page.waitForTimeout(700);
  result.contractPanel = { category: await fieldIn('Category (UCS)').inputValue() };
  await shot('4-contract-tagged');
  await nameCell('blank.wav').click();
  await page.waitForTimeout(700);
  result.blankPanel = { category: await fieldIn('Category (UCS)').inputValue() };
  await shot('5-blank-untagged');
  await nameCell('title-only.wav').click();
  await page.waitForTimeout(700);
  await shot('6-title-only-tagged');
  await nameCell('two-artists.wav').click();
  await page.waitForTimeout(700);
  result.twoArtistsPanel = await page.locator('div.space-y-1', { has: page.locator('label', { hasText: /^Artists$/ }) }).innerText();
  await shot('6-two-artists');
  await page.getByText('Artist', { exact: true }).first().click();
  await page.waitForTimeout(700);
  result.afterArtistSort = await allRows();
  result.orderAfterArtistSort = await page.evaluate(() => [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /\.wav$/.test(e.textContent ?? '')).map((e) => e.textContent));
  log('after artist sort', { order: result.orderAfterArtistSort });
  await shot('6-artist-sort');
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  await shot('error').catch(() => {});
} finally {
  writeFileSync(join(OUT, `${PREFIX}-result.json`), JSON.stringify(result, null, 2));
  await app.close();
}
