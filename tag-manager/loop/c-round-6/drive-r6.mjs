import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = process.env.REPO || '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-6';
const PREFIX = process.env.PREFIX || 'r6';
const BEFORE = !!process.env.BEFORE;
const req = createRequire('/home/runner/czaba-project/czaba-tag-manager/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const SAMPLE = '/home/runner/czaba-project/czaba-tag-manager/tests/fixtures/sample.wav';

function sub(id, payload) {
  const h = Buffer.alloc(8); h.write(id, 0, 'ascii'); h.writeUInt32LE(payload.length, 4);
  return Buffer.concat([h, payload, payload.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
}
function mkInfoWav(target, entries) {
  const s = readFileSync(SAMPLE);
  const body = Buffer.concat([Buffer.from('INFO'), ...entries.map(([id, p]) => sub(id, Buffer.from(p, 'utf8')))]);
  const lh = Buffer.alloc(8); lh.write('LIST', 0, 'ascii'); lh.writeUInt32LE(body.length, 4);
  const w = Buffer.concat([s, lh, body]); w.writeUInt32LE(w.length - 8, 4); writeFileSync(target, w);
}
function infoDump(p) {
  const buf = readFileSync(p); let off = 12; const res = [];
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4); const size = buf.readUInt32LE(off + 4);
    if (id === 'LIST' && buf.toString('ascii', off + 8, off + 12) === 'INFO') {
      let s = off + 12;
      while (s + 8 <= off + 8 + size) {
        const sid = buf.toString('ascii', s, s + 4); const ssz = buf.readUInt32LE(s + 4);
        const pl = buf.subarray(s + 8, s + 8 + ssz);
        res.push({ id: sid, size: ssz, hex: pl.toString('hex'), hasNul: pl.includes(0), utf8: JSON.stringify(pl.toString('utf8')) });
        s += 8 + ssz + (ssz % 2);
      }
    }
    off += 8 + size + (size % 2);
  }
  return res;
}
const chunks = (p) => { const b = readFileSync(p); let o = 12; const r = []; while (o + 8 <= b.length) { const id = b.toString('ascii', o, o + 4); const sz = b.readUInt32LE(o + 4); r.push(`${id}:${sz}`); o += 8 + sz + (sz % 2); } return r; };
const ffprobe = (p) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {};
async function mmRead(p) {
  const m = await mm.parseFile(p); const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => [t.id, t.value]);
  return { common: { title: m.common.title, comment: m.common.comment }, native };
}
async function independent(p) { return { chunks: chunks(p), ffprobe: ffprobe(p), musicMetadata: await mmRead(p), riffInfo: infoDump(p) }; }

const result = { repo: REPO, before: BEFORE, steps: [] };
const log = (s, extra) => { result.steps.push(extra ? { s, ...extra } : { s }); console.log(s, extra ? JSON.stringify(extra) : ''); };
const work = mkdtempSync(join(tmpdir(), `c-${PREFIX}-`));
const dir = join(work, 'wavs'); mkdirSync(dir);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
result.workDir = work;
mkInfoWav(join(dir, 'nul-comment.wav'), [['ICMT', '\0'], ['ISFT', 'Recorder 1.0\0']]);
mkInfoWav(join(dir, 'nul-title.wav'), [['INAM', '\0\0']]);
mkInfoWav(join(dir, 'nul-take.wav'), [['ITKN', '120\0'], ['ICAT', 'DOORWood\0']]);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', SAMPLE, '-metadata', 'comment=მძიმე კარი', '-c', 'copy', join(dir, 'comment-only.wav')]);
copyFileSync(SAMPLE, join(dir, 'cat-new.wav'));
copyFileSync(SAMPLE, join(dir, 'cat-clear.wav'));
const NAMES = ['nul-comment.wav', 'nul-title.wav', 'nul-take.wav', 'comment-only.wav', 'cat-new.wav', 'cat-clear.wav'];
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
const rescan = async () => { await page.getByText('Rescan', { exact: true }).click(); await page.waitForTimeout(1500); await nameCell('cat-new.wav').waitFor(); await page.waitForTimeout(800); };
async function save() {
  await page.getByRole('button', { name: /Save Tags/ }).click();
  await page.getByText('Tags saved').first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(2800);
}
const select = async (n) => { await nameCell(n).click(); await page.waitForTimeout(800); };
const val = async (label) => { const v = await fieldIn(label).inputValue(); return { value: v, json: JSON.stringify(v), codes: [...v].map((c) => c.codePointAt(0)), hasNul: v.includes('\u0000') }; };
const shot = (name) => page.screenshot({ path: join(OUT, `${PREFIX}-${name}.png`) });

try {
  await page.getByText('Open Folder', { exact: true }).click();
  await nameCell('cat-new.wav').waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  result.openRows = await allRows();
  log('open', result.openRows);

  await select('nul-comment.wav');
  await page.locator('button[title="Customize Fields"]').click();
  await page.waitForTimeout(500);
  await page.getByPlaceholder('Field name (e.g. Client)').fill('Take');
  await page.locator('select').last().selectOption('number');
  await page.getByPlaceholder('RIFF ID (auto)').fill('ITKN');
  await page.getByRole('button', { name: /Add Field/ }).click();
  await page.waitForTimeout(400);
  await shot('schema-take');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.waitForTimeout(1500);
  const schemaPath = join(cfg, 'czaba-tag-manager', 'schema.json');
  const schemaFiles = execFileSync('find', [cfg, '-name', 'schema.json']).toString().trim().split('\n').filter(Boolean);
  result.schemaFiles = schemaFiles;
  result.schemaTake = schemaFiles.length ? JSON.parse(readFileSync(schemaFiles[0], 'utf8')).filter?.((f) => f.key === 'take') ?? JSON.parse(readFileSync(schemaFiles[0], 'utf8')) : null;
  log('schema', { schemaFiles, take: result.schemaTake, guessed: existsSync(schemaPath) });
  await rescan();

  result.afterSchemaRows = await allRows();
  log('rows after schema+rescan', result.afterSchemaRows);
  await select('nul-comment.wav');
  result.nulCommentPanel = { comment: await val('Comment') };
  await select('nul-title.wav');
  result.nulTitlePanel = { title: await val('Title') };
  log('nul panels', { c: result.nulCommentPanel, t: result.nulTitlePanel });
  await shot('r6-4-nul-untagged');

  await select('comment-only.wav');
  result.commentOnlyPanel = { comment: await val('Comment'), tagged: await rowTagged('comment-only.wav') };
  log('comment-only panel', result.commentOnlyPanel);
  await shot('r6-4-comment-clean');

  await select('nul-take.wav');
  result.nulTakePanelBefore = { take: await val('Take'), category: await val('Category (UCS)') };
  log('nul-take panel before', result.nulTakePanelBefore);
  await shot('r6-4-take-before-save');
  await fieldIn('Title').fill('X');
  await save();
  await rescan();
  await select('nul-take.wav');
  result.nulTakePanelAfter = { take: await val('Take'), category: await val('Category (UCS)'), title: await val('Title') };
  result.nulTakeFileAfter = await independent(join(dir, 'nul-take.wav'));
  log('nul-take after', { panel: result.nulTakePanelAfter, file: result.nulTakeFileAfter });
  await shot('r6-4-take-saved');

  if (!BEFORE) {
    await select('comment-only.wav');
    await fieldIn('Title').fill('Y');
    await save();
    await rescan();
    await select('comment-only.wav');
    result.commentOnlyAfter = { panel: { comment: await val('Comment'), title: await val('Title') }, tagged: await rowTagged('comment-only.wav'), file: await independent(join(dir, 'comment-only.wav')) };
    log('comment-only after', result.commentOnlyAfter);
    await shot('r6-5-comment-only-saved');

    await select('cat-new.wav');
    await fieldIn('Category (UCS)').fill('DOORWood');
    await save();
    result.catNewFile = await independent(join(dir, 'cat-new.wav'));

    await select('cat-clear.wav');
    await fieldIn('Category (UCS)').fill('x');
    await save();
    result.catClearFirst = await independent(join(dir, 'cat-clear.wav'));
    await fieldIn('Category (UCS)').fill('');
    await page.waitForTimeout(300);
    await save();
    result.catClearSecond = await independent(join(dir, 'cat-clear.wav'));
    await rescan();
    result.finalRows = await allRows();
    log('final rows', result.finalRows);
    await select('cat-new.wav');
    result.catNewPanel = await val('Category (UCS)');
    await shot('r6-6-cat-new-tagged');
    await select('cat-clear.wav');
    result.catClearPanel = await val('Category (UCS)');
    await shot('r6-6-cat-clear-untagged');
  } else {
    await select('comment-only.wav');
    await fieldIn('Title').fill('Y');
    await save();
    result.commentOnlyAfter = { file: await independent(join(dir, 'comment-only.wav')) };
  }
} catch (e) {
  result.error = String(e?.stack ?? e);
  console.error(e);
  await shot('error').catch(() => {});
} finally {
  writeFileSync(join(OUT, `${PREFIX}-result.json`), JSON.stringify(result, null, 2));
  await app.close();
}
