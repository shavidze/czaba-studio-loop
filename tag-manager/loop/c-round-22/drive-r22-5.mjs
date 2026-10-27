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
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-22';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), `c-r22-${LABEL}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav', 'c.wav', 'd.wav', 'e.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { label: LABEL, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) {
  try { const m = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(m.native)) for (const t of v) native[`${k}:${t.id}`] = t.value; return { common: { title: m.common.title, artist: m.common.artist, artists: m.common.artists }, native }; } catch (e) { return { error: String(e) }; }
}
const app = await _electron.launch({ args: ['--no-sandbox', join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);
let phase = 'scan';
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const shot = (name) => page.screenshot({ path: join(OUT, `r22-5-${LABEL}-${name}.png`) });
const waitText = async (re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return m[0]; await page.waitForTimeout(50); } return null; };
const state = async () => {
  const rows = (await page.locator('span.truncate.text-foreground').evaluateAll((els) => els.map((el) => {
    const row = el.parentElement?.parentElement; return { name: el.textContent, isRow: !!row && row.className.includes('grid-cols-[1fr_80px'), selected: !!row && row.className.includes('bg-brand/10') };
  }))).filter((r) => r.isRow);
  const body = await page.locator('body').innerText();
  return {
    order: rows.map((r) => r.name),
    selected: rows.filter((r) => r.selected).map((r) => r.name).sort(),
    panel: (body.match(/\d+ files selected/) ?? [null])[0],
    toolbar: (body.match(/\d+ selected ·/) ?? [null])[0],
    saveBtn: (await page.locator('button', { hasText: /Save Tags|Save to \d+ files|Saving/ }).first().textContent().catch(() => null))?.trim() ?? null,
  };
};
const click = async (n, mods) => { await nameCell(n).click(mods ? { modifiers: mods } : undefined); await page.waitForTimeout(400); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
  await shot('0-scan');

  phase = 'step1';
  await click('a.wav');
  await fieldIn('Category (UCS)').fill('R22A');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  result.phases.step1 = { toast: await waitText(/Tags saved/) };
  await page.waitForTimeout(500);
  await click('c.wav', ['Shift']);
  result.phases.step1.after = await state();
  await shot('1-after-save-shift-c');
  const s1 = result.phases.step1.after;
  if (FULL) ok('1-three-selected', s1.panel === '3 files selected' && s1.toolbar === '3 selected ·' && eq(s1.selected, ['a.wav', 'b.wav', 'c.wav']), result.phases.step1);
  else ok('7-red-only-c', eq(s1.selected, ['c.wav']) && s1.panel === null && s1.saveBtn === 'Save Tags', result.phases.step1);
  await page.waitForTimeout(3500);

  phase = 'step2';
  await fieldIn('Category (UCS)').fill('R22Range');
  const btn = await page.locator('button', { hasText: /Save Tags|Save to \d+ files/ }).first().textContent();
  await page.locator('button', { hasText: /Save Tags|Save to \d+ files/ }).first().click();
  result.phases.step2 = { button: btn?.trim(), toast: await waitText(FULL ? /Tags saved to 3 files/ : /Tags saved[^\n]*/) };
  await page.waitForTimeout(500);
  result.phases.step2.after = await state();
  await shot('2-after-range-save');
  if (FULL) ok('2-saved-to-3', result.phases.step2.button === 'Save to 3 files' && result.phases.step2.toast === 'Tags saved to 3 files', result.phases.step2);
  else ok('7-red-button-save-tags', result.phases.step2.button === 'Save Tags', result.phases.step2);
  await page.waitForTimeout(3500);

  if (FULL) {
    phase = 'step3';
    await click('b.wav');
    await page.locator('button', { hasText: /^Name/ }).first().click();
    await page.waitForTimeout(400);
    const order3 = (await state()).order;
    await click('e.wav', ['Shift']);
    result.phases.step3 = { order: order3, after: await state() };
    await shot('3-sorted-desc-shift-e');
    ok('3-four-selected', eq(order3, ['e.wav', 'd.wav', 'c.wav', 'b.wav', 'a.wav']) && result.phases.step3.after.panel === '4 files selected' && eq(result.phases.step3.after.selected, ['b.wav', 'c.wav', 'd.wav', 'e.wav']), result.phases.step3);

    phase = 'step4';
    await click('c.wav');
    await page.getByPlaceholder('Search files...').fill('.wav');
    await page.waitForTimeout(400);
    await click('a.wav', ['Shift']);
    result.phases.step4 = { after: await state() };
    await shot('4-search-shift-a');
    ok('4-three-selected', result.phases.step4.after.panel === '3 files selected' && eq(result.phases.step4.after.selected, ['a.wav', 'b.wav', 'c.wav']), result.phases.step4);

    phase = 'step5';
    await page.getByPlaceholder('Search files...').fill('');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Select All' }).click(); await page.waitForTimeout(300);
    result.phases.step5 = { afterSelectAll: await state() };
    await page.getByRole('button', { name: 'Deselect All' }).click(); await page.waitForTimeout(300);
    result.phases.step5.afterDeselect = await state();
    await click('d.wav', ['Shift']);
    result.phases.step5.after = await state();
    await shot('5-deselect-all-shift-d');
    ok('5-only-d', result.phases.step5.afterSelectAll.selected.length === 5 && result.phases.step5.afterDeselect.selected.length === 0 && eq(result.phases.step5.after.selected, ['d.wav']) && result.phases.step5.after.panel === null, result.phases.step5);

    phase = 'deviations';
    const dev = {};
    await page.locator('button', { hasText: /^Name/ }).first().click(); await page.waitForTimeout(300);
    dev.order = (await state()).order;
    await click('b.wav'); await click('d.wav', ['Shift']); dev.d1_afterBthenShiftD = (await state()).selected;
    await click('a.wav', ['Shift']); dev.d1_thenShiftA = (await state()).selected;
    await click('b.wav'); await click('d.wav', ['Control']); await click('e.wav', ['Shift']); dev.d2_bCtrlDShiftE = (await state()).selected;
    await click('a.wav'); await click('a.wav', ['Control']); dev.d3_afterCtrlDeselectA = (await state()).selected;
    await click('c.wav', ['Shift']); dev.d3_thenShiftC = (await state()).selected;
    await shot('6-deviations');
    result.phases.deviations = dev;
    ok('dev1-shift-moves-anchor', eq(dev.d1_afterBthenShiftD, ['b.wav', 'c.wav', 'd.wav']) && eq(dev.d1_thenShiftA, ['a.wav', 'b.wav', 'c.wav', 'd.wav']), dev);
    ok('dev2-range-added', eq(dev.d2_bCtrlDShiftE, ['b.wav', 'd.wav', 'e.wav']), dev);
    ok('dev3-empty-drops-anchor', eq(dev.d3_afterCtrlDeselectA, []) && eq(dev.d3_thenShiftC, ['c.wav']), dev);
  }

  phase = 'readers';
  result.phases.readers = {};
  for (const n of NAMES) { const p = join(dir, n); result.phases.readers[n] = { ffprobe: ffprobe(p), mm: await mmRead(p) }; }
  const R = result.phases.readers;
  const sum = (n) => ({ ffICAT: R[n].ffprobe.ICAT ?? R[n].ffprobe.icat ?? null, mmICAT: R[n].mm.native?.['exif:ICAT'] ?? null, ffArtist: R[n].ffprobe.artist ?? null, mmArtist: R[n].mm.common?.artist ?? null });
  const S = Object.fromEntries(NAMES.map((n) => [n, sum(n)]));
  result.phases.readerSummary = S;
  if (FULL) {
    ok('6-range-written', ['a.wav', 'b.wav', 'c.wav'].every((n) => S[n].ffICAT === 'R22Range' && S[n].mmICAT === 'R22Range'), S);
    ok('6-d-e-untouched', ['d.wav', 'e.wav'].every((n) => S[n].ffICAT !== 'R22Range' && S[n].mmICAT !== 'R22Range'), S);
  } else {
    ok('7-red-a-keeps-R22A', S['a.wav'].ffICAT === 'R22A' && S['a.wav'].mmICAT === 'R22A', S);
    ok('7-red-b-no-range', S['b.wav'].ffICAT !== 'R22Range' && S['b.wav'].mmICAT !== 'R22Range', S);
    ok('7-red-c-range', S['c.wav'].ffICAT === 'R22Range' && S['c.wav'].mmICAT === 'R22Range', S);
  }
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`;
  try { await shot('error'); } catch {}
} finally {
  result.pageErrors = pageErrors;
  ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
  writeFileSync(join(OUT, `r22-5-${LABEL}.json`), JSON.stringify(result, null, 2));
  await app.close().catch(() => {});
}
console.log(JSON.stringify({ checks: Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass])), error: result.error, summary: result.phases.readerSummary }, null, 1));
