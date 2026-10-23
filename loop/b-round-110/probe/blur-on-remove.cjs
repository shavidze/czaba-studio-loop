const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<aside id="a"><button id="b">x</button></aside>');
  const r = await page.evaluate(() => {
    const log = [];
    const a = document.getElementById('a');
    a.addEventListener('focusout', (e) => log.push(['focusout', e.target.id, e.relatedTarget && e.relatedTarget.id, e.target.isConnected]));
    a.addEventListener('blur', (e) => log.push(['blur', e.target.id]), true);
    document.getElementById('b').focus();
    const before = document.activeElement.id;
    document.getElementById('b').remove();
    log.push(['afterRemove', document.activeElement === document.body]);
    return { before, log };
  });
  await new Promise((res) => setTimeout(res, 50));
  console.log(JSON.stringify({ version: browser.version(), ...r }));
  await browser.close();
})();
