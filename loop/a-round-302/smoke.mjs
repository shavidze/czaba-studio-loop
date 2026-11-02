import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const out = process.argv[2];
const b = await chromium.launch();
const res = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.getByText('Demo collection ready', { exact: false }).first().waitFor({ state: 'attached', timeout: 60000 });
  const h1 = p.locator('header h1').first();
  res[`studio-${w}`] = { title: await p.title(), h1: await h1.textContent(), h1Children: await h1.evaluate(e => e.children.length), badge: (await p.getByText('Demo collection — no sign-in required').count()) };
  await p.screenshot({ path: `${out}/a-smoke-studio-${w}.png` });
  await p.goto('http://127.0.0.1:5173/checkout/success', { waitUntil: 'domcontentloaded' });
  res[`checkout-${w}`] = await p.getByText('Access CZABA Studio anytime').count();
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1));
await b.close();
