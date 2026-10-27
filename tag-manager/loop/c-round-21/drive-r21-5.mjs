import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const APPROOT = process.argv[2];
const LABEL = process.argv[3];
const FULL = LABEL === 'new';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-21';
const DELAY = 3000;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), `c-r21-${LABEL}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav', 'c.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { label: LABEL, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) {
  try { const m = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(m.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { common: { title: m.common.title, comment: m.common.comment, copyright: m.common.copyright, artist: m.common.artist, artists: m.common.artists }, native }; } catch (e) { return { error: String(e) }; }
}
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
const shot = (name) => page.screenshot({ path: join(OUT, `r21-5-${LABEL}-${name}.png`) });
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g;
const pollToasts = async () => { const t = await page.locator('body').innerText(); for (const m of t.match(TOAST_RE) ?? []) { const k = `${phase}: ${m}`; if (!toastsSeen.some((x) => x.k === k)) toastsSeen.push({ k, at: Date.now() }); } };
const waitToast = async (re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return { text: m[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitGone = async (ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); TOAST_RE.lastIndex = 0; if (!TOAST_RE.test(t)) { TOAST_RE.lastIndex = 0; return; } TOAST_RE.lastIndex = 0; await page.waitForTimeout(150); } };
const saveBtn = () => page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first();
const form = async () => ({ header: (await page.locator('div.border-b.border-outline span.text-xs.font-medium').first().textContent())?.trim(), title: await fieldIn('Title').inputValue(), comment: await fieldIn('Comment').inputValue(), category: await fieldIn('Category (UCS)').inputValue(), copyright: await fieldIn('Copyright').inputValue(), saveBtn: (await saveBtn().textContent())?.trim(), saveDisabled: await saveBtn().isDisabled() });
const selectOnly = async (n) => { await nameCell(n).click(); await page.waitForTimeout(600); };
const saveAndWait = async (btn, re) => { const t0 = Date.now(); await page.getByRole('button', { name: btn }).click(); const t = await waitToast(re); return { ...t, ms: t ? t.at - t0 : null }; };
const typeKeys = async (label, text) => { await fieldIn(label).click(); await page.keyboard.type(text, { delay: 30 }); };

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
  await shot('0-scan');

  phase = 'step1';
  await selectOnly('a.wav');
  result.phases.step1 = { before: await form() };
  await fieldIn('Category (UCS)').fill('R21A');
  const t1 = Date.now();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(200);
  await typeKeys('Comment', 'R21Typed');
  const t1k = Date.now();
  await pollToasts();
  result.phases.step1.midForm = await form();
  await shot('1a-mid-save-typed');
  const toast1 = await waitToast(/Tags saved/);
  result.phases.step1 = { ...result.phases.step1, lastKeyMs: t1k - t1, toastMs: toast1 ? toast1.at - t1 : null, toast: toast1 };
  ok('1-typed-before-toast', toast1 && t1k < toast1.at && t1k - t1 < DELAY, result.phases.step1);

  phase = 'step2';
  await page.waitForTimeout(500);
  result.phases.step2 = { form: await form() };
  await shot('2-after-tags-saved');
  const f2 = result.phases.step2.form;
  if (FULL) ok('2-form-kept', f2.category === 'R21A' && f2.comment === 'R21Typed' && !f2.saveDisabled, f2);
  else ok('8-red-form-lost', f2.comment !== 'R21Typed' && f2.saveDisabled, f2);

  if (FULL) {
    phase = 'step3';
    await waitGone();
    const s3 = await saveAndWait(/Save Tags/, /Tags saved/);
    await page.waitForTimeout(500);
    result.phases.step3 = { toast: s3, form: await form() };
    await shot('3-second-save');
    const f3 = result.phases.step3.form;
    ok('3-second-save', s3?.text === 'Tags saved' && f3.category === 'R21A' && f3.comment === 'R21Typed' && f3.saveDisabled, result.phases.step3);
    await waitGone();

    phase = 'step4';
    await selectOnly('b.wav');
    await fieldIn('Category (UCS)').fill('R21B');
    const t4 = Date.now();
    await page.getByRole('button', { name: /Save Tags/ }).click();
    await page.waitForTimeout(200);
    await nameCell('a.wav').click(); await page.waitForTimeout(150);
    await pollToasts();
    result.phases.step4 = { formOnA: await form() };
    await nameCell('b.wav').click(); await page.waitForTimeout(150);
    result.phases.step4.formBackOnB = await form();
    await typeKeys('Title', 'R21Back');
    const t4k = Date.now();
    await shot('4a-mid-save-back-on-b-typed');
    const toast4 = await waitToast(/Tags saved/);
    await page.waitForTimeout(500); await pollToasts();
    result.phases.step4 = { ...result.phases.step4, lastKeyMs: t4k - t4, toastMs: toast4 ? toast4.at - t4 : null, toast: toast4, form: await form() };
    await shot('4b-after-tags-saved');
    const f4 = result.phases.step4.form;
    ok('4-typed-before-toast', toast4 && t4k < toast4.at, { lastKeyMs: t4k - t4, toastMs: result.phases.step4.toastMs });
    ok('4-form', f4.header === 'b.wav' && f4.title === 'R21Back' && f4.category === 'R21B' && !f4.saveDisabled, f4);
    await waitGone();
    const s4b = await saveAndWait(/Save Tags/, /Tags saved/);
    await page.waitForTimeout(400);
    result.phases.step4.second = { toast: s4b, form: await form() };
    await shot('4c-second-save');
    ok('4-second-save', s4b?.text === 'Tags saved' && result.phases.step4.second.form.saveDisabled && result.phases.step4.second.form.title === 'R21Back', result.phases.step4.second);
    await waitGone();

    phase = 'step5';
    await selectOnly('b.wav');
    await nameCell('c.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
    await fieldIn('Category (UCS)').fill('R21Batch');
    const t5 = Date.now();
    await page.getByRole('button', { name: /Save to 2 files/ }).click();
    await page.waitForTimeout(200);
    await typeKeys('Copyright', 'R21Copy');
    const t5k = Date.now();
    await shot('5a-mid-batch-typed');
    const toast5 = await waitToast(/Tags saved to 2 files|\d+ saved, \d+ failed/);
    await page.waitForTimeout(500); await pollToasts();
    result.phases.step5 = { lastKeyMs: t5k - t5, toastMs: toast5 ? toast5.at - t5 : null, toast: toast5, form: await form() };
    await shot('5b-after-batch-toast');
    const f5 = result.phases.step5.form;
    ok('5-typed-before-toast', toast5 && t5k < toast5.at, { lastKeyMs: t5k - t5, toastMs: result.phases.step5.toastMs });
    ok('5-form', toast5?.text === 'Tags saved to 2 files' && f5.copyright === 'R21Copy' && f5.category === '' && f5.saveBtn === 'Save to 2 files' && !f5.saveDisabled, f5);
    await waitGone();
    const s5b = await saveAndWait(/Save to 2 files/, /Tags saved to 2 files|\d+ saved, \d+ failed/);
    await page.waitForTimeout(400);
    result.phases.step5.second = { toast: s5b, form: await form() };
    await shot('5c-second-batch-save');
    ok('5-second-save', s5b?.text === 'Tags saved to 2 files' && result.phases.step5.second.form.saveDisabled, result.phases.step5.second);
    await waitGone();

    phase = 'step6';
    await selectOnly('c.wav');
    await fieldIn('Comment').fill('R21C');
    const s6 = await saveAndWait(/Save Tags/, /Tags saved/);
    await page.waitForTimeout(600); await pollToasts();
    result.phases.step6 = { toast: s6, form: await form() };
    await shot('6-c-saved');
    const f6 = result.phases.step6.form;
    ok('6-c-regression', f6.header === 'c.wav' && f6.comment === 'R21C' && f6.saveDisabled && s6?.text === 'Tags saved' && !toastsSeen.some((x) => x.k.startsWith('step6: Unsaved')), result.phases.step6);
    await waitGone();
  }

  phase = 'step7';
  result.phases.readers = {};
  for (const n of NAMES) { const p = join(dir, n); result.phases.readers[n] = { ffprobe: ffprobe(p), mm: await mmRead(p) }; }
  const R = result.phases.readers;
  const ff = (n, k) => R[n].ffprobe[k] ?? R[n].ffprobe[k.toUpperCase()];
  const nat = (n, id) => { const m = R[n].mm.native ?? {}; return m[`exif:${id}`]; };
  const cmt = (v) => Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : x?.text)).join('|') : v;
  const sum = (n) => ({ ffTitle: ff(n, 'title'), ffComment: ff(n, 'comment'), ffICAT: ff(n, 'ICAT'), ffCopyright: ff(n, 'copyright'), ffArtist: ff(n, 'artist'), mmTitle: R[n].mm.common?.title, mmComment: cmt(R[n].mm.common?.comment), mmICAT: nat(n, 'ICAT'), mmCopyright: R[n].mm.common?.copyright, mmArtist: R[n].mm.common?.artist });
  result.phases.readerSummary = Object.fromEntries(NAMES.map((n) => [n, sum(n)]));
  const S = result.phases.readerSummary;
  if (FULL) {
    ok('7-a', S['a.wav'].ffComment === 'R21Typed' && S['a.wav'].mmComment === 'R21Typed' && S['a.wav'].ffICAT === 'R21A' && S['a.wav'].mmICAT === 'R21A', S['a.wav']);
    ok('7-b', S['b.wav'].ffTitle === 'R21Back' && S['b.wav'].mmTitle === 'R21Back' && S['b.wav'].ffICAT === 'R21Batch' && S['b.wav'].mmICAT === 'R21Batch' && S['b.wav'].ffCopyright === 'R21Copy' && S['b.wav'].mmCopyright === 'R21Copy', S['b.wav']);
    ok('7-c', S['c.wav'].ffComment === 'R21C' && S['c.wav'].mmComment === 'R21C' && S['c.wav'].ffICAT === 'R21Batch' && S['c.wav'].mmICAT === 'R21Batch' && S['c.wav'].ffCopyright === 'R21Copy' && S['c.wav'].mmCopyright === 'R21Copy', S['c.wav']);
  } else {
    ok('8-red-a-no-typed-comment', S['a.wav'].ffComment !== 'R21Typed' && S['a.wav'].mmComment !== 'R21Typed' && S['a.wav'].ffICAT === 'R21A', S['a.wav']);
  }
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`;
  try { await shot('error'); } catch {}
} finally {
  result.pageErrors = pageErrors;
  result.toastsSeen = toastsSeen.map((t) => t.k);
  ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
  writeFileSync(join(OUT, `r21-5-${LABEL}.json`), JSON.stringify(result, null, 2));
  await app.close().catch(() => {});
}
console.log(JSON.stringify({ checks: Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass])), error: result.error, toasts: result.toastsSeen }, null, 1));
