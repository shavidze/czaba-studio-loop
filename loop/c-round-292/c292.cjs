// C round 292 (independent): FIX-PD-1c narrow state. usage: node c292.cjs [rowRegex]
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const URL = `${BASE}/studio-lab`;
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-292';
const SHOTS = path.join(OUT, 'shots');
const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop';
const resultFile = path.join(OUT, 'c292.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : {};
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HYD = /hydrat|did not match|didn't match/i;
const BENIGN = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i;

const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};
const rms = (page) => page.evaluate(() => +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5));

async function newCtx(browser, w, h, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...opts });
  if (opts.javaScriptEnabled !== false) {
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
    await ctx.addInitScript(INIT);
  }
  const page = await ctx.newPage();
  const log = { console: [], hydration: [], media: [], pageErrors: [] };
  page.on('console', (m) => { const t = m.text(); if (HYD.test(t)) log.hydration.push(t.slice(0, 300)); if (m.type() === 'error' && !BENIGN.test(t)) log.console.push(t.slice(0, 300)); });
  page.on('pageerror', (e) => log.pageErrors.push(String(e).slice(0, 300)));
  page.on('request', (r) => { if (/\.(mp3|wav|webm|mp4|ogg)(\?|$)/.test(r.url())) log.media.push({ url: r.url().replace(BASE, ''), type: r.resourceType() }); });
  page.on('requestfailed', (r) => { const m = log.media.find((x) => BASE + x.url === r.url() && !x.done); if (m) { m.done = 'failed:' + (r.failure()?.errorText || ''); } });
  page.on('requestfinished', (r) => { const m = log.media.find((x) => BASE + x.url === r.url() && !x.done); if (m) m.done = 'finished'; });
  return { ctx, page, log };
}
const ready = (page) => page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 25000 });

const narrowState = (page) => page.evaluate(() => {
  const vis = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const a = document.activeElement;
  const h1s = [...document.querySelectorAll('h1')];
  const nr = [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')];
  const visNr = nr.find(vis);
  return {
    active: a === document.body ? 'BODY' : (a?.getAttribute('data-testid') || a?.tagName),
    visibleH1: h1s.filter(vis).map((h) => h.textContent.trim()),
    bodyLine: visNr ? [...visNr.querySelectorAll('p')].map((p) => p.textContent.trim())[0] : null,
    exitInDom: document.querySelectorAll('[data-testid="arrangement-exit"]').length,
    narrowRoots: nr.length,
    narrowVisible: !!visNr,
    narrowDisplay: nr.map((n) => getComputedStyle(n).display),
    scrollWidth: document.documentElement.scrollWidth, innerWidth,
    exitHref: visNr?.querySelector('[data-testid="studio-narrow-exit"]')?.getAttribute('href') ?? null,
    exitText: visNr?.querySelector('[data-testid="studio-narrow-exit"]')?.textContent.trim() ?? null,
    themeMarkers: document.querySelectorAll('[data-studio-theme]').length,
    workspaceVisible: vis(document.querySelector('[data-testid="arrangement-exit"]')),
  };
});

const ROWS = {};

ROWS['B-NARROW-LOAD'] = async (b) => {
  const out = {};
  for (const [w, h] of [[390, 844], [768, 1024], [899, 900]]) {
    const { ctx, page, log } = await newCtx(b, w, h);
    await page.goto(URL, { waitUntil: 'load' });
    await sleep(2000);
    const s = await narrowState(page);
    await page.screenshot({ path: `${SHOTS}/narrow-load-${w}x${h}.png`, fullPage: false });
    await sleep(1500);
    out[`${w}x${h}`] = { ...s, media: log.media, hydration: log.hydration, errors: [...log.console, ...log.pageErrors] };
    out[`${w}x${h}`].pass = s.active === 'BODY' && s.visibleH1.length === 1 && s.visibleH1[0] === 'The Studio works on a computer' && s.bodyLine === 'Listen here, or send yourself the link.' && s.exitInDom === 0 && s.scrollWidth === w && s.exitHref === '/' && log.hydration.length === 0;
    await ctx.close();
  }
  return out;
};

ROWS['B-BOUNDARY'] = async (b) => {
  const out = {};
  for (const js of [true, false]) {
    for (const w of [899, 900]) {
      const { ctx, page, log } = await newCtx(b, w, 900, js ? {} : { javaScriptEnabled: false });
      await page.goto(URL, { waitUntil: js ? 'load' : 'domcontentloaded' });
      await sleep(js ? 2500 : 800);
      const m = await page.evaluate(() => {
        const nr = [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')];
        const wrap = document.querySelector('.contents');
        const exit = document.querySelector('[data-testid="arrangement-exit"]');
        return {
          narrow: nr.map((n) => ({ display: getComputedStyle(n).display, rects: n.getClientRects().length })),
          wrapperDisplay: wrap ? getComputedStyle(wrap).display : null,
          wrapperChildRects: wrap ? [...wrap.children].map((c) => c.getClientRects().length) : null,
          exitRects: exit ? exit.getClientRects().length : null,
        };
      });
      await page.screenshot({ path: `${SHOTS}/boundary-${js ? 'js' : 'nojs'}-${w}.png` });
      out[`${js ? 'js' : 'nojs'}-${w}`] = { ...m, hydration: log.hydration };
      await ctx.close();
    }
  }
  const o = out;
  const narrowOnly = (x) => x.narrow.some((n) => n.rects > 0) && !x.exitRects;
  const wideOnly = (x) => x.exitRects > 0 && x.narrow.every((n) => n.display === 'none' && n.rects === 0);
  o.pass = narrowOnly(o['js-899']) && wideOnly(o['js-900']) && narrowOnly(o['nojs-899']) && wideOnly(o['nojs-900']) && o['nojs-899'].wrapperDisplay === 'none';
  return o;
};

ROWS['B-DESK-SAME'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1280, 720], [1440, 900]]) {
    const { ctx, page, log } = await newCtx(b, w, h);
    await page.goto(URL, { waitUntil: 'networkidle' });
    await ready(page);
    await sleep(1500);
    await page.mouse.move(0, h - 1);
    const buf = await page.screenshot({ path: `${SHOTS}/desk-${w}x${h}.png` });
    const ref = fs.readFileSync(`${LOOP}/b-round-291/probe/desk-5173-${w}x${h}.png`);
    const p2 = await b.newPage();
    const diff = await p2.evaluate(async ([a, c]) => {
      const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
      const px = (img) => { const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data; };
      const [ia, ib] = await Promise.all([load(a), load(c)]); if (ia.width !== ib.width || ia.height !== ib.height) return -1;
      const da = px(ia), db = px(ib); let d = 0; for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) d++; return d;
    }, [buf.toString('base64'), ref.toString('base64')]);
    await p2.close();
    const s = await narrowState(page);
    const lm = await page.evaluate(() => ({ mains: document.querySelectorAll('main').length, visibleMains: [...document.querySelectorAll('main')].filter((m) => m.getClientRects().length).length }));
    out[`${w}x${h}`] = { diff, narrowDisplay: s.narrowDisplay, themeMarkers: s.themeMarkers, ...lm, media: log.media, hydration: log.hydration, errors: [...log.console, ...log.pageErrors] };
    await ctx.close();
  }
  out.pass = out['1280x720'].diff === 0 && out['1440x900'].diff === 0 && out['1280x720'].hydration.length === 0 && out['1440x900'].hydration.length === 0;
  return out;
};

ROWS['B-THEME-AX'] = async (b) => {
  const { ctx, page, log } = await newCtx(b, 390, 844);
  await page.goto(URL, { waitUntil: 'load' }); await sleep(2000);
  const theme = await page.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d', { willReadFrequently: true });
    const rgb = (c) => { x.clearRect(0, 0, 1, 1); x.fillStyle = '#000'; x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3]]; };
    const L = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const cr = (a, c) => { const [l1, l2] = [L(a), L(c)].sort((p, q) => q - p); return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2); };
    const root = [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].find((n) => n.getClientRects().length);
    const bg = rgb(getComputedStyle(root).backgroundColor);
    const items = { heading: root.querySelector('h1'), bodyLine: root.querySelector('p'), previewLabel: root.querySelectorAll('p')[1], exit: root.querySelector('[data-testid="studio-narrow-exit"]'), button: root.querySelector('button') };
    const contrast = Object.fromEntries(Object.entries(items).map(([k, e]) => [k, { color: getComputedStyle(e).color, ratio: cr(rgb(getComputedStyle(e).color), bg) }]));
    return { bodyBg: getComputedStyle(document.body).backgroundColor, rootBg: getComputedStyle(root).backgroundColor, audioScheme: getComputedStyle(root.querySelector('audio')).colorScheme, contrast, mains: document.querySelectorAll('main').length };
  });
  const cdp = await ctx.newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const live = nodes.filter((n) => !n.ignored);
  const pick = (n) => ({ role: n.role?.value, name: n.name?.value, level: n.properties?.find((p) => p.name === 'level')?.value?.value });
  const ax = {
    headings: live.filter((n) => n.role?.value === 'heading').map(pick),
    buttons: live.filter((n) => n.role?.value === 'button').map(pick),
    status: live.filter((n) => n.role?.value === 'status').map(pick),
    mainLandmarks: live.filter((n) => n.role?.value === 'main').map(pick),
    audioLike: live.filter((n) => /audio|Audio/.test(n.role?.value || '') || (n.name?.value || '').includes('Middle East')).map(pick),
    links: live.filter((n) => n.role?.value === 'link').map(pick),
  };
  await page.screenshot({ path: `${SHOTS}/theme-390.png` });
  await ctx.close();
  const c = theme.contrast;
  return {
    theme, ax, hydration: log.hydration,
    themePass: theme.bodyBg === 'rgb(14, 13, 12)' && theme.audioScheme === 'dark' && c.heading.ratio >= 4.5 && c.bodyLine.ratio >= 4.5,
    axPass: ax.headings.length === 1 && ax.headings[0].level === 1 && ax.audioLike.some((n) => n.name === 'Middle East — public preview') && ax.buttons.some((n) => n.name === 'Send link') && ax.status.length >= 1,
  };
};

ROWS['B-FOCUS-ORDER'] = async (b) => {
  const { ctx, page } = await newCtx(b, 390, 844);
  await page.goto(URL, { waitUntil: 'load' }); await sleep(2000);
  const seq = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { el: a.tagName + ':' + (a.getAttribute('data-testid') || a.textContent.trim().slice(0, 15)), fv: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor }; });
    seq.push(s);
    if (i < 3) await page.screenshot({ path: `${SHOTS}/focus-390-tab${i + 1}.png` });
    if (s.el.startsWith('BUTTON:Send link')) break;
  }
  await ctx.close();
  const distinct = seq.map((s) => s.el.split(':')[0] + ':' + s.el.split(':')[1]).filter((v, i, a) => a.indexOf(v) === i);
  const exit = seq[0]; const btn = seq.find((s) => s.el.startsWith('BUTTON:Send link'));
  const ow = (s) => parseFloat(s.outline.split(' ')[1]);
  return { seq, distinct, pass: distinct[0] === 'A:studio-narrow-exit' && distinct[1]?.startsWith('AUDIO') && distinct[2] === 'BUTTON:Send link' && exit.fv && ow(exit) >= 1 && btn?.fv && ow(btn) >= 1 && seq.find((s) => s.el.startsWith('AUDIO')).fv, audioInternalStops: seq.filter((s) => s.el.startsWith('AUDIO')).length };
};

ROWS['B-PREVIEW'] = async (b) => {
  const { ctx, page } = await newCtx(b, 390, 844);
  await page.goto(URL, { waitUntil: 'load' }); await sleep(2500);
  const au = page.locator('[data-testid="studio-narrow-screen"] audio').first();
  const before = await au.evaluate((a) => ({ duration: a.duration, readyState: a.readyState, paused: a.paused }));
  await page.screenshot({ path: `${SHOTS}/preview-before-play.png` });
  const box = await au.boundingBox();
  await page.mouse.click(box.x + 20, box.y + box.height / 2);
  await sleep(200);
  const t0 = await au.evaluate((a) => ({ paused: a.paused, t: a.currentTime }));
  await sleep(1000);
  const t1 = await au.evaluate((a) => ({ paused: a.paused, t: a.currentTime }));
  await page.screenshot({ path: `${SHOTS}/preview-playing.png` });
  await page.mouse.click(box.x + 20, box.y + box.height / 2);
  await sleep(300);
  const t2 = await au.evaluate((a) => ({ paused: a.paused, t: a.currentTime }));
  await sleep(600);
  const t3 = await au.evaluate((a) => ({ paused: a.paused, t: a.currentTime }));
  await ctx.close();
  return { before, t0, t1, t2, t3, advanced: +(t1.t - t0.t).toFixed(3), pass: Math.abs(before.duration - 101) < 2 && !t0.paused && !t1.paused && t1.t - t0.t >= 0.5 && t2.paused && t3.t === t2.t };
};

const sendState = (page) => page.evaluate(() => {
  const root = [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].find((n) => n.getClientRects().length);
  const field = root.querySelector('input');
  return { status: root.querySelector('output')?.textContent ?? null, field: field?.value ?? null, fieldLabel: field ? root.querySelector(`label[for="${field.id}"]`)?.textContent : null, fieldFocused: !!field && document.activeElement === field, fieldSelected: field ? [field.selectionStart, field.selectionEnd] : null, href: location.href, shareCalls: window.__shareCalls ?? null, writes: window.__writes ?? null };
});

ROWS['B-SEND'] = async (b) => {
  const out = {};
  {
    const { ctx, page } = await newCtx(b, 390, 844);
    await page.goto(URL, { waitUntil: 'load' }); await sleep(1500);
    const share = await page.evaluate(() => typeof navigator.share);
    await page.getByRole('button', { name: 'Send link' }).click(); await sleep(400);
    const s = await sendState(page);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    await page.screenshot({ path: `${SHOTS}/send-a-copied.png` });
    out.a = { share, ...s, clip, pass: share === 'undefined' && s.status === 'Link copied' && clip === s.href };
    await ctx.close();
  }
  {
    const { ctx, page } = await newCtx(b, 390, 844);
    await ctx.addInitScript(() => { window.__writes = 0; const c = navigator.clipboard; if (c) { c.writeText = () => { window.__writes++; return Promise.reject(new DOMException('denied', 'NotAllowedError')); }; } });
    await page.goto(URL, { waitUntil: 'load' }); await sleep(1500);
    await page.getByRole('button', { name: 'Send link' }).click(); await sleep(400);
    const s = await sendState(page);
    await page.screenshot({ path: `${SHOTS}/send-b-failed.png` });
    await page.getByRole('button', { name: 'Send link' }).click(); await sleep(400);
    const s2 = await sendState(page);
    out.b = { ...s, second: { status: s2.status, fieldFocused: s2.fieldFocused }, pass: s.status === "Couldn't copy the link." && s.field === s.href && s.fieldFocused && s.fieldLabel === 'Studio link' };
    await ctx.close();
  }
  for (const mode of ['c', 'd']) {
    const { ctx, page } = await newCtx(b, 390, 844);
    await ctx.addInitScript((m) => {
      window.__shareCalls = []; window.__writes = 0;
      navigator.share = (d) => { window.__shareCalls.push(d); return m === 'd' ? Promise.reject(new DOMException('cancel', 'AbortError')) : Promise.resolve(); };
      const c = navigator.clipboard; if (c) { const o = c.writeText.bind(c); c.writeText = (t) => { window.__writes++; return o(t); }; }
    }, mode);
    await page.goto(URL, { waitUntil: 'load' }); await sleep(1500);
    await page.getByRole('button', { name: 'Send link' }).click(); await sleep(400);
    const s = await sendState(page);
    out[mode] = { ...s, pass: s.shareCalls.length === 1 && s.shareCalls[0].url === s.href && s.shareCalls[0].title === 'CZABA Studio' && s.status === '' && s.writes === 0 && s.field === null };
    await ctx.close();
  }
  out.pass = out.a.pass && out.b.pass && out.c.pass && out.d.pass;
  return out;
};

ROWS['B-AUDIO-ERROR'] = async (b) => {
  const { ctx, page } = await newCtx(b, 390, 844);
  await page.route('**/middle-east.mp3', (r) => r.abort());
  await page.goto(URL, { waitUntil: 'load' }); await sleep(2500);
  const s = await page.evaluate(() => { const root = [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].find((n) => n.getClientRects().length); return { text: [...root.querySelectorAll('p')].map((p) => p.textContent.trim()), audio: root.querySelectorAll('audio').length, send: !!root.querySelector('button') }; });
  await page.getByRole('button', { name: 'Send link' }).click(); await sleep(400);
  const st = await sendState(page);
  await page.screenshot({ path: `${SHOTS}/audio-error-390.png` });
  await ctx.close();
  return { ...s, status: st.status, pass: s.text.includes('Preview unavailable.') && !s.text.includes('Middle East — public preview') && s.audio === 0 && st.status === 'Link copied' };
};

const wsState = (page) => page.evaluate(() => ({
  active: document.activeElement === document.body ? 'BODY' : (document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName),
  playing: document.querySelector('[data-playing]')?.getAttribute('data-playing') ?? null,
  clips: document.querySelectorAll('[data-clip-id]').length,
  exit: !!document.querySelector('[data-testid="arrangement-exit"]'),
  narrowVisible: [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].some((n) => n.getClientRects().length),
}));
const muteMusic = (page) => page.getByRole('button', { name: 'Mute — Music', exact: true });

ROWS['B-RESIZE-KEEP'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const { ctx, page, log } = await newCtx(b, w, h);
    await page.goto(URL); await ready(page); await sleep(800);
    await page.getByRole('option', { name: /Bass/ }).first().click();
    await page.keyboard.press('Enter'); await sleep(800);
    await muteMusic(page).click();
    const before = { ...(await wsState(page)), muted: await muteMusic(page).getAttribute('aria-pressed') };
    await page.locator('[data-playing]').click(); await sleep(1000);
    const playing = { ...(await wsState(page)), rms: await rms(page) };
    const t = Date.now();
    await page.setViewportSize({ width: 899, height: h });
    const samples = [];
    for (const at of [100, 200, 300, 1000]) { const d = at - (Date.now() - t); if (d > 0) await sleep(d); samples.push({ at: Date.now() - t, rms: await rms(page) }); }
    const narrow = await wsState(page);
    await page.screenshot({ path: `${SHOTS}/resize-${w}-narrow.png` });
    await page.getByRole('button', { name: 'Send link' }).focus();
    await page.keyboard.press('Space'); await sleep(400);
    const send = { ...(await sendState(page)), clip: await page.evaluate(() => navigator.clipboard.readText()), rms: await rms(page) };
    await page.setViewportSize({ width: w, height: h }); await sleep(700);
    const back = { ...(await wsState(page)), muted: await muteMusic(page).getAttribute('aria-pressed') };
    await page.screenshot({ path: `${SHOTS}/resize-${w}-back.png` });
    await page.keyboard.press('Control+z'); await sleep(300);
    const undo = await muteMusic(page).getAttribute('aria-pressed');
    out[w] = { before, playing, samples, narrow, send, back, undo, hydration: log.hydration, errors: [...log.console, ...log.pageErrors] };
    out[w].pass = playing.playing === 'true' && playing.rms > 0.001 && samples.filter((s) => s.at <= 320).slice(-1)[0].rms === 0 && narrow.active === 'studio-narrow-heading' && !narrow.exit && narrow.narrowVisible && send.status === 'Link copied' && send.clip === send.href && send.rms === 0 && back.clips === before.clips && back.clips >= 1 && back.muted === 'true' && back.playing === 'false' && back.active === 'arrangement-exit' && undo === 'false';
    await ctx.close();
  }
  out.pass = out[1440].pass && out[1280].pass;
  return out;
};

ROWS['X-BODY-KEYS'] = async (b) => {
  const { ctx, page } = await newCtx(b, 1440, 900);
  await page.goto(URL); await ready(page); await sleep(800);
  await page.getByRole('option', { name: /Bass/ }).first().click();
  await page.keyboard.press('Enter'); await sleep(800);
  const clip = page.locator('[data-clip-id]').first();
  const cb = await clip.boundingBox();
  await page.mouse.click(cb.x + Math.min(30, cb.width / 2), cb.y + 6); await sleep(300);
  const sel = await page.evaluate(() => document.querySelectorAll('[data-clip-id][data-selected="true"], [data-clip-id][aria-selected="true"]').length);
  const before = await wsState(page);
  await page.setViewportSize({ width: 899, height: 900 }); await sleep(400);
  await page.evaluate(() => document.activeElement?.blur());
  const act = await page.evaluate(() => document.activeElement === document.body);
  for (const k of ['Space', 'Delete', 'Backspace', 'Control+x', 'Control+z']) { await page.keyboard.press(k); await sleep(250); }
  const narrowRms = await rms(page);
  await page.setViewportSize({ width: 1440, height: 900 }); await sleep(700);
  const after = await wsState(page);
  await ctx.close();
  return { sel, before, bodyFocused: act, narrowRms, after, pass: act && narrowRms === 0 && after.clips === before.clips && after.playing === 'false' };
};

ROWS['X-LIBRARY-PREVIEW'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const { ctx, page } = await newCtx(b, w, h);
    await page.goto(URL); await ready(page); await sleep(800);
    await page.getByRole('option', { name: /Bass/ }).first().click(); await sleep(500);
    const pv = page.getByRole('button', { name: /^Preview/ }).first();
    const pvInfo = await pv.evaluate((e) => ({ label: e.getAttribute('aria-label'), text: e.textContent.trim(), title: e.title }));
    await pv.click(); await sleep(1200);
    const playingRms = await rms(page);
    const stopVisible = await page.getByRole('button', { name: /^Stop/ }).count();
    const t = Date.now();
    await page.setViewportSize({ width: 899, height: h });
    const samples = [];
    for (const at of [300, 1000, 2500]) { const d = at - (Date.now() - t); if (d > 0) await sleep(d); samples.push({ at: Date.now() - t, rms: await rms(page) }); }
    const narrow = await wsState(page);
    await page.screenshot({ path: `${SHOTS}/libpreview-${w}-narrow.png` });
    const narrowStopControls = await page.evaluate(() => { const root = [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].find((n) => n.getClientRects().length); return [...root.querySelectorAll('button,audio')].map((e) => e.tagName + ':' + e.textContent.trim()); });
    await page.setViewportSize({ width: w, height: h }); await sleep(700);
    const backRms = await rms(page);
    const backPreviewBtn = await page.getByRole('button', { name: /^(Preview|Stop)/ }).first().evaluate((e) => e.getAttribute('aria-label') || e.textContent.trim()).catch(() => null);
    out[w] = { pvInfo, playingRms, stopVisible, samples, narrow, narrowStopControls, backRms, backPreviewBtn, audibleBehindNarrow: samples.some((s) => s.at >= 900 && s.rms > 0.001) };
    await ctx.close();
  }
  return out;
};


ROWS['X-RESIZE-AUDIBLE'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const { ctx, page } = await newCtx(b, w, h);
    await page.goto(URL); await ready(page); await sleep(800);
    await page.getByRole('option', { name: /Bass/ }).first().click();
    await page.keyboard.press('Enter'); await sleep(800);
    const lane = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return c?.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null; });
    await page.locator('[data-playing]').click(); await sleep(1000);
    const playRms = await rms(page);
    const t = Date.now();
    await page.setViewportSize({ width: 899, height: h });
    const samples = [];
    for (const at of [100, 200, 300, 1000]) { const d = at - (Date.now() - t); if (d > 0) await sleep(d); samples.push({ at: Date.now() - t, rms: await rms(page) }); }
    await page.setViewportSize({ width: w, height: h }); await sleep(600);
    const back = await wsState(page);
    out[w] = { lane, playRms, samples, back, pass: playRms > 0.001 && samples.filter((s) => s.at <= 320).slice(-1)[0].rms === 0 && back.playing === 'false' && back.clips === 1 };
    await ctx.close();
  }
  out.pass = out[1440].pass && out[1280].pass;
  return out;
};

ROWS['X-DELETE-SELECTED'] = async (b) => {
  const out = {};
  for (const narrowFirst of [false, true]) {
    const { ctx, page } = await newCtx(b, 1440, 900);
    await page.goto(URL); await ready(page); await sleep(800);
    await page.getByRole('option', { name: /Bass/ }).first().click();
    await page.keyboard.press('Enter'); await sleep(800);
    const cb = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.click(cb.x + Math.min(30, cb.width / 2), cb.y + 6); await sleep(300);
    if (narrowFirst) { await page.setViewportSize({ width: 899, height: 900 }); await sleep(400); await page.evaluate(() => document.activeElement?.blur()); }
    await page.keyboard.press('Delete'); await sleep(300);
    await page.keyboard.press('Backspace'); await sleep(300);
    if (narrowFirst) { await page.setViewportSize({ width: 1440, height: 900 }); await sleep(600); }
    out[narrowFirst ? 'narrow' : 'control'] = await wsState(page);
    await ctx.close();
  }
  out.pass = out.control.clips === 0 && out.narrow.clips === 1;
  return out;
};

ROWS['X-PREVIEW-LIFETIME'] = async (b) => {
  const { ctx, page } = await newCtx(b, 1440, 900);
  await page.goto(URL); await ready(page); await sleep(800);
  await page.getByRole('option', { name: /Bass/ }).first().click(); await sleep(500);
  await page.getByRole('button', { name: /^Preview/ }).first().click(); await sleep(1000);
  const t = Date.now();
  await page.setViewportSize({ width: 390, height: 844 });
  const samples = [];
  for (const at of [500, 5000, 10000, 20000, 30000]) { const d = at - (Date.now() - t); if (d > 0) await sleep(d); samples.push({ at: Date.now() - t, rms: await rms(page) }); }
  await page.screenshot({ path: `${SHOTS}/libpreview-390-after-narrow.png` });
  const narrow = await wsState(page);
  await ctx.close();
  return { samples, narrow };
};

ROWS['B-NARROW-WIDE'] = async (b) => {
  const { ctx, page, log } = await newCtx(b, 390, 844);
  await page.goto(URL); await sleep(2000);
  await page.getByRole('button', { name: 'Send link' }).focus();
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page); await sleep(300);
  const s = await wsState(page);
  await page.screenshot({ path: `${SHOTS}/narrow-wide-1440.png` });
  await page.getByRole('option', { name: /Bass/ }).first().click();
  await page.keyboard.press('Enter'); await sleep(800);
  const clips = await page.locator('[data-clip-id]').count();
  await page.locator('[data-playing]').click(); await sleep(1000);
  const p = { ...(await wsState(page)), rms: await rms(page) };
  await page.screenshot({ path: `${SHOTS}/narrow-wide-playing.png` });
  await ctx.close();
  return { s, clips, p, hydration: log.hydration, pass: s.active === 'arrangement-exit' && !s.narrowVisible && clips >= 1 && p.playing === 'true' && p.rms > 0.001 };
};

ROWS['B-NET'] = async (b) => {
  const out = {};
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const { ctx, page, log } = await newCtx(b, w, h);
    await page.goto(URL); await sleep(6000);
    out[`${w}x${h}`] = { media: log.media, urls: [...new Set(log.media.map((m) => m.url))] };
    await ctx.close();
  }
  const head = JSON.parse(fs.readFileSync(`${LOOP}/b-round-291/probe/narrow-head.json`, 'utf8'));
  out.head390 = head['390x844'].mediaRequests;
  const allowed = ['/middle-east.mp3', '/videos/hero/hero-music.mp3'];
  out.pass = out['390x844'].urls.every((u) => allowed.includes(u));
  return out;
};

ROWS['B-JOURNEY-292'] = async (b) => {
  const { ctx, page } = await newCtx(b, 390, 844);
  const steps = [];
  await page.goto(`${BASE}/`, { waitUntil: 'load' }); await sleep(1500);
  await page.screenshot({ path: `${SHOTS}/journey-1-home.png` }); steps.push({ step: 'home', url: page.url() });
  await page.getByRole('button', { name: 'Toggle menu' }).click(); await sleep(500);
  const studioLink = page.locator('#header-mobile-menu a[href="/studio-lab"]').filter({ visible: true }).first();
  const linkText = await studioLink.textContent();
  await page.screenshot({ path: `${SHOTS}/journey-2-menu.png` }); steps.push({ step: 'menu', linkText: linkText?.trim() });
  await studioLink.click(); await page.waitForURL('**/studio-lab'); await sleep(2000);
  const ns = await narrowState(page);
  await page.screenshot({ path: `${SHOTS}/journey-3-narrow.png` }); steps.push({ step: 'narrow', url: page.url(), ...ns });
  await page.getByRole('button', { name: 'Send link' }).click(); await sleep(400);
  const ss = await sendState(page);
  await page.screenshot({ path: `${SHOTS}/journey-4-send.png` }); steps.push({ step: 'send', status: ss.status });
  await page.getByTestId('studio-narrow-exit').filter({ visible: true }).click(); await page.waitForURL(`${BASE}/`); await sleep(800);
  await page.screenshot({ path: `${SHOTS}/journey-5-back-home.png` }); steps.push({ step: 'back', url: page.url() });
  await ctx.close();
  return { steps, pass: linkText?.trim() === 'Studio' && ns.visibleH1[0] === 'The Studio works on a computer' && ns.active === 'BODY' && ns.exitInDom === 0 && ss.status === 'Link copied' && steps[4].url === `${BASE}/` };
};

ROWS['G292-AUTH'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await newCtx(b, w, h);
    await page.goto(URL); await sleep(w > 900 ? 0 : 2000); if (w > 900) await ready(page);
    out[`lab-${w}`] = await page.evaluate(() => ({ authUser: localStorage.getItem('auth_user'), badge: [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /demo/i.test(e.textContent) && e.getClientRects().length).map((e) => e.textContent.trim()).slice(0, 3), narrow: [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].some((n) => n.getClientRects().length) }));
    await ctx.close();
  }
  const { ctx, page } = await newCtx(b, 1440, 900);
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(4000); await page.waitForLoadState('load');
  out.legacy = await page.evaluate(() => ({ signIn: document.body.innerText.includes('Sign in required'), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
  await page.screenshot({ path: `${SHOTS}/auth-legacy.png` });
  const tok = await page.evaluate(async () => { const r = []; for (const m of ['GET', 'POST']) { const x = await fetch('/api/studio-token?product=middle-east&file=stem-01.wav', { method: m }); const t = await x.text(); r.push({ m, status: x.status, body: t.slice(0, 200), hasToken: /token"\s*:\s*"[A-Za-z0-9._-]{10,}/.test(t) }); } return r; });
  out.token = tok;
  await ctx.close();
  out.pass = out['lab-1440'].authUser === null && out['lab-390'].narrow && out['lab-390'].authUser === null && out.legacy.signIn && out.legacy.audioSrc === 0 && tok.some((t) => t.status === 401) && tok.every((t) => !t.hasToken);
  return out;
};

(async () => {
  const b = await chromium.launch();
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(URL); await sleep(4000); await c.close(); }
  for (const [name, fn] of Object.entries(ROWS)) {
    if (filter && !filter.test(name)) continue;
    const t = Date.now();
    try { R[name] = await fn(b); } catch (e) { R[name] = { error: String(e).slice(0, 500) }; }
    R[name].ms = Date.now() - t;
    save();
    console.log(name, R[name].pass ?? (R[name].error ? 'ERROR ' + R[name].error : 'info'));
  }
  await b.close();
})();
