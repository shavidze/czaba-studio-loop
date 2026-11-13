// B428 G428-AUTH: copied from c-round-390/tools/g390-auth.cjs (D-29z1502). The legacy route is read in a settled state: samples at 0.5/3/10 s (workspace and audio[src] recorded on each), then Sign in required or 10 s. Usage: OUT=<abs dir> [BASE=...] node g428-auth.cjs
const { chromium, request } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required'); fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
(async () => { const b = await chromium.launch(); const out = { at: new Date().toISOString(), mockRunning: null, vp: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) { const k = `${w}x${h}`; const r = {};
    { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
      await p.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await p.waitForFunction(() => !!document.body && /Demo collection ready/.test(document.body.innerText), null, { timeout: 120000 });
      r.lab = await p.evaluate(() => ({ authUser: localStorage.getItem('auth_user'), workspace: !!document.querySelector('[data-testid="arrangement-transport"]'), badge: [...document.querySelectorAll('*')].some((e) => e.children.length === 0 && /Demo collection — no sign-in required/.test(e.textContent)), signIn: /Sign in required/.test(document.body.innerText) }));
      r.lab.errors = errs; await p.screenshot({ path: path.join(OUT, 'shots', `lab-${k}.png`) }); await ctx.close(); }
    { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
      await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' }); const t0 = Date.now(); const read = () => p.evaluate(() => ({ url: location.href, signIn: /Sign in required/.test(document.body?.innerText ?? ''), workspace: !!document.querySelector('[data-testid="arrangement-transport"]'), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
      r.samples = []; for (const at of [500, 3000, 10000]) { const wait = at - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait); r.samples.push({ at, ...(await read()) }); }
      await p.waitForFunction(() => /Sign in required/.test(document.body?.innerText ?? ''), null, { timeout: 10000 }).catch(() => {});
      r.legacy = await read(); r.legacy.settledAfterMs = Date.now() - t0;
      r.legacy.errors = errs; await p.screenshot({ path: path.join(OUT, 'shots', `legacy-${k}.png`) }); await ctx.close(); }
    out.vp[k] = r; }
  const api = await request.newContext(); const tok = async (url, headers) => { const res = await api.get(url, { headers, maxRedirects: 0 }); const body = await res.text(); return { status: res.status(), hasToken: /token|eyJ/i.test(body) && res.status() === 200, body: body.slice(0, 120) }; };
  out.api = { noHeader: await tok(`${BASE}/api/studio-token?product=middle-east&file=mix.wav`, {}), fakeBearer: await tok(`${BASE}/api/studio-token?product=middle-east&file=mix.wav`, { Authorization: 'Bearer fake.fake.fake' }), bare: await tok(`${BASE}/api/studio-token`, {}) };
  try { const m = await api.get('http://127.0.0.1:5199/api/products'); out.mockRunning = m.status() === 200; } catch { out.mockRunning = false; }
  const vpOk = Object.values(out.vp).every((r) => r.lab.authUser === null && r.lab.workspace && r.lab.badge && r.legacy.signIn && !r.legacy.workspace && r.legacy.audioSrc === 0 && r.samples.every((s) => !s.workspace && s.audioSrc === 0));
  out.pass = vpOk && out.api.noHeader.status === 401 && [403, 500].includes(out.api.fakeBearer.status) && !out.api.fakeBearer.hasToken && !out.api.noHeader.hasToken && out.api.bare.status !== 200;
  fs.writeFileSync(path.join(OUT, 'g428-auth.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close(); })();
