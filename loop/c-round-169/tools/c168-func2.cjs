// C round 168 — FUNC-SMOKE-V3C4B supplement: full import button in S0 (unfolded, no group) + name multi-selection via the selected suffix / bg-brand/20. node c168-func2.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); const SHD = path.join(L.ROOT, 'shots', 'func');
const hdr = (t) => `[data-track-id=${t}] [data-testid=arrangement-track-header]`; const NAME = (t) => `${hdr(t)} button[aria-pressed]:not([title])`;
const centreClick = async (p, s, mods = []) => { const bb = await p.locator(s).first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s }); await p.mouse.move(x, y); for (const m of mods) await p.keyboard.down(m); await p.mouse.down(); await p.mouse.up(); for (const m of mods) await p.keyboard.up(m); await sleep(350); return hit; };
const nameState = (p, t) => p.evaluate((s) => { const e = document.querySelector(s); return { pressed: e.getAttribute('aria-pressed'), label: e.getAttribute('aria-label'), selFill: e.classList.contains('bg-brand/20'), radius: getComputedStyle(e).borderTopLeftRadius }; }, NAME(t));
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c168func2-${W}-${ATT}`, net);
  res.fonts = log.fontsReady && log.fontsReady.ok;
  const n = res.name = {};
  n.hit1 = await centreClick(p, NAME('music')); n.music1 = await nameState(p, 'music');
  n.hit2 = await centreClick(p, NAME('sfx'), ['Control']); n.music2 = await nameState(p, 'music'); n.sfx2 = await nameState(p, 'sfx');
  await p.mouse.move(2, 2); await sleep(300);
  { const bb = await p.locator(hdr('music')).boundingBox(); const bb2 = await p.locator(hdr('sfx')).boundingBox(); await p.screenshot({ path: path.join(SHD, `func2-${W}-${ATT}-names-selected.png`), clip: { x: bb.x, y: Math.min(bb.y, bb2.y), width: bb.width, height: Math.max(bb.y + bb.height, bb2.y + bb2.height) - Math.min(bb.y, bb2.y) } }); }
  await p.keyboard.press('Escape'); await L.blur(p); await sleep(200);
  const v = res.video = {}; const VIMP = '[data-track-id=video] [data-testid=arrangement-track-header] button:has(svg.lucide-plus)';
  v.fullText = (await p.textContent(VIMP)).trim(); v.box = await p.locator(VIMP).first().boundingBox();
  { const bb = v.box; const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; v.hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s: VIMP });
    const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null), p.mouse.click(x, y)]); v.chooser = !!fc;
    if (fc) await fc.setFiles(L.MEDIA + 'clip-4s-vp9-opus.webm'); }
  await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 }).catch(() => {}); await sleep(2500);
  v.clips = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => ({ lane: e.closest('[data-track-id]').dataset.trackId, start: e.getAttribute('data-clip-start'), w: e.getBoundingClientRect().width })));
  v.dock = await p.evaluate(() => [...document.querySelectorAll('video')].map((e) => ({ role: e.dataset.videoRole, rs: e.readyState, vw: e.videoWidth, vh: e.videoHeight })));
  v.status = await L.status(p);
  await p.screenshot({ path: path.join(SHD, `func2-${W}-${ATT}-video-full-import.png`) });
  await ctx.close();
  res.net = X.netOk(net); res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func2-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
