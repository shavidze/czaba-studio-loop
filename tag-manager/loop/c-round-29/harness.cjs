const { ipcMain } = require('electron');
const fs = require('node:fs');
const armFile = process.env.R29_ARM_FILE || '';
globalThis.__r29log = [];
const log = (e) => globalThis.__r29log.push({ ...e, at: Date.now() });
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (channel === 'meta:read-batch') {
    return originalHandle(channel, async (event, ...args) => {
      const armed = armFile !== '' && fs.existsSync(armFile);
      const paths = Array.isArray(args[0]) ? args[0].map((p) => String(p).split('/').pop()) : [];
      log({ channel, phase: 'start', armed, paths });
      if (armed) {
        log({ channel, phase: 'throw', paths });
        throw new Error('R29 harness: simulated IPC-level read-batch failure');
      }
      const r = await listener(event, ...args);
      log({ channel, phase: 'reply', values: Object.entries(r || {}).map(([p, m]) => [p.split('/').pop(), m && m.category, m && m.title]) });
      return r;
    });
  }
  return originalHandle(channel, async (event, ...args) => {
    log({ channel, phase: 'call' });
    return listener(event, ...args);
  });
};
