const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };

let t = fs.readFileSync(dir + 'current-task.md', 'utf8');
const oldBlur = 'REAL click on a neutral element (the detail panel\'s info text; it blurs the slider; the real mouse pointer is not 41)';
must(t.includes(oldBlur), 'PK-B blur text');
t = t.replace(oldBlur, 'REAL click on a neutral element that starts no gesture (the detail panel\'s info text after expanding the panel with a REAL click on `arrangement-detail-toggle` if `aria-expanded` is false — at 1280 a fresh load may start collapsed — or the `დემო კოლექცია` badge; name the one used; it blurs the slider; the real mouse pointer is not 41)');
fs.writeFileSync(dir + 'current-task.md', t);

let r = fs.readFileSync(dir + 'b-round-41.md', 'utf8');
const old9 = '## 9. Advisor (after writing)\n\nSee the addendum below, if any.\n';
must(r.includes(old9), 'section 9');
r = r.replace(old9, [
  '## 9. Advisor (after writing)',
  '',
  'The advisor (Fable) was called twice.',
  '',
  '**1. Before writing.** It set the round-42 choice (the Pan group, with C-R41-01 as an open Low + TL-Q-VIEWPORT + a labelled hypothesis) and the pre-write checks: HEAD/sha/backups, the 386 list, reading the Pan source first. It also set the bookkeeping: close C-R40-01 and DOC038-STALE-LINES, the C-R23-01 3/1 update, and Google Fonts in G-3.',
  '',
  '**2. After writing.** No structural change. B applied two items:',
  '- B read `setTrackPan` (ArrangementContext l.2185–2189) and `refuseEditDuringGesture` (l.602–608). The refusal does set `GESTURE_EDIT_BLOCKED_MESSAGE`, so the RW2 / RW-GESTURE status expectations stand.',
  '- PK-B now names the blur target explicitly: the panel info text after expanding the panel, or the demo badge.',
  '',
  'Accepted as is:',
  '- the missing §4.6 number in the task (the references are consistent);',
  '- ROOT-CODEX-AGENT-FILES was only a `remaining` label, never a backlog finding.',
  '',
].join('\n'));
fs.writeFileSync(dir + 'b-round-41.md', r);
fs.appendFileSync(dir + 'b-round-41-checkpoint.md', '- final: advisor #2 applied (setTrackPan refusal verified; PK-B blur target); B round 41 planning complete, decision CONTINUE.\n');
console.log('final patch ok');
