const { ipcMain } = require('electron');
const fs = require('node:fs');
const SCAN_MS = Number(process.env.R38_SCAN_MS || 4000);
const WRITE_MS = Number(process.env.R38_WRITE_MS || 3500);
const scanArm = process.env.R38_SCAN_ARM || '';
const writeArm = process.env.R38_WRITE_ARM || '';
const armed = (f) => f !== '' && fs.existsSync(f);
globalThis.__r38log = [];
const log = (e) => globalThis.__r38log.push({ ...e, at: Date.now() });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'fs:scan-folder') {
    return originalHandle(channel, async (event, ...args) => {
      const a = String(args[0]);
      const d = armed(scanArm);
      log({ channel, phase: 'start', arg: a, delayed: d });
      if (d) await sleep(SCAN_MS);
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', arg: a, files: Array.isArray(r) ? r.map((f) => f.name) : null });
      return r;
    });
  }
  if (channel === 'meta:write' || channel === 'meta:write-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const d = armed(writeArm);
      log({ channel, phase: 'start', arg: Array.isArray(args[0]) ? args[0] : String(args[0]), delayed: d });
      if (d) await sleep(WRITE_MS);
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply' });
      return r;
    });
  }
  return originalHandle(channel, async (event, ...args) => {
    const a = args[0];
    log({ channel, phase: 'call', arg: typeof a === 'string' ? a : Array.isArray(a) ? a : null });
    return listener(event, ...args);
  });
};
