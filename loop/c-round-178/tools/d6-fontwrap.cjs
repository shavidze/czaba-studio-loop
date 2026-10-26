// C round 170: runs the unchanged d6.cjs (sha 3abc88fe…) and only records the font status of its session
// by wrapping lib.cjs openStudio (same module instance d6 uses). node d6-fontwrap.cjs <W> <run>
const fs = require('fs'); const path = require('path');
const L = require('./lib.cjs'); const orig = L.openStudio;
L.openStudio = async (...a) => { const o = await orig(...a); const f = path.join(L.ROOT, 'out', 'd6', `d6-${process.argv[2]}-r${process.argv[3]}-fonts.json`); fs.mkdirSync(path.dirname(f), { recursive: true }); o.page.on('close', () => {}); fs.writeFileSync(f, JSON.stringify({ fontsReady: o.log.fontsReady, fontResp: o.log.fontResp, fontFail: o.log.fontFail }, null, 1)); process.on('exit', () => { try { const j = JSON.parse(fs.readFileSync(f)); j.fontBadAtExit = o.log.fontResp.filter((r) => r.s !== 200).length + o.log.fontFail.length; fs.writeFileSync(f, JSON.stringify(j, null, 1)); } catch (e) {} }); return o; };
require('./d6.cjs');
