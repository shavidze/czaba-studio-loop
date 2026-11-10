// C306 PLAY-SMOKE-306: add Bass (Enter), Play, position, data-playing transitions, WAV export.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const BASE = 'http://127.0.0.1:5173'; const SH = path.join(__dirname, 'shots'); fs.mkdirSync(SH, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function wavInfo(file) {
  const buf = fs.readFileSync(file); const fmt = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), ch: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34), audioFormat: buf.readUInt16LE(20) };
  let o = 12; let dataLen = 0; while (o < buf.length - 8) { const id = buf.toString('ascii', o, o + 4); const len = buf.readUInt32LE(o + 4); if (id === 'data') { dataLen = len; break; } o += 8 + len; }
  const bps = fmt.bits / 8; const frames = dataLen / (fmt.ch * bps); let peak = 0, nz = 0, n = 0, nan = 0, firstNz = -1;
  for (let i = o + 8; i + bps <= o + 8 + dataLen; i += bps) { let v; if (fmt.audioFormat === 3) v = buf.readFloatLE(i); else if (fmt.bits === 16) v = buf.readInt16LE(i) / 32768; else if (fmt.bits === 24) v = buf.readIntLE(i, 3) / 8388608; else v = buf.readInt32LE(i) / 2147483648; if (!Number.isFinite(v)) { nan++; continue; } const a = Math.abs(v); if (a > peak) peak = a; if (a > 0) { nz++; if (firstNz < 0) firstNz = n; } n++; }
  return { ...fmt, bytes: buf.length, dataLen, dataEndsInFile: o + 8 + dataLen <= buf.length, frames, durationS: frames / fmt.rate, peak, nonzeroFrac: nz / Math.max(1, n), firstNonzeroS: firstNz < 0 ? null : Math.floor(firstNz / fmt.ch) / fmt.rate, nan };
}
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = { at: new Date().toISOString(), vp: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`; const R = {}; out.vp[k] = R;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.addInitScript(() => { window.__playLog = []; const mo = new MutationObserver(() => { const b = document.querySelector('[data-playing]'); if (b) { const v = b.getAttribute('data-playing'); const l = window.__playLog; if (l[l.length - 1] !== v) l.push(v); } }); document.addEventListener('DOMContentLoaded', () => mo.observe(document.body, { subtree: true, attributes: true, childList: true, attributeFilter: ['data-playing'] })); });
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await sleep(600);
    R.playBtn = await p.evaluate(() => { const e = document.querySelector('[data-playing]'); return e && { tag: e.tagName, label: e.getAttribute('aria-label'), text: e.textContent.trim(), playing: e.getAttribute('data-playing') }; });
    const opt = p.getByTestId('arrangement-library-list').getByRole('option', { name: /^Bass/ }).first();
    R.bassOption = (await opt.textContent())?.replace(/\s+/g, ' ').trim().slice(0, 80);
    await opt.focus(); await p.keyboard.press('Enter'); await sleep(1200);
    R.clips = await p.locator('[data-clip-id]').evaluateAll((cs) => cs.map((c) => c.textContent.trim().slice(0, 40)));
    R.status = (await p.getByTestId('arrangement-status').textContent())?.trim();
    R.posBefore = (await p.getByTestId('arrangement-position').textContent())?.trim();
    const play = p.locator('[data-playing]').first(); await play.click(); await sleep(400);
    R.playingMid = await play.getAttribute('data-playing'); await sleep(1100);
    R.posAfter = (await p.getByTestId('arrangement-position').textContent())?.trim();
    await p.screenshot({ path: path.join(SH, `smoke-playing-${k}.png`) });
    await p.getByRole('button', { name: /^Stop/ }).first().click(); await sleep(600);
    R.playingEnd = await play.getAttribute('data-playing'); R.playLog = await p.evaluate(() => window.__playLog);
    await p.getByRole('button', { name: 'Export', exact: true }).first().click(); const dlg = p.getByRole('dialog'); await dlg.waitFor(); await sleep(400);
    await p.screenshot({ path: path.join(SH, `smoke-export-dialog-${k}.png`) });
    const dlP = p.waitForEvent('download', { timeout: 120000 }); await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click(); const dl = await dlP;
    const f = path.join(__dirname, `smoke-${k}.wav`); await dl.saveAs(f); R.export = { suggested: dl.suggestedFilename(), wav: wavInfo(f) }; fs.unlinkSync(f);
    R.errors = errs;
    const ps = (s) => { const m = /(\d+):(\d+)\.(\d+)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] + +m[3] / 1000 : NaN; };
    R.pass = R.clips.length === 1 && ps(R.posAfter) >= 1 && R.playBtn?.playing === 'false' && R.playingMid === 'true' && R.playingEnd === 'false' && R.export.wav.riff === 'RIFF' && R.export.wav.wave === 'WAVE' && R.export.wav.rate === 48000 && Math.abs(R.export.wav.durationS - 16) < 1e-6 && R.export.wav.peak > 0 && R.export.wav.nan === 0;
    await ctx.close();
  }
  out.pass = Object.values(out.vp).every((r) => r.pass);
  fs.writeFileSync(path.join(__dirname, 'smoke306.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
