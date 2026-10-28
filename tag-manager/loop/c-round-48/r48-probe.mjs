import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-48';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(REPO + '/node_modules/music-metadata/lib/index.js');
const sha = (b) => createHash('sha256').update(b).digest('hex');
function chunksOf(path) {
  const b = readFileSync(path); const chunks = []; const lists = {}; let dataSha = null; let o = 12;
  while (o + 8 <= b.length) {
    const id = b.toString('latin1', o, o + 4); const sz = b.readUInt32LE(o + 4);
    const ltype = id === 'LIST' ? b.toString('latin1', o + 8, o + 12) : undefined;
    chunks.push(ltype ? `${id}/${ltype}:${sz}` : `${id}:${sz}`);
    if (id === 'data') dataSha = sha(b.subarray(o + 8, o + 8 + sz));
    if (ltype) { const subs = []; let p = o + 12; while (p + 8 <= o + 8 + sz) { const sid = b.toString('latin1', p, p + 4); const ssz = b.readUInt32LE(p + 4); subs.push([sid, b.toString('utf8', p + 8, p + 8 + ssz).replace(/\0+$/, '')]); p += 8 + ssz + (ssz & 1); } lists[ltype] = subs; }
    if (id === 'id3 ' || id === 'ID3 ') { lists.id3hex = b.subarray(o + 8, o + 8 + Math.min(sz, 200)).toString('hex'); }
    o += 8 + sz + (sz & 1);
  }
  return { chunks, lists, dataSha, sha: sha(b), size: b.length };
}
async function readers(path) {
  let mmr; try { const m = await mm.parseFile(path); mmr = { commonArtists: m.common.artists ?? null, commonArtist: m.common.artist ?? null, commonTitle: m.common.title ?? null, native: Object.fromEntries(Object.entries(m.native).map(([k, v]) => [k, v.map((t) => [t.id, t.value])])) }; } catch (e) { mmr = { error: String(e) }; }
  let ff; try { ff = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', path]).toString()).format?.tags ?? {}; } catch (e) { ff = { error: String(e) }; }
  return { ...chunksOf(path), mm: mmr, ffprobe: ff };
}
const R = {};
const save = () => writeFileSync(join(OUT, 'r48-results.json'), JSON.stringify(R, null, 2));
const work = mkdtempSync(join(tmpdir(), 'c-r48-')); const F = join(work, 'F'); mkdirSync(F, { recursive: true });
const P = (n) => join(F, n);
const sine = (f) => ['-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=${f}:duration=1`, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le'];
execFileSync('ffmpeg', [...sine(440), P('tone.wav')]);
execFileSync('ffmpeg', [...sine(550), '-metadata', 'artist=Rec', '-metadata', 'title=T', P('rec.wav')]);
execFileSync('ffmpeg', [...sine(880), P('other.wav')]);
const cfg = join(work, 'xdg'); mkdirSync(cfg, { recursive: true });
R.work = work; R.initial = {}; for (const n of ['tone.wav', 'rec.wav', 'other.wav']) R.initial[n] = await readers(P(n));
const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
const log = { pageErrors: [], consoleErrors: [] };
page.on('pageerror', (e) => log.pageErrors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') log.consoleErrors.push(m.text()); });
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(1000);
const shot = (n) => page.screenshot({ path: join(OUT, `r48-${n}.png`) });
const rowOf = (name) => page.locator('div.grid', { has: page.locator(`span.truncate.text-foreground:text-is("${name}")`) }).first();
const fieldBox = (label) => page.locator('div.space-y-1', { has: page.locator(`label:text-is("${label}")`) }).first();
const fieldInput = (label) => fieldBox(label).locator('input').first();
const chips = async () => (await fieldBox('Artists').locator('span.inline-flex').allTextContents()).map((s) => s.trim());
const toastLoc = () => page.locator('div.fixed span.text-sm').first();
async function waitToast() { await toastLoc().waitFor({ timeout: 60000 }); return toastLoc().textContent(); }
async function waitToastGone() { await toastLoc().waitFor({ state: 'detached', timeout: 15000 }).catch(() => {}); }
async function select(n) { await rowOf(n).click(); await page.waitForTimeout(700); }
async function addArtist(v) { const i = fieldInput('Artists'); await i.click(); await i.fill(v); await i.press('Enter'); await page.waitForTimeout(150); }
try {
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, F);
  await page.getByRole('button', { name: /Open Folder/ }).first().click();
  await rowOf('tone.wav').waitFor({ timeout: 120000 }); await page.waitForTimeout(800);
  R.rowsInitial = {}; for (const n of ['tone.wav', 'rec.wav', 'other.wav']) R.rowsInitial[n] = await rowOf(n).innerText();
  // R48-4
  await select('tone.wav');
  R.r4 = { chipsBefore: await chips() };
  await addArtist('A'); await addArtist('B');
  R.r4.chipsTyped = await chips();
  await page.getByRole('button', { name: /Save Tags/ }).click();
  R.r4.toast = await waitToast(); await page.waitForTimeout(500); await shot('4-tone-after-save');
  R.r4.readers = await readers(P('tone.wav'));
  R.r4.dataShaUnchanged = R.r4.readers.dataSha === R.initial['tone.wav'].dataSha;
  R.r4.otherIdentical = sha(readFileSync(P('other.wav'))) === R.initial['other.wav'].sha;
  await waitToastGone();
  await select('other.wav'); await select('tone.wav');
  R.r4.chipsReselect = await chips();
  R.r4.rowText = await rowOf('tone.wav').innerText();
  await shot('4-tone-reselect');
  save();
  // R48-5
  await select('rec.wav');
  R.r5 = { chipsBefore: await chips(), titleBefore: await fieldInput('Title').inputValue(), rowText: await rowOf('rec.wav').innerText() };
  await shot('5-rec-before');
  await addArtist('New');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  R.r5.toast = await waitToast(); await page.waitForTimeout(500); await shot('5-rec-after-save');
  R.r5.readers = await readers(P('rec.wav'));
  R.r5.dataShaUnchanged = R.r5.readers.dataSha === R.initial['rec.wav'].dataSha;
  await waitToastGone();
  await select('other.wav'); await select('rec.wav');
  R.r5.chipsReselect = await chips(); R.r5.titleReselect = await fieldInput('Title').inputValue();
  R.r5.rowTextAfter = await rowOf('rec.wav').innerText();
  await shot('5-rec-reselect');
  R.otherIdenticalEnd = sha(readFileSync(P('other.wav'))) === R.initial['other.wav'].sha;
} catch (e) { R.error = String(e?.stack ?? e); await page.screenshot({ path: join(OUT, 'r48-error.png') }).catch(() => {}); }
finally { R.log = log; save(); await app.close().catch(() => {}); }
console.log('done', R.error ?? '');
