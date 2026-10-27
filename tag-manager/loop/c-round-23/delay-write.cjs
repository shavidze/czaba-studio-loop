const { ipcMain } = require('electron');
const delayMs = Number(process.env.R20_WRITE_DELAY_MS || '3000');
const delayed = new Set(['meta:write', 'meta:write-batch']);
const originalHandle = ipcMain.handle.bind(ipcMain);
ipcMain.handle = (channel, listener) => {
  if (!delayed.has(channel)) return originalHandle(channel, listener);
  return originalHandle(channel, async (event, ...args) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return listener(event, ...args);
  });
};
