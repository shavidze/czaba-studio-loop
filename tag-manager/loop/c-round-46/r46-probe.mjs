import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-46';
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
const save = () => writeFileSync(join(OUT, `r46-results-${tag}.json`), JSON.stringify(results, null, 2));
const shot = (n) => page.screenshot({ path: join(OUT, `r46-${n}-${tag}.png`) });
const work = mkdtempSync(join(tmpdir(), `c-r46-${tag}-`));
const F = join(work, 'F'); mkdirSync(F, { recursive: true });
const src = join(work, 'src.wav');
execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', src]);
const names = ['a4.wav', 'a5.wav', 'b1.wav', 'b2.wav', 'd1.wav', 's6.wav', 'u1.wav', 'y7.wav'];
for (const n of names) copyFileSync(src, join(F, n));
const P = (n) => join(F, n);
results.work = work; results.srcReaders = await readers(src);
const cfg = mkcfg(work);
const { app, page, log } = await launch(cfg, build);
async function saveSingle(key) { await page.waitForTimeout(250); await page.getByRole('button', { name: /Save Tags/ }).click(); const t = await waitToast(page, /Tags saved|Failed|failed/); await page.waitForTimeout(600); await waitToastGone(page); return t; }
async function typeTake(v) { const i = fieldInput(page, 'Take'); await i.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); if (v !== '') await page.keyboard.type(v); await page.waitForTimeout(150); return i.inputValue(); }
async function badge(name) { return (await rowOf(page, name).locator('text=Tagged').count()) > 0; }
try {
  await openFolder(app, page, F, 'a4.wav');
  await select(page, 'u1.wav');
  // add custom Number field Take, auto ID
  await page.locator('button[title="Customize Fields"]').click();
  await page.waitForTimeout(400);
  await page.getByPlaceholder('Field name (e.g. Client)').fill('Take');
  await page.locator('select', { has: page.locator('option[value="number"]') }).last().selectOption('number');
  await page.getByRole('button', { name: /Add Field/ }).click();
  await page.waitForTimeout(300);
  await shot('customize');
  await page.getByRole('button', { name: /^Done$/ }).click();
  await page.waitForTimeout(800);
  results.schemaFiles = {};
  for (const d of readdirSync(cfg)) { try { results.schemaFiles[d] = JSON.parse(readFileSync(join(cfg, d, 'schema.json'), 'utf8')).filter((f) => !f.standard); } catch {} }
  const takeDef = Object.values(results.schemaFiles).flat().find((f) => f.label === 'Take');
  results.takeId = takeDef?.riffChunkId; results.takeType = takeDef?.type;
  save();

  // R46-4
  await select(page, 'u1.wav'); await select(page, 'a4.wav');
  results.r4 = { takeBefore: await fieldInput(page, 'Take').inputValue(), takePlaceholder: await fieldInput(page, 'Take').getAttribute('placeholder') };
  await fieldInput(page, 'Title').fill('R46');
  results.r4.toast = await saveSingle();
  results.r4.readers = await readers(P('a4.wav'));
  await select(page, 'u1.wav'); await select(page, 'a4.wav');
  results.r4.takeAfter = await fieldInput(page, 'Take').inputValue();
  await shot('4-after');
  save();
  if (tag === 'base') throw new Error('base stops after R46-4');

  // R46-5
  await select(page, 'a5.wav');
  results.r5 = { takeBefore: await fieldInput(page, 'Take').inputValue(), badgeBefore: await badge('a5.wav') };
  await shot('5-empty-placeholder');
  results.r5.typed = await typeTake('0');
  results.r5.toast = await saveSingle();
  results.r5.readers = await readers(P('a5.wav'));
  await select(page, 'u1.wav'); await select(page, 'a5.wav');
  results.r5.takeAfter = await fieldInput(page, 'Take').inputValue();
  results.r5.badgeAfter = await badge('a5.wav');
  results.r5.badgeU1 = await badge('u1.wav');
  await shot('5-zero');
  save();

  // extra: decimal typing (code-reviewer F1)
  await select(page, 'd1.wav');
  results.d1 = { typed: await typeTake('1.05') };
  results.d1.toast = await saveSingle();
  results.d1.readers = await readers(P('d1.wav'));
  await select(page, 'u1.wav'); await select(page, 'd1.wav');
  results.d1.takeAfter = await fieldInput(page, 'Take').inputValue();
  save();

  // R46-6 single: seed via UI then clear
  await select(page, 's6.wav');
  await fieldInput(page, 'Category (UCS)').fill('DOORWood');
  await fieldInput(page, 'Comment').fill('კარი');
  results.r6s = { typed: await typeTake('7') };
  results.r6s.seedToast = await saveSingle();
  results.r6s.seedReaders = await readers(P('s6.wav'));
  await select(page, 'u1.wav'); await select(page, 's6.wav');
  results.r6s.takeShown = await fieldInput(page, 'Take').inputValue();
  await shot('6-single-before');
  results.r6s.cleared = await typeTake('');
  results.r6s.toast = await saveSingle();
  results.r6s.readers = await readers(P('s6.wav'));
  await select(page, 'u1.wav'); await select(page, 's6.wav');
  results.r6s.takeAfter = await fieldInput(page, 'Take').inputValue();
  await shot('6-single-after');
  save();

  // R46-6 batch: seed b1,b2 via UI
  for (const [n, cat] of [['b1.wav', 'DOORWood'], ['b2.wav', 'GLASBrk']]) {
    await select(page, n);
    await fieldInput(page, 'Category (UCS)').fill(cat);
    await typeTake('7');
    results[`seed_${n}`] = { toast: await saveSingle() };
    results[`seed_${n}`].readers = await readers(P(n));
  }
  const unsel = ['a4.wav', 'a5.wav', 'd1.wav', 's6.wav', 'u1.wav', 'y7.wav'];
  results.r6b = { hashBefore: Object.fromEntries(unsel.map((n) => [n, sha(P(n))])) };
  await select(page, 'b1.wav');
  await rowOf(page, 'b2.wav').click({ modifiers: ['Control'] });
  await page.waitForTimeout(600);
  results.r6b.takeShown = await fieldInput(page, 'Take').inputValue();
  results.r6b.takePlaceholder = await fieldInput(page, 'Take').getAttribute('placeholder');
  await shot('6-batch-before');
  await fieldInput(page, 'Take').click();
  await page.keyboard.type('1'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  results.r6b.takeAfterEdit = await fieldInput(page, 'Take').inputValue();
  await page.getByRole('button', { name: /Save to 2 files/ }).click();
  results.r6b.toast = await waitToast(page, /Tags saved|failed/);
  await page.waitForTimeout(700);
  await shot('6-batch-after');
  await waitToastGone(page);
  results.r6b.readers = {}; for (const n of ['b1.wav', 'b2.wav']) results.r6b.readers[n] = await readers(P(n));
  results.r6b.hashAfter = Object.fromEntries(unsel.map((n) => [n, sha(P(n))]));
  results.r6b.unselectedIdentical = unsel.every((n) => results.r6b.hashBefore[n] === results.r6b.hashAfter[n]);
  save();

  // R46-7 standard Year
  await select(page, 'y7.wav');
  const yr = async (v) => { const i = fieldInput(page, 'Year'); await i.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); if (v) await page.keyboard.type(v); await page.waitForTimeout(150); return i.inputValue(); };
  results.r7 = { y2024: { typed: await yr('2024') } };
  results.r7.y2024.toast = await saveSingle(); results.r7.y2024.readers = await readers(P('y7.wav'));
  results.r7.clear = { typed: await yr('') };
  results.r7.clear.toast = await saveSingle(); results.r7.clear.readers = await readers(P('y7.wav'));
  await select(page, 'u1.wav'); await select(page, 'y7.wav');
  results.r7.clear.shown = await fieldInput(page, 'Year').inputValue();
  results.r7.y0 = { typed: await yr('0') };
  results.r7.y0.toast = await saveSingle(); results.r7.y0.readers = await readers(P('y7.wav'));
  await select(page, 'u1.wav'); await select(page, 'y7.wav');
  results.r7.y0.shown = await fieldInput(page, 'Year').inputValue();
  await shot('7-year0-after');
} catch (e) {
  results.error = String(e?.stack ?? e);
  await page.screenshot({ path: join(OUT, `r46-${tag}-error.png`) }).catch(() => {});
} finally { results.log = log; save(); await app.close().catch(() => {}); }
console.log('done', tag, results.error ?? '');
