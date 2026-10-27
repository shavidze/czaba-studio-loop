import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-25';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

const work = mkdtempSync(join(tmpdir(), 'c-r25-'));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const NAMES = ['a.wav', 'b.wav'];
for (const n of NAMES) copyFileSync(REPO + '/tests/fixtures/sample.wav', join(dir, n));
const result = { workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) for (const t of v) native[`${k}:${t.id}`] = t.value;
  return { common: { title: m.common.title, artist: m.common.artist, artists: m.common.artists, genre: m.common.genre, comment: m.common.comment }, native };
}

const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);
const pageErrors = []; const toastsSeen = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const val = async (label) => ((await block(label).count()) ? await fieldIn(label).inputValue() : '<no field>');
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const shot = (name) => page.screenshot({ path: join(OUT, `r25-5-${name}.png`) });
const TOAST_RE = /(Unsaved changes[^\n]*|Tags saved[^\n]*|\d+ saved, \d+ failed[^\n]*|Failed[^\n]*)/g;
const pollToasts = async (phase) => { const t = await page.locator('body').innerText(); for (const m of t.match(TOAST_RE) ?? []) { const k = `${phase}: ${m}`; if (!toastsSeen.includes(k)) toastsSeen.push(k); } };
const waitToast = async (phase, re, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { await pollToasts(phase); const t = await page.locator('body').innerText(); const m = t.match(re); if (m) return m[0]; await page.waitForTimeout(50); } return null; };

try {
  await page.getByText('Open Folder', { exact: true }).first().click();
  await nameCell('a.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(1200);
  await shot('0-scan');

  await nameCell('a.wav').click(); await page.waitForTimeout(600);
  await fieldIn('Title').fill('R25T');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t1 = await waitToast('step1', /Tags saved/);
  await page.waitForTimeout(500);
  result.phases.step1 = { toast: t1, title: await val('Title') };
  await shot('1-saved');
  ok('1-tags-saved', t1 === 'Tags saved' && result.phases.step1.title === 'R25T', result.phases.step1);

  await page.getByTitle('Customize Fields').click(); await page.waitForTimeout(400);
  await page.getByPlaceholder('Field name (e.g. Client)').fill('R25note');
  await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(300);
  await shot('2a-field-added');
  await page.getByRole('button', { name: /^Done$/ }).click();
  const end = Date.now() + 3000; while (Date.now() < end) { await pollToasts('step2'); await page.waitForTimeout(100); }
  result.phases.step2 = { title: await val('Title'), r25note: await val('R25note'), toasts: toastsSeen.filter((t) => t.startsWith('step2')) };
  await shot('2b-after-done');
  ok('2-title-kept-no-failed-toast', result.phases.step2.title === 'R25T' && result.phases.step2.r25note !== '<no field>' && !result.phases.step2.toasts.some((t) => /Failed/.test(t)), result.phases.step2);
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
await app.close().catch(() => {});
result.pageErrors = pageErrors; result.toastsSeen = toastsSeen;

const readers = {};
for (const n of NAMES) { const p = join(dir, n); readers[n] = { ffprobe: ffprobe(p), mm: await mmRead(p) }; }
result.readers = readers;
const A = readers['a.wav'];
const exif = Object.fromEntries(Object.entries(A.mm.native).filter(([k]) => k.startsWith('exif:')).map(([k, v]) => [k.slice(5), v]));
const ffMap = { INAM: 'title', IART: 'artist', ICMT: 'comment', IGNR: 'genre', ICRD: 'date', IPRD: 'album', ISFT: 'encoder', ICOP: 'copyright' };
const cmp = [];
for (const [id, v] of Object.entries(exif)) { const ffKey = ffMap[id] ?? id; const ffv = A.ffprobe[ffKey] ?? A.ffprobe[id] ?? A.ffprobe[id.toLowerCase()]; cmp.push({ id, mm: v, ffKey, ff: ffv, agree: String(ffv) === String(v) }); }
const mmKeysFf = new Set(cmp.map((c) => c.ffKey));
for (const [k, v] of Object.entries(A.ffprobe)) if (!mmKeysFf.has(k) && !Object.keys(exif).includes(k)) cmp.push({ id: null, ffKey: k, ff: v, mm: undefined, agree: false });
result.fieldCompareA = cmp;
ok('3-readers-title', A.ffprobe.title === 'R25T' && exif.INAM === 'R25T', { ff: A.ffprobe.title, mmINAM: exif.INAM, mmCommon: A.mm.common.title });
ok('3-readers-agree', cmp.every((c) => c.agree), cmp.filter((c) => !c.agree));
ok('pageErrors-empty', pageErrors.length === 0, pageErrors);
writeFileSync(join(OUT, 'r25-5.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.checks, null, 1));
if (result.error) console.log('ERROR', result.error);
