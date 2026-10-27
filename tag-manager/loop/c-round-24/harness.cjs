const { ipcMain } = require('electron');
const delayMs = Number(process.env.R24_WRITE_DELAY_MS || '3000');
const rejectKey = process.env.R24_REJECT_KEY || '';
const delayed = new Set(['meta:write', 'meta:write-batch']);
globalThis.__r24log = [];
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (delayed.has(channel)) {
    return originalHandle(channel, async (event, ...args) => {
      globalThis.__r24log.push({ channel, at: Date.now(), phase: 'start', keys: (args[2] || []).map((f) => f.key) });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const r = await listener(event, ...args);
      globalThis.__r24log.push({ channel, at: Date.now(), phase: 'end' });
      return r;
    });
  }
  if (channel === 'meta:read-batch' || channel === 'meta:read') {
    return originalHandle(channel, async (event, ...args) => {
      const keys = (args[1] || []).map((f) => f.key);
      const armed = channel === 'meta:read-batch' && rejectKey && keys.includes(rejectKey);
      globalThis.__r24log.push({ channel, at: Date.now(), keys, rejected: !!armed });
      if (armed) throw new Error('C harness: read-batch rejected (schema has ' + rejectKey + ')');
      return listener(event, ...args);
    });
  }
  return originalHandle(channel, listener);
};
