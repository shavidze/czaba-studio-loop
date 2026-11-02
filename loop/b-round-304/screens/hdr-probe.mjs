import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await p.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
console.log(await p.getByTestId('arrangement-track-header').evaluateAll((hs) => hs.map((h) => h.innerText.replace(/\s+/g, ' ').slice(0, 120))));
console.log(await p.getByText(/Active track/).count(), await p.getByTestId('arrangement-status').textContent());
await b.close();
