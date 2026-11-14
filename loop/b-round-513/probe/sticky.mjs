import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); });
const p = await ctx.newPage(); await p.route(/googletagmanager|google-analytics/, (r) => r.abort());
await p.goto(process.argv[2] + '/', { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(2500);
const r = await p.evaluate(async () => {
  const h = document.querySelector('header'); const chain = [];
  for (let e = h.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); chain.push(`${e.tagName}.${(e.className||'').toString().slice(0,60)} ov=${cs.overflow}/${cs.overflowX}/${cs.overflowY} h=${Math.round(e.getBoundingClientRect().height)}`); }
  window.scrollTo(0, 1500); await new Promise((res) => setTimeout(res, 800));
  return { pos: getComputedStyle(h).position, top: h.getBoundingClientRect().top, scrollY, chain };
});
console.log(JSON.stringify(r, null, 1)); await b.close();
