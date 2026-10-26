const path = require('path');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/@playwright/test'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(`<div id=sc style="height:300px;overflow:auto;position:relative"><div style="height:700px;position:relative"><div style="position:sticky;top:0;height:84px;background:#888;z-index:3"></div><div style="height:100px"></div><div id=row style="position:relative"><div style="position:sticky;left:0;width:200px"><button id=btn>x</button></div></div></div></div>`);
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((r) => setTimeout(r, ms));
    const sc = document.getElementById('sc'); const btn = document.getElementById('btn'); const res = {};
    const t = async (k, fn) => { sc.scrollTop = 150; await w(50); res[k + '_before_top'] = btn.getBoundingClientRect().top - sc.getBoundingClientRect().top; btn.blur(); fn(); await w(100); res[k] = sc.scrollTop; btn.style.scrollMarginTop = ''; sc.style.scrollPaddingTop = ''; };
    await t('none', () => btn.focus());
    await t('margin', () => { btn.style.scrollMarginTop = '84px'; btn.focus(); });
    await t('marginSIV', () => { btn.style.scrollMarginTop = '84px'; btn.scrollIntoView({ block: 'nearest' }); });
    await t('padding', () => { sc.style.scrollPaddingTop = '84px'; btn.focus(); });
    return res;
  });
  console.log(b.version(), JSON.stringify(r)); await b.close();
})();
