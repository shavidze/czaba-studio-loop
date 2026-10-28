import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-42';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(REPO + '/node_modules/music-metadata/lib/index.js');

const STD = [
  ['title', 'Title', 'text', 'INAM'], ['artists', 'Artists', 'tags', 'IART'], ['album', 'Album / Pack', 'text', 'IPRD'],
  ['genres', 'Genres', 'tags', 'IGNR'], ['bpm', 'BPM', 'number', 'IBPM'], ['year', 'Year', 'number', 'ICRD'],
  ['copyright', 'Copyright', 'text', 'ICOP'], ['publisher', 'Publisher', 'text', null], ['isrc', 'ISRC', 'text', null],
  ['track', 'Track #', 'number', 'ITRK'], ['comment', 'Comment', 'text', 'ICMT'], ['keywords', 'Keywords', 'text', 'IKEY'],
].map(([key, label, type, riff]) => (riff ? { key, label, type, riffChunkId: riff, standard: true } : { key, label, type, standard: true }));
const CAT_STD = { key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true };
const KEY_WARN = 'Category (UCS) is unavailable: custom field "Category" already uses key "category".';
const RIFF_WARN = 'Category (UCS) is unavailable: custom field "UCS Cat" already uses RIFF ID "ICAT".';

function rawInfo(path) {
  const b = readFileSync(path);
  const out = [];
  let o = 12;
  while (o + 8 <= b.length) {
    const id = b.toString('latin1', o, o + 4); const sz = b.readUInt32LE(o + 4);
    if (id === 'LIST' && b.toString('latin1', o + 8, o + 12) === 'INFO') {
      let p = o + 12;
      while (p + 8 <= o + 8 + sz) {
        const sid = b.toString('latin1', p, p + 4); const ssz = b.readUInt32LE(p + 4);
        out.push({ id: sid, size: ssz, value: b.toString('utf8', p + 8, p + 8 + ssz).replace(/\0+$/, '') });
        p += 8 + ssz + (ssz & 1);
      }
    }
    o += 8 + sz + (sz & 1);
  }
  return out;
}
async function readers(path) {
  const m = await mm.parseFile(path);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => ({ id: t.id, value: t.value }));
  const ff = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', path]).toString());
  return { raw: rawInfo(path), musicMetadataNative: native, musicMetadataCommonCategory: m.common.category ?? null, ffprobe: ff.format?.tags ?? {} };
}

async function launch(cfg) {
  const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  const log = { pageErrors: [], consoleErrors: [] };
  page.on('pageerror', (e) => log.pageErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.consoleErrors.push(`${m.type()}: ${m.text()}`); });
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  const userData = await app.evaluate(({ app: a }) => a.getPath('userData'));
  return { app, page, log, userData };
}
async function openFolderSelect(app, page, dir) {
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.getByRole('button', { name: /Open Folder/ }).first().click();
  const cell = page.locator('span.truncate.text-foreground', { hasText: /^a\.wav$/ }).first();
  await cell.waitFor({ timeout: 30000 });
  await cell.click();
  await page.waitForTimeout(800);
}
async function openEditor(page) {
  await page.locator('button[title="Customize Fields"]').first().click();
  await page.locator('span', { hasText: /^Customize Fields$/ }).first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(400);
}
async function editorState(page) {
  return page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('button')).map((b) => (b.textContent ?? '').trim()).filter((t) => t.startsWith('+ '));
    const warns = Array.from(document.querySelectorAll('p.text-warning')).map((p) => ({ text: p.textContent, cls: p.className, color: getComputedStyle(p).color, inFieldset: !!p.closest('fieldset') }));
    const hiddenTitle = Array.from(document.querySelectorAll('span')).some((s) => s.textContent === 'Hidden Standard Fields');
    const rows = Array.from(document.querySelectorAll('fieldset div.rounded.border')).map((r) => r.textContent);
    return { chips, warns, hiddenTitle, rows };
  });
}
function fieldInput(page, label) {
  return page.locator('div.space-y-1', { has: page.locator(`label:text-is("${label}")`) }).locator('input').first();
}
async function clickDone(page) {
  await page.getByRole('button', { name: /^Done$/ }).click();
  await page.waitForTimeout(1200);
}
async function saveValue(page, label, value) {
  const inp = fieldInput(page, label);
  await inp.waitFor({ timeout: 10000 });
  await inp.fill(value);
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(2500);
}
function setup(name, schema) {
  const work = mkdtempSync(join(tmpdir(), `c-r42-${name}-`));
  const fa = join(work, 'fa'); mkdirSync(fa);
  const cfg = join(work, 'xdg');
  for (const d of ['Electron', 'czaba-tag-manager', 'Czaba Tag Manager']) {
    mkdirSync(join(cfg, d), { recursive: true });
    if (schema) writeFileSync(join(cfg, d, 'schema.json'), JSON.stringify(schema, null, 2));
  }
  copyFileSync(join(REPO, 'tests/fixtures/sample.wav'), join(fa, 'a.wav'));
  return { work, fa, cfg, wav: join(fa, 'a.wav') };
}
const results = {};
async function runCase(name, schema, body) {
  const s = setup(name, schema);
  const r = { work: s.work };
  results[name] = r;
  let L;
  try {
    r.before = await readers(s.wav);
    L = await launch(s.cfg);
    r.userData = L.userData;
    await openFolderSelect(L.app, L.page, s.fa);
    await body({ ...s, ...L, r });
  } catch (e) {
    r.error = String(e?.stack ?? e);
    await L?.page.screenshot({ path: join(OUT, `${name}-error.png`) }).catch(() => {});
  } finally {
    if (L) { r.log = L.log; await L.app.close().catch(() => {}); }
    writeFileSync(join(OUT, 'r42-results.json'), JSON.stringify(results, null, 2));
  }
}

const only = process.argv[2];
const want = (n) => !only || only === n;

if (want('caseA')) await runCase('caseA', [...STD, { key: 'category', label: 'Category', type: 'text', riffChunkId: 'CATE' }], async ({ page, wav, userData, r }) => {
  await openEditor(page);
  r.editor = await editorState(page);
  r.expectedWarningShown = r.editor.warns.some((w) => w.text === KEY_WARN);
  await page.screenshot({ path: join(OUT, 'r42-4a-editor.png') });
  await clickDone(page);
  await saveValue(page, 'Category', 'DOORWood');
  await page.screenshot({ path: join(OUT, 'r42-4a-saved.png') });
  r.after = await readers(wav);
  r.schemaFile = JSON.parse(readFileSync(join(userData, 'schema.json'), 'utf8'));
  await openEditor(page);
  const row = page.locator('fieldset div.rounded.border', { has: page.locator('span:text-is("Category")') }).first();
  await row.locator('button').last().click();
  await page.waitForTimeout(500);
  r.afterDelete = await editorState(page);
  await page.screenshot({ path: join(OUT, 'r42-4a-after-delete.png') });
});

if (want('caseB')) await runCase('caseB', [...STD, { key: 'ucs_cat', label: 'UCS Cat', type: 'text', riffChunkId: 'ICAT' }], async ({ page, wav, r }) => {
  await openEditor(page);
  r.editor = await editorState(page);
  r.expectedWarningShown = r.editor.warns.some((w) => w.text === RIFF_WARN);
  await page.screenshot({ path: join(OUT, 'r42-4b-editor.png') });
  await clickDone(page);
  await saveValue(page, 'UCS Cat', 'DOORWood');
  await page.screenshot({ path: join(OUT, 'r42-4b-saved.png') });
  r.after = await readers(wav);
});

if (want('regress')) await runCase('regress', STD, async ({ page, app, wav, userData, cfg, fa, r, log }) => {
  await openEditor(page);
  r.editor = await editorState(page);
  await page.screenshot({ path: join(OUT, 'r42-5-editor-before.png') });
  await page.locator('button[title="Hide standard field"]').first().click();
  await page.waitForTimeout(400);
  r.afterHideTitle = await editorState(page);
  await page.getByRole('button', { name: '+ Title', exact: true }).click();
  await page.waitForTimeout(400);
  r.afterShowTitle = await editorState(page);
  await page.getByRole('button', { name: '+ Category (UCS)', exact: true }).click();
  await page.waitForTimeout(400);
  r.afterEnableCat = await editorState(page);
  await page.screenshot({ path: join(OUT, 'r42-5-editor-enabled.png') });
  await clickDone(page);
  r.schemaFile = JSON.parse(readFileSync(join(userData, 'schema.json'), 'utf8'));
  r.schemaKeys = r.schemaFile.map((f) => f.key);
  await app.close();
  const L2 = await launch(cfg);
  try {
    await openFolderSelect(L2.app, L2.page, fa);
    r.panelLabelsAfterRelaunch = await L2.page.evaluate(() => Array.from(document.querySelectorAll('label')).map((l) => l.textContent));
    await saveValue(L2.page, 'Category (UCS)', 'DOORWood');
    await L2.page.screenshot({ path: join(OUT, 'r42-5-relaunch-saved.png') });
    r.after = await readers(wav);
    r.log2 = L2.log;
  } finally { await L2.app.close().catch(() => {}); }
});

if (want('both')) await runCase('both', [...STD, CAT_STD, { key: 'category', label: 'Category', type: 'text', riffChunkId: 'CATE' }], async ({ page, wav, userData, r }) => {
  r.panelLabels = await page.evaluate(() => Array.from(document.querySelectorAll('label')).map((l) => l.textContent));
  await page.screenshot({ path: join(OUT, 'r42-6-panel.png') });
  const inputs = page.locator('div.space-y-1', { has: page.locator('label:text-matches("^Category")') }).locator('input');
  r.categoryInputCount = await inputs.count();
  await inputs.first().fill('DOORWood');
  await page.waitForTimeout(300);
  r.inputValuesAfterTyping = await inputs.evaluateAll((els) => els.map((e) => e.value));
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.waitForTimeout(2500);
  r.after = await readers(wav);
  await openEditor(page);
  r.editor = await editorState(page);
  await page.screenshot({ path: join(OUT, 'r42-6-editor.png') });
  await page.locator('fieldset div.rounded.border', { has: page.locator('span:text-is("Category (UCS)")') }).locator('button[title="Hide standard field"]').click();
  await page.waitForTimeout(500);
  r.afterHide = await editorState(page);
  await page.screenshot({ path: join(OUT, 'r42-6-after-hide.png') });
  await clickDone(page);
  r.schemaFileAfterHide = JSON.parse(readFileSync(join(userData, 'schema.json'), 'utf8')).map((f) => `${f.key}:${f.riffChunkId}:${f.standard ?? false}`);
});

console.log(JSON.stringify(results, null, 2));
