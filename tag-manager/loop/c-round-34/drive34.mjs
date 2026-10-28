import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2]; const LABEL = process.argv[3]; const SCEN = process.argv[4];
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-34';
const HARNESS = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-33/harness.cjs';
const TAG = `r34-5-${LABEL}-${SCEN}`;
const SCAN_MS = '4000'; const DELAY_MS = '3000';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const work = mkdtempSync(join(tmpdir(), `c-r34-${LABEL}-${SCEN}-`));
const slow = join(work, 'slow'); mkdirSync(slow);
const fast = join(work, 'fast'); mkdirSync(fast);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const ARM = { scan: join(work, 'ARM_SCAN'), delay: join(work, 'ARM_DELAY') };
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(slow, 's.wav'));
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(fast, 'f.wav'));
const S = join(slow, 's.wav'), F = join(fast, 'f.wav');
const result = { label: LABEL, scenario: SCEN, appRoot: APPROOT, workDir: work, scanMs: SCAN_MS, delayMs: DELAY_MS, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const shas = () => ({ s: sha(S), f: sha(F) });
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) { try { const r = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(r.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return native; } catch (e) { return { error: String(e) }; } }
const rawHas = (p, s) => readFileSync(p).includes(Buffer.from(s, 'latin1'));
const read1 = async (p) => { const ff = ffprobe(p); const mmn = await mmRead(p); return { ffprobe: ff, mm: mmn, ffICAT: ff.ICAT ?? ff.icat, mmICAT: mmn['exif:ICAT'], rawQTyped: rawHas(p, 'QTyped'), rawR34note: rawHas(p, 'R34note') || rawHas(p, 'r34note'), anyR34Value: JSON.stringify([ff, mmn]).match(/R34N|r34note|QTyped|QTYP/gi) }; };
const readers = async () => ({ s: await read1(S), f: await read1(F) });
const app = await _electron.launch({ args: ['--no-sandbox', '-r', HARNESS, join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R33_DELAY_MS: DELAY_MS, R33_SCAN_MS: SCAN_MS, R33_SCAN_FILE: ARM.scan, R33_DELAY_FILE: ARM.delay, R33_REJECT_FILE: '', R33_OLDSCHEMA_FILE: '' } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
const setDialog = (d) => app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, d);
await page.waitForTimeout(800);
let phase = 'setup';
const pageErrors = []; const consoleErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${phase}: ${m.text()}`); });
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const val = async (label) => ((await block(label).count()) ? await fieldIn(label).inputValue() : '<no field>');
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const allRows = async () => (await page.locator('span.truncate.text-foreground').allInnerTexts()).filter((t) => /\.wav$/i.test(t));
const editorOpen = async () => (await page.getByText('Add Custom Field').count()) > 0;
const nameInput = () => page.getByPlaceholder('Field name (e.g. Client)');
const typedValue = async () => ((await nameInput().count()) ? await nameInput().inputValue() : null);
let shotN = 0;
const shot = async (name) => page.screenshot({ path: join(OUT, `${TAG}-${String(shotN++).padStart(2, '0')}-${name}.png`) });
const waitText = async (re, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { const r = (await page.locator('body').innerText()).match(re); if (r) return r[0]; await page.waitForTimeout(50); } return null; };
const waitGone = async (re, ms = 10000) => { const end = Date.now() + ms; while (Date.now() < end) { if (!(await page.locator('body').innerText()).match(re)) return true; await page.waitForTimeout(100); } return false; };
const ipcLog = () => app.evaluate(() => globalThis.__r33log);
const openFolder = async (dir) => { await setDialog(dir); await page.getByRole('button', { name: /Open Folder/ }).first().click(); };
const addField = async (name) => { await nameInput().fill(name); await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(150); };
const clickDone = async () => { await page.getByRole('button', { name: /^Done$/ }).click(); return Date.now(); };
const clickBack = async () => { await page.locator('span', { hasText: /^Customize Fields$/ }).locator('xpath=..').locator('button').first().click(); };
const openCustomize = async () => { await page.getByTitle('Customize Fields').click(); await page.getByText('Add Custom Field').waitFor({ timeout: 5000 }); };
const activeFieldSpans = async () => page.locator('span', { hasText: /^(R34note|QTyped)$/ }).allInnerTexts();
async function tagFile(dir, name, cat) {
  await openFolder(dir);
  await nameCell(name).waitFor({ timeout: 30000 }); await page.waitForTimeout(800);
  await nameCell(name).click(); await page.waitForTimeout(600);
  await fieldIn('Category (UCS)').fill(cat);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t = await waitText(/Tags saved/);
  await page.waitForTimeout(1200);
  return { toast: t, category: await val('Category (UCS)') };
}
const watch = async (t0, untilFn, extraMs, capMs) => { const tl = []; let last = ''; let closedAt = null; let condAt = null; while (true) { const now = Date.now(); const s = { editor: await editorOpen(), typed: await typedValue(), rows: await allRows() }; if (closedAt === null && !s.editor) closedAt = now - t0; if (condAt === null && (await untilFn())) condAt = now - t0; const k = JSON.stringify(s); if (k !== last) { tl.push({ dt: now - t0, ...s }); last = k; } if (condAt !== null && now - t0 >= condAt + extraMs) break; if (now - t0 > capMs) break; await page.waitForTimeout(100); } return { timeline: tl, editorClosedMs: closedAt, conditionMs: condAt }; };
try {
  result.phases.setupFast = await tagFile(fast, 'f.wav', 'R34Fast');
  await waitGone(/Tags saved/);
  result.phases.setupSlow = await tagFile(slow, 's.wav', 'R34Slow');
  await waitGone(/Tags saved/);
  await shot('setup-saved');
  result.shaAfterSetup = shas();
  result.readersAfterSetup = await readers();
  phase = `action-${SCEN}`;
  const n0 = (await ipcLog()).length;
  if (SCEN === 'Q' || SCEN === 'QD') {
    writeFileSync(SCEN === 'Q' ? ARM.scan : ARM.delay, '1');
    await openCustomize();
    if (SCEN === 'Q') await openFolder(fast);
    const t0 = Date.now();
    await addField('R34note');
    const tDone = await clickDone();
    await page.waitForTimeout(100);
    result.phases.editorOpenAfterDone = await editorOpen();
    await clickBack();
    await page.waitForTimeout(150);
    result.phases.editorOpenAfterBack = await editorOpen();
    result.phases.listAfterBack = await allRows();
    await shot('after-back');
    await nameCell('s.wav').click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await openCustomize();
    await nameInput().fill('QTyped');
    result.phases.typedAtMs = Date.now() - t0;
    await shot('reopened-typing');
    const cond = SCEN === 'Q'
      ? async () => (await nameCell('f.wav').count()) > 0
      : async () => (await ipcLog()).slice(n0).some((e) => e.channel === 'meta:read-batch' && e.phase === 'reply' && e.at > tDone);
    const w = await watch(t0, cond, 3000, 20000);
    result.phases.watch = w;
    result.phases.editorOpenAfterWait = await editorOpen();
    result.phases.typedAfterWait = await typedValue();
    await shot('after-wait');
    if (SCEN === 'Q' && result.phases.editorOpenAfterWait) {
      await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(200);
      result.phases.activeFieldsAfterAdd = await activeFieldSpans();
      await shot('after-add-qtyped');
      const td = await clickDone();
      await page.getByText('Add Custom Field').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
      result.phases.secondDoneClosedMs = (await editorOpen()) ? null : Date.now() - td;
      await page.waitForTimeout(800);
    }
    if (SCEN === 'Q') {
      for (const f of Object.values(ARM)) rmSync(f, { force: true });
      if (await nameCell('f.wav').count()) { await nameCell('f.wav').click(); await page.waitForTimeout(1000); }
      result.phases.fForm = { rows: await allRows(), category: await val('Category (UCS)'), r34noteInput: await block('R34note').count(), qtypedInput: await block('QTyped').count(), r34noteValue: await val('R34note') };
      if (await block('R34note').count()) await block('R34note').scrollIntoViewIfNeeded();
      await shot('click-f-form');
    }
  } else if (SCEN === 'N') {
    await openCustomize(); await addField('R34note');
    const tDone = await clickDone();
    const w = await watch(tDone, async () => !(await editorOpen()), 1000, 4000);
    result.phases.watch = w;
    await shot('after-done');
    if (await nameCell('s.wav').count()) { await nameCell('s.wav').click(); await page.waitForTimeout(800); }
    result.phases.sForm = { category: await val('Category (UCS)'), r34noteInput: await block('R34note').count() };
    await shot('s-form');
  }
  for (const f of Object.values(ARM)) rmSync(f, { force: true });
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
result.ipc = await ipcLog().catch(() => []);
await app.close().catch(() => {});
result.pageErrors = pageErrors; result.consoleErrors = consoleErrors;
result.shaFinal = shas();
result.readersFinal = await readers();
const P = result.phases; const A = result.readersAfterSetup; const R = result.readersFinal;
ok('setup Tags saved x2', !!P.setupFast?.toast && !!P.setupSlow?.toast);
ok('setup readers ICAT f=R34Fast s=R34Slow', [A?.f.ffICAT, A?.f.mmICAT].every((x) => x === 'R34Fast') && [A?.s.ffICAT, A?.s.mmICAT].every((x) => x === 'R34Slow'), { f: [A?.f.ffICAT, A?.f.mmICAT], s: [A?.s.ffICAT, A?.s.mmICAT] });
ok('sha unchanged after setup', result.shaAfterSetup?.f === result.shaFinal.f && result.shaAfterSetup?.s === result.shaFinal.s, { afterSetup: result.shaAfterSetup, final: result.shaFinal });
ok('final readers ICAT f=R34Fast s=R34Slow (ffprobe+mm)', [R.f.ffICAT, R.f.mmICAT].every((x) => x === 'R34Fast') && [R.s.ffICAT, R.s.mmICAT].every((x) => x === 'R34Slow'), { f: [R.f.ffICAT, R.f.mmICAT], s: [R.s.ffICAT, R.s.mmICAT] });
ok('no R34note/QTyped in either file (ffprobe, mm, raw bytes)', [R.f, R.s].every((x) => !x.rawQTyped && !x.rawR34note && !x.anyR34Value), [R.f.anyR34Value, R.s.anyR34Value, R.f.rawQTyped, R.s.rawQTyped, R.f.rawR34note, R.s.rawR34note]);
ok('pageErrors empty', pageErrors.length === 0, pageErrors);
ok('no harness error', !result.error, result.error);
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(result, null, 2));
console.log(LABEL, SCEN, JSON.stringify(Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass]))));
const { timeline, ...wsum } = P.watch ?? {};
console.log('phases', JSON.stringify({ afterDone: P.editorOpenAfterDone, afterBack: P.editorOpenAfterBack, listAfterBack: P.listAfterBack, typedAtMs: P.typedAtMs, watch: wsum, editorOpenAfterWait: P.editorOpenAfterWait, typedAfterWait: P.typedAfterWait, activeFieldsAfterAdd: P.activeFieldsAfterAdd, secondDoneClosedMs: P.secondDoneClosedMs, fForm: P.fForm, sForm: P.sForm }));
console.log('timeline', JSON.stringify(timeline));
console.log('readersFinal', JSON.stringify({ f: [R.f.ffICAT, R.f.mmICAT], s: [R.s.ffICAT, R.s.mmICAT] }), 'sha', JSON.stringify(result.shaFinal));
if (result.error) console.log('ERROR', result.error);
