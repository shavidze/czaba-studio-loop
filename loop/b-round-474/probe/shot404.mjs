import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [base, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
await p.goto(base + '/no-such-page-xyz', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
await p.screenshot({ path: out });
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.x < 745 && r.right > 694 && r.y < 878 && r.bottom > 360 && getComputedStyle(e).animationName !== 'none'; }).map((e) => (e.className && e.className.baseVal === undefined ? e.className : e.tagName) + ':' + getComputedStyle(e).animationName))));
await b.close();
