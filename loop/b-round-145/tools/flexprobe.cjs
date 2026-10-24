const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const row = (wrap, extra) => `<div style="width:110px;font:12px/16px sans-serif;display:flex;${wrap?'flex-wrap:wrap;column-gap:8px':'gap:8px'}"><span>Music</span><span>${extra}</span></div>`;
  await p.setContent(`<div id=a>${row(false,'Error: File failed to load (network)')}</div><div id=b>${row(true,'Error: File failed to load (network)')}</div><div id=c>${row(true,'01:41.352')}</div>`);
  const r = await p.evaluate(() => ['a','b','c'].map(id => { const d=document.querySelector('#'+id+' > div'); const s=d.children[1].getBoundingClientRect(); return {id, rowH:d.getBoundingClientRect().height, spanX:s.x, spanY:s.y-d.getBoundingClientRect().y, spanW:s.width}; }));
  console.log(JSON.stringify(r)); await b.close();
})();
