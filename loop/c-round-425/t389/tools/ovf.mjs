import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const out={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000}); await p.waitForTimeout(800);
  await p.getByTestId('arrangement-track-header').filter({hasText:/Stems/}).first().getByText(/^Stems/).first().click();
  await p.getByRole('button',{name:'All'}).first().click().catch(()=>{});
  await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Pulse/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  await p.getByRole('button',{name:/Fold or unfold — Stems/}).first().click(); await p.waitForTimeout(400);
  const bars = () => p.getByTestId('arrangement-overview').evaluate(e=>[...e.querySelectorAll('*')].filter(x=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>1&&r.height<30&&x.children.length===0;}).map(x=>{const r=x.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width)]}));
  const o={folded: await p.getByRole('button',{name:/Fold or unfold — Stems/}).first().getAttribute('aria-expanded'), clipsDom: await p.locator('[data-clip-id]').count(), before: await bars()};
  // move via keyboard: select clip in overview? use ArrowRight on selected clip
  await p.keyboard.press('Escape'); 
  const c = p.locator('[data-clip-id]').first(); 
  o.clipVisible = await c.isVisible().catch(()=>false);
  await p.getByRole('button',{name:/Fold or unfold — Stems/}).first().click(); await p.waitForTimeout(300);
  const cl = p.locator('[data-clip-id]').first(); const bb = await cl.boundingBox(); await p.mouse.move(bb.x+30,bb.y+8); await p.mouse.down(); await p.mouse.move(bb.x+230,bb.y+8,{steps:6}); await p.mouse.up(); await p.waitForTimeout(300);
  await p.getByRole('button',{name:/Fold or unfold — Stems/}).first().click(); await p.waitForTimeout(400);
  o.afterMoveFolded = await bars(); out[`${w}x${h}`]=o; }
console.log(JSON.stringify(out)); await b.close();
