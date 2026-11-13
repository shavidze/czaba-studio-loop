// usage: node record.mjs <base> <outdir> <name>
// -> <outdir>/<name>.webm (fresh tab, 1440x900, CPU 1x, 7 s of `/` from navigation) and stills <outdir>/<name>-0500.png, -2000.png, -3200.png (page time after navigation start)
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { renameSync } from 'node:fs';
const [base, outdir, name] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: outdir, size: { width: 1440, height: 900 } } });
const p = await ctx.newPage();
await p.goto(base + '/', { waitUntil: 'commit' });
for (const at of [500, 2000, 3200]) {
  await p.waitForFunction((t) => performance.now() >= t, at, { polling: 10, timeout: 10000 });
  await p.screenshot({ path: `${outdir}/${name}-${String(at).padStart(4, '0')}.png` });
}
await p.waitForTimeout(3500);
const v = p.video();
await ctx.close();
renameSync(await v.path(), `${outdir}/${name}.webm`);
await b.close();
console.log(`${outdir}/${name}.webm`);
