const { ipcMain } = require('electron');
const fs = require('node:fs');
const SCAN_MS = Number(process.env.R37_SCAN_MS || 4000);
const armFile = process.env.R37_ARM_FILE || '';
const armed = () => armFile !== '' && fs.existsSync(armFile);
globalThis.__r37log = [];
const log = (e) => globalThis.__r37log.push({ ...e, at: Date.now() });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'fs:scan-folder') {
    return originalHandle(channel, async (event, ...args) => {
      const a = String(args[0]);
      const d = armed();
      log({ channel, phase: 'start', arg: a, delayed: d });
      if (d) await sleep(SCAN_MS);
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', arg: a, files: Array.isArray(r) ? r.map((f) => f.name) : null });
      return r;
    });
  }
  return originalHandle(channel, async (event, ...args) => { log({ channel, phase: 'call', arg: typeof args[0] === 'string' ? args[0] : null }); return listener(event, ...args); });
};
