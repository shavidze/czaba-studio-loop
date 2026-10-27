const { ipcMain } = require('electron');
const writeDelayMs = Number(process.env.R28_WRITE_DELAY_MS || '3000');
const replyDelayMs = Number(process.env.R28_REPLY_DELAY_MS || '6000');
const delayed = new Set(['meta:write', 'meta:write-batch']);
let pendingWrites = 0;
let lateArmed = true;
globalThis.__r28log = [];
const log = (e) => globalThis.__r28log.push({ ...e, at: Date.now() });
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (delayed.has(channel)) {
    return originalHandle(channel, async (event, ...args) => {
      pendingWrites++;
      log({ channel, phase: 'start' });
      try {
        await new Promise((resolve) => setTimeout(resolve, writeDelayMs));
        log({ channel, phase: 'listener-start' });
        const r = await listener(event, ...args);
        log({ channel, phase: 'end' });
        return r;
      } finally { pendingWrites--; }
    });
  }
  if (channel === 'meta:read-batch' || channel === 'meta:read') {
    return originalHandle(channel, async (event, ...args) => {
      const late = channel === 'meta:read-batch' && lateArmed && pendingWrites > 0;
      if (late) lateArmed = false;
      log({ channel, phase: 'start', late, pendingWrites });
      const r = await listener(event, ...args);
      const a = Object.entries(channel === 'meta:read' ? { single: r } : r || {}).map(([p, m]) => [p.split('/').pop(), m && m.category, m && m.title]);
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
