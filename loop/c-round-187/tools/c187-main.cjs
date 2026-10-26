// C round 187 — FILL-187, FLIP-187, PREVIEW-187, PX-NET/REG-HYD. node c187-main.cjs <1440|1280|375>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const W = process.argv[2]; const ROOT = path.join(__dirname, '..'); const SH = path.join(ROOT, 'shots', `main-${W}`); fs.mkdirSync(SH, { recursive: true });
const ALLOWED = new Set(['127.0.0.1:5173', 'localhost:5173', '127.0.0.1:5199', 'localhost:5199']);
const FONT = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
const HYD = /hydrat|did not match|server rendered|Text content does not match/i;
const init = () => { window.__media = []; const P = HTMLMediaElement.prototype; const op = P.play; P.play = function () { if (!window.__media.includes(this)) window.__media.push(this); return op.apply(this, arguments); }; };
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const lab = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const R = f(r), G = f(g), B = f(b); const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883; const h = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * h(Y) - 16, 500 * (h(X) - h(Y)), 200 * (h(Y) - h(Z))]; };
const dE = (a, b) => { const p = lab(a), q = lab(b); return +Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]).toFixed(2); };
const rgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const res = { W, utc: new Date().toISOString(), sessions: [] };
const save = () => { fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'out', `main-${W}.json`), JSON.stringify(res, null, 1)); };
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'] });
  const open = async (label, js = true) => {
    const ctx = await b.newContext({ viewport: VPS[W], deviceScaleFactor: 2, javaScriptEnabled: js }); await ctx.addInitScript(init);
    const page = await ctx.newPage(); const ev = { label, js, pageerror: [], hyd: [], errors: [], foreign: [], auth: [], hosts: {} };
    page.on('console', (m) => { const t = m.text(); if (HYD.test(t)) ev.hyd.push(t.slice(0, 300)); if (m.type() === 'error') ev.errors.push(t.slice(0, 200)); });
    page.on('pageerror', (e) => ev.pageerror.push(String(e).slice(0, 300)));
    page.on('request', (q) => { const u = q.url(); if (/^(data|blob):/.test(u)) return; let h; try { h = new URL(u).host; } catch { h = u; } ev.hosts[h] = (ev.hosts[h] || 0) + 1; if (!ALLOWED.has(h)) ev.foreign.push({ u: u.slice(0, 160), font: FONT.has(h) }); if (q.headers().authorization) ev.auth.push(u); });
    res.sessions.push(ev); return { ctx, page, ev };
  };
  // ---------- FILL ----------
  try {
    const { ctx, page } = await open('fill');
    await page.goto(L.BASE + '/products/middle-east', { waitUntil: 'load' }); await L.sleep(4000);
    const probe = await page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'background-color: var(--color-brand); position:fixed; left:-50px; top:0; width:10px; height:10px'; document.body.appendChild(d); const c = getComputedStyle(d).backgroundColor; d.remove(); const p2 = document.createElement('div'); p2.style.backgroundColor = 'var(--color-primary)'; document.body.appendChild(p2); const c2 = getComputedStyle(p2).backgroundColor; p2.remove(); return { brand: c, primary: c2, brandVar: getComputedStyle(document.documentElement).getPropertyValue('--color-brand'), primaryVar: getComputedStyle(document.documentElement).getPropertyValue('--color-primary') }; });
    const F = { probe };
    await page.getByRole('button', { name: 'Play preview' }).first().click();
    const t0 = Date.now(); let ct = 0;
    while (Date.now() - t0 < 15000) { ct = await page.evaluate(() => (window.__media[0] ? window.__media[0].currentTime : 0)); if (ct >= 2) break; await L.sleep(100); }
    F.reach2sMs = Date.now() - t0; F.ctAt = ct;
    const read = () => page.evaluate(() => { const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }; const pr = document.querySelector('input[aria-label="Preview position"]'); const vo = document.querySelector('input[aria-label="Preview volume"]'); const a = window.__media[0];
      return { progress: pr && { bg: getComputedStyle(pr).backgroundImage, inline: pr.getAttribute('style'), box: box(pr), value: +pr.value, max: +pr.max, display: getComputedStyle(pr).display }, volume: vo && { bg: getComputedStyle(vo).backgroundImage, inline: vo.getAttribute('style'), box: box(vo), value: +vo.value, visible: vo.offsetParent !== null }, audio: a && { ct: a.currentTime, dur: a.duration, paused: a.paused, vol: a.volume }, bar: (() => { const e = document.querySelector('.audio-player'); return e ? box(e) : null; })() }; });
    F.playing = await read();
    // freeze: pause via the player's main play/pause button; keep the fill state
    const pauseBtn = page.locator('.audio-player button[aria-label="Pause"]');
    if (await pauseBtn.count()) await pauseBtn.first().click(); else await page.getByRole('button', { name: 'Pause preview' }).first().click();
    await L.sleep(600); await page.mouse.move(2, 2); await L.sleep(400);
    F.paused = await read();
    const sample = async (tag, st) => {
      const out = {};
      const shotFile = path.join(SH, `${tag}-viewport.png`); await page.screenshot({ path: shotFile }); out.shot = path.relative(ROOT, shotFile);
      const D = decode(fs.readFileSync(shotFile)); const px = (x, y) => D.px(Math.round(x * 2), Math.round(y * 2));
      const probeRgb = rgb(probe.brand);
      if (st.progress) { const p = st.progress; const frac = p.value / p.max; const cy = p.box.y + p.box.h / 2; const fillW = p.box.w * frac; const thumbX = p.box.x + 6 + (p.box.w - 12) * frac;
        const lx = p.box.x + Math.max(1, Math.min(fillW / 2, thumbX - 7 - p.box.x)); const rx = p.box.x + p.box.w - (p.box.w - (thumbX - p.box.x)) / 2;
        const L1 = px(lx, cy), R1 = px(rx, cy); out.progress = { frac: +frac.toFixed(4), fillWcss: +fillW.toFixed(1), thumbXcss: +thumbX.toFixed(1), leftAt: [+lx.toFixed(1), +cy.toFixed(1)], left: L1, dELeft: dE(L1, probeRgb), rightAt: [+rx.toFixed(1), +cy.toFixed(1)], right: R1, dERight: dE(R1, probeRgb), contrastFillVsUnfilled: cr(L1, R1) };
        const clip = { x: Math.max(0, p.box.x - 50), y: p.box.y - 12, width: p.box.w + 100, height: p.box.h + 24 }; const cf = path.join(SH, `${tag}-progress-crop.png`); await page.screenshot({ path: cf, clip }); out.progress.crop = path.relative(ROOT, cf); }
      if (st.volume && st.volume.visible) { const v = st.volume; const cy = v.box.y + v.box.h / 2; let last = null; const row = [];
        for (let x = v.box.x + 0.5; x < v.box.x + v.box.w; x += 0.5) { const q = px(x, cy); const d = dE(q, probeRgb); row.push(d); if (d <= 10) last = x; }
        const thumbX = v.box.x + 6 + (v.box.w - 12) * v.value;
        // teal end: the last teal px, but the white thumb may cover the boundary; also scan just outside the thumb
        const firstTeal = row.findIndex((d) => d <= 10);
        const leftPx = px(v.box.x + 2, cy), rightPx = px(v.box.x + v.box.w - 2, cy);
        out.volume = { value: v.value, boxW: v.box.w, firstTealOffsetCss: firstTeal < 0 ? null : firstTeal * 0.5 + 0.5, lastTealOffsetCss: last === null ? null : +(last - v.box.x).toFixed(1), lastTealFrac: last === null ? null : +((last - v.box.x) / v.box.w).toFixed(3), thumbXOffsetCss: +(thumbX - v.box.x).toFixed(1), thumbFrac: +((thumbX - v.box.x) / v.box.w).toFixed(3), leftEdge: leftPx, dELeftEdge: dE(leftPx, probeRgb), rightEdge: rightPx, dERightEdge: dE(rightPx, probeRgb), contrast: cr(leftPx, rightPx) };
        const clip = { x: v.box.x - 40, y: v.box.y - 12, width: v.box.w + 60, height: v.box.h + 24 }; const cf = path.join(SH, `${tag}-volume-crop.png`); await page.screenshot({ path: cf, clip }); out.volume.crop = path.relative(ROOT, cf); }
      else out.volume = { visible: false };
      await page.addStyleTag({ content: 'input[type=range]::-webkit-slider-thumb{opacity:0 !important}' }).then(async (h) => { await L.sleep(200); const f2 = path.join(SH, `${tag}-nothumb.png`); await page.screenshot({ path: f2 }); const D2 = decode(fs.readFileSync(f2)); const q = (x, y) => D2.px(Math.round(x * 2), Math.round(y * 2)); const pr = rgb(probe.brand);
        const scan = (bx) => { const cy = bx.y + bx.h / 2; let last = null, first = null; for (let x = bx.x + 0.5; x < bx.x + bx.w; x += 0.5) { if (dE(q(x, cy), pr) <= 10) { if (first === null) first = x - bx.x; last = x - bx.x; } } return { firstTealCss: first, lastTealCss: last, lastTealFrac: last === null ? null : +(last / bx.w).toFixed(3) }; };
        out.noThumb = { shot: path.relative(ROOT, f2), progress: st.progress ? { ...scan(st.progress.box), expectedFrac: +(st.progress.value / st.progress.max).toFixed(4) } : null, volume: st.volume && st.volume.visible ? { ...scan(st.volume.box), expectedFrac: st.volume.value } : null };
        await h.evaluate((el) => el.remove()); await L.sleep(200); });
      if (st.bar) { const bf = path.join(SH, `${tag}-player-bar.png`); await page.screenshot({ path: bf, clip: { x: 0, y: st.bar.y, width: VPS[W].width, height: st.bar.h } }); out.barShot = path.relative(ROOT, bf); }
      return out;
    };
    F.samplePaused07 = await sample('fill-07', F.paused);
    // volume to ~0.3 with the keyboard
    const vo = page.locator('input[aria-label="Preview volume"]');
    if (await vo.isVisible()) { await vo.focus(); for (let i = 0; i < 40; i++) await page.keyboard.press('ArrowLeft'); await L.sleep(400); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await L.sleep(300);
      F.after03 = await read(); F.samplePaused03 = await sample('fill-03', F.after03); }
    F.containsProbe = { progress: !!(F.paused.progress && F.paused.progress.bg.includes(probe.brand)), volume07: !!(F.paused.volume && F.paused.volume.bg.includes(probe.brand)), volume03: !!(F.after03 && F.after03.volume && F.after03.volume.bg.includes(probe.brand)) };
    res.fill = F; save(); await ctx.close();
  } catch (e) { res.fillErr = String(e.stack || e).slice(0, 800); save(); }
  // ---------- FLIP ----------
  const measure = (page) => page.evaluate(() => [...document.querySelectorAll('button[class*="audio-preview"]')].map((bt, i) => { const r = bt.getBoundingClientRect(); const s = bt.querySelector('svg'); const sr = s ? s.getBoundingClientRect() : null; const card = bt.closest('a[href]') || bt.closest('[class*="group"]'); const link = bt.closest('.group') ? (bt.closest('.group').querySelector('a[href]') || {}).getAttribute?.('href') : null;
    const texts = [...bt.childNodes].concat([...bt.querySelectorAll('*')].flatMap((e) => [...e.childNodes])).filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim());
    return { i, outer: bt.outerHTML, w: +r.width.toFixed(2), h: +r.height.toFixed(2), ow: bt.offsetWidth, oh: bt.offsetHeight, visible: r.width > 0 && r.height > 0, svgRel: sr ? { dx: +(sr.x - r.x).toFixed(2), dy: +(sr.y - r.y).toFixed(2), w: +sr.width.toFixed(2), h: +sr.height.toFixed(2) } : null, type: bt.getAttribute('type'), label: bt.getAttribute('aria-label'), texts, overlayText: !!bt.querySelector('.audio-preview-overlay-text'), href: link || (card && card.getAttribute && card.getAttribute('href')) }; }));
  const flip = {};
  for (const [name, url] of [['product', '/products/middle-east'], ['home', '/'], ['store', '/store']]) {
    const r = {};
    for (const js of [false, true]) {
      const { ctx, page, ev } = await open(`flip-${name}-${js ? 'js' : 'nojs'}`, js);
      const resp = await page.goto(L.BASE + url, { waitUntil: 'load' }); const html = await resp.text();
      await L.sleep(1000);
      const ssrBtns = [...html.matchAll(/<button[^>]*class="[^"]*audio-preview[^"]*"[^>]*>[\s\S]*?<\/button>/g)].map((m) => m[0]);
      const k = js ? 'js' : 'nojs';
      r[`${k}Ssr`] = { overlayText: (html.match(/audio-preview-overlay-text/g) || []).length, buttons: ssrBtns.length, previewText: ssrBtns.filter((s) => />\s*Preview\s*</.test(s)).length };
      // hover the first card with audio (md+), so the overlay shows
      if (name === 'home' && W !== '375') { const first = page.locator('button[class*="audio-preview"]').nth(1); if (await first.count()) { await first.scrollIntoViewIfNeeded().catch(() => {}); await L.sleep(1500); r[`${js ? 'js' : 'nojs'}Unhovered`] = await measure(page); let bx = await first.boundingBox(); if (bx) await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await L.sleep(1500); } }
      if (name === 'home' && W === '375') { const first = page.locator('button[class*="audio-preview"]').nth(0); if (await first.count()) { await first.scrollIntoViewIfNeeded().catch(() => {}); await L.sleep(600); } }
      r[k] = await measure(page);
      if (name !== 'store' && r[k].length) { const idx = name === 'home' && W !== '375' ? 1 : 0; const bx = await page.locator('button[class*="audio-preview"]').nth(idx).boundingBox(); if (bx && bx.width) { const f = path.join(SH, `flip-${name}-${k}.png`); await page.screenshot({ path: f, clip: { x: Math.max(0, bx.x - 20), y: Math.max(0, bx.y - 20), width: bx.width + 40, height: bx.height + 40 } }); r[`${k}Shot`] = path.relative(ROOT, f); } }
      r[`${k}Ev`] = { hyd: ev.hyd, pageerror: ev.pageerror };
      await ctx.close();
    }
    const n = Math.max(r.js.length, r.nojs.length); r.cmp = [];
    for (let i = 0; i < n; i++) { const a = r.nojs[i], c = r.js[i]; if (!a || !c) { r.cmp.push({ i, missing: true }); continue; }
      const u0 = r.nojsUnhovered && r.nojsUnhovered[i], u1 = r.jsUnhovered && r.jsUnhovered[i]; r.cmp.push({ i, unhovered: u0 && u1 ? { dW: +(u1.w - u0.w).toFixed(2), dH: +(u1.h - u0.h).toFixed(2), dSvg: u0.svgRel && u1.svgRel ? { dx: +(u1.svgRel.dx - u0.svgRel.dx).toFixed(2), dy: +(u1.svgRel.dy - u0.svgRel.dy).toFixed(2) } : null, eq: u0.outer === u1.outer } : null, href: c.href, visible: [a.visible, c.visible], outerEqual: a.outer === c.outer, dW: +(c.w - a.w).toFixed(2), dH: +(c.h - a.h).toFixed(2), dOW: c.ow - a.ow, dOH: c.oh - a.oh, dSvg: a.svgRel && c.svgRel ? { dx: +(c.svgRel.dx - a.svgRel.dx).toFixed(2), dy: +(c.svgRel.dy - a.svgRel.dy).toFixed(2) } : null, type: [a.type, c.type], label: [a.label, c.label], texts: [a.texts, c.texts], overlayText: [a.overlayText, c.overlayText], outerNojs: a.outer.length > 600 ? a.outer.slice(0, 600) : a.outer, ...(a.outer === c.outer ? {} : { outerJs: c.outer.slice(0, 600) }) }); }
    flip[name] = { ssr: { nojs: r.nojsSsr, js: r.jsSsr }, count: [r.nojs.length, r.js.length], cmp: r.cmp, shots: [r.nojsShot, r.jsShot], ev: { nojs: r.nojsEv, js: r.jsEv } };
    res.flip = flip; save();
  }
  // ---------- PREVIEW ----------
  const pv = {};
  const playCheck = async (page) => { const s = []; const t0 = Date.now(); let base = null; while (Date.now() - t0 < 3000) { const v = await page.evaluate(() => window.__media.map((a) => ({ ct: a.currentTime, paused: a.paused, src: (a.currentSrc || a.src).slice(-80) }))); s.push({ t: Date.now() - t0, v }); await L.sleep(250); } return s; };
  try {
    { const { ctx, page } = await open('preview-product'); await page.goto(L.BASE + '/products/middle-east', { waitUntil: 'load' }); await L.sleep(3000);
      const url0 = page.url(); const btn = page.locator('button[class*="audio-preview"]').first(); await btn.click(); const tClick = Date.now();
      const s = await playCheck(page); const label1 = await btn.getAttribute('aria-label'); const ct1 = s[s.length - 1].v[0];
      const firstAdv = s.find((x) => x.v[0] && x.v[0].ct >= 1);
      await btn.click(); await L.sleep(500);
      const after = await page.evaluate(() => window.__media.map((a) => ({ ct: a.currentTime, paused: a.paused })));
      const label2 = await btn.getAttribute('aria-label'); const ct2 = after[0] ? after[0].ct : null; await L.sleep(800); const after2 = await page.evaluate(() => window.__media.map((a) => ({ ct: a.currentTime, paused: a.paused })));
      const barTitle = await page.evaluate(() => (document.querySelector('.audio-player-title') || {}).textContent || null);
      pv.product = { mediaCount: s[s.length - 1].v.length, reach1sAtMs: firstAdv ? firstAdv.t : null, ctAfter3s: ct1, labelPlaying: label1, labelAfterSecondClick: label2, pausedAfter: after, pausedStill: after2, ctFrozen: after2[0] && ct2 !== null ? +(after2[0].ct - ct2).toFixed(3) : null, urlUnchanged: page.url() === url0, barTitle, samples: s.filter((_, i) => i % 3 === 0) };
      const f = path.join(SH, 'preview-product-paused.png'); await page.screenshot({ path: f }); pv.product.shot = path.relative(ROOT, f); await ctx.close(); }
    if (W !== '375') { const { ctx, page } = await open('preview-home-card'); await page.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(3000);
      const idx = 1; const btn = page.locator('button[class*="audio-preview"]').nth(idx); await btn.scrollIntoViewIfNeeded(); await L.sleep(800);
      let bx = await btn.boundingBox(); await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await L.sleep(1500); bx = await btn.boundingBox(); await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await L.sleep(800); bx = await btn.boundingBox();
      const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const bt = e && e.closest('button'); return { tag: e && e.tagName, isPreviewBtn: !!(bt && /audio-preview/.test(bt.className)) }; }, [bx.x + bx.width / 2, bx.y + bx.height / 2]);
      const cardTitle = await btn.evaluate((el) => { const g = el.closest('.group'); const h = g && g.querySelector('h3, h2, h4'); return h ? h.textContent.trim() : null; });
      const cardHref = await btn.evaluate((el) => { const a = el.closest('a[href]'); return a ? a.getAttribute('href') : null; });
      const url0 = page.url(); await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await L.sleep(300);
      const s = await playCheck(page); const label1 = await btn.getAttribute('aria-label'); const url1 = page.url();
      const firstAdv = s.find((x) => x.v[0] && x.v[0].ct >= 1);
      const barTitle = await page.evaluate(() => (document.querySelector('.audio-player-title') || {}).textContent || null);
      await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await L.sleep(500);
      const after = await page.evaluate(() => window.__media.map((a) => ({ ct: a.currentTime, paused: a.paused }))); const label2 = await btn.getAttribute('aria-label');
      pv.homeCard = { idx, hit, cardTitle, cardHref, barTitle, titleMatch: !!cardTitle && barTitle === cardTitle, url0, url1, urlUnchanged: url0 === url1 && page.url() === url0, reach1sAtMs: firstAdv ? firstAdv.t : null, ctAfter3s: s[s.length - 1].v[0], labelPlaying: label1, labelAfterSecondClick: label2, pausedAfter: after };
      const f = path.join(SH, 'preview-home-card.png'); await page.screenshot({ path: f }); pv.homeCard.shot = path.relative(ROOT, f); await ctx.close(); }
  } catch (e) { res.previewErr = String(e.stack || e).slice(0, 800); }
  res.preview = pv; await b.close();
  res.netSummary = res.sessions.map((s) => ({ label: s.label, pageerror: s.pageerror.length, hyd: s.hyd.length, foreignNonFont: s.foreign.filter((f) => !f.font).map((f) => f.u), auth: s.auth.length, errors: s.errors.filter((e) => !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed/i.test(e)) }));
  save();
  console.log(JSON.stringify({ fill: res.fill && { probe: res.fill.probe, containsProbe: res.fill.containsProbe, s07: res.fill.samplePaused07, s03: res.fill.samplePaused03, reach2sMs: res.fill.reach2sMs }, fillErr: res.fillErr, flip: Object.fromEntries(Object.entries(res.flip || {}).map(([k, v]) => [k, { ssr: v.ssr, count: v.count, cmp: v.cmp.map((c) => ({ i: c.i, un: c.unhovered, dOW: c.dOW, dOH: c.dOH, vis: c.visible, eq: c.outerEqual, dW: c.dW, dH: c.dH, dSvg: c.dSvg, type: c.type, label: c.label, texts: c.texts, href: c.href })), ev: v.ev }])), preview: Object.fromEntries(Object.entries(pv).map(([k, v]) => [k, { ...v, samples: undefined }])), previewErr: res.previewErr, net: res.netSummary }, null, 1));
})();
