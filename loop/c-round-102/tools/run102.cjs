// C round 102: CARD-1280, CARD-IDLE-REG, AX-ONCE, VALUETEXT-REG, FOCUS-REG, STRIP-REG, EXPORT-REG, PX-NET, REG-HYD
// Usage: node run102.cjs <scenario>; scenarios: idle1280 done1280 idle1440 done1440 mp3
// Real Chromium, fresh incognito context per scenario, no credentials. Scroll only by mouse wheel; never set scrollTop.
const L = require('./lib102.cjs');
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
  return { o, draggable: await o.getAttribute('draggable') };
}
async function addOneClip(p, o) {
  const c0 = await p.$$eval('[data-clip-id]', (e) => e.length);
  await o.focus(); await p.keyboard.press('Enter'); await sleep(700);
  return { before: c0, after: await p.$$eval('[data-clip-id]', (e) => e.length) };
}
async function openExport(p) {
  await L.blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title'); await sleep(600);
}
// focus / card measurement (CARD-1280, CARD-IDLE-REG, FOCUS-REG)
const fm = () => {
  const a = document.activeElement; const f = document.querySelector('[data-testid=arrangement-export-footer]');
  let pn = f.parentElement; while (pn && getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement;
  const d = document.querySelector('[role=dialog]');
  const pr = pn.getBoundingClientRect(); const fr = f.getBoundingClientRect(); const r = a.getBoundingClientRect();
  const card = a.closest ? a.closest('label') : null; const cr = card ? card.getBoundingClientRect() : null;
  let hit = null;
  if (cr) { const h = document.elementFromPoint(Math.round(cr.left + cr.width / 2), Math.round(cr.bottom - 2)); hit = !h ? null : f.contains(h) ? 'FOOTER' : (h === card || card.contains(h)) ? 'card' : `${h.tagName}.${(h.getAttribute('data-testid') || h.className.toString()).slice(0, 40)}`; }
  return {
    el: a.dataset.testid || a.getAttribute('aria-label') || a.textContent.trim().slice(0, 30) || a.tagName, tag: a.tagName,
    inDialog: !!(d && d.contains(a)), inFooter: f.contains(a),
    scrollTop: pn.scrollTop, maxScroll: pn.scrollHeight - pn.clientHeight,
    panelTop: +pr.top.toFixed(1), footerTop: +fr.top.toFixed(1), footerH: +fr.height.toFixed(1),
    targetBottom: +r.bottom.toFixed(1), targetUnder: +(r.bottom - fr.top).toFixed(1),
    cardTop: cr ? +cr.top.toFixed(1) : null, cardBottom: cr ? +cr.bottom.toFixed(1) : null,
    cardUnder: cr ? +(cr.bottom - fr.top).toFixed(1) : null, cardTopBelowPanelTop: cr ? cr.top >= pr.top : null,
    hitCardBottomMinus2: hit,
    clear: f.contains(a) || ((cr ? cr.bottom : r.bottom) <= fr.top + 0.5),
  };
};
const measure = () => {
  const footer = document.querySelector('[data-testid=arrangement-export-footer]');
  let panel = footer.parentElement; while (panel && getComputedStyle(panel).overflowY !== 'auto') panel = panel.parentElement;
  const cs = getComputedStyle(panel); const pr = panel.getBoundingClientRect();
  const innerBottom = pr.bottom - parseFloat(cs.borderBottomWidth); const fr = footer.getBoundingClientRect();
  const y = innerBottom - 4; const body = footer.parentElement;
  const name = (h) => !h ? null : footer.contains(h) ? 'footer-descendant' : h === body ? 'ModalBody' : h === panel ? 'panel' : h.tagName;
  const xs = [pr.left + 12, pr.left + pr.width / 2, pr.right - 12].map(Math.round);
  return { scrollTop: panel.scrollTop, maxScroll: panel.scrollHeight - panel.clientHeight, innerBottom, footerTop: fr.top, footerBottom: fr.bottom, gap: +(innerBottom - fr.bottom).toFixed(2), hits3: xs.map((x) => name(document.elementFromPoint(x, y))) };
};
async function panelCentre(p) {
  return p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement; const r = pn.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 3, 150)) }; });
}
async function wheel(p, dy, n = 20) {
  const c = await panelCentre(p); await p.mouse.move(c.x, c.y);
  const steps = []; let last = -1;
  for (let i = 0; i < n; i++) { await p.mouse.wheel(0, dy); await sleep(250); const st = await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); let pn = f.parentElement; while (getComputedStyle(pn).overflowY !== 'auto') pn = pn.parentElement; return pn.scrollTop; }); steps.push(st); if (st === last) break; last = st; }
  return steps;
}
async function tabWalk(p, n, untilScope = false) {
  const out = [{ key: 'initial', ...(await p.evaluate(fm)) }];
  for (let i = 0; i < n; i++) { await p.keyboard.press('Tab'); await sleep(250); const m = await p.evaluate(fm); out.push({ key: 'Tab', ...m }); if (untilScope && m.el === 'arrangement-export-scope-project') break; }
  return out;
}
function sampler() {
  window.__s = []; const t0 = performance.now();
  const snap = () => {
    const f = document.querySelector('[data-testid=arrangement-export-footer]'); if (!f) return;
    const bar = document.querySelector('[data-testid=arrangement-export-progress]');
    const lab = document.querySelector('[data-testid=arrangement-export-progress-label]');
    const lr = lab ? lab.getBoundingClientRect() : null;
    const s = { t: Math.round(performance.now() - t0), label: lab ? lab.textContent : null, labelHidden: lab ? lab.getAttribute('aria-hidden') : null, labelRect: lr ? [Math.round(lr.width), Math.round(lr.height)] : null, labelDisplay: lab ? getComputedStyle(lab).visibility + '/' + getComputedStyle(lab).display : null, valuetext: bar ? bar.getAttribute('aria-valuetext') : null, hasVT: bar ? bar.hasAttribute('aria-valuetext') : null, ariaLabel: bar ? bar.getAttribute('aria-label') : null, ariaLive: bar ? bar.getAttribute('aria-live') : null, role: bar ? bar.getAttribute('role') : null, bar: !!bar };
    const l = window.__s.at(-1);
    if (!l || l.label !== s.label || l.valuetext !== s.valuetext || l.labelHidden !== s.labelHidden || l.bar !== s.bar) window.__s.push(s);
  };
  new MutationObserver(snap).observe(document.querySelector('[role=dialog]'), { childList: true, subtree: true, characterData: true, attributes: true }); snap();
}
function sumSamples(samples) {
  const busy = samples.filter((s) => s.bar && s.label);
  const phases = {}; for (const s of busy) { const ph = L.phaseOf(s.label); phases[ph] = (phases[ph] || 0) + 1; }
  return {
    total: samples.length, busy: busy.length, phases,
    valuetextMismatch: busy.filter((s) => s.valuetext !== s.label).map((s) => [s.label, s.valuetext]).slice(0, 5),
    valuetextNullString: busy.filter((s) => s.valuetext === 'null').length,
    barWithoutLabelButVT: samples.filter((s) => s.bar && !s.label && s.hasVT).length,
    labelNotHidden: busy.filter((s) => s.labelHidden !== 'true').length,
    labelZeroRect: busy.filter((s) => !s.labelRect || s.labelRect[0] === 0 || s.labelRect[1] === 0).length,
    labelDisplay: [...new Set(busy.map((s) => s.labelDisplay))],
    ariaLiveOrRole: busy.filter((s) => s.ariaLive !== null || s.role !== null).length,
    ariaLabelWrong: busy.filter((s) => s.ariaLabel !== 'ექსპორტის პროგრესი').length,
  };
}
const RE = /(რენდერი · \d+%|WAV-ის ჩაწერა · \d+%|MP3-ის შექმნა · \d+%|MP3 encoder-ის ჩატვირთვა…)/;
const RE_G = /(რენდერი · \d+%|WAV-ის ჩაწერა · \d+%|MP3-ის შექმნა · \d+%|MP3 encoder-ის ჩატვირთვა…)/g;
const fixMoji = (s) => { try { return Buffer.from(String(s), 'latin1').toString('utf8'); } catch (e) { return null; } };
async function axSample(cdp, p, wantPhases) {
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const dom = await p.evaluate(() => { const lab = document.querySelector('[data-testid=arrangement-export-progress-label]'); const bar = document.querySelector('[data-testid=arrangement-export-progress]'); const r = lab ? lab.getBoundingClientRect() : null; return { label: lab ? lab.textContent : null, hidden: lab ? lab.getAttribute('aria-hidden') : null, rect: r ? [r.width, r.height] : null, vt: bar ? bar.getAttribute('aria-valuetext') : null }; });
  const ph = L.phaseOf(dom.label);
  if (!dom.label || !wantPhases.includes(ph)) return null;
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const dlg = nodes.find((n) => !n.ignored && n.role?.value === 'dialog');
  const sub = []; const walk = (id) => { const n = byId.get(id); if (!n) return; sub.push(n); (n.childIds || []).forEach(walk); }; if (dlg) walk(dlg.nodeId);
  const staticHits = nodes.filter((n) => !n.ignored && (n.role?.value === 'StaticText' || n.role?.value === 'InlineTextBox') && n.name && RE.test(String(n.name.value))).map((n) => ({ role: n.role.value, name: n.name.value }));
  const bars = nodes.filter((n) => n.role?.value === 'progressbar').map((n) => { const vt = (n.properties || []).find((q) => q.name === 'valuetext')?.value?.value ?? null; return { ignored: n.ignored, name: n.name?.value, value: n.value?.value ?? null, valuetextCdp: vt, valuetextLatin1Fixed: vt === null ? null : fixMoji(vt) }; });
  const aggregated = sub.filter((n) => !n.ignored && n.role?.value === 'StaticText').map((n) => n.name?.value ?? '').join(' ');
  const generics = sub.filter((n) => !n.ignored && n.name && RE.test(String(n.name.value)) && n.role?.value !== 'StaticText').map((n) => ({ role: n.role?.value, name: String(n.name.value).slice(0, 200), count: (String(n.name.value).match(RE_G) || []).length }));
  const vtOk = bars.length === 1 && bars[0].valuetextCdp !== null;
  const aggCount = (aggregated.match(RE_G) || []).length + (vtOk ? 1 : 0);
  return { phase: ph, dom, staticHits, bars, aggregatedStaticText: aggregated.slice(0, 300), aggregatedCountInclValuetext: aggCount, genericNameHits: generics };
}
async function runExport(p, { timeout = 300000, cdp = null, axPhases = null } = {}) {
  await p.evaluate(sampler);
  const S = p.S; const dl0 = S.downloads.length;
  const eb = await L.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
  const t0 = Date.now(); let pr; const ax = [];
  await sleep(30);
  while (Date.now() - t0 < timeout) {
    if (cdp && ax.length < 2) { try { const a = await axSample(cdp, p, axPhases); if (a && (ax.length === 0 || a.phase !== ax[0].phase || ax.length < 1)) ax.push(a); } catch (e) { ax.push({ err: String(e).slice(0, 200) }); } }
    pr = await L.probe(p); if (!pr.cancel && pr.status && !/^რენდერი და|იტვირთება/.test(pr.status) && Date.now() - t0 > 300) break; await sleep(cdp ? 20 : 100);
  }
  await sleep(2500); pr = await L.probe(p);
  return { ms: Date.now() - t0, exportText: eb.text, final: pr, files: S.downloads.slice(dl0), samples: await p.evaluate(() => window.__s), ax };
}
async function main() {
  const sc = process.argv[2];
  const vpKey = /1440/.test(sc) ? 1440 : 1280;
  const browser = await L.launch();
  const { ctx, page: p, S } = await L.newCtx(browser, VPS[vpKey], `r102-${sc}`);
  const R = { scenario: sc, vp: S.vp, started: new Date().toISOString() };
  try {
    const rd = await ready(p); R.draggable = rd.draggable;
    R.clips = await addOneClip(p, rd.o);
    await openExport(p);
    if (sc === 'idle1280' || sc === 'idle1440') {
      R.walk = await tabWalk(p, 6);
      await p.keyboard.press('Shift+Tab'); await sleep(250); R.walk.push({ key: 'Shift+Tab', ...(await p.evaluate(fm)) });
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-walk-end.png`) });
      R.wheelSteps = await wheel(p, 120); R.stripIdleMax = await p.evaluate(measure);
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-idle-max.png`) });
    } else if (sc === 'done1280' || sc === 'done1440') {
      const cdp = await ctx.newCDPSession(p); await cdp.send('Accessibility.enable');
      R.exp = await runExport(p, { cdp: sc === 'done1280' ? cdp : null, axPhases: ['render'] });
      R.sum = sumSamples(R.exp.samples); R.exp.samples = R.exp.samples.length;
      R.afterDone = await p.evaluate(fm);
      R.walk = await tabWalk(p, 8, true);
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-scope-project-focused.png`) });
      R.cycleRest = [];
      for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); await sleep(250); R.cycleRest.push(await p.evaluate(fm)); }
      R.wheelSteps = await wheel(p, 120); R.stripDoneMax = await p.evaluate(measure);
      await p.screenshot({ path: path.join(L.SHOTS, `${sc}-done-max.png`) });
      R.wav = R.exp.files.filter((f) => f.file && /\.wav$/i.test(f.name)).map((f) => ({ name: f.name, size: f.size, ...L.wavInfo(f.file) }));
    } else if (sc === 'mp3') {
      const cdp = await ctx.newCDPSession(p); await cdp.send('Accessibility.enable');
      await L.selectFormat(p, 'mp3');
      R.exp = await runExport(p, { timeout: 360000, cdp, axPhases: ['load', 'mp3'] });
      R.sum = sumSamples(R.exp.samples); R.exp.samples = R.exp.samples.length;
      R.mp3 = [];
      for (const f of R.exp.files) if (f.file && /\.mp3$/i.test(f.name)) R.mp3.push({ name: f.name, size: f.size, head: fs.readFileSync(f.file).subarray(0, 3).toString('hex'), decode: await L.mp3Decode(p, f.file) });
      await p.screenshot({ path: path.join(L.SHOTS, 'mp3-done.png') });
    }
  } catch (e) { R.error = String(e && e.stack || e); }
  R.net = { forbidden: S.forbidden, authHeaders: S.authHeaders, thirdParty: [...new Set(S.thirdParty)], unpkg: S.unpkg.map((x) => x.f) };
  R.errors = S.errors; R.noise = S.noise; R.downloads = S.downloads.map((d) => ({ name: d.name, size: d.size }));
  R.ended = new Date().toISOString();
  L.save(`run102-${sc}.json`, R);
  console.log(JSON.stringify({ sc, error: R.error, errors: R.errors.length, downloads: R.downloads }));
  await ctx.close(); await browser.close();
}
main();
