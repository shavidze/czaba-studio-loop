import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
for (const p of ['/studio/1','/account/downloads','/studio-lab']) { const pg = await b.newPage(); await pg.goto('http://127.0.0.1:5173'+p).catch(e=>console.log(p,e.message)); await pg.waitForTimeout(4000); await pg.close(); }
await b.close();
