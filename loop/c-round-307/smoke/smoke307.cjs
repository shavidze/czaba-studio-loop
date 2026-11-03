// C307 PLAY-SMOKE-307: add Bass (Enter), Play, position >= 1 s after 1.5 s, drag the fade-in handle while playing
// (commit), check data-playing true + position advancing + real output via a destination tap (AnalyserNode RMS)
// before/after the edit and the number of live source starts at the release; then Stop and export WAV.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const BASE = 'http://127.0.0.1:5173'; const SH = path.join(__dirname, 'shots'); fs.mkdirSync(SH, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function wavInfo(file) {
  const buf = fs.readFileSync(file); const fmt = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), ch: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34), audioFormat: buf.readUInt16LE(20) };
  let o = 12; let dataLen = 0; while (o < buf.length - 8) { const id = buf.toString('ascii', o, o + 4); const len = buf.readUInt32LE(o + 4); if (id === 'data') { dataLen = len; break; } o += 8 + len; }
  const bps = fmt.bits / 8; const frames = dataLen / (fmt.ch * bps); let peak = 0, nz = 0, n = 0, nan = 0, firstNz = -1; const win = []; let wsum = 0, wn = 0;
  for (let i = o + 8; i + bps <= o + 8 + dataLen; i += bps) { let v; if (fmt.audioFormat === 3) v = buf.readFloatLE(i); else if (fmt.bits === 16) v = buf.readInt16LE(i) / 32768; else if (fmt.bits === 24) v = buf.readIntLE(i, 3) / 8388608; else v = buf.readInt32LE(i) / 2147483648; if (!Number.isFinite(v)) { nan++; continue; } const a = Math.abs(v); if (a > peak) peak = a; if (a > 0) { nz++; if (firstNz < 0) firstNz = n; } n++;
    wsum += v * v; wn++; if (wn === fmt.ch * fmt.rate / 4) { win.push(+(Math.sqrt(wsum / wn)).toFixed(4)); wsum = 0; wn = 0; } }
  return { ...fmt, bytes: buf.length, dataLen, dataEndsInFile: o + 8 + dataLen <= buf.length, frames, durationS: frames / fmt.rate, peak, nonzeroFrac: nz / Math.max(1, n), firstNonzeroS: firstNz < 0 ? null : Math.floor(firstNz / fmt.ch) / fmt.rate, nan, rms250msFirst2s: win.slice(0, 8) };
}
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = { at: new Date().toISOString(), vp: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`; const R = {}; out.vp[k] = R;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); p.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL/.test(m.text())) errs.push('console:' + m.text().slice(0, 160)); });
    await p.addInitScript(() => {
      window.__playLog = []; window.__st = []; window.__an = null;
      const s = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...a) { s.apply(this, a); if (!(this.context instanceof OfflineAudioContext)) window.__st.push({ t: performance.now(), when: a[0], off: a[1], ctxNow: this.context.currentTime }); };
      const c = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (dest, ...rest) {
        const r = c.call(this, dest, ...rest);
        if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext) && !(this instanceof AnalyserNode)) {
          if (!window.__an || window.__an.context !== this.context) { window.__an = this.context.createAnalyser(); window.__an.fftSize = 2048; }
          c.call(this, window.__an);
        }
        return r;
      };
      window.__rms = () => { const a = window.__an; if (!a) return null; const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s2 = 0; for (const v of d) s2 += v * v; return Math.sqrt(s2 / d.length); };
      const mo = new MutationObserver(() => { const b = document.querySelector('[data-playing]'); if (b) { const v = b.getAttribute('data-playing'); const l = window.__playLog; if (l[l.length - 1] !== v) l.push(v); } });
      document.addEventListener('DOMContentLoaded', () => mo.observe(document.body, { subtree: true, attributes: true, childList: true, attributeFilter: ['data-playing'] }));
    });
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 60000 }).catch(async (e) => { console.log("STATUS", await p.evaluate(() => document.querySelector("[data-testid=\"arrangement-status\"]")?.textContent), errs); throw e; }); await sleep(600);
    const opt = p.getByTestId('arrangement-library-list').getByRole('option', { name: /^Bass/ }).first();
    R.bassOption = (await opt.textContent())?.replace(/\s+/g, ' ').trim().slice(0, 80);
    await opt.focus(); await p.keyboard.press('Enter'); await sleep(1200);
    R.clips = await p.locator('[data-clip-id]').evaluateAll((cs) => cs.map((c) => c.textContent.trim().slice(0, 40)));
    const clip = p.locator('[data-clip-id]').first();
    R.fadeInBefore = await clip.getAttribute('data-fade-in');
    const pos = async () => (await p.getByTestId('arrangement-position').textContent())?.trim();
    const ps = (s) => { const m = /(\d+):(\d+)\.(\d+)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] + +m[3] / 1000 : NaN; };
    R.posBefore = await pos();
    const play = p.locator('[data-playing]').first(); await play.click(); await sleep(400);
    R.playingMid = await play.getAttribute('data-playing'); await sleep(1100);
    R.posAfter15 = await pos();
    const rmsSample = async (n) => { const v = []; for (let i = 0; i < n; i++) { v.push(await p.evaluate(() => window.__rms())); await sleep(60); } return v.map((x) => x === null ? null : +x.toFixed(4)); };
    R.rmsBeforeEdit = await rmsSample(5);
    await p.screenshot({ path: path.join(SH, `smoke-playing-${k}.png`) });
    // fade-in drag while playing (commit on pointerup)
    const handle = clip.getByTestId('arrangement-clip-fade-in-handle');
    R.handleFound = await handle.count();
    const hb = await handle.boundingBox(); const x = hb.x + Math.min(hb.width / 2, 8), y = hb.y + hb.height * 0.5;
    await p.evaluate(() => { window.__st = []; });
    await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 120, y, { steps: 40 });
    const tUp = await p.evaluate(() => performance.now()); await p.mouse.up();
    const posAtRelease = await pos(); await sleep(700);
    R.fadeInAfter = await clip.getAttribute('data-fade-in');
    R.playingAfterEdit = await play.getAttribute('data-playing');
    R.posAtRelease = posAtRelease; R.posAfterEdit700 = await pos();
    R.startsAfterRelease = await p.evaluate((up) => window.__st.filter((s) => s.t >= up).map((s) => ({ dtMs: +(s.t - up).toFixed(1), when: +s.when.toFixed(3), off: +s.off.toFixed(3), lead: +(s.when - s.ctxNow).toFixed(3) })), tUp);
    R.rmsAfterEdit = await rmsSample(5);
    await sleep(800); R.posAfterEdit1500 = await pos();
    await p.screenshot({ path: path.join(SH, `smoke-after-fade-${k}.png`) });
    await p.getByRole('button', { name: /^Stop/ }).first().click(); await sleep(600);
    R.playingEnd = await play.getAttribute('data-playing'); R.playLog = await p.evaluate(() => window.__playLog);
    await p.getByRole('button', { name: 'Export', exact: true }).first().click(); const dlg = p.getByRole('dialog'); await dlg.waitFor(); await sleep(400);
    const dlP = p.waitForEvent('download', { timeout: 120000 }); await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click(); const dl = await dlP;
    const f = path.join(__dirname, `smoke-${k}.wav`); await dl.saveAs(f); R.export = { suggested: dl.suggestedFilename(), wav: wavInfo(f) }; fs.unlinkSync(f);
    R.errors = errs;
    const rmsOk = (a) => a.filter((v) => v !== null && v > 1e-4).length >= 3;
    R.checks = {
      oneClip: R.clips.length === 1, pos15: ps(R.posAfter15) >= 1, playingMid: R.playingMid === 'true',
      fadeCommitted: Number(R.fadeInAfter) > Number(R.fadeInBefore), playingAfterEdit: R.playingAfterEdit === 'true',
      advancingAfterEdit: ps(R.posAfterEdit1500) > ps(R.posAtRelease) + 1, restartedSources: R.startsAfterRelease.length >= 1,
      soundBefore: rmsOk(R.rmsBeforeEdit), soundAfter: rmsOk(R.rmsAfterEdit), stopped: R.playingEnd === 'false',
      wav: R.export.wav.riff === 'RIFF' && R.export.wav.wave === 'WAVE' && R.export.wav.rate === 48000 && Math.abs(R.export.wav.durationS - 16) < 1e-6 && R.export.wav.peak > 0 && R.export.wav.nan === 0 && R.export.wav.dataEndsInFile,
      noPageErrors: errs.length === 0,
    };
    R.pass = Object.values(R.checks).every(Boolean);
    await ctx.close();
  }
  out.pass = Object.values(out.vp).every((r) => r.pass);
  fs.writeFileSync(path.join(__dirname, 'smoke307.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
