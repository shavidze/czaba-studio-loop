// C round 189 — shared entrance-loader instrumentation (installed via addInitScript before app scripts).
const L = require('./lib.cjs');
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const CARD_IDX = { 1440: 1, 1280: 1, 375: 0 };
function ldInit() {
  const W = window; const S = (W.__ld = { ins: [], rem: [], samples: [], h1max: 0, h1bad: [], clicks: [], keys: [], plays: [], dcl: null, hitSel: null, firstHit: null, peNoneAt: null, stopAt: null, flashMax: 0 });
  document.addEventListener('DOMContentLoaded', () => { S.dcl = performance.now(); });
  const isOv = (n) => n && n.nodeType === 1 && (n.matches('[data-testid=entrance-loader]') || (n.matches('div.fixed.inset-0') && n.style && n.style.backgroundColor === 'rgb(0, 0, 0)'));
  const scan = (nodes, arr) => { for (const n of nodes) { if (n.nodeType !== 1) continue; if (isOv(n)) arr.push(performance.now()); else if (n.querySelector) { const q = n.querySelector('[data-testid=entrance-loader]'); if (q) arr.push(performance.now()); } } };
  new MutationObserver((ms) => { for (const m of ms) { scan(m.addedNodes, S.ins); scan(m.removedNodes, S.rem); } }).observe(document, { childList: true, subtree: true });
  window.addEventListener('click', (e) => { S.clicks.push({ t: performance.now(), inOv: !!(e.target.closest && e.target.closest('[data-testid=entrance-loader]')), tag: e.target.tagName, cls: String(e.target.className).slice(0, 60) }); }, true);
  window.addEventListener('keydown', (e) => { S.keys.push({ t: performance.now(), key: e.key }); }, true);
  const oPlay = HTMLMediaElement.prototype.play; W.__media = [];
  HTMLMediaElement.prototype.play = function () { S.plays.push({ t: performance.now(), src: (this.currentSrc || this.src || '').slice(-60) }); if (!W.__media.includes(this)) W.__media.push(this); return oPlay.apply(this, arguments); };
  const opac = (el, root) => { let o = 1; for (let c = el; c; c = c.parentElement) { o *= +getComputedStyle(c).opacity; if (c === root) break; } return o; };
  const tick = () => {
    const now = performance.now();
    const ov = document.querySelector('[data-testid=entrance-loader]');
    const h1s = [...document.querySelectorAll('h1')];
    const smp = { t: now, ov: !!ov, h1: h1s.length };
    if (h1s.length > S.h1max) S.h1max = h1s.length;
    if (h1s.length !== 1 || h1s.some((h) => ov && ov.contains(h))) S.h1bad.push({ t: now, n: h1s.length, txt: h1s.map((h) => h.textContent.trim().slice(0, 30)) });
    if (ov) {
      const span = [...ov.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA');
      if (span) smp.logo = +opac(span.parentElement, ov).toFixed(3);
      smp.pe = getComputedStyle(ov).pointerEvents; if (smp.pe === 'none' && S.peNoneAt === null) S.peNoneAt = now;
      smp.heads = ov.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]').length; smp.aria = ov.getAttribute('aria-hidden');
    }
    if (S.hitSel) { const b = document.querySelectorAll(S.hitSel.sel)[S.hitSel.i]; if (b) { const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); smp.hit = !!(e && (e === b || b.contains(e))); if (smp.hit && S.firstHit === null && S.ins.length) S.firstHit = now; } }
    S.samples.push(smp);
    if (S.stopAt && now > S.stopAt) return;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
async function fresh(b, W, opts = {}) {
  const ctx = await b.newContext({ viewport: VPS[W], ...opts });
  await ctx.addInitScript(ldInit);
  const page = await ctx.newPage();
  const ev = { pageerror: [], hyd: [], errors: [], foreign: [], auth: [] };
  page.on('pageerror', (e) => ev.pageerror.push(String(e).slice(0, 200)));
  page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) ev.hyd.push(t.slice(0, 200)); if (m.type() === 'error') ev.errors.push(t.slice(0, 160)); });
  page.on('request', (q) => { const u = new URL(q.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && !/^(data|blob):/.test(q.url())) ev.foreign.push({ h: u.hostname, font: /fonts\.(googleapis|gstatic)\.com/.test(u.hostname) }); if (q.headers().authorization) ev.auth.push(q.url()); });
  return { ctx, page, ev };
}
const ld = (p) => p.evaluate(() => ({ ins: window.__ld.ins, rem: window.__ld.rem, dcl: window.__ld.dcl }));
async function waitIns(p, ms = 6000) { try { await p.waitForFunction(() => window.__ld && window.__ld.ins.length > 0, null, { timeout: ms, polling: 'raf' }); return true; } catch { return false; } }
async function waitRem(p, ms = 6000) { try { await p.waitForFunction(() => window.__ld.rem.length > 0, null, { timeout: ms, polling: 'raf' }); return true; } catch { return false; } }
const sinceIns = (p) => p.evaluate(() => performance.now() - window.__ld.ins[0]);
async function waitSince(p, ms) { for (;;) { const d = await sinceIns(p); if (d >= ms) return d; await L.sleep(Math.max(1, Math.min(20, ms - d - 5))); } }
module.exports = { VPS, CARD_IDX, ldInit, fresh, ld, waitIns, waitRem, sinceIns, waitSince };
