// C round 131: generate owned synthetic test media (no-audio VP9 WebM via MediaRecorder; doc.pdf; noext).
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const M = path.join(__dirname, '..', 'media');
(async () => {
  const b = await L.launch(); const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto('about:blank');
  const r = await p.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 320; c.height = 180; document.body.appendChild(c); const g = c.getContext('2d');
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    const st = c.captureStream(30); const rec = new MediaRecorder(st, { mimeType: mime }); const parts = [];
    rec.ondataavailable = (e) => parts.push(e.data);
    let f = 0; const iv = setInterval(() => { g.fillStyle = `hsl(${(f * 7) % 360},60%,40%)`; g.fillRect(0, 0, 320, 180); g.fillStyle = '#fff'; g.fillText(String(f++), 20, 40); }, 33);
    rec.start(100); await new Promise((r) => setTimeout(r, 2100)); rec.stop(); await new Promise((r) => (rec.onstop = r)); clearInterval(iv);
    const blob = new Blob(parts, { type: 'video/webm' }); const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return { mime, size: buf.length, b64: btoa(s), tracks: st.getAudioTracks().length };
  });
  fs.writeFileSync(path.join(M, 'noaudio-2s-vp9.webm'), Buffer.from(r.b64, 'base64'));
  fs.writeFileSync(path.join(M, 'doc.pdf'), '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
  fs.writeFileSync(path.join(M, 'noext'), 'plain bytes, no extension\n');
  console.log(JSON.stringify({ mime: r.mime, size: r.size, audioTracks: r.tracks }));
  await b.close();
})();
