const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(`<button id=a>a</button><div id=o role=option tabindex=0>opt</div><div id=o2 role=option tabindex=0>opt2</div>`);
  await p.click('#a');
  await p.evaluate(() => document.getElementById('a').remove());
  const r = {};
  r.plain = await p.evaluate(() => { const o=document.getElementById('o'); o.focus(); return o.matches(':focus-visible'); });
  await p.evaluate(() => document.body.focus && document.activeElement.blur());
  r.withOpt = await p.evaluate(() => { const o=document.getElementById('o2'); o.focus({focusVisible:true}); return o.matches(':focus-visible'); });
  r.version = b.version();
  console.log(JSON.stringify(r)); await b.close();
})();
