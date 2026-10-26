const { app } = require("electron");
const whenReady = app.whenReady.bind(app);
app.whenReady = () => whenReady().then(() => new Promise((resolve) => setTimeout(resolve, Number(process.env.E2E_WINDOW_DELAY_MS))));
