const R = require('./report.cjs'); const fs = require('fs');
const d = R.load();
d.lookups.push('t205 exportd.cjs: play() read the Play/Pause aria-label; adapted to Play data-playing (SABA-B-9). Lookup.');
for (const k of ['RS-LM-1440', 'RS-LM-1280']) d.rows[k].detail += ' SCROLL-LOCK (d) (exportd.cjs): /studio-lab Export dialog body locked while open, Esc and ✕ close it, scroll and body styles restored, focus back on Export, Space still plays and stops afterwards.';
R.saveJ(d);
fs.appendFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-258.md', '- RS-LM rows also cover SCROLL-LOCK (d) Studio Export dialog (exportd.cjs, both vp, ok true after the Play data-playing lookup).\n');
