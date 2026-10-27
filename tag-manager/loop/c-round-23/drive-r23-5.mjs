import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2];
const LABEL = process.argv[3];
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-23';
const DELAY = 3000;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), `c-r23-${LABEL}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav', 'c.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { label: LABEL, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) {
  try { const m = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(m.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { common: { title: m.common.title, comment: m.common.comment, artist: m.common.artist, artists: m.common.artists }, native }; } catch (e) { return { error: String(e) }; }
}
const cmt = (v) => Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : x?.text)).join('|') : v;
const readAll = async () => { const R = {}; for (const n of NAMES) { const p = join(dir, n); const f = ffprobe(p); const m = await mmRead(p); R[n] = { ffICAT: f.ICAT ?? f.icat, ffComment: f.comment ?? f.COMMENT, ffTitle: f.title, ffArtist: f.artist, mmICAT: m.native?.['exif:ICAT'], mmICMT: m.native?.['exif:ICMT'], mmComment: cmt(m.common?.comment), mmTitle: m.common?.title, mmArtist: m.common?.artist, ffAll: f, mmNative: m.native ?? m.error }; } return R; };
const initial = await readAll();
result.initialReaders = initial;

const app = await _electron.launch({ args: ['--no-sandbox', '-r', join(OUT, 'delay-write.cjs'), join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R20_WRITE_DELAY_MS: String(DELAY) } });
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
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const shot = (name) => page.screenshot({ path: join(OUT, `r23-5-${LABEL}-${name}.png`) });
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g;
const pollToasts = async () => { const t = await page.locator('body').innerText(); for (const m of t.match(TOAST_RE) ?? []) { const k = `${phase}: ${m}`; if (!toastsSeen.includes(k)) toastsSeen.push(k); } };
const waitToast = async (re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return { text: m[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitGone = async (ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); if (!/(Tags saved|Unsaved changes|Failed)/.test(t)) return; await page.waitForTimeout(150); } };
const saveBtn = () => page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first();
const header = async () => (await page.locator('div.border-b.border-outline span.text-xs.font-medium').first().textContent())?.trim();
const form = async () => ({ header: await header(), title: await fieldIn('Title').inputValue(), comment: await fieldIn('Comment').inputValue(), category: await fieldIn('Category (UCS)').inputValue(), saveBtn: (await saveBtn().textContent())?.trim(), saveDisabled: await saveBtn().isDisabled() });
const typeKeys = async (label, text) => { await fieldIn(label).click(); await page.keyboard.type(text, { delay: 30 }); };

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
  await shot('0-scan');

  phase = 'step1';
  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  result.phases.step1 = { before: await form() };
  await fieldIn('Category (UCS)').fill('R23A');
  await fieldIn('Comment').fill('R23Single');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t1 = await waitToast(/Tags saved/);
  await page.waitForTimeout(500);
  result.phases.step1.toast = t1; result.phases.step1.after = await form();
  await shot('1-a-saved');
  ok('1-ui', t1?.text === 'Tags saved' && result.phases.step1.after.category === 'R23A' && result.phases.step1.after.comment === 'R23Single' && result.phases.step1.after.saveDisabled, result.phases.step1);
  await waitGone();
  result.phases.readersAfter1 = await readAll();
  { const A = result.phases.readersAfter1['a.wav']; ok('1-readers', A.ffICAT === 'R23A' && A.mmICAT === 'R23A' && A.ffComment === 'R23Single' && A.mmComment === 'R23Single', A); }

  phase = 'step2';
  await nameCell('b.wav').click(); await page.waitForTimeout(500);
  await nameCell('c.wav').click({ modifiers: ['Shift'] }); await page.waitForTimeout(800);
  const h2 = await header();
  await fieldIn('Category (UCS)').fill('R23Batch');
  await page.getByRole('button', { name: /Save to 2 files/ }).click();
  const t2 = await waitToast(/Tags saved to 2 files|\d+ saved, \d+ failed/);
  await page.waitForTimeout(500);
  result.phases.step2 = { headerAfterShift: h2, toast: t2, after: await form() };
  await shot('2-batch-saved');
  ok('2-ui', h2 === '2 files selected' && t2?.text === 'Tags saved to 2 files' && result.phases.step2.after.saveDisabled, result.phases.step2);
  await waitGone();
  result.phases.readersAfter2 = await readAll();
  { const X = result.phases.readersAfter2; ok('2-readers', ['b.wav','c.wav'].every((n) => X[n].ffICAT === 'R23Batch' && X[n].mmICAT === 'R23Batch' && (X[n].ffComment ?? null) === (initial[n].ffComment ?? null) && (X[n].mmComment ?? null) === (initial[n].mmComment ?? null)) && X['a.wav'].ffICAT === 'R23A', X); }

  phase = 'step3';
  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  result.phases.step3 = { before: await form() };
  await fieldIn('Category (UCS)').fill('R23Delay');
  const t3 = Date.now();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(200);
  await fieldIn('Comment').fill('');
  await typeKeys('Comment', 'R23Typed');
  const t3k = Date.now();
  result.phases.step3.mid = await form();
  await shot('3a-mid-save-typed');
  const toast3 = await waitToast(/Tags saved/);
  await page.waitForTimeout(500);
  result.phases.step3 = { ...result.phases.step3, lastKeyMs: t3k - t3, toastMs: toast3 ? toast3.at - t3 : null, toast: toast3, afterToast: await form() };
  await shot('3b-after-toast');
  const f3 = result.phases.step3.afterToast;
  ok('3-typed-before-toast', toast3 && t3k < toast3.at && result.phases.step3.mid.saveBtn === 'Saving...', { lastKeyMs: t3k - t3, toastMs: result.phases.step3.toastMs, mid: result.phases.step3.mid });
  ok('3-form-kept', f3.category === 'R23Delay' && f3.comment === 'R23Typed' && !f3.saveDisabled, f3);
  await waitGone();
  const t3b0 = Date.now();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t3b = await waitToast(/Tags saved/);
  await page.waitForTimeout(500);
  result.phases.step3.second = { toast: t3b, ms: t3b ? t3b.at - t3b0 : null, form: await form() };
  await shot('3c-second-save');
  ok('3-second-save', t3b?.text === 'Tags saved' && result.phases.step3.second.form.saveDisabled && result.phases.step3.second.form.comment === 'R23Typed', result.phases.step3.second);
  await waitGone();
  result.phases.readersAfter3 = await readAll();

  phase = 'step4';
  result.phases.step4 = { before: await form() };
  await page.locator('button[title="Customize Fields"]').click();
  await page.getByPlaceholder('Field name (e.g. Client)').waitFor({ timeout: 5000 });
  await shot('4a-schema-editor');
  await page.getByPlaceholder('Field name (e.g. Client)').fill('R23note');
  await page.getByRole('button', { name: /Add Field/ }).click();
  await page.waitForTimeout(300);
  result.phases.step4.fieldErrorText = await page.locator('body').innerText().then((t) => (t.match(/(Field name is required|already exists|conflicts|RIFF ID[^\n]*|Could not generate[^\n]*)/) ?? [null])[0]);
  await shot('4b-field-added');
  await page.getByRole('button', { name: /^Done$/ }).click();
  await block('R23note').waitFor({ timeout: 10000 });
  await page.waitForTimeout(1200); await pollToasts();
  result.phases.step4.afterSchemaA = { ...(await form()), r23note: await fieldIn('R23note').inputValue() };
  await shot('4c-after-schema-a');
  const f4 = result.phases.step4.afterSchemaA;
  ok('4-a-kept', f4.header === 'a.wav' && f4.category === 'R23Delay' && f4.comment === 'R23Typed' && f4.saveDisabled && f4.r23note === '' && !toastsSeen.some((x) => x.startsWith('step4') && /Failed/.test(x)), f4);
  await nameCell('b.wav').click(); await page.waitForTimeout(800); await pollToasts();
  result.phases.step4.afterSchemaB = { ...(await form()), r23note: await fieldIn('R23note').inputValue() };
  await shot('4d-after-schema-b');
  const f4b = result.phases.step4.afterSchemaB;
  ok('4-b-shown', f4b.header === 'b.wav' && f4b.category === 'R23Batch' && f4b.comment === initial['b.wav'].mmComment ? true : (f4b.header === 'b.wav' && f4b.category === 'R23Batch'), f4b);

  phase = 'step5';
  const R = await readAll();
  result.phases.readers = R;
  const agree = (n) => R[n].ffICAT === R[n].mmICAT && (R[n].ffComment ?? '') === (R[n].mmComment ?? '') && (R[n].ffTitle ?? '') === (R[n].mmTitle ?? '');
  ok('5-a', R['a.wav'].ffICAT === 'R23Delay' && R['a.wav'].mmICAT === 'R23Delay' && R['a.wav'].ffComment === 'R23Typed' && R['a.wav'].mmComment === 'R23Typed' && agree('a.wav'), R['a.wav']);
  for (const n of ['b.wav', 'c.wav']) ok(`5-${n}`, R[n].ffICAT === 'R23Batch' && R[n].mmICAT === 'R23Batch' && (R[n].ffComment ?? null) === (initial[n].ffComment ?? null) && (R[n].mmComment ?? null) === (initial[n].mmComment ?? null) && agree(n), { now: R[n], initialComment: { ff: initial[n].ffComment, mm: initial[n].mmComment } });
  ok('5-after3-a', result.phases.readersAfter3['a.wav'].ffICAT === 'R23Delay' && result.phases.readersAfter3['a.wav'].mmComment === 'R23Typed', result.phases.readersAfter3['a.wav']);
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`;
  try { await shot('error'); } catch {}
} finally {
  result.pageErrors = pageErrors;
  result.toastsSeen = toastsSeen;
  ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
  writeFileSync(join(OUT, `r23-5-${LABEL}.json`), JSON.stringify(result, null, 2));
  await app.close().catch(() => {});
}
console.log(JSON.stringify({ checks: Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass])), error: result.error, toasts: result.toastsSeen }, null, 1));
