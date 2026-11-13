import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); });
await ctx.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) }));
const p = await ctx.newPage(); p.on('response', (r) => { if (r.url().includes('/api/') && /./.test(r.url())) console.log('RESP', r.status(), r.request().method(), r.url()); }); await p.goto('http://127.0.0.1:5173/account'); await p.getByText('Full Name', { exact: true }).waitFor({ timeout: 20000 });
for (const t of [0, 500, 1500, 3000]) { await p.waitForTimeout(t); console.log(t, await p.evaluate(() => [...document.querySelectorAll('p')].filter((x) => x.textContent.includes('Full')).map((x) => JSON.stringify(x.textContent) + ' ' + x.nextElementSibling?.tagName))); }
await p.screenshot({ path: 'shots/dbg.png' }); await b.close();
