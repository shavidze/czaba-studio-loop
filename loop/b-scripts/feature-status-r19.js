const fs = require('fs');
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/';
const p = dir + 'feature-status.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync(dir + 'b-scripts/feature-status.before-r19.md', t);

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const headStart = t.indexOf('განახლდა: 2026-10-11');
const headEnd = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
const head = `განახლდა: 2026-10-11 · ავტორი: B (round 18 → round 19 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება \`tmp/studio-real-loop/\`-ს.

მიმდინარე რაუნდი: **Round 19** (\`current-task.md\`, D-29j) — C-R18-01, მხოლოდ \`ArrangementDetailPanel.tsx\`:
- design (d): ქართული label-ები (\`დასაწყისი\` ორჯერ, \`წყაროდან\`, \`საიდან, წმ\`, \`სადამდე, წმ\`);
- info-ს სვეტი \`w-56\` → \`w-72\` (288 px). A ჯერ page-state-ში ზომავს და ჩერდება, თუ რომელიმე stop-პირობა შესრულდა;
- ფასი: waveform −64 px (1280/480-ზე 288 px რჩება). Footer და \`aria-label\`-ები სიტყვასიტყვით რჩება.

შემდეგ: milestone-ის სრული რეგრესია, მერე milestone-ის fix-ის რაუნდი, შემდეგ SRW-13.

Round 18-ის შედეგი (C, \`c-round-18.md\`): **FAIL მხოლოდ R18-D-ზე**.
- **PASS:**
  - R18-L4: ველები მხოლოდ დაკავშირებულ ცვლილებაზე ბრუნდება (C mutation M1);
  - R18-W: ფოკუსირებულ ველზე wheel-ის default ჩერდება, სხვაგან არა;
  - R18-B: overlay-ის alpha 0.3-ია;
  - R18-L6, R18-A, R18-Doc.
- **მეზობელი რეგრესიები PASS:** R8 detail quick, R16-H1 quick, R16-F1 quick, R9-D3/RF7-P2, lane-ის range. G18-1..3 PASS-ია, vitest 996/996.
- **ახალი ბაგი:** C-R18-01 (Medium). Design (d) არ მიწოდებულა: \`w-64\`-მდე არცერთი სიგანე არ ეტევა (259.81 > 256). A-მ წესის მიხედვით შეაჩერა, C-მ დაადასტურა.
- **B-ის ფორმულირების შეცდომა (D-29j):** 1280-ზე ჯგუფის მდგომარეობაში panel 122-ია და არა 142 (D-29g residual).

`;
t = t.slice(0, headStart) + head + t.slice(headEnd);

rep('| SRW-13 (Round 19) |', '| SRW-13 (milestone-ის შემდეგ) |');
rep('| SRW-13 (Round 19) |', '| SRW-13 (milestone-ის შემდეგ) |');
rep('| SRW-13 (Round 19) |', '| SRW-13 (milestone-ის შემდეგ) |');

rep(
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის, polish 14a-სა და Round 17-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium)) |',
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის, polish 14a-ს, Round 17-ისა და Round 18-ის L4/L11/(b)/L6 C ID-ები PASS-ია; ღიაა C-R8-01 და C-R18-01, ორივე Medium) |',
);
rep(
  'C-R16-01 + M-R10-1/M2: `c-round-17.md` §2–§5 | Round 18: polish 14b (D-29i). M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T |',
  'C-R16-01 + M-R10-1/M2: `c-round-17.md` §2–§5; polish 14b: `c-round-18.md` §2–§7 | Round 19: C-R18-01 (D-29j). M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T |',
);
rep(
  'C-R12-01: milestone RF5-3. Round 18: dock, `video-sync.ts` და `ArrangementContext.tsx` გაყინულია, sync run არ არის |',
  'C-R12-01: milestone RF5-3. Round 19: dock, `video-sync.ts` და `ArrangementContext.tsx` გაყინულია, sync run არ არის |',
);
rep(
  'R11A-2 (keys) milestone-ის რეგრესიაში. Round 18-ში `ArrangementLibrary.tsx`, preview და dock გაყინულია |',
  'R11A-2 (keys) milestone-ის რეგრესიაში. Round 19-ში `ArrangementLibrary.tsx`, preview და dock გაყინულია |',
);
rep(
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის, polish 14a-სა და Round 17-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium); polish 14b მუშავდება) |',
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის, polish 14a-ს, Round 17-ისა და 14b-ის L4/L11/(b)/L6/A C ID-ები PASS-ია; ღიაა C-R8-01 და C-R18-01, ორივე Medium) |',
);
rep(
  'Round 17: `c-round-17.md` §1–§7; D-29, D-29a–D-29i (`plan.md`) | Round 18: polish 14b (R18-L4, R18-W, R18-B, R18-D, R18-L6, R18-A, R18-U, R18-Doc).',
  'Round 17: `c-round-17.md` §1–§7; polish 14b: `c-round-18.md` §1–§7; D-29, D-29a–D-29j (`plan.md`) | Round 19: C-R18-01 (R19-D1, R19-D2, R19-A, R19-U, R19-Doc).',
);
rep(
  '| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 19, milestone-ის რეგრესიის შემდეგ.',
  '| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Milestone-ის რეგრესიისა და fix-ის რაუნდის შემდეგ.',
);

rep(
  '| C-R12-01 | Low |',
  '| C-R18-01 | Medium | **ბაგია** (design (d) არ მიწოდებულა; stop წესის შესაბამისი იყო) | `c-round-18.md` §3, `c-round-18/runs/stop-1440x900.txt`, `quicks-1280x720.txt`; `a-round-18.md` §1.4 | Round 19 (D-29j): info-ს სვეტი `w-72`, ჯერ გაზომვა 288 px-ზე |\n| C-R12-01 | Low |',
);

rep(
  '**ბოლოს დაიხურა:** C round 17-ში',
  '**Round 18-ში C-ის მტკიცებულებით დასრულდა (ბაგი არ ყოფილა):** polish 14b-ის L4, L11, design (b), L6 (`c-round-18.md` §2, §4–§6; guard M1–M7).\n\n**ბოლოს დაიხურა:** C round 17-ში',
);

rep(
  '**მიღებული (კოდი არ იცვლება):**\n',
  `**მიღებული (კოდი არ იცვლება):**
- A-ს round-18 deviation-ები (D-29j):
  - 2: წარმატებული Apply ველებში \`rangeInputText(clamped)\`-ს წერს (C guard M6);
  - 4: სიგანე page-state-ის inline \`style.width\`-ით იზომება, რადგან გამოუყენებელი Tailwind კლასი კომპილირებული არ არის;
  - 5: W480-ის raw row-ები \`header\`-ით იკითხება;
  - 6: 1280-ზე ჯგუფის panel 122-ია (D-29g residual). „142“ ჯგუფისთვის B-ის ფორმულირების შეცდომა იყო;
  - 7: R18-D-ის სურათები as-is ჩანაწერია.
`,
);
rep(
  '- Lane-ის clip overlay (`ArrangementClip.tsx`) `bg-foreground/60`-ზე რჩება, detail-ისა კი Round 18-ში `/30` ხდება.',
  '- Lane-ის clip overlay (`ArrangementClip.tsx`) `bg-foreground/60`-ზე რჩება, detail-ისა კი Round 18-ში `/30` გახდა (C PASS).',
);
rep(
  '- C round 17-ის ინციდენტი:',
  '- `ArrangementLane.tsx:661`-ზე იმავე `biome-ignore` rule-ს სხვა მიზეზის ტექსტი აქვს (L6-ის ანალოგი, frozen ფაილი). გასწორდება milestone-ის fix-ის რაუნდში ან SRW-17-ში.\n- C round 18-ის harness-ის შენიშვნა: ველის გასუფთავება `Control+a`-ით მხოლოდ ჩართულ, ფოკუსირებულ ველზეა უსაფრთხო. სხვაგან workspace-ის Ctrl+A ყველა კლიპს მონიშნავს.\n- C round 17-ის ინციდენტი:',
);
rep('round 6–17-ის Studio სამუშაო (18 M + 20 untracked) დაუკომიტებელია.', 'round 6–18-ის Studio სამუშაო (18 M + 22 untracked) დაუკომიტებელია.');
rep('  - Round 18: L4, L11, design (b), L6, design (d) (D-29i);', '  - Round 18: L4, L11, design (b), L6 (C PASS); design (d) → C-R18-01, Round 19 (D-29j);');

rep(
  '| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) |',
  '| R19-T | Detail-ის ქართული label-ები რეალურ Windows Chrome-ში 1280×720-სა და 1440×900-ზე, ბიბლიოთეკით 288 და 480: info-ს ყოველი ხაზი ერთ ხაზზეა (ჯგუფის შენიშვნის გარდა), სათაური და ხაზის row არ იჭრება (`w-72`) | headless იმავე მანქანაზე იგივე font-ებს იყენებს, მაგრამ 28 px-იანი რეზერვი მომხმარებლის ბრაუზერში დასტურდება |\n| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) |',
);
rep('- round 6–17-ის დაუკომიტებელი tree;', '- round 6–19-ის დაუკომიტებელი tree;');

fs.writeFileSync(p, t);
console.log('feature-status.md updated');
