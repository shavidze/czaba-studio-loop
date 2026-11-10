const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage(); await p.goto('about:blank');
  const b64 = await p.evaluate(async () => {
    const ac = new AudioContext(); await ac.resume();
    const osc = ac.createOscillator(); osc.frequency.value = 440; const g = ac.createGain(); g.gain.value = 0.5;
    const dest = ac.createMediaStreamDestination(); osc.connect(g); g.connect(dest); osc.start();
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 180; const c = cv.getContext('2d');
    const vs = cv.captureStream(25); let i = 0; const iv = setInterval(() => { c.fillStyle = `hsl(${(i++ * 7) % 360},60%,40%)`; c.fillRect(0, 0, 320, 180); }, 40);
    const ms = new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(ms, { mimeType: 'video/webm;codecs=vp9,opus' }); const ch = [];
    rec.ondataavailable = (e) => ch.push(e.data); rec.start(250);
    await new Promise((r) => setTimeout(r, 6000)); rec.stop(); await new Promise((r) => (rec.onstop = r)); clearInterval(iv); osc.stop();
    const blob = new Blob(ch, { type: 'video/webm' }); const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let k = 0; k < buf.length; k += 8192) s += String.fromCharCode(...buf.subarray(k, k + 8192)); return btoa(s);
  });
  fs.writeFileSync(process.argv[2], Buffer.from(b64, 'base64')); await b.close();
})();
