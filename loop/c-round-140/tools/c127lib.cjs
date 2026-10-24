const X = require('./lib122.cjs');
const { L, sleep } = X;
const fs = require('fs');
const path = require('path');

const KA = /[Ⴀ-ჿ]/g;

function dlgDumpInPage(userContent) {
  const t = document.querySelector('#arrangement-export-title');
  const d = t && t.closest('[role=dialog]');
  if (!d) return null;
  const text = d.innerText;
  const attrs = [];
  for (const el of [d, ...d.querySelectorAll('*')]) {
    for (const a of ['aria-label', 'title', 'aria-valuetext']) {
      const v = el.getAttribute(a);
      if (v) attrs.push({ a, tag: el.tagName.toLowerCase(), tid: el.getAttribute('data-testid'), v });
    }
  }
  const re = /[Ⴀ-ჿ]/g;
  const cnt = (s) => (s.match(re) || []).length;
  const all = [text, ...attrs.map((x) => x.v)].join('\n');
  const total = cnt(all);
  const runs = [];
  const rr = /[Ⴀ-ჿ][Ⴀ-ჿ\s«»„“"'():.,\-—·]*/g;
  let m;
  while ((m = rr.exec(all))) runs.push({ run: m[0].trim(), ctx: all.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20).replace(/\n/g, ' ⏎ ') });
  let subtracted = 0;
  const subtractedList = [];
  for (const u of userContent || []) {
    if (!u || !cnt(u)) continue;
    let idx = all.indexOf(u);
    while (idx >= 0) { subtracted += cnt(u); subtractedList.push(u); idx = all.indexOf(u, idx + u.length); }
  }
  const footer = d.querySelector('[data-testid=arrangement-export-footer]');
  const fbtn = footer ? [...footer.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim(), disabled: b.disabled, top: Math.round(b.getBoundingClientRect().top), sw: b.scrollWidth, cw: b.clientWidth })) : [];
  const overflow = [...d.querySelectorAll('button,label,input,span,p,legend')].filter((e) => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && getComputedStyle(e).overflow !== 'visible').map((e) => ({ tag: e.tagName, tid: e.getAttribute('data-testid'), text: e.textContent.trim().slice(0, 60), sw: e.scrollWidth, cw: e.clientWidth, ov: getComputedStyle(e).overflowX }));
  const overflowAny = [...d.querySelectorAll('button,label')].filter((e) => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).map((e) => ({ tag: e.tagName, tid: e.getAttribute('data-testid'), text: e.textContent.trim().slice(0, 60), sw: e.scrollWidth, cw: e.clientWidth }));
  const closeBtns = [...d.querySelectorAll('button')].filter((b) => (b.getAttribute('aria-label') || b.textContent.trim()) === 'Close').map((b) => ({ ariaLabel: b.getAttribute('aria-label'), text: b.textContent.trim(), disabled: b.disabled, inFooter: !!b.closest('[data-testid=arrangement-export-footer]') }));
  const status = [...d.querySelectorAll('[role=status],[role=alert]')].map((e) => ({ role: e.getAttribute('role'), text: e.textContent.trim() }));
  const radios = [...d.querySelectorAll('input[type=radio]')].map((i) => ({ tid: i.dataset.testid, checked: i.checked, disabled: i.disabled }));
  const fb = footer ? footer.getBoundingClientRect().toJSON() : null;
  const rc = d.querySelector('[data-testid=arrangement-export-scope-range]');
  const rcLabel = rc ? rc.closest('label') : null;
  const rcBox = rcLabel ? rcLabel.getBoundingClientRect().toJSON() : null;
  return { text, attrs, total, subtracted, subtractedList, net: total - subtracted, runs, fbtn, footerRows: new Set(fbtn.map((b) => b.top)).size, overflow, overflowAny, closeBtns, status, radios, footerBox: fb, rangeCardBox: rcBox, rangeCardFooterOverlap: fb && rcBox ? +(rcBox.bottom - fb.top).toFixed(1) : null };
}

const USER_CONTENT_BASE = ['beeps-6s-h264-aac.mp4', 'noaudio-2s-h264.mp4', 'CZABA hero — საჯარო preview', 'Middle East — საჯარო preview', 'ღამის პულსი · პულსი', 'Soft impact'];

async function dump(p, extra = []) {
  return p.evaluate(dlgDumpInPage, [...USER_CONTENT_BASE, ...extra]);
}

function obsInit() {
  window.__obs = { on: false, log: [] };
  window.__obsStart = () => {
    window.__obs.on = true; window.__obs.log = []; window.__obs.t0 = performance.now();
    let last = '';
    const tick = () => {
      if (!window.__obs.on) return;
      const t = document.querySelector('#arrangement-export-title');
      const d = t && t.closest('[role=dialog]');
      let rec = 'nodialog';
      if (d) {
        const pr = d.querySelector('[data-testid=arrangement-export-progress]');
        const st = [...d.querySelectorAll('[role=status],[role=alert]')].map((e) => `${e.getAttribute('role')}:${e.textContent.trim()}`).join(' | ');
        const fb = d.querySelector('[data-testid=arrangement-export-footer]');
        const btns = fb ? [...fb.querySelectorAll('button')].map((b) => `${b.textContent.trim()}${b.disabled ? '(dis)' : ''}`).join(',') : '';
        const lbl = pr ? (pr.parentElement ? pr.parentElement.innerText.replace(/\s+/g, ' ').trim() : '') : '';
        rec = JSON.stringify({ vt: pr ? pr.getAttribute('aria-valuetext') : null, al: pr ? pr.getAttribute('aria-label') : null, lbl, st, btns });
      }
      const ws = (document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '';
      const full = rec + '##' + ws.trim();
      if (full !== last) { window.__obs.log.push({ t: +(performance.now() - window.__obs.t0).toFixed(1), rec, ws: ws.trim() }); last = full; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  window.__obsStop = () => { window.__obs.on = false; return window.__obs.log; };
}

const footerExportBtn = (p) => p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /^(Export WAV|Export MP3|Export WAV \+ MP3|Rendering…)$/ });
const footerClose = (p) => p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /^Done$/ });

async function openDlg(p) {
  await L.blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title', { timeout: 10000 });
  await sleep(400);
}
const isOpen = (p) => p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
async function closeByFooter(p) { await footerClose(p).click(); await sleep(400); return isOpen(p); }

const focusDesc = (p) => p.evaluate(() => {
  const e = document.activeElement;
  if (!e) return null;
  const inDlg = !!e.closest('[role=dialog]');
  return `${e.tagName.toLowerCase()}|${e.getAttribute('data-testid') || ''}|${e.getAttribute('aria-label') || ''}|${(e.textContent || '').trim().slice(0, 30)}|${inDlg ? 'dlg' : 'out'}`;
});

async function tabWalk(p, n = 7) {
  const seq = [await focusDesc(p)];
  for (let i = 0; i < n; i++) { await p.keyboard.press('Tab'); await sleep(120); seq.push(await focusDesc(p)); }
  await p.keyboard.press('Shift+Tab'); await sleep(120);
  const back = await focusDesc(p);
  return { seq, shiftTabFromLast: back };
}

async function runExport(p, log, name, { format = 'wav', scope = 'project', cancelAfterMs = null, cancelWhen = null, waitMs = 240000 } = {}) {
  if (!(await isOpen(p))) await openDlg(p);
  await p.click(`[data-testid=arrangement-export-format-${format}]`);
  if (scope) await p.click(`[data-testid=arrangement-export-scope-${scope}]`).catch(() => {});
  await sleep(200);
  const pre = await dump(p);
  const n0 = log.downloads.length;
  await p.evaluate(() => window.__obsStart());
  const tClick = Date.now();
  await footerExportBtn(p).click();
  let cancelled = null;
  let duringRender = null;
  const t0 = Date.now();
  while (Date.now() - t0 < waitMs) {
    if (!duringRender) {
      const st = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-progress]'));
      if (st) duringRender = await dump(p);
    }
    if ((cancelAfterMs !== null || cancelWhen) && !cancelled) {
      const ok = cancelWhen ? await p.evaluate(cancelWhen) : Date.now() - tClick >= cancelAfterMs;
      const cb = p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /^Cancel$/ });
      if (ok && (await cb.count())) { const atCancel = await p.evaluate(() => window.__obs.log.slice(-1)[0]); await cb.click(); cancelled = { atMs: Date.now() - tClick, atCancel }; }
    }
    const phase = await p.evaluate(() => { const fb = document.querySelector('[data-testid=arrangement-export-footer]'); return fb ? [...fb.querySelectorAll('button')].some((b) => /Rendering…/.test(b.textContent)) : false; });
    if (!phase && Date.now() - tClick > 300) {
      if (cancelled || cancelAfterMs === null) {
        if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) break;
        if (cancelled && Date.now() - tClick > 2500) break;
        const st = await p.evaluate(() => [...document.querySelectorAll('[role=dialog] [role=status],[role=dialog] [role=alert]')].map((e) => e.textContent).join('|'));
        if (/failed|No file was created/.test(st) && Date.now() - tClick > 1500) break;
      }
    }
    await sleep(100);
  }
  await sleep(1200);
  const obs = await p.evaluate(() => window.__obsStop());
  const post = await dump(p);
  const focus = await focusDesc(p);
  const recs = log.downloads.slice(n0);
  const files = [];
  for (const rec of recs) { if (!rec.file) continue; const dst = path.join(L.OUT, `${name}-${rec.name}`.replace(/[^\w.\-]/g, '_')); fs.renameSync(rec.file, dst); files.push(dst); }
  return { pre: { net: pre.net, total: pre.total }, duringRender, post, obs, focus, cancelled, elapsedMs: Date.now() - tClick, files, recs: recs.map((r) => ({ name: r.name, size: r.size, err: r.err })) };
}

function wavInfo(file) { const w = X.wav(file); return { file: path.basename(file), sha: w.sha, fmt: w.fmt, frames: w.frames, seconds: w.seconds, peak: +w.peak.toFixed(4), rms: +w.rms.toFixed(4), nan: w.nan }; }

function save(name, data) { fs.mkdirSync(L.OUT, { recursive: true }); fs.writeFileSync(path.join(L.OUT, name), JSON.stringify(data, null, 1)); }
async function shot(p, name) { await p.screenshot({ path: path.join(L.SHOTS, name) }); return `c-round-140/shots/${name}`; }

module.exports = { X, L, sleep, KA, dump, obsInit, footerExportBtn, footerClose, openDlg, isOpen, closeByFooter, focusDesc, tabWalk, runExport, wavInfo, save, shot, USER_CONTENT_BASE };
