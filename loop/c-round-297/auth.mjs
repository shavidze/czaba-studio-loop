import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:5173'; const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-297';
const b = await chromium.launch(); const a = { errors: [] };
const body = (p) => p.waitForFunction(() => document.body && document.body.innerText.length > 20, undefined, { timeout: 60000 });
{ const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(3000); await ctx.close(); }
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); a.cookies0 = (await ctx.cookies()).length;
  const p = await ctx.newPage(); p.on('pageerror', (e) => a.errors.push('lab: ' + String(e).slice(0, 200)));
  await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  a.lab = await p.evaluate(() => ({ url: location.href, authUser: localStorage.getItem('auth_user'), keys: Object.keys(localStorage),
    badge: [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /demo/i.test(e.textContent) && e.getClientRects().length).map((e) => e.textContent.trim()).slice(0, 4),
    workspace: !!document.querySelector('[data-testid="arrangement-library-list"]'), signIn: document.body.innerText.includes('Sign in required') }));
  await p.screenshot({ path: `${DIR}/shots/auth-lab-1440.png` }); await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => a.errors.push('legacy: ' + String(e).slice(0, 200)));
  await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle' }); await body(p); await p.waitForTimeout(3000);
  a.legacy = await p.evaluate(() => ({ url: location.href, signIn: document.body.innerText.includes('Sign in required'), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
  await p.screenshot({ path: `${DIR}/shots/auth-legacy-1440.png` });
  a.token = await p.evaluate(async () => { const x = await fetch('/api/studio-token?product=middle-east&file=stem-01.wav'); const t = await x.text(); return { status: x.status, hasToken: /token"\s*:\s*"[A-Za-z0-9._-]{10,}/.test(t), body: t.slice(0, 200) }; });
  await ctx.close();
}
await b.close(); fs.writeFileSync(`${DIR}/auth.json`, JSON.stringify(a, null, 1)); console.log(JSON.stringify(a, null, 1));
