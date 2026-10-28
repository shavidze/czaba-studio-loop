import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-47';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(REPO + '/node_modules/music-metadata/lib/index.js');
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
function rawInfo(path) {
  const b = readFileSync(path); const subs = []; const chunks = []; let o = 12;
  while (o + 8 <= b.length) {
    const id = b.toString('latin1', o, o + 4); const sz = b.readUInt32LE(o + 4);
    const ltype = id === 'LIST' ? b.toString('latin1', o + 8, o + 12) : undefined;
    chunks.push(ltype ? `${id}/${ltype}:${sz}` : `${id}:${sz}`);
    if (ltype === 'INFO') { let p = o + 12; while (p + 8 <= o + 8 + sz) { const sid = b.toString('latin1', p, p + 4); const ssz = b.readUInt32LE(p + 4); subs.push([sid, b.toString('utf8', p + 8, p + 8 + ssz).replace(/\0+$/, '')]); p += 8 + ssz + (ssz & 1); } }
    o += 8 + sz + (sz & 1);
  }
  return { chunks, raw: Object.fromEntries(subs) };
}
async function readers(path) {
  let mmr; try { const m = await mm.parseFile(path); mmr = { native: Object.fromEntries(Object.entries(m.native).map(([k, v]) => [k, Object.fromEntries(v.map((t) => [t.id, t.value]))])), commonTitle: m.common.title }; } catch (e) { mmr = { error: String(e) }; }
  let ff; try { ff = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', path]).toString()).format?.tags ?? {}; } catch (e) { ff = { error: String(e) }; }
  return { size: readFileSync(path).length, sha: sha(path), ...rawInfo(path), mm: mmr, ffprobe: ff };
}
function emptyWav() {
  const b = Buffer.alloc(44); b.write('RIFF', 0, 'latin1'); b.writeUInt32LE(36, 4); b.write('WAVE', 8, 'latin1');
  b.write('fmt ', 12, 'latin1'); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(48000, 24); b.writeUInt32LE(96000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36, 'latin1'); b.writeUInt32LE(0, 40); return b;
}
const build = process.argv[2]; const tag = process.argv[3];
const R = { tag, build };
const save = () => writeFileSync(join(OUT, `r47-results-${tag}.json`), JSON.stringify(R, null, 2));
const work = mkdtempSync(join(tmpdir(), `c-r47-${tag}-`)); const F = join(work, 'F'); mkdirSync(F, { recursive: true });
const P = (n) => join(F, n);
writeFileSync(P('empty.wav'), emptyWav());
for (const [n, f] of [['tone.wav', 440], ['tone2.wav', 660], ['other.wav', 880]]) execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=${f}:duration=1`, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', P(n)]);
const cfg = join(work, 'xdg'); mkdirSync(cfg, { recursive: true });
R.work = work; R.initial = {}; for (const n of ['empty.wav', 'tone.wav', 'tone2.wav', 'other.wav']) R.initial[n] = await readers(P(n));
const app = await _electron.launch({ args: ['--no-sandbox', join(build, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
const log = { pageErrors: [], consoleErrors: [] };
page.on('pageerror', (e) => log.pageErrors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') log.consoleErrors.push(m.text()); });
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(1000);
const shot = (n) => page.screenshot({ path: join(OUT, `r47-${n}-${tag}.png`) });
const rowOf = (name) => page.locator('div.grid', { has: page.locator(`span.truncate.text-foreground:text-is("${name}")`) }).first();
const fieldInput = (label) => page.locator('div.space-y-1', { has: page.locator(`label:text-is("${label}")`) }).locator('input').first();
const toastLoc = () => page.locator('div.fixed span.text-sm').first();
async function waitToast() { await toastLoc().waitFor({ timeout: 60000 }); return toastLoc().textContent(); }
async function waitToastGone() { await toastLoc().waitFor({ state: 'detached', timeout: 15000 }).catch(() => {}); }
const badge = async (n) => (await rowOf(n).locator('text=Tagged').count()) > 0;
async function select(n) { await rowOf(n).click(); await page.waitForTimeout(600); }
try {
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, F);
  await page.getByRole('button', { name: /Open Folder/ }).first().click();
  await rowOf('empty.wav').waitFor({ timeout: 120000 }); await page.waitForTimeout(800);
  R.badgesInitial = {}; for (const n of ['empty.wav', 'tone.wav', 'tone2.wav', 'other.wav']) R.badgesInitial[n] = await badge(n);
  // R47-4
  await select('empty.wav');
  R.r4 = { titleBefore: await fieldInput('Title').inputValue() };
  await fieldInput('Title').fill('R47');
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  R.r4.toast = await waitToast();
  await page.waitForTimeout(300); await shot('4-single-empty');
  R.r4.titleAfter = await fieldInput('Title').inputValue();
  R.r4.badgeAfter = await badge('empty.wav');
  R.r4.readers = await readers(P('empty.wav'));
  R.r4.shaUnchanged = R.r4.readers.sha === R.initial['empty.wav'].sha;
  R.r4.pageErrors = [...log.pageErrors];
  save();
  await waitToastGone();
  if (tag === 'base') throw new Error('base stops after R47-4');
  // R47-5 batch
  const unsel = ['tone2.wav', 'other.wav'];
  R.r5 = { hashBefore: Object.fromEntries(unsel.map((n) => [n, sha(P(n))])) };
  await select('tone.wav'); await select('empty.wav');
  await rowOf('tone.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(600);
  await fieldInput('Title').fill('R47 batch'); await page.waitForTimeout(250);
  await shot('5-batch-before');
  await page.getByRole('button', { name: /Save to 2 files/ }).click();
  R.r5.toast = await waitToast(); await page.waitForTimeout(500); await shot('5-batch-after');
  R.r5.badges = { 'empty.wav': await badge('empty.wav'), 'tone.wav': await badge('tone.wav') };
  R.r5.tone = await readers(P('tone.wav')); R.r5.empty = await readers(P('empty.wav'));
  R.r5.emptyShaUnchanged = R.r5.empty.sha === R.initial['empty.wav'].sha;
  R.r5.hashAfter = Object.fromEntries(unsel.map((n) => [n, sha(P(n))]));
  R.r5.unselectedIdentical = unsel.every((n) => R.r5.hashBefore[n] === R.r5.hashAfter[n]);
  save(); await waitToastGone();
  // IPC batch
  R.r5ipc = await page.evaluate(async ([a, b]) => window.api.writeMetadataBatch([a, b], { title: 'X' }, await window.api.loadSchema()), [P('empty.wav'), P('tone2.wav')]);
  R.r5ipcTone2 = await readers(P('tone2.wav')); R.r5ipcEmptySha = sha(P('empty.wav')) === R.initial['empty.wav'].sha;
  save();
  // R47-6
  await select('other.wav'); await select('tone.wav');
  R.r6 = { titleBefore: await fieldInput('Title').inputValue() };
  await fieldInput('Title').fill('R47 ok'); await page.waitForTimeout(250);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  R.r6.toast = await waitToast(); await page.waitForTimeout(500); await shot('6-single-tone');
  R.r6.readers = await readers(P('tone.wav'));
  await select('other.wav'); await select('tone.wav');
  R.r6.titleReselect = await fieldInput('Title').inputValue();
  R.r6.badge = await badge('tone.wav');
} catch (e) { R.error = String(e?.stack ?? e); await page.screenshot({ path: join(OUT, `r47-${tag}-error.png`) }).catch(() => {}); }
finally { R.log = log; save(); await app.close().catch(() => {}); }
console.log('done', tag, R.error ?? '');
