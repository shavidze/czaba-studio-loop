import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, statSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-19';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), 'c-r19-'));
const dir = join(work, 'wavs'); mkdirSync(dir);
const big = join(work, 'big'); mkdirSync(big);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav', 'c.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
execFileSync('touch', ['-d', '2020-01-02 12:00:00', ...NAMES.map((n) => join(dir, n))]);
for (let i = 0; i < 200; i++) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(big, `f${String(i).padStart(3, '0')}.wav`));
const result = { workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const fmt = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) {
  try { const m = await mm.parseFile(p); return { genre: m.common.genre, comment: m.common.comment, native: Object.fromEntries(Object.entries(m.native).map(([k, v]) => [k, v.map((t) => [t.id, typeof t.value === 'string' ? t.value.slice(0, 40) : t.value])])) }; } catch (e) { return { error: String(e) }; }
}
let folder = dir;
const launch = async () => {
  const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, folder);
  await page.waitForTimeout(800);
  return { app, page };
};
let app; let page; let phase = 'launch1';
const pageErrors = []; const toastsSeen = [];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const cells = async () => { const r = {}; for (const n of NAMES) { const s = await row(n).locator('xpath=./span').allTextContents(); r[n] = { size: s[0], date: s[4], selected: /bg-brand\/10/.test(await row(n).getAttribute('class')) }; } return r; };
const expected = async () => { const r = {}; for (const n of NAMES) { const st = statSync(join(dir, n)); r[n] = { size: fmt(st.size), bytes: st.size, mtime: st.mtime.toISOString(), date: await page.evaluate((iso) => new Date(iso).toLocaleDateString(), st.mtime.toISOString()) }; } return r; };
const order = async () => (await page.locator('span.truncate.text-foreground').allTextContents()).filter((t) => t.endsWith('.wav'));
const watchToasts = async (ms) => { const end = Date.now() + ms; while (Date.now() < end) { const t = await page.locator('body').innerText(); for (const m of t.match(/(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g) ?? []) if (!toastsSeen.includes(`${phase}: ${m}`)) toastsSeen.push(`${phase}: ${m}`); await page.waitForTimeout(150); } };
const save = async (btn) => {
  const t0 = Date.now();
  await page.getByRole('button', { name: btn }).click();
  const toast = page.getByText(/Tags saved|saved, \d+ failed|Failed|Error/).first();
  await toast.waitFor({ timeout: 30000 });
  const ms = Date.now() - t0;
  const text = await toast.textContent();
  await watchToasts(3500);
  return { text, ms };
};
const openFolder = async (first) => {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell(first).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
};
const track = (p) => p.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
const COMMENT = 'C'.repeat(300);
try {
  ({ app, page } = await launch()); track(page);
  phase = 'scan'; await openFolder('a.wav');
  result.phases.scan = { cells: await cells(), expected: await expected() };
  await shot('r19-5-0-scan');

  phase = 'step1';
  await nameCell('a.wav').click(); await page.waitForTimeout(800);
  await fieldIn('Category (UCS)').fill('R19Single');
  await fieldIn('Comment').fill(COMMENT);
  const s1 = await save(/Save Tags/);
  const c1 = await cells(); const e1 = await expected();
  result.phases.step1 = { toast: s1, cells: c1, expected: e1, categoryInput: await fieldIn('Category (UCS)').inputValue(), commentLen: (await fieldIn('Comment').inputValue()).length };
  await shot('r19-5-1-single-save');
  ok('1-a-size-matches-stat', c1['a.wav'].size === e1['a.wav'].size, [c1['a.wav'].size, e1['a.wav'].size]);
  ok('1-a-size-changed', c1['a.wav'].size !== result.phases.scan.cells['a.wav'].size, [result.phases.scan.cells['a.wav'].size, c1['a.wav'].size]);
  ok('1-a-date-matches-stat', c1['a.wav'].date === e1['a.wav'].date && c1['a.wav'].date !== result.phases.scan.cells['a.wav'].date, [c1['a.wav'].date, e1['a.wav'].date, result.phases.scan.cells['a.wav'].date]);
  ok('1-bc-unchanged', ['b.wav', 'c.wav'].every((n) => c1[n].size === result.phases.scan.cells[n].size && c1[n].date === result.phases.scan.cells[n].date), c1);
  ok('1-selection-editor-on-a', c1['a.wav'].selected && !c1['b.wav'].selected && !c1['c.wav'].selected && result.phases.step1.categoryInput === 'R19Single', result.phases.step1.categoryInput);
  ok('1-toast', s1.text?.includes('Tags saved'), s1.text);

  phase = 'step2';
  await nameCell('b.wav').click(); await page.waitForTimeout(500);
  await nameCell('c.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
  const g = fieldIn('Genres'); await g.click(); await g.fill('R19 Batch'); await g.press('Enter');
  const s2 = await save(/Save to 2 files/);
  const c2 = await cells(); const e2 = await expected();
  result.phases.step2 = { toast: s2, cells: c2, expected: e2, selText: (await page.getByText(/2 files/).allTextContents()).slice(0, 3) };
  await shot('r19-5-2-batch-save');
  ok('2-toast', s2.text === 'Tags saved to 2 files', s2.text);
  ok('2-bc-match-stat', ['b.wav', 'c.wav'].every((n) => c2[n].size === e2[n].size && c2[n].date === e2[n].date), [c2, e2]);
  ok('2-a-kept', c2['a.wav'].size === c1['a.wav'].size && c2['a.wav'].date === c1['a.wav'].date, c2['a.wav']);
  ok('2-selection-2', c2['b.wav'].selected && c2['c.wav'].selected && !c2['a.wav'].selected, c2);

  phase = 'step3';
  const cStatBefore = statSync(join(dir, 'c.wav'));
  chmodSync(join(dir, 'c.wav'), 0o444);
  await nameCell('a.wav').click(); await page.waitForTimeout(500);
  await nameCell('b.wav').click(); await page.waitForTimeout(500);
  await nameCell('c.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
  await fieldIn('Category (UCS)').fill('R19Partial');
  let s3 = await save(/Save to 2 files/);
  result.phases.step3 = { mode: '444', toast444: s3 };
  if (!/1 saved, 1 failed/.test(s3.text ?? '')) {
    result.phases.step3.note = '444 did not fail the write';
  }
  const c3 = await cells(); const e3 = await expected(); const cStatAfter = statSync(join(dir, 'c.wav'));
  Object.assign(result.phases.step3, { cells: c3, expected: e3, cStatBefore: [cStatBefore.size, cStatBefore.mtime.toISOString()], cStatAfter: [cStatAfter.size, cStatAfter.mtime.toISOString()] });
  await shot('r19-5-3-partial-save');
  ok('3-toast-1-saved-1-failed', /1 saved, 1 failed/.test(s3.text ?? ''), s3.text);
  ok('3-b-matches-stat', c3['b.wav'].size === e3['b.wav'].size && c3['b.wav'].date === e3['b.wav'].date && e3['b.wav'].mtime !== e2['b.wav'].mtime, [c3['b.wav'], e3['b.wav'], e2['b.wav'].mtime]);
  ok('3-c-cells-kept-and-stat-unchanged', c3['c.wav'].size === c2['c.wav'].size && c3['c.wav'].date === c2['c.wav'].date && cStatAfter.size === cStatBefore.size && cStatAfter.mtimeMs === cStatBefore.mtimeMs, [c3['c.wav'], c2['c.wav']]);

  phase = 'step4';
  await page.getByRole('button', { name: 'Size', exact: true }).click(); await page.waitForTimeout(500);
  const o4 = await order(); const e4 = await expected();
  result.phases.step4 = { order: o4, bytes: Object.fromEntries(NAMES.map((n) => [n, e4[n].bytes])) };
  await shot('r19-5-4-size-sort');
  ok('4-size-sort-ascending', o4.every((n, i) => i === 0 || e4[o4[i - 1]].bytes <= e4[n].bytes), result.phases.step4);

  phase = 'step5';
  chmodSync(join(dir, 'c.wav'), 0o644);
  result.phases.readers = {};
  for (const n of NAMES) { const p = join(dir, n); result.phases.readers[n] = { ffprobe: ffprobe(p), mm: await mmRead(p) }; }
  const R = result.phases.readers;
  const mmTag = (n, id) => (R[n].mm.native?.exif ?? R[n].mm.native?.RIFF ?? Object.values(R[n].mm.native ?? {}).flat()).filter((t) => t[0] === id).map((t) => t[1]);
  const ff = (n, k) => R[n].ffprobe[k] ?? R[n].ffprobe[k.toLowerCase()];
  result.phases.readerSummary = Object.fromEntries(NAMES.map((n) => [n, { ffICAT: ff(n, 'ICAT'), ffIGNR: ff(n, 'IGNR') ?? ff(n, 'genre'), mmICAT: mmTag(n, 'ICAT'), mmIGNR: mmTag(n, 'IGNR'), mmGenre: R[n].mm.genre, ffKeys: Object.keys(R[n].ffprobe) }]));

  phase = 'step6';
  const before6 = await cells();
  await app.close(); app = null;
  ({ app, page } = await launch()); track(page);
  await openFolder('a.wav');
  const c6 = await cells();
  result.phases.step6 = { before: before6, after: c6 };
  await shot('r19-5-6-relaunch');
  ok('6-relaunch-cells-equal', NAMES.every((n) => c6[n].size === before6[n].size && c6[n].date === before6[n].date), result.phases.step6);
  await app.close(); app = null;

  phase = 'step7';
  folder = big;
  ({ app, page } = await launch()); track(page);
  await openFolder('f000.wav');
  await nameCell('f000.wav').click(); await page.waitForTimeout(800);
  await fieldIn('Category (UCS)').fill('R19Timing');
  const s7 = await save(/Save Tags/);
  result.phases.step7 = { files: 200, toast: s7.text, clickToToastMs: s7.ms };
  await shot('r19-5-7-timing-200');
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`; console.error(e);
  if (page) await shot(`r19-5-error-${phase}`).catch(() => {});
} finally {
  result.pageErrors = pageErrors; result.toastsSeen = toastsSeen;
  writeFileSync(join(OUT, 'r19-5-result.json'), JSON.stringify(result, null, 2));
  if (app) await app.close();
}
