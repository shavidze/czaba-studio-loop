const L = require('./lib.cjs');
const path = require('path');
const GEO = {
  'Select a clip first': 'ჯერ აირჩიე კლიპი',
  'Select a clip to see its details': 'აირჩიე კლიპი, რომ დეტალები ნახო',
  'The source file stays unchanged': 'წყარო უცვლელი რჩება',
  'The selected clips move together · Delete deletes them · Ctrl+D duplicates them': 'ჯგუფი ერთად გადაადგილდება · Delete შლის · Ctrl+D აორმაგებს',
  'A time selection is set on one clip — select only one': 'range ერთ კლიპზე ისმება — აირჩიე ერთი',
  'A video clip has no Clip Gain — for its sound use the track Volume/Mute': 'ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute',
  'Clip Gain works on audio clips only — remove the video from the selection': 'Clip Gain მხოლოდ აუდიო კლიპებზე ისმება — ამოიღე ვიდეო მონიშვნიდან',
  'Video clip · no waveform': 'ვიდეოკლიპი · ტალღა არ ჩანს',
};
const measure = (p) => p.evaluate(() => {
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  const pr = panel.getBoundingClientRect();
  const clipped = [];
  for (const e of panel.querySelectorAll('input,button,p,label')) { const b = e.getBoundingClientRect(); if (b.height > 0 && b.bottom > pr.bottom + 0.5) clipped.push(`${(e.textContent || '').trim().slice(0, 40)} @${b.bottom.toFixed(1)}>${pr.bottom.toFixed(1)}`); }
  const c = panel.querySelector('[data-testid=arrangement-detail-content]');
  const r = panel.querySelector('[data-testid=arrangement-detail-clip-gain-reason]');
  return { clipped, contentScroll: c ? [c.scrollHeight, c.clientHeight] : null, cgReason: r ? [Math.round(r.getBoundingClientRect().height), r.textContent.slice(0, 30)] : null };
});
const swap = (p, map) => p.evaluate((m) => { const panel = document.querySelector('[data-testid=arrangement-detail-panel]'); for (const e of panel.querySelectorAll('p')) { const t = (e.textContent || '').trim(); if (m[t]) e.textContent = m[t]; } }, map);
(async () => {
  const b = await L.launch();
  const res = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const { page: p, ctx } = await L.openStudio(b, vp, `a142swap-${vp.width}`, []);
    await L.sleep(800);
    await L.setSnapOff(p);
    if (await p.getAttribute('[data-testid=arrangement-detail-panel]', 'data-collapsed') === 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(500); }
    const ids = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => e.getAttribute('data-source-id')));
    const tracks = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.getAttribute('data-track-id')).filter((v, i, a) => a.indexOf(v) === i));
    const R = (res[vp.width] = {});
    const step = async (name) => { const en = await measure(p); await swap(p, GEO); const ka = await measure(p); R[name] = { en, ka }; };
    await step('none');
    const audio = tracks.filter((t) => t !== tracks[0]);
    await L.addAt(p, ids[0], audio[0], 1);
    await L.addAt(p, ids[1], audio[1] || audio[0], 1);
    const clips = await L.clipsDom(p);
    await L.selectClip(p, clips[0].id); await step('single');
    await L.selectClip(p, clips[1].id, ['Control']); await step('multi');
    await L.loadVideo(p, 'clip-4s-vp9-opus.webm');
    const v = (await L.clipsDom(p)).find((c) => c.kind === 'video');
    await L.blur(p); await L.selectClip(p, v.id); await step('video');
    await p.screenshot({ path: path.join(__dirname, '..', 'shots', `video-en-swapped-${vp.width}.png`) });
    await ctx.close();
  }
  await b.close();
  L.save(path.join(__dirname, '..', 'out'), 'geo-swap-a142.json', res);
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
