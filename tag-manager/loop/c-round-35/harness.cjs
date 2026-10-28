const { ipcMain } = require('electron');
const fs = require('node:fs');
const SCAN_MS = Number(process.env.R35_SCAN_MS || 4000);
const scanFile = process.env.R35_SCAN_FILE || '';
const nthFile = process.env.R35_NTH_FILE || '';
const armed = (f) => f !== '' && fs.existsSync(f);
globalThis.__r35log = [];
const log = (e) => globalThis.__r35log.push({ ...e, at: Date.now() });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const short = (p) => String(p).split('/').slice(-2).join('/');
let nthToken = null;
let nthCount = 0;
let readSeq = 0;
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'meta:read-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const seq = ++readSeq;
      const full = Array.isArray(args[0]) ? args[0].map(String) : [];
      const schema = Array.isArray(args[1]) ? args[1] : [];
      const keys = schema.map((f) => f && f.key);
      let delayMs = 0;
      let nth = null;
      if (armed(nthFile)) {
        const [n, ms, token] = fs.readFileSync(nthFile, 'utf8').trim().split(':');
        if (token !== nthToken) { nthToken = token; nthCount = 0; }
        nthCount += 1;
        nth = nthCount;
        if (nthCount === Number(n)) delayMs = Number(ms);
      }
      log({ channel, seq, phase: 'start', paths: full.map(short), keys, nthAfterArm: nth, delayMs });
      if (delayMs) await sleep(delayMs);
      const r = await listener(event, ...args);
      log({ channel, seq, phase: 'reply', paths: full.map(short), values: Object.entries(r || {}).map(([p, m]) => [short(p), m && m.category, m && m.qone, m && m.qtwo, m && m.r35note]) });
      return r;
    });
  }
  if (channel === 'fs:scan-folder') {
    return originalHandle(channel, async (event, ...args) => {
      const a = String(args[0]);
      const d = /\/fast\/?$/.test(a) && armed(scanFile);
      log({ channel, phase: 'start', arg: short(a), delayed: d });
      if (d) await sleep(SCAN_MS);
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', arg: short(a), files: Array.isArray(r) ? r.map((f) => f.name) : null });
      return r;
    });
  }
  if (channel === 'meta:write' || channel === 'meta:read' || channel === 'meta:write-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const a = typeof args[0] === 'string' ? short(args[0]) : null;
      log({ channel, phase: 'start', arg: a });
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', arg: a });
      return r;
    });
  }
  return originalHandle(channel, async (event, ...args) => { log({ channel, phase: 'call' }); return listener(event, ...args); });
};
