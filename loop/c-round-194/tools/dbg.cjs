const L = require('./lib.cjs');
(async () => { const b = await L.chromium.launch({ headless: true }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} }); const p = await ctx.newPage();
for (const u of ['/free-downloads', '/support', '/']) { await p.goto('http://127.0.0.1:5173' + u, { waitUntil: 'load' }); await L.sleep(5000);
  console.log(u, JSON.stringify(await p.evaluate(() => ({ btns: [...document.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.innerText.trim().slice(0, 25) + '|' + (x.getAttribute('aria-label') || '') + '|' + (x.closest('header') ? 'H' : '')).slice(0, 40), inputs: [...document.querySelectorAll('input,textarea')].map((i) => i.id + '|' + i.type + '|' + i.placeholder + '|' + i.getBoundingClientRect().width) }))));
}
await b.close(); })();
