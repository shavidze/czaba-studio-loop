import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const out = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const vp=`${w}x${h}`; const r = out[vp] = {};
  const open = async () => { const ctx = await b.newContext({viewport:{width:w,height:h}}); const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
    await page.waitForFunction(()=> (document.querySelector('[data-testid="arrangement-status"]')?.textContent??'').includes('Demo collection ready'),undefined,{timeout:180000});
    await page.waitForTimeout(1000);
    const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox(); const y = lb.y+lb.height*0.7;
    await page.mouse.click(lb.x+400,y); await page.waitForTimeout(300);
    await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    return {ctx,page,lb,y,clip: await page.locator('[data-clip-id]').first().boundingBox()}; };
  const drag = async (page,y,x0,x1)=>{await page.mouse.move(x0,y);await page.mouse.down();await page.mouse.move((x0+x1)/2,y,{steps:4});await page.mouse.move(x1,y,{steps:4});await page.mouse.up();await page.waitForTimeout(300);};
  const sel = (page)=>page.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(c=>({start:c.getAttribute('data-clip-start'),width:Math.round(c.getBoundingClientRect().width),selected:c.className.includes('ring-2')})));
  let {ctx,page,lb,y,clip} = await open();
  await drag(page,y,clip.x+100,clip.x-150); await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); r.A = await sel(page);
  await ctx.close();
  ({ctx,page,lb,y,clip} = await open());
  await drag(page,y,clip.x+100,clip.x+400); await page.keyboard.press('Delete'); await page.waitForTimeout(300);
  await page.mouse.click(lb.x+60,y); await page.waitForTimeout(300);
  const last = await page.locator('[data-clip-id]').last().boundingBox();
  await drag(page,y,clip.x+50,last.x+last.width+100); await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); r.G = await sel(page);
  await ctx.close();
}
writeFileSync('split-selection.json', JSON.stringify(out,null,1)); console.log(JSON.stringify(out)); await b.close();
