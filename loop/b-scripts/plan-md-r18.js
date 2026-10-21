const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync('C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/plan.before-r18.md', t);

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const d29i = `**D-29i — Round 17-ის შედეგი და polish 14b-ის კონტრაქტი (Round 18; D-29h-ის დამატება).** C round 17-ის შედეგი (\`c-round-17.md\`): **PASS**, ახალი ბაგის გარეშე — R17-P1, R17-P2, R17-P3, R17-M, R17-U, R17-Doc, მეზობელი რეგრესიები (R16-F2/F3/F1 quick, R15-P2 quick, R13-F3 quick, R11A-1 quick, dock quick, RF7-P2) და G17-1..3. vitest 983/983.

- **დაიხურა C-ის მტკიცებულებით:**
  - C-R16-01. Preview 167 px-ია და row 32 px ყველა ხაზზე, 288/384/480 სიგანეზე, ორივე viewport-ზე. Body Δ0-ია და ყუთში preview-ის 0 sample მოხვდა;
  - round-9 reviewer M-R10-1/M2: library playhead-ის node იგივე რჩება, ხოლო guard-ის G3/G4 ჩავარდა.
- **ფასი (D-29h):** ერთხაზიან მდგომარეობებში +16 px. C-მ ის A-ს ცხრილს უჯრა-უჯრა შეადარა.
- **A-ს round-17 deviation-ები:**
  - **1 და 2 B-ის ფორმულირების შეცდომაა:**
    - ფიქსირებულ ორხაზიან სიმაღლეზე \`round(scrollHeight / line-height)\` ყოველთვის 2-ია. შინაარსის ხაზები ამიერიდან ითვლება \`rangeLines\`-ით (\`Range.getClientRects()\`-ის განსხვავებული top-ები) ან page-state unclamp-ით;
    - preview-ის sample grid-ის x = 284 სვეტი ბიბლიოთეკის separator-ს ხვდება. სწორი ფორმულირებაა „ყუთში 0 sample, დანარჩენი preview-ს ან separator-ს ხვდება“.
  - **3:** gstack CDP \`Input.dispatchMouseEvent\`-ს უარყოფს. „რეალური click“ ნიშნავს \`$B click\`-ს ელემენტის ცენტრში. ელემენტის შიგნით კოორდინატული click synthetic-ია, \`buttons: 1\`-ით.
  - **4** (python პროცესის მოკვლა) root-ს გადაეცემა. **5:** \`—\` მდგომარეობა მხოლოდ ტესტით მოწმდება.
- **R17-T** (Tech Lead) ივსება C-ის მონაცემით: მესამე ხაზის შემთხვევაში clamp \`· playhead\`-ის დროს მალავს.

**Polish 14b (Round 18), მხოლოდ \`ArrangementDetailPanel.tsx\`:**
- **L4 — ველების reset.** Start/end ველები აკრეფილ ტექსტს მხოლოდ მაშინ კარგავს, როცა იცვლება კლიპის საზღვრები (\`clip.start\`, \`clip.duration\`) ან კლიპზე მოხვედრილი range-ის საზღვრები (clamped \`start\`/\`end\`, ან range-ის კლიპზე გაჩენა/მოხსნა).
  - Range-ის ახალი object იგივე მნიშვნელობებით, ან სხვა ხაზის range, ველებს აღარ აბრუნებს.
  - დღეს UI-ში ასეთი გზა არ არსებობს: range-ის ყველა გამომძახებელი ან selection-ს ცვლის (კონტენტი \`key\`-ით ხელახლა mount-დება), ან range-ს \`null\`-ზე აყენებს, ან ჯგუფზე მუშაობს, სადაც ველები გამორთულია. ამიტომ ეს თავდაცვითი გასწორებაა. მისი მიღება component test-ითა და mutation-ით ხდება, browser-ის კრიტერიუმის გარეშე.
- **L11 — wheel.** Detail-ის კონტენტზე ერთი native \`wheel\` listener ემატება (\`passive: false\`). ის \`preventDefault()\`-ს მხოლოდ მაშინ იძახებს, როცა event-ის target ფოკუსირებული number input-ია.
  - რატომ: Chrome ფოკუსირებულ number input-ზე wheel-ით მნიშვნელობას ცვლის. React-ის \`onWheel\` passive-ია და default-ს ვერ აჩერებს. \`blur\` კი ფოკუსს მოულოდნელად წაართმევდა.
  - ფასი: ფოკუსირებული ველის თავზე wheel კონტენტს აღარ ასქროლებს. სხვა ადგილებში ქცევა არ იცვლება.
  - C ამოწმებს \`defaultPrevented\`-ს cancelable \`WheelEvent\`-ზე. რეალური wheel Tech Lead-ის R18-W-შია.
- **Design (b) — overlay.** Detail-ის range overlay-ის ფონი \`bg-foreground/60\`-დან \`bg-foreground/30\`-ზე გადადის.
  - Overlay-ში peak-ისა და ფონის კონტრასტი გარე კონტრასტის (1 − α)-ია, ანუ ≥ 50 % ⇔ α ≤ 0.5. α = 0.3 კონტრასტის 70 %-ს ტოვებს.
  - \`border-x-2 border-foreground\` საზღვრად რჩება.
  - Lane-ის clip overlay-ში (\`ArrangementClip.tsx\` l.589, გაყინულია) \`/60\` რჩება. ეს სხვაობა ჩაწერილია და გასწორდება, როცა \`ArrangementClip.tsx\` შემდეგ გაიხსნება (SRW-14 ან SRW-18), ან უფრო ადრე C-ის/დიზაინის ბაგით.
  - R9-D3 უცვლელია: playhead-ის ელემენტი და writer, SVG და waveform-ის box-ის კლასები.
- **L6.** \`biome-ignore\`-ის მიზეზი ტექნიკურ მიზეზს ასახელებს და არა პროცესს („B round-8 §3.1“). Rule-ის სახელი უცვლელია.
- **Design (d) — ქართული label-ები, პროტოტიპის მიხედვით** (\`output/studio-workspace-prototype/index.html\` l.24: \`დასაწყისი\`, \`სიგრძე\`):
  - info-ს სვეტში \`start\` → \`დასაწყისი\` (კლიპიც და ჯგუფიც), \`offset\` → \`წყაროდან\`;
  - ველების label-ებში \`start, წმ\` → \`საიდან, წმ\`, \`end, წმ\` → \`სადამდე, წმ\`. ასე ერთ panel-ში სამი „დასაწყისი“ არ მეორდება; პროტოტიპი ველებს ასევე ცალკე სიტყვით (\`მონაკვეთი\`) ასხვავებს;
  - \`aria-label\`-ები, test id-ები და footer-ის ტექსტი სიტყვასიტყვით რჩება. Footer \`StudioWorkspace.tsx\`-შია (გაყინულია), და \`track-layout.test.tsx\` l.851 მის ლათინურ ტექსტს ამოწმებს;
  - **სიგანის ფასი:** \`დასაწყისი … · სიგრძე …\` ხაზი \`w-56\` სვეტში შეიძლება ორ ხაზზე გადავიდეს. A კოდამდე ზომავს page-state-ით. თუ ერთ ხაზზე არ ეტევა, ფიქსირებული რიგით ირჩევს \`w-60\`-ს, შემდეგ \`w-64\`-ს. თუ არც ესენი ეტევა, ან waveform-ის box 1280×720-ზე, ბიბლიოთეკით 480, 128 px-ზე ვიწრო ხდება, A აჩერებს და B-ს ატყობინებს.
- **Round 18-ში არ შედის:** A-ს round-11 follow-up „Home separator-ებზე seek-ს აკეთებს“. ის, დანარჩენ round-11 follow-up-ებთან ერთად, milestone-ის რეგრესიის შემდგომ fix-ის რაუნდში გადადის. 14b უკვე ხუთ პუნქტს შეიცავს: სამი ქცევისაა, ორი მხოლოდ ტექსტის.

მიზეზი: ხუთივე პუნქტი ერთ ფაილშია და round 8-დან ჩაწერილი follow-up-ია. ქცევის სამი პუნქტიდან თითოეულს C დამოუკიდებლად და დაკვირვებადი კრიტერიუმით ამოწმებს. ტექსტის ორი პუნქტი ქცევას არ ცვლის. M1/L8 D-29h-ის მიხედვით რჩება.

`;
rep('**ვიდეოს import (SRW-02, FB-15).**', d29i + '**ვიდეოს import (SRW-02, FB-15).**');

rep(
  'Round 17: C-R16-01 + M-R10-1/M2 (D-29h). Round 18: polish 14b. M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ.',
  'Round 17: C-R16-01 + M-R10-1/M2 (D-29h, C PASS, დაიხურა). Round 18: polish 14b (D-29i). M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ.',
);

rep(
  '| 18 | Panel-ის polish 14b | detail panel — L4, L11, design (b), L6-ის ტექსტი, design (d) label-ები (D-29h). M1/L8 — Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. შემდეგ milestone-ის სრული რეგრესია |',
  '| 18 | Panel-ის polish 14b | detail panel — L4, L11, design (b), L6-ის ტექსტი, design (d) label-ები (D-29h, D-29i). M1/L8 — Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. შემდეგ milestone-ის სრული რეგრესია |',
);

rep('Round 15-ისა და Round 16-ის შემდეგ advisor ხელმისაწვდომი იყო', 'Round 15-ის, Round 16-ისა და Round 17-ის შემდეგ advisor ხელმისაწვდომი იყო');

rep(
  '- **Round 17: გაგზავნილია.** C-R16-01 + M-R10-1/M2 (D-29h), მხოლოდ `ArrangementLibraryPreview.tsx`. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 17: C PASS** (\`tmp/studio-real-loop/c-round-17.md\`). R17-P1, R17-P2, R17-P3, R17-M, R17-U, R17-Doc, მეზობელი რეგრესიები და G17-1..3 PASS-ია. vitest 983/983. ახალი ბაგი არ არის.
  - **დაიხურა:** C-R16-01 და round-9 reviewer M-R10-1/M2.
  - ფორმულირების ორი შენიშვნა (R17-P1.1, R17-P2.3) B-ის შეცდომად ჩაიწერა (D-29i).
- **Round 18: გაგზავნილია.** Polish 14b (D-29i), მხოლოდ \`ArrangementDetailPanel.tsx\`. პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);

rep(
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R16-01 + M-R10-1/M2 (Round 17), polish 14b (Round 18), M1/L8 (Tech Lead-ის run-ის შემდეგ ან SRW-13-თან). ეტაპები 2 და 3 C-მ Round 11-ში, 13–16-ში დაადასტურა; polish 14a Round 16-ში C PASS-ია;',
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), polish 14b (Round 18), M1/L8 (Tech Lead-ის run-ის შემდეგ ან SRW-13-თან), A-ს round-11 დარჩენილი follow-up-ები (milestone-ის fix-ის რაუნდი). ეტაპები 2 და 3 C-მ Round 11-ში და 13–17-ში დაადასტურა. Polish 14a (Round 16) და C-R16-01 + M-R10-1/M2 (Round 17) C PASS-ია;',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
