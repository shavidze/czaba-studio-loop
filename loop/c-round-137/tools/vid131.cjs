// C round 131 video import copy rows. node vid131.cjs <1440|1280> <add|reject|noaudio|drop> <tag>
// Expected strings are hand-written from task §1.1 (not imported from strings.ts).
const W = +process.argv[2] || 1440;
const SEC = process.argv[3]; const TAG = process.argv[4] || 'r1';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const MEDIA = L.MEDIA; const OWN = path.join(__dirname, '..', 'media') + '/';
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const SUB = ['ვიდეო', 'მუსიკა', 'სტემები', 'ხმა არ არის', 'ხმა იშიფრება…', 'ხმა ვერ წაიკითხა', 'აქ ვიდეო არ ემატება — ჩააგდე ვიდეოხაზზე'];
const gNet = (s) => { let t = s || ''; const used = []; for (const n of SUB) if (t.includes(n)) { used.push(n); t = t.split(n).join(''); } return { net: gc(t), raw: gc(s), subtracted: used }; };
const fmt = (sec) => { const ms = Math.round(Math.max(0, sec) * 1000); const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000); return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
const Q = (t) => `“${t}”`;
const E = {
  opening: (n) => `Opening ${Q(n)}…`,
  added: (n, a, b) => `${Q(n)} added to the video track: ${a} — ${b}`,
  hist: (n) => `Undo: Add video — ${n}`,
  audio: (n) => `${Q(n)}: audio files cannot be added here — only your own video can; sounds are added from the library.`,
  notVideo: (n, d) => `${Q(n)}: the format is not video (${d}).`,
  probe: (n) => `${Q(n)}: the browser could not open this video — try MP4 (H.264) or WebM.`,
  drop: 'Drop the video on the video track.',
  noSound: (n) => `Original video sound (${n}): The video has no sound`,
};
const net = []; const res = { vp: W, sec: SEC, tag: TAG, startedUtc: new Date().toISOString(), steps: [] };
const OUTF = path.join(L.OUT, `vid131-${SEC}-${W}-${TAG}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
const undoT = async () => ((await X.undoTitle(P)) || '');
const vclips = () => P.evaluate(() => { const z = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]; return [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ kind: e.dataset.clipKind, lane: e.closest('[data-track-id]').getAttribute('data-track-id'), start: +e.getAttribute('data-clip-start'), wdur: +(e.getBoundingClientRect().width / z).toFixed(3), text: e.textContent.trim().slice(0, 60) })); });
const allBrief = async () => (await vclips()).map((c) => `${c.lane}:${c.kind}@${c.start}+${c.wdur}`).sort().join(' ');
const statusBox = () => P.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-status]'); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, sw: e.scrollWidth, cw: e.clientWidth, docSW: document.documentElement.scrollWidth, vw: innerWidth }; });
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-131/shots/${f}`; }
async function obsInstall() {
  await P.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    const Wd = { recs: [], t0: performance.now(), last: out.textContent };
    window.__so = Wd;
    Wd.mo = new MutationObserver(() => { const t = out.textContent; if (t !== Wd.last) { Wd.last = t; Wd.recs.push({ t: Math.round(performance.now() - Wd.t0), text: t.trim() }); } });
    Wd.mo.observe(out, { childList: true, subtree: true, characterData: true });
  });
}
const obsTake = () => P.evaluate(() => { const r = window.__so.recs.slice(); window.__so.recs = []; return r; });
async function mediaDuration(file) {
  const b64 = fs.readFileSync(file).toString('base64');
  return P.evaluate(async (b) => { const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)); const u = URL.createObjectURL(new Blob([bin])); const v = document.createElement('video'); v.muted = true; v.preload = 'metadata'; v.src = u; const d = await new Promise((r) => { v.onloadedmetadata = () => r(v.duration); v.onerror = () => r('error'); setTimeout(() => r('timeout'), 8000); }); URL.revokeObjectURL(u); return d; }, b64);
}
async function input(files) {
  await P.locator('[data-testid=arrangement-video-input]').first().setInputFiles(files);
}
async function waitStatusSettled(pred, ms = 15000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await L.status(P); if (pred(s)) return s; await sleep(150); } return L.status(P); }
async function step(id, expected, extra = {}) {
  const status = await L.status(P);
  const undo = await undoT();
  const r = { id, expected, status, exact: expected === null ? null : status === expected, geoStatus: gNet(status), undo, geoUndo: gNet(undo), clips: await allBrief(), pos: await L.posNow(P), observer: await obsTake(), ...extra };
  res.steps.push(r); save();
  console.log(id, r.exact === null ? 'INFO' : r.exact ? 'OK ' : 'XX ', JSON.stringify(status), r.exact === false ? ' expected ' + JSON.stringify(expected) : '', '| undo:', undo, '| obs:', JSON.stringify(r.observer.map((o) => o.text)));
  return r;
}

async function addOne(file, type) {
  const before = (await vclips()).filter((c) => c.kind === 'video');
  const lastEnd = before.reduce((m, c) => Math.max(m, c.start + c.wdur), 0);
  const dur = await mediaDuration(MEDIA + file);
  await L.seekTo(P, 1.5); await sleep(300);
  const pos0 = await L.posNow(P);
  await input(MEDIA + file);
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) { const n = (await vclips()).filter((c) => c.kind === 'video').length; if (n > before.length) break; await sleep(150); }
  await sleep(2500);
  const after = (await vclips()).filter((c) => c.kind === 'video');
  const nc = after.find((c) => !before.some((b) => Math.abs(b.start - c.start) < 0.01));
  const exp = nc ? E.added(file, fmt(nc.start), fmt(nc.start + Math.round(dur * 1000) / 1000)) : null;
  const r = await step(`ADD-${file}`, exp, { realDuration: dur, expectedStartFromLastEnd: +lastEnd.toFixed(3), newClip: nc, pos0, videoCount: after.length, sawOpening: null });
  r.sawOpening = r.observer.some((o) => o.text === E.opening(file));
  r.seekToStart = nc ? Math.abs(r.pos - nc.start) < 0.05 : false;
  save();
  console.log('  opening seen', r.sawOpening, 'seek', r.seekToStart, 'pos', r.pos, 'clip', JSON.stringify(nc), 'dur', dur);
  return r;
}

(async () => {
  const b = await L.launch();
  try {
    const o = await L.openStudio(b, X.VPS[W], `vid131-${SEC}-${W}-${TAG}`, net);
    P = o.page;
    await P.mouse.move(2, 2);
    await obsInstall();
    res.initial = { clips: await allBrief(), undo: await undoT(), status: await L.status(P), statusBox: await statusBox() };
    res.shot0 = await shot(`${SEC}-start`);
    if (SEC === 'add') {
      const a = await addOne('beeps-6s-h264-aac.mp4');
      res.shotA = await shot('add-a');
      const title = await undoT();
      const c1 = await allBrief();
      await X.key(P, 'Control+z'); await sleep(500);
      const afterUndo = { clips: await allBrief(), status: await L.status(P), vcount: (await vclips()).filter((c) => c.kind === 'video').length };
      await X.key(P, 'Control+Shift+z'); await sleep(800);
      const afterRedo = { clips: await allBrief(), status: await L.status(P), vcount: (await vclips()).filter((c) => c.kind === 'video').length };
      res.steps.push({ id: 'ADD-undo-redo', undoTitle: title, expectedTitle: E.hist('beeps-6s-h264-aac.mp4') + '|false', titleOk: title === E.hist('beeps-6s-h264-aac.mp4') + '|false', geoUndo: gNet(title), before: c1, afterUndo, afterRedo, redoRestores: afterRedo.clips === c1, observer: await obsTake() }); save();
      console.log('UNDO', title, JSON.stringify(afterUndo), JSON.stringify(afterRedo));
      await addOne('beeps-6s-vp9-opus.webm');
      await addOne('clip-3s-h264-aac.mov');
      res.shotC = await shot('add-c');
      res.endBox = await statusBox();
    } else if (SEC === 'reject') {
      const u0 = await undoT(); const c0 = await allBrief();
      const chk = async (id, files, exp, waitMs = 1500) => {
        await input(files);
        let s;
        if (waitMs > 5000) s = await waitStatusSettled((x) => x === exp || (/^(?!Opening)/.test(x) && x.length > 0 && !/Opening/.test(x)), waitMs); else { await sleep(waitMs); }
        const r = await step(id, exp, { noClipAdded: null, noUndoEntry: null });
        r.noClipAdded = r.clips === c0; r.noUndoEntry = r.undo === u0; r.box = await statusBox(); save();
        console.log('  noClip', r.noClipAdded, 'noUndo', r.noUndoEntry, JSON.stringify(r.box));
        return r;
      };
      await chk('REJ-a-wav', MEDIA + 'tone-2s.wav', E.audio('tone-2s.wav'));
      res.shotRa = await shot('rej-a');
      await chk('REJ-b-pdf', OWN + 'doc.pdf', E.notVideo('doc.pdf', '.pdf'));
      const ft = await P.evaluate(() => { const inp = document.querySelector('[data-testid=arrangement-video-input]'); const f = new File(['plain bytes'], 'noext'); const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); return { name: f.name, type: f.type, inputType: inp.files[0] ? inp.files[0].type : null }; });
      await sleep(1500);
      const rc = await step('REJ-c-noext', E.notVideo('noext', 'unknown type'), { fileType: ft }); rc.noClipAdded = rc.clips === c0; rc.noUndoEntry = rc.undo === u0; save();
      const t0 = Date.now();
      const rd = await chk('REJ-d-broken', MEDIA + 'broken.mp4', E.probe('broken.mp4'), 14000);
      rd.settleMs = Date.now() - t0; rd.sawOpening = rd.observer.some((x) => x.text === E.opening('broken.mp4')); save();
      res.shotRd = await shot('rej-d');
      const re = await chk('REJ-e-batch', [MEDIA + 'tone-2s.wav', OWN + 'doc.pdf'], [E.audio('tone-2s.wav'), E.notVideo('doc.pdf', '.pdf')].join(' · '));
      res.longestBox = re.box;
      res.shotRe = await shot('rej-e');
    } else if (SEC === 'noaudio') {
      const files = W === 1440 ? [[MEDIA, 'noaudio-2s-h264.mp4'], [MEDIA, 'noaudio-2s-vp9.webm']] : [[MEDIA, 'noaudio-2s-h264.mp4']];
      for (const [dir, f] of files) {
        const dur = await mediaDuration(dir + f);
        const n0 = (await vclips()).filter((c) => c.kind === 'video').length;
        await input(dir + f);
        const t0 = Date.now(); while (Date.now() - t0 < 30000) { if ((await vclips()).filter((c) => c.kind === 'video').length > n0) break; await sleep(150); }
        await sleep(3000);
        const r = await step(`NA-add-${f}`, null, { realDuration: dur });
        r.badges = await P.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((c) => c.textContent.trim().slice(0, 80))); save();
      }
      await X.openDlg(P); await sleep(1500);
      const list = await P.evaluate(() => { const u = document.querySelector('[data-testid=arrangement-export-video-sound]'); return u ? [...u.querySelectorAll('li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()) : null; });
      const exp = files.map(([, f]) => E.noSound(f));
      const r = { id: 'NA-export-list', list, expected: exp, exact: JSON.stringify(list) === JSON.stringify(exp), geo: (list || []).map(gNet) };
      res.steps.push(r); save();
      console.log('EXPORT LIST', JSON.stringify(list), r.exact ? 'OK' : 'XX');
      res.shotDlg = await shot('noaudio-export');
      await P.keyboard.press('Escape'); await sleep(400);
    } else if (SEC === 'drop') {
      const c0 = await allBrief(); const u0 = await undoT();
      const drop = async (dir, file, type) => {
        const bytes = fs.readFileSync(dir + file).toString('base64');
        return P.evaluate(async ([b64, name, type]) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); const f = new File([bin], name, { type }); const dt = new DataTransfer(); dt.items.add(f); const lane = document.querySelector('[data-track-id=music]'); const tgt = [...lane.querySelectorAll('*')].find((e) => e.getBoundingClientRect().width > 300 && e.getBoundingClientRect().height > 30) || lane; const r = tgt.getBoundingClientRect(); const o = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: r.left + r.width * 0.7, clientY: r.top + r.height / 2 }; tgt.dispatchEvent(new DragEvent('dragenter', o)); tgt.dispatchEvent(new DragEvent('dragover', o)); const ok = tgt.dispatchEvent(new DragEvent('drop', o)); return { tag: tgt.tagName, cls: tgt.className.slice(0, 60), dropCancelled: !ok }; }, [bytes, file, type]);
      };
      const d1 = await drop(MEDIA, 'beeps-6s-vp9-opus.webm', 'video/webm'); await sleep(1500);
      const r1 = await step('DROP-webm-music', E.drop, { dispatch: d1 }); r1.noClipAdded = r1.clips === c0; r1.noUndo = r1.undo === u0; save();
      res.shotD1 = await shot('drop-webm');
      const d2 = await drop(MEDIA, 'tone-2s.wav', 'audio/wav'); await sleep(1500);
      const r2 = await step('DROP-wav-music', E.audio('tone-2s.wav'), { dispatch: d2 }); r2.noClipAdded = r2.clips === c0; r2.noUndo = r2.undo === u0; save();
      res.shotD2 = await shot('drop-wav');
    }
  } catch (e) { res.error = String(e.stack || e); console.log('ERROR', res.error); }
  res.endUtc = new Date().toISOString(); save();
  console.log('NET', JSON.stringify(X.netOk(net)));
  await b.close();
})();
