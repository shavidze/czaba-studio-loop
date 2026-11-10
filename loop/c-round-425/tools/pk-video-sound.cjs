// C315 PK-VIDEO-SOUND. 1) Generates a 4 s webm (vp8 + opus 440 Hz) with MediaRecorder in its own page and saves it to media/.
// 2) Loads /studio-lab, holds the peaks worker's replies (window.__c315Hold) while the video is imported,
//    presses Play as soon as the video clip appears, samples the destination level while the clip still shows
//    "Sound is decoding…", then releases the replies and samples again after ready.
// Usage: node pk-video-sound.cjs <baseURL> <WxH> <out.json>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const [base, vp, out] = process.argv.slice(2); const [w, h] = vp.split('x').map(Number);
const media = path.join(__dirname, 'media'); fs.mkdirSync(media, { recursive: true });
const file = path.join(media, 'c315-tone-440.webm');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  if (!fs.existsSync(file)) {
    const g = await (await b.newContext()).newPage(); await g.goto(base + '/favicon.ico').catch(() => {});
    const b64 = await g.evaluate(async () => {
      const c = document.createElement('canvas'); c.width = 160; c.height = 90; document.body.appendChild(c); const x = c.getContext('2d');
      const ac = new AudioContext(); const osc = ac.createOscillator(); osc.frequency.value = 440; const gn = ac.createGain(); gn.gain.value = 0.5; const md = ac.createMediaStreamDestination(); osc.connect(gn).connect(md); osc.start();
      const stream = new MediaStream([...c.captureStream(25).getVideoTracks(), ...md.stream.getAudioTracks()]);
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' }); const parts = []; rec.ondataavailable = (e) => parts.push(e.data);
      let f = 0; const iv = setInterval(() => { x.fillStyle = `hsl(${(f * 7) % 360},60%,40%)`; x.fillRect(0, 0, 160, 90); f += 1; }, 40);
      rec.start(); await new Promise((r) => setTimeout(r, 4000)); rec.stop(); await new Promise((r) => { rec.onstop = r; }); clearInterval(iv);
      const blob = new Blob(parts, { type: 'video/webm' }); const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (const v of buf) s += String.fromCharCode(v); return btoa(s);
    });
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  }
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await ctx.addInitScript(() => {
    window.__c315Hold = false; const held = []; window.__c315Workers = [];
    const Native = window.Worker;
    window.Worker = class extends Native { constructor(url, o) { super(url, o); const e = { url: String(url).split('/').pop(), terminated: null }; window.__c315Workers.push(e);
      const isPeaks = e.url.includes('peaks'); let handler = null;
      super.onmessage = (ev) => { if (isPeaks && window.__c315Hold) held.push([this, ev]); else if (handler) handler.call(this, ev); };
      Object.defineProperty(this, 'onmessage', { get: () => handler, set: (fn) => { handler = fn; }, configurable: true });
      const t = this.terminate.bind(this); this.terminate = () => { e.terminated = Math.round(performance.now()); t(); };
      window.__c315Release = () => { window.__c315Hold = false; for (const [wk, ev] of held.splice(0)) { const hd = wk.onmessage; if (hd) hd.call(wk, ev); } }; } };
    window.__c315Starts = [];
    const ns = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) { window.__c315Starts.push({ t: Math.round(performance.now()), dur: this.buffer ? Number(this.buffer.duration.toFixed(3)) : null, when: a[0], offset: a[1], ctxTime: Number(this.context.currentTime.toFixed(3)) }); return ns.apply(this, a); };
    const nc = AudioNode.prototype.connect; window.__c315An = new Map();
    AudioNode.prototype.connect = function (d, ...r) { if (d instanceof AudioDestinationNode) { let an = window.__c315An.get(d.context); if (!an) { an = d.context.createAnalyser(); an.fftSize = 2048; window.__c315An.set(d.context, an); } nc.call(this, an); } return nc.call(this, d, ...r); };
    window.__c315Level = () => { let pk = 0; for (const an of window.__c315An.values()) { const dd = new Float32Array(an.fftSize); an.getFloatTimeDomainData(dd); for (const v of dd) pk = Math.max(pk, Math.abs(v)); } return Number(pk.toFixed(4)); };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.goto(base + '/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 });
  await p.waitForTimeout(1000);
  const res = { base, vp, file: path.basename(file), bytes: fs.statSync(file).size, samples: [] };
  await p.evaluate(() => { window.__c315Hold = true; });
  await p.getByTestId('arrangement-video-input').setInputFiles(file);
  await p.locator('[data-clip-kind="video"]').first().waitFor({ timeout: 30000 });
  const note = () => p.locator('[data-clip-kind="video"]').first().evaluate((n) => (/Sound is decoding/.test(n.textContent) ? 'decoding' : /No sound/.test(n.textContent) ? 'none' : /could not be read/.test(n.textContent) ? 'error' : 'ready-or-none'));
  await p.getByRole('button', { name: 'Play', exact: true }).click();
  await p.locator('body').evaluate(() => document.activeElement && document.activeElement.blur());
  const t0 = Date.now(); const sample = async (phase) => res.samples.push({ phase, ms: Date.now() - t0, note: await note(), level: await p.evaluate(() => window.__c315Level()), starts: await p.evaluate(() => window.__c315Starts.length) });
  for (let i = 0; i < 12; i += 1) { await sample('held'); await p.waitForTimeout(100); }
  await p.screenshot({ path: path.join(__dirname, 'shots', `video-held-${vp}.png`) });
  await p.evaluate(() => window.__c315Release && window.__c315Release());
  for (let i = 0; i < 20; i += 1) { await p.waitForTimeout(100); await sample('released'); }
  await p.screenshot({ path: path.join(__dirname, 'shots', `video-ready-${vp}.png`) });
  res.startsDetail = await p.evaluate(() => window.__c315Starts); res.playheadText = await p.evaluate(() => document.querySelector("[data-testid=arrangement-transport]")?.innerText.slice(0, 120)); res.workers = await p.evaluate(() => window.__c315Workers);
  await p.keyboard.press('Space'); res.errors = errs;
  const held = res.samples.filter((s) => s.phase === 'held'); const rel = res.samples.filter((s) => s.phase === 'released');
  res.summary = { heldNotes: [...new Set(held.map((s) => s.note))], heldMaxLevel: Math.max(...held.map((s) => s.level)), heldStarts: held.at(-1).starts, releasedNotes: [...new Set(rel.map((s) => s.note))], releasedMaxLevel: Math.max(...rel.map((s) => s.level)), releasedStarts: rel.at(-1).starts, errors: errs.length };
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res.summary), JSON.stringify(res.startsDetail)); await b.close();
})();
