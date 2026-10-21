const fs = require('fs');
const p = 'feature-status.md';
let t = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error(`missing anchor: ${from.slice(0, 90)}`);
  }
  t = t.replace(from, to);
}

const start = t.indexOf('განახლდა:');
const end = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
const header = `განახლდა: 2026-10-13 · ავტორი: B (round 31 → round 32 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება \`tmp/studio-real-loop/\`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში:**
- **C-R23-01 ისევ ღიაა.** \`/studio-lab\`-ის SSR HTML-ში 2 NUL byte-ია (28013/28014; round 31: 63 520 byte). გამოსწორებას სჭირდება (a) React 19 ან (b) \`app/entry.server.tsx\`-ის ვიწრო grant A-სთვის (\`b-round-23.md\` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.
- **C-R27-01 (Medium)** quiet Chrome-ს ელოდება (D-29t), C-R6-02/C-R8-01-თან ერთად.
- **საინფორმაციო კითხვა TL-Q-FB05-FB11 (არ ბლოკავს):** \`2.mp4\` 03:08–03:17-ში მთავარ mixer-ზე ნათქვამია „პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება“. B scope-ს არ ამცირებს: ტრეკის Pan (FB-05, \`1.mp4\` 03:39) უკვე გაკეთდა, Tempo-ს ბადე (FB-11) რჩება, თუ Tech Lead სხვას არ იტყვის.
- **R31-T (ახალი):** Pan რეალური მაუსით და ყურსასმენით; ასევე — რეალურ Chrome-ში range აგრძელებს თუ არა \`input\`-ს focus-ის დაკარგვის შემდეგ, როცა ღილაკი დაჭერილია (C-R31-01-ის რეალისტურობა).

**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX \`Soft impact\` full scale-ს აღწევს (DEMO-SFX-FULL-SCALE): (a) ნორმალიზების grant ან (b) მიღება.

**⚠ Root:**
- **Round 31-ის 7 ფაილი C-მ შეამოწმა და კომიტისთვის მზადაა** (\`b-round-31-git-status.txt\`; B-ის gate-ები: \`b-round-31/gates.txt\`). Round 32 შეცვლის \`ArrangementLane.tsx\`-ს, \`StudioWorkspace.tsx\`-ს და doc 036-ს, ამიტომ B გირჩევს კომიტს A-ს round-32 დაწყებამდე (აქტიური იმპლემენტაციის ფაილები არ კომიტდება).
- \`08b9e53\` და \`1cefea1\` დაკომიტებულია. მეორე remote-ის push non-fast-forward-ით უარყოფილი იყო — შესათანხმებელია force push-ის გარეშე.
- Merge-ით შემოსული \`app/lib/auth.ts\` და \`auth-bugs.test.ts\` working copy-ში CRLF-ია: Biome 2 format error.
- Tracked \`frontend-architect.md\` Write/Bash-ს იძლევა.
- Dev server დაგეგმვისას მუშაობდა (200); \`node.exe\` 7.

მიმდინარე რაუნდი: **Round 32** (\`current-task.md\`, D-29w) — C-ის ბაგები პირველ რიგში (სამი დაკავშირებული ბაგი):
- **C-R31-02 (Medium):** Delete/Backspace focused native range-ზე (Volume, Pan, Master, Zoom) timeline-ს აღარ ცვლის. \`role="slider"\` (playhead, overview, preview) უცვლელია. A-ს round-31 Pan workaround იშლება.
- **C-R31-01 (Low):** Pan-ის drag-ის შუაში blur-ის შემდეგ იმავე დაჭერილი pointer-ის \`input\`-ები იგნორირდება მის აშვებამდე.
- **R31-U-GAP-B2:** მიღებულია როგორც დამცავი კოდი; A ამოწმებს \`syncPlayback\`-ის გამოძახებების ჩამონათვალს.
- **A:** \`StudioWorkspace.tsx\` (მხოლოდ Delete branch), \`ArrangementLane.tsx\` (Pan handler-ები), ახალი \`fader-guards.test.tsx\` (≥ 12 \`it\`), doc 036-ის დამატება.
- **C:** R32-DK, BC, K, S, U (mutation a–g + b2), Doc, G32-1..3, Ableton-ის ორი ვერდიქტი.

შემდეგ: Round 33 — SRW-13 ეტაპი 4b (fader-ის UX); Round 34 — 4c + polish.

**Loop runner:** თუ \`run-loop.ps1\` \`-RoundLimit\`-ზე გაჩერდა, გადატვირთვა: \`-StartRound 32 -StartPhase A\`.

**Round 31-ის შედეგი** (C, \`c-round-31.md\`): **PASS** ყველა ID-ზე.
- **PASS:**
  - G31-1..3 (vitest 1193/1193, protected 4/4, 371 OK, ანონიმური \`/studio-lab\`);
  - R31-PE: 50L — R 0 LSB, L = E0.L+E0.R ≤ 1 LSB; ER სარკე; PE2 (25L) ≤ 1.41 LSB; EC = E0 0 LSB; unsolo SFX/ვიდეო 0;
  - PV: ახალი start 0, \`setTargetAtTime\` მხოლოდ music panner-ზე (τ 0.015), preview-ების დროს past უცვლელია, release-ზე +1; tap R −∞;
  - PL: loop-ის ყოველ iteration-ზე 1 start, wrap-ებზე ramp 0;
  - PH, PG, PD, PUI (1440 და 1280+panel), PC, K, R, S, U (a–k + dev1/6/7/9), Doc.
- **ახალი:** C-R31-02 (Medium, არსებული ქცევა), C-R31-01 (Low), R31-U-GAP-B2 (ტესტის ხარვეზი).
- **მიღებულია:** A-ს deviation-ები 1–9 (6 — \`setTrackPan\` ნებისმიერი gesture-ის დროს უარს ამბობს; 1 Round 32-ში იშლება).
- **Ableton:** per-track pan — დადასტურებული; სრული pan → მოპირდაპირე არხი ჩუმი — დადასტურებული მიმართულებით; pan law — დაუდასტურებელი (CZABA-ს W3C არჩევანი); reset, multi-track, Split Stereo, ვიდეოს pan — შეგნებული განსხვავება; \`C\`/\`50L\` — დაუდასტურებელი.
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13): 371 OK, protected 4/4, tsc 0, vitest 68/1193, build ✓, Biome 2 CRLF error + 218 warning. ახალი frozen სია: \`b-round-31-tree-sha256.txt\` 375 OK.

`;
t = t.slice(0, start) + header + t.slice(end);

rep(
  '| FB-05 | Pan | **მუშავდება** (Round 31 გაგზავნილია, D-29v) | — | SRW-13 ეტაპი 4a: A → C (R31-*) |',
  '| FB-05 | Pan | **ბაგია** (C-ის ყველა ID PASS-ია, Round 31; ღიაა Low C-R31-01 FB-05-ის კოდში → Round 32) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC) | Round 32: C-R31-01. შემდეგ Tech Lead: R31-T. double-click reset — ეტაპი 4b |',
);
rep(
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a და 3 მზადაა — 3: Round 30 C PASS; ეტაპი 2b-ის ყველა ID PASS-ია; ღიაა C-R27-01, Medium, Tech Lead quiet Chrome; ეტაპი 4a მუშავდება) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md` | 4a: FB-05 Pan (Round 31, D-29v). 4b: fader-ის UX, A-R29-REVIEW-1, FADER-KEY-ENTRIES, Master-ის hold tick. 4c: round-9 M1/L8. C-R27-01: Tech Lead |',
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a და 3 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead), C-R31-02 (Medium) და C-R31-01 (Low) → Round 32) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md` | Round 32: C-R31-02, C-R31-01, R31-U-GAP-B2 (D-29w). Round 33 — 4b: fader-ის UX, A-R29-REVIEW-1, FADER-KEY-ENTRIES, Master-ის hold tick, A-R31-REVIEW-2. Round 34 — 4c: round-9 M1/L8. C-R27-01: Tech Lead |',
);

rep(
  '| **C-R30-01** | Low |',
  '| **C-R31-02** | Medium | **მუშავდება** (Round 32, D-29w; არსებული ქცევა) | `c-round-31.md` §9; `c-round-31/runs/volume-delete-key.txt`; `a-round-31.md` §6 deviation 1 | focused Volume-ზე (კოდით Master/Zoom-ზეც) Delete/Backspace არჩეულ კლიპს შლის (Undo აბრუნებს). Fix: ვიწრო guard native range-ზე `StudioWorkspace`-ის Delete branch-ში; Pan-ის workaround იშლება |\n| **C-R31-01** | Low | **მუშავდება** (Round 32) | `c-round-31.md` §9; `c-round-31/runs/pg-blur-cancel.txt` | blur-ის შემდეგ, დაჭერილი pointer-ის `input`-ები Pan-ზე თითო ჩანაწერს წერს. Fix: იგნორი pointer-ის აშვებამდე. რეალური Chrome — R31-T |\n| R31-U-GAP-B2 | Low (ტესტის ხარვეზი) | **მუშავდება** (Round 32: მიიღება როგორც დამცავი კოდი A-ს ჩამონათვალით) | `c-round-31.md` §7, §9 | `syncPlayback`-ის non-reschedule override gesture-ის დროს მიუღწეველია |\n| A-R31-REVIEW-2 | Low | **არ დაწყებულა** | `a-round-31.md` §4 finding 2 | lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური) → ეტაპი 4b (Round 33) |\n| **C-R30-01** | Low |',
);

rep(
  '**Round 30:** ბაგი არ დახურულა (რაუნდის scope-ში ახალი არ იყო).',
  '**Round 31:** ბაგი არ დახურულა. ახალი: C-R31-02 (Medium, არსებული ქცევა — A-მ იპოვა, C-მ ბრაუზერში დაადასტურა), C-R31-01 (Low), R31-U-GAP-B2, A-R31-REVIEW-2. ინფორმაცია: refusal status drag-ის შემდეგაც ჩანს (→ 4b); 50L-ზე track meter-ის over-0 მოსალოდნელია (pre-Master). C-R23-01: 2 NUL 28013/28014 (უცვლელი).\n\n**Round 30:** ბაგი არ დახურულა (რაუნდის scope-ში ახალი არ იყო).',
);

rep(
  '| **R31-T** | Pan-ის drag რეალური მაუსით და ყურსასმენით: მდორეა, zipper-ის გარეშე; 50L მხოლოდ მარცხნივ ისმის, C — ცენტრში (Round 31-ის შემდეგ) | headless-ში მოსმენა და რეალური მაუსი შეუძლებელია |',
  '| **R31-T** | Pan-ის drag რეალური მაუსით და ყურსასმენით: მდორეა, zipper-ის გარეშე; 50L მხოლოდ მარცხნივ ისმის, C — ცენტრში. დამატებით: focus-ის დაკარგვისას (მაგ. Alt+Tab) დაჭერილი ღილაკით range აგრძელებს თუ არა `input`-ს (C-R31-01) | headless-ში მოსმენა და რეალური მაუსი შეუძლებელია; C-მ synthetic event-ები გამოიყენა |',
);

rep(
  '- `publication-checkpoint.json`-ის მოთხოვნები:',
  '- round 31-ის 7 ფაილი (C-მ შეამოწმა) კომიტისთვის მზადაა; რეკომენდაცია — Round 32-ის A-ს დაწყებამდე;\n- `publication-checkpoint.json`-ის მოთხოვნები:',
);

fs.writeFileSync(p, t);
console.log('feature-status updated');
