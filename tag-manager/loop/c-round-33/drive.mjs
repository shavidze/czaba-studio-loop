import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2]; const LABEL = process.argv[3]; const SCEN = process.argv[4];
const DELAY_MS = process.env.R33_DELAY_MS || '6000'; const SCAN_MS = process.env.R33_SCAN_MS || '2000';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-33';
const TAG = `r33-5-${LABEL}-${SCEN}`;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const work = mkdtempSync(join(tmpdir(), `c-r33-${LABEL}-${SCEN}-`));
const slow = join(work, 'slow'); mkdirSync(slow);
const fast = join(work, 'fast'); mkdirSync(fast);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const ARM = { scan: join(work, 'ARM_SCAN'), delay: join(work, 'ARM_DELAY'), reject: join(work, 'ARM_REJECT'), old: join(work, 'ARM_OLD') };
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(slow, 's.wav'));
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(fast, 'f.wav'));
const S = join(slow, 's.wav'), F = join(fast, 'f.wav');
const result = { label: LABEL, scenario: SCEN, appRoot: APPROOT, workDir: work, delayMs: DELAY_MS, scanMs: SCAN_MS, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const shas = () => ({ s: sha(S), f: sha(F) });
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) { try { const r = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(r.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { native }; } catch (e) { return { error: String(e) }; } }
function rawInfo(p) { const b = readFileSync(p); const out = {}; let i = 12; while (i + 8 <= b.length) { const id = b.toString('latin1', i, i + 4); const sz = b.readUInt32LE(i + 4); if (id === 'LIST' && b.toString('latin1', i + 8, i + 12) === 'INFO') { let j = i + 12; const end = i + 8 + sz; while (j + 8 <= end) { const sid = b.toString('latin1', j, j + 4); const ssz = b.readUInt32LE(j + 4); out[sid] = b.toString('utf8', j + 8, j + 8 + ssz).replace(/\0+$/, ''); j += 8 + ssz + (ssz & 1); } } i += 8 + sz + (sz & 1); } return out; }
const read1 = async (p) => { const f = ffprobe(p); const r = await mmRead(p); const raw = rawInfo(p); return { ffprobe: f, mmNative: r.native, raw, ffICAT: f.ICAT ?? f.icat, mmICAT: r.native?.['exif:ICAT'], ffR33N: f.R33N ?? f.r33n, mmR33N: r.native?.['exif:R33N'], rawR33N: raw.R33N }; };
const readers = async () => ({ s: await read1(S), f: await read1(F) });
const app = await _electron.launch({ args: ['--no-sandbox', '-r', OUT + '/harness.cjs', join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R33_DELAY_MS: DELAY_MS, R33_SCAN_MS: SCAN_MS, R33_SCAN_FILE: ARM.scan, R33_DELAY_FILE: ARM.delay, R33_REJECT_FILE: ARM.reject, R33_OLDSCHEMA_FILE: ARM.old } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
const setDialog = (d) => app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, d);
await page.waitForTimeout(800);
let phase = 'setup';
const pageErrors = []; const toastsSeen = [];
page.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const val = async (label) => ((await block(label).count()) ? await fieldIn(label).inputValue() : '<no field>');
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const rowOf = (n) => nameCell(n).locator('xpath=../..');
const rowInfo = async (n) => { if (!(await nameCell(n).count())) return { listed: false }; const r = rowOf(n); return { listed: true, tagged: (await r.locator('text=Tagged').count()) > 0, text: (await r.innerText()).replace(/\s+/g, ' ') }; };
const allRows = async () => (await page.locator('span.truncate.text-foreground').allInnerTexts()).filter((t) => /\.wav$/i.test(t));
const folderLabel = async () => { const p = page.locator('p[title]').first(); return (await p.count()) ? (await p.getAttribute('title')).split('/').pop() : null; };
const editorOpen = async () => (await page.getByText('Add Custom Field').count()) > 0;
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*|Rescan failed[^\n]*|R33 harness[^\n]*|Reloading failed[^\n]*)/g;
const toastsNow = async () => (await page.locator('body').innerText()).match(TOAST_RE) ?? [];
const snap = async () => ({ t: Date.now(), folder: await folderLabel(), rows: await allRows(), f: await rowInfo('f.wav'), s: await rowInfo('s.wav'), editor: await editorOpen(), toasts: await toastsNow() });
let shotN = 0;
const shot = async (name) => page.screenshot({ path: join(OUT, `${TAG}-${String(shotN++).padStart(2, '0')}-${name}.png`) });
const pollToasts = async () => { for (const t of await toastsNow()) { const k = `${phase}: ${t}`; if (!toastsSeen.includes(k)) toastsSeen.push(k); } };
const waitToast = async (re, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const r = (await page.locator('body').innerText()).match(re); if (r) return { text: r[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitNoToast = async (ms = 10000) => { const end = Date.now() + ms; while (Date.now() < end) { if ((await toastsNow()).length === 0) return true; await page.waitForTimeout(100); } return false; };
const form = async () => ({ title: await val('Title'), category: await val('Category (UCS)'), r33note: await val('R33note') });
const ipcLog = () => app.evaluate(() => globalThis.__r33log);
const openFolder = async (dir) => { await setDialog(dir); await page.getByRole('button', { name: /Open Folder/ }).first().click(); };
const addField = async (name, riff) => { await page.getByPlaceholder('Field name (e.g. Client)').fill(name); if (riff) await page.getByPlaceholder('RIFF ID (auto)').fill(riff); await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(150); };
const clickDone = async () => { await page.getByRole('button', { name: /^Done$/ }).click(); return Date.now(); };
const openCustomize = async () => { await page.getByTitle('Customize Fields').click(); await page.getByText('Add Custom Field').waitFor({ timeout: 5000 }); };
async function tagFile(dir, name, cat) {
  await openFolder(dir);
  await nameCell(name).waitFor({ timeout: 30000 }); await page.waitForTimeout(800);
  await nameCell(name).click(); await page.waitForTimeout(600);
  await fieldIn('Category (UCS)').fill(cat);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t = await waitToast(/Tags saved/);
  await page.waitForTimeout(1200);
  return { toast: t, form: await form(), row: await rowInfo(name) };
}
const watchUntil = async (tStart, ms) => { const timeline = []; let last = ''; let editorClosedAt = null; let fListedAt = null; const end = tStart + ms; while (Date.now() < end) { await pollToasts(); const s = await snap(); if (editorClosedAt === null && !s.editor) editorClosedAt = s.t - tStart; if (fListedAt === null && s.f.listed) { fListedAt = s.t - tStart; await shot('f-listed'); } const k = JSON.stringify({ ...s, t: 0 }); if (k !== last) { timeline.push({ ...s, dt: s.t - tStart }); last = k; } await page.waitForTimeout(100); } return { timeline, editorClosedMs: editorClosedAt, fListedMs: fListedAt }; };
try {
  result.phases.setupFast = await tagFile(fast, 'f.wav', 'R32Fast');
  await waitNoToast();
  result.phases.setupSlow = await tagFile(slow, 's.wav', 'R32Slow');
  await waitNoToast();
  if (SCEN === 'R') {
    await openCustomize(); await addField('R33note', 'R33N'); await clickDone();
    await page.getByText('Add Custom Field').waitFor({ state: 'detached', timeout: 10000 });
    await page.waitForTimeout(500);
    await fieldIn('R33note').fill('R33Val');
    await page.getByRole('button', { name: /Save Tags/ }).click();
    result.phases.setupNoteSave = await waitToast(/Tags saved/);
    await page.waitForTimeout(1200); await waitNoToast();
    await openCustomize();
    const row = page.locator('div.flex.items-center', { has: page.locator('span', { hasText: /^R33note$/ }) }).last();
    await row.locator('button').last().click(); await page.waitForTimeout(200);
    result.phases.setupFieldRemoved = (await page.locator('span', { hasText: /^R33note$/ }).count()) === 0;
    await clickDone();
    await page.getByText('Add Custom Field').waitFor({ state: 'detached', timeout: 10000 });
    await page.waitForTimeout(800);
  }
  await shot('setup-saved');
  result.shaAfterSetup = shas();
  result.readersAfterSetup = await readers();
  result.phases.setupState = { ...(await snap()), form: await form() };
  phase = `action-${SCEN}`;
  const n0 = (await ipcLog()).length;
  if (SCEN === 'W' || SCEN === 'WJ') {
    writeFileSync(ARM.scan, '1'); writeFileSync(ARM.delay, '1'); if (SCEN === 'WJ') writeFileSync(ARM.reject, '1');
    await openCustomize();
    await openFolder(fast); const tOpen = Date.now();
    await addField('R33note');
    const tDone = await clickDone();
    result.phases.doneAfterOpenMs = tDone - tOpen;
    const w = await watchUntil(tDone, 8000);
    result.phases.watch = w;
    await shot('after-8s');
    const toastsWindow = toastsSeen.filter((t) => t.startsWith(phase));
    result.phases.after8s = { ...(await snap()), toastsInWindow: toastsWindow };
    if (await nameCell('f.wav').count()) { await nameCell('f.wav').click(); await page.waitForTimeout(800); }
    result.phases.clickF = { form: await form(), f: await rowInfo('f.wav') };
    if (await block('Category (UCS)').count()) await block('Category (UCS)').scrollIntoViewIfNeeded();
    await shot('click-f-form');
  } else if (SCEN === 'R') {
    writeFileSync(ARM.old, '1');
    await openCustomize();
    await page.getByRole('button', { name: /Rescan/ }).click(); const tRescan = Date.now();
    await page.waitForTimeout(300);
    await addField('R33note', 'R33N');
    const tDone = await clickDone();
    result.phases.doneAfterRescanMs = tDone - tRescan;
    const w = await watchUntil(tDone, 8000);
    result.phases.watch = w;
    await shot('after-8s');
    if (await nameCell('s.wav').count()) { await nameCell('s.wav').click(); await page.waitForTimeout(800); }
    result.phases.clickS = { form: await form(), s: await rowInfo('s.wav') };
    if (await block('R33note').count()) await block('R33note').scrollIntoViewIfNeeded();
    await shot('click-s-form');
  } else if (SCEN === 'N') {
    await openCustomize(); await addField('R33note');
    const tDone = await clickDone();
    const w = await watchUntil(tDone, 3000);
    result.phases.watch = w;
    await shot('after-3s');
  } else if (SCEN === 'Q') {
    if (process.env.Q_DELAY) writeFileSync(ARM.delay, '1'); else writeFileSync(ARM.scan, '1');
    await openCustomize();
    if (!process.env.Q_DELAY) await openFolder(fast); const tOpen = Date.now();
    await addField('R33note');
    await clickDone();
    await page.waitForTimeout(100);
    result.phases.editorOpenAfterDone = await editorOpen();
    await page.locator('span', { hasText: /^Customize Fields$/ }).locator('xpath=..').locator('button').first().click();
    await page.waitForTimeout(150);
    result.phases.editorOpenAfterBack = await editorOpen();
    result.phases.listAfterBack = await allRows();
    await shot('after-back');
    if (await nameCell('s.wav').count()) { await nameCell('s.wav').click(); await page.waitForTimeout(300); }
    result.phases.reselectedS = (await page.getByTitle('Customize Fields').count()) > 0;
    await openCustomize();
    await page.getByPlaceholder('Field name (e.g. Client)').fill('QTyped');
    result.phases.reopenedBeforeScanEndMs = Date.now() - tOpen;
    await shot('reopened-typing');
    const w = await watchUntil(tOpen, 5000);
    result.phases.watch = { editorClosedMsAfterOpen: w.editorClosedMs, fListedMs: w.fListedMs };
    result.phases.editorOpenAt5s = await editorOpen();
    result.phases.typedValueAt5s = result.phases.editorOpenAt5s ? await page.getByPlaceholder('Field name (e.g. Client)').inputValue() : null;
    await shot('after-5s');
  }
  for (const f of Object.values(ARM)) { try { (await import('node:fs')).rmSync(f, { force: true }); } catch {} }
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
result.ipc = await ipcLog().catch(() => []);
await app.close().catch(() => {});
result.pageErrors = pageErrors; result.toastsSeen = toastsSeen;
result.shaFinal = shas();
result.readersFinal = await readers();
const P = result.phases; const A = result.readersAfterSetup; const R = result.readersFinal;
ok('setup Tags saved x2', !!P.setupFast?.toast && !!P.setupSlow?.toast);
ok('setup readers ICAT s=R32Slow f=R32Fast', [A?.s.ffICAT, A?.s.mmICAT].every((x) => x === 'R32Slow') && [A?.f.ffICAT, A?.f.mmICAT].every((x) => x === 'R32Fast'), { s: [A?.s.ffICAT, A?.s.mmICAT], f: [A?.f.ffICAT, A?.f.mmICAT] });
ok('sha unchanged after setup (f and s)', result.shaAfterSetup?.f === result.shaFinal.f && result.shaAfterSetup?.s === result.shaFinal.s, { afterSetup: result.shaAfterSetup, final: result.shaFinal });
ok('final readers ICAT s=R32Slow f=R32Fast (ffprobe+mm)', [R.s.ffICAT, R.s.mmICAT].every((x) => x === 'R32Slow') && [R.f.ffICAT, R.f.mmICAT].every((x) => x === 'R32Fast'), { s: [R.s.ffICAT, R.s.mmICAT], f: [R.f.ffICAT, R.f.mmICAT] });
ok('no R33note value in f.wav (ffprobe, mm, raw)', R.f.ffR33N === undefined && R.f.mmR33N === undefined && R.f.rawR33N === undefined, [R.f.ffR33N, R.f.mmR33N, R.f.rawR33N]);
if (SCEN === 'R') ok('R33N=R33Val in s.wav (ffprobe, mm, raw)', R.s.ffR33N === 'R33Val' && R.s.rawR33N === 'R33Val', { ff: R.s.ffR33N, mm: R.s.mmR33N, raw: R.s.rawR33N });
else ok('no R33N in s.wav', R.s.ffR33N === undefined && R.s.rawR33N === undefined, [R.s.ffR33N, R.s.rawR33N]);
ok('pageErrors empty', pageErrors.length === 0, pageErrors);
const after = (pred) => (result.ipc || []).slice(n0Global()).filter(pred);
function n0Global() { return result.ipc.findIndex((e, i) => i >= 0 && e.at >= (P.tActionStart || 0)); }
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(result, null, 2));
console.log(LABEL, SCEN, JSON.stringify(Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass]))));
console.log('phases', JSON.stringify({ doneAfterOpenMs: P.doneAfterOpenMs, doneAfterRescanMs: P.doneAfterRescanMs, editorClosedMs: P.watch?.editorClosedMs ?? P.watch?.editorClosedMsAfterOpen, fListedMs: P.watch?.fListedMs, clickF: P.clickF, clickS: P.clickS, after8s: P.after8s && { f: P.after8s.f, toasts: P.after8s.toastsInWindow }, Q: SCEN === 'Q' ? { a: P.editorOpenAfterDone, b: P.editorOpenAfterBack, list: P.listAfterBack, resel: P.reselectedS, c: P.reopenedBeforeScanEndMs, d: P.editorOpenAt5s, e: P.typedValueAt5s } : undefined }));
console.log('toastsSeen', JSON.stringify(toastsSeen));
if (result.error) console.log('ERROR', result.error);
