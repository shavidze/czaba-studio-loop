// CX-KEYS, TRAP-CANCEL, CX-ESC per viewport (keyboard only after setup)
const X = require('./lib90.cjs');
const { sleep, blur } = X;
const vpArg = process.argv[2] || '1440x900';
const [w, h] = vpArg.split('x').map(Number);
const kp = (p) => p.evaluate(() => {
  const t = document.querySelector('#arrangement-export-title'); const d = t && t.closest('[role=dialog]'); const a = document.activeElement;
  const btns = d ? [...d.querySelectorAll('button')] : []; const busy = btns.find((b) => /მიმდინარეობს/.test(b.textContent));
  const tid = a && a.getAttribute('data-testid'); const al = a && a.getAttribute('aria-label'); const txt = a ? (a.textContent || '').trim() : '';
  const inside = !!(d && a && d.contains(a)); let id;
  if (!a || a === document.body) id = 'BODY'; else if (inside && a.tagName === 'BUTTON' && al === 'Close') id = 'X'; else if (tid) id = tid.replace('arrangement-export-', '');
  else if (inside && a.tagName === 'BUTTON' && txt === 'დახურვა') id = 'CloseBtn'; else if (inside && a.tagName === 'BUTTON' && /ექსპორტი$|მიმდინარეობს/.test(txt)) id = 'ExportBtn:' + txt;
  else if (inside && a.tagName === 'DIV' && a.tabIndex === -1) id = 'TRAP-WRAPPER'; else id = (al || a.tagName + ':' + txt.slice(0, 20));
  const lab = d && d.querySelector('[data-testid=arrangement-export-progress-label]');
  return { id, inside, dialog: !!d, busy: !!busy, label: lab ? lab.textContent : null };
});
async function press(p, key, log, delay = 20) { const b = log.__last || await kp(p); await p.keyboard.press(key); await sleep(delay); const a = await kp(p); log.__last = a; const r = { key, from: b.id, to: a.id, inside: a.inside, valid: b.busy && a.busy, label: a.label }; log.push(r); return r; }
async function openKbd(p) {
  const o = { steps: [] }; await blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).focus(); await p.keyboard.press('Enter');
  await p.waitForSelector('#arrangement-export-title'); await sleep(400); await X.installClickProbe(p);
  o.initial = (await kp(p)).id; let g = 0;
  while (g < 15 && !/^ExportBtn:/.test((await kp(p)).id)) { await p.keyboard.press('Tab'); await sleep(100); o.steps.push((await kp(p)).id); g++; }
  o.atBtn = (await kp(p)).id; return o;
}
async function waitFiles(p, n0, need, ms = 60000) { const t = Date.now(); while (Date.now() - t < ms && p.S.downloads.length - n0 < need) await sleep(200); await sleep(1500); return p.S.downloads.slice(n0); }
(async () => {
  const b = await X.launch(); const R = { vp: vpArg };
  // ---- CX-KEYS ----
  {
    const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `keys-${vpArg}`);
    R.scope = await X.setup(p, 2); await p.keyboard.press('Escape'); await sleep(400);
    const o = await openKbd(p); R.keysOpen = o;
    const n0 = S.downloads.length; await p.keyboard.press('Enter'); await sleep(30);
    const log = []; let g = 0;
    while (g < 6) { const r = await press(p, 'Tab', log, 15); g++; if (r.to === 'cancel') break; }
    R.keysTabs = log.slice();
    const before = await kp(p);
    await p.keyboard.press('Enter'); await sleep(60);
    R.keysEnter = { before, clicks: await p.evaluate(() => window.__c90.clicks.slice()), after: await X.probe(p) };
    R.keysEnter.focusId = (await kp(p)).id;
    await sleep(15000); R.keysDl15 = S.downloads.slice(n0).map((d) => d.name); R.keysFinal = await X.probe(p);
    await p.keyboard.press('Escape'); await sleep(500);
    R.keysEsc = await p.evaluate(() => { const a = document.activeElement; return { dialogOpen: !!document.querySelector('#arrangement-export-title'), tag: a.tagName, text: (a.textContent || '').trim().slice(0, 20), aria: a.getAttribute('aria-label') }; });
    R.keysErrors = S.errors.slice(); await ctx.close();
  }
  // ---- TRAP-CANCEL + CX-ESC (fresh page) ----
  {
    const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `trap-${vpArg}`);
    await X.setup(p, 2); await p.keyboard.press('Escape'); await sleep(400);
    R.trapOpen = await openKbd(p);
    const n0 = S.downloads.length; await p.keyboard.press('Enter'); await sleep(30);
    const log = [];
    for (let i = 0; i < 6; i++) await press(p, 'Tab', log);
    for (let i = 0; i < 4; i++) await press(p, 'Shift+Tab', log);
    await p.screenshot({ path: `${X.SHOTS}/trap-${vpArg}.png` });
    R.trap = log; R.trapAllValid = log.every((r) => r.valid); R.trapAllInside = log.every((r) => r.inside);
    const files = await waitFiles(p, n0, 1); R.trapFiles = files.map((f) => f.name); R.trapWav = files[0] && files[0].file ? X.wavInfo(files[0].file) : null;
    R.trapClicks = await p.evaluate(() => window.__c90.clicks.slice()); R.trapFinal = await X.probe(p);
    // CX-ESC on same page
    await p.keyboard.press('Escape'); await sleep(400);
    R.escOpen = await openKbd(p);
    const n1 = S.downloads.length; await p.keyboard.press('Enter'); await sleep(40);
    R.esc = [];
    for (let i = 0; i < 2; i++) { const bf = await kp(p); await p.keyboard.press('Escape'); await sleep(30); const af = await kp(p); R.esc.push({ before: bf, after: af }); }
    const f2 = await waitFiles(p, n1, 1); R.escFiles = f2.map((f) => f.name); R.escWav = f2[0] && f2[0].file ? X.wavInfo(f2[0].file) : null; R.escFinal = await X.probe(p);
    R.escTl = await p.evaluate(() => window.__c90.tl.slice());
    R.trapErrors = S.errors.slice(); R.S = S; await ctx.close();
  }
  X.save(`keys-${vpArg}.json`, R);
  console.log(JSON.stringify({
    vp: vpArg, keysOpen: R.keysOpen, keysTabs: R.keysTabs.map((r) => `${r.from}>${r.to}${r.valid ? '' : '!'}@${r.label}`), keysEnter: { before: R.keysEnter.before, clicks: R.keysEnter.clicks, status: R.keysEnter.after.status, alert: R.keysEnter.after.alert, cancel: R.keysEnter.after.cancel, focus: R.keysEnter.focusId }, keysDl15: R.keysDl15, keysEsc: R.keysEsc,
    trap: R.trap.map((r) => `${r.key[0]}:${r.from}>${r.to}${r.valid ? '' : '!'}${r.inside ? '' : '#OUT'}`).join(' '), trapAllValid: R.trapAllValid, trapAllInside: R.trapAllInside, trapFiles: R.trapFiles, trapWav: R.trapWav && [R.trapWav.bits, R.trapWav.sr, R.trapWav.ch, R.trapWav.frames], trapClicks: R.trapClicks, trapStatus: R.trapFinal.status,
    esc: R.esc.map((e) => `${e.before.id}/${e.before.label}>${e.after.id} dlg=${e.after.dialog} busy=${e.after.busy}`), escFiles: R.escFiles, escWav: R.escWav && [R.escWav.bits, R.escWav.frames], escStatus: R.escFinal.status, errors: [R.keysErrors, R.trapErrors],
  }, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
