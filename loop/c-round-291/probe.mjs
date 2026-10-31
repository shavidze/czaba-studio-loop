// C291 main probe (adapted from own c-round-289/probe.mjs): B-SCREEN, B-KEYS-291, B-STATES-291 (+ariaSnapshot), S3 focus stability, B-JOURNEY-291 (+data-playing, audio tap, WAV export). node probe.mjs <base> <tag>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [BASE = 'http://127.0.0.1:5173', TAG = 'a'] = process.argv.slice(2);
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-291';
const GEO = /[Ⴀ-ჿ]/;
const out = {};
const tapScript = () => {
  window.__tapRms = [];
  const orig = AudioNode.prototype.connect;
  const taps = new WeakMap();
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    try {
      if (dest instanceof AudioDestinationNode && typeof AudioContext !== 'undefined' && this.context instanceof AudioContext) {
        let an = taps.get(this.context);
        if (!an) {
          an = this.context.createAnalyser(); an.fftSize = 2048; taps.set(this.context, an);
          window.__analysers = window.__analysers || []; window.__analysers.push(an);
        }
        orig.call(this, an);
      }
    } catch {}
    return r;
  };
  window.__sampleRms = () => (window.__analysers || []).map((an) => {
    const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b);
    let s = 0, p = 0; for (const v of b) { s += v * v; p = Math.max(p, Math.abs(v)); }
    return { rms: Math.sqrt(s / b.length), peak: p, state: an.context.state, t: an.context.currentTime };
  });
};
const ready = async (page) => {
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await page.waitForTimeout(800);
};
const geoScan = (page) => page.evaluate(() => {
  const re = /[Ⴀ-ჿ]/;
  const lines = [...new Set(document.body.innerText.split('\n').filter((l) => re.test(l)).map((l) => l.trim()))];
  const attrs = [];
  for (const el of document.querySelectorAll('*')) for (const a of el.attributes) {
    if ((a.name === 'title' || a.name.startsWith('aria-') || a.name === 'alt' || a.name === 'placeholder') && re.test(a.value)) attrs.push(`${el.tagName}[${a.name}]=${a.value}`);
  }
  return { lines, attrs, title: document.title };
});
const listState = (page) => page.evaluate(() => {
  const list = document.querySelector('[data-testid="arrangement-library-list"]');
  const groups = [...list.querySelectorAll('[role="group"]')].map((g) => {
    const h = document.getElementById(g.getAttribute('aria-labelledby'));
    return { name: h?.textContent, headingRole: h?.getAttribute('role'), headingTab: h?.tabIndex, headingTag: h?.tagName, parentIsList: g.parentElement === list };
  });
  const options = [...list.querySelectorAll('[role="option"]')];
  return {
    options: options.map((o) => o.dataset.sourceId),
    titles: options.map((o) => o.title),
    shown: options.map((o) => o.querySelector('[data-testid="arrangement-library-option-title"]')?.textContent),
    directChildren: options.every((o) => o.parentElement === list),
    groups,
    context: document.querySelectorAll('[data-testid="arrangement-library-option-context"]').length,
    empty: !!document.querySelector('[data-testid="arrangement-library-empty"]'),
  };
});
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = {}; out[k] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  r.cookies0 = (await ctx.cookies()).length;
  await ctx.addInitScript(tapScript);
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await ready(page);
  r.storage0 = await page.evaluate(() => ({ auth: localStorage.getItem('auth_user') }));
  // B-NAMES + B-GROUPS + B-SCREEN
  r.list = await listState(page);
  r.tree = await page.evaluate(() => document.querySelector('nav')?.innerText);
  r.geo = await geoScan(page);
  r.layout = await page.evaluate(() => {
    const list = document.querySelector('[data-testid="arrangement-library-list"]');
    const heads = [...list.querySelectorAll('[role="group"]')].map((g) => document.getElementById(g.getAttribute('aria-labelledby')));
    const opts = [...list.querySelectorAll('[role="option"]')];
    const gaps = [];
    for (const g of list.querySelectorAll('[role="group"]')) {
      const os = [...g.querySelectorAll('[role="option"]')];
      for (let i = 1; i < os.length; i++) gaps.push(+(os[i].getBoundingClientRect().top - os[i - 1].getBoundingClientRect().bottom).toFixed(2));
    }
    const boundary = [];
    const gs = [...list.querySelectorAll('[role="group"]')];
    for (let i = 1; i < gs.length; i++) { const prev = gs[i - 1].querySelectorAll('[role="option"]'); const first = gs[i].querySelector('[role="option"]'); boundary.push(+(first.getBoundingClientRect().top - prev[prev.length - 1].getBoundingClientRect().bottom).toFixed(2)); }
    return {
      listWidth: list.getBoundingClientRect().width,
      aside: document.querySelector('aside')?.getBoundingClientRect().width,
      heads: heads.map((e) => ({ text: e.textContent, h: e.getBoundingClientRect().height, sw: e.scrollWidth, cw: e.clientWidth, truncated: e.scrollWidth > e.clientWidth, cls: e.className })),
      optH: Object.fromEntries(opts.map((o) => [o.dataset.sourceId, o.getBoundingClientRect().height])),
      gapsInGroup: gaps, boundaryGap: boundary,
      scrollHeight: list.scrollHeight, clientHeight: list.clientHeight,
      count: { titles: list.querySelectorAll('[data-testid="arrangement-library-option-title"]').length, context: list.querySelectorAll('[data-testid="arrangement-library-option-context"]').length, headings: list.querySelectorAll('[role="group"] > div[id]').length },
    };
  });
  await page.screenshot({ path: `${DIR}/shots/all-${TAG}-${k}.png` });
  await page.locator('[data-testid="arrangement-library-list"]').screenshot({ path: `${DIR}/shots/list-${TAG}-${k}.png` });
  // B-KEYS (keyboard focus: Tab into focus target would be cleaner; focus() then keys gives :focus-visible via keyboard modality after first key)
  r.keys = [];
  await page.locator('[role="option"]').first().focus();
  const step = async (key) => {
    if (key) await page.keyboard.press(key);
    await page.waitForTimeout(250);
    r.keys.push(await page.evaluate((key) => {
      const a = document.activeElement; const list = document.querySelector('[data-testid="arrangement-library-list"]');
      const ab = a.getBoundingClientRect(); const lb = list.getBoundingClientRect();
      const top = lb.top + list.clientTop, bottom = top + list.clientHeight;
      const cs = getComputedStyle(a);
      return { key, id: a.dataset.sourceId || a.tagName, role: a.getAttribute('role'), inside: ab.top >= top - 0.5 && ab.bottom <= bottom + 0.5, fv: a.matches(':focus-visible'), ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}|${cs.boxShadow}` };
    }, key));
  };
  await step(null);
  for (let i = 0; i < 8; i++) await step('ArrowDown');
  for (let i = 0; i < 8; i++) await step('ArrowUp');
  await page.screenshot({ path: `${DIR}/shots/keys-end-${TAG}-${k}.png` });
  // B-STATES-291
  const tree = page.locator('nav');
  await tree.getByRole('button', { name: /^Synthetic demo/ }).last().click(); await page.waitForTimeout(400);
  r.a = await listState(page); r.aSnap = await page.getByTestId('arrangement-library-list').ariaSnapshot();
  await page.screenshot({ path: `${DIR}/shots/state-a-${TAG}-${k}.png` });
  await tree.getByRole('button', { name: /^All/ }).click(); await page.waitForTimeout(400);
  const search = page.getByRole('searchbox', { name: 'Search the library' }).or(page.getByRole('textbox', { name: 'Search the library' }));
  for (const [s, q] of [['b', 'bass'], ['c', 'synthetic']]) { await search.fill(q); await page.waitForTimeout(500); r[s] = await listState(page); r[s + 'Snap'] = await page.getByTestId('arrangement-library-list').ariaSnapshot(); r[s + 'TextLines'] = (r[s + 'Snap'].match(/^\s*- text:/gm) ?? []).length; await page.screenshot({ path: `${DIR}/shots/state-${s}-${TAG}-${k}.png` }); }
  await search.fill(''); await page.waitForTimeout(400);
  // S3 browser: focused option keeps node + focus when results change around it (value set without moving focus)
  r.s3 = {};
  const candidates = ['e', 's', 'a', 'o', 'l', 'p', 'u', 'i', 't', 'se', 'ss', 'as'];
  for (const q of candidates) {
    const probe = await page.evaluate((q) => {
      const inp = document.querySelector('[data-testid="arrangement-library-search"] input') || document.querySelector('input[aria-label="Search the library"]') || [...document.querySelectorAll('input')].find((i) => i.getAttribute('aria-label') === 'Search the library' || i.placeholder?.includes('Search'));
      return !!inp;
    }, q);
    r.s3.inputFound = probe; break;
  }
  const setQ = (q) => page.evaluate((q) => {
    const inp = document.querySelector('input[aria-label="Search the library"]') || document.querySelector('[data-testid="arrangement-library-search"] input') || document.querySelector('[data-testid="arrangement-library-search"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(inp, q); inp.dispatchEvent(new Event('input', { bubbles: true }));
  }, q);
  const pick = [];
  for (const q of candidates) { await setQ(q); await page.waitForTimeout(300); const st = await listState(page); pick.push({ q, groups: st.groups.map((g) => g.name), options: st.options }); }
  await setQ(''); await page.waitForTimeout(300);
  r.s3.candidates = pick;
  const chosen = pick.find((p) => p.groups.length === 2 && !p.options.includes('demo-synth-mix') && p.options.includes('demo-stem-bass'));
  r.s3.chosen = chosen?.q ?? null;
  if (chosen) {
    await page.locator('[role="option"][data-source-id="demo-stem-bass"]').focus(); await page.keyboard.press('Shift'); await page.waitForTimeout(200);
    await page.evaluate(() => { window.__kept = document.activeElement; });
    r.s3.before = await page.evaluate(() => document.activeElement?.dataset?.sourceId);
    await setQ(chosen.q); await page.waitForTimeout(500);
    r.s3.after = await page.evaluate(() => ({ active: document.activeElement?.dataset?.sourceId || document.activeElement?.tagName, sameNode: document.activeElement === window.__kept, connected: window.__kept.isConnected }));
    r.s3.list = await listState(page);
    await setQ(''); await page.waitForTimeout(300);
  }
  r.errors = errors;
  await ctx.close();

  // B-JOURNEY fresh context
  const ctx2 = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx2.addInitScript(tapScript);
  const p2 = await ctx2.newPage();
  const errors2 = []; p2.on('pageerror', (e) => errors2.push(String(e)));
  await ready(p2);
  const j = {}; r.journey = j;
  await p2.locator('[role="option"][data-source-id="demo-stem-bass"]').click();
  await p2.keyboard.press('Enter');
  await p2.waitForTimeout(2000);
  Object.assign(j, await p2.evaluate(() => ({
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent.trim(),
    undo: [...document.querySelectorAll('button')].filter((b) => /^Undo/.test(b.textContent.trim())).map((b) => ({ text: b.textContent.trim(), title: b.title })),
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ label: c.getAttribute('aria-label'), text: c.textContent.trim().slice(0, 80) })),
    footer: document.querySelector('[data-testid="arrangement-selected-clip"]')?.textContent.trim(),
    pos0: document.querySelector('[data-testid="arrangement-position"]')?.textContent.trim(),
  })));
  j.geoAfterAdd = await geoScan(p2);
  await p2.screenshot({ path: `${DIR}/shots/journey-added-${TAG}-${k}.png` });
  j.rmsBefore = await p2.evaluate(() => window.__sampleRms());
  const playingAttr = () => p2.evaluate(() => [...document.querySelectorAll('[data-playing]')].map((e) => e.getAttribute('data-playing')).join(','));
  j.playing0 = await playingAttr();
  await p2.getByRole('button', { name: 'Play', exact: true }).first().click();
  const tPlay = Date.now();
  const samples = [];
  for (let i = 0; i < 5; i++) { await p2.waitForTimeout(250); samples.push(await p2.evaluate(() => window.__sampleRms())); }
  j.rmsPlaying = samples;
  await p2.waitForTimeout(Math.max(0, 1500 - (Date.now() - tPlay)));
  j.posAt1500 = await p2.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent.trim()); j.playing1 = await playingAttr(); j.tAt = Date.now() - tPlay;
  j.pos1 = await p2.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent.trim());
  await p2.screenshot({ path: `${DIR}/shots/journey-playing-${TAG}-${k}.png` });
  await p2.getByRole('button', { name: 'Stop', exact: true }).first().click();
  await p2.waitForTimeout(500);
  j.rmsAfterStop = await p2.evaluate(() => window.__sampleRms());
  j.pos2 = await p2.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent.trim()); j.playing2 = await playingAttr();
  // Export WAV
  try {
    await p2.getByRole('button', { name: /^Export/ }).first().click();
    await p2.waitForTimeout(800);
    j.exportDialogGeo = await geoScan(p2);
    await p2.screenshot({ path: `${DIR}/shots/export-dialog-${TAG}-${k}.png` });
    const wavBtn = p2.getByRole('dialog').getByRole('button', { name: 'Export WAV', exact: true });
    const [dl] = await Promise.all([p2.waitForEvent('download', { timeout: 120000 }), wavBtn.click()]);
    const file = `${DIR}/probe/export-${TAG}-${k}.wav`;
    await dl.saveAs(file);
    j.exportName = dl.suggestedFilename();
    const b = fs.readFileSync(file);
    const fmtIdx = b.indexOf('fmt '); const dataIdx = b.indexOf('data');
    const ch = b.readUInt16LE(fmtIdx + 10), sr = b.readUInt32LE(fmtIdx + 12), bits = b.readUInt16LE(fmtIdx + 22), fmtTag = b.readUInt16LE(fmtIdx + 8);
    const dataLen = b.readUInt32LE(dataIdx + 4); const bps = bits / 8; const frames = dataLen / (ch * bps);
    let peak = 0, sumsq = 0, nonzero = 0, n = 0; const start = dataIdx + 8;
    const firstNZ = { f: -1 };
    for (let i = 0; i < frames; i++) {
      for (let c = 0; c < ch; c++) {
        const o = start + (i * ch + c) * bps; let v;
        if (bits === 16) v = b.readInt16LE(o) / 32768; else if (bits === 24) v = b.readIntLE(o, 3) / 8388608; else if (bits === 32 && fmtTag === 3) v = b.readFloatLE(o); else v = b.readInt32LE(o) / 2147483648;
        if (v !== 0) { nonzero++; if (firstNZ.f < 0) firstNZ.f = i; }
        peak = Math.max(peak, Math.abs(v)); sumsq += v * v; n++;
      }
    }
    j.wav = { name: j.exportName, fmtTag, ch, sr, bits, frames, duration: frames / sr, peak, rms: Math.sqrt(sumsq / n), nonzeroFrac: nonzero / n, firstNonzeroFrame: firstNZ.f, bytes: b.length, riffOk: b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WAVE', riffSize: b.readUInt32LE(4) + 8 };
    j.exportStatus = await p2.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.trim());
  } catch (e) { j.exportError = String(e).slice(0, 300); }
  j.geoEnd = await geoScan(p2);
  j.errors = errors2;
  await ctx2.close();
  console.error('done', k);
}
await browser.close();
fs.writeFileSync(`${DIR}/probe/main-${TAG}.json`, JSON.stringify(out, null, 1));
console.log('ok');
