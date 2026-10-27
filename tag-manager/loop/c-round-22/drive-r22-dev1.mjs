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
const NAMES = ['a.wav', 'b.wav', 'cx.wav', 'dx.wav', 'e.wav'];
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
  phase = 'dev1';
  await click('a.wav'); await click('cx.wav', ['Shift']);
  result.phases.afterRange = await state();
  await page.getByPlaceholder('Search files...').fill('x'); await page.waitForTimeout(400);
  result.phases.afterSearch = await state();
  await click('dx.wav', ['Shift']);
  result.phases.afterShiftDx = await state();
  await shot('dev1-discriminating');
  ok('dev1-shift-moved-anchor-to-cx', eq(result.phases.afterRange.selected, ['a.wav','b.wav','cx.wav']) && eq(result.phases.afterShiftDx.selected, ['cx.wav','dx.wav']), result.phases);
} catch (e) {
  result.error = `${phase}: ${String(e?.stack ?? e)}`;
  try { await shot('error'); } catch {}
} finally {
  result.pageErrors = pageErrors;
  ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
  writeFileSync(join(OUT, `r22-dev1-${LABEL}.json`), JSON.stringify(result, null, 2));
  await app.close().catch(() => {});
}
console.log(JSON.stringify({ checks: Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass])), error: result.error, phases: result.phases }, null, 1));
