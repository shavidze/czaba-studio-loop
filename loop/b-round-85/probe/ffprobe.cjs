const { chromium } = require(process.argv[2] + '/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 200)));
  page.on('requestfailed', r => logs.push('FAILED ' + r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  const t0 = Date.now();
  const result = await page.evaluate(async () => {
    try {
      const mod = await import('/app/utils/ffmpeg.ts');
      const ff = await Promise.race([mod.loadFFmpeg(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 150s')), 150000))]);
      const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: 48000, sampleRate: 48000 });
      const osc = ctx.createOscillator(); osc.connect(ctx.destination); osc.start();
      const buf = await ctx.startRendering();
      // minimal 16-bit wav
      const n = buf.length, ch = 2, bytes = 44 + n * ch * 2; const dv = new DataView(new ArrayBuffer(bytes));
      const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
      w(0,'RIFF'); dv.setUint32(4, bytes-8, true); w(8,'WAVE'); w(12,'fmt '); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,ch,true); dv.setUint32(24,48000,true); dv.setUint32(28,48000*ch*2,true); dv.setUint16(32,ch*2,true); dv.setUint16(34,16,true); w(36,'data'); dv.setUint32(40,n*ch*2,true);
      const d = buf.getChannelData(0); for (let i = 0; i < n; i++) { const v = Math.round(d[i]*0.5*32767); dv.setInt16(44+i*4, v, true); dv.setInt16(46+i*4, v, true); }
      const mp3 = await mod.convertWavToMp3(new Blob([dv.buffer], { type: 'audio/wav' }));
      const head = new Uint8Array(await mp3.slice(0, 4).arrayBuffer());
      const dec = await new AudioContext().decodeAudioData(await mp3.arrayBuffer());
      return { ok: true, size: mp3.size, head: Array.from(head), decodedSeconds: dec.duration, decodedRate: dec.sampleRate, loaded: !!ff };
    } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
  });
  result.ms = Date.now() - t0;
  console.log(JSON.stringify({ result, logs: logs.filter(l => !/cart|ERR_CONNECTION_REFUSED/i.test(l)).slice(0, 30) }, null, 1));
  await browser.close();
})();
