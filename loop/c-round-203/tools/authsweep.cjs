// C round 203 — KEY-RING-203 spot: Tab sweep inside the AuthModal (Sign In, Sign Up, and Sign In after an empty submit). node authsweep.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
(async () => { const b = await F.launch(); const R = {};
  for (const mode of ['signin', 'signup', 'signin-err']) {
    const { ctx, page } = await F.newPage(b, W, H);
    await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(400);
    await page.locator('header button', { hasText: 'Sign In' }).first().click(); await F.sleep(1300);
    if (mode === 'signup') { await page.getByRole('button', { name: 'Sign up', exact: true }).click(); await F.sleep(900); }
    if (mode === 'signin-err') { await page.locator('form button[type=submit]').filter({ visible: true }).first().click(); await F.sleep(900); }
    await page.mouse.move(1, H - 2);
    const stops = await F.tabSweep(page, path.join(F.ROOT, 'out', 'authsweep', TAG, mode), W, H, { max: 16, label: mode });
    R[mode] = stops.filter((s) => s.f).map((s) => ({ i: s.i, tag: s.f.tag, name: s.f.name.slice(0, 30), os: s.f.os, ow: s.f.ow, oo: s.f.oo, fs: s.f.focusSource, bsF: s.f.bs.slice(0, 50), bsU: s.u && s.u.bs.slice(0, 50), contrast: s.ring && s.ring.contrast, issues: F.judge(s) }));
    await ctx.close(); }
  F.save(path.join(F.ROOT, 'out', 'authsweep', `${TAG}.json`), R);
  for (const [m, a] of Object.entries(R)) console.log(TAG, m, a.length, JSON.stringify(a.map((s) => `${s.tag}:${s.name.slice(0, 14)}:${s.os}${s.ow}/${s.oo}:${(s.issues || []).join(',')}`)));
  await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
