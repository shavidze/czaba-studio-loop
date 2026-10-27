const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const VPX = { ...X.VPS, 390: { width: 390, height: 844 } };
const rows = {
  async 'RG-22'(b, net, res) {
    const { page: p } = await L.openCtx(b, VPX[vp], id, net);
    await p.goto(`${L.BASE}/`, { waitUntil: 'domcontentloaded' }); await sleep(5000);
    res.links = await p.evaluate(() => [...document.querySelectorAll('a[href*="studio-lab"]')].map((a) => { const r = a.getBoundingClientRect(); return { text: a.textContent.trim().slice(0, 30), inHeader: !!a.closest('header'), vis: r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden', h: Math.round(r.height), top: Math.round(r.top) }; }));
    if (vp === '390') {
      const btn = p.locator('header button[aria-label*="menu" i], header button[aria-label*="მენიუ"], header button[aria-expanded]').first();
      res.menuBtn = await btn.count() ? await btn.getAttribute('aria-label') : null;
      if (res.menuBtn !== null) { await btn.click(); await sleep(800); }
      res.linksOpen = await p.evaluate(() => [...document.querySelectorAll('a[href*="studio-lab"]')].map((a) => { const r = a.getBoundingClientRect(); return { text: a.textContent.trim().slice(0, 30), vis: r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden' && r.top >= 0 && r.bottom <= innerHeight }; }));
      await X.shot(p, `${id}-menu.png`);
      res.checks = { menuShowsLink: res.linksOpen.some((l) => l.vis) };
      return;
    }
    // wrap / overlap among header nav items
    res.header = await p.evaluate(() => { const h = document.querySelector('header'); const items = [...h.querySelectorAll('a, button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent.trim() || e.getAttribute('aria-label') || '').slice(0, 20), x: r.left, y: r.top, r: r.right, b: r.bottom, h: r.height, lh: parseFloat(getComputedStyle(e).lineHeight) || null }; }); let overlaps = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], c = items[j]; if (a.x < c.r - 0.5 && c.x < a.r - 0.5 && a.y < c.b - 0.5 && c.y < a.b - 0.5) { const inside = (a.x >= c.x && a.r <= c.r && a.y >= c.y && a.b <= c.b) || (c.x >= a.x && c.r <= a.r && c.y >= a.y && c.b <= a.b); if (!inside) overlaps.push(`${a.t}|${c.t}`); } } const lab = items.find((i) => /Studio Lab/i.test(i.t)); return { n: items.length, overlaps, lab, headerH: h.getBoundingClientRect().height }; });
    await X.shot(p, `${id}-home.png`);
    await p.evaluate(() => { window.__clientNav = 'kept'; });
    const hl = p.locator('header a[href*="studio-lab"]').filter({ visible: true }).first();
    await hl.click(); await p.waitForURL(/studio-lab/, { timeout: 30000 }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(1500);
    res.lab = await p.evaluate(() => ({ url: location.pathname, client: window.__clientNav === 'kept', workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), badge: document.body.innerText.includes('დემო კოლექცია') }));
    await p.click('[data-testid=arrangement-exit]'); await p.waitForURL((u) => new URL(u).pathname === '/', { timeout: 30000 }); await sleep(1000);
    res.exit = await p.evaluate(() => ({ url: location.pathname, client: window.__clientNav === 'kept' }));
    const lab = res.header.lab;
    res.checks = { link: res.links.some((l) => l.inHeader && l.vis), client: res.lab.client && res.lab.workspace && res.lab.badge, exit: res.exit.url === '/', noOverlap: res.header.overlaps.length === 0, noWrap: !!lab && (!lab.lh || lab.h <= lab.lh * 1.5 + 16) };
  },
  async 'RG-23'(b, net, res) {
    const { page: p } = await L.openStudio(b, VPX[vp], id, net);
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-middle-east', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
    await L.blur(p); for (let i = 0; i < 3; i++) { await p.keyboard.press('+'); await sleep(250); }
    const sc = '[data-testid=arrangement-timeline-scroller]', lib = '[data-testid=arrangement-library-list]';
    res.styles = await p.evaluate(([sc, lib]) => Object.fromEntries([sc, lib].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); return [s, { sw: cs.scrollbarWidth, scol: cs.scrollbarColor, ow: e.scrollWidth, cw: e.clientWidth, oh: e.scrollHeight, ch: e.clientHeight, ox: cs.overflowX, oy: cs.overflowY, cls: e.className }]; })), [sc, lib]);
    await X.shot(p, `${id}-full.png`);
    const sb = await p.locator(sc).boundingBox(); const lb = await p.locator(lib).boundingBox();
    await p.screenshot({ path: `${L.SHOTS}/${id}-timeline-hscroll-crop.png`, clip: { x: sb.x + sb.width - 300, y: sb.y + sb.height - 24, width: 300, height: 24 } });
    await p.screenshot({ path: `${L.SHOTS}/${id}-timeline-vscroll-crop.png`, clip: { x: sb.x + sb.width - 24, y: sb.y, width: 24, height: Math.min(200, sb.height) } });
    await p.screenshot({ path: `${L.SHOTS}/${id}-library-crop.png`, clip: { x: lb.x + lb.width - 24, y: lb.y, width: 24, height: Math.min(260, lb.height) } });
    // pixel check on the horizontal scrollbar strip: brightest pixel luminance
    const strip = await p.screenshot({ clip: { x: sb.x, y: sb.y + sb.height - 10, width: sb.width - 10, height: 10 } }); const lstrip = await p.screenshot({ clip: { x: lb.x + lb.width - 10, y: lb.y, width: 10, height: lb.height } });
    const pix = (buf) => p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let m = 0, white = 0; const col = {}; for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; if (l > m) m = l; if (l > 200) white++; const k = `${d[i]},${d[i + 1]},${d[i + 2]}`; col[k] = (col[k] || 0) + 1; } return { max: Math.round(m), white, top: Object.entries(col).sort((a, b) => b[1] - a[1]).slice(0, 4) }; }, buf.toString('base64'));
    res.hbar = await pix(strip); res.lbar = await pix(lstrip);
    res.stripMaxLum = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let m = 0, white = 0; for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; if (l > m) m = l; if (l > 230) white++; } return { max: Math.round(m), white }; }, strip.toString('base64'));
    // wheel
    const s0 = await p.evaluate((sc) => document.querySelector(sc).scrollLeft, sc);
    await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.keyboard.down('Shift'); await p.mouse.wheel(0, 400); await p.keyboard.up('Shift'); await sleep(400);
    const s1 = await p.evaluate((sc) => document.querySelector(sc).scrollLeft, sc);
    await p.mouse.wheel(400, 0); await sleep(400); const s2 = await p.evaluate((sc) => document.querySelector(sc).scrollLeft, sc);
    await p.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2); const l0 = await p.evaluate((s) => document.querySelector(s).scrollTop, lib); await p.mouse.wheel(0, 300); await sleep(400); const l1 = await p.evaluate((s) => document.querySelector(s).scrollTop, lib);
    res.wheel = { s0, s1, s2, l0, l1 };
    const w0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width);
    await p.fill('[data-testid=arrangement-library-search]', 'slow'); await sleep(500); const w1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width);
    await p.fill('[data-testid=arrangement-library-search]', 'zzzz'); await sleep(500); const w2 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width);
    res.libW = { w0, w1, w2 };
    const st = res.styles[sc];
    res.checks = { overflowing: st.ow > st.cw, webkitStyled: [st, res.styles[lib]].every((x) => /scrollbar-button\]:hidden/.test(x.cls)) && /thumb\]:rounded-full/.test(st.cls), noWhiteRail: res.hbar.white === 0 && res.lbar.white === 0 && res.hbar.top[0][0] === '17,19,24', thumbShown: res.hbar.top.length >= 2 && res.lbar.top.length >= 2, wheelTimeline: s1 > s0 || s2 > s0, wheelLibrary: l1 > l0 || res.styles[lib].oh <= res.styles[lib].ch, libWidth: Math.abs(w1 - w0) <= 1 && Math.abs(w2 - w0) <= 1 };
    res.note = 'arrows: with scrollbar-width thin Chromium draws no arrow buttons; visual confirmation in crops';
  },
};
(async () => {
  const b = ROW === 'RG-23' ? await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--hide-scrollbars'] }) : await L.launch(); const net = []; const res = { id };
  try { await rows[ROW](b, net, res); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
