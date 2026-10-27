import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2]; const LABEL = process.argv[3]; const SCEN = process.argv[4];
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-31';
const HARNESS = OUT + '/harness.cjs';
const TAG = `r31-5-${LABEL}-${SCEN}`;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const work = mkdtempSync(join(tmpdir(), `c-r31-${LABEL}-${SCEN}-`));
const slow = join(work, 'slow'); mkdirSync(slow);
const fast = join(work, 'fast'); mkdirSync(fast);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const DF = join(work, 'ARM_DELAY'), RF = join(work, 'ARM_REJECT'), SF = join(work, 'ARM_SCAN');
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(slow, 's.wav'));
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(fast, 'f.wav'));
const S = join(slow, 's.wav'), F = join(fast, 'f.wav');
const result = { label: LABEL, scenario: SCEN, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const shas = () => ({ s: sha(S), f: sha(F) });
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) { try { const r = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(r.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { native }; } catch (e) { return { error: String(e) }; } }
const read1 = async (p) => { const f = ffprobe(p); const r = await mmRead(p); return { ffprobe: f, mmNative: r.native, ffICAT: f.ICAT ?? f.icat, mmICAT: r.native?.['exif:ICAT'] }; };
const readers = async () => ({ s: await read1(S), f: await read1(F) });
const app = await _electron.launch({ args: ['--no-sandbox', '-r', HARNESS, join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R31_DELAY_MS: '5000', R31_DELAY_FILE: DF, R31_REJECT_FILE: RF, R31_SCAN_FILE: SF } });
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
const spinner = async () => (await page.locator('svg.text-brand.animate-spin').count()) > 0;
const prompt = async () => (await page.getByText('Open a folder to start tagging WAV files').count()) > 0;
const snap = async () => ({ t: Date.now(), folder: await folderLabel(), rows: await allRows(), f: await rowInfo('f.wav'), s: await rowInfo('s.wav'), spinner: await spinner(), prompt: await prompt(), toasts: await toastsNow() });
let shotN = 0;
const shot = async (name) => page.screenshot({ path: join(OUT, `${TAG}-${String(shotN++).padStart(2, '0')}-${name}.png`) });
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*|Rescan failed[^\n]*|R31 harness[^\n]*)/g;
const toastsNow = async () => (await page.locator('body').innerText()).match(TOAST_RE) ?? [];
const pollToasts = async () => { for (const t of await toastsNow()) { const k = `${phase}: ${t}`; if (!toastsSeen.includes(k)) toastsSeen.push(k); } };
const waitToast = async (re, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const r = (await page.locator('body').innerText()).match(re); if (r) return { text: r[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitNoToast = async (ms = 10000) => { const end = Date.now() + ms; while (Date.now() < end) { if ((await toastsNow()).length === 0) return true; await page.waitForTimeout(100); } return false; };
const watch = async (ms) => { const seen = new Set(); const timeline = []; const end = Date.now() + ms; let last = ''; while (Date.now() < end) { for (const t of await toastsNow()) seen.add(t); await pollToasts(); const s = await snap(); const k = JSON.stringify({ ...s, t: 0 }); if (k !== last) { timeline.push(s); last = k; } await page.waitForTimeout(100); } return { toasts: [...seen], timeline }; };
const form = async () => ({ title: await val('Title'), category: await val('Category (UCS)') });
const ipcLog = () => app.evaluate(() => globalThis.__r31log);
const waitLog = async (pred, from, ms = 10000) => { const end = Date.now() + ms; while (Date.now() < end) { const l = (await ipcLog()).slice(from); const e = l.find(pred); if (e) return e; await page.waitForTimeout(50); } return null; };
const openFolder = async (dir) => { await setDialog(dir); await page.getByRole('button', { name: /Open Folder/ }).first().click(); };
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
try {
  result.phases.setupFast = await tagFile(fast, 'f.wav', 'R31Fast');
  await waitNoToast();
  result.phases.setupSlow = await tagFile(slow, 's.wav', 'R31Slow');
  await shot('setup-saved');
  await waitNoToast();
  result.shaAfterSetup = shas();
  result.readersAfterSetup = await readers();
  phase = `action-${SCEN}`;
  const n0 = (await ipcLog()).length;
  if (SCEN === 'C') {
    writeFileSync(DF, '1');
    await openFolder(slow);
    const st = await waitLog((e) => e.channel === 'meta:read-batch' && e.phase === 'start' && e.delayed, n0, 5000);
    result.phases.beforeClose = { readStarted: !!st, ...(await snap()) };
    await shot('slow-pending-spinner');
    const tClick = Date.now();
    await page.locator('p[title] + button').first().click();
    let promptAt = null; const end = tClick + 500;
    while (Date.now() < end) { if ((await prompt()) && !(await spinner())) { promptAt = Date.now() - tClick; break; } await page.waitForTimeout(25); }
    result.phases.afterClose500 = { promptWithin500ms: promptAt, ...(await snap()) };
    await shot('close-within-500ms');
    const w = await watch(7000);
    result.phases.after7s = { ...(await snap()), toasts: w.toasts, timeline: w.timeline };
    await shot('close-after-7s');
  } else {
    if (SCEN === 'S') writeFileSync(SF, '1'); else writeFileSync(DF, '1');
    if (SCEN === 'J') writeFileSync(RF, '1');
    await openFolder(slow);
    const startPred = SCEN === 'S' ? (e) => e.channel === 'fs:scan-folder' && e.phase === 'start' && e.delayed : (e) => e.channel === 'meta:read-batch' && e.phase === 'start' && e.delayed;
    const st = await waitLog(startPred, n0, 900);
    const tSlow = Date.now();
    result.phases.slowStarted = { ok: !!st, ...(await snap()) };
    await openFolder(fast);
    result.phases.fastClickedAfterMs = Date.now() - tSlow;
    await nameCell('f.wav').waitFor({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(300);
    result.phases.fastListed = await snap();
    await shot('fast-listed');
    const w = await watch(7000);
    result.phases.after7s = { ...(await snap()), toasts: w.toasts, timeline: w.timeline };
    await shot('after-7s');
    if (await nameCell('f.wav').count()) { await nameCell('f.wav').click(); await page.waitForTimeout(800); }
    result.phases.clickF = { form: await form(), f: await rowInfo('f.wav') };
    await shot('click-f-form');
  }
  rmSync(DF, { force: true }); rmSync(RF, { force: true }); rmSync(SF, { force: true });
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
ok('sha unchanged after setup', JSON.stringify(result.shaAfterSetup) === JSON.stringify(result.shaFinal), { afterSetup: result.shaAfterSetup, final: result.shaFinal });
ok('readers ICAT s=R31Slow f=R31Fast (setup+final, ffprobe+mm)', [A?.s.ffICAT, A?.s.mmICAT, R.s.ffICAT, R.s.mmICAT].every((x) => x === 'R31Slow') && [A?.f.ffICAT, A?.f.mmICAT, R.f.ffICAT, R.f.mmICAT].every((x) => x === 'R31Fast'), { setup: { s: [A?.s.ffICAT, A?.s.mmICAT], f: [A?.f.ffICAT, A?.f.mmICAT] }, final: { s: [R.s.ffICAT, R.s.mmICAT], f: [R.f.ffICAT, R.f.mmICAT] } });
ok('pageErrors empty', pageErrors.length === 0, pageErrors);
if (SCEN === 'L' || SCEN === 'J') {
  ok('slow read was delayed', P.slowStarted?.ok, P.fastClickedAfterMs);
  ok('fast listed with Tagged before slow landed', P.fastListed?.f?.tagged === true, P.fastListed);
  ok('NEW-EXPECT: f.wav Tagged after 7s', P.after7s?.f?.tagged === true, P.after7s?.f);
  ok('NEW-EXPECT: form Category R31Fast', P.clickF?.form?.category === 'R31Fast', P.clickF?.form);
  ok('NEW-EXPECT: no Failed toast after action', !(P.after7s?.toasts ?? []).some((t) => /Fail/.test(t)), P.after7s?.toasts);
  ok('NEW-EXPECT: list f.wav only, folder fast', JSON.stringify(P.after7s?.rows) === '["f.wav"]' && P.after7s?.folder === 'fast', [P.after7s?.rows, P.after7s?.folder]);
}
if (SCEN === 'S') {
  ok('slow scan was delayed', P.slowStarted?.ok, P.fastClickedAfterMs);
  ok('NEW-EXPECT: list f.wav only with Tagged, folder fast', JSON.stringify(P.after7s?.rows) === '["f.wav"]' && P.after7s?.f?.tagged === true && P.after7s?.folder === 'fast', [P.after7s?.rows, P.after7s?.f, P.after7s?.folder]);
}
if (SCEN === 'C') {
  ok('spinner shown before close', P.beforeClose?.spinner === true, P.beforeClose);
  ok('NEW-EXPECT: prompt within 500ms, no spinner', P.afterClose500?.promptWithin500ms !== null && P.afterClose500?.spinner === false, P.afterClose500);
  ok('NEW-EXPECT: list empty after 7s, prompt, no spinner', (P.after7s?.rows?.length === 0) && P.after7s?.prompt && !P.after7s?.spinner, P.after7s);
}
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(result, null, 2));
console.log(LABEL, SCEN, JSON.stringify(Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass]))));
console.log('toastsSeen', JSON.stringify(toastsSeen));
if (result.error) console.log('ERROR', result.error);
