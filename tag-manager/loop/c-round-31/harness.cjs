const { ipcMain } = require('electron');
const fs = require('node:fs');
const DELAY = Number(process.env.R31_DELAY_MS || 5000);
const delayFile = process.env.R31_DELAY_FILE || '';
const rejectFile = process.env.R31_REJECT_FILE || '';
const scanFile = process.env.R31_SCAN_FILE || '';
const armed = (f) => f !== '' && fs.existsSync(f);
globalThis.__r31log = [];
const log = (e) => globalThis.__r31log.push({ ...e, at: Date.now() });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'meta:read-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const full = Array.isArray(args[0]) ? args[0].map(String) : [];
      const paths = full.map((p) => p.split('/').slice(-2).join('/'));
      const slow = full.some((p) => p.includes('/slow/'));
      const d = slow && armed(delayFile);
      const rj = slow && armed(rejectFile);
      log({ channel, phase: 'start', paths, delayed: d, reject: rj });
      if (d) await sleep(DELAY);
      if (d && rj) { log({ channel, phase: 'throw', paths }); throw new Error('R31 harness: simulated delayed read-batch failure'); }
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', paths, values: Object.entries(r || {}).map(([p, m]) => [p.split('/').slice(-2).join('/'), m && m.category]) });
      return r;
    });
  }
  if (channel === 'fs:scan-folder') {
    return originalHandle(channel, async (event, ...args) => {
      const p = String(args[0]);
      const d = /\/slow\/?$/.test(p) && armed(scanFile);
      log({ channel, phase: 'start', folder: p.split('/').pop(), delayed: d });
      if (d) await sleep(DELAY);
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', folder: p.split('/').pop(), files: (r || []).map((f) => f.name) });
      return r;
    });
  }
  return originalHandle(channel, async (event, ...args) => { log({ channel, phase: 'call' }); return listener(event, ...args); });
};
