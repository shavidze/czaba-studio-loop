const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const req = createRequire('/tmp/b216-probe/package.json');
const { chromium } = req('@playwright/test');

const BASE = 'http://127.0.0.1:5197';
const OUT = __dirname;
const N_TARGET = Number(process.env.N_TARGET ?? '0');
const RUNS = Number(process.env.RUNS ?? '3');
const CPU = Number(process.env.CPU ?? '1');
const MAX_CLIPS = Number(process.env.MAX_CLIPS ?? '10');
const TAG = process.env.TAG ?? `export-${CPU}x`;

function init() {
  localStorage.setItem('czaba_analytics_consent', 'denied');
  const s = { longtasks: [], loafs: [], marks: [], errors: [] };
  window.__probe = s;
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) s.longtasks.push({ t: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true });
  } catch (e) { s.errors.push('longtask ' + e); }
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) s.loafs.push({ t: e.startTime, d: e.duration, blocking: e.blockingDuration,
        scripts: (e.scripts || []).map((x) => ({ d: x.duration, src: (x.sourceURL || '').split('/').pop(), fn: x.sourceFunctionName, inv: x.invoker, type: x.invokerType })) });
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) { s.errors.push('loaf ' + e); }
  const sr = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function () {
    s.marks.push({ k: 'startRendering', t: performance.now(), length: this.length });
    const p = sr.call(this);
    p.then(() => s.marks.push({ k: 'renderDone', t: performance.now() }));
    return p;
  };
  const gcd = AudioBuffer.prototype.getChannelData;
  AudioBuffer.prototype.getChannelData = function (i) {
    if (this.length > 48000 * 20) s.marks.push({ k: 'getChannelData', t: performance.now(), i, length: this.length });
    return gcd.call(this, i);
  };
  const co = URL.createObjectURL;
  URL.createObjectURL = function (b) {
    s.marks.push({ k: 'createObjectURL', t: performance.now(), size: b && b.size });
    return co.call(URL, b);
  };
  const W = window.Worker;
  window.Worker = class extends W { constructor(u, o) { super(u, o); s.marks.push({ k: 'worker', t: performance.now(), url: String(u).split('/').pop() }); } };
}

function procStatus(pid) {
  try {
    const t = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
    const g = (k) => { const m = new RegExp(`^${k}:\\s+(\\d+) kB`, 'm').exec(t); return m ? Number(m[1]) / 1024 : null; };
    return { rss: g('VmRSS'), anon: g('RssAnon'), hwm: g('VmHWM') };
  } catch { return null; }
}

async function rendererPids(bcdp) {
  const info = await bcdp.send('SystemInfo.getProcessInfo');
  return info.processInfo.filter((p) => p.type === 'renderer').map((p) => p.id);
}

async function cdpMem(cdp, page) {
  const heap = await cdp.send('Runtime.getHeapUsage');
  const pm = await cdp.send('Performance.getMetrics');
  const pmm = Object.fromEntries(pm.metrics.filter((m) => /JSHeap|Nodes|Documents|JSEventListeners/.test(m.name)).map((m) => [m.name, m.value]));
  const dom = await cdp.send('Memory.getDOMCounters');
  const pmem = await page.evaluate(() => { const m = performance.memory; return m ? { used: m.usedJSHeapSize, total: m.totalJSHeapSize, limit: m.jsHeapSizeLimit } : null; });
  return { heap, perfMetrics: pmm, dom, performanceMemory: pmem };
}

const MB = (b) => Math.round((b / 1048576) * 10) / 10;

async function snapshotAll(label, cdp, page, pids, gc) {
  const out = { label };
  out.preGc = await cdpMem(cdp, page);
  out.preGc.proc = Object.fromEntries(pids.map((p) => [p, procStatus(p)]));
  if (gc) {
    await cdp.send('HeapProfiler.collectGarbage');
    await page.waitForTimeout(300);
    out.postGc = await cdpMem(cdp, page);
    out.postGc.proc = Object.fromEntries(pids.map((p) => [p, procStatus(p)]));
  }
  out.domAll = await page.evaluate(() => document.querySelectorAll('*').length);
  return out;
}

async function ready(page) {
  const h = await page.waitForFunction(() => {
    const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add');
    const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
    return add instanceof HTMLButtonElement && !add.disabled && wave !== null ? performance.now() : 0;
  }, undefined, { polling: 'raf', timeout: 90000 });
  return h.jsonValue();
}

async function settle(page, ms = 1000) { await page.waitForTimeout(ms); }

async function projectEnd(page) { return (await page.getByTestId('arrangement-project-end').textContent())?.trim(); }

function parseTime(s) { const m = /(\d+):(\d+(?:\.\d+)?)/.exec(s ?? ''); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }

async function domState(page) {
  return page.evaluate(() => {
    const clips = [...document.querySelectorAll('[data-clip-kind="audio"]')];
    return { all: document.querySelectorAll('*').length, clips: clips.length, inClips: clips.reduce((s, c) => s + c.querySelectorAll('*').length + 1, 0) };
  });
}

async function deselect(page) {
  const trackId = await page.locator('[data-clip-kind="audio"]').first().evaluate((c) => c.closest('[data-track-id]')?.getAttribute('data-track-id'));
  const pt = await page.locator(`[data-track-id="${trackId}"]`).evaluate((lane) => {
    const box = lane.getBoundingClientRect(); const y = box.top + box.height / 2;
    for (let x = window.innerWidth - 10; x > window.innerWidth * 0.5; x -= 8) {
      const hit = document.elementFromPoint(x, y);
      if (hit && hit.closest('[data-track-id]') === lane && !hit.closest('[data-clip-id]') && !hit.closest('button, input, [role="slider"]')) return { x, y };
    }
    return null;
  });
  if (!pt) return false;
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(400);
  return !(await page.getByRole('slider', { name: 'Clip Gain — fader', exact: true }).isEnabled());
}

async function selectLast(page) {
  const h = page.locator('[data-clip-kind="audio"]').last().getByTitle(/ — drag to move$/);
  const b = await h.boundingBox();
  await page.mouse.click(b.x + Math.min(40, b.width / 2), b.y + b.height / 2);
  await page.evaluate(() => { const a = document.activeElement; if (a instanceof HTMLElement) a.blur(); });
  await page.waitForTimeout(300);
}

async function doExport(page, cdp, pids, cpuRate) {
  const opener = page.getByRole('button', { name: 'Export', exact: true });
  const openerCount = await opener.count();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const wavRadio = page.getByTestId('arrangement-export-format-wav');
  const wavChecked = await wavRadio.isChecked().catch(() => null);
  const primary = dialog.getByRole('button', { name: 'Export WAV', exact: true });
  await primary.waitFor();
  if (cpuRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
  await page.waitForTimeout(300);
  const t0 = await page.evaluate(() => performance.now());
  const procSamples = [];
  let polling = true;
  const procTimer = setInterval(() => { procSamples.push({ ts: Date.now(), p: Object.fromEntries(pids.map((p) => [p, procStatus(p)])) }); }, 25);
  const cdpSamples = [];
  const cdpLoop = (async () => {
    while (polling) {
      try {
        const h = await cdp.send('Runtime.getHeapUsage');
        const pm = await cdp.send('Performance.getMetrics');
        const used = pm.metrics.find((m) => m.name === 'JSHeapUsedSize')?.value;
        cdpSamples.push({ ts: Date.now(), ...h, JSHeapUsedSize: used });
      } catch (e) { cdpSamples.push({ err: String(e) }); }
      await new Promise((r) => setTimeout(r, 50));
    }
  })();
  const wall0 = Date.now();
  const dl = page.waitForEvent('download', { timeout: 300000 });
  await primary.click();
  const download = await dl;
  const wallMs = Date.now() - wall0;
  const t1 = await page.evaluate(() => performance.now());
  await page.getByText(/^WAV created:/).waitFor({ timeout: 60000 }).catch(() => null);
  const doneText = await page.getByText(/^WAV created:/).textContent().catch(() => null);
  polling = false;
  await cdpLoop;
  await page.waitForTimeout(100);
  clearInterval(procTimer);
  if (cpuRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const file = path.join(OUT, 'downloads', `${TAG}-${Date.now()}.wav`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await download.saveAs(file);
  const buf = fs.readFileSync(file);
  const hdr = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), fmt: buf.toString('ascii', 12, 16), audioFormat: buf.readUInt16LE(20), channels: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34), chunk36: buf.toString('ascii', 36, 40), chunk36Size: buf.readUInt32LE(40) };
  const size = buf.length;
  fs.unlinkSync(file);
  const probe = await page.evaluate(({ a, b }) => {
    const s = window.__probe;
    return { longtasks: s.longtasks.filter((e) => e.t >= a && e.t <= b), loafs: s.loafs.filter((e) => e.t >= a && e.t <= b), marks: s.marks.filter((e) => e.t >= a) };
  }, { a: t0, b: t1 + 200 });
  const procMax = {};
  for (const p of pids) {
    const vals = procSamples.map((s) => s.p[p]).filter(Boolean);
    procMax[p] = { rssMax: Math.max(...vals.map((v) => v.rss)), anonMax: Math.max(...vals.map((v) => v.anon)), rssFirst: vals[0]?.rss, anonFirst: vals[0]?.anon, hwmEnd: vals.at(-1)?.hwm, n: vals.length };
  }
  const okCdp = cdpSamples.filter((s) => !s.err);
  const keys = ['usedSize', 'totalSize', 'embedderHeapUsedSize', 'backingStorageSize', 'JSHeapUsedSize'];
  const cdpMax = Object.fromEntries(keys.map((k) => [k, okCdp.length && okCdp[0][k] !== undefined ? Math.max(...okCdp.map((s) => s[k])) : null]));
  const cdpFirst = okCdp[0] ?? null;
  const done = page.getByRole('button', { name: 'Done', exact: true });
  await done.click();
  await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 10000 }).catch(() => null);
  return {
    openerCount, wavChecked, wallMs, inPageMs: t1 - t0, suggestedFilename: download.suggestedFilename(), size, hdr, doneText,
    longtasks: probe.longtasks, longtasksOver50: probe.longtasks.filter((e) => e.d > 50).length, longtaskMax: Math.max(0, ...probe.longtasks.map((e) => e.d)),
    loafs: probe.loafs, loafBlockingMax: Math.max(0, ...probe.loafs.map((e) => e.blocking ?? 0)), marks: probe.marks,
    procMax, cdpFirst, cdpMax, cdpSampleCount: okCdp.length, cdpErrors: cdpSamples.length - okCdp.length, procSampleCount: procSamples.length,
  };
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const bcdp = await browser.newBrowserCDPSession();
  const results = { tag: TAG, cpu: CPU, nTarget: N_TARGET, browserVersion: browser.version(), runs: [] };
  for (let run = 1; run <= RUNS; run++) {
    const runStart = Date.now();
    const r = { run, steps: {}, timings: {} };
    const pidsBefore = await rendererPids(bcdp);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    await context.addInitScript(init);
    const page = await context.newPage();
    let pageErrors = 0; page.on('pageerror', () => { pageErrors++; });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
    r.readyMs = await ready(page);
    await settle(page, 1500);
    const pidsAll = await rendererPids(bcdp);
    r.rendererPids = pidsAll; r.newPids = pidsAll.filter((p) => !pidsBefore.includes(p));
    r.crossOriginIsolated = await page.evaluate(() => crossOriginIsolated);
    r.probeErrors = await page.evaluate(() => window.__probe.errors);
    r.steps.beforeAdd = await snapshotAll('beforeAdd', cdp, page, pidsAll, true);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.locator('[data-clip-kind="audio"]').first().waitFor();
    await page.getByTestId('arrangement-clip-waveform').first().waitFor();
    await settle(page, 1500);
    r.steps.afterAdd = await snapshotAll('afterAdd', cdp, page, pidsAll, true);
    r.clipStart = await page.locator('[data-clip-kind="audio"]').first().getAttribute('data-clip-start');
    r.projectEnd1 = await projectEnd(page);
    r.dom = { selected: [], deselected: [] };
    r.dom.selected.push(await domState(page));
    r.deselectOk = await deselect(page);
    r.dom.deselected.push(await domState(page));
    r.timings.loadAndAddMs = Date.now() - runStart;
    let t = Date.now();
    r.export1 = await doExport(page, cdp, pidsAll, CPU);
    r.timings.export1Ms = Date.now() - t;
    await page.waitForTimeout(2000);
    r.steps.after1Export2s = await snapshotAll('after1Export2s', cdp, page, pidsAll, true);
    t = Date.now();
    r.projectEnds = [{ clips: 1, end: r.projectEnd1 }];
    const target = N_TARGET || MAX_CLIPS;
    for (let k = 2; k <= target; k++) {
      await selectLast(page);
      await page.keyboard.press('Control+d');
      await page.locator('[data-clip-kind="audio"]').nth(k - 1).waitFor();
      await page.waitForTimeout(400);
      r.projectEnds.push({ clips: k, end: await projectEnd(page) });
      r.dom.selected.push(await domState(page));
      await deselect(page);
      r.dom.deselected.push(await domState(page));
    }
    r.starts = await page.locator('[data-clip-kind="audio"]').evaluateAll((cs) => cs.map((c) => c.getAttribute('data-clip-start')));
    await settle(page, 1000);
    r.timings.duplicateMs = Date.now() - t;
    if (N_TARGET) {
      r.steps.beforeExportN = await snapshotAll('beforeExportN', cdp, page, pidsAll, true);
      t = Date.now();
      r.exportN = await doExport(page, cdp, pidsAll, CPU);
      r.timings.exportNMs = Date.now() - t;
      await page.waitForTimeout(2000);
      r.steps.afterNExport2s = await snapshotAll('afterNExport2s', cdp, page, pidsAll, true);
    }
    r.pageErrors = pageErrors;
    r.timings.runMs = Date.now() - runStart;
    results.runs.push(r);
    await context.close();
    fs.writeFileSync(path.join(OUT, `${TAG}.json`), JSON.stringify(results, null, 1));
    console.log(`run ${run} done in ${r.timings.runMs} ms`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
