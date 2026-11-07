// C339 G339-AUTH (copied from c-round-338/g338-auth.cjs)
// C327 G327-AUTH (copied from c-round-326/g326-auth.cjs, output renamed). // C326 G326-AUTH (copied from c-round-325/g325-auth.cjs, output renamed). // C325 G325-AUTH (copied from c-round-324/g324-auth.cjs, output renamed). // C324 G324-AUTH (copied from c-round-323/g323-auth.cjs, output renamed). // C323 G323-AUTH (copied from c-round-322/g322-auth.cjs). // C322 G322-AUTH (copied from c-round-321/g321-auth.cjs). C321 G321-AUTH (copied from c-round-320/g320-auth.cjs) C320 G320-AUTH (copied from c-round-319/g319-auth.cjs) C319 G319-AUTH (from c-round-318/g318-auth.cjs) (copied from c-round-314/g316-auth.cjs, output renamed)
// C313 G313-AUTH (copied from c-round-312); C312 G312-AUTH (copied from c-round-311); C311 G311-AUTH (copied from c-round-310); C309 G310-AUTH (copied from C308): fresh anonymous contexts, both viewports. Premium auth must not be bypassed.
const { chromium, request } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const BASE = 'http://127.0.0.1:5173';
(async () => { const b = await chromium.launch(); const out = { at: new Date().toISOString(), mockRunning: null, vp: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) { const k = `${w}x${h}`; const r = {};
    { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
      await p.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await p.waitForFunction(() => !!document.body && /Demo collection ready/.test(document.body.innerText), null, { timeout: 120000 });
      r.lab = await p.evaluate(() => ({ authUser: localStorage.getItem('auth_user'), workspace: !!document.querySelector('[data-testid="arrangement-transport"]'), badge: [...document.querySelectorAll('*')].some((e) => e.children.length === 0 && /Demo collection — no sign-in required/.test(e.textContent)), signIn: /Sign in required/.test(document.body.innerText) }));
      r.lab.errors = errs; await p.screenshot({ path: path.join(__dirname, 'shots', `lab-${k}.png`) }); await ctx.close(); }
    { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
      await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => !!document.body && document.body.innerText.length > 0, null, { timeout: 60000 }); await p.waitForTimeout(2500);
      r.legacy = await p.evaluate(() => ({ url: location.href, signIn: /Sign in required/.test(document.body.innerText), workspace: !!document.querySelector('[data-testid="arrangement-transport"]'), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
      r.legacy.errors = errs; await p.screenshot({ path: path.join(__dirname, 'shots', `legacy-${k}.png`) }); await ctx.close(); }
    out.vp[k] = r; }
  const api = await request.newContext(); const tok = async (url, headers) => { const res = await api.get(url, { headers, maxRedirects: 0 }); const body = await res.text(); return { status: res.status(), hasToken: /token|eyJ/i.test(body) && res.status() === 200, body: body.slice(0, 120) }; };
  out.api = { noHeader: await tok(`${BASE}/api/studio-token?product=middle-east&file=mix.wav`, {}), fakeBearer: await tok(`${BASE}/api/studio-token?product=middle-east&file=mix.wav`, { Authorization: 'Bearer fake.fake.fake' }), bare: await tok(`${BASE}/api/studio-token`, {}) };
  try { const m = await api.get('http://127.0.0.1:5199/api/products'); out.mockRunning = m.status() === 200; } catch { out.mockRunning = false; }
  const vpOk = Object.values(out.vp).every((r) => r.lab.authUser === null && r.lab.workspace && r.lab.badge && r.legacy.signIn && !r.legacy.workspace && r.legacy.audioSrc === 0);
  out.pass = vpOk && out.api.noHeader.status === 401 && [403, 500].includes(out.api.fakeBearer.status) && !out.api.fakeBearer.hasToken && !out.api.noHeader.hasToken && out.api.bare.status !== 200;
  fs.writeFileSync(path.join(__dirname, 'g341-auth.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close(); })();
