const L = require('./c210lib.cjs'); const path=require('path');
(async () => { const br = await L.launch(); const out={};
 for (const [vw,vh] of [[1440,900],[1280,720]]) { const { ctx, page } = await L.openLab(br, 'http://127.0.0.1:5173', vw, vh); const gv = await L.makeGroup(page); await L.blurActive(page);
  const res=[];
  await L.sl(page,'Volume — Music').focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  for (let i=0;i<60;i++) { const a = await page.evaluate(() => { const e=document.activeElement; const cs=getComputedStyle(e); return { label: e.getAttribute('aria-label'), type: e.type||e.tagName, fv: e.matches(':focus-visible'), outline: cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor, shadow: cs.boxShadow }; });
   if (/^(Pan — Music|Master Volume|Volume — Group 1 \(group\)|Volume — Music)$/.test(a.label||'')) { const loc=page.getByRole('slider',{name:a.label,exact:true}); const b=await loc.boundingBox(); const clip={x:Math.max(0,b.x-20),y:Math.max(0,b.y-10),width:b.width+40,height:b.height+20}; const f=path.join(L.SHOTS,`focus-tab-${vw}-${a.label.replace(/\W+/g,'_')}.png`); await page.screenshot({path:f,clip}); await L.blurActive(page); await page.mouse.move(2,2); await L.sleep(200); await page.screenshot({path:f.replace('.png','-rest.png'),clip}); await loc.focus(); a.shot=path.basename(f); res.push(a); }
   if (res.length>=4) break; await page.keyboard.press(i<30?'Shift+Tab':'Tab'); }
  out[vw]=res; await ctx.close(); }
 L.save('focus-tab.json', out); console.log(JSON.stringify(out,null,1)); await br.close(); })();
