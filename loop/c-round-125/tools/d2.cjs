// C round 125 — D2 shortcut probe. node d2.cjs <1440|1280> [groupName,...]
// Every probe: fresh-ish S1 page per group, focus setup, snapshot, key press, snapshot, diff.
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd2'); fs.mkdirSync(OUTD, { recursive: true });
async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400);
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); return { stems, sfx };
}
const snap = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s); const tx = (s) => ((q(s) || {}).textContent || '').trim().replace(/\s+/g, ' ');
  const btn = (re) => { const b = [...document.querySelectorAll('button')].find((x) => re.test((x.title || '') + ' ' + x.textContent)); return b ? `${b.getAttribute('aria-pressed')}|${b.disabled}|${(b.title || '').slice(0, 30)}` : null; };
  const a = document.activeElement;
  return {
    url: location.href, status: tx('[data-testid=arrangement-status]'),
    clips: [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}@${(+e.dataset.clipStart).toFixed(3)}+${(e.getBoundingClientRect().width).toFixed(0)}px${/ring-brand/.test(e.className) ? '*' : ''}`).sort().join(' '),
    snap: (q('[data-testid=arrangement-grid-control]') || { dataset: {} }).dataset.snap, grid: (q('[data-testid=arrangement-grid-control] select') || {}).value || tx('[data-testid=arrangement-grid-control]').slice(0, 30),
    env: btn(/^Envelope|Env/), loopBtn: btn(/Ctrl\/Cmd\+L/), follow: (q('[data-testid=arrangement-follow]') || { getAttribute: () => null }).getAttribute('aria-pressed'),
    zoom: tx('[data-testid=arrangement-zoom-readout]'), scroll: (q('[data-testid=arrangement-timeline-scroller]') || {}).scrollLeft,
    loop: tx('[data-testid=arrangement-loop-times]'), braceOn: (q('[data-testid=arrangement-loop-brace]') || { dataset: {} }).dataset.loopEnabled || null,
    markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => `${m.dataset.markerTime}:${m.getAttribute('aria-label').replace(/^Marker /, '').slice(0, 30)}`).join(','),
    groups: [...document.querySelectorAll('[data-testid=arrangement-group-row]')].map((r) => `${(r.querySelector('[data-testid=arrangement-group-name]') || {}).textContent}:${r.dataset.groupCollapsed || ''}`).join(','),
    playhead: Number((q('[data-testid=arrangement-playhead-handle]') || { getAttribute: () => NaN }).getAttribute('aria-valuenow')),
    playing: btn(/^(▶ Play|■|❚❚|Stop|Pause)/), range: tx('[data-testid=arrangement-range]').slice(0, 60),
    detail: (q('[data-testid=arrangement-detail-toggle]') || { getAttribute: () => null }).getAttribute('aria-expanded'),
    lib: !!q('[data-testid=arrangement-library-search]'), heights: [...document.querySelectorAll('[data-track-id]')].filter((e) => e.querySelector('[data-testid=arrangement-track-header]')).map((e) => Math.round(e.getBoundingClientRect().height)).join('/'),
    mutes: ['video', 'music', 'stems', 'sfx'].map((t) => { const m = q(`[data-track-id=${t}] button[aria-label^="Mute"]`), s = q(`[data-track-id=${t}] button[aria-label^="Solo"]`); return `${m && m.getAttribute('aria-pressed') === 'true' ? 'M' : '-'}${s && s.getAttribute('aria-pressed') === 'true' ? 'S' : '-'}`; }).join(''),
    vol: [...document.querySelectorAll('[data-track-id] input[aria-label^="Volume"]')].map((e) => e.value).join('/'),
    focus: a ? (a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.tagName).slice(0, 40) : null,
    editor: !!q('[data-testid=arrangement-marker-name-input],[data-testid=arrangement-group-name-input]'),
    libSel: (q('[role=option][aria-selected=true]') || { dataset: {} }).dataset.sourceId || null, search: (q('[data-testid=arrangement-library-search]') || {}).value,
    preview: tx('[data-testid=arrangement-library-playhead]'), pvWave: (q('[data-testid=arrangement-library-preview-wave]') || { getAttribute: () => null }).getAttribute('aria-valuenow'), pvToggle: tx('[data-testid=arrangement-library-preview-toggle]'), gainVal: (q('[data-testid=arrangement-detail-clip-gain-input]') || {}).value, libW: Math.round(((q('[data-testid=arrangement-library]') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect()).width), detailH: Math.round(((q('[data-testid=arrangement-detail-panel]') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect()).height), videoExpanded: (q('[data-testid=arrangement-video-dock]') || { dataset: {} }).dataset.videoExpanded || null, master: (q('input[aria-label="Master Volume"]') || {}).value, dialog: !!q('[role=dialog]'), menu: !!q('[role=menu]'),
  };
});
function diff(a, b) { const d = {}; for (const k of Object.keys(b)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) d[k] = [a[k], b[k]]; return d; }
const focusers = {
  none: async (p) => { await L.blur(p); },
  sel: async (p, s) => { await L.selectClip(p, s.sfx); await L.blur(p); },
  range: async (p, s) => { await X.rangeDrag(p, s.stems, 10, 6); await L.blur(p); },
  group: async (p) => { await p.locator('[data-testid=arrangement-group-name]').first().click(); await sleep(250); },
  groupBlur: async (p) => { await p.locator('[data-testid=arrangement-group-name]').first().click(); await sleep(250); await L.blur(p); },
  lane: async (p) => { await p.click(L.nameSel('sfx')); await sleep(200); await L.blur(p); },
  marker: async (p) => { await p.locator('[data-testid=arrangement-marker]').first().focus(); await sleep(200); },
  brace: async (p) => { await p.locator('[data-testid=arrangement-loop-brace]').first().focus(); await sleep(200); },
  search: async (p) => { await p.locator('[data-testid=arrangement-library-search]').focus(); await sleep(200); },
  option: async (p) => { await p.locator('[role=option][data-source-id="demo-slow-rise"]').focus(); await sleep(200); },
  wave: async (p) => { await p.locator('[data-testid=arrangement-library-preview-wave]').focus(); await sleep(200); },
  handle: async (p) => { await p.locator('[data-testid=arrangement-playhead-handle]').focus(); await sleep(200); },
  overview: async (p) => { await p.locator('[data-testid=arrangement-overview]').focus(); await sleep(200); },
  fader: async (p) => { await p.locator('[data-track-id=music] input[aria-label^="Volume"]').focus(); await sleep(200); },
  height: async (p) => { await p.locator('[data-track-id=sfx] [data-testid=arrangement-track-height]').focus(); await sleep(200); },
  libsep: async (p) => { await p.locator('[data-testid=arrangement-library-separator]').focus(); await sleep(200); },
  detailsep: async (p) => { await p.locator('[data-testid=arrangement-detail-separator]').focus(); await sleep(200); },
  gain: async (p, s) => { await L.selectClip(p, s.sfx); await p.locator('[data-testid=arrangement-detail-clip-gain-fader]').focus(); await sleep(200); },
};
// [id, key, focus, liveRef]
const GROUPS = {
  transport: [['Space', 'Space', 'none'], ['Space-stop', 'Space', 'none'], ['Shift+Space', 'Shift+Space', 'none'], ['Home', 'Home', 'none'], ['Enter-lane', 'Enter', 'lane'], ['Escape', 'Escape', 'sel']],
  edit: [['Ctrl+E', 'Control+e', 'sel'], ['Ctrl+Z', 'Control+z', 'none'], ['Ctrl+Y', 'Control+y', 'none'], ['Ctrl+Z2', 'Control+z', 'none'], ['Ctrl+Shift+Z', 'Control+Shift+z', 'none'], ['Ctrl+D', 'Control+d', 'sel'], ['Ctrl+C', 'Control+c', 'sel'], ['Ctrl+X', 'Control+x', 'sel'], ['Ctrl+V', 'Control+v', 'none'], ['Delete', 'Delete', 'sel'], ['Ctrl+Z3', 'Control+z', 'none'], ['Backspace', 'Backspace', 'sel'], ['Ctrl+Z4', 'Control+z', 'none'], ['Ctrl+A', 'Control+a', 'none'], ['ArrowRight-clip', 'ArrowRight', 'sel'], ['ArrowLeft-clip', 'ArrowLeft', 'sel']],
  time: [['Ctrl+Shift+X', 'Control+Shift+x', 'range'], ['Ctrl+Z5', 'Control+z', 'none'], ['Ctrl+Shift+L', 'Control+Shift+l', 'range'], ['Ctrl+L', 'Control+l', 'range'], ['Ctrl+L-toggle', 'Control+l', 'none'], ['Ctrl+Shift+C', 'Control+Shift+c', 'range'], ['Ctrl+Shift+V', 'Control+Shift+v', 'none'], ['Ctrl+Shift+D', 'Control+Shift+d', 'range'], ['Ctrl+I', 'Control+i', 'range'], ['Ctrl+Shift+Delete', 'Control+Shift+Delete', 'range'], ['Ctrl+J', 'Control+j', 'sel']],
  view: [['Z', 'z', 'range'], ['X', 'x', 'none'], ['+', '+', 'none'], ['-', '-', 'none'], ['W', 'w', 'none'], ['H', 'h', 'none'], ['Ctrl+Alt+B', 'Control+Alt+b', 'none'], ['Ctrl+Alt+3', 'Control+Alt+3', 'none'], ['Ctrl+Alt+O', 'Control+Alt+o', 'none'], ['Ctrl+Alt+V', 'Control+Alt+v', 'none'], ['Alt+Shift+F', 'Alt+Shift+f', 'none'], ['Ctrl+Shift+F', 'Control+Shift+f', 'none'], ['Shift+?', 'Shift+?', 'none'], ['?', '?', 'none'], ['F1', 'F1', 'none']],
  marker: [['M', 'm', 'none'], ['Escape-editor', 'Escape', 'none'], ['Ctrl+ArrowRight', 'Control+ArrowRight', 'none'], ['Ctrl+ArrowLeft', 'Control+ArrowLeft', 'none'], ['marker-F2', 'F2', 'marker'], ['Escape-editor2', 'Escape', 'none'], ['marker-ArrowRight', 'ArrowRight', 'marker'], ['marker-Delete', 'Delete', 'marker'], ['Ctrl+Z6', 'Control+z', 'none'], ['Ctrl+F9', 'Control+F9', 'none'], ['Ctrl+F10', 'Control+F10', 'none'], ['Ctrl+Space', 'Control+Space', 'sel'], ['Ctrl+Shift+Space', 'Control+Shift+Space', 'sel']],
  grid: [['G', 'g', 'none'], ['G2', 'g', 'none'], ['1', '1', 'none'], ['2', '2', 'none'], ['3', '3', 'none'], ['A', 'a', 'none'], ['A2', 'a', 'none'], ['B', 'b', 'none'], ['F', 'f', 'sel'], ['Ctrl+Alt+F', 'Control+Alt+f', 'sel'], ['Ctrl+Alt+Backspace', 'Control+Alt+Backspace', 'sel'], ['R', 'r', 'sel'], ['0', '0', 'sel']],
  tracks: [['Ctrl+Shift+G', 'Control+Shift+g', 'group'], ['Ctrl+Z7', 'Control+z', 'none'], ['group-F2', 'F2', 'group'], ['Escape-editor3', 'Escape', 'none'], ['U', 'u', 'groupBlur'], ['U2', 'u', 'groupBlur'], ['U-lane', 'u', 'lane'], ['Alt+U', 'Alt+u', 'none'], ['S', 's', 'lane'], ['C', 'c', 'lane'], ['Ctrl+T', 'Control+t', 'none'], ['Alt+=', 'Alt+=', 'lane'], ['O', 'o', 'none'], ['Ctrl+G', 'Control+g', 'none'], ['Tab', 'Tab', 'none'], ['height-ArrowDown', 'ArrowDown', 'height']],
  redo: [['Delete', 'Delete', 'sel'], ['Ctrl+Z', 'Control+z', 'none'], ['Backspace', 'Backspace', 'sel'], ['Ctrl+Z2', 'Control+z', 'none'], ['option-ArrowRight', 'ArrowRight', 'option'], ['wave-Space', 'Space', 'wave'], ['wave-Space2', 'Space', 'wave'], ['wave-ArrowRight', 'ArrowRight', 'wave'], ['wave-End', 'End', 'wave'], ['wave-Home', 'Home', 'wave'], ['gain-ArrowUp', 'ArrowUp', 'gain'], ['gain-Shift+ArrowUp', 'Shift+ArrowUp', 'gain'], ['gain-Delete', 'Delete', 'gain'], ['libsep-ArrowRight', 'ArrowRight', 'libsep'], ['detailsep-ArrowUp', 'ArrowUp', 'detailsep'], ['Ctrl+C', 'Control+c', 'sel'], ['Ctrl+Alt+V', 'Control+Alt+v', 'none'], ['Ctrl+Z3', 'Control+z', 'none'], ['Alt+V', 'Alt+v', 'none'], ['Ctrl+Alt+E', 'Control+Alt+e', 'sel'], ['Escape-sel', 'Escape', 'sel']],
  widgets: [['brace-ArrowRight', 'ArrowRight', 'brace'], ['brace-Shift+ArrowRight', 'Shift+ArrowRight', 'brace'], ['brace-ArrowUp', 'ArrowUp', 'brace'], ['brace-Ctrl+ArrowUp', 'Control+ArrowUp', 'brace'], ['brace-Ctrl+ArrowRight', 'Control+ArrowRight', 'brace'], ['search-ArrowDown', 'ArrowDown', 'search'], ['search-Escape', 'Escape', 'search'], ['option-ArrowDown', 'ArrowDown', 'option'], ['option-ArrowLeft', 'ArrowLeft', 'option'], ['option-Shift+Enter', 'Shift+Enter', 'option'], ['option-Enter', 'Enter', 'option'], ['Ctrl+Z8', 'Control+z', 'none'], ['wave-Space', 'Space', 'wave'], ['wave-Space2', 'Space', 'wave'], ['wave-ArrowRight', 'ArrowRight', 'wave'], ['wave-End', 'End', 'wave'], ['handle-ArrowRight', 'ArrowRight', 'handle'], ['overview-ArrowRight', 'ArrowRight', 'overview'], ['fader-ArrowDown', 'ArrowDown', 'fader'], ['fader-Shift+ArrowDown', 'Shift+ArrowDown', 'fader'], ['fader-Delete', 'Delete', 'fader'], ['gain-ArrowUp', 'ArrowUp', 'gain'], ['libsep-ArrowRight', 'ArrowRight', 'libsep'], ['detailsep-ArrowUp', 'ArrowUp', 'detailsep']],
};
(async () => {
  const b = await L.launch(); const res = { vp: W, groups: {} };
  for (const [g, probes] of Object.entries(GROUPS)) {
    if (ONLY.length && !ONLY.includes(g)) continue;
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `d2-${W}-${g}`, net);
    const s = await buildS1(p); const out = (res.groups[g] = []);
    for (const [id, k, f] of probes) {
      const r = { id, key: k, focus: f };
      try {
        await focusers[f](p, s); const a = await snap(p); r.focusEl = a.focus;
        await p.keyboard.press(k); await sleep(id.startsWith('Space') && id !== 'Space-stop' ? 900 : 450);
        const z = await snap(p); r.diff = diff(a, z); r.changed = Object.keys(r.diff).filter((x) => x !== 'focus');
        if (z.url !== a.url) r.reload = true;
      } catch (e) { r.error = String(e).slice(0, 200); }
      out.push(r);
      console.log(g, id, r.error || JSON.stringify(r.diff).slice(0, 260));
    }
    await ctx.close();
    fs.writeFileSync(path.join(OUTD, `d2-${W}${ONLY.length ? '-' + ONLY.join('_') : '-main'}.partial.json`), JSON.stringify({ ...res, net: X.netOk(net) }, null, 1));
  }
  res.net = X.netOk(net); fs.writeFileSync(path.join(OUTD, `d2-${W}${ONLY.length ? '-' + ONLY.join('_') : ''}.json`), JSON.stringify(res, null, 1)); console.log('NET', JSON.stringify(res.net)); await b.close();
})();
