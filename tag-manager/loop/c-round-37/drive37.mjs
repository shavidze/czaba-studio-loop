import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2]; const LABEL = process.argv[3]; const SCEN = process.argv[4];
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-37';
const HARNESS = join(OUT, 'harness.cjs');
const SAMPLE = '/tmp/c37/sample.wav';
const TAG = `r37-4-${LABEL}-${SCEN}${process.env.R37_PRETAG ? 'p' : ''}`;
const SCAN_MS = '4000';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const work = mkdtempSync(join(tmpdir(), `c-r37-${LABEL}-${SCEN}-`));
const fa = join(work, 'fa'); mkdirSync(fa);
const fb = join(work, 'fb'); mkdirSync(fb);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const ARM = join(work, 'ARM_SCAN');
const aNames = SCEN === 'S4' ? ['a.wav', 'a2.wav', 'a3.wav', 'a4.wav'] : ['a.wav', 'a2.wav'];
for (const n of aNames) copyFileSync(process.env.R37_PRETAG && n === 'a2.wav' ? '/tmp/c37/pretag.wav' : SAMPLE, join(fa, n));
copyFileSync(SAMPLE, join(fb, 'b.wav'));
const allFiles = () => [...aNames.map((n) => join(fa, n)), join(fb, 'b.wav')].filter((p) => existsSync(p));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const shas = () => Object.fromEntries(allFiles().map((p) => [p.slice(work.length), sha(p)]));
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) { try { const r = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(r.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { native, common: { title: r.common.title, comment: r.common.comment } }; } catch (e) { return { error: String(e) }; } }
const result = { label: LABEL, scenario: SCEN, appRoot: APPROOT, workDir: work, scanMs: SCAN_MS, phases: {} };
const app = await _electron.launch({ args: ['--no-sandbox', '-r', HARNESS, join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R37_SCAN_MS: SCAN_MS, R37_ARM_FILE: ARM } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(800);
let phase = 'setup';
const pageErrors = []; const consoleErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${phase}: ${m.text()}`); });
const setDialog = (d) => app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, d);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const val = async (label) => ((await block(label).count()) ? await fieldIn(label).inputValue() : '<no field>');
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const ui = () => page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('div.grid.cursor-default'));
  const names = rows.map((d) => d.querySelector('span.truncate')?.textContent ?? '');
  const highlighted = rows.filter((d) => d.className.includes('bg-brand/10')).map((d) => d.querySelector('span.truncate')?.textContent ?? '');
  const tb = Array.from(document.querySelectorAll('div.ml-auto')).map((d) => d.textContent ?? '').find((t) => /\d+ files$/.test(t)) ?? null;
  const body = document.body.innerText;
  return { rows: names, highlighted, toolbar: tb, emptyPanel: body.includes('Select a file to edit metadata'), discardToast: body.includes('Unsaved changes were discarded'), saveButton: Array.from(document.querySelectorAll('button')).map((b) => b.textContent ?? '').find((t) => /Save Tags|Save to \d+ files|Saving/.test(t)) ?? null };
});
const formVals = async () => ({ title: await val('Title'), category: await val('Category (UCS)') });
let shotN = 0;
const shot = async (name) => page.screenshot({ path: join(OUT, `${TAG}-${String(shotN++).padStart(2, '0')}-${name}.png`) });
const waitText = async (re, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { const r = (await page.locator('body').innerText()).match(re); if (r) return r[0]; await page.waitForTimeout(50); } return null; };
const ipcLog = () => app.evaluate(() => globalThis.__r37log);
const openFolder = async (dir) => { await setDialog(dir); await page.getByRole('button', { name: /Open Folder/ }).first().click(); };
const watchUntil = async (cond, extraMs, capMs) => { const t0 = Date.now(); const tl = []; let last = ''; let condAt = null; let toastSeen = false; while (true) { const s = await ui(); if (s.discardToast) toastSeen = true; const k = JSON.stringify(s); if (k !== last) { tl.push({ dt: Date.now() - t0, ...s }); last = k; } if (condAt === null && (await cond())) condAt = Date.now() - t0; if (condAt !== null && Date.now() - t0 >= condAt + extraMs) break; if (Date.now() - t0 > capMs) break; await page.waitForTimeout(100); } return { timeline: tl, conditionMs: condAt, toastSeen }; };
try {
  await openFolder(fa);
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1000);
  result.metaFixture = { ffprobe: ffprobe(join(fa, 'a2.wav')) };
  await shot('before');
  result.phases.before = await ui();
  result.shaStart = shas();
  phase = `action-${SCEN}`;
  writeFileSync(ARM, '1');
  if (SCEN === 'S1' || SCEN === 'S3') {
    await openFolder(fb);
    await page.waitForTimeout(400);
    await nameCell('a.wav').click({ timeout: 3000 });
    await page.waitForTimeout(400);
    if (SCEN === 'S3') { await fieldIn('Category (UCS)').fill('R37Dirty'); await page.waitForTimeout(200); result.phases.typed = await val('Category (UCS)'); }
    result.phases.during = await ui();
    await shot('during-scan');
    result.phases.watch = await watchUntil(async () => (await nameCell('b.wav').count()) > 0, 1500, 15000);
  } else if (SCEN === 'S2' || SCEN === 'S4') {
    rmSync(join(fa, 'a.wav'));
    await page.getByRole('button', { name: /Rescan/ }).first().click();
    await page.waitForTimeout(400);
    await nameCell('a.wav').click({ timeout: 3000 });
    await nameCell('a2.wav').click({ modifiers: ['Control'] });
    await page.waitForTimeout(300);
    result.phases.during = await ui();
    await shot('during-scan');
    result.phases.watch = await watchUntil(async () => (await nameCell('a.wav').count()) === 0, 1500, 15000);
  }
  rmSync(ARM, { force: true });
  result.phases.after = await ui();
  result.phases.afterForm = await formVals();
  await shot('after-load');
  if (SCEN === 'S4') {
    phase = 'shift';
    await nameCell('a4.wav').click({ modifiers: ['Shift'] });
    await page.waitForTimeout(500);
    result.phases.afterShift = await ui();
    await shot('after-shift-a4');
  }
  if (SCEN === 'S2' && LABEL === 'new') {
    phase = 'save';
    await fieldIn('Category (UCS)').fill('R37Kept');
    await page.waitForTimeout(1000);
    result.phases.beforeSave = { ui: await ui(), form: await formVals() };
    await shot('typed-r37kept');
    const shaBeforeSave = shas();
    await page.getByRole('button', { name: /Save Tags/ }).click();
    result.phases.saveToast = await waitText(/Tags saved/);
    await page.waitForTimeout(1500);
    result.phases.afterSave = { ui: await ui(), form: await formVals() };
    await shot('after-save');
    result.shaBeforeSave = shaBeforeSave;
  }
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
result.ipc = await ipcLog().catch(() => []);
await app.close().catch(() => {});
result.pageErrors = pageErrors; result.consoleErrors = consoleErrors;
result.shaFinal = shas();
result.readersFinal = {};
for (const p of allFiles()) result.readersFinal[p.slice(work.length)] = { ffprobe: ffprobe(p), mm: await mmRead(p) };
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(result, null, 2));
const P = result.phases;
console.log(JSON.stringify({ tag: TAG, error: result.error ?? null, during: P.during && { tb: P.during.toolbar, hl: P.during.highlighted, rows: P.during.rows }, after: P.after && { tb: P.after.toolbar, hl: P.after.highlighted, rows: P.after.rows, empty: P.after.emptyPanel, save: P.after.saveButton }, afterForm: P.afterForm, toastSeen: P.watch?.toastSeen, afterShift: P.afterShift && { tb: P.afterShift.toolbar, hl: P.afterShift.highlighted }, beforeSave: P.beforeSave?.form, saveToast: P.saveToast, afterSave: P.afterSave?.form, shaStartEqFinal: JSON.stringify(result.shaStart) === JSON.stringify(Object.fromEntries(Object.entries(result.shaFinal).filter(([k]) => k in (result.shaStart ?? {})))), pageErrors, consoleErrors }, null, 1));
