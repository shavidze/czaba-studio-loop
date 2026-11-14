import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage();
for (let i = 0; i < 2; i++) { try { await p.goto((process.env.BASE) + '/support', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(5000); console.log('live', await p.locator('button').filter({ hasText: 'Live Chat' }).count()); } catch (e) { console.log('err', e.message.slice(0, 80)); } }
await b.close();
