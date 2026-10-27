const { ipcMain } = require('electron');
const fs = require('node:fs');
const DELAY = Number(process.env.R32_DELAY_MS || 5000);
const readOneFile = process.env.R32_READONE_FILE || '';
const delayFile = process.env.R32_DELAY_FILE || '';
const rejectFile = process.env.R32_REJECT_FILE || '';
const armed = (f) => f !== '' && fs.existsSync(f);
globalThis.__r32log = [];
const log = (e) => globalThis.__r32log.push({ ...e, at: Date.now() });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const short = (p) => String(p).split('/').slice(-2).join('/');
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'meta:read') {
    return originalHandle(channel, async (event, ...args) => {
      const p = String(args[0]);
      const d = p.includes('/slow/') && armed(readOneFile);
      log({ channel, phase: 'start', path: short(p), delayed: d });
      if (d) await sleep(DELAY);
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', path: short(p), category: r && r.category });
      return r;
    });
  }
  if (channel === 'meta:read-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const full = Array.isArray(args[0]) ? args[0].map(String) : [];
      const slow = full.some((p) => p.includes('/slow/'));
      const d = slow && armed(delayFile);
      const rj = slow && armed(rejectFile);
      log({ channel, phase: 'start', paths: full.map(short), delayed: d, reject: rj });
      if (d) await sleep(DELAY);
      if (d && rj) { log({ channel, phase: 'throw', paths: full.map(short) }); throw new Error('R32 harness: simulated delayed read-batch failure'); }
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', paths: full.map(short), values: Object.entries(r || {}).map(([p, m]) => [short(p), m && m.category]) });
      return r;
    });
  }
  if (channel === 'meta:write' || channel === 'fs:scan-folder') {
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
