import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-35';
const APPROOT = process.argv[2]; const LABEL = process.argv[3]; const SCEN = process.argv[4];
const TAG = `r35-5-${LABEL}-${SCEN}`;
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const mm = await import(pathToFileURL(req.resolve('music-metadata')).href);
const work = mkdtempSync(join(tmpdir(), `c-r35-${LABEL}-${SCEN}-`));
const slow = join(work, 'slow'); mkdirSync(slow);
const fast = join(work, 'fast'); mkdirSync(fast);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
const ARM = { scan: join(work, 'ARM_SCAN'), nth: join(work, 'ARM_NTH') };
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(slow, 's.wav'));
copyFileSync(REPO + '/tests/fixtures/sample.wav', join(fast, 'f.wav'));
const S = join(slow, 's.wav'), F = join(fast, 'f.wav');
const result = { label: LABEL, scenario: SCEN, appRoot: APPROOT, workDir: work, phases: {}, checks: {} };
const ok = (k, v, detail) => { result.checks[k] = { pass: !!v, detail }; };
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const shas = () => ({ s: sha(S), f: sha(F) });
const ffprobe = (p) => { try { return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags', '-of', 'json', p]).toString()).format?.tags ?? {}; } catch (e) { return { error: String(e).slice(0, 200) }; } };
async function mmRead(p) { try { const r = await mm.parseFile(p); const native = {}; for (const [k, v] of Object.entries(r.native)) for (const t of v) { const key = `${k}:${t.id}`; native[key] = native[key] === undefined ? t.value : [].concat(native[key], t.value); } return { native, artists: r.common.artists, artist: r.common.artist }; } catch (e) { return { error: String(e) }; } }
const pick = (o, id) => o?.[id] ?? o?.[id.toLowerCase()];
const read1 = async (p) => { const f = ffprobe(p); const r = await mmRead(p); const n = r.native || {}; return { ffprobe: f, mmNative: n, mmArtists: r.artists, ff: { ICAT: pick(f, 'ICAT'), QONE: pick(f, 'QONE'), QTWO: pick(f, 'QTWO'), artist: pick(f, 'artist') }, mm: { ICAT: n['exif:ICAT'], QONE: n['exif:QONE'], QTWO: n['exif:QTWO'] }, r35Keys: [...Object.keys(f), ...Object.keys(n)].filter((k) => /r35/i.test(k)), r35Values: [...Object.values(f), ...Object.values(n)].filter((v) => /r35note/i.test(String(v))) }; };
const readers = async () => ({ s: await read1(S), f: await read1(F) });
const app = await _electron.launch({ args: ['--no-sandbox', '-r', OUT + '/harness.cjs', join(APPROOT, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg, R35_SCAN_MS: '4000', R35_SCAN_FILE: ARM.scan, R35_NTH_FILE: ARM.nth } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
const setDialog = (d) => app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, d);
await page.waitForTimeout(800);
let phase = 'setup';
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${phase}: ${String(e)}`));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const block = (label) => page.locator('div.space-y-1', { has: page.locator('label', { hasText: new RegExp(`^${esc(label)}$`) }) });
const fieldIn = (label) => block(label).locator('input, textarea').first();
const val = async (label) => ((await block(label).count()) ? await fieldIn(label).inputValue() : '<no field>');
const nameCell = (n) => page.locator('span.truncate.text-foreground', { hasText: new RegExp(`^${esc(n)}$`) }).first();
const editorOpen = async () => (await page.getByText('Add Custom Field').count()) > 0;
const doneBtn = () => page.locator('button', { hasText: /^(Done|Applying\.\.\.)$/ });
const backBtn = () => page.locator('span', { hasText: /^Customize Fields$/ }).locator('xpath=..').locator('button').first();
let shotN = 0;
const shot = async (name) => { const p = join(OUT, `${TAG}-${String(shotN++).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: p }); return p; };
const bodyText = async () => page.locator('body').innerText();
const waitToast = async (re, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { const r = (await bodyText()).match(re); if (r) return { text: r[0], at: Date.now() }; await page.waitForTimeout(50); } return null; };
const waitNoToast = async (ms = 10000) => { const end = Date.now() + ms; while (Date.now() < end) { if (!/(Tags saved|Unsaved changes|Failed|failed)/.test(await bodyText())) return true; await page.waitForTimeout(100); } return false; };
const form = async () => ({ category: await val('Category (UCS)'), qone: await val('Qone'), qtwo: await val('Qtwo'), r35note: await val('R35note') });
const ipcLog = () => app.evaluate(() => globalThis.__r35log);
const openFolder = async (dir) => { await setDialog(dir); await page.getByRole('button', { name: /Open Folder/ }).first().click(); };
const addField = async (name, riff) => { await page.getByPlaceholder('Field name (e.g. Client)').fill(name); if (riff) await page.getByPlaceholder('RIFF ID (auto)').fill(riff); await page.getByRole('button', { name: /Add Field/ }).click(); await page.waitForTimeout(150); };
const openCustomize = async () => { await page.getByTitle('Customize Fields').click(); await page.getByText('Add Custom Field').waitFor({ timeout: 5000 }); };
const waitEditorClosed = async (ms = 10000) => page.getByText('Add Custom Field').waitFor({ state: 'detached', timeout: ms });
const domState = () => page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const done = btns.find((b) => /^(Done|Applying\.\.\.)$/.test((b.textContent || '').trim()));
  const fs = document.querySelector('fieldset');
  const name = document.querySelector('input[placeholder="Field name (e.g. Client)"]');
  const riff = document.querySelector('input[placeholder="RIFF ID (auto)"]');
  const sel = fs ? fs.querySelector('select') : null;
  const add = btns.find((b) => /Add Field/.test(b.textContent || ''));
  const back = document.querySelector('svg.lucide-arrow-left')?.closest('button');
  const controls = fs ? [...fs.querySelectorAll('button,input,select')] : [];
  const d = (el) => (el ? el.matches(':disabled') : null);
  return {
    t: Date.now(),
    done: done ? { text: done.textContent.trim(), disabledProp: done.disabled, matchesDisabled: d(done), ariaAttrs: [...done.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-')) } : null,
    fieldset: fs ? { disabledAttr: fs.hasAttribute('disabled'), opacity: getComputedStyle(fs).opacity, border: getComputedStyle(fs).borderTopWidth, padding: getComputedStyle(fs).paddingTop, margin: getComputedStyle(fs).marginTop, width: fs.getBoundingClientRect().width } : null,
    nameInput: d(name), riffInput: d(riff), typeSelect: d(sel), addField: d(add), back: back ? { matchesDisabled: d(back), insideFieldset: !!(fs && fs.contains(back)) } : null,
    controlsInFieldset: controls.length, controlsDisabled: controls.filter((c) => c.matches(':disabled')).length,
    scroller: (() => { const s = fs?.parentElement; return s ? { className: s.className, overflowY: getComputedStyle(s).overflowY } : null; })(),
  };
});
const readBatchAfter = (log, t0) => log.filter((e) => e.channel === 'meta:read-batch' && e.phase === 'start' && e.at >= t0);
async function saveFile(name, cat, extra) {
  await nameCell(name).click(); await page.waitForTimeout(600);
  await fieldIn('Category (UCS)').fill(cat);
  if (extra) for (const [l, v] of Object.entries(extra)) await fieldIn(l).fill(v);
  await page.getByRole('button', { name: /Save Tags/ }).click();
  const t = await waitToast(/Tags saved/);
  await page.waitForTimeout(1200);
  return t;
}
const trashCustom = async (label) => { const row = page.locator('div.flex.items-center.rounded', { has: page.locator('span', { hasText: new RegExp(`^${label}$`) }) }).last(); await row.locator('button').last().click(); await page.waitForTimeout(200); };
try {
  await openFolder(fast); await nameCell('f.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(800);
  result.phases.setupFast = await saveFile('f.wav', 'R35Fast');
  await waitNoToast();
  await openFolder(slow); await nameCell('s.wav').waitFor({ timeout: 30000 }); await page.waitForTimeout(800);
  await nameCell('s.wav').click(); await page.waitForTimeout(600);
  await openCustomize(); await addField('Qone', 'QONE'); await addField('Qtwo', 'QTWO');
  await doneBtn().click(); await waitEditorClosed(); await page.waitForTimeout(500);
  result.phases.setupSlow = await saveFile('s.wav', 'R35Slow', { Qone: 'V1', Qtwo: 'V2' });
  await waitNoToast();
  await openCustomize(); await trashCustom('Qone'); await trashCustom('Qtwo');
  result.phases.setupTrashed = (await page.locator('span', { hasText: /^(Qone|Qtwo)$/ }).count()) === 0;
  await doneBtn().click(); await waitEditorClosed(); await page.waitForTimeout(800);
  if (await nameCell('s.wav').count()) { await nameCell('s.wav').click(); await page.waitForTimeout(500); }
  await shot('setup-done');
  result.shaAfterSetup = shas();
  result.readersAfterSetup = await readers();
  result.phases.setupForm = await form();
  phase = `action-${SCEN}`;
  const t0 = Date.now();
  if (SCEN === 'P' || SCEN === 'PB') {
    writeFileSync(ARM.scan, '1');
    await openCustomize();
    await openFolder(fast); const tOpen = Date.now();
    await addField('R35note');
    await doneBtn().click(); const tDone = Date.now();
    const st = await domState(); st.msAfterDone = st.t - tDone;
    result.phases.domPending = st;
    await shot('pending');
    result.phases.doneAfterOpenMs = tDone - tOpen;
    if (SCEN === 'P') {
      await doneBtn().click({ force: true, timeout: 2000 }).catch((e) => { result.phases.secondClickError = String(e).slice(0, 200); });
      result.phases.secondClickAtMs = Date.now() - tDone;
      result.phases.domAfterSecondClick = await domState();
      await nameCell('f.wav').waitFor({ timeout: 15000 });
      result.phases.fListedMsAfterDone = Date.now() - tDone;
      await page.waitForTimeout(2000);
      result.phases.editorOpenAfterLoadPlus2s = await editorOpen();
      await shot('after-load-2s');
      await nameCell('f.wav').click(); await page.waitForTimeout(800);
      result.phases.fForm = await form();
      if (await block('R35note').count()) await block('R35note').scrollIntoViewIfNeeded();
      await shot('f-form');
    } else {
      await backBtn().click(); await page.waitForTimeout(150);
      result.phases.editorOpenAfterBack = await editorOpen();
      if (await nameCell('s.wav').count()) { await nameCell('s.wav').click(); await page.waitForTimeout(300); }
      await openCustomize();
      result.phases.domReopened = await domState();
      await shot('reopened');
      await nameCell('f.wav').waitFor({ timeout: 15000 }); await page.waitForTimeout(2000);
      result.phases.reopenedOpenAfterLoadPlus2s = await editorOpen();
      result.phases.domReopenedAfterLoad = await domState();
      await shot('reopened-after-load');
    }
  } else if (SCEN === 'X') {
    writeFileSync(ARM.nth, '1:4000:X');
    await openCustomize(); await addField('Qone', 'QONE');
    await doneBtn().click(); const tDone1 = Date.now();
    await page.waitForTimeout(150);
    result.phases.domAfterDone1 = await domState();
    await backBtn().click(); await page.waitForTimeout(150);
    await openCustomize(); await addField('Qtwo', 'QTWO');
    await doneBtn().click(); const tDone2 = Date.now();
    result.phases.done2AfterDone1Ms = tDone2 - tDone1;
    await waitEditorClosed(5000).catch(() => {});
    result.phases.editorClosedAfterDone2Ms = (await editorOpen()) ? null : Date.now() - tDone2;
    await page.waitForTimeout(200);
    result.phases.formAfterDone2 = await form();
    const end = Date.now() + 10000; let rep = null;
    while (Date.now() < end) { const lg = await ipcLog(); const st = readBatchAfter(lg, t0).find((e) => e.delayMs > 0); if (st) rep = lg.find((e) => e.channel === 'meta:read-batch' && e.phase === 'reply' && e.seq === st.seq); if (rep) break; await page.waitForTimeout(100); }
    result.phases.delayedReplyMsAfterDone1 = rep ? rep.at - tDone1 : null;
    await page.waitForTimeout(2000);
    if (await nameCell('s.wav').count()) { await nameCell('s.wav').click(); await page.waitForTimeout(500); }
    result.phases.formAfterLateReply = await form();
    if (await block('Qtwo').count()) await block('Qtwo').scrollIntoViewIfNeeded();
    await shot('s-form-after-late-reply');
  } else if (SCEN === 'N') {
    await waitNoToast();
    await openCustomize(); await page.waitForTimeout(400);
    result.phases.domIdle = await domState();
    result.phases.idleShot = await shot('idle-editor');
    await addField('R35note');
    await doneBtn().click(); const tDone = Date.now();
    await waitEditorClosed(5000).catch(() => {});
    result.phases.editorClosedMs = (await editorOpen()) ? null : Date.now() - tDone;
    await shot('after-done');
  }
  for (const f of Object.values(ARM)) rmSync(f, { force: true });
  result.ipcAction = readBatchAfter(await ipcLog(), t0).map((e) => ({ seq: e.seq, paths: e.paths, keys: e.keys, nth: e.nthAfterArm, delayMs: e.delayMs, dt: e.at - t0 }));
} catch (e) {
  result.error = String(e?.stack ?? e);
  await shot('error').catch(() => {});
}
result.ipc = await ipcLog().catch(() => []);
await app.close().catch(() => {});
result.pageErrors = pageErrors;
result.shaFinal = shas();
result.readersFinal = await readers();
const A = result.readersAfterSetup; const R = result.readersFinal;
const both = (x, k, v) => x && x.ff[k] === v && x.mm[k] === v;
ok('setup Tags saved x2', !!result.phases.setupFast && !!result.phases.setupSlow);
ok('setup readers s ICAT/QONE/QTWO, f ICAT', A && both(A.s, 'ICAT', 'R35Slow') && both(A.s, 'QONE', 'V1') && both(A.s, 'QTWO', 'V2') && both(A.f, 'ICAT', 'R35Fast'), A && { s: { ff: A.s.ff, mm: A.s.mm }, f: { ff: A.f.ff, mm: A.f.mm } });
ok('sha unchanged after setup', result.shaAfterSetup?.f === result.shaFinal.f && result.shaAfterSetup?.s === result.shaFinal.s, { afterSetup: result.shaAfterSetup, final: result.shaFinal });
ok('final readers s ICAT/QONE/QTWO, f ICAT', both(R.s, 'ICAT', 'R35Slow') && both(R.s, 'QONE', 'V1') && both(R.s, 'QTWO', 'V2') && both(R.f, 'ICAT', 'R35Fast'), { s: { ff: R.s.ff, mm: R.s.mm }, f: { ff: R.f.ff, mm: R.f.mm } });
ok('no R35note key/value in either file', R.s.r35Keys.length + R.f.r35Keys.length + R.s.r35Values.length + R.f.r35Values.length === 0, { s: [R.s.r35Keys, R.s.r35Values], f: [R.f.r35Keys, R.f.r35Values] });
ok('pageErrors empty', pageErrors.length === 0, pageErrors);
writeFileSync(join(OUT, `${TAG}.json`), JSON.stringify(result, null, 2));
console.log(TAG, JSON.stringify(Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass]))));
const { ipc, readersAfterSetup, readersFinal, ...brief } = result;
console.log(JSON.stringify(brief.phases));
console.log('ipcAction', JSON.stringify(result.ipcAction));
if (result.error) console.log('ERROR', result.error);
