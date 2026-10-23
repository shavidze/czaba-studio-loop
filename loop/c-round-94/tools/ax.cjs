// AX-NAMES (a/b/c) + VIS-LAYOUT + REG-HYD/PX-NET per viewport; AX-SELECT at 1440. node ax.cjs 1280|1440
const X = require('./ext.cjs'); const { sleep, blur } = X;
const W = +process.argv[2]; const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const MP3_NOTE = 'LAME (ffmpeg.wasm) — encoder პირველ MP3 ექსპორტზე CDN-იდან იტვირთება (~31 MB)';
const BOTH_NOTE = 'იგივე მიქსი ორ ფაილად — ან ორივე შეიქმნება, ან არცერთი. ბრაუზერმა მეორე ფაილის ჩამოტვირთვაზე შეიძლება ნებართვა მოითხოვოს.';
const RANGE_REASON = 'მონიშნე დროის მონაკვეთი Arrangement-ში (drag კლიპზე ან სახაზავზე)';
const VIDEO_REASON = 'ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა (ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია).';
const G = { proj: 'მთელი პროექტი, იგივე graph რაც დაკვრისას', range: 'მონიშნული მონაკვეთი, იგივე graph რაც დაკვრისას', rangeLoop: 'მონიშნული მონაკვეთი წრფივად, იგივე მიქსით — loop იგნორირდება', projLoop: 'მთელი პროექტი წრფივად 0-დან ბოლომდე, იგივე მიქსით — loop იგნორირდება' };
const LEAK = /LAME|ან ორივე|graph|ვიდეოს რენდერი|მონიშნე დროის/;
const SEL = { wav: '[data-testid=arrangement-export-format-wav]', mp3: '[data-testid=arrangement-export-format-mp3]', both: '[data-testid=arrangement-export-format-both]', video: 'input[name="arrangement-export-format"]:disabled', project: '[data-testid=arrangement-export-scope-project]', range: '[data-testid=arrangement-export-scope-range]' };
async function ax(p, cdp) {
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  const out = {};
  for (const [k, s] of Object.entries(SEL)) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: s });
    if (!nodeId) { out[k] = null; continue; }
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    const n = nodes[0]; const prop = (nm) => (n.properties || []).find((x) => x.name === nm)?.value?.value;
    out[k] = { role: n.role?.value, name: n.name?.value ?? null, description: n.description?.value ?? null, nameSources: (n.name?.sources || []).filter((x) => x.value || x.attributeValue).map((x) => x.type + (x.attribute ? ':' + x.attribute : '')), checked: prop('checked'), disabled: prop('disabled') ?? false };
  }
  out.attrs = await p.evaluate((SEL) => Object.fromEntries(Object.entries(SEL).map(([k, s]) => { const e = document.querySelector(s); return [k, e && { lb: e.getAttribute('aria-labelledby'), db: e.getAttribute('aria-describedby'), lbOk: e.getAttribute('aria-labelledby') ? document.querySelectorAll('#' + CSS.escape(e.getAttribute('aria-labelledby'))).length === 1 && !!e.closest('[role=dialog]').contains(document.getElementById(e.getAttribute('aria-labelledby'))) : null, dbOk: e.getAttribute('aria-describedby') ? document.querySelectorAll('#' + CSS.escape(e.getAttribute('aria-describedby'))).length === 1 && !!e.closest('[role=dialog]').contains(document.getElementById(e.getAttribute('aria-describedby'))) : null, labelText: e.closest('label').textContent }]; })), SEL);
  out.leak = await p.getByRole('radio', { name: LEAK }).count();
  return out;
}
async function counts(p, names) { const r = {}; for (const n of names) r[n] = await p.getByRole('radio', { name: n, exact: true, includeHidden: false }).count(); return r; }
function check(a, exp) {
  const fails = [];
  for (const [k, [n, d]] of Object.entries(exp)) { const v = a[k]; if (!v) { fails.push(k + ':missing'); continue; } if (v.name !== n) fails.push(`${k}.name=${JSON.stringify(v.name)}`); if ((v.description || null) !== d) fails.push(`${k}.desc=${JSON.stringify(v.description)}`); }
  if (a.leak !== 0) fails.push('leak=' + a.leak);
  return fails;
}
const layout = (p) => p.evaluate(() => {
  const R = (e) => { const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), h: +r.height.toFixed(1), w: +r.width.toFixed(1) }; };
  return [...document.querySelectorAll('input[name="arrangement-export-format"]')].map((i) => {
    const lab = i.closest('label'); const nm = document.getElementById(i.getAttribute('aria-labelledby')); const nt = document.getElementById(i.getAttribute('aria-describedby'));
    const outer = nm.parentElement; const lh = parseFloat(getComputedStyle(nm).lineHeight);
    return { tid: i.dataset.testid || 'video', label: R(lab), outer: R(outer), name: R(nm), nameRects: nm.getClientRects().length, nameDisplay: getComputedStyle(nm).display, nameClass: nm.className, note: R(nt), noteClass: nt.className, noteBelow: nt.getBoundingClientRect().top >= nm.getBoundingClientRect().bottom - 0.5, lh };
  });
});
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, vp, `ax${W}`); const R = { vp: `${vp.width}x${vp.height}` };
  const cdp = await ctx.newCDPSession(p); await cdp.send('Accessibility.enable');
  const projLabel = (await X.setup(p, 0)).replace(/\s+/g, ' ').trim(); R.projLabel = projLabel;
  const PROJ = projLabel; const fmtNames = ['WAV · 24-bit · 48 kHz · stereo', 'MP3 · 48 kHz · stereo', 'WAV + MP3 · ორი ფაილი', 'ვიდეო (აუდიოთი)'];
  // (a)
  const a = await ax(p, cdp);
  const expA = { wav: [fmtNames[0], G.proj], mp3: [fmtNames[1], MP3_NOTE], both: [fmtNames[2], BOTH_NOTE], video: [fmtNames[3], VIDEO_REASON], range: ['მონიშნული მონაკვეთი', RANGE_REASON], project: [PROJ, null] };
  R.a = { ax: a, counts: await counts(p, [...fmtNames, 'მონიშნული მონაკვეთი', PROJ]), fails: check(a, expA), projAttrs: a.attrs.project };
  R.layout = await layout(p);
  await p.screenshot({ path: `${X.SHOTS}/ax-a-${R.vp}.png` });
  await p.locator('[role=dialog] fieldset').first().screenshot({ path: `${X.SHOTS}/ax-a-format-${R.vp}.png` });
  // AX-SELECT (1440)
  if (W === 1440) {
    const st = async () => ({ checked: await p.evaluate(() => document.querySelector('input[name="arrangement-export-format"]:checked')?.dataset.testid), btn: (await X.exportBtnBox(p)).text });
    const sel = {};
    await p.locator('#' + (a.attrs.mp3.lb).replace(/:/g, '\\:')).click(); await sleep(200); sel.mp3Name = await st();
    await p.locator('#' + (a.attrs.both.db).replace(/:/g, '\\:')).click(); await sleep(200); sel.bothNote = await st();
    await p.locator('#' + (a.attrs.wav.lb).replace(/:/g, '\\:')).click(); await sleep(200); sel.wavName = await st();
    sel.pass = sel.mp3Name.checked === 'arrangement-export-format-mp3' && sel.mp3Name.btn === 'MP3-ის ექსპორტი' && sel.bothNote.checked === 'arrangement-export-format-both' && sel.bothNote.btn === 'WAV + MP3 ექსპორტი' && sel.wavName.checked === 'arrangement-export-format-wav' && sel.wavName.btn === 'WAV-ის ექსპორტი';
    R.select = sel;
  }
  // (b) range 4-9, no loop
  await X.closeDlg(p); R.readout = await X.rangeDrag(p, 'music', 4, 9); await X.openDlg(p);
  const rangeName = 'მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)';
  const bx = await ax(p, cdp);
  R.b = { ax: bx, loopTimes: await p.evaluate(() => document.querySelector('[data-testid=arrangement-loop-times]')?.textContent ?? null), counts: await counts(p, [...fmtNames, rangeName, PROJ]), fails: check(bx, { wav: [fmtNames[0], G.range], mp3: [fmtNames[1], MP3_NOTE], both: [fmtNames[2], BOTH_NOTE], video: [fmtNames[3], VIDEO_REASON], range: [rangeName, null], project: [PROJ, null] }) };
  if (bx.range && !bx.range.checked) R.b.fails.push('range not checked');
  if (bx.attrs.range.lb || bx.attrs.range.db) R.b.fails.push('range has attrs');
  await p.screenshot({ path: `${X.SHOTS}/ax-b-${R.vp}.png` });
  // (c) loop on via Ctrl+L
  await X.closeDlg(p); await blur(p); await p.keyboard.press('Control+l'); await sleep(500);
  const loopAfter = await p.evaluate(() => document.querySelector('[data-testid=arrangement-loop-times]')?.textContent ?? null);
  await X.openDlg(p);
  const c1 = await ax(p, cdp); const loopNote1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-loop-note]')?.textContent ?? null);
  await p.click(SEL.project); await sleep(250);
  const c2 = await ax(p, cdp); const loopNote2 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-loop-note]')?.textContent ?? null);
  R.c = { loopAfter, loopNote1, loopNote2, rangeAx: c1, projAx: c2, fails: [...check(c1, { wav: [fmtNames[0], G.rangeLoop], mp3: [fmtNames[1], MP3_NOTE], both: [fmtNames[2], BOTH_NOTE], video: [fmtNames[3], VIDEO_REASON], range: [rangeName, null], project: [PROJ, null] }).map((x) => 'c1 ' + x), ...check(c2, { wav: [fmtNames[0], G.projLoop], mp3: [fmtNames[1], MP3_NOTE], both: [fmtNames[2], BOTH_NOTE], video: [fmtNames[3], VIDEO_REASON], range: [rangeName, null], project: [PROJ, null] }).map((x) => 'c2 ' + x)] };
  if (!loopAfter) R.c.fails.push('loop not on');
  if (!(c2.project && c2.project.checked)) R.c.fails.push('project not checked');
  await p.screenshot({ path: `${X.SHOTS}/ax-c-${R.vp}.png` });
  R.errors = S.errors; R.noise = S.noise; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)];
  R.pass = R.a.fails.length === 0 && R.b.fails.length === 0 && R.c.fails.length === 0 && Object.values(R.a.counts).every((n) => n === 1) && Object.values(R.b.counts).every((n) => n === 1) && (!R.select || R.select.pass);
  X.save(`ax-${R.vp}.json`, R);
  console.log(JSON.stringify({ pass: R.pass, readout: R.readout, a: R.a.fails, aCounts: R.a.counts, b: R.b.fails, bCounts: R.b.counts, c: R.c.fails, loop: [loopAfter, loopNote1, loopNote2], select: R.select, layout: R.layout.map((l) => [l.tid, l.label.h, l.outer.h, l.name.h, l.nameRects, l.note.h, l.noteBelow, l.nameDisplay]), errors: R.errors, forbidden: R.forbidden, auth: R.auth, unpkg: R.unpkg.length, third: R.third }, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
