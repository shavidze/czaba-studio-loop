const L = require('./lib.cjs');
const FIELD='[data-testid=arrangement-detail-clip-gain-input]';
(async () => {
  const browser = await L.launch(); const net = [];
  const o = await L.openStudio(browser, { width: 1440, height: 900 }, 'dbg2', net);
  const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  const clips = await L.clipsDom(p);
  const id = (l) => clips.find((c) => c.lane === l).id;
  const st = async (tag) => console.log(tag, (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane).join(','), '|', await L.status(p), '| field', await p.inputValue(FIELD), '| range', await p.evaluate(()=>{const r=document.querySelector('[data-testid=arrangement-detail-clip-gain-range]');return r&&r.textContent}), '| undo', await p.evaluate(()=>[...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')).getAttribute('title')));
  await L.selectClip(p, id('stems')); await p.fill(FIELD,'-6'); await p.press(FIELD,'Enter'); await L.blur(p);
  await L.selectClip(p, id('sfx')); await p.fill(FIELD,'1'); await p.press(FIELD,'Enter'); await L.blur(p);
  await L.selectClip(p, id('stems')); await L.selectClip(p, id('sfx'), ['Shift']); await st('multi');
  const sel = process.env.SEL || '[data-track-id=music] input[aria-label^="Volume"]';
  for (const shift of [false, true]) {
    const b = await p.locator(sel).boundingBox(); const y=b.y+b.height/2; const far=b.x+0.15*b.width;
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.move(far,y); await p.mouse.down(); await L.sleep(100);
    for (let k=1;k<=5;k++){await p.mouse.move(far-4*k,y); await L.sleep(40);}
    await p.mouse.up(); if (shift) await p.keyboard.up('Shift'); await L.sleep(250);
    await st('after vol drag shift='+shift);
    await L.blur(p); await L.sleep(200); await p.keyboard.press('Control+z'); await L.sleep(300);
    await st('after undo');
  }
  await L.selectClip(p, id('music')); await st('music click');
  await browser.close();
})();
