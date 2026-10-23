// NOTE-FORMAT per viewport (+ NOTE-NOSOUND at 1440). node note.cjs 1280|1440
const X = require('./ext.cjs'); const { sleep, blur } = X;
const W = +process.argv[2]; const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const CR = { wav: 'WAV შეიქმნება', mp3: 'MP3 შეიქმნება', both: 'WAV და MP3 შეიქმნება' };
const mute = (c, l) => `Master დადუმებულია (M) — ${c} ${l} სიგრძის სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.`;
const nos = (c, l) => `პროექტში ხმოვანი კლიპი არ არის — ${c} ${l} სიგრძის სიჩუმით.`;
const mtext = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-export-master-mute]')?.textContent ?? null);
const ntext = (p) => p.evaluate(() => [...document.querySelectorAll('[role=dialog] p[role=note]')].map((e) => e.textContent).find((t) => /ხმოვანი კლიპი არ არის/.test(t)) ?? null);
const checked = (p) => p.evaluate(() => document.querySelector('input[name="arrangement-export-format"]:checked')?.dataset.testid);
(async () => {
  const b = await X.launch(); const R = { vp: `${vp.width}x${vp.height}`, steps: [] };
  {
    const { ctx, page: p, S } = await X.newCtx(b, vp, `note${W}`);
    await X.setup(p, 0); await X.closeDlg(p); await blur(p);
    const mb = p.locator('button[aria-label="Master Mute"]'); await mb.click(); await sleep(300); await blur(p);
    R.mutePressed = await mb.getAttribute('aria-pressed');
    const proj = (await X.openDlg(p)).replace(/\s+/g, ' ').trim(); const END = /—\s*([\d:.]+)/.exec(proj)[1]; R.END = END;
    for (const f of ['wav', 'mp3', 'both', 'wav']) { await X.selectFormat(p, f); const t = await mtext(p); const e = mute(CR[f], END); R.steps.push({ scope: 'project', f, checked: await checked(p), t, pass: t === e }); await p.locator('[data-testid=arrangement-export-master-mute]').screenshot({ path: `${X.SHOTS}/mute-${f}-${R.vp}-${R.steps.length}.png` }); }
    await X.selectFormat(p, 'both'); await X.closeDlg(p); await X.openDlg(p);
    { const t = await mtext(p); R.steps.push({ scope: 'reopen', checked: await checked(p), t, pass: t === mute(CR.wav, END) && (await checked(p)) === 'arrangement-export-format-wav' }); }
    await X.closeDlg(p); R.readout = await X.rangeDrag(p, 'music', 4, 9); await X.openDlg(p);
    await X.selectFormat(p, 'mp3'); { const sc = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-range]').checked); const t = await mtext(p); R.steps.push({ scope: 'range', rangeChecked: sc, f: 'mp3', t, pass: sc && t === mute(CR.mp3, '5.000 წმ') }); }
    await p.screenshot({ path: `${X.SHOTS}/mute-range-mp3-${R.vp}.png` });
    R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)];
    await ctx.close();
  }
  if (W === 1440) {
    const { ctx, page: p, S } = await X.newCtx(b, vp, `nosound${W}`); const N = { steps: [] };
    await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles('/home/runner/czaba-project/tmp/studio-real-loop/media/noaudio-2s-vp9.webm');
    await p.waitForSelector('[data-testid=arrangement-video]', { timeout: 30000 }); await sleep(4000);
    N.clips = await p.$$eval('[data-clip-id]', (els) => els.map((e) => e.closest('[data-track-id]')?.getAttribute('data-track-id')));
    const proj = (await X.openDlg(p)).replace(/\s+/g, ' ').trim(); const END = /—\s*([\d:.]+)/.exec(proj)[1]; N.END = END; N.proj = proj;
    N.videoSound = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-video-sound]')?.textContent ?? null);
    for (const f of ['wav', 'mp3', 'both']) { await X.selectFormat(p, f); const t = await ntext(p); N.steps.push({ scope: 'project', f, t, pass: t === nos(CR[f], END) }); }
    await p.screenshot({ path: `${X.SHOTS}/nosound-project-${R.vp}.png` });
    await X.closeDlg(p); await blur(p);
    // range on the video clip 0.5-1.5
    await X.geo(p); const c = await p.evaluate(() => { const e = document.querySelector('[data-clip-id]'); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    N.clipBox = c;
    N.readout = await X.rangeDrag(p, N.clips[0] || 'video', 0.5, 1.5);
    await X.openDlg(p); await X.selectFormat(p, 'mp3');
    const sc = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-range]')?.checked);
    { const t = await ntext(p); N.steps.push({ scope: 'range', rangeChecked: sc, f: 'mp3', t, pass: !!sc && t === nos(CR.mp3, '1.000 წმ') }); }
    await p.screenshot({ path: `${X.SHOTS}/nosound-range-${R.vp}.png` });
    N.errors = S.errors; N.forbidden = S.forbidden; N.auth = S.authHeaders; N.unpkg = S.unpkg; N.third = [...new Set(S.thirdParty)];
    R.nosound = N; await ctx.close();
  }
  R.pass = R.steps.every((s) => s.pass) && R.mutePressed === 'true';
  X.save(`note-${R.vp}.json`, R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
