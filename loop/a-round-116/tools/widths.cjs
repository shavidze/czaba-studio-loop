const L = require('./lib.cjs');
const path = require('path');
const fs = require('fs');

const tag = process.argv[2] || 'probe';
const worst = process.argv[3] === 'worst';

const measure = (p) => p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].flatMap((lane) => {
  const s = lane.querySelector('input[type=range][aria-label^="Volume"]');
  if (!s) return [];
  const r = s.nextElementSibling;
  const h = lane.querySelector('[data-testid=arrangement-track-header]');
  return [{
    track: lane.getAttribute('data-track-id'),
    sliderW: +s.getBoundingClientRect().width.toFixed(2),
    value: s.value,
    valuetext: s.getAttribute('aria-valuetext'),
    readout: r ? r.textContent : null,
    readoutTitle: r ? r.getAttribute('title') : null,
    readoutScroll: r ? r.scrollWidth : null,
    readoutClient: r ? r.clientWidth : null,
    readoutH: r ? +r.getBoundingClientRect().height.toFixed(1) : null,
    headerW: h ? +h.getBoundingClientRect().width.toFixed(2) : null,
  }];
}));

async function setWorst(p, track, mode) {
  const s = p.locator(`[data-track-id="${track}"] input[type=range][aria-label^="Volume"]`).first();
  await s.focus();
  await p.keyboard.press('Home');
  if (mode === 'finite') await p.keyboard.press('ArrowRight');
  await L.blur(p);
  await L.sleep(150);
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const result = { tag, worst, runs: [] };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const o = await L.openStudio(browser, vp, `${tag}-${vp.width}`, net);
    const p = o.page;
    await L.setSnapOff(p);
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
    await L.blur(p);
    const run = { vp: `${vp.width}x${vp.height}`, steps: [] };
    run.steps.push({ step: 'default', rows: await measure(p) });
    if (worst) {
      await setWorst(p, 'music', 'finite');
      await setWorst(p, 'stems', 'inf');
      run.steps.push({ step: 'worst', rows: await measure(p) });
    }
    await p.click(L.nameSel('stems'));
    await L.sleep(150);
    await p.keyboard.down('Shift');
    await p.click(L.nameSel('sfx'));
    await p.keyboard.up('Shift');
    await L.sleep(150);
    await p.keyboard.press('Control+g');
    await L.sleep(500);
    await L.blur(p);
    run.steps.push({ step: 'grouped', rows: await measure(p) });
    if (worst) {
      await setWorst(p, 'sfx', 'finite');
      run.steps.push({ step: 'grouped-worst', rows: await measure(p) });
    }
    fs.mkdirSync(L.SHOTS, { recursive: true });
    await p.screenshot({ path: path.join(L.SHOTS, `${tag}-${vp.width}.png`) });
    result.runs.push(run);
    await o.ctx.close();
  }
  result.net = net;
  L.save(L.OUT, `${tag}.json`, result);
  console.log(JSON.stringify(result.runs, null, 1));
  console.log(JSON.stringify(net.map((n) => ({ l: n.label, e: n.errors.length, h: n.hydration.length, f: n.forbidden.length, a: n.authHeaders.length }))));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
