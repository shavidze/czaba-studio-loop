import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
for (const p of ['/','/cart','/recordings/1','/studio-lab']) { const pg = await b.newPage(); await pg.goto('http://127.0.0.1:5173'+p,{waitUntil:'load'}).catch(e=>console.log(p,e.message)); await pg.waitForTimeout(3000); console.log(p, await pg.title()); await pg.close(); }
await b.close();
