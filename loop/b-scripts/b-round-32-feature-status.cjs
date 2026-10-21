const fs = require('fs');
const p = 'feature-status.md';
const src = fs.readFileSync(p, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';
let lines = src.split(/\r?\n/);

const idx = (prefix) => {
  const i = lines.findIndex((l) => l.startsWith(prefix));
  if (i < 0) throw new Error('missing line: ' + prefix);
  return i;
};
const replaceLine = (prefix, text) => {
  lines[idx(prefix)] = text;
};

const header = `# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-13 · ავტორი: B (round 32 → round 33 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება \`tmp/studio-real-loop/\`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში:**
- **C-R23-01 ისევ ღიაა.** \`/studio-lab\`-ის SSR HTML-ში 2 NUL byte-ია (28013/28014; round 32: 63 520 byte). გამოსწორებას სჭირდება (a) React 19 ან (b) \`app/entry.server.tsx\`-ის ვიწრო grant A-სთვის (\`b-round-23.md\` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.
- **C-R27-01 (Medium)** quiet Chrome-ს ელოდება (D-29t), C-R6-02/C-R8-01-თან ერთად.
- **საინფორმაციო კითხვა TL-Q-FB05-FB11 (არ ბლოკავს):** \`2.mp4\` 03:08–03:17-ში მთავარ mixer-ზე ნათქვამია „პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება“. B scope-ს არ ამცირებს: ტრეკის Pan (FB-05, \`1.mp4\` 03:39) უკვე გაკეთდა, Tempo-ს ბადე (FB-11) რჩება, თუ Tech Lead სხვას არ იტყვის.
- **R31-T:** Pan რეალური მაუსით და ყურსასმენით; ასევე — რეალურ Chrome-ში range აგრძელებს თუ არა \`input\`-ს focus-ის დაკარგვის შემდეგ, როცა ღილაკი დაჭერილია.
- **R33-T (ახალი):** რეალური მაუსით: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება.

**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX \`Soft impact\` full scale-ს აღწევს (DEMO-SFX-FULL-SCALE): (a) ნორმალიზების grant ან (b) მიღება.

**⚠ Root:**
- **Round 31-ის 7 ფაილი C-მ შეამოწმა და კომიტისთვის მზადაა.** Round 32-ის ცვლილებები (\`StudioWorkspace.tsx\`, \`fader-guards.test.tsx\` და round-32-ის ნაწილი \`ArrangementLane.tsx\`-სა და doc 036-ში) **კომიტისთვის მზად არ არის** — C FAIL C-R32-01-ზე, Round 33 ასწორებს. \`ArrangementLane.tsx\` და doc 036 ორივე რაუნდის ცვლილებას შეიცავს, ამიტომ პრაქტიკულად: ან round 31-ის 5 ხელუხლებელი ფაილი ახლა (\`ArrangementContext.tsx\`, \`graph.client.ts\`, \`model.ts\`, \`types/arrangement.ts\`, \`track-pan.test.tsx\`), ან round 31 + 32 + 33 ერთად, Round 33-ის C PASS-ის შემდეგ. აქტიური იმპლემენტაციის ფაილები არ კომიტდება.
- \`08b9e53\` და \`1cefea1\` დაკომიტებულია. მეორე remote-ის push non-fast-forward-ით უარყოფილი იყო — შესათანხმებელია force push-ის გარეშე.
- Merge-ით შემოსული \`app/lib/auth.ts\` და \`auth-bugs.test.ts\` working copy-ში CRLF-ია: Biome 2 format error.
- Tracked \`frontend-architect.md\` Write/Bash-ს იძლევა.
- Dev server დაგეგმვისას მუშაობდა (200); \`node.exe\` 7.

მიმდინარე რაუნდი: **Round 33** (\`current-task.md\`, D-29x) — C-ის ბაგი პირველ რიგში (ერთი Medium ბაგი):
- **C-R32-01 (Medium, Round 32-ის guard-ის შედეგი):** fader-ზე click-ის შემდეგ კლიპზე ან lane-ზე click focus-ს fader-იდან არ აშორებს (timeline-ის pointerdown \`preventDefault\`-ს იძახებს), ამიტომ Delete აღარ მუშაობს.
- **გამოსწორება:** ერთი capture-phase \`pointerdown\` handler timeline-ის scroller-ზე \`StudioWorkspace.tsx\`-ში: focused native range-ს \`blur()\`, თუ target თვითონ range არ არის და სხვა pointer gesture არ მიმდინარეობს. pending keyboard Volume/Master preview არსებული \`onBlur\`-ით ერთ ჩანაწერად იწერება. Round 32-ის guard უცვლელია.
- **A:** \`StudioWorkspace.tsx\` (ერთი handler), \`fader-guards.test.tsx\`-ში ახალი \`describe\` (≥ 11 \`it\`, red-first), doc 036-ის დამატება.
- **C:** R33-FT (fader × clip/lane/ruler, \`activeElement\`), KO, G, K, S, U (mutation a–f), Doc, G33-1..3; record only — FOCUS-TEXT-STALE, scroller-ის გარეთ click-ები.

შემდეგ: Round 34 — SRW-13 ეტაპი 4b (fader-ის UX, A-R32-REVIEW-1-ის ჩათვლით); Round 35 — 4c + polish.

**Loop runner:** თუ \`run-loop.ps1\` \`-RoundLimit\`-ზე გაჩერდა, გადატვირთვა: \`-StartRound 33 -StartPhase A\`.

**Round 32-ის შედეგი** (C, \`c-round-32.md\`): **FAIL** მხოლოდ ახალ Medium C-R32-01-ზე.
- **PASS:** G32-1..3 (vitest 1212/1212, 375 OK, protected 4/4, ანონიმური \`/studio-lab\`); R32-BC (blur-ის შემდეგ ჩანაწერი 0, panner-ს მხოლოდ revert, fresh drag +1, id 42 +1, Volume reference +1); R32-K; R32-S; R32-U (mutation a–g მოკლულია, b2 გადარჩა — მიღებულია); R32-Doc. R32-DK-ის იზოლირებული რიგები (5 fader-ზე Delete არაფერს შლის; body/clip/playhead შლის) PASS-ია.
- **FAIL:** R32-DK რეალურ თანმიმდევრობაში — C-R32-01.
- **დაიხურა:** C-R31-01 (R32-BC), R31-U-GAP-B2 (მიღებულია: A-ს ჩამონათვალი, b2 გადარჩა), R24-HC-COVERAGE.
- **ნაწილობრივ:** C-R31-02 იზოლირებულად გასწორდა, დაიხურება C-R32-01-თან ერთად.
- **ახალი:** C-R32-01 (Medium), A-R32-REVIEW-1 (Low → 4b), FOCUS-TEXT-STALE (B-ის დაკვირვება, record only).
- **Ableton:** სამივე ქცევა დაუდასტურებელია (წყარო არ აღწერს); double-click reset — დადასტურებული, 4b.
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, \`b-round-32/gates.txt\`): 375 OK, protected 4/4, tsc 0, vitest 69/1212, build ✓, Biome 2 CRLF error + 218 warning. ახალი frozen სია: \`b-round-32-tree-sha256.txt\` 376 OK.
`;

const firstSection = idx('## 1. ');
lines = [...header.split('\n'), ...lines.slice(firstSection)];

replaceLine('| FB-05 |', '| FB-05 | Pan | **ბაგია** (C-ის ყველა round-31 ID PASS-ია; C-R31-01 დაიხურა Round 32-ში. Round 32 — FB-05-ის fix-ის რაუნდი — FAIL-ით დასრულდა: Pan → კლიპი → Delete flow მკვდარია, C-R32-01) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC PASS; C-R32-01) | Round 33: C-R32-01. შემდეგ Tech Lead: R31-T, R33-T. double-click reset და A-R32-REVIEW-1 — ეტაპი 4b (Round 34) |');
replaceLine('| SRW-13 |', '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a და 3 მზადაა; 2b და 4a — ყველა ID PASS-ია; 4a-ის fix (Round 32) — FAIL C-R32-01-ზე; ღიაა C-R27-01 (Medium, Tech Lead), C-R32-01 (Medium) → Round 33) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md` | Round 33: C-R32-01 (D-29x). Round 34 — 4b: fader-ის UX, A-R29-REVIEW-1, FADER-KEY-ENTRIES, Master-ის hold tick, A-R31-REVIEW-2, A-R32-REVIEW-1. Round 35 — 4c: round-9 M1/L8. C-R27-01: Tech Lead |');
replaceLine('| **C-R31-02** |', '| **C-R31-02** | Medium | **ბაგია** (Round 32-ში იზოლირებულად გასწორდა — R32-DK-ის 5 fader-ის რიგი PASS; რეალური flow C-R32-01-მა გატეხა) | `c-round-31.md` §9; `c-round-32.md` R32-DK | დაიხურება C-R32-01-თან ერთად (Round 33) |');
replaceLine('| **C-R31-01** |', '| C-R31-01 | Low | **დაიხურა** (Round 32: R32-BC PASS) | `c-round-32/runs/bc-*.txt` | — |');
replaceLine('| R31-U-GAP-B2 |', '| R31-U-GAP-B2 | Low (ტესტის ხარვეზი) | **დაიხურა — მიღებულია დამცავ კოდად** (Round 32: A-ს ჩამონათვალმა reachable გზა ვერ იპოვა; C-ის b2 გადარჩა, როგორც მოსალოდნელი იყო) | `a-round-32.md` §1.4; `c-round-32.md` R32-U | — |');
replaceLine('| A-R31-REVIEW-2 |', '| A-R31-REVIEW-2 | Low | **არ დაწყებულა** | `a-round-31.md` §4 finding 2 | lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური) → ეტაპი 4b (Round 34) |');
const afterB2 = idx('| A-R31-REVIEW-2 |');
lines.splice(afterB2 + 1, 0,
  '| **C-R32-01** | Medium | **მუშავდება** (Round 33, D-29x; Round 32-ის guard-ის შედეგი) | `c-round-32.md` C-R32-01; `c-round-32/runs/dk-focus-retention.txt`, `dk.txt`, `bc-pid1-realclick.txt` | fader-ზე click → კლიპზე/lane-ზე click → Delete არაფერს აკეთებს: timeline-ის pointerdown `preventDefault`-ს იძახებს და focus fader-ზე რჩება. Fix: scroller-ის capture handler focused range-ს `blur()`-ს უკეთებს |',
  '| A-R32-REVIEW-1 | Low | **არ დაწყებულა** | `a-round-32.md` §4 finding 1; `c-round-32/runs/bc-pid1-realclick.txt` | Pan-ის blur suppression შეიძლება დარჩეს, თუ ღილაკი ფანჯრის გარეთ აუშვეს; Pan-ის კლავიშები ჩუმად იგნორირდება. რეალური მაუსის click მას ხსნის (C) → ეტაპი 4b (Round 34) |',
  '| FOCUS-TEXT-STALE | info (B-ის დაკვირვება) | **მოწმდება** (Round 33: მხოლოდ ჩაწერა) | `b-round-32.md` §4 გადაწყვეტილება 4 | focused ტექსტურ ველზე (ბიბლიოთეკის ძებნა, Clip Gain) timeline-ზე click-ის შემდეგ focus რჩება; Delete ტექსტს ასწორებს. C-ის დადასტურების შემთხვევაში — ცალკე ბაგის რაუნდი |',
);
const r31 = idx('**Round 31:** ბაგი არ დახურულა');
lines.splice(r31, 0, '**Round 32:** დაიხურა C-R31-01, R31-U-GAP-B2 (მიღებულია), R24-HC-COVERAGE. C-R31-02 იზოლირებულად გასწორდა. ახალი: C-R32-01 (Medium), A-R32-REVIEW-1 (Low), FOCUS-TEXT-STALE (დაკვირვება). C-R23-01: 2 NUL 28013/28014 (უცვლელი).', '');
const r31t = idx('| **R31-T** |');
lines.splice(r31t + 1, 0, '| **R33-T** | რეალური მაუსით რეალურ Chrome-ში: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება; ასევე ArrowRight კლიპს აჩოჩებს | C-R32-01: headless-ში click-ის focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |');
replaceLine('- round 31-ის 7 ფაილი (C-მ შეამოწმა) კომიტისთვის მზადაა', '- round 31-ის 7 ფაილი (C-მ შეამოწმა) კომიტისთვის მზადაა; round 32-ის ცვლილებები Round 33-ის C PASS-ს ელოდება (C-R32-01). `ArrangementLane.tsx` და doc 036 ორივე რაუნდს შეიცავს — ან round 31-ის 5 ხელუხლებელი ფაილი ახლა, ან 31 + 32 + 33 ერთად;');

fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
