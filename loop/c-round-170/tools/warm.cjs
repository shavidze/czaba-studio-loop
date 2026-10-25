// C round 170 warm-up load (not a measured session).
const L = require('./lib.cjs');
(async () => { const b = await L.launch(); const net = []; const { ctx, log } = await L.openStudio(b, { width: 1440, height: 900 }, 'warm', net); console.log(JSON.stringify({ fonts: log.fontsReady.ok, errors: log.errors.slice(0, 3) })); await ctx.close(); await b.close(); })();
