// Usage: node export-probe.cjs <baseUrl> <label> <outJson>
// Adds synth sources via library Add and exports WAV; records sha256 per scenario.
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCEN = { pulse: ['demo-stem-pulse'], all: ['demo-stem-pulse', 'demo-stem-bass', 'demo-stem-pad', 'demo-stem-lead', 'demo-synth-mix', 'demo-soft-impact', 'demo-slow-rise'] };
(async () => {
  const [base, label, out] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = { base, label, at: new Date().toISOString(), rows: {} };
  for (const [name, ids] of Object.entries(SCEN)) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
      const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
      const page = await ctx.newPage(); const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(base + '/studio-lab');
      await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 120000 });
      for (const id of ids) {
        await page.locator(`[data-source-id="${id}"]`).first().click(); await sleep(250);
        await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(800);
        await page.evaluate(() => { const a = document.activeElement; if (a instanceof HTMLElement) a.blur(); });
      }
      const clips = await page.locator('[data-clip-kind="audio"]').count();
      await page.getByRole('button', { name: 'Export', exact: true }).first().click();
      const dlg = page.getByRole('dialog'); await dlg.waitFor();
      const dlP = page.waitForEvent('download', { timeout: 120000 });
      await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
      const dl = await dlP; const file = path.join('/tmp/c283', `c283-${label}-${name}-${vp.width}.wav`); await dl.saveAs(file);
      const buf = fs.readFileSync(file);
      const fmt = { ch: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34) }; let o = 12; let dataLen = 0; while (o < buf.length - 8) { const id = buf.toString('ascii', o, o + 4); const len = buf.readUInt32LE(o + 4); if (id === 'data') { dataLen = len; break; } o += 8 + len; } const frames = dataLen / (fmt.ch * fmt.bits / 8); let peak = 0, nz = 0; const step = fmt.bits / 8; for (let i = o + 8; i < o + 8 + dataLen; i += step * 97) { const v = fmt.bits === 16 ? Math.abs(buf.readInt16LE(i)) / 32768 : fmt.bits === 32 ? Math.abs(buf.readFloatLE(i)) : Math.abs(buf.readIntLE(i, 3)) / 8388608; if (v > peak) peak = v; if (v > 0) nz++; } R.rows[`${name}@${vp.width}x${vp.height}`] = { fmt, durationS: frames / fmt.rate, peak, nonzeroSampled: nz, clips, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex'), errors };
      fs.unlinkSync(file); await ctx.close();
      console.log(name, vp.width, JSON.stringify(R.rows[`${name}@${vp.width}x${vp.height}`]));
    }
  }
  fs.writeFileSync(out, JSON.stringify(R, null, 1)); await browser.close();
})();
