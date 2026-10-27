// B planning patch: R113 grant, softened attribution, tool-copy rule. Run from the loop folder.
const fs = require('fs');
let t = fs.readFileSync('current-task.md', 'utf8');
const rep = (a, b) => { if (!t.includes(a)) throw new Error('missing: ' + a.slice(0, 70)); t = t.split(a).join(b); };
rep('Decision: **D-29z173** (the ordering correction and this round). C-R206-01 ruling: **D-29z174**.',
  'Decision: **D-29z173** (the ordering correction and this round). C-R206-01 ruling: **D-29z174**. R113 (doc 163 status line): **D-29z175**.');
rep('- **Frozen files:** the 1,044 files in `b-round-206-r207-tree-sha256.txt`. This is every tracked file except the 4 grants.',
  '- **Frozen files:** the 1,043 files in `b-round-206-r207-tree-sha256.txt`. This is every tracked file except the 5 grants.');
rep('  - Round 206 ran PERF-1a first. That was a planning miss, recorded as D-29z173.',
  '  - Round 206 ran PERF-1a first. SABA-B-6 was not in `backlog.json` at 207 planning. Whether the policy note was already there when round 206 was planned is unverified. Either way, it is corrected now (D-29z173).');
rep('| **new** `app/lib/arrangement/__tests__/timeline-cursor-map.test.ts` | the row **CU4** |',
  '| **new** `app/lib/arrangement/__tests__/timeline-cursor-map.test.ts` | the row **CU4** |\n| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` (grant), **R113** (L28, GATE206-DOC163-STATUS) | l.4 only. The status becomes `In Progress (C round 206 PASS — c-round-206.md; published 60c82ed; open: SABA-B-5 fix in PERF-FADER, C-R206-01 Low)`. No other line changes. In particular, l.60 stays as it is; PERF-FADER rewrites it. |');
rep("- one real-Chromium check of computed `cursor` on the three elements (you may reuse B's `cursormap.cjs`/`videograb.cjs` against :5173, without the class injection)",
  "- one real-Chromium check of computed `cursor` on the three elements. You may base it on B's `cursormap.cjs`/`videograb.cjs` (drop the class injection), but **copy them and their `lib*.cjs`, `wav.cjs` and `report.cjs` into `a-round-207/tools/` first**. Their `ROOT` resolves to the tools folder's parent, so running them in place would write into B's `b-round-206/out/`.");
rep('| **SCOPE-207** (start and end) | HEAD, `git status`, the frozen list (1044), the grant diffs vs the start copies, the new files | Only the 4 grants and the 2 new files differ. The component diffs are exactly the 3 cursor-token edits of §2. 0 other `app/` changes; protected files unchanged. |',
  '| **SCOPE-207** (start and end) | HEAD, `git status`, the frozen list (1043), the grant diffs vs the start copies, the new files | Only the 5 grants and the 2 new files differ. The component diffs are exactly the 3 cursor-token edits of §2. Doc 163 differs at l.4 only, with the exact R113 text. 0 other `app/` changes; protected files unchanged. |');
fs.writeFileSync('current-task.md', t);

let m = fs.readFileSync('b-round-206.md', 'utf8');
const rm = (a, b) => { if (!m.includes(a)) throw new Error('missing b: ' + a.slice(0, 70)); m = m.split(a).join(b); };
rm('  - **What went wrong.** The policy note on SABA-B-6 (Saba, 2026-10-27) says: "One small round right after SABA-B-4 closes (after round 205), before PERF-1." Round-206 planning (B) dispatched PERF-1a and did not record SABA-B-6 in `backlog.json`; a grep finds 0 hits. That was a B planning miss.',
  '  - **What happened.** The policy note on SABA-B-6 (Saba, 2026-10-27) says: "One small round right after SABA-B-4 closes (after round 205), before PERF-1." Round 206 ran PERF-1a. SABA-B-6 was not in `backlog.json` at 207 planning (a grep finds 0 hits), and it is not in `b-round-205.md`.\n  - **Cause: unverified.** B did not establish whether the note existed when round 206 was planned. SABA-B-5, with the same date, was recorded, which is consistent with SABA-B-6 arriving later. No cause is claimed.');
rm('  - **Prevention.** At every planning, B greps the policy for each `SABA-B-n` id and checks that `open_findings` has it. This is a lesson candidate for the next RETRO.',
  '  - **Prevention.** At every planning, B greps the policy for each `SABA-B-n` id and checks that `open_findings` has it. This is a lesson candidate for the next RETRO, with its cause recorded as unverified.\n- **D-29z175: R113, GATE206-DOC163-STATUS (L28).** Doc 163 l.4 was published still reading `In Progress (C round 206 check pending)`, because root did not amend it at gate 206. Per L28, B grants the post-PASS line in round 207. This is a one-line doc fix, the same precedent as R112.');
rm('- 2 new files: the CU4 guard test and doc 164.',
  '- 2 new files: the CU4 guard test and doc 164.\n- Plus R113: the doc 163 l.4 status line (the fifth grant). The frozen list is 1,043 files.');
fs.writeFileSync('b-round-206.md', m);

const ADD = '2026-10-27 B round 206 -> 207 planning (D-29z173)';
const b = JSON.parse(fs.readFileSync('backlog.json', 'utf8'));
const r = b.rounds.find((x) => x.round === 207);
r.items.push('R113 GATE206-DOC163-STATUS doc 163 l.4 (D-29z175)');
r.note = r.note.replace('frozen 1044 files', 'frozen 1043 files') + '; SABA-B-6 absent from backlog at 207 planning, cause unverified';
const r206 = b.rounds.find((x) => x.round === 206);
r206.result = r206.result.replace('; C-R206-01', '; doc 163 l.4 published stale -> R113 in round 207; C-R206-01');
b.open_findings.push({ id: 'GATE206-DOC163-STATUS', severity: 'low', origin: 'B round 206 -> 207 planning (L28)', title: 'doc 163 l.4 published still conditional (C round 206 check pending)', status: 'scheduled: round 207 R113 (D-29z175)', added: ADD });
fs.writeFileSync('backlog.json', JSON.stringify(b, null, 1));

const o = JSON.parse(fs.readFileSync('b-next.json', 'utf8'));
o.nextTask = o.nextTask.replace('1044 files frozen', '1043 files frozen') + ' R113 (D-29z175): doc 163 l.4 post-PASS status line.';
o.remaining[0] += '; + R113 doc 163 l.4';
fs.writeFileSync('b-next.json', JSON.stringify(o, null, 1));

let s = fs.readFileSync('feature-status.md', 'utf8');
const rs = (a, b2) => { if (!s.includes(a)) throw new Error('missing fs: ' + a.slice(0, 40)); s = s.split(a).join(b2); };
rs('გაყინულია 1044 ფაილი; 4 grant (', 'გაყინულია 1043 ფაილი; 5 grant (doc 163 l.4 — R113, ');
rs('რიგის შესწორება: პოლიტიკით ეს რაუნდი PERF-1-მდე უნდა ყოფილიყო (D-29z173).', 'რიგის შესწორება: პოლიტიკით ეს რაუნდი PERF-1-მდე უნდა ყოფილიყო; რატომ გამოტოვდა, დადასტურებული არ არის (D-29z173).');
fs.writeFileSync('feature-status.md', s);
console.log('ok');
