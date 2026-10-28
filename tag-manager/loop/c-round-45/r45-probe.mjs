import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-45';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(REPO + '/node_modules/music-metadata/lib/index.js');

const STD = [
  ['title', 'Title', 'text', 'INAM'], ['artists', 'Artists', 'tags', 'IART'], ['album', 'Album / Pack', 'text', 'IPRD'],
  ['genres', 'Genres', 'tags', 'IGNR'], ['bpm', 'BPM', 'number', 'IBPM'], ['year', 'Year', 'number', 'ICRD'],
  ['copyright', 'Copyright', 'text', 'ICOP'], ['publisher', 'Publisher', 'text', null], ['isrc', 'ISRC', 'text', null],
  ['track', 'Track #', 'number', 'ITRK'], ['comment', 'Comment', 'text', 'ICMT'], ['keywords', 'Keywords', 'text', 'IKEY'],
].map(([key, label, type, riff]) => (riff ? { key, label, type, riffChunkId: riff, standard: true } : { key, label, type, standard: true }));
const SCHEMA = [...STD, { key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true }];

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
function rawInfo(path) {
  const b = readFileSync(path); const subs = []; const chunks = []; let o = 12;
  while (o + 8 <= b.length) {
    const id = b.toString('latin1', o, o + 4); const sz = b.readUInt32LE(o + 4);
    const ltype = id === 'LIST' ? b.toString('latin1', o + 8, o + 12) : undefined;
    chunks.push(ltype ? `${id}/${ltype}:${sz}` : `${id}:${sz}`);
    if (ltype === 'INFO') {
      let p = o + 12;
      while (p + 8 <= o + 8 + sz) { const sid = b.toString('latin1', p, p + 4); const ssz = b.readUInt32LE(p + 4); subs.push({ id: sid, size: ssz, value: b.toString('utf8', p + 8, p + 8 + ssz).replace(/\0+$/, '') }); p += 8 + ssz + (ssz & 1); }
    }
    o += 8 + sz + (sz & 1);
  }
  return { chunks, subs };
}
async function readers(path) {
  const m = await mm.parseFile(path);
  const nat = {}; for (const [k, v] of Object.entries(m.native)) nat[k] = Object.fromEntries(v.map((t) => [t.id, typeof t.value === 'string' ? t.value : JSON.stringify(t.value)]));
  const ff = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', path]).toString());
  const raw = rawInfo(path);
  return { chunks: raw.chunks, rawSubs: raw.subs, raw: Object.fromEntries(raw.subs.map((r) => [r.id, r.value])), zeroSize: raw.subs.filter((s) => s.size === 0).map((s) => s.id), mm: nat, ffprobe: ff.format?.tags ?? {} };
}
async function launch(cfg, build) {
  const app = await _electron.launch({ args: ['--no-sandbox', join(build, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  const log = { pageErrors: [], consoleErrors: [] };
  page.on('pageerror', (e) => log.pageErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') log.consoleErrors.push(m.text()); });
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  return { app, page, log };
}
function mkcfg(work) {
  const cfg = join(work, 'xdg');
  for (const d of ['Electron', 'czaba-tag-manager', 'Czaba Tag Manager']) { mkdirSync(join(cfg, d), { recursive: true }); writeFileSync(join(cfg, d, 'schema.json'), JSON.stringify(SCHEMA, null, 2)); }
  return cfg;
}
async function openFolder(app, page, dir, firstName) {
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.getByRole('button', { name: /Open Folder/ }).first().click();
  await rowOf(page, firstName).waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
}
function rowOf(page, name) { return page.locator('div.grid', { has: page.locator(`span.truncate.text-foreground:text-is("${name}")`) }).first(); }
function fieldInput(page, label) { return page.locator('div.space-y-1', { has: page.locator(`label:text-is("${label}")`) }).locator('input').first(); }
async function waitToast(page, re) { const t = page.locator('div.fixed span.text-sm', { hasText: re }).first(); await t.waitFor({ timeout: 60000 }); return t.textContent(); }
async function waitToastGone(page) { await page.locator('div.fixed span.text-sm').first().waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}); }
async function select(page, name) { await rowOf(page, name).click(); await page.waitForTimeout(600); }

const build = process.argv[2]; const tag = process.argv[3];
const results = { tag, build };
const save = () => writeFileSync(join(OUT, `r45-results-${tag}.json`), JSON.stringify(results, null, 2));
const work = mkdtempSync(join(tmpdir(), `c-r45-${tag}-`));
const F = join(work, 'F'); mkdirSync(F, { recursive: true });
const src = join(work, 'src.wav');
execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', src]);
const names = ['r4.wav', 'r5.wav', 'b1.wav', 'b2.wav', 'b3.wav', 'u1.wav', 'u2.wav'];
for (const n of names) copyFileSync(src, join(F, n));
const P = (n) => join(F, n);
results.work = work; results.srcReaders = await readers(src);
const cfg = mkcfg(work);
const { app, page, log } = await launch(cfg, build);
try {
  results.seed = await page.evaluate(async ([schema, files]) => {
    const out = {};
    for (const [p, meta] of files) { try { await window.api.writeMetadata(p, meta, schema); out[p] = 'ok'; } catch (e) { out[p] = String(e.message ?? e); } }
    return out;
  }, [SCHEMA, [
    [P('u1.wav'), { keywords: 'door, slam', category: 'DOORWood' }],
    [P('u2.wav'), { keywords: 'door, slam', category: 'GLASBrk' }],
    [P('b1.wav'), { keywords: 'door, slam', category: 'DOORWood' }],
    [P('b2.wav'), { keywords: 'door, slam', category: 'DOORMetl' }],
    [P('b3.wav'), { keywords: 'door, slam', category: 'GLASBrk' }],
  ]]);
  results.seedReaders = {}; for (const n of ['b1.wav', 'b2.wav', 'b3.wav']) results.seedReaders[n] = await readers(P(n));
  await openFolder(app, page, F, 'r4.wav');

  // R45-4: seed r4 via UI, then clear Keywords
  await select(page, 'r4.wav');
  await fieldInput(page, 'Category (UCS)').fill('DOORWood');
  await fieldInput(page, 'Keywords').fill('door, slam');
  await fieldInput(page, 'Comment').fill('მძიმე კარი');
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  results.r4seed = { toast: await waitToast(page, /Tags saved/) };
  await page.waitForTimeout(500);
  results.r4seed.readers = await readers(P('r4.wav'));
  await waitToastGone(page);
  await page.screenshot({ path: join(OUT, `r45-4-${tag}-before-clear.png`) });
  await fieldInput(page, 'Keywords').fill('');
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  results.r4 = { toast: await waitToast(page, /Tags saved/) };
  await page.waitForTimeout(500);
  results.r4.readers = await readers(P('r4.wav'));
  await waitToastGone(page);
  await select(page, 'r5.wav'); await select(page, 'r4.wav');
  results.r4.editorAfterReread = { keywords: await fieldInput(page, 'Keywords').inputValue(), category: await fieldInput(page, 'Category (UCS)').inputValue(), comment: await fieldInput(page, 'Comment').inputValue() };
  await page.screenshot({ path: join(OUT, `r45-4-${tag}-after-clear.png`) });
  save();

  // R45-5: fresh file, Title only; then custom Note field left empty
  await select(page, 'r5.wav');
  await fieldInput(page, 'Title').fill('R45');
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  results.r5a = { toast: await waitToast(page, /Tags saved/) };
  await page.waitForTimeout(500);
  results.r5a.readers = await readers(P('r5.wav'));
  await page.screenshot({ path: join(OUT, `r45-5-${tag}-after-first.png`) });
  await waitToastGone(page);
  save();
  if (tag !== 'base') {
    await page.locator('button[title="Customize Fields"]').click();
    await page.waitForTimeout(400);
    await page.getByPlaceholder('Field name (e.g. Client)').fill('Note');
    await page.getByRole('button', { name: /Add Field/ }).click();
    await page.waitForTimeout(300);
    results.activeFields = await page.locator('span.text-dim.text-\\[10px\\].font-mono').allTextContents();
    await page.screenshot({ path: join(OUT, `r45-5-${tag}-customize.png`) });
    await page.getByRole('button', { name: /^Done$/ }).click();
    await page.waitForTimeout(800);
    results.schemaFiles = {};
    for (const d of readdirSync(cfg)) { try { results.schemaFiles[d] = JSON.parse(readFileSync(join(cfg, d, 'schema.json'), 'utf8')).filter((f) => !f.standard); } catch {} }
    await select(page, 'r4.wav'); await select(page, 'r5.wav');
    results.r5b = { noteVisible: await fieldInput(page, 'Note').count() };
    await fieldInput(page, 'Title').fill('R45b');
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Save Tags/ }).click();
    results.r5b.toast = await waitToast(page, /Tags saved/);
    await page.waitForTimeout(500);
    results.r5b.readers = await readers(P('r5.wav'));
    await page.screenshot({ path: join(OUT, `r45-5-${tag}-after-second.png`) });
    await waitToastGone(page);
    save();

    // R45-6: batch clear Keywords on b1..b3
    const unsel = ['u1.wav', 'u2.wav', 'r4.wav', 'r5.wav'];
    results.r6 = { hashBefore: Object.fromEntries(unsel.map((n) => [n, sha(P(n))])) };
    await select(page, 'b1.wav');
    await rowOf(page, 'b2.wav').click({ modifiers: ['Control'] });
    await rowOf(page, 'b3.wav').click({ modifiers: ['Control'] });
    await page.waitForTimeout(600);
    results.r6.keywordsShown = await fieldInput(page, 'Keywords').inputValue();
    await page.screenshot({ path: join(OUT, `r45-6-${tag}-before.png`) });
    await fieldInput(page, 'Keywords').click();
    await page.keyboard.type('x');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    results.r6.keywordsAfterEdit = await fieldInput(page, 'Keywords').inputValue();
    results.r6.saveEnabled = (await page.getByRole('button', { name: /Save to 3 files/ }).getAttribute('aria-disabled')) !== 'true';
    await page.getByRole('button', { name: /Save to 3 files/ }).click();
    results.r6.toast = await waitToast(page, /Tags saved|failed/);
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, `r45-6-${tag}-after.png`) });
    results.r6.readers = {}; for (const n of ['b1.wav', 'b2.wav', 'b3.wav']) results.r6.readers[n] = await readers(P(n));
    results.r6.hashAfter = Object.fromEntries(unsel.map((n) => [n, sha(P(n))]));
    results.r6.unselectedIdentical = unsel.every((n) => results.r6.hashBefore[n] === results.r6.hashAfter[n]);
  }
} catch (e) {
  results.error = String(e?.stack ?? e);
  await page.screenshot({ path: join(OUT, `r45-${tag}-error.png`) }).catch(() => {});
} finally { results.log = log; save(); await app.close().catch(() => {}); }
console.log(JSON.stringify(results, null, 1).slice(0, 3000));
