const X = require('./lib122.cjs'); const { L, sleep } = X; const vp = process.argv[2];
(async () => { const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--hide-scrollbars'] }); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[vp], `RG-23-crop-${vp}`, net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-middle-east', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  await L.blur(p); for (let i = 0; i < 3; i++) { await p.keyboard.press('+'); await sleep(250); }
  const sc = '[data-testid=arrangement-timeline-scroller]';
  console.log(await p.evaluate((sc) => document.querySelector(sc).className, sc));
  const sb = await p.locator(sc).boundingBox(); const lb = await p.locator('[data-testid=arrangement-library-list]').boundingBox();
  await p.mouse.move(sb.x + 400, sb.y + sb.height - 4); await sleep(300);
  await p.screenshot({ path: `${L.SHOTS}/RG-23-${vp}-shown-hbar-full.png`, clip: { x: sb.x, y: sb.y + sb.height - 16, width: sb.width, height: 16 } });
  await p.screenshot({ path: `${L.SHOTS}/RG-23-${vp}-shown-hbar-left.png`, clip: { x: sb.x + 200, y: sb.y + sb.height - 16, width: 260, height: 16 } });
  await p.screenshot({ path: `${L.SHOTS}/RG-23-${vp}-shown-lib-bar.png`, clip: { x: lb.x + lb.width - 16, y: lb.y, width: 16, height: lb.height } });
  // pixel stats of the bars
  const stat = async (clip) => { const buf = await p.screenshot({ clip }); return p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; const hist = {}; for (let i = 0; i < d.length; i += 4) { const k = `${d[i]},${d[i + 1]},${d[i + 2]}`; hist[k] = (hist[k] || 0) + 1; } return Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 6); }, buf.toString('base64')); };
  console.log('hbar', JSON.stringify(await stat({ x: sb.x + 200, y: sb.y + sb.height - 10, width: 600, height: 10 })));
  console.log('libbar', JSON.stringify(await stat({ x: lb.x + lb.width - 10, y: lb.y, width: 10, height: lb.height })));
  console.log(JSON.stringify(X.netOk(net))); await b.close(); })();
