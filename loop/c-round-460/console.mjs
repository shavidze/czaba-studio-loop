import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [base, mode = 'fresh'] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); const msgs = [];
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) msgs.push(m.type() + ': ' + m.text().slice(0, 220).replace(/\s+/g, ' ')); });
p.on('pageerror', (e) => msgs.push('pageerror: ' + String(e).slice(0, 220)));
await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(4000);
if (mode === 'reload') { msgs.push('--- reload'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(3000); }
const hyd = msgs.filter((m) => /hydrat|did not match|Extra attributes|server HTML|Prop `/i.test(m));
console.log(JSON.stringify({ base, mode, total: msgs.length, hydration: hyd.length, hyd, msgs }, null, 1));
await b.close();
