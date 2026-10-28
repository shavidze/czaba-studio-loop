// C r221 AN-REVIEW: every -U0 hunk line lies inside a granted section (old side for '-', new side for '+').
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const S = '/home/runner/czaba-project/store';
const G = {
  'docs/technical/studio.md': [['###', 'Tech Stack'], ['###', 'Core Components'], ['###', 'Architecture', 'Export System'], ['###', 'FFmpeg.wasm Integration'], ['###', 'MP3 encoding (LAME via mediabunny)'], ['###', '3. Why FFmpeg.wasm?'], ['###', '3. Why LAME via mediabunny?'], ['##', 'File Structure'], ['###', 'Export', 'Testing Checklist'], ['##', 'Dependencies'], ['LINE', '**Last Updated**']],
  'docs/technical/debug-studio.md': [['###', '5. Export fails'], ['##', 'Testing Checklist']],
  'docs/design/components/audio-player.md': [['##', 'ExportDialog']],
  'docs/learning/README.md': [['##', 'Tech Stack']],
  'docs/learning/architecture/02-audio-studio-system.md': [['##', 'ტერმინოლოგია'], ['###', 'User Journey: Preview-დან Studio-მდე'], ['###', 'Export Pipeline'], ['##', 'Trade-offs'], ['##', 'Key Takeaways']],
};
function sections(text) {
  const lines = text.split('\n'); const heads = []; let fence = false;
  lines.forEach((l, i) => { if (/^\s*```/.test(l)) fence = !fence; const m = !fence && /^(#{1,6}) (.*)$/.exec(l); if (m) heads.push({ line: i + 1, level: m[1].length, title: m[2].trim() }); });
  return { lines, heads };
}
function ranges(text, spec) {
  const { lines, heads } = sections(text); const out = []; const miss = [];
  for (const [lv, title, parent] of spec) {
    if (lv === 'LINE') { const i = lines.findIndex((l) => l.startsWith(title)); if (i >= 0) out.push([i + 1, i + 1, title]); else miss.push(title); continue; }
    const level = lv.length; let found = false;
    heads.forEach((h, idx) => {
      if (h.level !== level || h.title !== title) return;
      if (parent) { const par = [...heads.slice(0, idx)].reverse().find((p) => p.level < level); if (!par || par.title !== parent) return; }
      const nxt = heads.slice(idx + 1).find((p) => p.level <= level); out.push([h.line, nxt ? nxt.line - 1 : lines.length, title]); found = true;
    });
    if (!found) miss.push(title);
  }
  return { out, miss };
}
const res = {};
for (const [f, spec] of Object.entries(G)) {
  const oldT = execSync(`git -C ${S} show HEAD:${f}`, { encoding: 'utf8', maxBuffer: 1e8 }); const newT = fs.readFileSync(`${S}/${f}`, 'utf8');
  const ro = ranges(oldT, spec); const rn = ranges(newT, spec);
  const diff = execSync(`git -C ${S} diff -U0 HEAD -- ${f}`, { encoding: 'utf8', maxBuffer: 1e8 });
  const bad = []; let hunks = 0; let oL = 0; let nL = 0;
  for (const l of diff.split('\n')) {
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(l); if (m) { hunks += 1; oL = +m[1]; nL = +m[3]; continue; }
    if (l.startsWith('---') || l.startsWith('+++')) continue;
    const inR = (rs, n) => rs.some(([a, b]) => n >= a && n <= b);
    if (l.startsWith('-')) { if (!inR(ro.out, oL)) bad.push(`old ${oL}: ${l.slice(0, 90)}`); oL += 1; }
    else if (l.startsWith('+')) { if (!inR(rn.out, nL)) bad.push(`new ${nL}: ${l.slice(0, 90)}`); nL += 1; }
  }
  const sect = rn.out.map(([a, b]) => newT.split('\n').slice(a - 1, b).join('\n')).join('\n');
  res[f] = { hunks, outside: bad, newRanges: rn.out, missingNew: rn.miss, forbiddenInGranted: (sect.match(/loadFFmpeg|FFmpeg\.wasm|@ffmpeg/gi) || []) };
}
console.log(JSON.stringify(res, null, 1));
