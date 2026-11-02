import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/checkout/success', { waitUntil: 'networkidle' }).catch(e=>console.log('goto',e.message));
await p.waitForTimeout(3000);
console.log(JSON.stringify({ url: p.url(), count: await p.getByText('Access CZABA Studio anytime').count(), old: await p.getByText(/Personal Mixdown/).count(), body: (await p.locator('body').innerText()).slice(0, 600) }));
await p.screenshot({ path: '/home/runner/czaba-project/store/../tmp/studio-real-loop/a-round-302/a-smoke-checkout-1440.png' }); await b.close();
