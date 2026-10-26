import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-7';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const SAMPLE = REPO + '/tests/fixtures/sample.wav';

function infoDump(p) {
  const buf = readFileSync(p); let off = 12; const res = [];
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4); const size = buf.readUInt32LE(off + 4);
    if (id === 'LIST' && buf.toString('ascii', off + 8, off + 12) === 'INFO') {
      let s = off + 12;
      while (s + 8 <= off + 8 + size) {
        const sid = buf.toString('ascii', s, s + 4); const ssz = buf.readUInt32LE(s + 4);
        const pl = buf.subarray(s + 8, s + 8 + ssz);
        res.push({ id: sid, size: ssz, hex: pl.toString('hex'), hasNul: pl.includes(0), text: pl.toString('latin1') });
        s += 8 + ssz + (ssz % 2);
      }
    }
    off += 8 + size + (size % 2);
  }
  return res;
}
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p); const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  return { common: { title: m.common.title, comment: m.common.comment }, native };
}
async function independent(p) { return { sha256: sha(p), ffprobe: ffprobe(p), musicMetadata: await mmRead(p), riffInfo: infoDump(p) }; }

const result = { steps: [] };
const log = (s, extra) => { result.steps.push(extra ? { s, ...extra } : { s }); console.log(s, extra ? JSON.stringify(extra) : ''); };
const work = mkdtempSync(join(tmpdir(), 'c-r7-'));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
result.workDir = work;
const NAMES = ['a-single.wav', 'b-batch1.wav', 'c-batch2.wav', 'd-readonly.wav', 'e-writable.wav'];
for (const n of NAMES) copyFileSync(SAMPLE, join(dir, n));
chmodSync(join(dir, 'd-readonly.wav'), 0o444);
result.initial = {};
for (const n of NAMES) result.initial[n] = await independent(join(dir, n));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);
const fieldIn = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) }).locator('input').first();
const nameCell = (n) => page.getByText(n, { exact: true }).first();
const row = (n) => nameCell(n).locator('xpath=../..');
const rowTagged = async (n) => (await row(n).getByText('Tagged', { exact: true }).count()) > 0;
const allRows = async () => { const o = {}; for (const n of NAMES) o[n] = await rowTagged(n); return o; };
const rescan = async () => { await page.getByText('Rescan', { exact: true }).click(); await page.waitForTimeout(1500); await nameCell('a-single.wav').waitFor(); await page.waitForTimeout(800); };
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const toastText = async (re) => { const t = page.getByText(re).first(); await t.waitFor({ timeout: 10000 }); return t.textContent(); };

try {
  await page.getByText('Open Folder', { exact: true }).click();
  await nameCell('a-single.wav').waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  result.openRows = await allRows();
  log('open', result.openRows);

  // R7-4
  await nameCell('a-single.wav').click(); await page.waitForTimeout(800);
  await fieldIn('Category (UCS)').fill('DOORWood');
  await fieldIn('Keywords').fill('door, slam');
  await fieldIn('Comment').fill('heavy door');
  await shot('r7-4-before-save');
  await page.getByRole('button', { name: /Save Tags/ }).click();
  result.r74Toast = await toastText(/^Tags saved$/);
  await shot('r7-4-toast');
  await page.waitForTimeout(2800);
  result.r74File = await independent(join(dir, 'a-single.wav'));
  await rescan();
  result.r74RowTagged = await rowTagged('a-single.wav');
  await nameCell('a-single.wav').click(); await page.waitForTimeout(800);
  result.r74Panel = { category: await fieldIn('Category (UCS)').inputValue(), keywords: await fieldIn('Keywords').inputValue(), comment: await fieldIn('Comment').inputValue() };
  log('r7-4', { toast: result.r74Toast, tagged: result.r74RowTagged, panel: result.r74Panel, file: result.r74File });
  await shot('r7-4-after-rescan');

  // R7-5 (i)
  await nameCell('b-batch1.wav').click(); await page.waitForTimeout(500);
  await nameCell('c-batch2.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
  result.r75iButton = await page.getByRole('button', { name: /Save to \d+ files/ }).textContent();
  await fieldIn('Category (UCS)').fill('BATCHCat');
  await shot('r7-5-i-before-save');
  await page.getByRole('button', { name: /Save to 2 files/ }).click();
  result.r75iToast = await toastText(/Tags saved to \d+ files|\d+ saved, \d+ failed/);
  await shot('r7-5-i-toast');
  await page.waitForTimeout(2800);
  result.r75iFiles = { b: await independent(join(dir, 'b-batch1.wav')), c: await independent(join(dir, 'c-batch2.wav')) };
  log('r7-5-i', { button: result.r75iButton, toast: result.r75iToast, files: result.r75iFiles });

  // R7-5 (ii)
  await nameCell('d-readonly.wav').click(); await page.waitForTimeout(500);
  await nameCell('e-writable.wav').click({ modifiers: ['Control'] }); await page.waitForTimeout(800);
  await fieldIn('Category (UCS)').fill('ROCat');
  await shot('r7-5-ii-before-save');
  await page.getByRole('button', { name: /Save to 2 files/ }).click();
  result.r75iiToast = await toastText(/Tags saved to \d+ files|\d+ saved, \d+ failed/);
  await shot('r7-5-ii-toast');
  await page.waitForTimeout(2800);
  result.r75iiFiles = { d: await independent(join(dir, 'd-readonly.wav')), e: await independent(join(dir, 'e-writable.wav')) };
  result.r75iiReadonlyUnchanged = result.r75iiFiles.d.sha256 === result.initial['d-readonly.wav'].sha256;
  await rescan();
  result.finalRows = await allRows();
  log('r7-5-ii', { toast: result.r75iiToast, unchanged: result.r75iiReadonlyUnchanged, files: result.r75iiFiles, rows: result.finalRows });
  await shot('r7-5-final-rows');
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  await shot('r7-error').catch(() => {});
} finally {
  writeFileSync(join(OUT, 'r7-result.json'), JSON.stringify(result, null, 2));
  await app.close();
}
