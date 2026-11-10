import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const all={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000});
  await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Middle East/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  const c = p.locator('[data-clip-id]').first(); const bb = await c.boundingBox();
  await p.mouse.move(bb.x+200,bb.y+bb.height-6); await p.mouse.down(); await p.mouse.move(bb.x+400,bb.y+bb.height-6,{steps:8}); await p.mouse.up(); await p.waitForTimeout(300);
  await p.getByRole('button',{name:/^Loop/}).first().click(); await p.waitForTimeout(400);
  const st = () => p.getByTestId('arrangement-status').innerText();
  const o = {s0: await st()};
  const sb = await p.getByTestId('arrangement-loop-start-edge').boundingBox(); const eb = await p.getByTestId('arrangement-loop-end-edge').boundingBox(); o.sb=sb; o.eb=eb;
  await p.mouse.move(sb.x+sb.width/2, sb.y+sb.height/2); await p.mouse.down(); await p.mouse.move(sb.x+sb.width/2-50, sb.y+sb.height/2,{steps:6}); await p.mouse.up(); await p.waitForTimeout(300); o.s1 = await st();
  const eb2 = await p.getByTestId('arrangement-loop-end-edge').boundingBox();
  await p.mouse.move(eb2.x+eb2.width/2, eb2.y+eb2.height/2); await p.mouse.down(); await p.mouse.move(eb2.x+eb2.width/2+75, eb2.y+eb2.height/2,{steps:6}); await p.mouse.up(); await p.waitForTimeout(300); o.s2 = await st();
  o.pressed = await p.getByRole('button',{name:/^Loop/}).first().getAttribute('aria-pressed'); o.errs=errs; all[`${w}x${h}`]=o;
  await p.screenshot({path:`brace-${w}.png`});
}
await b.close(); writeFileSync('brace.json',JSON.stringify(all,null,1)); console.log(JSON.stringify(all).slice(0,2500));
