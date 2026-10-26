const electron = require("electron");
const fs = require("node:fs");
const delayMs = Number(process.env.C_WINDOW_DELAY_MS || "0");
const logFile = process.env.C_INJECTOR_LOG;
const note = (text) => { if (logFile) fs.appendFileSync(logFile, `${new Date().toISOString()} pid=${process.pid} ${text}\n`); };
note(`loaded delay=${delayMs}`);
const originalWhenReady = electron.app.whenReady.bind(electron.app);
electron.app.whenReady = function delayedWhenReady() {
  return originalWhenReady().then(() => new Promise((resolve) => setTimeout(() => { note("released"); resolve(); }, delayMs)));
};
