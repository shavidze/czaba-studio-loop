import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, chmodSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [, , APPDIR, MODE] = process.argv;
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-13';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const SAMPLE = REPO + '/tests/fixtures/sample.wav';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function independent(p) {
  const m = await mm.parseFile(p);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  const exif = native.exif ?? [];
  const ff = ffprobe(p);
  return {
    sha256: sha(p),
    ffprobe: ff,
    mmNative: native,
    mmCommonComment: m.common.comment,
    ICAT_ffprobe: ff.ICAT ?? null,
    ICAT_mm: exif.filter(([k]) => k === 'ICAT').map(([, v]) => v),
    ICMT_ffprobe: ff.comment ?? ff.ICMT ?? null,
    ICMT_mm: exif.filter(([k]) => k === 'ICMT').map(([, v]) => v),
  };
}

const result = { appDir: APPDIR, mode: MODE };
const log = (s, extra) => console.log(s, extra ? JSON.stringify(extra) : '');
const work = mkdtempSync(join(tmpdir(), `c-r13-${MODE}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
result.workDir = work;
const P = (n) => join(dir, n);
const TAGGED = ['p1.wav', 'p2.wav', 'r1.wav', 'r2.wav'];
const NAMES = [...TAGGED, 's1.wav'];
for (const n of TAGGED) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', SAMPLE, '-c', 'copy', '-metadata', `comment=old ${n}`, join(work, n)]);
  renameSync(join(work, n), P(n));
}
copyFileSync(SAMPLE, P('s1.wav'));
result.initial = {};
for (const n of NAMES) result.initial[n] = await independent(P(n));

const app = await _electron.launch({ args: ['--no-sandbox', join(APPDIR, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fieldIn = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) }).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const rowTagged = async (n) => (await row(n).getByText('Tagged', { exact: true }).count()) > 0;
const rowsTagged = async () => { const o = {}; for (const n of NAMES) o[n] = await rowTagged(n); return o; };
const shot = (name) => page.screenshot({ path: join(OUT, `${MODE}-${name}.png`) });
const TOAST_RE = /Tags saved|\d+ saved, \d+ failed|Failed to write|Error invoking|Save failed|Unsaved changes were discarded/;
const toastText = async () => { const t = page.getByText(TOAST_RE).first(); await t.waitFor({ timeout: 10000 }); return t.textContent(); };
const waitToastGone = async () => { await page.getByText(TOAST_RE).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}); };
const saveBtn = (re) => page.getByRole('button', { name: re });
const CAT = 'Category (UCS)';
const select2 = async (a, b) => {
  await nameCell(a).click(); await page.waitForTimeout(500);
  await nameCell(b).click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
};

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell(NAMES[0]).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  result.rowsAfterScan = await rowsTagged();
  await shot('1-after-scan');
  log('scan', result.rowsAfterScan);

  await select2('p1.wav', 'p2.wav');
  chmodSync(P('p2.wav'), 0o000);
  await fieldIn(CAT).fill('D22Cat');
  await saveBtn(/Save to 2 files/).click();
  result.toast = await toastText();
  await page.waitForTimeout(800);
  result.formAfter = { value: await fieldIn(CAT).inputValue(), placeholder: await fieldIn(CAT).getAttribute('placeholder') };
  result.saveEnabledAfter = await saveBtn(/Save to 2 files/).isEnabled();
  result.rowsAfterSave = await rowsTagged();
  await shot('2-after-save-p2-chmod000');
  log('save', { toast: result.toast, form: result.formAfter, saveEnabled: result.saveEnabledAfter, rows: result.rowsAfterSave });
  chmodSync(P('p2.wav'), 0o644);
  result.files = { p1: await independent(P('p1.wav')), p2: await independent(P('p2.wav')) };
  result.p2ShaUnchanged = result.files.p2.sha256 === result.initial['p2.wav'].sha256;
  log('files', { p1: [result.files.p1.ICAT_ffprobe, result.files.p1.ICAT_mm, result.files.p1.ICMT_ffprobe, result.files.p1.ICMT_mm], p2: [result.files.p2.ICAT_ffprobe, result.files.p2.ICAT_mm, result.files.p2.ICMT_ffprobe, result.files.p2.ICMT_mm], p2ShaUnchanged: result.p2ShaUnchanged });
  await waitToastGone();

  // sync effect: still dirty → click another file → discard toast
  await nameCell('s1.wav').click();
  result.discardToast = await toastText().catch((e) => `NO TOAST: ${e.message}`);
  await page.waitForTimeout(500);
  await shot('3-after-selection-change');
  log('discard', { toast: result.discardToast });
  await waitToastGone();

  await page.getByText('Rescan', { exact: true }).click();
  await page.waitForTimeout(1500); await nameCell(NAMES[0]).waitFor(); await page.waitForTimeout(800);
  result.rowsAfterRescan = await rowsTagged();
  await shot('4-after-rescan');
  log('rescan', result.rowsAfterRescan);

  if (MODE === 'new') {
    await select2('r1.wav', 'r2.wav');
    await fieldIn(CAT).fill('OKCat');
    await saveBtn(/Save to 2 files/).click();
    result.okToast = await toastText();
    await page.waitForTimeout(800);
    result.okForm = { value: await fieldIn(CAT).inputValue(), placeholder: await fieldIn(CAT).getAttribute('placeholder') };
    result.okRows = await rowsTagged();
    result.okFiles = { r1: await independent(P('r1.wav')), r2: await independent(P('r2.wav')) };
    await shot('5-batch-ok');
    log('batchOk', { toast: result.okToast, form: result.okForm, rows: result.okRows, r1: [result.okFiles.r1.ICAT_ffprobe, result.okFiles.r1.ICAT_mm, result.okFiles.r1.ICMT_ffprobe], r2: [result.okFiles.r2.ICAT_ffprobe, result.okFiles.r2.ICAT_mm, result.okFiles.r2.ICMT_ffprobe] });
    await waitToastGone();

    await nameCell('s1.wav').click(); await page.waitForTimeout(800);
    await fieldIn(CAT).fill('SingleCat');
    await saveBtn(/Save Tags/).click();
    result.singleToast = await toastText();
    await page.waitForTimeout(800);
    result.singleFile = await independent(P('s1.wav'));
    result.singleRowTagged = await rowTagged('s1.wav');
    await shot('6-single-save');
    log('single', { toast: result.singleToast, ICAT: [result.singleFile.ICAT_ffprobe, result.singleFile.ICAT_mm], rowTagged: result.singleRowTagged });
  }
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  await shot('error').catch(() => {});
} finally {
  try { chmodSync(P('p2.wav'), 0o644); } catch {}
  await app.close();
  writeFileSync(join(OUT, `${MODE}-result.json`), JSON.stringify(result, null, 2));
}
