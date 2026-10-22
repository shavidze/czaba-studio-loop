const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-86/pw/';
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function mp3Header(buf) {
  let i = 0;
  if (buf.slice(0, 3).toString() === 'ID3') {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    i = 10 + size;
  }
  for (; i < buf.length - 4; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) break;
  }
  const b1 = buf[i + 1], b2 = buf[i + 2], b3 = buf[i + 3];
  const version = (b1 >> 3) & 3; const layer = (b1 >> 1) & 3;
  const rates = { 3: [44100, 48000, 32000] };
  const brTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const xing = buf.slice(i, i + 200).toString('latin1');
  return { offset: i, mpeg1: version === 3, layer3: layer === 1, sampleRate: (rates[version] || [])[(b2 >> 2) & 3], bitrateKbps: brTable[(b2 >> 4) & 15], channelMode: (b3 >> 6) & 3, xing: xing.includes('Xing') ? 'Xing(VBR)' : xing.includes('Info') ? 'Info(CBR)' : 'none' };
}
(async () => {
  const browser = await chromium.launch();
  const warm = await browser.newContext();
  const wp = await warm.newPage();
  await wp.goto(URL, { waitUntil: 'networkidle' });
  await sleep(2000);
  await warm.close();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const r = { errors: [], unpkg: [], requestsBeforeClick: 0 };
  let clicked = false;
  page.on('request', (q) => { if (/unpkg\.com/.test(q.url())) { r.unpkg.push({ url: q.url(), afterClick: clicked }); } });
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/.test(m.text())) r.errors.push(m.text().slice(0, 200)); if (/hydrat|useLayoutEffect/i.test(m.text())) r.errors.push('WARN ' + m.text().slice(0, 200)); });
  page.on('pageerror', (e) => r.errors.push('pageerror ' + String(e).slice(0, 200)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await sleep(3000);
  const option = page.locator('[role="option"][data-source-id]').first();
  await option.waitFor();
  await sleep(2500);
  await option.dblclick();
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 20000 });
  await sleep(1500);
  await page.getByRole('button', { name: 'Export' }).click();
  await sleep(400);
  await page.getByTestId('arrangement-export-format-mp3').check();
  r.buttonText = await page.getByRole('button', { name: 'MP3-ის ექსპორტი' }).textContent();
  await page.screenshot({ path: out + 'a-r86-dialog-mp3-1440.png' });
  clicked = true;
  const t0 = Date.now();
  const statusSeen = new Set();
  const poll = setInterval(async () => { try { for (const t of await page.locator('[role="status"]').allTextContents()) statusSeen.add(t); } catch {} }, 200);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), page.getByRole('button', { name: 'MP3-ის ექსპორტი' }).click()]);
  r.firstMs = Date.now() - t0;
  const path = out + 'project.mp3';
  await dl.saveAs(path);
  await sleep(500);
  clearInterval(poll);
  r.statusSeen = [...statusSeen];
  r.suggested = dl.suggestedFilename();
  const buf = fs.readFileSync(path);
  r.size = buf.length;
  r.header = mp3Header(buf);
  r.done = await page.locator('[role="status"]').allTextContents();
  r.decoded = await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const ctx = new OfflineAudioContext(2, 48000, 48000);
    const ab = await ctx.decodeAudioData(bytes.buffer);
    return { duration: ab.duration, channels: ab.numberOfChannels, sampleRate: ab.sampleRate };
  }, buf.toString('base64'));
  const t1 = Date.now();
  const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), page.getByRole('button', { name: 'MP3-ის ექსპორტი' }).click()]);
  r.secondMs = Date.now() - t1;
  r.suggested2 = dl2.suggestedFilename();
  await sleep(300);
  r.wasmRequests = r.unpkg.filter((u) => /\.wasm/.test(u.url)).length;
  await context.storageState({ path: STATE });
  fs.unlinkSync(path);
  fs.writeFileSync(out + 'smoke-output.json', JSON.stringify(r, null, 2));
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
