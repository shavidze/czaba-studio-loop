const fs = require('fs');
const p = 'feature-status.md';
let t = fs.readFileSync(p, 'utf8');
function rep(from, to) {
  if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 80));
  t = t.replace(from, to);
}
function repLine(prefix, to) {
  const lines = t.split('\n');
  const i = lines.findIndex((l) => l.startsWith(prefix));
  if (i < 0) throw new Error('line not found: ' + prefix);
  lines[i] = to;
  t = lines.join('\n');
}

rep('განახლდა: 2026-10-13 · ავტორი: B (round 32 → round 33 დაგეგმვა)', 'განახლდა: 2026-10-13 · ავტორი: B (round 33 → round 34 დაგეგმვა)');

rep('- **R33-T (ახალი):** რეალური მაუსით: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება.',
  '- **R33-T:** რეალური მაუსით: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება.\n- **R34-T (ახალი):** რეალური მაუსით: (1) ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნის ტექსტი უცვლელია; (2) Clip Gain-ში მნიშვნელობა Enter-ის გარეშე → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება (ერთი `Clip Gain` ჩანაწერი); (3) ძებნაში focus-ით timeline-ის scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის.');

rep('- **Round 31-ის 7 ფაილი C-მ შეამოწმა და კომიტისთვის მზადაა.** Round 32-ის ცვლილებები (`StudioWorkspace.tsx`, `fader-guards.test.tsx` და round-32-ის ნაწილი `ArrangementLane.tsx`-სა და doc 036-ში) **კომიტისთვის მზად არ არის** — C FAIL C-R32-01-ზე, Round 33 ასწორებს. `ArrangementLane.tsx` და doc 036 ორივე რაუნდის ცვლილებას შეიცავს, ამიტომ პრაქტიკულად: ან round 31-ის 5 ხელუხლებელი ფაილი ახლა (`ArrangementContext.tsx`, `graph.client.ts`, `model.ts`, `types/arrangement.ts`, `track-pan.test.tsx`), ან round 31 + 32 + 33 ერთად, Round 33-ის C PASS-ის შემდეგ. აქტიური იმპლემენტაციის ფაილები არ კომიტდება.',
  '- **Round 31 + 32 + 33 (ყველა 9 ხაზი) C-მ შეამოწმა და root-ის checkpoint commit-ისთვის მზადაა** (C round 33 PASS; B-მ gate-ები თავიდან გაუშვა: `b-round-33/gates.txt`). Root თავად უშვებს check/typecheck/tests/build-ს და review-ს. Round 34-ის დაწყების შემდეგ `StudioWorkspace.tsx`, `fader-guards.test.tsx` და doc 036 აქტიური იმპლემენტაციის ფაილებია — commit მანამდე ან C-ის round-34 PASS-ის შემდეგ. შუალედური commit release არ არის.');

rep('- Dev server დაგეგმვისას მუშაობდა (200); `node.exe` 7.', '- Dev server C round 33-ის დროს მუშაობდა (200); B-ის gate-ებისას `node.exe` 8 → 7.');

const curStart = t.indexOf('მიმდინარე რაუნდი: **Round 33**');
const curEnd = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
if (curStart < 0 || curEnd < 0) throw new Error('current block not found');
const current = `მიმდინარე რაუნდი: **Round 34** (\`current-task.md\`, D-29y) — C-ის ბაგები პირველ რიგში (სამი დაკავშირებული ბაგი, ერთი handler):
- **FOCUS-TEXT-STALE (Medium, C-მ დაადასტურა):** ძებნაში აკრეფის შემდეგ კლიპზე click focus-ს ძებნაში ტოვებს: Delete არაფერს შლის, Backspace კი ფარულად ცვლის ძებნის ტექსტს და ბიბლიოთეკის ფილტრს.
- **CLIP-GAIN-CLICK-DISCARD (Medium, C-ის REC-2):** Clip Gain-ში Enter-ის გარეშე აკრეფილი მნიშვნელობა სხვა კლიპზე click-ისას ჩუმად იკარგება (detail-ის content clip id-ით remount-დება, blur არ ხდება) — არღვევს D-29u-ის „blur = commit“ კონტრაქტს.
- **A-R33-REVIEW-SCROLLBAR (Low):** scrollbar-ზე click fader-ს blur-ს უკეთებს; ტექსტურ ველებზე გავრცელებისას ის Backspace-ით კლიპის შემთხვევით წაშლას გამოიწვევდა.
- **გამოსწორება:** round 33-ის capture handler (\`StudioWorkspace.tsx\`) ტექსტურ ველსაც (\`isTypingTarget\`) ათავისუფლებს; scroller-ის scrollbar gutter-ზე (client box-ის გარეთ) blur არ ხდება. Clip Gain-ის აკრეფილი მნიშვნელობა არსებული \`onBlur\`-ით იმ კლიპზე იწერება, რომელზეც აიკრიფა, selection-ის შეცვლამდე. \`ArrangementDetailPanel.tsx\` და \`ArrangementLibrary.tsx\` frozen-ია.
- **A:** \`StudioWorkspace.tsx\` (predicate), \`fader-guards.test.tsx\`-ში ახალი \`describe\` (≥ 12 \`it\`, red-first), doc 036-ის დამატება.
- **C:** R34-TS, R34-CG (\`setTargetAtTime\` hook-ით), R34-SB, R34-R33, R34-K, S, U (mutation a–f), Doc, G34-1..3.

შემდეგ: Round 35 — SRW-13 ეტაპი 4b (fader-ის UX, A-R32-REVIEW-1 და A-R33-REVIEW-TOUCH-ის ჩათვლით); Round 36 — 4c + polish.

**Loop runner:** თუ \`run-loop.ps1\` \`-RoundLimit\`-ზე გაჩერდა, გადატვირთვა: \`-StartRound 34 -StartPhase A\`.

**Round 33-ის შედეგი** (C, \`c-round-33.md\`): **PASS** — ყველა ID.
- **PASS:** G33-1..3 (vitest 1230/1230, 376 OK, protected 4/4, ანონიმური \`/studio-lab\`); R33-FT (5 fader × header/lane/clip body/ruler, Delete და Backspace, focus BODY; dk-focus-retention B/C/D შლის; round-32-ის must-not 5/5; 1280 3/3); R33-KO; R33-G; R33-K; R33-S; R33-U (mutation a–f მოკლულია); R33-Doc.
- **დაიხურა:** C-R32-01, C-R31-02.
- **ახალი (record-იდან):** FOCUS-TEXT-STALE დადასტურდა (Medium), CLIP-GAIN-CLICK-DISCARD (Medium), A-R33-REVIEW-SCROLLBAR (Low), A-R33-REVIEW-TOUCH (Low → 4b). scroller-ის გარეთ click-ის შემდეგ Delete timeline-ის მონიშვნას შლის — მიღებულია (D-29y 4).
- **Ableton:** სამივე ქცევა დაუდასტურებელია (§18.1 focus-ზე არაფერს ამბობს).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, \`b-round-33/gates.txt\`): 376 OK, protected 4/4, tsc 0, vitest 69/1230, build ✓, Biome 2 CRLF error + 218 warning + 1 info. Frozen სია: \`b-round-33-tree-sha256.txt\` (376).

`;
t = t.slice(0, curStart) + current + t.slice(curEnd);

repLine('| FB-04 |', '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **ბაგია** (C-ის ყველა round-30 ID PASS-ია; ღიაა CLIP-GAIN-CLICK-DISCARD, Medium — Enter-ის გარეშე აკრეფილი მნიშვნელობა სხვა კლიპზე click-ისას იკარგება, C round 33 REC-2) | `c-round-30.md` §1–§9 (R30-GE +6.0000 dB, GV/GL, GN); ბაგი: `c-round-33/runs/rec-text-stale.txt` REC-2 | Round 34: CLIP-GAIN-CLICK-DISCARD. შემდეგ Tech Lead: R30-T, R34-T. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');
repLine('| FB-05 |', '| FB-05 | Pan | **მოწმდება** (C-ის ყველა round-31 ID PASS-ია; C-R31-01, C-R31-02 და C-R32-01 დაიხურა Round 32–33-ში. A-R32-REVIEW-1 review-ის Low-ია — C-მ აჩვენა, რომ რეალური მაუსი მას ხსნის — და 4b-შია double-click reset-თან ერთად) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC); `c-round-33.md` (R33-FT, R33-G) | Tech Lead: R31-T, R33-T. double-click reset და A-R32-REVIEW-1 — ეტაპი 4b (Round 35) |');
repLine('| SRW-12 |', '| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა FOCUS-TEXT-STALE, Medium — ძებნაში აკრეფის შემდეგ timeline-ზე click focus-ს ძებნაში ტოვებს და Backspace ფილტრს ცვლის) | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17; ბაგი: `c-round-33/runs/rec-text-stale.txt` REC-1 | Round 34: FOCUS-TEXT-STALE. R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Tech Lead-ის Windows-ის ფონტები |');
repLine('| SRW-13 |', '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და CLIP-GAIN-CLICK-DISCARD (Medium) → Round 34) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md` | Round 34: FOCUS-TEXT-STALE + CLIP-GAIN-CLICK-DISCARD + scrollbar (D-29y). Round 35 — 4b: fader-ის UX, A-R29-REVIEW-1, FADER-KEY-ENTRIES, Master-ის hold tick, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH. Round 36 — 4c: round-9 M1/L8. C-R27-01: Tech Lead |');
repLine('| SRW-24 |', '| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი R28/R29 ID PASS-ია; fader → კლიპი → Delete Round 33-ში PASS; ძებნა → კლიპი → Delete — FOCUS-TEXT-STALE, Round 34) | `delete-selection-update.md`; `c-round-28.md` §1–§9; `c-round-29.md`; `c-round-33.md` R33-FT; `tasks/round-28.md`, `tasks/round-29.md` | Tech Lead: R28-T. DOC034-UNREACHABLE-NOTE |');

repLine('| **C-R31-02** |', '| C-R31-02 | Medium | **დაიხურა** (Round 33: C-R32-01-თან ერთად — რეალური click-ების მატრიცა შლის, round-32-ის must-not 5/5) | `c-round-33.md` R33-FT | — |');
repLine('| **C-R32-01** |', '| C-R32-01 | Medium | **დაიხურა** (Round 33: R33-FT PASS — 5 fader × 4 სამიზნე, Delete და Backspace) | `c-round-33/runs/ft-matrix.txt`, `ft-clipbody-ruler.txt`, `dk-retention-rerun.txt` | — |');
repLine('| A-R32-REVIEW-1 |', '| A-R32-REVIEW-1 | Low | **არ დაწყებულა** | `a-round-32.md` §4 finding 1; `c-round-32/runs/bc-pid1-realclick.txt` | Pan-ის blur suppression შეიძლება დარჩეს, თუ ღილაკი ფანჯრის გარეთ აუშვეს; რეალური მაუსის click მას ხსნის (C) → ეტაპი 4b (Round 35) |');
repLine('| FOCUS-TEXT-STALE |', '| **FOCUS-TEXT-STALE** | Medium | **მუშავდება** (Round 34, D-29y; C-მ round 33-ში დაადასტურა) | `c-round-33/runs/rec-text-stale.txt` REC-1; `c-round-33.json` | ძებნაში აკრეფა → კლიპზე click → focus ძებნაში რჩება: Delete მკვდარია, Backspace ფილტრს ცვლის. Fix: capture handler ტექსტურ ველსაც ათავისუფლებს |\n| **CLIP-GAIN-CLICK-DISCARD** | Medium | **მუშავდება** (Round 34, D-29y) | `c-round-33/runs/rec-text-stale.txt` REC-2 | Clip Gain-ში Enter-ის გარეშე აკრეფილი მნიშვნელობა სხვა კლიპზე click-ისას იკარგება (keyed remount). Fix: იგივე capture blur — არსებული `onBlur` მნიშვნელობას selection-ის შეცვლამდე წერს |\n| A-R33-REVIEW-SCROLLBAR | Low | **მუშავდება** (Round 34) | `a-round-33.md` §4 | scrollbar-ზე click fader-ს (და ახლა ტექსტურ ველს) blur-ს უკეთებს. Fix: gutter-ის გეომეტრიით გამორიცხვა |\n| A-R33-REVIEW-TOUCH | Low | **არ დაწყებულა** | `a-round-33.md` §4 | touch scroll timeline-ზე fader-ს blur-ს უკეთებს და pending preview ადრე იწერება (მონაცემი არ იკარგება) → ეტაპი 4b (Round 35) |\n| OUTSIDE-SCROLLER-DELETE | info | **მიღებულია** (D-29y 4) | `c-round-33/runs/rec-outside.txt` | ბიბლიოთეკის item-ზე click-ის შემდეგ Delete timeline-ის მონიშვნას შლის: ბიბლიოთეკას წაშლის მოქმედება არ აქვს |');
const a31 = t.split('\n').find((l) => l.startsWith('| A-R31-REVIEW-2 |'));
if (a31) repLine('| A-R31-REVIEW-2 |', a31.replace('ეტაპი 4b (Round 34)', 'ეტაპი 4b (Round 35)'));

rep('**Round 32:** დაიხურა C-R31-01', '**Round 33:** დაიხურა C-R32-01 და C-R31-02. ახალი: FOCUS-TEXT-STALE დადასტურდა (Medium), CLIP-GAIN-CLICK-DISCARD (Medium), A-R33-REVIEW-SCROLLBAR და A-R33-REVIEW-TOUCH (Low); OUTSIDE-SCROLLER-DELETE მიღებულია. C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).\n\n**Round 32:** დაიხურა C-R31-01');

rep('| **R27-T** |', '| **R34-T** | რეალური მაუსით რეალურ Chrome-ში: ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნა უცვლელია; Clip Gain-ში Enter-ის გარეშე აკრეფა → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება; ძებნაში focus-ით scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის | headless-ში scrollbar 0 px-ია და focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |\n| **R27-T** |');

rep('- round 31-ის 7 ფაილი (C-მ შეამოწმა) კომიტისთვის მზადაა; round 32-ის ცვლილებები Round 33-ის C PASS-ს ელოდება (C-R32-01). `ArrangementLane.tsx` და doc 036 ორივე რაუნდს შეიცავს — ან round 31-ის 5 ხელუხლებელი ფაილი ახლა, ან 31 + 32 + 33 ერთად;',
  '- round 31 + 32 + 33-ის 9 ფაილი C-მ შეამოწმა (Round 33 PASS) და checkpoint commit-ისთვის მზადაა; root-ის gate-ები და review სავალდებულოა;');

fs.writeFileSync(p, t);
console.log('ok');
