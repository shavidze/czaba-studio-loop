// C round 96: Undo history unchanged by failed-source refusals (Enter, dblclick, ArrowUp preview path); fresh incognito
const X = require('./ext.cjs'); const { sleep } = X;
(async () => { const W = +process.argv[2]; const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
 const b = await X.launch(); const { page: p, S } = await X.newCtx(b, vp, 'undo' + W); const R = { vp: W };
 await p.route(/\/middle-east\.mp3(\?|$)/, (r) => r.abort());
 await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
 R.status = await X.waitStatus(p, (s) => /ვერ ჩაიტვირთა/.test(s || ''), 120000); await X.decline(p);
 const undo = () => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? { t: b.textContent.trim(), title: b.getAttribute('title') || b.getAttribute('aria-label'), dis: b.disabled } : null; });
 const row = (id) => p.locator(`[role=option][data-source-id="${id}"]`);
 R.u0 = await undo(); await row('demo-middle-east').click(); await sleep(300); await p.keyboard.press('Enter'); await sleep(800); R.u1 = await undo(); R.s1 = await X.status(p);
 await row('demo-hero-music').click(); await sleep(300); await p.keyboard.press('Enter'); await sleep(800); R.u2 = await undo();
 await row('demo-middle-east').dblclick(); await sleep(800); R.u3 = await undo(); R.s3 = await X.status(p);
 await row('demo-hero-music').click(); await sleep(300); await p.locator('[data-testid=arrangement-library-preview-toggle]').click(); await sleep(800);
 await row('demo-hero-music').click(); await sleep(300); await p.keyboard.press('ArrowUp'); await sleep(800); R.u4 = await undo(); R.s4 = await X.status(p);
 R.checks = { enterNoUndo: JSON.stringify(R.u0) === JSON.stringify(R.u1) && R.u0.dis === true, dblNoUndo: JSON.stringify(R.u2) === JSON.stringify(R.u3) && R.u2.dis === false, previewNoUndo: JSON.stringify(R.u3) === JSON.stringify(R.u4) };
 R.errors = S.errors; R.forbidden = S.forbidden; R.pass = Object.values(R.checks).every(Boolean);
 X.save(`undo-${W}.json`, R); console.log(JSON.stringify(R)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
