import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [, , APPDIR, MODE] = process.argv;
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-12';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const SAMPLE = REPO + '/tests/fixtures/sample.wav';

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  return { common: { title: m.common.title, comment: m.common.comment }, native };
}
const mmInfo = (r, id) => (r.musicMetadata.native.exif ?? []).filter(([k]) => k === id).map(([, v]) => v);
async function independent(p) {
  const r = { sha256: sha(p), ffprobe: ffprobe(p), musicMetadata: await mmRead(p) };
  r.ICAT_ffprobe = r.ffprobe.ICAT ?? r.ffprobe.icat ?? null;
  r.ICAT_mm = mmInfo(r, 'ICAT');
  r.ICMT_ffprobe = r.ffprobe.comment ?? r.ffprobe.ICMT ?? null;
  r.ICMT_mm = mmInfo(r, 'ICMT');
  return r;
}

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
const work = mkdtempSync(join(tmpdir(), `c-r11-${MODE}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
result.workDir = work;
const NAMES = MODE === 'bad' ? ['p1.wav', 'p2.wav'] : ['p1.wav', 'p2.wav', 'q-ok1.wav', 'q-ok2.wav', 'r-single.wav', 's-tpl1.wav', 's-tpl2.wav'];
for (const n of NAMES) copyFileSync(SAMPLE, join(dir, n));
const P = (n) => join(dir, n);
result.initial = {};
for (const n of NAMES) result.initial[n] = await independent(P(n));

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
await app.close();
mkdirSync(join(result.userData, 'templates'), { recursive: true });
if (MODE === 'bad') {
  writeFileSync(join(result.userData, 'schema.json'), JSON.stringify([...STANDARD, { key: 'bad', label: 'Bad', type: 'text', riffChunkId: 'AB' }], null, 2));
} else {
  const now = new Date().toISOString();
  writeFileSync(join(result.userData, 'templates', 'c-r11-tpl.json'), JSON.stringify({ id: 'c-r11-tpl', name: 'C11 Template', description: '', tags: { category: 'TPLCat', comment: 'tpl comment' }, createdAt: now, updatedAt: now }, null, 2));
}
({ app, page } = await launch());

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fieldIn = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) }).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const rowTagged = async (n) => (await row(n).getByText('Tagged', { exact: true }).count()) > 0;
const rescan = async () => { await page.getByText('Rescan', { exact: true }).click(); await page.waitForTimeout(1500); await nameCell(NAMES[0]).waitFor(); await page.waitForTimeout(800); };
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const TOAST_RE = /Tags saved|\d+ saved, \d+ failed|Failed to write|Error invoking|Save failed|Unsaved changes were discarded/;
const toastText = async () => { const t = page.getByText(TOAST_RE).first(); await t.waitFor({ timeout: 10000 }); return t.textContent(); };
const waitToastGone = async () => { await page.getByText(TOAST_RE).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}); };
const saveBtn = (re) => page.getByRole('button', { name: re });
const formState = async (labels) => {
  const o = {};
  for (const l of labels) { const f = fieldIn(l); o[l] = { value: await f.inputValue(), placeholder: await f.getAttribute('placeholder') }; }
  return o;
};
const storeState = () => page.evaluate(() => null);
const select2 = async (a, b) => {
  await nameCell(a).click(); await page.waitForTimeout(500);
  await nameCell(b).click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
};
const openFolder = async () => {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell(NAMES[0]).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
};

try {
  await openFolder();
  if (MODE === 'normal') {
    chmodSync(P('p2.wav'), 0o444);
    await select2('p1.wav', 'p2.wav');
    result.r5BeforeForm = await formState(['Category (UCS)']);
    await fieldIn('Category (UCS)').fill('BATCHCat');
    await shot('r11-5-1-before-save');
    await saveBtn(/Save to 2 files/).click();
    result.r5Toast1 = await toastText();
    await page.waitForTimeout(800);
    result.r5Form1 = await formState(['Category (UCS)']);
    result.r5SaveEnabled1 = await saveBtn(/Save to 2 files/).isEnabled();
    await shot('r11-5-2-after-partial-fail');
    result.r5Files1 = { p1: await independent(P('p1.wav')), p2: await independent(P('p2.wav')) };
    result.r5P2Unchanged = result.r5Files1.p2.sha256 === result.initial['p2.wav'].sha256;
    log('r11-5-first', { toast: result.r5Toast1, form: result.r5Form1, saveEnabled: result.r5SaveEnabled1, p1ICAT: [result.r5Files1.p1.ICAT_ffprobe, result.r5Files1.p1.ICAT_mm], p2Unchanged: result.r5P2Unchanged });
    await waitToastGone();
    chmodSync(P('p2.wav'), 0o644);
    await saveBtn(/Save to 2 files/).click();
    result.r5Toast2 = await toastText();
    await page.waitForTimeout(800);
    result.r5Form2 = await formState(['Category (UCS)']);
    result.r5SaveEnabled2 = await saveBtn(/Save to 2 files/).isEnabled();
    await shot('r11-5-3-after-retry');
    result.r5Files2 = { p1: await independent(P('p1.wav')), p2: await independent(P('p2.wav')) };
    log('r11-5-retry', { toast: result.r5Toast2, form: result.r5Form2, saveEnabled: result.r5SaveEnabled2, p1ICAT: [result.r5Files2.p1.ICAT_ffprobe, result.r5Files2.p1.ICAT_mm], p2ICAT: [result.r5Files2.p2.ICAT_ffprobe, result.r5Files2.p2.ICAT_mm] });
    await waitToastGone();
    await rescan();
    result.r5RowsAfterRescan = { p1: await rowTagged('p1.wav'), p2: await rowTagged('p2.wav'), q1: await rowTagged('q-ok1.wav') };
    await shot('r11-5-4-after-rescan');
    log('r11-5-rescan', result.r5RowsAfterRescan);

    await page.locator('p[title]').locator('xpath=following-sibling::button').first().click();
    await page.waitForTimeout(1000);
    result.r7ivPanelText = (await page.getByText('Select a file to edit metadata').count()) > 0;
    result.r7ivRows = await page.getByText('p1.wav', { exact: true }).count();
    await shot('r11-7-iv-closed');
    log('r11-7-iv', { selectPrompt: result.r7ivPanelText, rowsVisible: result.r7ivRows });

    await openFolder();
    await select2('q-ok1.wav', 'q-ok2.wav');
    await fieldIn('Category (UCS)').fill('OKCat');
    await saveBtn(/Save to 2 files/).click();
    result.r7iToast = await toastText();
    await page.waitForTimeout(800);
    result.r7iForm = await formState(['Category (UCS)']);
    result.r7iSaveEnabled = await saveBtn(/Save to 2 files/).isEnabled();
    await shot('r11-7-i-batch-ok');
    result.r7iFiles = { q1: await independent(P('q-ok1.wav')), q2: await independent(P('q-ok2.wav')) };
    log('r11-7-i', { toast: result.r7iToast, form: result.r7iForm, saveEnabled: result.r7iSaveEnabled, q1: [result.r7iFiles.q1.ICAT_ffprobe, result.r7iFiles.q1.ICAT_mm], q2: [result.r7iFiles.q2.ICAT_ffprobe, result.r7iFiles.q2.ICAT_mm] });
    await waitToastGone();

    await nameCell('r-single.wav').click(); await page.waitForTimeout(800);
    await fieldIn('Category (UCS)').fill('DOORWood');
    await saveBtn(/Save Tags/).click();
    result.r7iiToast = await toastText();
    await page.waitForTimeout(800);
    result.r7iiForm = await formState(['Category (UCS)']);
    result.r7iiFile = await independent(P('r-single.wav'));
    await waitToastGone();
    await rescan();
    result.r7iiTagged = await rowTagged('r-single.wav');
    await shot('r11-7-ii-single');
    log('r11-7-ii', { toast: result.r7iiToast, form: result.r7iiForm, tagged: result.r7iiTagged, icat: [result.r7iiFile.ICAT_ffprobe, result.r7iiFile.ICAT_mm] });

    await select2('s-tpl1.wav', 's-tpl2.wav');
    await page.getByRole('button', { name: 'C11 Template', exact: true }).click();
    await page.waitForTimeout(600);
    result.r7iiiFormAfterApply = await formState(['Category (UCS)', 'Comment']);
    await shot('r11-7-iii-template-applied');
    await saveBtn(/Save to 2 files/).click();
    result.r7iiiToast = await toastText();
    await page.waitForTimeout(800);
    await shot('r11-7-iii-template-saved');
    result.r7iiiFiles = { s1: await independent(P('s-tpl1.wav')), s2: await independent(P('s-tpl2.wav')) };
    log('r11-7-iii', { form: result.r7iiiFormAfterApply, toast: result.r7iiiToast, s1: [result.r7iiiFiles.s1.ICAT_ffprobe, result.r7iiiFiles.s1.ICAT_mm, result.r7iiiFiles.s1.ICMT_ffprobe, result.r7iiiFiles.s1.ICMT_mm], s2: [result.r7iiiFiles.s2.ICAT_ffprobe, result.r7iiiFiles.s2.ICAT_mm, result.r7iiiFiles.s2.ICMT_ffprobe, result.r7iiiFiles.s2.ICMT_mm] });
  } else {
    result.badFieldVisible = (await page.locator('label', { hasText: /^Bad$/ }).count()) > 0;
    await nameCell('p1.wav').click(); await page.waitForTimeout(800);
    result.r6P1OwnForm = await formState(['Title', 'Category (UCS)', 'Comment', 'Bad']);
    await select2('p1.wav', 'p2.wav');
    await fieldIn('Category (UCS)').fill('BATCHCat');
    await fieldIn('Bad').fill('y');
    await shot('r11-6-1-before-save');
    await saveBtn(/Save to 2 files/).click();
    result.r6Toast1 = await toastText();
    await page.waitForTimeout(800);
    result.r6Form1 = await formState(['Category (UCS)', 'Bad']);
    result.r6SaveEnabled1 = await saveBtn(/Save to 2 files/).isEnabled();
    await shot('r11-6-2-after-all-failed');
    result.r6Unchanged = { p1: sha(P('p1.wav')) === result.initial['p1.wav'].sha256, p2: sha(P('p2.wav')) === result.initial['p2.wav'].sha256 };
    log('r11-6-first', { visible: result.badFieldVisible, toast: result.r6Toast1, form: result.r6Form1, saveEnabled: result.r6SaveEnabled1, unchanged: result.r6Unchanged });
    await waitToastGone();
    await nameCell('p2.wav').click();
    result.r6Toast2 = await toastText();
    await page.waitForTimeout(800);
    result.r6Form2 = await formState(['Title', 'Category (UCS)', 'Comment', 'Bad']);
    result.r6P2File = await independent(P('p2.wav'));
    await shot('r11-6-3-after-single-click');
    log('r11-6-discard', { toast: result.r6Toast2, form: result.r6Form2, p1OwnForm: result.r6P1OwnForm, p2ffprobe: result.r6P2File.ffprobe });
  }
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  await shot(`r11-${MODE}-error`).catch(() => {});
} finally {
  writeFileSync(join(OUT, `r11-${MODE}-result.json`), JSON.stringify(result, null, 2));
  await app.close();
}
