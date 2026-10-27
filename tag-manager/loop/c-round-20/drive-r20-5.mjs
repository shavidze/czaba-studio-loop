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
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-20';
const DELAY = 3000;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), `c-r20-${LABEL}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav', 'c.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { label: LABEL, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) {
  try { const m = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(m.native)) for (const t of v) native[t.id] = t.value; return { common: { title: m.common.title, comment: m.common.comment, genre: m.common.genre, artist: m.common.artist }, native }; } catch (e) { return { error: String(e) }; }
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
const shot = (name) => page.screenshot({ path: join(OUT, `r20-5-${LABEL}-${name}.png`) });
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g;
const pollToasts = async () => { const t = await page.locator('body').innerText(); for (const m of t.match(TOAST_RE) ?? []) { const k = `${phase}: ${m}`; if (!toastsSeen.some((x) => x.k === k)) toastsSeen.push({ k, at: Date.now() }); } };
const waitToast = async (re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return { text: m[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitGone = async (ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(); const t = await page.locator('body').innerText(); if (!TOAST_RE.test(t)) return; TOAST_RE.lastIndex = 0; await page.waitForTimeout(150); } };
const form = async () => ({ header: (await page.locator('div.border-b.border-outline span.text-xs.font-medium').first().textContent())?.trim(), title: await fieldIn('Title').inputValue(), comment: await fieldIn('Comment').inputValue(), category: await fieldIn('Category (UCS)').inputValue(), saveBtn: (await page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first().textContent())?.trim(), saveDisabled: await page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first().isDisabled() });
const selectOnly = async (n) => { await nameCell(n).click(); await page.waitForTimeout(600); };
const saveAndWait = async (btn, re) => { const t0 = Date.now(); await page.getByRole('button', { name: btn }).click(); const t = await waitToast(re); return { ...t, ms: t ? t.at - t0 : null }; };

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
  await shot('0-scan');

  phase = 'step1';
  await selectOnly('b.wav');
  await fieldIn('Title').fill('B-title'); await fieldIn('Comment').fill('B-comment');
  result.phases.step1 = { toast: await saveAndWait(/Save Tags/, /Tags saved/) };
  result.phases.step1.form = await form();
  await shot('1-b-saved'); await waitGone();

  phase = 'step2';
  await selectOnly('a.wav');
  await fieldIn('Title').fill('A-title'); await fieldIn('Comment').fill('A-comment'); await fieldIn('Category (UCS)').fill('R20A');
  const tSave = Date.now();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(300);
  const tClick = Date.now();
  await nameCell('b.wav').click();
  const tClicked = Date.now();
  await pollToasts();
  const midForm = await form();
  await shot('2a-mid-save-after-click-b');
  const t2 = await waitToast(/Tags saved/, 20000);
  await page.waitForTimeout(500);
  await pollToasts();
  result.phases.step2 = { gapMs: tClick - tSave, clickDoneMs: tClicked - tSave, savedToastMs: t2 ? t2.at - tSave : null, savedBeforeClick: t2 ? t2.at < tClick : null, midForm, toast: t2 };
  await shot('2b-after-tags-saved');
  ok('2-gap-below-delay-and-before-toast', result.phases.step2.gapMs < DELAY && t2 && t2.at > tClicked, result.phases.step2);

  phase = 'step3';
  await waitGone();
  result.phases.step3 = { form: await form() };
  await shot('3-form-on-b');
  const f3 = result.phases.step3.form;
  ok('3-form-shows-b', f3.header === 'b.wav' && f3.title === 'B-title' && f3.comment === 'B-comment' && f3.category === '', f3);

  phase = 'step4';
  await fieldIn('Category (UCS)').fill('R20B');
  result.phases.step4 = { toast: await saveAndWait(/Save Tags/, /Tags saved|Failed[^\n]*/) };
  result.phases.step4.form = await form();
  await shot('4-b-category-saved'); await waitGone();

  if (FULL) {
    phase = 'step5';
    await selectOnly('a.wav');
    await nameCell('b.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
    const g = fieldIn('Genres'); await g.click(); await g.fill('R20Batch'); await g.press('Enter');
    const t5s = Date.now();
    await page.getByRole('button', { name: /Save to 2 files/ }).click();
    await page.waitForTimeout(300);
    const t5c = Date.now();
    await nameCell('a.wav').click();
    await pollToasts();
    await shot('5a-mid-batch-after-click-a');
    const t5 = await waitToast(/Tags saved to 2 files|\d+ saved, \d+ failed/, 20000);
    await page.waitForTimeout(500); await pollToasts();
    await shot('5b-after-batch-toast');
    await waitGone();
    result.phases.step5 = { gapMs: t5c - t5s, toast: t5, savedBeforeClick: t5 ? t5.at < t5c : null, form: await form(), genresChips: await block('Genres').innerText() };
    await shot('5c-form-on-a');
    const f5 = result.phases.step5.form;
    ok('5-gap', result.phases.step5.gapMs < DELAY && t5 && t5.at > t5c, result.phases.step5);
    ok('5-toast', t5?.text === 'Tags saved to 2 files', t5);
    ok('5-form-shows-a', f5.header === 'a.wav' && f5.title === 'A-title' && f5.category === 'R20A' && f5.saveDisabled, f5);

    phase = 'step6';
    await selectOnly('c.wav');
    await fieldIn('Category (UCS)').fill('R20C');
    const t6 = await saveAndWait(/Save Tags/, /Tags saved/);
    await page.waitForTimeout(400); await pollToasts();
    result.phases.step6 = { toast: t6, form: await form() };
    await shot('6-c-saved');
    await waitGone();
    const f6 = result.phases.step6.form;
    ok('6-c-regression', f6.category === 'R20C' && f6.saveDisabled && t6?.text === 'Tags saved' && f6.header === 'c.wav', result.phases.step6);
  }

  phase = 'step7';
  result.phases.readers = {};
  for (const n of NAMES) { const p = join(dir, n); result.phases.readers[n] = { ffprobe: ffprobe(p), mm: await mmRead(p) }; }
  const R = result.phases.readers;
  const ff = (n, k) => R[n].ffprobe[k] ?? R[n].ffprobe[k.toLowerCase()];
  const sum = (n) => ({ ffTitle: ff(n, 'title') ?? ff(n, 'INAM'), ffComment: ff(n, 'comment') ?? ff(n, 'ICMT'), ffICAT: ff(n, 'ICAT'), ffGenre: ff(n, 'genre') ?? ff(n, 'IGNR'), ffArtist: ff(n, 'artist') ?? ff(n, 'IART'), mmTitle: R[n].mm.common?.title, mmComment: R[n].mm.common?.comment, mmICAT: R[n].mm.native?.ICAT, mmGenre: R[n].mm.common?.genre, mmArtist: R[n].mm.common?.artist });
  result.phases.readerSummary = Object.fromEntries(NAMES.map((n) => [n, sum(n)]));
  const S = result.phases.readerSummary;
  const cmt = (v) => Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : x?.text)).join('|') : v;
  if (FULL) {
    ok('7-b-ffprobe', S['b.wav'].ffTitle === 'B-title' && S['b.wav'].ffComment === 'B-comment' && S['b.wav'].ffICAT === 'R20B', S['b.wav']);
    ok('7-b-mm', S['b.wav'].mmTitle === 'B-title' && cmt(S['b.wav'].mmComment) === 'B-comment' && S['b.wav'].mmICAT === 'R20B', S['b.wav']);
    ok('7-a-ffprobe', S['a.wav'].ffTitle === 'A-title' && S['a.wav'].ffComment === 'A-comment' && S['a.wav'].ffICAT === 'R20A', S['a.wav']);
    ok('7-a-mm', S['a.wav'].mmTitle === 'A-title' && cmt(S['a.wav'].mmComment) === 'A-comment' && S['a.wav'].mmICAT === 'R20A', S['a.wav']);
    ok('7-genre-batch-ab', ['a.wav', 'b.wav'].every((n) => String(S[n].ffGenre).includes('R20Batch') && JSON.stringify(S[n].mmGenre ?? '').includes('R20Batch')), [S['a.wav'], S['b.wav']]);
    ok('7-c-icat', S['c.wav'].ffICAT === 'R20C' && S['c.wav'].mmICAT === 'R20C', S['c.wav']);
  } else {
    ok('8-red-b-has-A-values-ffprobe', S['b.wav'].ffTitle === 'A-title' && S['b.wav'].ffComment === 'A-comment', S['b.wav']);
    ok('8-red-b-has-A-values-mm', S['b.wav'].mmTitle === 'A-title' && cmt(S['b.wav'].mmComment) === 'A-comment', S['b.wav']);
  }
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`;
  try { await shot('error'); } catch {}
} finally {
  result.pageErrors = pageErrors;
  result.toastsSeen = toastsSeen.map((t) => t.k);
  ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
  writeFileSync(join(OUT, `r20-5-${LABEL}.json`), JSON.stringify(result, null, 2));
  await app.close().catch(() => {});
}
console.log(JSON.stringify({ checks: result.checks, error: result.error, toasts: result.toastsSeen }, null, 1));
