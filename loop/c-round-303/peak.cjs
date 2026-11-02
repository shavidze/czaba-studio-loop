// C303 info probe: is the journey WAV peak=1 clipping? Re-export the 1-clip Middle East project (no move) at 1440 and count full-scale samples.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage();
 await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await p.waitForTimeout(600);
 await p.keyboard.press('Enter'); await p.waitForTimeout(1300);
 await p.getByRole('button', { name: 'Export', exact: true }).first().click(); const dlg = p.getByRole('dialog'); await dlg.waitFor(); await p.waitForTimeout(400);
 const dlP = p.waitForEvent('download', { timeout: 180000 }); await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click(); const dl = await dlP; await dl.saveAs('/tmp/c303-peak.wav');
 const buf = fs.readFileSync('/tmp/c303-peak.wav'); let o = 12; while (buf.toString('ascii', o, o + 4) !== 'data') o += 8 + buf.readUInt32LE(o + 4); const len = buf.readUInt32LE(o + 4);
 let full = 0, run = 0, maxRun = 0, n = 0, peak = 0; for (let i = o + 8; i + 3 <= o + 8 + len; i += 3) { const v = Math.abs(buf.readIntLE(i, 3) / 8388608); n++; if (v > peak) peak = v; if (v >= 0.9999) { full++; run++; if (run > maxRun) maxRun = run; } else run = 0; }
 const r = { samples: n, peak, fullScale: full, fullScaleFrac: full / n, longestRunInterleaved: maxRun }; fs.writeFileSync(__dirname + '/peak.json', JSON.stringify(r, null, 1)); console.log(r); fs.unlinkSync('/tmp/c303-peak.wav'); await b.close(); })();
