// Usage: node drift.cjs <tag> <layout> [file]   layout: D | N | P | VM | H | METER
const L = require('./lib.cjs');
const path = require('path');
const fs = require('fs');

const selCount = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length);

async function deselect(p) {
  await L.blur(p);
  await p.keyboard.press('Escape');
  await L.sleep(300);
  let how = 'Escape';
  if ((await selCount(p)) > 0) {
    const g = await L.geo(p);
    const lb = await p.evaluate(() => { const l = document.querySelector('[data-track-id="sfx"] [data-grid-seconds]') || document.querySelector('[data-track-id="sfx"]'); return l.getBoundingClientRect().toJSON(); });
    await p.mouse.click(g.rl + 12 * g.pps, lb.top + lb.height / 2);
    await L.sleep(300);
    how = 'click empty sfx lane at 12 s';
  }
  return { how, selected: await selCount(p), hint: await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-detail-hint]')) };
}

async function runOne(browser, tag, layout, fileArg) {
  const VIDEO = fileArg || (layout === 'H' ? 'beeps-6s-h264-aac.mp4' : 'beeps-6s-vp9-opus.webm');
  const PLAY_MS = layout === 'VM' || layout === 'METER' ? 7000 : 13000;
  const net = [];
  const out = { tag, layout, video: VIDEO, utc: new Date().toISOString(), viewport: '1440x900', notes: [] };
  const { ctx, page } = await L.openStudio(browser, { width: 1440, height: 900 }, tag, net);
  try {
    out.snap = await L.setSnapOff(page);
    await L.loadVideo(page, VIDEO);
    let c = await L.clipsDom(page);
    if (layout !== 'VM' && layout !== 'METER') {
      const v = c.find((x) => x.kind === 'video');
      await L.selectClip(page, v.id);
      await L.blur(page);
      await page.keyboard.press('Control+d');
      await L.sleep(800);
      out.ctrlD = await L.status(page);
    }
    out.adds = [];
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) out.adds.push(await L.addAt(page, s, ln, t));
    c = await L.clipsDom(page);
    out.clips = c.map(({ lane, kind, start, wdur, title }) => ({ lane, kind, start, end: +(start + wdur).toFixed(3), offset: 0, title }));
    // offset from detail panel for every clip
    for (const [k, x] of c.entries()) {
      await L.selectClip(page, x.id);
      const d = await L.detailInfo(page);
      const m = /წყაროდან\s*(\d+:\d+\.\d+)/.exec(d.text || '');
      out.clips[k].offset = m ? L.secs(m[1]) : null;
    }
    if (layout === 'VM' || layout === 'METER') {
      const m = page.locator('[data-track-id=music] button[title=Mute]').first();
      await m.click();
      await L.sleep(300);
      out.musicMute = await m.getAttribute('aria-pressed');
    }
    const music = c.find((x) => x.lane === 'music');
    if (layout === 'D' || layout === 'H' || layout === 'P') {
      await L.selectClip(page, music.id);
      if (layout === 'P') {
        await page.click('[data-testid=arrangement-detail-toggle]');
        await L.sleep(500);
      }
    } else {
      out.deselect = await deselect(page);
    }
    await L.blur(page);
    await page.keyboard.press('Home');
    await L.sleep(400);
    await L.blur(page);
    out.pre = await page.evaluate(() => ({
      pos: Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')),
      snap: document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap,
      selected: [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).map((e) => e.closest('[data-track-id]').dataset.trackId),
      panelH: (() => { const p = document.querySelector('[data-testid=arrangement-detail-panel]'); return p ? +p.getBoundingClientRect().height.toFixed(1) : null; })(),
      toggle: (() => { const t = document.querySelector('[data-testid=arrangement-detail-toggle]'); return t ? t.getAttribute('aria-expanded') : null; })(),
      priorPlays: window.__h.media.filter((m) => m.k === 'play').length,
      media: window.__h.media.length,
      dock: window.__hDock(),
      focus: document.activeElement ? document.activeElement.tagName : null,
    }));
    if (layout === 'METER') {
      await page.evaluate(() => { window.__mm = []; window.__mi = setInterval(() => { const o = { t: performance.now(), pos: Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')) }; const m = document.querySelector('[data-testid=arrangement-master-meter]'); o.M = m && m.getAttribute('data-level-db'); for (const l of document.querySelectorAll('[data-track-id]')) { const e = l.querySelector('[data-testid=arrangement-track-meter]'); o[l.dataset.trackId] = e && e.getAttribute('data-level-db'); } window.__mm.push(o); }, 50); });
      await page.keyboard.press('Space');
      await L.sleep(900);
      await page.screenshot({ path: path.join(L.SHOTS, 'vm-meters-1440.png') });
      await L.sleep(2400);
      await page.screenshot({ path: path.join(L.SHOTS, 'vm-meters-3s-1440.png') });
      await page.keyboard.press('Space');
      out.meters = await page.evaluate(() => { clearInterval(window.__mi); return window.__mm; });
    } else {
      await page.evaluate(() => { window.__h.keys = []; window.addEventListener('keydown', (e) => { if (e.code === 'Space') window.__h.keys.push(performance.now()); }, true); window.__hStart(); });
      await L.sleep(150);
      await page.keyboard.press('Space');
      await L.sleep(PLAY_MS);
      await page.keyboard.press('Space');
      await L.sleep(400);
      await page.evaluate(() => window.__hStop());
      await page.screenshot({ path: path.join(L.SHOTS, `${tag}-1440.png`) });
      const raw = await page.evaluate(() => {
        const h = window.__h;
        const t0 = h.samples.length ? h.samples[0].t : 0;
        return { samples: h.samples, loaf: h.loaf.filter((x) => x.start + x.dur >= t0 - 100), media: h.media, seeks: h.seeks, q0: h.q0, q1: h.q1, dock: h.dock, keys: h.keys, ctxInfo: h.ctxInfo, nCtx: h.ctxs.length };
      });
      Object.assign(out, raw);
      out.post = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ role: v.dataset.videoRole, paused: v.paused, rate: v.playbackRate, muted: v.muted, ct: v.currentTime })));
    }
  } catch (e) {
    out.error = String(e).slice(0, 600);
    await page.screenshot({ path: path.join(L.SHOTS, `${tag}-error.png`) }).catch(() => {});
  }
  out.net = net;
  L.save(L.RUNS, `${tag}.json`, out);
  console.log(tag, out.error || 'ok', JSON.stringify(out.pre), out.ctrlD || '');
  await ctx.close();
  return out;
}
module.exports = { runOne };
if (require.main === module) {
  (async () => {
    const browser = await L.launch();
    // args: tag:layout[:file] ...
    for (const a of process.argv.slice(2)) { const [t, l, f] = a.split(':'); await runOne(browser, t, l, f); }
    await browser.close();
  })();
}
