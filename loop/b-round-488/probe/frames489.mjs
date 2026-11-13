// usage: node frames489.mjs <base> <w> <h> <cpu> <mode> [out.json]
// round 489 copy of b-round-459/probe/frames.mjs: windows sized for a 4 s entrance (samples to 14 s, 8 s wait after nav, 6 s pre-wait for reload/clientnav/arrive), modes net4g/net3g (CDP network throttling, cache disabled), wheel (wheel 600 px at 800 ms) and wheel50 (wheel 600 px as soon as the head cover is on, before hydration)
// mode: fresh | reload | rm | blockjs | delayjs (1500 ms) | delay<N> (JS delayed N ms) | esc50 | tab50 | click50 | esc1500 | tab1500 | click1500 (skip 1.5 s after data-start, after takeover) | wheel | wheel50 | net4g | net3g | clientnav | arrive | inject | delayinject
// summary adds hydrationErrors (console #418/#423/#425/hydrat), markT (page time of the action or the client navigation) and coveredAfterMark (covered samples after markT)
// b-round-459: styleReplaced (cover <style> node replaced = document client re-render) and hydrationErrors (#418/#423/#425 console/page errors) prove the re-render; + inject (one <div> at the start of <body> before hydration -> React #418 client re-render, A-R459-REVIEW-R1); skipInputAt = timeStamp of the first trusted click/keydown (capture), removedMinusInput = removedAt - skipInputAt
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, w, h, cpu, mode, out] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: Number(w), height: Number(h) }, reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference' });
await ctx.addInitScript((inj) => {
  window.__inp = null;
  const mark = (e) => { if (window.__inp === null && e.isTrusted) window.__inp = Math.round(e.timeStamp); };
  document.addEventListener('click', mark, true); document.addEventListener('keydown', mark, true);
  if (inj) { const mo = new MutationObserver(() => { if (document.body && !document.getElementById('ext-injected')) { const d = document.createElement('div'); d.id = 'ext-injected'; d.textContent = 'ext'; document.body.insertBefore(d, document.body.firstChild); mo.disconnect(); } }); mo.observe(document, { childList: true, subtree: true }); }
  window.__rep = { first: null, replaced: false };
  new MutationObserver(() => { const st = document.getElementById('czaba-entrance-cover'); if (st && !window.__rep.first) window.__rep.first = st; if (st && window.__rep.first && st !== window.__rep.first) window.__rep.replaced = true; }).observe(document, { childList: true, subtree: true });
  const s = (window.__s = []);
  const op = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= Number(cs.opacity); } return o; };
  const tick = () => {
    const t = Math.round(performance.now());
    if (document.body) {
      const st = document.getElementById('czaba-entrance-cover');
      const pb = getComputedStyle(document.body, '::before');
      const cover = st && st.media === 'all' && pb.content !== 'none' && pb.visibility !== 'hidden' ? Number(pb.opacity) : 0;
      const ov = document.querySelector('[data-testid="entrance-loader"]');
      const overlay = ov ? op(ov) : 0;
      const logoEl = ov && [...ov.querySelectorAll('span')].find((x) => x.textContent === 'CZABA');
      const tagEl = ov && [...ov.querySelectorAll('p')].find((x) => /Cinematic Sound Design/i.test(x.textContent));
      s.push({ t, cover: +cover.toFixed(3), overlay: +overlay.toFixed(3), logo: logoEl ? +op(logoEl).toFixed(3) : 0, tag: tagEl ? +op(tagEl).toFixed(3) : 0, state: st ? st.getAttribute('data-state') : null, focus: document.activeElement?.tagName });
    } else s.push({ t, nobody: true });
    if (performance.now() < 14000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, mode === 'inject' || mode === 'delayinject');
const p = await ctx.newPage();
const errs = []; p.on('console', (m) => { if (m.type() === 'error' && /#418|#423|#425|hydrat/i.test(m.text())) errs.push(m.text().slice(0, 120)); }); p.on('pageerror', (e) => { if (/#418|#423|#425|hydrat/i.test(String(e))) errs.push(String(e).slice(0, 120)); });
const cdp = await ctx.newCDPSession(p);
if (cpu !== '1') await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(cpu) });
if (mode === 'net4g' || mode === 'net3g') { await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Network.emulateNetworkConditions', mode === 'net4g' ? { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 } : { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }); }
if (mode === 'blockjs') await p.route(/\.js(\?|$)/, (r) => r.abort());
const delayMs = mode === 'delayjs' || mode === 'delayinject' ? 1500 : /^delay\d+$/.test(mode) ? Number(mode.slice(5)) : 0;
if (delayMs > 0) await p.route(/\/assets\/.*\.js(\?|$)/, async (r) => { await new Promise((z) => setTimeout(z, delayMs)); await r.continue(); });
let markT = null;
const frames = [];
cdp.on('Page.screencastFrame', async (f) => { const buf = Buffer.from(f.data, 'base64'); frames.push({ ts: f.metadata.timestamp, size: buf.length, lum: null, buf }); await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 360, maxHeight: 240 });
let navWall = Date.now() / 1000;
if (mode === 'reload' || mode === 'clientnav') { await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(6000); }
navWall = Date.now() / 1000;
if (mode === 'reload') await p.reload({ waitUntil: 'commit' });
else if (mode === 'clientnav') { await p.click('a[href="/store"]').catch(() => {}); await p.waitForTimeout(1500); navWall = Date.now() / 1000; markT = await p.evaluate(() => performance.now()); await p.goBack(); }
else if (mode === 'arrive') { await p.goto(base + '/store', { waitUntil: 'load' }); await p.waitForTimeout(2500); navWall = Date.now() / 1000; await p.click('header a[href="/"]'); }
else await p.goto(base + '/', { waitUntil: 'commit' });
if (mode === 'esc50' || mode === 'tab50' || mode === 'click50') { await p.waitForFunction(() => document.getElementById('czaba-entrance-cover')?.media === 'all', null, { timeout: 3000, polling: 5 }).catch(() => {}); const k = mode === 'esc50' ? 'Escape' : 'Tab'; if (mode === 'click50') { const bx = await p.locator('header a[href="/store"]').first().boundingBox().catch(() => null); await p.mouse.click(bx ? bx.x + bx.width / 2 : Number(w) / 2, bx ? bx.y + bx.height / 2 : 40); } else await p.keyboard.press(k); }
if (mode === 'esc1500' || mode === 'tab1500' || mode === 'click1500') { await p.waitForFunction(() => { const st = document.getElementById('czaba-entrance-cover'); const d = Number(st?.getAttribute('data-start')); return !!document.querySelector('[data-testid="entrance-loader"]') && Number.isFinite(d) && performance.now() - d >= 1500; }, null, { timeout: 6000, polling: 5 }).catch(() => {}); markT = await p.evaluate(() => performance.now()); if (mode === 'click1500') { const bx = await p.locator('header a[href="/store"]').first().boundingBox().catch(() => null); await p.mouse.click(bx ? bx.x + bx.width / 2 : Number(w) / 2, bx ? bx.y + bx.height / 2 : 40); } else await p.keyboard.press(mode === 'esc1500' ? 'Escape' : 'Tab'); }
if (mode === 'wheel50') { await p.waitForFunction(() => document.getElementById('czaba-entrance-cover')?.media === 'all', null, { timeout: 3000, polling: 5 }).catch(() => {}); await p.mouse.move(Number(w) / 2, Number(h) / 2); await p.mouse.wheel(0, 600); }
if (mode === 'wheel') { await p.waitForTimeout(800); await p.mouse.move(Number(w) / 2, Number(h) / 2); await p.mouse.wheel(0, 600); }
await p.waitForTimeout(8000);
await cdp.send('Page.stopScreencast').catch(() => {});
const r = await p.evaluate(() => ({ fp: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime ?? -1), fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1), s: window.__s, url: location.pathname, scrollY: Math.round(window.scrollY), start: document.getElementById('czaba-entrance-cover')?.getAttribute('data-start') ?? null, inp: window.__inp, hs: window.__czabaEntrance ? window.__czabaEntrance.state : null, injected: !!document.getElementById('ext-injected'), styleReplaced: window.__rep.replaced }));
// luminance of screencast frames via a tiny canvas in the page
const lums = [];
for (const f of frames) { const l = await p.evaluate(async (d) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, c.width, c.height).data; let sum = 0; for (let i = 0; i < px.length; i += 4) sum += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; return +(sum / (px.length / 4)).toFixed(1); }, f.buf.toString('base64')); lums.push({ dt: Math.round((f.ts - navWall) * 1000), lum: l }); }
const s = r.s.filter((x) => !x.nobody);
const covered = (x) => Math.max(x.cover, x.overlay) >= 0.99;
const firstBody = s[0]?.t ?? null;
const firstCovered = s.find(covered)?.t ?? null;
const exitStart = (() => { let last = null; for (const x of s) if (covered(x)) last = x.t; return last; })();
const firstUncoveredAfterCover = firstCovered == null ? null : s.find((x) => x.t > firstCovered && Math.max(x.cover, x.overlay) < 0.01)?.t ?? null;
const uncoveredBeforeCover = firstCovered == null ? null : s.filter((x) => x.t >= r.fp && x.t < firstCovered).length;
const gapsWhileCovered = firstCovered == null ? null : s.filter((x) => x.t > firstCovered && x.t < exitStart && !covered(x)).length;
const span = (k) => { const v = s.filter((x) => x[k] >= 0.99); return v.length ? v.at(-1).t - v[0].t : 0; };
const anyBlack = s.some((x) => Math.max(x.cover, x.overlay) > 0.01);
const coveredAfterMark = markT == null ? null : s.filter((x) => x.t > markT + 50 && Math.max(x.cover, x.overlay) > 0.01).length;
const removedAfterMark = markT == null ? null : (s.find((x) => x.t > markT && Math.max(x.cover, x.overlay) < 0.01)?.t ?? null);
const summary = { hydrationErrors: errs.length, markT: markT == null ? null : Math.round(markT), coveredAfterMark, removedAfterMarkMs: removedAfterMark == null ? null : Math.round(removedAfterMark - markT), scrollY: r.scrollY, mode, cpu, w, h, url: r.url, fp: r.fp, fcp: r.fcp, dataStart: r.start, firstBodySample: firstBody, firstCovered, coveredUntil: exitStart, removedAt: firstUncoveredAfterCover, uncoveredSamplesFromFpToCover: uncoveredBeforeCover, gapsWhileCovered, logoFullMs: span('logo'), tagFullMs: span('tag'), anyBlackSample: anyBlack, finalState: s.at(-1)?.state, handshakeState: r.hs, injected: r.injected, styleReplaced: r.styleReplaced, hydrationErrors: errs.length, skipInputAt: r.inp, removedMinusInput: r.inp == null || firstUncoveredAfterCover == null ? null : firstUncoveredAfterCover - r.inp, overlaySeen: s.some((x) => x.overlay > 0.01), finalFocus: s.at(-1)?.focus, blackFrames: lums.filter((x) => x.dt > 0 && x.lum <= 3).length, firstPaintedLum: lums.find((x) => x.lum < 250)?.lum ?? null, frames: lums.length };
console.log(JSON.stringify(summary));
if (out) writeFileSync(out, JSON.stringify({ summary, samples: s, lums }, null, 0));
await b.close();
