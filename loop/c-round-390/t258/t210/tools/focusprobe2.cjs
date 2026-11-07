const L = require('./c210lib.cjs'); const path=require('path');
(async () => { const br = await L.launch(); const out={};
 for (const [vw,vh] of [[1440,900],[1280,720]]) { const { ctx, page } = await L.openLab(br, 'http://127.0.0.1:5173', vw, vh); const gv = await L.makeGroup(page); await L.blurActive(page);
  const res=[];
  for (const [name,loc] of [['Pan — Music',L.sl(page,'Pan — Music')],['Master Volume',L.sl(page,'Master Volume')],['group',gv],['Volume — Music',L.sl(page,'Volume — Music')]]) {
   await loc.scrollIntoViewIfNeeded(); const b=await loc.boundingBox(); const clip={x:Math.max(0,b.x-20),y:Math.max(0,b.y-10),width:b.width+40,height:b.height+20};
   await loc.click({position:{x:b.width/2,y:b.height/2}}); await L.quiet(page); await page.keyboard.press('Shift+Tab'); await L.sleep(150); await page.keyboard.press('Tab'); await L.sleep(300);
   const a = await page.evaluate(() => { const e=document.activeElement; const cs=getComputedStyle(e); return { label: e.getAttribute('aria-label'), fv: e.matches(':focus-visible'), outline: cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor, offset: cs.outlineOffset }; });
   a.target=name; const f=path.join(L.SHOTS,`focus-kb-${vw}-${name.replace(/\W+/g,'_')}.png`); await page.mouse.move(2,2); await L.sleep(100); await page.screenshot({path:f,clip}); a.shot=path.basename(f);
   await L.blurActive(page); await L.sleep(200); await page.screenshot({path:f.replace('.png','-rest.png'),clip}); res.push(a); }
  out[vw]=res; await ctx.close(); }
 L.save('focus-kb.json', out); console.log(JSON.stringify(out)); await br.close(); })();
