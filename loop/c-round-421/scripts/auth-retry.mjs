import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const b = await chromium.launch(); const res = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'domcontentloaded' });
  await p.getByText(/Sign in required/i).first().waitFor({ timeout: 30000 }).catch(()=>{});
  res[w+'x'+h] = { authUser: await p.evaluate(()=>localStorage.getItem('auth_user')), signIn: await p.getByText(/Sign in required/i).count(), audioSrc: await p.locator('audio[src]').count(), url: p.url() };
  await p.screenshot({ path: `${out}/protected-retry-${w}x${h}.png` }); await c.close();
}
await b.close(); console.log(JSON.stringify(res));
