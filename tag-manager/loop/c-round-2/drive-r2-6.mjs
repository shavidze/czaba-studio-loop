import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-2';
const req = createRequire(join(REPO, 'package.json'));
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);

function chunks(buf) {
  const out = [];
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const c = { id, offset: off, size };
    if (id === 'LIST') {
      c.listType = buf.toString('ascii', off + 8, off + 12);
      if (c.listType === 'INFO') {
        c.sub = [];
        let s = off + 12;
        while (s + 8 <= off + 8 + size) {
          const sid = buf.toString('ascii', s, s + 4);
          const ssz = buf.readUInt32LE(s + 4);
          c.sub.push({ id: sid, size: ssz, value: buf.toString('latin1', s + 8, s + 8 + ssz).replace(/\0+$/, '') });
          s += 8 + ssz + (ssz % 2);
        }
      }
    }
    if (id === 'data') c.sha256 = createHash('sha256').update(buf.subarray(off + 8, off + 8 + size)).digest('hex');
    out.push(c);
    off += 8 + size + (size % 2);
  }
  return out;
}
const dataSha = (p) => chunks(readFileSync(p)).find((c) => c.id === 'data')?.sha256;

const work = mkdtempSync(join(tmpdir(), 'c-r2-'));
const dir = join(work, 'ui');
mkdirSync(dir);
const cfg = join(work, 'xdg');
mkdirSync(cfg);
for (const n of ['alpha.wav', 'beta.wav']) copyFileSync(join(REPO, 'tests/fixtures/sample.wav'), join(dir, n));
const alpha = join(dir, 'alpha.wav');
const result = { workDir: work, before: { dataSha: dataSha(alpha), chunks: chunks(readFileSync(alpha)) } };

const app = await _electron.launch({
  args: ['--no-sandbox', join(REPO, 'out/main/index.js')],
  env: { ...process.env, XDG_CONFIG_HOME: cfg },
});
try {
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] });
  }, dir);
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, '01-empty.png') });
  await page.getByText('Open Folder', { exact: true }).click();
  await page.getByText('alpha.wav', { exact: true }).first().waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, '02-folder-open.png') });
  await page.getByText('alpha.wav', { exact: true }).first().click();
  await page.waitForTimeout(500);
  const field = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${label}$`) }) }).locator('input').first();
  await field('Title').fill('C R2 Title');
  await field('Comment').fill('C r2 comment');
  await field('Keywords').fill('door, slam');
  const artists = field('Artists');
  await artists.click();
  await artists.type('Artist One');
  await artists.press('Enter');
  await artists.type('Artist Two');
  await artists.press('Enter');
  const genres = field('Genres');
  await genres.click();
  await genres.type('Foley');
  await genres.press('Enter');
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, '03-before-save.png') });
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.getByText('Tags saved').first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, '04-after-save.png') });
  result.bodyAfterSave = await page.locator('body').innerText();
  await page.getByText('Rescan', { exact: true }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, '05-after-rescan.png') });
  result.bodyAfterRescan = await page.locator('body').innerText();
  result.alphaRowAfterRescan = await page.evaluate(() => {
    const el = [...document.querySelectorAll('span,div')].find((e) => e.textContent?.trim() === 'alpha.wav' && e.children.length === 0);
    let row = el;
    for (let i = 0; i < 6 && row; i++) {
      if (row.textContent?.includes('KB')) break;
      row = row.parentElement;
    }
    return row ? [...row.querySelectorAll('span')].map((s) => s.textContent) : null;
  });
} finally {
  await app.close();
}

const meta = await mm.parseFile(alpha);
result.musicMetadata = { title: meta.common.title, comment: meta.common.comment, artists: meta.common.artists, artist: meta.common.artist, genre: meta.common.genre, nativeTypes: Object.keys(meta.native) , native: meta.native };
result.ffprobe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', alpha]).toString());
result.after = { dataSha: dataSha(alpha), chunks: chunks(readFileSync(alpha)) };
result.betaMeta = (await mm.parseFile(join(dir, 'beta.wav'))).common.title ?? null;
writeFileSync(join(OUT, 'r2-6-result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ ...result, bodyAfterSave: undefined, bodyAfterRescan: undefined, before: { dataSha: result.before.dataSha } }, null, 2));
