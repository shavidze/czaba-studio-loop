const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const BASE = 'http://127.0.0.1:5173';

const audioHook = () => {
  window.__c259 = { starts: 0, ctxs: [] };
  const Orig = window.AudioContext;
  if (Orig) {
    window.AudioContext = class extends Orig {
      constructor(...a) { super(...a); window.__c259.ctxs.push(this); }
    };
  }
  for (const C of [AudioBufferSourceNode, OscillatorNode, ConstantSourceNode]) {
    const proto = C.prototype;
    if (!Object.hasOwn(proto, 'start')) continue;
    const nativeStart = proto.start;
    proto.start = function (...a) {
      if (!(this.context instanceof OfflineAudioContext)) window.__c259.starts += 1;
      return nativeStart.apply(this, a);
    };
  }
};

(async () => {
  const out = { hsignal: {}, auth: {} };
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(audioHook);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/studio-lab`, { timeout: 180000 });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 180000 });
    const play = page.getByRole('button', { name: 'Play', exact: true });
    const r = {
      playCountEmpty: await play.count(),
      before: await play.getAttribute('data-playing'),
      authUser: await page.evaluate(() => localStorage.getItem('auth_user')),
      demoBadge: await page.getByText(/demo/i).count(),
    };
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.locator('[data-clip-kind="audio"]').first().waitFor();
    r.clips = await page.locator('[data-clip-kind="audio"]').count();
    r.playCountWithClip = await play.count();
    r.playName = await play.getAttribute('aria-label');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const startsBefore = await page.evaluate(() => window.__c259.starts);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    r.afterSpace1 = await play.getAttribute('data-playing');
    r.nameWhilePlaying = await play.getAttribute('aria-label');
    r.ctxStatesPlaying = await page.evaluate(() => window.__c259.ctxs.map((c) => c.state));
    r.startsDuringPlay = (await page.evaluate(() => window.__c259.starts)) - startsBefore;
    const clockA = await page.evaluate(() => window.__c259.ctxs.map((c) => c.currentTime));
    await page.waitForTimeout(500);
    const clockB = await page.evaluate(() => window.__c259.ctxs.map((c) => c.currentTime));
    r.ctxClockAdvance500ms = clockB.map((v, i) => +(v - clockA[i]).toFixed(3));
    await page.screenshot({ path: path.join(OUT, `hsignal-playing-${w}x${h}.png`) });
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    r.afterSpace2 = await play.getAttribute('data-playing');
    r.nameAfterStop = await play.getAttribute('aria-label');
    await page.screenshot({ path: path.join(OUT, `hsignal-stopped-${w}x${h}.png`) });
    r.pageErrors = errors;
    out.hsignal[`${w}x${h}`] = r;

    const p2 = await ctx.newPage();
    const audioSrcs = [];
    p2.on('request', (q) => { if (/\.(wav|mp3|ogg|flac)/i.test(q.url())) audioSrcs.push(q.url()); });
    await p2.goto(`${BASE}/studio/middle-east`, { timeout: 180000 });
    await p2.waitForTimeout(4000);
    out.auth[`${w}x${h}`] = {
      signInRequired: await p2.getByText('Sign in required', { exact: false }).count(),
      audioSrc: await p2.locator('audio[src]').count(),
      audioRequests: audioSrcs,
      authUser: await p2.evaluate(() => localStorage.getItem('auth_user')),
    };
    await p2.screenshot({ path: path.join(OUT, `auth-studio-product-${w}x${h}.png`) });
    await ctx.close();
  }
  const api = await browser.newContext();
  const noHdr = await api.request.get(`${BASE}/api/studio-token`, { failOnStatusCode: false });
  const fake = await api.request.get(`${BASE}/api/studio-token`, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
  out.auth.apiNoHeader = noHdr.status();
  out.auth.apiFakeBearer = fake.status();
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'hsignal-auth.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
})();
