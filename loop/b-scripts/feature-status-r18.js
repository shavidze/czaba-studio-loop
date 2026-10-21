const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let t = fs.readFileSync(p, 'utf8');

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const headStart = t.indexOf('განახლდა: 2026-10-11');
const headEnd = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
const head = `განახლდა: 2026-10-11 · ავტორი: B (round 17 → round 18 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება \`tmp/studio-real-loop/\`-ს.

მიმდინარე რაუნდი: **Round 18** (\`current-task.md\`, D-29i) — polish 14b, მხოლოდ \`ArrangementDetailPanel.tsx\`:
- L4: range-ის ველები აკრეფილ ტექსტს მხოლოდ დაკავშირებულ ცვლილებაზე კარგავს (component test, UI-ში გზა არ არის);
- L11: ფოკუსირებულ range-ის ველზე wheel მნიშვნელობას არ ცვლის;
- design (b): detail-ის range overlay waveform-ს აღარ ფარავს (\`bg-foreground/30\`);
- L6: \`biome-ignore\`-ის მიზეზის ტექსტი;
- design (d): ქართული label-ები (\`დასაწყისი\`, \`წყაროდან\`, \`საიდან, წმ\`, \`სადამდე, წმ\`). Footer სიტყვასიტყვით რჩება.

შემდეგ: milestone-ის სრული რეგრესია, მერე milestone-ის fix-ის რაუნდი, შემდეგ SRW-13.

Round 17-ის შედეგი (C, \`c-round-17.md\`): **PASS**, ახალი ბაგის გარეშე.
- **PASS:** R17-P1, R17-P2, R17-P3, R17-M, R17-U და R17-Doc.
  - Preview 167 px-ია და row 32 px ყველა ხაზზე, 288/384/480-ზე, ორივე viewport-ზე.
  - Body Δ0-ია და ყუთში preview-ის 0 sample მოხვდა.
  - Find → add ერთ Undo entry-ს ქმნის. Preview ნამდვილად ჟღერს (−14.9 dBFS).
- **მეზობელი რეგრესიები PASS:** R16-F2/F3/F1 quick, R15-P2 quick, R13-F3 quick, R11A-1 quick, dock quick, RF7-P2. G17-1..3 PASS-ია, vitest 983/983.
- **დაიხურა:** C-R16-01 და round-9 reviewer M-R10-1/M2.
- **B-ის ფორმულირების შეცდომები (D-29i):**
  - R17-P1.1: ხაზები ითვლება \`rangeLines\`-ით;
  - R17-P2.3: „ყუთში 0, დანარჩენი preview ან separator“.

`;
t = t.slice(0, headStart) + head + t.slice(headEnd);

rep(
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ისა და polish 14a-ს ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R16-01 (Low)) |',
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის, polish 14a-სა და Round 17-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium)) |',
);
rep(
  '; polish 14a: `c-round-16.md` §3–§8 | Round 17: C-R16-01 + M-R10-1/M2 (D-29h). Round 18: polish 14b. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB |',
  '; polish 14a: `c-round-16.md` §3–§8; C-R16-01 + M-R10-1/M2: `c-round-17.md` §2–§5 | Round 18: polish 14b (D-29i). M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-W |',
);
rep(
  '`c-round-16.md` §8 (დაკვრის sanity: \\|Δ\\| ≤ 11 ms, counter-ები 0) |',
  '`c-round-16.md` §8 (დაკვრის sanity: \\|Δ\\| ≤ 11 ms, counter-ები 0); `c-round-17.md` §4 (counter-ები 0) |',
);
rep(
  '`c-round-16.md` §2, §8 (G16-3; WAV 864 000 frame = 18.000 წმ) | — |',
  '`c-round-16.md` §2, §8 (G16-3; WAV 864 000 frame = 18.000 წმ); `c-round-17.md` §1, §7 (G17-3; WAV 18.000 წმ) | — |',
);
rep(
  'C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. C-R12-01: milestone RF5-3. Round 17: dock, `video-sync.ts` და `ArrangementContext.tsx` გაყინულია, sync run არ არის |',
  'C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. C-R12-01: milestone RF5-3. Round 18: dock, `video-sync.ts` და `ArrangementContext.tsx` გაყინულია, sync run არ არის |',
);
rep(
  '`c-round-14.md` §8, `c-round-16.md` §8 (R11A-1 quick) | R11A-2 (keys) milestone-ის რეგრესიაში. Round 17-ში `ArrangementLibrary.tsx` და dock გაყინულია; იცვლება მხოლოდ preview-ის ფაილი (SRW-12) |',
  '`c-round-14.md` §8, `c-round-16.md` §8, `c-round-17.md` §7 (R11A-1 quick) | R11A-2 (keys) milestone-ის რეგრესიაში. Round 18-ში `ArrangementLibrary.tsx`, preview და dock გაყინულია |',
);
rep(
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ისა და polish 14a-ს ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R16-01 (Low)) |',
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის, polish 14a-სა და Round 17-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium); polish 14b მუშავდება) |',
);
rep(
  'polish 14a: `c-round-16.md` §1–§8; D-29, D-29a–D-29h (`plan.md`) | Round 17: C-R16-01 + M-R10-1/M2 (R17-P1..P3, R17-M, R17-U, R17-Doc). Round 18: polish 14b. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome |',
  'polish 14a: `c-round-16.md` §1–§8; Round 17: `c-round-17.md` §1–§7; D-29, D-29a–D-29i (`plan.md`) | Round 18: polish 14b (R18-L4, R18-W, R18-B, R18-D, R18-L6, R18-A, R18-U, R18-Doc). M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. A-ს round-11 follow-up-ები: milestone-ის fix-ის რაუნდი. C-R8-01: Tech Lead quiet Chrome |',
);
rep(
  '| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e) | Round 17 preview-ის ფაილს ცვლის: C ამოწმებს preview-ის wave/toggle/add-ს და find → add-ს (R17-P3). R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag |',
  '| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e); `c-round-17.md` §2–§4 (preview-ის row, wave/toggle/keys, find → add = ერთი Undo) | R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Tech Lead-ის Windows-ის ფონტები |',
);
rep(
  '`c-round-14.md` §2, `c-round-16.md` §2 (G-3 header link) | — |',
  '`c-round-14.md` §2, `c-round-16.md` §2, `c-round-17.md` §1 (G-3 header link) | — |',
);

rep(
  '| C-R16-01 | Low | **მუშავდება** (Round 17) | `c-round-16/runs/active-lane-residual-1440-288.txt`, `shots/active-lane-residual-1440-288.png`; confounder 1280: `runs/f1-extra-1280.txt`; `c-round-16.md` §9 | D-29h: preview-ის აქტიური ხაზის row ფიქსირებული ორხაზიანია (clamp + `title`). ყუთის re-placement არ ემატება (R17-P1..P3) |\n',
  '',
);
rep(
  '**ბოლოს დაიხურა:** C round 16-ში',
  '**ბოლოს დაიხურა:** C round 17-ში C-R16-01 (`c-round-17/runs/p2-*.txt`: body Δ0, ყუთში 0 sample) და round-9 reviewer M-R10-1/M2 (R17-M, guard G3/G4). C round 16-ში',
);

rep(
  '**მიღებული (კოდი არ იცვლება):**\n',
  `**მიღებული (კოდი არ იცვლება):**
- A-ს round-17 deviation-ები (D-29i):
  - 1 და 2 B-ის ფორმულირების შეცდომაა (\`rangeLines\`; separator-ის სვეტი);
  - 3: CDP-ის კოორდინატული click დაბლოკილია, „რეალური click“ = \`$B click\` ელემენტის ცენტრში;
  - 5: \`—\` მდგომარეობა მხოლოდ ტესტით მოწმდება.
- D-29h-ის ფასი: preview +16 px ერთხაზიან მდგომარეობებში (C-მ A-ს ცხრილს შეადარა).
`,
);

rep(
  '  - Round 17: M-R10-1/M2;\n  - Round 18: L4, L11, design (b), L6, design (d);',
  '  - Round 17: M-R10-1/M2 (C PASS, დაიხურა);\n  - Round 18: L4, L11, design (b), L6, design (d) (D-29i);',
);
rep(
  '(`aria-controls` lane-ის fold ღილაკზე, Home separator-ებზე seek-ს აკეთებს, ring-inset track name-ზე, panel `nextElementSibling`-ით): Round 18 ან milestone.',
  '(`aria-controls` lane-ის fold ღილაკზე, Home separator-ებზე seek-ს აკეთებს, ring-inset track name-ზე, panel `nextElementSibling`-ით): milestone-ის fix-ის რაუნდი (D-29i).\n- Lane-ის clip overlay (`ArrangementClip.tsx`) `bg-foreground/60`-ზე რჩება, detail-ისა კი Round 18-ში `/30` ხდება. ეს სხვაობა გასწორდება, როცა `ArrangementClip.tsx` გაიხსნება (SRW-14/SRW-18), ან C-ის/დიზაინის ბაგით.\n- C round 17-ის ინციდენტი: guard-ის ფოლდერში `ln -s node_modules`-მა 547 MB-იანი ასლი შექმნა. C-მ ის წაშალა; store-ის `node_modules` ხელუხლებელია.',
);
rep(
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–16-ის Studio სამუშაო (18 M + 18 untracked) დაუკომიტებელია.',
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–17-ის Studio სამუშაო (18 M + 20 untracked) დაუკომიტებელია. A-ს round-17 deviation 4: `taskkill //IM python.exe`-მა 2 python პროცესი მოკლა (ერთი უცნობი). Root-მა უნდა დაადასტუროს, რომ საჭირო helper არ მოკლულა.',
);

rep(
  '| R17-T | ბიბლიოთეკის preview-ის ორხაზიანი row რეალურ Windows-ის Georgian font-ებით (288 და 480) — ტექსტი ორ ხაზში ეტევა ან ellipsis-ით მთავრდება, `title` სრულია | headless-ის font metrics შეიძლება განსხვავდებოდეს |',
  '| R17-T | ბიბლიოთეკის preview-ის ორხაზიანი row რეალურ Windows-ის Georgian font-ებით (288 და 480) — ტექსტი ორ ხაზში ეტევა ან ellipsis-ით მთავრდება, `title` სრულია. მესამე ხაზის შემთხვევაში clamp `· playhead`-ის დროს მალავს (C: `c-round-17/shots/forced-overflow-1440-288.png`) | headless-ის font metrics შეიძლება განსხვავდებოდეს |\n| R18-W | რეალური wheel ფოკუსირებულ detail-ის start/end ველზე მნიშვნელობას არ ცვლის; არაფოკუსირებულ ველსა და waveform-ზე კონტენტი ისევ სქროლდება | gstack-ს wheel არ აქვს; jsdom number input-ს wheel-ით არ ცვლის |',
);

rep(
  '- round 6–16-ის დაუკომიტებელი tree;',
  '- round 6–17-ის დაუკომიტებელი tree;\n- fake Bearer → 500 (token არ გაიცემა; 401 უფრო სწორი იქნებოდა);\n- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს (real-mouse harness-ებისთვის);',
);
rep(
  '- `/studio-lab` ანონიმურად იხსნება (C round 16-ში G16-3 დაადასტურა);',
  '- `/studio-lab` ანონიმურად იხსნება (C round 17-ში G17-3 დაადასტურა);',
);

fs.writeFileSync(p, t);
console.log('feature-status.md updated');
