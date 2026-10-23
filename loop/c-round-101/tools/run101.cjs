// C round 101: STRIP-1280/1440, VIS-RENDER-REG, VALUETEXT (wav+mp3), FOCUS-REG, CLOSE-HOLD-REG, SPACE-TOGGLE-OBS, EXPORT-REG, PX-NET, REG-HYD
// Usage: node run101.cjs <scenario> ; scenarios: strip1280 strip1440 mp3 focus closehold space
const L = require('./lib101.cjs');
const { sleep } = L;
const path = require('path');
const fs = require('fs');

const VPS = { 1280: { width: 1280, height: 720 }, 1440: { width: 1440, height: 900 } };

async function ready(p) {
  await p.goto(L.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  await sleep(1500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
  await o.waitFor({ timeout: 90000 });
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const draggable = await o.getAttribute('draggable');
  return { o, draggable };
}
async function addOneClip(p, o) {
  const c0 = await p.$$eval('[data-clip-id]', (e) => e.length);
  await o.focus(); await p.keyboard.press('Enter'); await sleep(700);
  const c1 = await p.$$eval('[data-clip-id]', (e) => e.length);
  return { before: c0, after: c1 };
}
async function openExport(p) {
  await L.blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title'); await sleep(600);
}
const measure = () => {
  const footer = document.querySelector('[data-testid=arrangement-export-footer]');
  let panel = footer.parentElement;
  while (panel && getComputedStyle(panel).overflowY !== 'auto') panel = panel.parentElement;
  const body = footer.parentElement;
  const cs = getComputedStyle(panel);
  const pr = panel.getBoundingClientRect();
  const innerBottom = pr.bottom - parseFloat(cs.borderBottomWidth);
  const fr = footer.getBoundingClientRect();
  const y = innerBottom - 4;
  const name = (h) => !h ? null : footer.contains(h) ? 'footer-descendant' : h === body ? 'ModalBody' : h === panel ? 'panel' : `${h.tagName}.${h.getAttribute('data-testid') || h.className.toString().slice(0, 40)}`;
  const xs = [pr.left + 12, pr.left + pr.width / 2, pr.right - 12].map(Math.round);
  return {
    scrollTop: panel.scrollTop, scrollHeight: panel.scrollHeight, clientHeight: panel.clientHeight,
    maxScroll: panel.scrollHeight - panel.clientHeight,
    panelTop: pr.top, panelBottom: pr.bottom, borderBottom: cs.borderBottomWidth, innerBottom,
    footerTop: fr.top, footerBottom: fr.bottom,
    gap: +(innerBottom - fr.bottom).toFixed(2),
    hitCentre: name(document.elementFromPoint(Math.round(pr.left + pr.width / 2), y)),
    hits3: xs.map((x) => ({ x, hit: name(document.elementFromPoint(x, y)) })),
    bodyClass: body.className, bodyPaddingBottom: getComputedStyle(body).paddingBottom,
    footerClass: footer.className, footerPadTop: getComputedStyle(footer).paddingTop, footerPadBottom: getComputedStyle(footer).paddingBottom,
  };
};
async function panelCentre(p) {
  return p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement; const r = pn.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 3, 150)) }; });
}
async function wheelToMax(p) {
  const c = await panelCentre(p);
  await p.mouse.move(c.x, c.y);
  const steps = [];
  let last = -1;
  for (let i = 0; i < 20; i++) {
    await p.mouse.wheel(0, 120); await sleep(250);
    const st = await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement; return pn.scrollTop; });
    steps.push(st);
    if (st === last) break;
    last = st;
  }
  return steps;
}
function sampler() {
  window.__s = [];
  const t0 = performance.now();
  const vis = (el, pr) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const inside = r.top >= pr.top - 0.5 && r.bottom <= pr.bottom + 0.5 && r.height > 0;
    const h = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    return inside && !!h && (el === h || el.contains(h));
  };
  const snap = () => {
    const f = document.querySelector('[data-testid=arrangement-export-footer]'); if (!f) return;
    let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement;
    const pr = pn.getBoundingClientRect();
    const bar = document.querySelector('[data-testid=arrangement-export-progress]');
    const lab = document.querySelector('[data-testid=arrangement-export-progress-label]');
    const st = f.querySelector('[role=status]');
    const cancel = document.querySelector('[data-testid=arrangement-export-cancel]');
    const s = {
      t: Math.round(performance.now() - t0), scrollTop: pn.scrollTop,
      label: lab ? lab.textContent : null,
      valuetext: bar ? bar.getAttribute('aria-valuetext') : null,
      hasValue: bar ? bar.hasAttribute('value') : null,
      ariaLive: bar ? bar.getAttribute('aria-live') : null, role: bar ? bar.getAttribute('role') : null,
      ariaLabel: bar ? bar.getAttribute('aria-label') : null,
      status: st ? st.textContent : null,
      vis: { status: vis(st, pr), label: vis(lab, pr), bar: vis(bar, pr), cancel: vis(cancel, pr) },
      bar: !!bar, cancel: !!cancel,
    };
    const l = window.__s.at(-1);
    if (!l || l.label !== s.label || l.valuetext !== s.valuetext || l.status !== s.status || l.hasValue !== s.hasValue || l.scrollTop !== s.scrollTop || l.cancel !== s.cancel || JSON.stringify(l.vis) !== JSON.stringify(s.vis)) window.__s.push(s);
  };
  const d = document.querySelector('[role=dialog]');
  new MutationObserver(snap).observe(d, { childList: true, subtree: true, characterData: true, attributes: true });
  snap();
}
async function runExport(p, timeout = 300000) {
  await p.evaluate(sampler);
  const S = p.S; const dl0 = S.downloads.length;
  const eb = await L.exportBtnBox(p);
  await p.mouse.click(eb.x, eb.y);
  const t0 = Date.now(); let pr;
  await sleep(300);
  while (Date.now() - t0 < timeout) { pr = await L.probe(p); if (!pr.cancel && pr.status && !/^რენდერი და|იტვირთება/.test(pr.status)) break; await sleep(100); }
  await sleep(2500);
  pr = await L.probe(p);
  const samples = await p.evaluate(() => window.__s);
  return { ms: Date.now() - t0, exportText: eb.text, final: pr, files: S.downloads.slice(dl0), samples };
}
function summariseSamples(samples) {
  const busy = samples.filter((s) => s.bar);
  const phases = {};
  for (const s of busy) { const ph = L.phaseOf(s.label); phases[ph] = (phases[ph] || 0) + 1; }
  return {
    total: samples.length, busy: busy.length, phases,
    valuetextMismatch: busy.filter((s) => s.valuetext !== s.label).length,
    ariaLiveSeen: busy.filter((s) => s.ariaLive !== null || s.role !== null).length,
    ariaLabelWrong: busy.filter((s) => s.ariaLabel !== 'ექსპორტის პროგრესი').length,
    notVisible: busy.filter((s) => !(s.vis.status && s.vis.label && s.vis.bar && s.vis.cancel)).length,
    loadSamples: busy.filter((s) => L.phaseOf(s.label) === 'load').map((s) => ({ hasValue: s.hasValue, valuetext: s.valuetext })),
    scrollTops: [...new Set(samples.map((s) => s.scrollTop))],
  };
}

async function main() {
  const sc = process.argv[2];
  const vpKey = sc === 'strip1440' ? 1440 : 1280;
  const browser = await L.launch();
  const { ctx, page: p, S } = await L.newCtx(browser, VPS[vpKey], `r101-${sc}`);
  const R = { scenario: sc, vp: S.vp, started: new Date().toISOString() };
  try {
    const rd = await ready(p); R.draggable = rd.draggable;
    R.clips = await addOneClip(p, rd.o);
    if (sc === 'strip1280' || sc === 'strip1440') {
      await openExport(p);
      R.idleTop = await p.evaluate(measure);
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-idle-top.png`) });
      R.idleWheelSteps = await wheelToMax(p);
      R.idleMax = await p.evaluate(measure);
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-idle-max.png`) });
      R.exp = await runExport(p);
      R.sampleSummary = summariseSamples(R.exp.samples);
      R.doneBeforeWheel = await p.evaluate(measure);
      R.doneWheelSteps = await wheelToMax(p);
      R.doneMax = await p.evaluate(measure);
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-done-max.png`) });
      R.wav = R.exp.files.filter((f) => f.file && /\.wav$/i.test(f.name)).map((f) => ({ name: f.name, size: f.size, ...L.wavInfo(f.file) }));
    } else if (sc === 'mp3') {
      await openExport(p);
      await L.selectFormat(p, 'mp3');
      R.exp = await runExport(p, 360000);
      R.sampleSummary = summariseSamples(R.exp.samples);
      R.mp3 = [];
      for (const f of R.exp.files) if (f.file && /\.mp3$/i.test(f.name)) { const head = fs.readFileSync(f.file).subarray(0, 3); R.mp3.push({ name: f.name, size: f.size, head: head.toString('hex'), decode: await L.mp3Decode(p, f.file) }); }
      await p.screenshot({ path: path.join(L.SHOTS, `mp3-done.png`) });
    } else if (sc === 'focus') {
      await openExport(p);
      const fp = () => p.evaluate(() => {
        const a = document.activeElement; const f = document.querySelector('[data-testid=arrangement-export-footer]');
        let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement;
        const d = document.querySelector('[role=dialog]'); const r = a.getBoundingClientRect(); const fr = f.getBoundingClientRect();
        return { el: a.getAttribute('aria-label') || a.dataset.testid || a.textContent.trim().slice(0, 30), tag: a.tagName, inDialog: d.contains(a), inFooter: f.contains(a), bottom: +r.bottom.toFixed(1), footerTop: +fr.top.toFixed(1), clearOfFooter: f.contains(a) || r.bottom <= fr.top + 0.5, scrollTop: pn.scrollTop };
      });
      R.steps = [{ key: 'initial', ...(await fp()) }];
      for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); await sleep(250); R.steps.push({ key: 'Tab', ...(await fp()) }); }
      await p.keyboard.press('Shift+Tab'); await sleep(250); R.steps.push({ key: 'Shift+Tab', ...(await fp()) });
      await p.screenshot({ path: path.join(L.SHOTS, `focus-end.png`) });
    } else if (sc === 'focusdone') {
      await openExport(p);
      R.exp = await runExport(p); R.exp.samples = R.exp.samples.length;
      const c = await panelCentre(p); await p.mouse.move(c.x, c.y);
      for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, -120); await sleep(200); }
      const fp = () => p.evaluate(() => {
        const a = document.activeElement; const f = document.querySelector('[data-testid=arrangement-export-footer]');
        let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement;
        const d = document.querySelector('[role=dialog]'); const r = a.getBoundingClientRect(); const fr = f.getBoundingClientRect();
        return { el: a.getAttribute('aria-label') || a.dataset.testid || a.textContent.trim().slice(0, 30), inDialog: d.contains(a), inFooter: f.contains(a), bottom: +r.bottom.toFixed(1), footerTop: +fr.top.toFixed(1), clearOfFooter: f.contains(a) || r.bottom <= fr.top + 0.5, scrollTop: pn.scrollTop };
      });
      R.steps = [{ key: 'afterDone+wheelTop', ...(await fp()) }];
      for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); await sleep(250); R.steps.push({ key: 'Tab', ...(await fp()) }); }
      await p.keyboard.press('Shift+Tab'); await sleep(250); R.steps.push({ key: 'Shift+Tab', ...(await fp()) });
      await p.screenshot({ path: path.join(L.SHOTS, `focusdone-end.png`) });
    } else if (sc === 'closehold') {
      await openExport(p);
      R.initialActive = await p.evaluate(() => document.activeElement.textContent.trim());
      await p.evaluate(() => {
        window.__ev = [];
        window.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd', r: e.repeat, a: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent.trim().slice(0, 20) }), true);
        document.addEventListener('keydown', (e) => setTimeout(() => {}, 0));
        window.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd-late', r: e.repeat, dp: e.defaultPrevented }));
        new MutationObserver(() => { const o = !!document.querySelector('#arrangement-export-title'); if (o !== window.__open) { window.__ev.push({ t: 'open', v: o, ms: Math.round(performance.now()) }); window.__open = o; } }).observe(document.body, { childList: true, subtree: true });
        window.__open = true;
      });
      await p.keyboard.down('Enter'); for (let i = 0; i < 3; i++) { await sleep(50); await p.keyboard.down('Enter'); } await p.keyboard.up('Enter');
      await sleep(1200);
      R.events = await p.evaluate(() => window.__ev);
      R.openAfter = await p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
      R.activeAfter = await p.evaluate(() => { const a = document.activeElement; return { text: a.textContent.trim(), aria: a.getAttribute('aria-label'), tag: a.tagName }; });
      await p.screenshot({ path: path.join(L.SHOTS, `closehold-after.png`) });
    } else if (sc === 'space') {
      await rd.o.click(); await sleep(300);
      await p.getByTestId('arrangement-library-preview-toggle').focus(); await sleep(200);
      R.active = await p.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      await p.evaluate(() => {
        window.__ev = [];
        window.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd', k: e.key, r: e.repeat }), true);
        window.addEventListener('click', (e) => window.__ev.push({ t: 'click', a: e.target?.closest?.('[data-testid]')?.getAttribute('data-testid') || e.target?.tagName }), true);
        const chk = () => {
          const b = document.querySelector('[data-testid=arrangement-library-preview-toggle]'); const txt = b ? b.textContent.trim() : null;
          if (txt !== window.__ll) { window.__ev.push({ t: 'label', v: txt, ms: Math.round(performance.now()) }); window.__ll = txt; }
          const pl = document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]'); const pv = pl ? pl.getAttribute('aria-label') : null;
          if (pv !== window.__lp) { window.__ev.push({ t: 'transport', v: pv, ms: Math.round(performance.now()) }); window.__lp = pv; }
        };
        chk(); new MutationObserver(chk).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
      });
      await p.keyboard.down(' '); for (let i = 0; i < 3; i++) { await sleep(50); await p.keyboard.down(' '); } await p.keyboard.up(' ');
      await sleep(1200);
      R.events = await p.evaluate(() => window.__ev);
      R.label = (await p.getByTestId('arrangement-library-preview-toggle').textContent()).trim();
      R.transport = await p.evaluate(() => document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]')?.getAttribute('aria-label'));
      R.playhead1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-time-readout],[data-testid*=time]')?.textContent ?? null);
      await sleep(600);
      R.playhead2 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-time-readout],[data-testid*=time]')?.textContent ?? null);
      await p.screenshot({ path: path.join(L.SHOTS, `space-hold.png`) });
      await p.keyboard.press(' '); await sleep(500);
      R.transportAfterStop = await p.evaluate(() => document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]')?.getAttribute('aria-label'));
      R.labelAfterStop = (await p.getByTestId('arrangement-library-preview-toggle').textContent()).trim();
    }
  } catch (e) { R.error = String(e && e.stack || e); }
  R.net = { forbidden: S.forbidden, authHeaders: S.authHeaders, thirdParty: [...new Set(S.thirdParty)], unpkg: S.unpkg.map((x) => x.f) };
  R.errors = S.errors; R.noise = S.noise; R.downloads = S.downloads.map((d) => ({ name: d.name, size: d.size }));
  R.ended = new Date().toISOString();
  L.save(`run101-${sc}.json`, R);
  console.log(JSON.stringify({ sc, error: R.error, errors: R.errors.length, downloads: R.downloads }, null, 0));
  await ctx.close(); await browser.close();
}
main();
