const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<div id=w><button id=x>x</button></div>');
  const r = await p.evaluate(async () => {
    const log = []; const x = document.getElementById('x');
    x.addEventListener('blur', () => log.push('blur')); x.addEventListener('focusout', () => log.push('focusout'));
    x.focus(); log.push('focused=' + (document.activeElement === x)); x.remove();
    log.push('sync active=' + document.activeElement.tagName);
    await new Promise((r) => setTimeout(r, 50)); log.push('later active=' + document.activeElement.tagName);
    return log.join(' | ');
  });
  console.log(r, '| chromium', b.version()); await b.close();
})();
