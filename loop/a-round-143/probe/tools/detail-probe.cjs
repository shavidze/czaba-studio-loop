const L = require('./lib.cjs');
const path = require('path');
const OUTD = path.join(__dirname, '..', 'out');
const SH = path.join(__dirname, '..', 'shots');
const measure = (p) => p.evaluate(() => {
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  const r = (e) => { const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
  const lines = (e) => { const lh = parseFloat(getComputedStyle(e).lineHeight) || 16; return Math.round(e.getBoundingClientRect().height / lh); };
  const out = { panel: r(panel), panelScroll: [panel.scrollHeight, panel.clientHeight], nodes: {} };
  for (const e of panel.querySelectorAll('[data-testid]')) {
    const id = e.getAttribute('data-testid');
    const visible = e.getBoundingClientRect().height > 0;
    out.nodes[id] = { box: r(e), visible, lines: visible ? lines(e) : 0, overflowX: e.scrollWidth > e.clientWidth + 1, text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
  }
  const content = panel.querySelector('[data-testid=arrangement-detail-content]');
  if (content) out.contentScroll = [content.scrollHeight, content.clientHeight, content.scrollWidth, content.clientWidth];
  out.labels = [...panel.querySelectorAll('label')].map((e) => ({ box: r(e), text: e.childNodes[0] ? e.childNodes[0].textContent.trim() : '' }));
  out.pb = r(panel);
  const clipped = [];
  for (const e of panel.querySelectorAll('input,button,p,label')) { const b = e.getBoundingClientRect(); const pr = panel.getBoundingClientRect(); if (b.height > 0 && (b.bottom > pr.bottom + 0.5 || b.right > pr.right + 0.5)) clipped.push({ tag: e.tagName, tid: e.getAttribute('data-testid'), text: (e.textContent || '').trim().slice(0, 60), bottom: +b.bottom.toFixed(1), panelBottom: +pr.bottom.toFixed(1) }); }
  out.clippedBelowPanel = clipped;
  return out;
});
(async () => {
  const b = await L.launch();
  const res = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const net = [];
    const { page: p, ctx } = await L.openStudio(b, vp, `a143-${vp.width}`, net);
    const R = (res[vp.width] = { snap: await L.setSnapOff(p) });
    const ids = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => e.getAttribute('data-source-id')));
    const tracks = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.getAttribute('data-track-id')).filter((v, i, a) => a.indexOf(v) === i));
    R.ids = ids; R.tracks = tracks;
    if (await p.getAttribute('[data-testid=arrangement-detail-panel]', 'data-collapsed') === 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(500); } R.none = await measure(p);
    await p.screenshot({ path: path.join(SH, `none-${vp.width}.png`) });
    const audio = tracks.filter((t) => t !== tracks[0]);
    R.add1 = await L.addAt(p, ids[0], audio[0], 1);
    R.add2 = await L.addAt(p, ids[1], audio[1] || audio[0], 1);
    const clips = await L.clipsDom(p);
    R.clips = clips;
    await L.selectClip(p, clips[0].id);
    R.single = await measure(p);
    await p.screenshot({ path: path.join(SH, `single-${vp.width}.png`) });
    await L.selectClip(p, clips[1].id, ['Control']);
    R.multi = await measure(p);
    await p.screenshot({ path: path.join(SH, `multi-${vp.width}.png`) });
    try {
      await L.loadVideo(p, 'clip-4s-vp9-opus.webm');
      const v = (await L.clipsDom(p)).find((c) => c.kind === 'video');
      await L.blur(p);
      await L.selectClip(p, v.id);
      R.video = await measure(p);
      await p.screenshot({ path: path.join(SH, `video-${vp.width}.png`) });
      await L.selectClip(p, clips[0].id, ['Control']);
      R.videoMulti = await measure(p);
      await p.screenshot({ path: path.join(SH, `videomulti-${vp.width}.png`) });
    } catch (e) { R.videoErr = String(e).slice(0, 300); }
    await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(500);
    R.collapsed = await p.evaluate(() => ({ toggle: document.querySelector('[data-testid=arrangement-detail-toggle]').getBoundingClientRect().toJSON(), label: document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-label'), sepText: document.querySelector('[data-testid=arrangement-detail-separator]').getAttribute('aria-valuetext') }));
    R.net = net;
    await ctx.close();
  }
  await b.close();
  L.save(OUTD, 'detail-a143.json', res);
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
