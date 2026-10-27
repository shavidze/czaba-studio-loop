import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2];
const LABEL = process.argv[3];
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-27';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), `c-r27-${LABEL}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { label: LABEL, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) { try { const m = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(m.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { title: m.common.title, artist: m.common.artist, native }; } catch (e) { return { error: String(e) }; } }
const readA = async () => { const p = join(dir, 'a.wav'); const f = ffprobe(p); const m = await mmRead(p); return { ffprobe: f, mm: m, ffTitle: f.title, ffICAT: f.ICAT ?? f.icat, mmINAM: m.native?.['exif:INAM'], mmICAT: m.native?.['exif:ICAT'], mmTitle: m.title, ffArtist: f.artist, mmArtist: m.artist }; };
result.initialA = await readA();

const app = await _electron.launch({ args: ['--no-sandbox', '-r', join(OUT, 'harness.cjs'), join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
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
let shotN = 0;
const shot = async (name) => { if (await block('Category (UCS)').count()) await fieldIn('Category (UCS)').scrollIntoViewIfNeeded().catch(() => {}); return page.screenshot({ path: join(OUT, `r27-5-${LABEL}-${String(shotN++).padStart(2, '0')}-${name}.png`) }); };
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g;
const pollToasts = async () => { const t = await page.locator('body').innerText(); for (const m of t.match(TOAST_RE) ?? []) { const k = `${phase}: ${m}`; if (!toastsSeen.includes(k)) toastsSeen.push(k); } };
const waitToast = async (re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return { text: m[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const saveBtn = () => page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first();
const form = async () => ({ title: await val('Title'), category: await val('Category (UCS)'), r27note: await val('R27note'), saveBtn: (await saveBtn().count()) ? (await saveBtn().textContent())?.trim() : null, saveDisabled: (await saveBtn().count()) ? await saveBtn().isDisabled() : null });
const ipcLog = () => app.evaluate(() => globalThis.__r27log);
const waitLog = async (pred, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { const l = await ipcLog(); const e = l.find(pred); if (e) return e; await page.waitForTimeout(100); } return null; };

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
  await shot('scan');

  phase = 'step1';
  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  result.phases.step1 = { before: await form() };
  await fieldIn('Category (UCS)').fill('R27Cat');
  await shot('step1-typed');
  const tClick = Date.now();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(300);
  await shot('step1-saving');

  phase = 'step2';
  await page.getByTitle('Customize Fields').click(); await page.waitForTimeout(300);
  await page.getByPlaceholder('Field name (e.g. Client)').fill('R27note');
  await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(200);
  await shot('step2-field-added');
  await page.getByRole('button', { name: /^Done$/ }).click();
  const tDone = Date.now();
  await page.waitForTimeout(200);
  await shot('step2-after-done');
  result.phases.step2 = { doneMsAfterClick: tDone - tClick };

  phase = 'step3';
  const t3 = await waitToast(/Tags saved/);
  result.phases.step3 = { toast: t3, toastMsAfterClick: t3 ? t3.at - tClick : null, formAtToast: await form() };
  await shot('step3-tags-saved');
  const lateReply = await waitLog((e) => e.late && e.phase === 'reply', 15000);
  await page.waitForTimeout(800);
  result.phases.step3.lateReplyMsAfterClick = lateReply ? lateReply.at - tClick : null;
  result.phases.step3.after = await form();
  await shot('step3-after-late-read');

  phase = 'step4';
  await nameCell('b.wav').click(); await page.waitForTimeout(600);
  result.phases.step4 = { bForm: await form() };
  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  result.phases.step4.afterBA = await form();
  await shot('step4-after-b-a');
  await pollToasts();

  phase = 'step5';
  await fieldIn('Title').fill('R27T2');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t5 = await waitToast(/Tags saved/, 20000);
  await page.waitForTimeout(800);
  result.phases.step5 = { toast: t5, after: await form() };
  await shot('step5-after-save');
  result.ipc = (await ipcLog()).map((e) => ({ ...e, ms: e.at - tClick }));
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
await pollToasts();
await app.close().catch(() => {});
result.pageErrors = pageErrors; result.toastsSeen = toastsSeen;
result.finalA = await readA();
const s3 = result.phases.step3 ?? {}; const s4 = result.phases.step4 ?? {}; const A = result.finalA;
ok('form-after-late-read=R27Cat', s3.after?.category === 'R27Cat', s3.after);
ok('form-after-b-a=R27Cat', s4.afterBA?.category === 'R27Cat', s4.afterBA);
ok('readers ICAT=R27Cat', A.ffICAT === 'R27Cat' && A.mmICAT === 'R27Cat', { ffICAT: A.ffICAT, mmICAT: A.mmICAT });
ok('readers title=R27T2', A.ffTitle === 'R27T2' && A.mmINAM === 'R27T2', { ffTitle: A.ffTitle, mmINAM: A.mmINAM, mmTitle: A.mmTitle });
ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
writeFileSync(join(OUT, `r27-5-${LABEL}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.checks, null, 1));
if (result.error) console.log('ERROR', result.error);
