// B round 307 pre-check / C round 308 row CONT-HEAD: audio continuity around a committed edit during playback.
// Taps the real output (AudioWorklet tap, 128-frame blocks, on every node connected to the destination), logs live start() calls,
// adds Bass (Enter), plays, at ~2.5 s drags the FADE-OUT handle (far from the playhead, so the gain at the
// playhead does not change) and measures the output around the splice time (= `when` of the release starts).
// Usage: node continuity-probe.cjs <baseUrl> <outFile> [runs=3] [clips=1]  (clips>1: Add + Ctrl+D copies, edit on clip 1)
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const BASE = process.argv[2] || 'http://127.0.0.1:5173'; const OUT = process.argv[3] || __dirname + '/continuity-head.json'; const RUNS = +(process.argv[4] || 3); const CLIPS = +(process.argv[5] || 1);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = { at: new Date().toISOString(), base: BASE, vp: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`; out.vp[k] = [];
    for (let run = 0; run < RUNS; run++) {
      const R = { run }; out.vp[k].push(R);
      const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
      const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
      await p.addInitScript(() => {
        window.__st = []; window.__cap = []; window.__sp = null;
        const s = AudioBufferSourceNode.prototype.start;
        AudioBufferSourceNode.prototype.start = function (...a) { s.apply(this, a); if (!(this.context instanceof OfflineAudioContext)) window.__st.push({ t: performance.now(), when: a[0], off: a[1] }); };
        const SRC = `class Tap extends AudioWorkletProcessor { process(inputs) { const i = inputs[0]; if (i && i[0]) this.port.postMessage({ t: currentTime, d: i[0].slice(0) }); return true; } } registerProcessor('b-tap', Tap);`;
        const URLm = URL.createObjectURL(new Blob([SRC], { type: 'application/javascript' }));
        const Orig = window.AudioContext;
        window.AudioContext = class extends Orig { constructor(...a) { super(...a); this.__tapReady = false; this.__pending = []; this.audioWorklet.addModule(URLm).then(() => { this.__tapReady = true; const pend = this.__pending; this.__pending = []; for (const node of pend) window.__ensureTap(node); }); } };
        const c = AudioNode.prototype.connect;
        window.__ensureTap = (node) => {
          const ac = node.context; if (!ac.__tapReady) { ac.__pending.push(node); return; }
          if (!window.__sp || window.__sp.context !== ac) {
            const sp = new AudioWorkletNode(ac, 'b-tap', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 2, channelCountMode: 'explicit' }); const mute = ac.createGain(); mute.gain.value = 0; mute.__mute = true;
            sp.port.onmessage = (e) => { if (!window.__rec) return; window.__cap.push(e.data); if (window.__cap.length > 4000) window.__cap.shift(); };
            c.call(sp, mute); c.call(mute, ac.destination); window.__sp = sp; window.__sr = ac.sampleRate;
          }
          c.call(node, window.__sp);
        };
        AudioNode.prototype.connect = function (dest, ...rest) {
          const r = c.call(this, dest, ...rest);
          if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext) && !(this instanceof AudioWorkletNode) && !this.__mute) {
            window.__ensureTap(this);
          }
          return r;
        };
      });
      try {
        await p.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
        await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 90000 }); await sleep(600);
        const opt = p.getByTestId('arrangement-library-list').getByRole('option', { name: /^Bass/ }).first();
        await opt.focus(); await p.keyboard.press('Enter'); await sleep(1200);
        const clip = p.locator('[data-clip-id]').first();
        if (CLIPS > 1) { const cb = await clip.boundingBox(); await p.mouse.click(cb.x + 20, cb.y + 6); await p.evaluate(() => document.activeElement && document.activeElement.blur()); for (let i = 1; i < CLIPS; i++) await p.keyboard.press('Control+d'); await sleep(1500); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press('Home'); await sleep(300); }
        R.clips = await p.locator('[data-clip-id]').count();
        R.fadeOutBefore = await clip.getAttribute('data-fade-out');
        const play = p.locator('[data-playing]').first(); await play.click(); await p.evaluate(() => { window.__rec = true; }); await sleep(2500);
        const handle = clip.getByTestId('arrangement-clip-fade-out-handle'); await handle.scrollIntoViewIfNeeded(); const hb = await handle.boundingBox();
        const x = hb.x + hb.width / 2, y = hb.y + hb.height * 0.5;
        await p.evaluate(() => { window.__st = []; });
        await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x - 60, y, { steps: 20 });
        const tUp = await p.evaluate(() => performance.now()); await p.mouse.up(); await sleep(600);
        R.fadeOutAfter = await clip.getAttribute('data-fade-out'); R.playing = await play.getAttribute('data-playing');
        const res = await p.evaluate((up) => {
          window.__rec = false; const sr = window.__sr; const starts = window.__st.filter((s) => s.t >= up);
          const caps = window.__cap; const tapMissed = 0; if (!caps.length || !starts.length) return { starts: starts.length, caps: caps.length };
          const t0 = caps[0].t; const n = caps.reduce((a, c) => a + c.d.length, 0); const x = new Float32Array(n); let o = 0; for (const c of caps) { x.set(c.d, o); o += c.d.length; }
          const contiguous = caps.every((c, i) => i === 0 || Math.abs(c.t - caps[i - 1].t - caps[i - 1].d.length / sr) < 1 / sr);
          const when = starts[0].when; const iS = Math.round((when - t0) * sr);
          const seam = new Uint8Array(n); { let q = 0; caps.forEach((c, i) => { if (i > 0 && Math.abs(c.t - caps[i - 1].t - caps[i - 1].d.length / sr) >= 1 / sr) seam[q] = 1; q += c.d.length; }); }
          const seams = seam.reduce((a, v) => a + v, 0);
          let spanStart = iS, spanEnd = iS; while (spanStart > 0 && !seam[spanStart]) spanStart--; while (spanEnd < n - 1 && !seam[spanEnd + 1]) spanEnd++;
          const absd = (i) => (seam[i] ? 0 : Math.abs(x[i] - x[i - 1]));
          const base = []; for (let i = Math.max(1, iS - sr); i < iS - Math.round(0.02 * sr); i++) base.push(absd(i)); base.sort((a, b) => a - b);
          const p999 = base[Math.floor(base.length * 0.999)] || 0; const bmax = base[base.length - 1] || 0;
          let wmax = 0, wAt = 0; for (let i = iS - Math.round(0.003 * sr); i <= iS + Math.round(0.01 * sr); i++) { if (i > 0 && i < n && absd(i) > wmax) { wmax = absd(i); wAt = i - iS; } }
          const rms = (a, b2) => { let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(n, b2); i++) { s += x[i] * x[i]; m++; } return m ? Math.sqrt(s / m) : 0; };
          const w20 = Math.round(0.02 * sr); let zrun = 0, zmax = 0; for (let i = iS - w20; i < iS + w20; i++) { if (Math.abs(x[i]) < 1e-6) { zrun++; zmax = Math.max(zmax, zrun); } else zrun = 0; }
          return { tapMissed, seams, contiguousAroundSpliceMs: [+(1000 * (spanStart - iS) / sr).toFixed(1), +(1000 * (spanEnd - iS) / sr).toFixed(1)], starts: starts.length, when: +when.toFixed(4), splicedInCapture: iS > sr && iS < n - w20, contiguous, sr, baseP999: +p999.toExponential(3), baseMax: +bmax.toExponential(3), spliceMaxDiff: +wmax.toExponential(3), spliceMaxAtSamples: wAt, ratioToBaseMax: +(wmax / (bmax || 1e-12)).toFixed(3), rmsBefore20: +rms(iS - w20, iS).toFixed(4), rmsAfter20: +rms(iS, iS + w20).toFixed(4), zeroRunMaxSamples: zmax };
        }, tUp);
        Object.assign(R, res); R.errors = errs;
        R.valid = R.clips === CLIPS && R.fadeOutAfter !== R.fadeOutBefore && R.playing === 'true' && R.starts >= 1 && R.splicedInCapture === true && R.contiguousAroundSpliceMs[0] <= -20 && R.contiguousAroundSpliceMs[1] >= 20;
      } catch (e) { R.error = String(e).slice(0, 200); R.valid = false; }
      await ctx.close();
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
