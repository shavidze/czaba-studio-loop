// NOTE-BOTH: label text, HR-VISIBLE note, footer visible; then WAV + MP3 export
const X = require('./lib91.cjs');
const vpArg = process.argv[2] || '1280x720'; const [w, h] = vpArg.split('x').map(Number);
const NOTE = 'იგივე მიქსი ორ ფაილად — ან ორივე შეიქმნება, ან არცერთი. ბრაუზერმა მეორე ფაილის ჩამოტვირთვაზე შეიძლება ნებართვა მოითხოვოს.';
const LABEL = 'WAV + MP3 · ორი ფაილი';
const DONE = 'WAV და MP3 შეიქმნა: 05:04.406, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.';
(async () => {
  const b = await X.launch(); const { ctx, page, S } = await X.newCtx(b, { width: w, height: h }, `note-${vpArg}`);
  const R = { vp: vpArg }; R.scope = await X.setup(page, 2);
  R.unpkgBeforeClick = S.unpkg.length;
  R.idle = await page.evaluate(([NOTE, LABEL]) => {
    const inp = document.querySelector('[data-testid=arrangement-export-format-both]'); const lab = inp.closest('label');
    const spans = [...lab.querySelectorAll('span')]; const note = spans.find((s) => s.textContent.includes('ორ ფაილად'));
    note.scrollIntoView({ block: 'center' });
    const r = note.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const f = document.querySelector('[data-testid=arrangement-export-footer]'); const fr = f.getBoundingClientRect();
    const btns = [...f.querySelectorAll('button')].map((b) => { const q = b.getBoundingClientRect(); const c = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { t: b.textContent.trim(), vis: q.bottom <= innerHeight && q.top >= 0 && (c === b || b.contains(c)) }; });
    const st = f.querySelector('[role=status]'); const sr = st && st.getBoundingClientRect();
    return { labelText: lab.textContent, exact: lab.textContent === LABEL + NOTE, noteText: note.textContent, noteExact: note.textContent === NOTE, noteClass: note.className,
      rect: { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width }, vw: innerWidth, vh: innerHeight, hitOk: !!hit && (hit === note || note.contains(hit)), hit: hit && hit.tagName,
      clippedH: r.left < 0 || r.right > innerWidth, scrollW: note.scrollWidth, clientW: note.clientWidth, footer: { t: fr.top, b: fr.bottom }, footerBtns: btns, status: st && st.textContent, statusVis: !!sr && sr.bottom <= innerHeight && sr.height > 0 };
  }, [NOTE, LABEL]);
  await page.screenshot({ path: `${X.SHOTS}/note-${vpArg}.png` });
  await X.selectFormat(page, 'both');
  R.unpkgAfterRadio = S.unpkg.length;
  const r = await X.exportFull(page);
  R.both = { status: r.final.status, exact: r.final.status === DONE, alert: r.final.alert, files: r.files.map((f) => [f.name, f.size]), unpkg: r.unpkgDuring, wav: [], mp3: [] };
  for (const f of r.files) { if (!f.file) continue; if (/\.wav$/.test(f.name)) R.both.wav.push(X.wavInfo(f.file)); if (/\.mp3$/.test(f.name)) R.both.mp3.push(await X.mp3Decode(page, f.file)); }
  await page.screenshot({ path: `${X.SHOTS}/note-both-done-${vpArg}.png` });
  R.workers = S.workers; R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)];
  X.save(`note-${vpArg}.json`, R); console.log(JSON.stringify(R, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
