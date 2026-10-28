const { ipcMain } = require('electron');
const fs = require('node:fs');
const DELAY = Number(process.env.R33_DELAY_MS || 6000);
const SCAN_MS = Number(process.env.R33_SCAN_MS || 2000);
const scanFile = process.env.R33_SCAN_FILE || '';
const delayFile = process.env.R33_DELAY_FILE || '';
const rejectFile = process.env.R33_REJECT_FILE || '';
const oldSchemaFile = process.env.R33_OLDSCHEMA_FILE || '';
const armed = (f) => f !== '' && fs.existsSync(f);
globalThis.__r33log = [];
const log = (e) => globalThis.__r33log.push({ ...e, at: Date.now() });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const short = (p) => String(p).split('/').slice(-2).join('/');
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'meta:read-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const full = Array.isArray(args[0]) ? args[0].map(String) : [];
      const schema = Array.isArray(args[1]) ? args[1] : [];
      const keys = schema.map((f) => f && f.key);
      const hasR33N = schema.some((f) => f && f.riffChunkId === 'R33N');
      const slow = full.some((p) => p.includes('/slow/'));
      const d = slow && (armed(delayFile) || (armed(oldSchemaFile) && !hasR33N));
      const rj = slow && armed(delayFile) && armed(rejectFile);
      log({ channel, phase: 'start', paths: full.map(short), keys, hasR33N, delayed: d, reject: rj });
      if (d) await sleep(DELAY);
      if (rj) { log({ channel, phase: 'throw', paths: full.map(short) }); throw new Error('R33 harness: simulated delayed read-batch failure'); }
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', paths: full.map(short), values: Object.entries(r || {}).map(([p, m]) => [short(p), m && m.category, m && m.r33note]) });
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
  if (channel === 'meta:write' || channel === 'meta:read') {
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
