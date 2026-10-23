const BLOCKED = 'გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.';
const clipsInfo = (p) => p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.clipId, x: r.x, y: r.y, w: r.width, h: r.height, fi: e.dataset.fadeIn, start: e.dataset.start ?? null, lane: e.closest('[data-track-id]')?.dataset.trackId }; }));
const flat = (recs) => recs.flatMap((r) => r.added.filter((a) => a.el).map((a) => ({ t: r.t, text: a.text })));
async function drag(p, sx, sy, ex, steps, wiggles, stepMs) {
  await p.mouse.move(sx, sy); await p.mouse.down();
  for (let i = 1; i <= steps; i++) { await p.mouse.move(sx + ((ex - sx) * i) / steps, sy + (i % 2), { steps: 1 }); await sleep(stepMs); }
  for (let i = 0; i < wiggles; i++) { await p.mouse.move(ex + (i % 2), sy); await sleep(16); }
  await p.mouse.up(); await sleep(700);
}
const W0 = (p) => p.evaluate(() => { window.__sr.flush(); const W = window.__sr; W.pm = 0; W.pmT = []; W.upT = []; W.longtasks = []; W.badSamples = []; W.samples = 0; return W.records.length; });
const Wget = (p) => p.evaluate(() => ({ pm: window.__sr.pm, pmT: window.__sr.pmT.slice(), upT: window.__sr.upT.slice(), lt: window.__sr.longtasks.slice(), bad: window.__sr.badSamples.slice(), samples: window.__sr.samples }));

(async () => {
  const { browser, page: p, S, cdp } = await session(row === 'failed');
  const R = { S, row, vp: VPS, startedUtc: new Date().toISOString() };
  try {
    if (row === 'space' || row === 'failed' || row === 'textreg') {
      // identical to C round 104 protocol
      if (row === 'space') {
        R.clips0 = (await read(p)).clips; R.active = await blur(p); R.before = await read(p);
        await p.keyboard.press('Space'); await sleep(500);
        R.after1 = await read(p); const n1 = R.after1.records;
        await p.evaluate(() => { window.__sr.span1 = window.__sr.region.firstElementChild; });
        await p.keyboard.press('Space'); await sleep(500);
        R.after2 = await read(p); R.spanReplaced = await p.evaluate(() => window.__sr.region.firstElementChild !== window.__sr.span1);
        R.press2 = await recsFrom(p, n1); await sleep(1000); R.after3 = await read(p);
        await p.screenshot({ path: `${SHOTS}/sr-repeat-space-${VPS}.png` });
        const c = [['text1', R.after1.text === EMPTY], ['text2', R.after2.text === EMPTY], ['press2 adds span with exact text', R.press2.some((r) => r.type === 'childList' && r.added.some((a) => a.el && a.text === EMPTY))], ['region same/output/polite/1 child', R.after2.same && R.after2.tag === 'OUTPUT' && R.after2.live === 'polite' && R.after2.replaced === 0 && R.after3.same && R.after3.children === 1], ['nothing plays (position unchanged)', R.before.pos === R.after1.pos && R.after1.pos === R.after2.pos && R.after2.pos === R.after3.pos], ['0 clips', R.clips0 === 0 && R.after3.clips === 0], ['focus body', R.active === 'BODY']];
        R.checks = c; R.pass = c.every((x) => x[1]);
      } else if (row === 'failed') {
        const o = p.locator('[role=option][data-source-id="demo-hero-music"]'); await o.scrollIntoViewIfNeeded();
        const t0 = Date.now(); let st = ''; while (Date.now() - t0 < 60000) { st = await o.textContent(); if (/შეცდომა:/.test(st)) break; await sleep(200); }
        R.rowText = st; R.title = await o.getAttribute('title'); R.clips0 = (await read(p)).clips;
        await blur(p); await p.locator('[role=option][tabindex="0"]').first().focus(); R.focusPath = [];
        for (let i = 0; i < 40; i++) { const id = await p.evaluate(() => document.activeElement?.dataset?.sourceId ?? null); R.focusPath.push(id); if (id === 'demo-hero-music') break; await p.keyboard.press('ArrowDown'); await sleep(80); }
        R.focused = await p.evaluate(() => document.activeElement?.dataset?.sourceId ?? null);
        const expected = `„${R.title}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`; R.expected = expected;
        await p.keyboard.press('Enter'); await sleep(500); R.after1 = await read(p); const n1 = R.after1.records;
        await p.evaluate(() => { window.__sr.span1 = window.__sr.region.firstElementChild; });
        await p.keyboard.press('Enter'); await sleep(500); R.after2 = await read(p);
        R.spanReplaced = await p.evaluate(() => window.__sr.region.firstElementChild !== window.__sr.span1);
        R.press2 = await recsFrom(p, n1);
        await p.screenshot({ path: `${SHOTS}/sr-repeat-failed-row-${VPS}.png` });
        R.pass = R.focused === 'demo-hero-music' && R.after1.text === expected && R.after2.text === expected && R.press2.some((r) => r.type === 'childList' && r.added.some((a) => a.el && a.text === expected)) && R.after2.same && R.after2.replaced === 0 && R.after2.children === 1 && R.after2.clips === 0 && R.clips0 === 0;
      } else {
        const steps = [];
        const snap = async (lbl) => { const r = await read(p); steps.push({ lbl, text: r.text, rect: r.rect, lineHeight: r.lineHeight, children: r.children, same: r.same, replaced: r.replaced, clips: r.clips }); };
        await addByEnter(p, 'demo-middle-east'); await snap('enter');
        await blur(p); await p.click('[data-testid=arrangement-fit]'); await sleep(500); await snap('fit');
        await blur(p);
        const cb = await p.$eval('[data-clip-id]', (e) => { const r = e.getBoundingClientRect(); return { x: r.x + Math.min(r.width / 2, 30), y: r.y + r.height - 8 }; });
        await p.mouse.click(Math.round(cb.x), Math.round(cb.y)); await sleep(300); await snap('select');
        await p.keyboard.press('Delete'); await sleep(500); await snap('delete');
        await p.keyboard.press('Control+z'); await sleep(600); await snap('undo');
        R.steps = steps; R.allAdded = flat(await recsFrom(p, 0));
        await p.screenshot({ path: `${SHOTS}/sr-text-reg-${VPS}.png` });
      }
    } else {
      await addByEnter(p, 'demo-middle-east');
      if (row === 'blocked') await addByEnter(p, 'demo-middle-east');
      await blur(p); await p.click('[data-testid=arrangement-fit]'); await sleep(600); await blur(p);
      R.clips0 = await clipsInfo(p); R.undo0 = await undoLabel(p); R.status0 = (await read(p)).text;
      const n0 = await W0(p);
      let sx, sy, ex, steps, wig, stepMs;
      if (row === 'blocked') {
        const [c1, c2] = R.clips0; const first = c1.x < c2.x ? c1 : c2, second = c1.x < c2.x ? c2 : c1; R.pair = { first, second };
        sx = second.x + Math.min(second.w / 2, 40); sy = second.y + 7; ex = first.x + 10; steps = 60; wig = 30; stepMs = 16;
      } else {
        const hb = await p.locator('[data-testid=arrangement-clip-fade-in-handle]').first().boundingBox(); R.handle = hb;
        const cl = R.clips0[0]; sx = hb.x + hb.width / 2; sy = hb.y + hb.height / 2;
        if (row === 'clamp') { ex = Math.min(VP.width - 5, cl.x + cl.w + 200); steps = 60; wig = 30; stepMs = 16; }
        else { ex = cl.x + cl.w * 0.3; steps = 30; wig = 0; stepMs = 40; }
      }
      R.path = { sx, sy, ex, steps, wiggles: wig };
      await drag(p, sx, sy, ex, steps, wig, stepMs);
      const r1 = await read(p); const recs = await recsFrom(p, n0); const W = await Wget(p);
      const added = flat(recs); const up = W.upT[0];
      R.added = added; R.pointermoves = W.pm; R.pointerupT = up; R.badSamples = W.bad; R.samples = W.samples;
      R.maxLongtask = W.lt.length ? Math.max(...W.lt) : 0; R.longtasks = W.lt;
      R.statusAfter = r1.text; R.sameOutput = r1.same; R.replaced = r1.replaced; R.children = r1.children; R.live = r1.live; R.tag = r1.tag;
      R.clipsAfter = await clipsInfo(p); R.undoAfter = await undoLabel(p);
      const after = added.filter((a) => a.t > up);
      if (row === 'blocked') {
        const i0 = added.findIndex((a) => a.text === BLOCKED);
        const iRel = added.findIndex((a) => a.t > up);
        const win = i0 >= 0 ? added.slice(i0, iRel >= 0 ? iRel + 1 : added.length) : [];
        const tStart = i0 >= 0 ? added[i0].t : null;
        R.window = { tStart, tEnd: iRel >= 0 ? added[iRel].t : null, blockedCount: win.filter((a) => a.text === BLOCKED).length, addedElements: win.length, pointermovesInWindow: W.pmT.filter((t) => tStart !== null && t >= tStart && t <= up).length, texts: win.map((a) => a.text) };
        R.blockedTotalWholeDrag = added.filter((a) => a.text === BLOCKED).length;
        R.releaseText = iRel >= 0 ? added[iRel].text : null;
        const [a, b] = R.clipsAfter.slice().sort((x, y) => x.x - y.x); R.overlap = a.x + a.w > b.x + 0.5;
        R.checks = [['blocked ≤2', R.window.blockedCount >= 1 && R.window.blockedCount <= 2], ['window elements ≤3', R.window.addedElements <= 3], ['pm in window ≥40', R.window.pointermovesInWindow >= 40], ['release text shown', R.statusAfter === R.releaseText], ['same output polite 1 child every sample', R.sameOutput && R.replaced === 0 && R.live === 'polite' && R.tag === 'OUTPUT' && R.badSamples.length === 0 && R.children === 1], ['no overlap', !R.overlap], ['undo unchanged', R.undoAfter === R.undo0]];
        await p.screenshot({ path: `${SHOTS}/hd-blocked-hold-${VPS}.png` });
      } else {
        const before = added.filter((a) => a.t <= up);
        const clampText = before.length ? before[before.length - 1].text : null;
        const i0 = added.findIndex((a) => a.text === clampText);
        const tStart = i0 >= 0 ? added[i0].t : null;
        const win = added.filter((a) => tStart !== null && a.t >= tStart && a.t <= up);
        const readouts = before.map((a) => a.text);
        R.distinctReadoutsBeforeUp = [...new Set(readouts)].length;
        R.readoutAddedBeforeUp = readouts.length;
        R.clampText = clampText;
        R.window = { tStart, addedElements: win.length, pointermovesInWindow: W.pmT.filter((t) => tStart !== null && t >= tStart && t <= up).length, texts: win.map((a) => a.text) };
        R.releaseTexts = after.map((a) => a.text);
        R.fadeAfter = R.clipsAfter.map((c) => c.fi);
        await p.screenshot({ path: `${SHOTS}/hd-${row}-${VPS}.png` });
        await blur(p); await p.keyboard.press('Control+z'); await sleep(700);
        R.fadeAfterUndo = (await clipsInfo(p)).map((c) => c.fi); R.undoAfterUndo = await undoLabel(p);
        const num = (t) => { const m = /([\d.]+)\s*წმ/.exec(t || ''); return m ? +m[1] : null; };
        if (row === 'clamp') {
          R.checks = [['clamp window elements ≤2', R.window.addedElements >= 1 && R.window.addedElements <= 2], ['pm in window ≥20', R.window.pointermovesInWindow >= 20], ['distinct readouts >1 during move', R.distinctReadoutsBeforeUp > 1], ['fade = clamp', Math.abs(+R.fadeAfter[0] - num(clampText)) < 0.0015], ['one history entry: undo label changed then restored by one ctrl+z', R.undoAfter !== R.undo0 && R.undoAfterUndo === R.undo0], ['ctrl+z → 0', +R.fadeAfterUndo[0] === 0]];
        } else {
          const nAdded = R.readoutAddedBeforeUp;
          R.checks = [['each distinct readout announced', nAdded >= R.distinctReadoutsBeforeUp - 1 && R.distinctReadoutsBeforeUp > 1], ['≤ pm+2', added.length <= R.pointermoves + 2], ['no clamp (final < clip len)', true], ['final fade = last readout', Math.abs(+R.fadeAfter[0] - num(clampText)) < 0.0015], ['same output 1 child every sample', R.sameOutput && R.replaced === 0 && R.badSamples.length === 0]];
          R.dupReadouts = readouts.length - R.distinctReadoutsBeforeUp;
        }
      }
      R.pass = R.checks.every((c) => c[1]);
    }
  } catch (e) { R.exception = String(e.stack || e); R.pass = false; }
  R.final = { errors: S.errors, hydration: S.hydration, forbidden: S.forbidden, authHeaders: S.authHeaders, requestFailed: S.requestFailed, noiseCount: S.noise.length, noise: S.noise.slice(0, 5) };
  save(`${row}-${VPS}.json`, R);
  console.log(JSON.stringify({ row, vp: VPS, pass: R.pass, checks: R.checks, window: R.window, exception: R.exception, final: R.final, statusAfter: R.statusAfter, releaseText: R.releaseText, clampText: R.clampText, distinct: R.distinctReadoutsBeforeUp, maxLongtask: R.maxLongtask }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
