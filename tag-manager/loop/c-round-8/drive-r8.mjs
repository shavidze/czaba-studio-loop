import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [, , APPDIR, MODE, TAG] = process.argv;
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-8';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const SAMPLE = REPO + '/tests/fixtures/sample.wav';

function infoDump(p) {
  const buf = readFileSync(p); let off = 12; const res = [];
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4); const size = buf.readUInt32LE(off + 4);
    if (id === 'LIST' && buf.toString('ascii', off + 8, off + 12) === 'INFO') {
      let s = off + 12;
      while (s + 8 <= off + 8 + size) {
        const sid = buf.toString('latin1', s, s + 4); const ssz = buf.readUInt32LE(s + 4);
        const pl = buf.subarray(s + 8, s + 8 + ssz);
        res.push({ id: sid, size: ssz, hex: pl.toString('hex'), hasNul: pl.includes(0), text: pl.toString('latin1') });
        s += 8 + ssz + (ssz % 2);
      }
    }
    off += 8 + size + (size % 2);
  }
  return res;
}
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p); const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  return { common: { title: m.common.title, comment: m.common.comment }, native };
}
async function independent(p) { return { sha256: sha(p), ffprobe: ffprobe(p), musicMetadata: await mmRead(p), riffInfo: infoDump(p) }; }

const STANDARD = [
  { key: 'title', label: 'Title', type: 'text', riffChunkId: 'INAM', standard: true },
  { key: 'artists', label: 'Artists', type: 'tags', riffChunkId: 'IART', standard: true },
  { key: 'album', label: 'Album / Pack', type: 'text', riffChunkId: 'IPRD', standard: true },
  { key: 'genres', label: 'Genres', type: 'tags', riffChunkId: 'IGNR', standard: true },
  { key: 'bpm', label: 'BPM', type: 'number', riffChunkId: 'IBPM', standard: true },
  { key: 'year', label: 'Year', type: 'number', riffChunkId: 'ICRD', standard: true },
  { key: 'copyright', label: 'Copyright', type: 'text', riffChunkId: 'ICOP', standard: true },
  { key: 'publisher', label: 'Publisher', type: 'text', standard: true },
  { key: 'isrc', label: 'ISRC', type: 'text', standard: true },
  { key: 'track', label: 'Track #', type: 'number', riffChunkId: 'ITRK', standard: true },
  { key: 'comment', label: 'Comment', type: 'text', riffChunkId: 'ICMT', standard: true },
  { key: 'keywords', label: 'Keywords', type: 'text', riffChunkId: 'IKEY', standard: true },
  { key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true },
];

const result = { appDir: APPDIR, mode: MODE, steps: [] };
const log = (s, extra) => { result.steps.push(extra ? { s, ...extra } : { s }); console.log(s, extra ? JSON.stringify(extra) : ''); };
const work = mkdtempSync(join(tmpdir(), `c-r8-${TAG}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
result.workDir = work;
const NAMES = MODE === 'bad' ? ['a-single.wav', 'b-batch1.wav', 'b-batch2.wav', 'c-batch1.wav', 'c-batch2.wav'] : ['n-single.wav'];
for (const n of NAMES) copyFileSync(SAMPLE, join(dir, n));
result.initial = {};
for (const n of NAMES) result.initial[n] = await independent(join(dir, n));
const P = (n) => join(dir, n);

const launch = async () => {
  const app = await _electron.launch({ args: ['--no-sandbox', join(APPDIR, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.waitForTimeout(800);
  return { app, page };
};

let { app, page } = await launch();
result.userData = await app.evaluate(({ app }) => app.getPath('userData'));
log('userData', { userData: result.userData });
if (MODE === 'bad') {
  await app.close();
  mkdirSync(result.userData, { recursive: true });
  writeFileSync(join(result.userData, 'schema.json'), JSON.stringify([...STANDARD, { key: 'bad', label: 'Bad', type: 'text', riffChunkId: 'AB' }], null, 2));
  result.schemaWritten = join(result.userData, 'schema.json');
  ({ app, page } = await launch());
} else {
  result.schemaExists = existsSync(join(result.userData, 'schema.json'));
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fieldIn = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) }).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const rowTagged = async (n) => (await row(n).getByText('Tagged', { exact: true }).count()) > 0;
const allRows = async () => { const o = {}; for (const n of NAMES) o[n] = await rowTagged(n); return o; };
const rescan = async () => { await page.getByText('Rescan', { exact: true }).click(); await page.waitForTimeout(1500); await nameCell(NAMES[0]).waitFor(); await page.waitForTimeout(800); };
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const TOAST_RE = /Tags saved|\d+ saved, \d+ failed|Failed to write|Error invoking|could not be written|Save failed/;
const toastText = async () => { const t = page.getByText(TOAST_RE).first(); await t.waitFor({ timeout: 10000 }); return t.textContent(); };
const waitToastGone = async () => { await page.getByText(TOAST_RE).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}); };

try {
  await page.getByText('Open Folder', { exact: true }).click();
  await nameCell(NAMES[0]).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  result.openRows = await allRows();
  log('open', result.openRows);

  if (MODE === 'bad') {
    // R8-4
    await nameCell('a-single.wav').click(); await page.waitForTimeout(800);
    result.badFieldVisible = (await page.locator('label', { hasText: /^Bad$/ }).count()) > 0;
    result.badFieldInitial = await fieldIn('Bad').inputValue();
    await fieldIn('Category (UCS)').fill('DOORWood');
    await fieldIn('Bad').fill('x');
    await shot(`r8-4-${TAG}-before-save`);
    await page.getByRole('button', { name: /Save Tags/ }).click();
    result.r84Toast = await toastText();
    await shot(`r8-4-${TAG}-toast`);
    await page.waitForTimeout(1000);
    result.r84File = await independent(P('a-single.wav'));
    result.r84Unchanged = result.r84File.sha256 === result.initial['a-single.wav'].sha256;
    log('r8-4', { visible: result.badFieldVisible, initial: result.badFieldInitial, toast: result.r84Toast, unchanged: result.r84Unchanged, info: result.r84File.riffInfo });
    await waitToastGone();
    await rescan();
    result.r84RowTaggedAfterRescan = await rowTagged('a-single.wav');
    await shot(`r8-4-${TAG}-after-rescan`);
    log('r8-4-rescan', { tagged: result.r84RowTaggedAfterRescan });

    // R8-5 (i)
    await nameCell('b-batch1.wav').click(); await page.waitForTimeout(500);
    await nameCell('b-batch2.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
    await fieldIn('Category (UCS)').fill('BATCHCat');
    await shot(`r8-5-${TAG}-i-before-save`);
    await page.getByRole('button', { name: /Save to 2 files/ }).click();
    result.r85iToast = await toastText();
    await shot(`r8-5-${TAG}-i-toast`);
    await page.waitForTimeout(1000);
    result.r85iFiles = { b1: await independent(P('b-batch1.wav')), b2: await independent(P('b-batch2.wav')) };
    log('r8-5-i', { toast: result.r85iToast, files: result.r85iFiles });
    await waitToastGone();

    // R8-5 (ii)
    await nameCell('c-batch1.wav').click(); await page.waitForTimeout(500);
    await nameCell('c-batch2.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
    await fieldIn('Category (UCS)').fill('BATCHCat');
    await fieldIn('Bad').fill('y');
    await shot(`r8-5-${TAG}-ii-before-save`);
    await page.getByRole('button', { name: /Save to 2 files/ }).click();
    result.r85iiToast = await toastText();
    await shot(`r8-5-${TAG}-ii-toast`);
    await page.waitForTimeout(1000);
    result.r85iiFiles = { c1: await independent(P('c-batch1.wav')), c2: await independent(P('c-batch2.wav')) };
    result.r85iiUnchanged = { c1: result.r85iiFiles.c1.sha256 === result.initial['c-batch1.wav'].sha256, c2: result.r85iiFiles.c2.sha256 === result.initial['c-batch2.wav'].sha256 };
    log('r8-5-ii', { toast: result.r85iiToast, unchanged: result.r85iiUnchanged, files: result.r85iiFiles });
    await waitToastGone();
    await rescan();
    result.finalRows = await allRows();
    log('final-rows', result.finalRows);
    await shot(`r8-5-${TAG}-final-rows`);
  } else {
    await nameCell('n-single.wav').click(); await page.waitForTimeout(800);
    await fieldIn('Category (UCS)').fill('DOORWood');
    await fieldIn('Keywords').fill('door, slam');
    await fieldIn('Comment').fill('heavy door');
    await shot(`r8-6-${TAG}-before-save`);
    await page.getByRole('button', { name: /Save Tags/ }).click();
    result.r86Toast = await toastText();
    await shot(`r8-6-${TAG}-toast`);
    await page.waitForTimeout(1000);
    result.r86File = await independent(P('n-single.wav'));
    await waitToastGone();
    await rescan();
    result.r86RowTagged = await rowTagged('n-single.wav');
    await nameCell('n-single.wav').click(); await page.waitForTimeout(800);
    result.r86Panel = { category: await fieldIn('Category (UCS)').inputValue(), keywords: await fieldIn('Keywords').inputValue(), comment: await fieldIn('Comment').inputValue() };
    await shot(`r8-6-${TAG}-after-rescan`);
    log('r8-6', { toast: result.r86Toast, tagged: result.r86RowTagged, panel: result.r86Panel, file: result.r86File });
  }
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  await shot(`r8-${TAG}-error`).catch(() => {});
} finally {
  writeFileSync(join(OUT, `r8-${TAG}-result.json`), JSON.stringify(result, null, 2));
  await app.close();
}
