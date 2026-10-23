// C round 96: node r96.cjs <1280|1440> <fail|both|loading|normal>
// Fresh incognito Playwright Chromium context, no credentials. Real mouse/keyboard input.
// An init script taps every AudioNode connected to the destination with an AnalyserNode (measurement only).
const X = require('./ext.cjs'); const { sleep } = X;
const W = +process.argv[2]; const SC = process.argv[3];
const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const LOADING = 'დემო კოლექცია იტვირთება…';
const FAILEDN = (n) => `დემო კოლექციიდან ${n} წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`;
const F = (t) => `„${t}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`;
const NOTYET = (t) => `„${t}“ ჯერ არ ჩატვირთულა.`;
const ME = 'Middle East — საჯარო preview'; const HERO = 'CZABA hero — საჯარო preview';
const NET = 'შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)';
const AUD = /\.(mp3|wav|ogg|flac|m4a)(\?|$)/;
const DUR = /\d{2}:\d{2}\.\d{3}/;
const TAP = () => {
  const orig = AudioNode.prototype.connect; window.__taps = [];
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode) { const c = dest.context; if (!c.__tap) { c.__tap = c.createAnalyser(); c.__tap.fftSize = 2048; window.__taps.push(c.__tap); } orig.call(this, c.__tap); } } catch (e) { /* measurement only */ }
    return r;
  };
};
const rms = (p) => p.evaluate(async () => { let best = 0; for (let k = 0; k < 6; k++) { for (const a of window.__taps || []) { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const v of d) s += v * v; best = Math.max(best, Math.sqrt(s / d.length)); } await new Promise((r) => setTimeout(r, 50)); } return +best.toFixed(5); });
(async () => {
  const R = { vp: `${vp.width}x${vp.height}`, scenario: SC, audio: {}, hyd: [], routed: [], checks: {} };
  global.__R = R;
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, vp, `${SC}${W}`);
  await ctx.addInitScript(TAP);
  p.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) R.hyd.push(m.text().slice(0, 200)); });
  p.on('request', (q) => { const u = q.url(); if (AUD.test(u)) { const k = u.replace(X.BASE, ''); R.audio[k] = (R.audio[k] || 0) + 1; } });
  const me = /\/middle-east\.mp3(\?|$)/, hero = /\/videos\/hero\/hero-music\.mp3(\?|$)/;
  let releaseMe = null;
  if (SC !== 'normal') {
    await p.route(AUD, async (rt) => {
      const u = rt.request().url();
      const hit = me.test(u) || (SC === 'both' && hero.test(u));
      if (!hit) return rt.continue();
      R.routed.push(u.replace(X.BASE, ''));
      if (SC === 'loading') { await new Promise((r) => { releaseMe = r; }); return rt.continue(); }
      return rt.abort();
    });
  }
  const clips = () => p.$$eval('[data-clip-id]', (e) => e.map((x) => x.closest('[data-track-id]')?.getAttribute('data-track-id')));
  const row = (id) => p.locator(`[role=option][data-source-id="${id}"]`);
  const rowText = (id) => row(id).innerText().then((t) => t.replace(/\s+/g, ' ').trim());
  const previewing = () => p.$$eval('[role=option][data-source-id]', (os) => os.filter((o) => o.innerText.includes('▶ ისმის')).map((o) => o.dataset.sourceId));
  const toggle = () => p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-library-preview-toggle]'); return t ? { text: t.textContent.trim(), disabled: t.disabled } : null; });
  const addBtn = () => p.evaluate(() => { const b = [...document.querySelectorAll('[data-testid=arrangement-library-preview] button')].find((x) => /დამატება/.test(x.textContent)); return b ? { text: b.textContent.trim(), disabled: b.disabled } : null; });
  async function selectRow(id) { const o = row(id); await o.scrollIntoViewIfNeeded(); await o.click(); await sleep(350); return o.getAttribute('aria-selected'); }
  async function enterOn(id) { await selectRow(id); await p.keyboard.press('Enter'); await sleep(900); return { status: await X.status(p), clips: await clips() }; }
  async function startPreview(id) {
    await selectRow(id); const t = p.locator('[data-testid=arrangement-library-preview-toggle]'); await t.click(); await sleep(1200);
    return { previewing: await previewing(), toggle: await toggle(), rms: await rms(p) };
  }

  await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  if (SC === 'loading') {
    // LOADING-REG: press Enter while the row still shows loading
    const t0 = Date.now(); let rt = '';
    while (Date.now() - t0 < 60000) { rt = await rowText('demo-middle-east').catch(() => ''); if (/იტვირთება/.test(rt) && releaseMe) break; await sleep(100); }
    await X.decline(p);
    R.rowWhileLoading = await rowText('demo-middle-east');
    const c0 = await clips();
    const e1 = await enterOn('demo-middle-east');
    R.loading = { before: c0, ...e1, rowAtEnter: await rowText('demo-middle-east'), releasedYet: false, msSinceNav: Date.now() - t0 };
    await p.screenshot({ path: `${X.SHOTS}/loading-refused-${R.vp}.png` });
    R.checks.loadingText = e1.status === NOTYET(ME);
    R.checks.loadingNoClip = c0.length === 0 && e1.clips.length === 0;
    R.checks.rowWasLoading = /იტვირთება/.test(R.loading.rowAtEnter);
    // keep pending >= 5 s from interception
    await sleep(Math.max(0, 6000 - (Date.now() - t0)));
    R.loading.heldMs = Date.now() - t0; releaseMe();
    R.status = await X.waitStatus(p, (s) => s === X.READY, 120000);
    R.rowAfter = await rowText('demo-middle-east');
    const e2 = await enterOn('demo-middle-east');
    R.loading.afterLoad = e2;
    await p.screenshot({ path: `${X.SHOTS}/loading-added-${R.vp}.png` });
    R.checks.readyAfterRelease = R.status === X.READY && DUR.test(R.rowAfter);
    R.checks.addAfterLoad = e2.clips.length === 1 && e2.clips[0] === 'music' && e2.status !== NOTYET(ME) && !/ვერ ჩაიტვირთა/.test(e2.status || '');
  } else {
    R.status = await X.waitStatus(p, (s) => s !== LOADING && s != null, 120000);
    await sleep(2000); R.statusAfter = await X.status(p);
    await X.decline(p);
    R.rows = await p.$$eval('[role=option][data-source-id]', (os) => os.map((o) => ({ id: o.dataset.sourceId, drag: o.getAttribute('draggable'), t: o.innerText.replace(/\s+/g, ' ').trim() })));
    const failedIds = SC === 'both' ? ['demo-middle-east', 'demo-hero-music'] : SC === 'fail' ? ['demo-middle-east'] : [];
    const others = R.rows.filter((r) => !failedIds.includes(r.id));
    R.checks.nineRows = R.rows.length === 9;
    R.checks.othersDuration = others.every((r) => DUR.test(r.t) && !/შეცდომა/.test(r.t));
    R.checks.failedRows = failedIds.every((id) => (R.rows.find((r) => r.id === id) || { t: '' }).t.includes(NET));
    R.checks.collectionStatus = SC === 'normal' ? R.status === X.READY && R.statusAfter === X.READY : R.status === FAILEDN(failedIds.length) && R.statusAfter === FAILEDN(failedIds.length);
    if (SC === 'fail') {
      // FAIL-ADD
      const c0 = await clips(); const a = await enterOn('demo-middle-east');
      R.failAdd = { before: c0, ...a, row: await rowText('demo-middle-east'), addBtn: await addBtn(), toggle: await toggle() };
      await p.screenshot({ path: `${X.SHOTS}/fail-add-${R.vp}.png` });
      R.checks.failAddText = a.status === F(ME);
      R.checks.failAddNoNotYet = !/ჯერ არ ჩატვირთულა/.test(a.status || '');
      R.checks.failAddNoClip = c0.length === 0 && a.clips.length === 0;
      R.checks.failAddRowKeepsError = R.failAdd.row.includes(NET);
      // add a hero clip so the status changes to a different text before the preview check
      const h = await enterOn('demo-hero-music'); R.heroAdd = h;
      // FAIL-PREVIEW: preview hero (ready), refocus its row, ArrowUp to ME
      const pv = await startPreview('demo-hero-music'); R.failPreview = { started: pv, statusBefore: await X.status(p) };
      await selectRow('demo-hero-music');
      R.failPreview.stillPreviewingAfterRefocus = await previewing();
      const cBefore = await clips();
      await p.keyboard.press('ArrowUp'); await sleep(900);
      R.failPreview.selected = await p.$$eval('[role=option][aria-selected=true]', (os) => os.map((o) => o.dataset.sourceId));
      R.failPreview.focused = await p.evaluate(() => document.activeElement?.dataset?.sourceId ?? null);
      R.failPreview.status = await X.status(p); R.failPreview.previewing = await previewing(); R.failPreview.toggle = await toggle();
      await sleep(400); R.failPreview.rmsAfter = await rms(p); R.failPreview.clips = await clips();
      await p.screenshot({ path: `${X.SHOTS}/fail-preview-${R.vp}.png` });
      R.checks.previewStarted = pv.previewing.includes('demo-hero-music') && pv.toggle && pv.toggle.text === '■ შეჩერება' && pv.rms > 0.001;
      R.checks.previewStatusBeforeDiffers = R.failPreview.statusBefore !== F(ME);
      R.checks.previewMovedToMe = R.failPreview.selected.length === 1 && R.failPreview.selected[0] === 'demo-middle-east';
      R.checks.previewStopped = R.failPreview.previewing.length === 0 && R.failPreview.rmsAfter < 0.0005;
      R.checks.previewToggleDisabled = !!R.failPreview.toggle && R.failPreview.toggle.disabled === true;
      R.checks.previewText = R.failPreview.status === F(ME);
      R.checks.previewNoClipChange = cBefore.length === R.failPreview.clips.length;
      if (W === 1280) {
        // FAIL-DBL: change the status first with a ready add, then double-click ME
        const h2 = await enterOn('demo-hero-music'); const c1 = await clips();
        const o = row('demo-middle-east'); await o.scrollIntoViewIfNeeded(); await o.dblclick(); await sleep(900);
        R.failDbl = { statusBefore: h2.status, before: c1.length, status: await X.status(p), after: (await clips()).length };
        await p.screenshot({ path: `${X.SHOTS}/fail-dbl-${R.vp}.png` });
        R.checks.dblStatusBeforeDiffers = h2.status !== F(ME);
        R.checks.dblText = R.failDbl.status === F(ME);
        R.checks.dblNoClip = R.failDbl.before === R.failDbl.after;
      }
    }
    if (SC === 'both') {
      const c0 = await clips();
      const a = await enterOn('demo-middle-east'); const h = await enterOn('demo-hero-music');
      // and back to ME by double-click to check it switches the text back
      R.failBoth = { before: c0.length, me: a, hero: h };
      await p.screenshot({ path: `${X.SHOTS}/fail-both-${R.vp}.png` });
      R.checks.bothMe = a.status === F(ME); R.checks.bothHero = h.status === F(HERO);
      R.checks.bothNoClip = c0.length === 0 && a.clips.length === 0 && h.clips.length === 0;
    }
    if (SC === 'normal') {
      const c0 = await clips(); const a = await enterOn('demo-middle-east');
      R.readyAdd = { before: c0, ...a };
      R.checks.readyAdd = c0.length === 0 && a.clips.length === 1 && a.clips[0] === 'music' && /დაემატა/.test(a.status || '');
      const pv = await startPreview('demo-synth-mix'); R.readyPreview = pv;
      await p.screenshot({ path: `${X.SHOTS}/ready-${R.vp}.png` });
      R.checks.readyPreview = pv.previewing.includes('demo-synth-mix') && pv.toggle?.text === '■ შეჩერება' && pv.rms > 0.001;
      await p.locator('[data-testid=arrangement-library-preview-toggle]').click(); await sleep(600);
      R.readyPreview.stopped = { previewing: await previewing(), rms: await rms(p) };
    }
  }
  R.checks.audioOnce = Object.values(R.audio).every((n) => n === 1);
  R.checks.noHyd = R.hyd.length === 0; R.checks.noErrors = S.errors.length === 0;
  R.checks.net = S.forbidden.length === 0 && S.authHeaders.length === 0;
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.third = [...new Set(S.thirdParty)]; R.noise = S.noise;
  R.pass = Object.values(R.checks).every(Boolean);
  X.save(`${SC}-${R.vp}.json`, R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); try { console.error(JSON.stringify(global.__R, null, 1).slice(0, 3000)); } catch {} process.exit(1); });
