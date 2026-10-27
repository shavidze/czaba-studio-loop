const { ipcMain } = require('electron');
const writeDelayMs = Number(process.env.R27_WRITE_DELAY_MS || '3000');
const replyDelayMs = Number(process.env.R27_REPLY_DELAY_MS || '6000');
const lateKey = process.env.R27_LATE_KEY || 'r27note';
const delayed = new Set(['meta:write', 'meta:write-batch']);
let lateArmed = true;
globalThis.__r27log = [];
const log = (e) => globalThis.__r27log.push({ ...e, at: Date.now() });
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (delayed.has(channel)) {
    return originalHandle(channel, async (event, ...args) => {
      log({ channel, phase: 'start', keys: (args[2] || []).map((f) => f.key) });
      await new Promise((resolve) => setTimeout(resolve, writeDelayMs));
      log({ channel, phase: 'listener-start' });
      const r = await listener(event, ...args);
      log({ channel, phase: 'end' });
      return r;
    });
  }
  if (channel === 'meta:read-batch' || channel === 'meta:read') {
    return originalHandle(channel, async (event, ...args) => {
      const keys = (args[1] || []).map((f) => f.key);
      const late = channel === 'meta:read-batch' && lateArmed && keys.includes(lateKey);
      if (late) lateArmed = false;
      log({ channel, phase: 'start', keys, late });
      const r = await listener(event, ...args);
      const a = Object.entries(r && r.title !== undefined ? { single: r } : r || {}).map(([p, m]) => [p.split('/').pop(), m && m.category, m && m.title]);
      log({ channel, phase: 'listener-done', late, values: a });
      if (late) await new Promise((resolve) => setTimeout(resolve, replyDelayMs));
      log({ channel, phase: 'reply', late });
      return r;
    });
  }
  return originalHandle(channel, async (event, ...args) => {
    log({ channel, phase: 'call' });
    return listener(event, ...args);
  });
};
