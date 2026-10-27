import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2];
const LABEL = process.argv[3];
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-24';
const DELAY = 3000;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), `c-r24-${LABEL}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav', 'c.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { label: LABEL, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) {
  try { const m = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(m.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { common: { title: m.common.title, artist: m.common.artist, artists: m.common.artists }, native }; } catch (e) { return { error: String(e) }; }
}
const readAll = async () => { const R = {}; for (const n of NAMES) { const p = join(dir, n); const f = ffprobe(p); const m = await mmRead(p); R[n] = { ffTitle: f.title, ffICAT: f.ICAT ?? f.icat, mmINAM: m.native?.['exif:INAM'], mmICAT: m.native?.['exif:ICAT'], mmTitle: m.common?.title, ffArtist: f.artist, mmArtist: m.common?.artist, ffAll: f, mmNative: m.native ?? m.error }; } return R; };
result.initialReaders = await readAll();

const app = await _electron.launch({ args: ['--no-sandbox', '-r', join(OUT, 'harness.cjs'), join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R24_WRITE_DELAY_MS: String(DELAY), R24_REJECT_KEY: 'r24note' } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);
let phase = 'scan';
const pageErrors = []; const toastsSeen = [];
page.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const val = async (label) => ((await block(label).count()) ? await fieldIn(label).inputValue() : '<no field>');
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const tagged = async () => { const R = {}; for (const n of NAMES) R[n] = (await nameCell(n).locator('xpath=..').getByText('Tagged', { exact: true }).count()) > 0; return R; };
const shot = (name) => page.screenshot({ path: join(OUT, `r24-5-${LABEL}-${name}.png`) });
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g;
const pollToasts = async () => { const t = await page.locator('body').innerText(); for (const m of t.match(TOAST_RE) ?? []) { const k = `${phase}: ${m}`; if (!toastsSeen.includes(k)) toastsSeen.push(k); } };
const waitToast = async (re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return { text: m[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitGone = async (ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); if (!/(Tags saved|Unsaved changes|Failed)/.test(t)) return; await page.waitForTimeout(150); } };
const saveBtn = () => page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first();
const form = async () => ({ title: await val('Title'), category: await val('Category (UCS)'), r24note: await val('R24note'), saveBtn: (await saveBtn().count()) ? (await saveBtn().textContent())?.trim() : null, saveDisabled: (await saveBtn().count()) ? await saveBtn().isDisabled() : null });
const ipcLog = () => app.evaluate(() => globalThis.__r24log);

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
  result.phases.scanTagged = await tagged();
  await shot('0-scan');

  phase = 'step1';
  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  result.phases.step1 = { before: await form() };
  await fieldIn('Title').fill('R24T');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t1 = await waitToast(/Tags saved/);
  await page.waitForTimeout(500);
  result.phases.step1.toast = t1; result.phases.step1.after = await form();
  await shot('1-title-saved');
  ok('1-ui', t1?.text === 'Tags saved' && result.phases.step1.after.title === 'R24T', result.phases.step1);
  await waitGone();
  result.phases.readersAfter1 = await readAll();

  phase = 'step2';
  await page.getByTitle('Customize Fields').click(); await page.waitForTimeout(400);
  const titleRow = page.locator('div.flex.items-center.gap-1\\.5.rounded', { has: page.locator('span', { hasText: /^Title$/ }) });
  await titleRow.getByTitle('Hide standard field').click(); await page.waitForTimeout(300);
  await shot('2a-title-hidden-editor');
  await page.getByRole('button', { name: /^Done$/ }).click(); await page.waitForTimeout(1500);
  result.phases.step2 = { after: await form() };
  await shot('2b-after-done');
  ok('2-title-hidden', result.phases.step2.after.title === '<no field>', result.phases.step2);

  phase = 'step3';
  await fieldIn('Category (UCS)').fill('R24Delay');
  const tClick = Date.now();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(300);
  await page.getByTitle('Customize Fields').click(); await page.waitForTimeout(300);
  await page.getByRole('button', { name: /^\+ Title$/ }).click(); await page.waitForTimeout(200);
  await shot('3a-mid-save-editor');
  await page.getByRole('button', { name: /^Done$/ }).click();
  const tDone = Date.now();
  const t3 = await waitToast(/Tags saved/);
  await page.waitForTimeout(700);
  result.phases.step3 = { doneMsAfterClick: tDone - tClick, toast: t3, toastMsAfterClick: t3 ? t3.at - tClick : null, after: await form() };
  await shot('3b-after-save');
  await waitGone();
  await nameCell('b.wav').click(); await page.waitForTimeout(600);
  result.phases.step3.bForm = await form();
  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  result.phases.step3.afterBA = await form();
  await shot('3c-after-b-a');
  result.phases.step3.ipc = await ipcLog();
  ok('3-ui', t3?.text === 'Tags saved' && result.phases.step3.after.title === 'R24T' && result.phases.step3.after.category === 'R24Delay' && result.phases.step3.afterBA.title === 'R24T', result.phases.step3);
  result.phases.readersAfter3 = await readAll();

  phase = 'step4';
  result.phases.step4 = { before: await form(), taggedBefore: await tagged() };
  const logLenBefore = (await ipcLog()).length;
  await page.getByTitle('Customize Fields').click(); await page.waitForTimeout(300);
  await page.getByPlaceholder('Field name (e.g. Client)').fill('R24note');
  await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(200);
  await shot('4a-field-added');
  await page.getByRole('button', { name: /^Done$/ }).click();
  const t4 = await waitToast(/Failed to read \d+ files/, 8000);
  await page.waitForTimeout(700);
  result.phases.step4.toast = t4; result.phases.step4.after = await form(); result.phases.step4.taggedAfter = await tagged();
  result.phases.step4.ipc = (await ipcLog()).slice(logLenBefore);
  await shot('4b-after-reject');
  const s4 = result.phases.step4;
  ok('4-ui', t4?.text === 'Failed to read 3 files' && s4.after.title === s4.before.title && s4.after.category === s4.before.category && JSON.stringify(s4.taggedAfter) === JSON.stringify(s4.taggedBefore) && s4.ipc.some((e) => e.rejected), s4);
  await waitGone();

  phase = 'step4b-dirty';
  await fieldIn('Category (UCS)').fill('R24Dirty'); await page.waitForTimeout(200);
  result.phases.step4b = { before: await form() };
  await page.getByTitle('Customize Fields').click(); await page.waitForTimeout(300);
  await page.getByPlaceholder('Field name (e.g. Client)').fill('R24x');
  await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(200);
  await page.getByRole('button', { name: /^Done$/ }).click();
  const t4b = await waitToast(/Failed to read \d+ files/, 8000);
  await page.waitForTimeout(700);
  result.phases.step4b.toast = t4b; result.phases.step4b.after = await form(); result.phases.step4b.tagged = await tagged();
  await shot('4c-dirty-after-reject');
  ok('4b-dirty-kept', result.phases.step4b.after.category === 'R24Dirty' && result.phases.step4b.after.saveDisabled === false, result.phases.step4b);
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
await pollToasts();
await app.close().catch(() => {});
result.pageErrors = pageErrors; result.toastsSeen = toastsSeen;
result.finalReaders = await readAll();
{ const A = result.finalReaders['a.wav']; ok('5-readers-a', A.ffTitle === 'R24T' && A.mmINAM === 'R24T' && A.ffICAT === 'R24Delay' && A.mmICAT === 'R24Delay', { ffTitle: A.ffTitle, mmINAM: A.mmINAM, mmTitle: A.mmTitle, ffICAT: A.ffICAT, mmICAT: A.mmICAT }); }
ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
writeFileSync(join(OUT, `r24-5-${LABEL}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.checks, (k, v) => (k === 'detail' ? undefined : v)));
if (result.error) console.log('ERROR', result.error);
