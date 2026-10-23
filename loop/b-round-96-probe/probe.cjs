const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setContent(`<button id="a">A</button><button id="b">B</button><script>
    window.log=[];
    for (const id of ['a','b']) { const el=document.getElementById(id);
      el.addEventListener('keydown', e=>log.push(id+':keydown:'+e.key+':repeat='+e.repeat));
      el.addEventListener('click', ()=>{ log.push(id+':click'); if(id==='a'){ el.remove(); document.getElementById('b').focus(); } }); }
    window.guard=false;
    document.getElementById('b').addEventListener('keydown', e=>{ if(window.guard && e.key==='Enter' && e.repeat) e.preventDefault(); });
  </script>`);
  const out = {};
  // Playwright keyboard.down twice
  await page.focus('#a');
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  out.playwrightDownTwice = await page.evaluate(() => log.splice(0));
  // CDP autoRepeat
  await page.setContent('<button id="b">B</button><script>window.log=[];const b=document.getElementById("b");b.addEventListener("keydown",e=>{log.push("keydown repeat="+e.repeat); if(window.guard&&e.key==="Enter"&&e.repeat)e.preventDefault();});b.addEventListener("click",()=>log.push("click"));</script>');
  const cdp = await ctx.newCDPSession(page);
  const send = (autoRepeat) => cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r', autoRepeat });
  await page.focus('#b');
  await send(true);
  out.cdpAutoRepeatNoGuard = await page.evaluate(() => log.splice(0));
  await page.evaluate(() => { window.guard = true; });
  await send(true);
  out.cdpAutoRepeatGuard = await page.evaluate(() => log.splice(0));
  await send(false);
  out.cdpFreshGuard = await page.evaluate(() => log.splice(0));
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
