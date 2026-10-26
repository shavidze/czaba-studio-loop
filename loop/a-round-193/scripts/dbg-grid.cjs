const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.chromium.launch({ headless: true }); const net = [];
 const o = await L.openStudio(b, X.VPS[1440], 'dbg', net, {}); const p = o.page;
 const info = await p.evaluate(() => [...document.querySelectorAll('[data-grid-seconds]')].map((l) => { const r = l.getBoundingClientRect(); const cx = Math.min(r.right, innerWidth) - 80, cy = r.y + r.height / 2; const e = document.elementFromPoint(cx, cy); return { r: [r.x, r.y, r.width, r.height], hit: e && (e.dataset.testid || e.tagName + '.' + String(e.className).slice(0, 60)) }; }));
 console.log(JSON.stringify(info));
 for (let i = 0; i < info.length; i++) { const r = info[i].r; await p.mouse.click(Math.min(r[0] + r[2], 1440) - 80, r[1] + r[3] / 2, { button: 'right' }); await sleep(500); const ok = !!(await p.$('[data-testid=arrangement-grid-menu]')); console.log(i, ok); if (ok) break; }
 await b.close(); })();
