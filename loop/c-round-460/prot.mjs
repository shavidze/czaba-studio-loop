import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const vp of [{width:1440,height:900},{width:1280,height:720},{width:1440,height:900}]) {
  const c = await b.newContext({ viewport: vp }); const p = await c.newPage(); const media = [];
  p.on('response', r => { const t = r.headers()['content-type'] || ''; if (/audio|video/.test(t)) media.push(r.url()); });
  await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load' });
  await p.waitForTimeout(3500);
  console.log(vp.width, JSON.stringify({ url: p.url(), text: (await p.evaluate(() => document.body.innerText)).slice(0, 110), audioEls: await p.locator('audio[src], video[src], source[src]').count(), media: media.length }));
  if (vp.width === 1440) await p.screenshot({ path: 'shots/prot-1440.png' });
  await c.close();
}
await b.close();
