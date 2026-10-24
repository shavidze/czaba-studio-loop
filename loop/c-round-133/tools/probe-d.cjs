const X = require('./lib122.cjs'); const { L, sleep } = X; const H = require('./h3.cjs');
(async () => { const b = await L.launch(); const net = []; const W = +process.argv[2] || 1440;
 const { page: P } = await L.openStudio(b, X.VPS[W], 'probe-d', net); await L.setSnapOff(P);
 await L.addAt(P, 'demo-synth-mix', 'music', 2); await L.addAt(P, 'demo-stem-bass', 'stems', 2);
 const sel = async () => (await L.clipsDom(P)).map((c) => `${c.lane}@${c.start}${c.sel ? '*' : ''}`).join(' ');
 const cs = await L.clipsDom(P); const m = cs.find((c) => c.lane === 'music'), s = cs.find((c) => c.lane === 'stems');
 console.log('0', await sel());
 const q = await H.laneBgPoint(P, 'sfx', 40); await P.mouse.click(q.x, q.y); await sleep(300); console.log('bg', await sel());
 await L.selectClip(P, m.id); console.log('m', await sel());
 const hb = await P.locator(`[data-clip-id="${s.id}"] > div`).first().boundingBox(); console.log('stems hdr', JSON.stringify(hb));
 await L.selectClip(P, s.id, ['Control']); console.log('ctrl s', await sel(), await L.status(P));
 await L.selectClip(P, s.id, ['Shift']); console.log('shift s', await sel(), await L.status(P));
 const xs = []; for (let i = 0; i < 24; i++) { await L.blur(P); await P.keyboard.press('ArrowLeft'); await sleep(200); xs.push(await L.status(P)); }
 console.log(await sel()); console.log(JSON.stringify(xs.slice(-6)));
 console.log(JSON.stringify(X.netOk(net))); await b.close(); })();
