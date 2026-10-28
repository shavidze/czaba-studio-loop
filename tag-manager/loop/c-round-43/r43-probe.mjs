import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, statSync, utimesSync, chmodSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-43';
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
const SCHEMA = [...STD, CAT_STD];
const OLD = new Date('2020-01-15T12:00:00Z');

function fmtSize(b) { if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`; return `${(b / 1048576).toFixed(1)} MB`; }
function rawInfo(path) {
  const b = readFileSync(path); const out = []; let o = 12;
  while (o + 8 <= b.length) {
    const id = b.toString('latin1', o, o + 4); const sz = b.readUInt32LE(o + 4);
    if (id === 'LIST' && b.toString('latin1', o + 8, o + 12) === 'INFO') {
      let p = o + 12;
      while (p + 8 <= o + 8 + sz) { const sid = b.toString('latin1', p, p + 4); const ssz = b.readUInt32LE(p + 4); out.push({ id: sid, value: b.toString('utf8', p + 8, p + 8 + ssz).replace(/\0+$/, '') }); p += 8 + ssz + (ssz & 1); }
    }
    o += 8 + sz + (sz & 1);
  }
  return out;
}
async function readers(path) {
  const m = await mm.parseFile(path);
  const info = (m.native.exif ?? m.native['RIFF INFO'] ?? []);
  const nat = {}; for (const [k, v] of Object.entries(m.native)) nat[k] = v.map((t) => `${t.id}=${typeof t.value === 'string' ? t.value : JSON.stringify(t.value)}`);
  const ff = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', path]).toString());
  const raw = rawInfo(path);
  return { raw: Object.fromEntries(raw.map((r) => [r.id, r.value])), mmNative: nat, mmInfoCount: info.length, ffprobe: ff.format?.tags ?? {} };
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
async function cells(page, name) { const r = rowOf(page, name); const sp = r.locator(':scope > span'); return { size: await sp.nth(0).textContent(), date: await sp.nth(4).textContent() }; }
function fieldInput(page, label) { return page.locator('div.space-y-1', { has: page.locator(`label:text-is("${label}")`) }).locator('input').first(); }
async function waitToast(page, re) { const t = page.locator('div.fixed span.text-sm', { hasText: re }).first(); await t.waitFor({ timeout: 60000 }); const txt = await t.textContent(); return txt; }
async function waitToastGone(page) { await page.locator('div.fixed span.text-sm').first().waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}); }
const today = () => new Date().toLocaleDateString('en-US');

const mode = process.argv[2];
const results = { mode };
const save = () => writeFileSync(join(OUT, `r43-results-${mode}.json`), JSON.stringify(results, null, 2));

if (mode === 'correct') {
  const work = mkdtempSync(join(tmpdir(), 'c-r43-'));
  const F = join(work, 'F'); mkdirSync(join(F, 'sub'), { recursive: true });
  const src = join(OUT, 'small.wav');
  const names = ['a1.wav', 'a2.wav', 'a3.wav', 'a4.wav', 'a5.wav', 'ro.wav', 'untouched.wav'];
  for (const n of names) copyFileSync(src, join(F, n));
  copyFileSync(src, join(F, 'sub', 'nested.wav'));
  mkdirSync(join(F, 'dir.wav')); writeFileSync(join(F, 'x.txt'), 'x'); copyFileSync(src, join(F, 'UPPER.WAV'));
  for (const p of [...names.map((n) => join(F, n)), join(F, 'sub', 'nested.wav'), join(F, 'UPPER.WAV')]) utimesSync(p, OLD, OLD);
  results.work = work; results.todayLocale = today();
  const cfg = mkcfg(work);
  const L = await launch(cfg, REPO);
  const { app, page, log } = L;
  try {
    await openFolder(app, page, F, 'a1.wav');
    const listed = async () => page.locator('span.truncate.text-foreground').allTextContents();
    results.listedInitial = await listed();
    const allNames = ['a1.wav', 'a2.wav', 'a3.wav', 'a4.wav', 'a5.wav', 'ro.wav', 'untouched.wav', 'nested.wav', 'UPPER.WAV'];
    const snap = async () => Object.fromEntries(await Promise.all(allNames.filter((n) => results.listedInitial.includes(n)).map(async (n) => [n, await cells(page, n)])));
    const pathOf = (n) => (n === 'nested.wav' ? join(F, 'sub', n) : join(F, n));
    const check = (savedNames, before, after) => Object.fromEntries(Object.keys(after).map((n) => {
      const st = statSync(pathOf(n));
      const saved = savedNames.includes(n);
      return [n, { saved, before: before[n], after: after[n], expectSize: fmtSize(st.size), mtime: st.mtime.toISOString(),
        ok: saved ? after[n].size === fmtSize(st.size) && after[n].date === new Date(st.mtime).toLocaleDateString('en-US') && after[n].date !== before[n].date
                  : after[n].size === before[n].size && after[n].date === before[n].date }];
    }));
    // (a) single top-level
    let before = await snap();
    await page.screenshot({ path: join(OUT, 'r43-4-before.png') });
    await rowOf(page, 'a1.wav').click(); await page.waitForTimeout(500);
    await fieldInput(page, 'Category (UCS)').fill('DOORWood'); await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Save Tags/ }).click();
    results.a = { toast: await waitToast(page, /Tags saved/) }; await page.waitForTimeout(500);
    let after = await snap(); results.a.rows = check(['a1.wav'], before, after);
    await page.screenshot({ path: join(OUT, 'r43-4a-after.png') });
    results.a.readers = await readers(pathOf('a1.wav'));
    await waitToastGone(page);
    // (b) nested
    before = after;
    await rowOf(page, 'nested.wav').click(); await page.waitForTimeout(500);
    await fieldInput(page, 'Category (UCS)').fill('DOORWood'); await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Save Tags/ }).click();
    results.b = { toast: await waitToast(page, /Tags saved/) }; await page.waitForTimeout(500);
    after = await snap(); results.b.rows = check(['nested.wav'], before, after);
    await page.screenshot({ path: join(OUT, 'r43-4b-after.png') });
    results.b.readers = await readers(pathOf('nested.wav'));
    await waitToastGone(page);
    // (c) batch of 3
    before = after;
    await rowOf(page, 'a2.wav').click(); await rowOf(page, 'a3.wav').click({ modifiers: ['Control'] }); await rowOf(page, 'a4.wav').click({ modifiers: ['Control'] });
    await page.waitForTimeout(500);
    await fieldInput(page, 'Keywords').fill('door, slam'); await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Save to 3 files/ }).click();
    results.c = { toast: await waitToast(page, /Tags saved/) }; await page.waitForTimeout(500);
    after = await snap(); results.c.rows = check(['a2.wav', 'a3.wav', 'a4.wav'], before, after);
    await page.screenshot({ path: join(OUT, 'r43-4c-after.png') });
    results.c.readers = {}; for (const n of ['a2.wav', 'a3.wav', 'a4.wav']) results.c.readers[n] = await readers(pathOf(n));
    await waitToastGone(page);
    save();
    // R43-5a IPC
    const P = (n) => join(F, n);
    results.ipc = await page.evaluate(async ([ex, missing, dir, txt, upper, nested]) => {
      const out = {};
      out.mixed = await window.api.statFiles([ex, missing, dir, txt, upper, nested, ex]);
      const r = async (arg) => { try { const v = await window.api.statFiles(arg); return { ok: v.length }; } catch (e) { return { err: String(e.message ?? e) }; } };
      out.p51 = await r(Array(51).fill(ex)); out.p50 = await r(Array(50).fill(ex)); out.x = await r('x'); out.nul = await r(null); out.empty = await r(['']); out.num = await r([5]); out.none = await r([]);
      out.keys = Object.keys(window.api).sort();
      return out;
    }, [P('a1.wav'), P('missing.wav'), P('dir.wav'), P('x.txt'), P('UPPER.WAV'), join(F, 'sub', 'nested.wav')]);
    results.ipc.expect = Object.fromEntries([P('a1.wav'), P('UPPER.WAV'), join(F, 'sub', 'nested.wav')].map((p) => { const s = statSync(p); return [p, { size: s.size, mtime: s.mtime.toISOString() }]; }));
    save();
    // R43-6 partial batch with chmod 000
    before = await snap();
    chmodSync(P('ro.wav'), 0o000);
    await rowOf(page, 'a5.wav').click(); await rowOf(page, 'ro.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(500);
    await fieldInput(page, 'Comment').fill('partial'); await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Save to 2 files/ }).click();
    results.partial = { toast: await waitToast(page, /saved|failed/i) }; await page.waitForTimeout(500);
    chmodSync(P('ro.wav'), 0o644);
    after = await snap(); results.partial.rows = check(['a5.wav'], before, after);
    await page.screenshot({ path: join(OUT, 'r43-6-partial.png') });
    await waitToastGone(page);
    // Rescan picks up new file
    copyFileSync(src, P('late.wav'));
    await page.getByRole('button', { name: /Rescan/ }).click();
    await rowOf(page, 'late.wav').waitFor({ timeout: 20000 }).then(() => { results.rescanLate = true; }).catch(() => { results.rescanLate = false; });
    results.listedAfterRescan = await listed();
    await page.screenshot({ path: join(OUT, 'r43-6-rescan.png') });
    // Re-open folder via Open Folder
    copyFileSync(src, P('later2.wav'));
    await openFolder(app, page, F, 'later2.wav');
    results.openFolderAgain = await listed();
  } catch (e) {
    results.error = String(e?.stack ?? e);
    await page.screenshot({ path: join(OUT, 'r43-correct-error.png') }).catch(() => {});
  } finally { results.log = log; save(); await app.close().catch(() => {}); }
}

if (mode === 'speed') {
  const build = process.argv[3]; const tag = process.argv[4]; const tree = process.argv[5];
  const work = mkdtempSync(join(tmpdir(), `c-r43-speed-${tag}-`));
  const cfg = mkcfg(work);
  const target = join(tree, 'g0', 'd00', 'f00_000.wav');
  const L = await launch(cfg, build);
  const { app, page, log } = L;
  results.tag = tag; results.build = build;
  try {
    const t0 = Date.now();
    await openFolder(app, page, tree, 'f00_000.wav');
    results.openMs = Date.now() - t0;
    results.keys = await page.evaluate(() => Object.keys(window.api).sort());
    results.rowCount = await page.evaluate(() => document.querySelectorAll('span.truncate.text-foreground').length);
    results.scanMs = [];
    for (let i = 0; i < 5; i++) results.scanMs.push(await page.evaluate(async (root) => { const t = performance.now(); const r = await window.api.scanFolder(root); return { ms: performance.now() - t, n: r.length }; }, tree));
    await page.locator('input[placeholder*="earch"]').first().fill('f00_000').catch(() => {});
    await page.waitForTimeout(800);
    await rowOf(page, 'f00_000.wav').first().click(); await page.waitForTimeout(800);
    results.saveMs = [];
    for (let i = 0; i < 5; i++) {
      await fieldInput(page, 'Category (UCS)').fill(`${tag}${process.argv[6] ?? ''}V${i}`); await page.waitForTimeout(300);
      const ms = await page.evaluate(() => new Promise((resolve, reject) => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => /Save Tags/.test(b.textContent ?? ''));
        if (!btn) { reject(new Error('no save button')); return; }
        const t = performance.now();
        const obs = new MutationObserver(() => { const s = Array.from(document.querySelectorAll('div.fixed span.text-sm')).find((x) => /Tags saved/.test(x.textContent ?? '')); if (s) { obs.disconnect(); resolve(performance.now() - t); } });
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
        btn.click();
        setTimeout(() => { obs.disconnect(); reject(new Error('timeout')); }, 120000);
      }));
      results.saveMs.push(ms);
      await page.waitForTimeout(500);
      if (i === 0) await page.screenshot({ path: join(OUT, `r43-5b-${tag}-saved.png`) });
      await waitToastGone(page);
    }
    const st = statSync(target);
    results.target = { size: st.size, display: fmtSize(st.size), mtime: st.mtime.toISOString(), cells: await cells(page, 'f00_000.wav') };
  } catch (e) {
    results.error = String(e?.stack ?? e);
    await page.screenshot({ path: join(OUT, `r43-speed-${tag}-error.png`) }).catch(() => {});
  } finally { results.log = log; writeFileSync(join(OUT, `r43-results-speed-${tag}${process.argv[6] ?? ''}.json`), JSON.stringify(results, null, 2)); await app.close().catch(() => {}); }
}
console.log(JSON.stringify(results, null, 1).slice(0, 6000));
