import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-3';
const req = createRequire(join(REPO, 'package.json'));
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const sha = (b) => createHash('sha256').update(b).digest('hex');

// C's own RIFF reader (independent of tests/main/riff-chunks.ts)
function dump(buf) {
  const out = [];
  let off = 12;
  const end = Math.min(buf.length, 8 + buf.readUInt32LE(4));
  while (off + 8 <= end) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const payload = buf.subarray(off + 8, off + 8 + size);
    const c = { id, offset: off, size, sha256: sha(payload) };
    if (id === 'LIST') {
      c.listType = payload.toString('ascii', 0, 4);
      if (c.listType === 'INFO') {
        c.sub = [];
        let s = 4;
        while (s + 8 <= payload.length) {
          const sid = payload.toString('ascii', s, s + 4);
          const ssz = payload.readUInt32LE(s + 4);
          const p = payload.subarray(s + 8, s + 8 + ssz);
          c.sub.push({ id: sid, size: ssz, hex: p.toString('hex'), utf8: p.toString('utf8'), hasNul: p.includes(0), padByte: ssz % 2 ? payload[s + 8 + ssz] : null });
          s += 8 + ssz + (ssz % 2);
        }
      }
    }
    out.push(c);
    off += 8 + size + (size % 2);
  }
  return { riffSizeOk: buf.readUInt32LE(4) === buf.length - 8, chunks: out };
}
const chunkSha = (p, id) => dump(readFileSync(p)).chunks.filter((c) => c.id === id).map((c) => c.sha256);
const info = (p) => {
  const l = dump(readFileSync(p)).chunks.filter((c) => c.id === 'LIST' && c.listType === 'INFO');
  return l.length ? Object.fromEntries(l[0].sub.map((s) => [s.id, { size: s.size, utf8: s.utf8, hasNul: s.hasNul, pad: s.padByte }])) : null;
};

// C's own recorder WAV: sample.wav + bext + iXML before data
function chunkBuf(id, payload) {
  const h = Buffer.alloc(8); h.write(id, 0, 'ascii'); h.writeUInt32LE(payload.length, 4);
  return Buffer.concat([h, payload, payload.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
}
function buildRecorder() {
  const base = readFileSync(join(REPO, 'tests/fixtures/sample.wav'));
  const d = dump(base).chunks.find((c) => c.id === 'data');
  const bext = Buffer.alloc(602);
  bext.write('sSPEED=025.000-ND\r\nsTAKE=03\r\n', 0, 'ascii');
  bext.write('SoundDevices', 256, 'ascii');
  bext.write('C-R3-ORIGREF', 288, 'ascii');
  bext.write('2026-10-26', 320, 'ascii');
  bext.write('09:30:15', 330, 'ascii');
  bext.writeUInt32LE(1234567, 338);
  bext.writeUInt16LE(1, 346);
  const ixml = Buffer.from('<?xml version="1.0" encoding="UTF-8"?><BWFXML><IXML_VERSION>1.5</IXML_VERSION><SCENE>C3</SCENE><TAKE>3</TAKE></BWFXML>', 'utf8');
  const body = Buffer.concat([Buffer.from('WAVE'), base.subarray(12, d.offset), chunkBuf('bext', bext), chunkBuf('iXML', ixml), base.subarray(d.offset)]);
  const h = Buffer.alloc(8); h.write('RIFF', 0, 'ascii'); h.writeUInt32LE(body.length, 4);
  return Buffer.concat([h, body]);
}

const result = { phaseA: {}, phaseB: {} };
const work = mkdtempSync(join(tmpdir(), 'c-r3-'));
const dir = join(work, 'ui'); mkdirSync(dir);
const cfgA = join(work, 'xdgA'); mkdirSync(cfgA);
result.workDir = work;
for (const n of ['contract.wav', 'untouched.wav', 'batch-a.wav', 'batch-b.wav']) copyFileSync(join(REPO, 'tests/fixtures/sample.wav'), join(dir, n));
writeFileSync(join(dir, 'recorder.wav'), buildRecorder());
const before = {};
for (const n of ['contract.wav', 'recorder.wav', 'untouched.wav']) {
  const p = join(dir, n);
  before[n] = { data: chunkSha(p, 'data'), bext: chunkSha(p, 'bext'), iXML: chunkSha(p, 'iXML'), ffprobe: JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()) };
}
result.before = before;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function launch(cfg) {
  const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
  await page.waitForTimeout(800);
  return { app, page };
}
const fieldIn = (page, label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) }).locator('input').first();
const labelsOf = (page) => page.locator('label').allInnerTexts();

// ---------- Phase A: R3-6, batch, R3-8 ----------
{
  const { app, page } = await launch(cfgA);
  try {
    result.phaseA.userData = await app.evaluate(({ app: a }) => a.getPath('userData'));
    await page.getByText('Open Folder', { exact: true }).click();
    await page.getByText('contract.wav', { exact: true }).first().waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT, '01-folder-open.png') });
    let i = 2;
    for (const n of ['contract.wav', 'recorder.wav']) {
      await page.getByText(n, { exact: true }).first().click();
      await page.waitForTimeout(500);
      const cat = fieldIn(page, 'Category (UCS)');
      result.phaseA[n] = { categoryVisible: await cat.isVisible(), labels: await labelsOf(page) };
      await cat.fill('DOORWood');
      await fieldIn(page, 'Keywords').fill('door, slam');
      await fieldIn(page, 'Comment').fill('მძიმე კარი');
      await page.waitForTimeout(300);
      const saveBtn = page.getByRole('button', { name: /Save Tags/ });
      const vp = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
      result.phaseA[n].saveButtonBox = await saveBtn.boundingBox();
      result.phaseA[n].categoryBox = await cat.boundingBox();
      result.phaseA[n].viewport = vp;
      await page.screenshot({ path: join(OUT, `0${i++}-${n}-before-save.png`) });
      await saveBtn.click();
      await page.getByText('Tags saved').first().waitFor({ timeout: 10000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: join(OUT, `0${i++}-${n}-after-save.png`) });
      result.phaseA[n].panelAfter = { category: await fieldIn(page, 'Category (UCS)').inputValue(), keywords: await fieldIn(page, 'Keywords').inputValue(), comment: await fieldIn(page, 'Comment').inputValue() };
      await page.waitForTimeout(2500);
    }
    // untouched: Title only
    await page.getByText('untouched.wav', { exact: true }).first().click();
    await page.waitForTimeout(500);
    await fieldIn(page, 'Title').fill('Only a title');
    await page.getByRole('button', { name: /Save Tags/ }).click();
    await page.getByText('Tags saved').first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT, `0${i++}-untouched-after-save.png`) });
    await page.waitForTimeout(2500);
    // batch: Title only on 2 files
    await page.getByText('batch-a.wav', { exact: true }).first().click();
    await page.waitForTimeout(300);
    await page.getByText('batch-b.wav', { exact: true }).first().click({ modifiers: ['Control'] });
    await page.waitForTimeout(500);
    await fieldIn(page, 'Title').fill('Batch title');
    await page.screenshot({ path: join(OUT, `0${i++}-batch-before-save.png`) });
    await page.getByRole('button', { name: /Save to 2 files/ }).click();
    await page.getByText('Tags saved to 2 files').first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT, `0${i++}-batch-after-save.png`) });
    await page.waitForTimeout(2500);
    // rescan: rows still render
    await page.getByText('Rescan', { exact: true }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, '10-after-rescan.png') });
    result.phaseA.bodyAfterRescan = await page.locator('body').innerText();
    // R3-8: custom field Client / ICAT
    await page.getByText('contract.wav', { exact: true }).first().click();
    await page.waitForTimeout(400);
    await page.locator('button[title="Customize Fields"]').click();
    await page.waitForTimeout(400);
    await page.getByPlaceholder('Field name (e.g. Client)').fill('Client');
    await page.getByPlaceholder('RIFF ID (auto)').fill('ICAT');
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.waitForTimeout(400);
    result.phaseA.r38Error = await page.getByText('RIFF ID "ICAT" is already in use').isVisible();
    await page.screenshot({ path: join(OUT, '11-schema-editor-icat-rejected.png') });
    result.phaseA.r38SchemaText = await page.locator('body').innerText();
    // also: lowercase + after hiding Category
    await page.getByPlaceholder('RIFF ID (auto)').fill('icat');
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.waitForTimeout(300);
    result.phaseA.r38LowerError = await page.getByText('RIFF ID "ICAT" is already in use').isVisible();
    // auto-generated id for a name that could map to ICAT
    await page.getByPlaceholder('RIFF ID (auto)').fill('');
    await page.getByPlaceholder('Field name (e.g. Client)').fill('icat');
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.waitForTimeout(400);
    result.phaseA.autoIdFields = await page.evaluate(() => window.api.loadSchema());
    await page.screenshot({ path: join(OUT, '12-schema-editor-auto-id.png') });
  } finally {
    await app.close();
  }
}

// analysis Phase A
const files = {};
for (const n of ['contract.wav', 'recorder.wav', 'untouched.wav', 'batch-a.wav', 'batch-b.wav']) {
  const p = join(dir, n);
  const m = await mm.parseFile(p);
  const native = {};
  for (const [k, v] of Object.entries(m.native)) native[k] = v.map((t) => ({ id: t.id, value: typeof t.value === 'object' ? JSON.stringify(t.value).slice(0, 120) : t.value }));
  files[n] = {
    ffprobe: JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format.tags ?? {},
    info: info(p),
    riff: dump(readFileSync(p)).chunks.map((c) => `${c.id}${c.listType ? '/' + c.listType : ''}:${c.size}`),
    riffSizeOk: dump(readFileSync(p)).riffSizeOk,
    sha: { data: chunkSha(p, 'data'), bext: chunkSha(p, 'bext'), iXML: chunkSha(p, 'iXML') },
    mm: { common: { title: m.common.title, comment: m.common.comment, keywords: m.common.keywords, category: m.common.category }, nativeTypes: Object.keys(m.native), native },
  };
}
result.files = files;

// ---------- Phase B: R3-7 old schema.json ----------
{
  const cfgB = join(work, 'xdgB'); mkdirSync(cfgB);
  const ud = join(cfgB, result.phaseA.userData.split('/').pop());
  mkdirSync(ud, { recursive: true });
  const old = readFileSync(join(OUT, 'pre-t1-fields.json'), 'utf8');
  writeFileSync(join(ud, 'schema.json'), old);
  result.phaseB.schemaPath = join(ud, 'schema.json');
  const { app, page } = await launch(cfgB);
  try {
    result.phaseB.loadedSchemaKeys = (await page.evaluate(() => window.api.loadSchema())).map((f) => f.key);
    await page.getByText('Open Folder', { exact: true }).click();
    await page.getByText('untouched.wav', { exact: true }).first().waitFor();
    await page.getByText('untouched.wav', { exact: true }).first().click();
    await page.waitForTimeout(600);
    result.phaseB.labelsBefore = await labelsOf(page);
    await page.screenshot({ path: join(OUT, '20-old-schema-no-category.png') });
    await page.locator('button[title="Customize Fields"]').click();
    await page.waitForTimeout(400);
    result.phaseB.hiddenVisible = await page.getByText('Hidden Standard Fields').isVisible();
    result.phaseB.plusCategoryVisible = await page.getByRole('button', { name: '+ Category (UCS)' }).isVisible();
    await page.screenshot({ path: join(OUT, '21-old-schema-editor-hidden-category.png') });
    // R3-8 variant: ICAT still rejected while Category hidden
    await page.getByPlaceholder('Field name (e.g. Client)').fill('Client');
    await page.getByPlaceholder('RIFF ID (auto)').fill('ICAT');
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.waitForTimeout(300);
    result.phaseB.icatRejectedWhileHidden = await page.getByText('RIFF ID "ICAT" is already in use').isVisible();
    await page.getByPlaceholder('Field name (e.g. Client)').fill('');
    await page.getByPlaceholder('RIFF ID (auto)').fill('');
    await page.getByRole('button', { name: '+ Category (UCS)' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Done' }).click();
    await page.waitForTimeout(800);
    result.phaseB.labelsAfter = await labelsOf(page);
    await page.screenshot({ path: join(OUT, '22-old-schema-category-enabled.png') });
    await page.waitForTimeout(500);
  } finally {
    await app.close();
  }
  result.phaseB.savedSchemaKeys = JSON.parse(readFileSync(result.phaseB.schemaPath, 'utf8')).map((f) => f.key);
  // relaunch: persisted?
  const { app: app2, page: page2 } = await launch(cfgB);
  try {
    await page2.getByText('Open Folder', { exact: true }).click();
    await page2.getByText('untouched.wav', { exact: true }).first().click();
    await page2.waitForTimeout(600);
    result.phaseB.labelsAfterRelaunch = await labelsOf(page2);
    await page2.screenshot({ path: join(OUT, '23-old-schema-after-relaunch.png') });
  } finally {
    await app2.close();
  }
}

writeFileSync(join(OUT, 'r3-6-result.json'), JSON.stringify(result, null, 2));
console.log('done', work);
