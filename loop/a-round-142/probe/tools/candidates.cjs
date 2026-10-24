const L = require('./lib.cjs');
const path = require('path');
const CANDIDATES = [
  'A video clip has no Clip Gain — for its sound use the track Volume/Mute',
  'Video clips have no Clip Gain — use the track Volume/Mute',
  'A video clip has no Clip Gain — use the track Volume/Mute',
  'No Clip Gain on video — for its sound use the track Volume/Mute',
  'ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute',
];
(async () => {
  const b = await L.launch();
  const res = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const { page: p, ctx } = await L.openStudio(b, vp, `a142cand-${vp.width}`, []);
    await L.sleep(800);
    await L.setSnapOff(p);
    if (await p.getAttribute('[data-testid=arrangement-detail-panel]', 'data-collapsed') === 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(500); }
    await L.loadVideo(p, 'clip-4s-vp9-opus.webm');
    const v = (await L.clipsDom(p)).find((c) => c.kind === 'video');
    await L.blur(p); await L.selectClip(p, v.id);
    res[vp.width] = [];
    for (const text of CANDIDATES) {
      res[vp.width].push(await p.evaluate((t) => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-reason]'); r.textContent = t; const lh = parseFloat(getComputedStyle(r).lineHeight) || 16; const bx = r.getBoundingClientRect(); return { text: t, lines: Math.round(bx.height / lh), width: +bx.width.toFixed(1), maxWidth: +r.parentElement.getBoundingClientRect().width.toFixed(1) }; }, text));
    }
    await ctx.close();
  }
  await b.close();
  L.save(path.join(__dirname, '..', 'out'), 'video-reason-candidates-a142.json', res);
  for (const [vp, list] of Object.entries(res)) for (const r of list) console.log(vp, r.lines, r.width, '/', r.maxWidth, r.text);
})().catch((e) => { console.error(e); process.exit(1); });
