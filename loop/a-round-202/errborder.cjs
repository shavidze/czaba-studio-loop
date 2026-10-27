const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' }).catch(() => {});
  const r = await p.evaluate(() => {
    const d = document.createElement('div'); d.innerHTML = '<input id="t" class="border-2 border-outline-strong border-destructive">'; document.body.appendChild(d);
    const e = document.getElementById('t'); const cs = getComputedStyle(e);
    const probe = document.createElement('input'); probe.className = 'border-2 border-destructive'; document.body.appendChild(probe);
    const probe2 = document.createElement('input'); probe2.className = 'border-2 border-outline-strong'; document.body.appendChild(probe2);
    return { both: cs.borderTopColor, destructive: getComputedStyle(probe).borderTopColor, outlineStrong: getComputedStyle(probe2).borderTopColor };
  });
  console.log(JSON.stringify(r)); await b.close();
})();
